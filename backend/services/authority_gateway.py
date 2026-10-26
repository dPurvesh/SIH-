import io
import json
import hashlib
from datetime import datetime
from typing import Dict, Any, Optional, Tuple
import cv2
import numpy as np
import fitz  # PyMuPDF
from PIL import Image

# Authoritative Government Registry Seed Database
# Emulates official API Setu / DigiLocker / State Fire & Municipal Portals
DEFAULT_AUTHORITATIVE_REGISTRY: Dict[str, Dict[str, Any]] = {
    # Scenario A: Clean Compliant EoA - Pune Municipal & Fire Directorate
    "MH-FIRE-2024-1049": {
        "status": "VERIFIED",
        "urn": "MH-FIRE-2024-1049",
        "authority": "Maharashtra State Fire Services Directorate",
        "institution_name": "Vishwakarma Institute of Technology, Pune",
        "issue_date": "15-05-2024",
        "expiry_date": "31-05-2027",
        "approved_floors": "G+5",
        "builtup_area_sqm": 18500.0,
        "is_active": True,
        "digital_seal_verified": True
    },
    "MH-REV-PUN-4281": {
        "status": "VERIFIED",
        "urn": "MH-REV-PUN-4281",
        "authority": "Department of Registration & Stamps, Govt. of Maharashtra",
        "institution_name": "Bansilal Ramnath Agarwal Charitable Trust",
        "survey_no": "Survey No. 42/B, Bibwewadi",
        "land_area_sqm": 25000.0,
        "deed_type": "Sale Deed (Perpetual Freehold)",
        "registration_date": "12-04-1983",
        "is_active": True
    },
    
    # Scenario B: Tampered Expiry Date - Apex Institute Fire NOC
    # In official registry, expired on 31-03-2024! But Apex PDF altered it to 2027.
    "MH-FIRE-2023-9921": {
        "status": "EXPIRED",
        "urn": "MH-FIRE-2023-9921",
        "authority": "Maharashtra State Fire Services Directorate",
        "institution_name": "Apex Institute of Technology, Mumbai",
        "issue_date": "01-04-2023",
        "expiry_date": "31-03-2024",  # Expired in official records!
        "approved_floors": "G+3",
        "builtup_area_sqm": 8200.0,
        "is_active": False,
        "revocation_reason": "Failure to renew annual hydrant pressure test certificate"
    },

    # Scenario C: Cross-Document Area Contradiction - St. Xavier
    "MH-REV-MUM-7712": {
        "status": "MISMATCH_DETECTED",
        "urn": "MH-REV-MUM-7712",
        "authority": "Sub-Registrar Office Haveli / Mumbai Suburban",
        "institution_name": "St. Xavier Institute of Science & Technology",
        "survey_no": "Plot 108/A",
        "land_area_sqm": 2800.0,  # Official deed is 2,800 sqm; application claimed 4,500 sqm!
        "deed_type": "Lease Deed (30 Years)",
        "registration_date": "10-01-2015",
        "is_active": True
    },

    # Central Bank FDR & TER Payment Gateway
    "FDR-SBI-2024-9981": {
        "status": "VERIFIED",
        "urn": "FDR-SBI-2024-9981",
        "authority": "State Bank of India (CBS Core Banking)",
        "account_holder": "AICTE Joint Account",
        "deposit_amount_inr": 3500000.0,
        "maturity_date": "31-03-2034",
        "encumbrance_status": "LOCKED_IN_FAVOR_OF_AICTE",
        "is_active": True
    }
}

# Live Active In-Memory Registry (Clean slate by default for custom institution evaluation)
AUTHORITATIVE_REGISTRY: Dict[str, Dict[str, Any]] = {}

def clear_authoritative_registry():
    """Wipes all entries in the authoritative gateway registry."""
    AUTHORITATIVE_REGISTRY.clear()

def reseed_authoritative_registry():
    """Restores sample demonstration authority entries."""
    AUTHORITATIVE_REGISTRY.clear()
    AUTHORITATIVE_REGISTRY.update(DEFAULT_AUTHORITATIVE_REGISTRY)

def decode_qr_code(doc_bytes: bytes, filename: str = "") -> Optional[str]:
    """
    Decodes high-density QR code or 2D barcode payload from image or PDF page
    using cv2.QRCodeDetector with pyzbar fallback.
    """
    img_cv = None
    try:
        if filename.lower().endswith(".pdf") or doc_bytes[:4] == b"%PDF":
            doc = fitz.open(stream=doc_bytes, filetype="pdf")
            if len(doc) > 0:
                page = doc[0]
                pix = page.get_pixmap(matrix=fitz.Matrix(2.0, 2.0))
                img_pil = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
                img_cv = cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)
            doc.close()
        else:
            img_pil = Image.open(io.BytesIO(doc_bytes)).convert("RGB")
            img_cv = cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)
    except Exception:
        return None

    if img_cv is None:
        return None

    # Try cv2.QRCodeDetector first
    try:
        detector = cv2.QRCodeDetector()
        data, points, _ = detector.detectAndDecode(img_cv)
        if data and data.strip():
            return data.strip()
    except Exception:
        pass

    # Try pyzbar if installed
    try:
        from pyzbar.pyzbar import decode as pyzbar_decode
        decoded = pyzbar_decode(img_cv)
        if decoded:
            return decoded[0].data.decode("utf-8", errors="ignore").strip()
    except Exception:
        pass

    return None

def verify_against_authoritative_gateway(
    urn: str,
    submitted_entities: Optional[Dict[str, Any]] = None,
    doc_type: str = ""
) -> Dict[str, Any]:
    """
    Queries the official issuing-authority registry microservice, compares submitted
    OCR entities against official statutory records, and stamps one of the 6 AICTE statuses:
    - VERIFIED
    - MISMATCH_DETECTED
    - EXPIRED
    - VERIFICATION_PENDING
    - SOURCE_UNAVAILABLE
    - MANUAL_REVIEW_REQUIRED
    """
    submitted_entities = submitted_entities or {}
    clean_urn = urn.strip().upper() if urn else ""

    # Check if URN exists in authoritative registry
    record = None
    for reg_urn, reg_data in AUTHORITATIVE_REGISTRY.items():
        if reg_urn.upper() in clean_urn or clean_urn in reg_urn.upper():
            record = reg_data
            break

    timestamp = datetime.utcnow()

    if not record:
        # Check if generic format or unavailable
        if not clean_urn or clean_urn in ("NONE", "UNRESOLVED", "NULL"):
            status = "MANUAL_REVIEW_REQUIRED"
            reason = "Certificate Unique Reference Number (URN) not detected or illegible."
        elif clean_urn.startswith("TEST") or clean_urn.startswith("MOCK"):
            status = "SOURCE_UNAVAILABLE"
            reason = "State Issuing Gateway endpoint timed out or offline."
        else:
            status = "MANUAL_REVIEW_REQUIRED"
            reason = f"URN '{clean_urn}' not found in connected State/Central statutory databases."

        response_payload = {
            "query_urn": clean_urn,
            "status": status,
            "reason": reason,
            "source": "State Central Unified Gateway",
            "verified_at": timestamp.isoformat()
        }
        return {
            "status": status,
            "source_name": "State Central Unified Gateway",
            "urn": clean_urn,
            "response_payload": response_payload,
            "response_hash": hashlib.sha256(json.dumps(response_payload, sort_keys=True).encode()).hexdigest(),
            "timestamp": timestamp
        }

    # Evaluate against official registry data
    official_status = record.get("status", "VERIFIED")
    official_expiry = record.get("expiry_date")
    official_area = record.get("land_area_sqm")
    
    status = official_status
    mismatch_details = []

    # Check expiration date mismatch
    submitted_expiry = submitted_entities.get("expiry_date")
    if submitted_expiry and official_expiry:
        if submitted_expiry != official_expiry:
            status = "MISMATCH_DETECTED"
            mismatch_details.append(
                f"Expiry date mismatch: submitted document claims '{submitted_expiry}', "
                f"but official registry confirms '{official_expiry}'."
            )

    # Check land area mismatch
    submitted_land = submitted_entities.get("land_area_sqm")
    if submitted_land and official_area:
        diff_pct = abs(submitted_land - official_area) / official_area
        if diff_pct > 0.02:
            status = "MISMATCH_DETECTED"
            mismatch_details.append(
                f"Land area discrepancy: submitted '{submitted_land:.1f} sq.m' vs official statutory deed "
                f"'{official_area:.1f} sq.m' ({diff_pct*100:.1f}% deviation)."
            )

    # If registry explicitly says EXPIRED
    if official_status == "EXPIRED":
        status = "EXPIRED"

    response_payload = {
        "query_urn": record["urn"],
        "official_authority": record.get("authority"),
        "institution_name": record.get("institution_name"),
        "official_record": record,
        "mismatches": mismatch_details,
        "verified_at": timestamp.isoformat()
    }

    return {
        "status": status,
        "source_name": record.get("authority", "State Gateway"),
        "urn": record["urn"],
        "response_payload": response_payload,
        "response_hash": hashlib.sha256(json.dumps(response_payload, sort_keys=True).encode()).hexdigest(),
        "timestamp": timestamp
    }
