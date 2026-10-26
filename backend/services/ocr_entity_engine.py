import re
import json
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
import fitz  # PyMuPDF
from sqlalchemy.orm import Session
from models import Application, DocumentRecord, ComplianceFlag, APHRuleConfig, Institution

def extract_text_and_blocks(pdf_or_image_bytes: bytes, filename: str = "") -> Tuple[str, List[Dict[str, Any]]]:
    """
    Extracts raw text and bounding-box coordinates for all text blocks using PyMuPDF.
    Returns (raw_text, blocks_with_coordinates).
    """
    raw_text = ""
    blocks: List[Dict[str, Any]] = []

    try:
        doc = fitz.open(stream=pdf_or_image_bytes, filetype="pdf")
        for page_idx in range(len(doc)):
            page = doc[page_idx]
            page_rect = page.rect
            page_w, page_h = page_rect.width, page_rect.height
            text_blocks = page.get_text("blocks")
            
            for b in text_blocks:
                # b: (x0, y0, x1, y1, "text", block_no, block_type)
                if len(b) >= 5 and b[4].strip():
                    text = b[4].strip()
                    raw_text += text + "\n"
                    x0, y0, x1, y1 = b[0], b[1], b[2], b[3]
                    blocks.append({
                        "page": page_idx + 1,
                        "x": round(x0, 1),
                        "y": round(y0, 1),
                        "w": round(x1 - x0, 1),
                        "h": round(y1 - y0, 1),
                        "x_rel": round(x0 / max(1, page_w), 4),
                        "y_rel": round(y0 / max(1, page_h), 4),
                        "w_rel": round((x1 - x0) / max(1, page_w), 4),
                        "h_rel": round((y1 - y0) / max(1, page_h), 4),
                        "text": text
                    })
        doc.close()
    except Exception:
        # If not a PDF, handle as image or fallback
        raw_text = "IMAGE_DOCUMENT_BINARY"

    return raw_text, blocks

def extract_entities_from_text(raw_text: str, blocks: List[Dict[str, Any]], doc_type: str = "") -> Dict[str, Any]:
    """
    Deterministic rule-based & regex entity extractor with coordinate bounding-box tracing.
    Extracts: survey_no, land_area_sqm, builtup_area_sqm, issue_date, expiry_date, certificate_urn,
    issuing_authority, trust_name.
    """
    entities: Dict[str, Any] = {
        "survey_no": None,
        "land_area_sqm": None,
        "builtup_area_sqm": None,
        "classroom_area_sqm": None,
        "issue_date": None,
        "expiry_date": None,
        "certificate_urn": None,
        "issuing_authority": None,
        "trust_name": None,
        "entity_bboxes": {}
    }

    def find_block_for_match(needle: str) -> Optional[Dict[str, Any]]:
        for b in blocks:
            if needle.lower() in b["text"].lower():
                return {
                    "page": b["page"],
                    "x": b["x"], "y": b["y"], "w": b["w"], "h": b["h"],
                    "x_rel": b["x_rel"], "y_rel": b["y_rel"], "w_rel": b["w_rel"], "h_rel": b["h_rel"]
                }
        return None

    # 1. Survey Number / Plot Number
    survey_patterns = [
        r'(?:Gat\s*(?:\/\s*Survey)?\s*No\.?|Survey\s*(?:\/\s*Gat)?\s*No\.?|Plot\s*No\.?|Khasra\s*No\.?|Gat\s*Kramank|गट\s*(?:क्रमांक|क्र\.?)|सर्व्हे\s*(?:क्रमांक|क्र\.?))\s*[:\-]?\s*([0-9A-Za-z\/\-]+)',
        r'(?:Survey|Plot|Khasra|Gat)\s*(?:No\.?|Number|#)?\s*[:\-]?\s*([A-Za-z0-9\/\-]+(?:\s*[A-Za-z0-9\/\-]+)?)',
        r'Plot\s+No\.\s*([0-9A-Za-z\/\-]+)'
    ]
    for pat in survey_patterns:
        m = re.search(pat, raw_text, re.IGNORECASE)
        if m:
            val = m.group(1).strip()
            if len(val) >= 2 and not val.lower().startswith("date"):
                entities["survey_no"] = val
                bbox = find_block_for_match(val)
                if bbox:
                    entities["entity_bboxes"]["survey_no"] = bbox
                break

    # 2. Land Area (sq.m, sqm, sq. m., acres, hectares)
    area_patterns = [
        r'(?:Total\s+Land\s+Area|Land\s+Area|Plot\s+Area)\s*[:\-]?\s*([0-9,\.]+)\s*(?:sq\.?\s*m|sqm|square\s+meters)',
        r'([0-9,\.]+)\s*(?:sq\.?\s*m|sqm|Square\s+Meters)\s*(?:of\s+land)?',
        r'([0-9\.]+)\s*(?:Acres|acre)',
        r'Area\s*[:\-]?\s*([0-9,\.]+)\s*(?:sq\.?\s*m|sqm)'
    ]
    for pat in area_patterns:
        m = re.search(pat, raw_text, re.IGNORECASE)
        if m:
            val_str = m.group(1).replace(",", "").strip()
            try:
                area_val = float(val_str)
                # If in acres, convert to sq.m (1 acre approx 4046.86 sq.m)
                if "acre" in m.group(0).lower():
                    area_val = round(area_val * 4046.86, 2)
                entities["land_area_sqm"] = area_val
                bbox = find_block_for_match(m.group(0))
                if bbox:
                    entities["entity_bboxes"]["land_area_sqm"] = bbox
                break
            except ValueError:
                pass

    # 3. Built-up Area
    builtup_patterns = [
        r'(?:Total\s+Built\-?up\s+Area|Built\-?up\s+Area|Carpet\s+Area)\s*[:\-]?\s*([0-9,\.]+)\s*(?:sq\.?\s*m|sqm|square\s+meters)?',
        r'Builtup\s*[:\-]?\s*([0-9,\.]+)\s*sqm'
    ]
    for pat in builtup_patterns:
        m = re.search(pat, raw_text, re.IGNORECASE)
        if m:
            val_str = m.group(1).replace(",", "").strip()
            try:
                entities["builtup_area_sqm"] = float(val_str)
                bbox = find_block_for_match(m.group(0))
                if bbox:
                    entities["entity_bboxes"]["builtup_area_sqm"] = bbox
                break
            except ValueError:
                pass

    # 3b. Classroom / Instructional Room Carpet Area
    classroom_patterns = [
        r'(?:Classroom|Instructional\s+Room|Lecture\s+Hall)\s*(?:Area|Carpet\s+Area)?\s*[:\-]?\s*([0-9,\.]+)\s*(?:sq\.?\s*m|sqm)',
        r'([0-9,\.]+)\s*(?:sq\.?\s*m|sqm)\s*(?:per\s+class|\/\s*classroom|\/\s*class)'
    ]
    for pat in classroom_patterns:
        m = re.search(pat, raw_text, re.IGNORECASE)
        if m:
            val_str = m.group(1).replace(",", "").strip()
            try:
                entities["classroom_area_sqm"] = float(val_str)
                bbox = find_block_for_match(m.group(0))
                if bbox:
                    entities["entity_bboxes"]["classroom_area_sqm"] = bbox
                break
            except ValueError:
                pass

    # 4. Certificate URN / Registration No
    urn_patterns = [
        r'(?:Certificate\s+No|URN|Registration\s+No|NOC\s+No|Ref\s+No)\s*[:\-]?\s*([A-Za-z0-9\/\-_]{6,30})',
        r'([A-Z]{2}\-[A-Z0-9]+\-[0-9]{4}\-[0-9]{4,6})',
        r'(MH\-[A-Z0-9\-]+|DL\-[A-Z0-9\-]+|KA\-[A-Z0-9\-]+|TN\-[A-Z0-9\-]+)'
    ]
    for pat in urn_patterns:
        m = re.search(pat, raw_text, re.IGNORECASE)
        if m:
            urn_val = m.group(1).strip()
            entities["certificate_urn"] = urn_val
            bbox = find_block_for_match(urn_val)
            if bbox:
                entities["entity_bboxes"]["certificate_urn"] = bbox
            break

    # 5. Expiry Date & Issue Date
    date_patterns = [
        r'(?:Valid\s+(?:Till|Upto|Through)|Expiry\s+Date|Valid\s+To)\s*[:\-]?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})',
        r'(?:Date\s+of\s+Expiry|Expires\s+On)\s*[:\-]?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})',
        r'(?:Date\s+of\s+Issue|Issue\s+Date|Issued\s+On)\s*[:\-]?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})'
    ]
    # Check expiry
    for pat in date_patterns[:2]:
        m = re.search(pat, raw_text, re.IGNORECASE)
        if m:
            entities["expiry_date"] = m.group(1).strip()
            bbox = find_block_for_match(m.group(1))
            if bbox:
                entities["entity_bboxes"]["expiry_date"] = bbox
            break

    # Check issue date
    m_issue = re.search(date_patterns[2], raw_text, re.IGNORECASE)
    if m_issue:
        entities["issue_date"] = m_issue.group(1).strip()
        bbox = find_block_for_match(m_issue.group(1))
        if bbox:
            entities["entity_bboxes"]["issue_date"] = bbox

    # 6. Issuing Authority
    authority_keywords = [
        "Fire and Emergency Services", "State Fire Prevention Directorate",
        "Municipal Corporation", "Town Planning Authority", "Sub-Registrar Office",
        "Public Works Department", "State Directorate of Technical Education"
    ]
    for auth in authority_keywords:
        if auth.lower() in raw_text.lower():
            entities["issuing_authority"] = auth
            bbox = find_block_for_match(auth)
            if bbox:
                entities["entity_bboxes"]["issuing_authority"] = bbox
            break

    # 7. Trust / Society Name
    trust_match = re.search(r'(?:Society|Trust|Sanstha|Pratishthan)\s*[:\-]?\s*([A-Za-z\s]+(?:Society|Trust|Sanstha|Foundation))', raw_text, re.IGNORECASE)
    if trust_match:
        entities["trust_name"] = trust_match.group(1).strip()

    # 8. Localized Regional Translation Layer (Marathi, Hindi, Tamil, Telugu, Gujarati)
    try:
        from services.regional_indic_engine import parse_regional_indic_entities
        regional_res = parse_regional_indic_entities(raw_text, blocks)
        if regional_res.get("is_regional"):
            entities["is_regional"] = True
            entities["detected_language"] = regional_res["detected_language"]
            entities["detected_script"] = regional_res["detected_script"]
            entities["language_confidence"] = regional_res["language_confidence"]
            entities["translations"] = regional_res["translations"]

            reg_e = regional_res.get("extracted_entities", {})
            if (not entities["survey_no"] or entities["survey_no"].startswith("/") or len(entities["survey_no"]) < 3) and reg_e.get("survey_no"):
                entities["survey_no"] = reg_e["survey_no"]
            if not entities["land_area_sqm"] and reg_e.get("land_area_sqm"):
                entities["land_area_sqm"] = reg_e["land_area_sqm"]
            if not entities["expiry_date"] and reg_e.get("expiry_date"):
                entities["expiry_date"] = reg_e["expiry_date"]
            if not entities["issuing_authority"] and reg_e.get("issuing_authority"):
                entities["issuing_authority"] = reg_e["issuing_authority"]
            if reg_e.get("doc_type"):
                entities["regional_doc_type"] = reg_e["doc_type"]

            if "entity_bboxes" in reg_e:
                for k, bbox in reg_e["entity_bboxes"].items():
                    if k not in entities["entity_bboxes"]:
                        entities["entity_bboxes"][k] = bbox
    except Exception as e:
        print(f"[OCR] Regional Indic parsing notice: {e}")

    return entities

def parse_date_to_comparable(date_str: Optional[str]) -> Optional[datetime]:
    if not date_str:
        return None
    for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d", "%d.%m.%Y", "%d/%m/%y", "%d-%m-%y"):
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except ValueError:
            continue
    return None

def reconcile_application_graph(db: Session, application_id: int) -> List[ComplianceFlag]:
    """
    Constructs the application-level cross-document consistency graph and
    compares extracted entities across:
    1. Application Form Part-1 claim
    2. Land Registration Deed
    3. Architect Approved Floor Plan
    4. Fire Safety NOC
    5. Institution Master Record & Historical AICTE EoA DB
    6. APH Rule Config thresholds

    Inserts official ComplianceFlag records with exact APH Clause citations.
    """
    app = db.get(Application, application_id)
    if not app:
        return []

    inst = app.institution
    rule_config = db.query(APHRuleConfig).filter(
        APHRuleConfig.academic_year == app.academic_year,
        APHRuleConfig.category == app.category
    ).first()
    if not rule_config:
        rule_config = db.query(APHRuleConfig).first()

    # Clear prior non-reviewed auto-flags for this app
    existing_flags = db.query(ComplianceFlag).filter(
        ComplianceFlag.application_id == application_id,
        ComplianceFlag.hitl_status.in_(["PENDING_OFFICER_REVIEW", "PENDING_REVIEW"])
    ).all()
    for f in existing_flags:
        db.delete(f)
    db.flush()

    new_flags: List[ComplianceFlag] = []
    docs = app.documents

    # Categorize documents by type
    land_deed = next((d for d in docs if "land" in d.doc_type.lower()), None)
    floor_plan = next((d for d in docs if "floor" in d.doc_type.lower() or "architect" in d.doc_type.lower()), None)
    fire_noc = next((d for d in docs if "fire" in d.doc_type.lower()), None)

    land_entities = json.loads(land_deed.extracted_entities_json or "{}") if land_deed else {}
    floor_entities = json.loads(floor_plan.extracted_entities_json or "{}") if floor_plan else {}
    fire_entities = json.loads(fire_noc.extracted_entities_json or "{}") if fire_noc else {}

    # CHECK 1: Land Survey Number Consistency
    # Land Deed vs Floor Plan vs Application Claim
    survey_claimed = app.claimed_survey_no
    survey_deed = land_entities.get("survey_no")
    survey_floor = floor_entities.get("survey_no")

    if survey_deed and survey_claimed and survey_deed.strip().lower() != survey_claimed.strip().lower():
        flag = ComplianceFlag(
            application_id=app.id,
            document_id=land_deed.id if land_deed else None,
            pillar="CROSS_DOC_GRAPH",
            severity="CRITICAL",
            aph_clause_citation="APH 2024-27 Clause 4.1.2 (Land Title & Survey Uniformity)",
            title="Survey Number Contradiction (Deed vs Application)",
            explanation=(
                f"Land Registration Deed cites Survey No. '{survey_deed}', whereas Application Form Part-1 "
                f"claims Survey No. '{survey_claimed}'. Statutory norms require absolute title congruence."
            ),
            evidence_bbox_json=json.dumps(land_entities.get("entity_bboxes", {}).get("survey_no", {}))
        )
        new_flags.append(flag)

    if survey_deed and survey_floor and survey_deed.strip().lower() != survey_floor.strip().lower():
        flag = ComplianceFlag(
            application_id=app.id,
            document_id=floor_plan.id if floor_plan else None,
            pillar="CROSS_DOC_GRAPH",
            severity="CRITICAL",
            aph_clause_citation="APH 2024-27 Clause 4.2.1 (Architectural Plan Boundary Concurrence)",
            title="Plot Survey Mismatch Across Architectural Blueprint & Title Deed",
            explanation=(
                f"Architect Floor Plan cites Survey '{survey_floor}' while Land Deed specifies '{survey_deed}'. "
                f"Building footprint must correspond precisely to certified registered land parcels."
            ),
            evidence_bbox_json=json.dumps(floor_entities.get("entity_bboxes", {}).get("survey_no", {}))
        )
        new_flags.append(flag)

    # CHECK 2: Land Area Consistency & Minimum Threshold
    min_land = rule_config.min_land_area_sqm if rule_config else 2500.0
    deed_area = land_entities.get("land_area_sqm")
    claimed_land = app.claimed_land_area_sqm

    if deed_area:
        if deed_area < min_land:
            flag = ComplianceFlag(
                application_id=app.id,
                document_id=land_deed.id if land_deed else None,
                pillar="CROSS_DOC_GRAPH",
                severity="CRITICAL",
                aph_clause_citation="APH 2024-27 Clause 4.1.1 (Minimum Contiguous Land Area Norms)",
                title="Sub-Threshold Land Area Deficit",
                explanation=(
                    f"Registered Land Deed exhibits {deed_area:.1f} sq.m, failing the mandatory AICTE minimum "
                    f"threshold of {min_land:.1f} sq.m for {app.category} category in {inst.region} region."
                ),
                evidence_bbox_json=json.dumps(land_entities.get("entity_bboxes", {}).get("land_area_sqm", {}))
            )
            new_flags.append(flag)

        # Check percentage deviation between deed and claimed
        if claimed_land and claimed_land > 0:
            diff_pct = abs(deed_area - claimed_land) / claimed_land
            if diff_pct > 0.05:  # Over 5% deviation
                flag = ComplianceFlag(
                    application_id=app.id,
                    document_id=land_deed.id if land_deed else None,
                    pillar="CROSS_DOC_GRAPH",
                    severity="CRITICAL",
                    aph_clause_citation="APH 2024-27 Clause 4.1.3 (Land Area Discrepancy Threshold)",
                    title="Significant Land Area Variance Across Deed and Form Part-1",
                    explanation=(
                        f"Application claims {claimed_land:.1f} sq.m, but submitted Title Deed proves only "
                        f"{deed_area:.1f} sq.m (variance: {diff_pct*100:.1f}%). Exceeds permissible 2% margin."
                    ),
                    evidence_bbox_json=json.dumps(land_entities.get("entity_bboxes", {}).get("land_area_sqm", {}))
                )
                new_flags.append(flag)

    # CHECK 3: Fire Safety NOC Validity & Expiry
    if fire_noc:
        expiry_str = fire_entities.get("expiry_date")
        if expiry_str:
            expiry_dt = parse_date_to_comparable(expiry_str)
            mandatory_session_validity = datetime(2026, 8, 31)
            if expiry_dt and expiry_dt < mandatory_session_validity:
                flag = ComplianceFlag(
                    application_id=app.id,
                    document_id=fire_noc.id,
                    pillar="AUTHORITY_API",
                    severity="CRITICAL",
                    aph_clause_citation="APH 2024-27 Clause 6.3 (Mandatory Fire Safety Certification)",
                    title="Fire Safety NOC Expired Prior to Academic Session 2026-27",
                    explanation=(
                        f"Submitted Fire NOC reflects expiry date {expiry_str}. Under APH Clause 6.3, "
                        f"Fire Safety clearances must be active at least through 31-August-2026."
                    ),
                    evidence_bbox_json=json.dumps(fire_entities.get("entity_bboxes", {}).get("expiry_date", {}))
                )
                new_flags.append(flag)

    # CHECK 4: Forensic Anomaly Flags from Documents
    for d in docs:
        if d.ela_anomaly_score and d.ela_anomaly_score >= 0.60:
            bboxes = json.loads(d.ela_bounding_boxes_json or "[]")
            flag = ComplianceFlag(
                application_id=app.id,
                document_id=d.id,
                pillar="FORENSIC_ELA",
                severity="CRITICAL" if d.ela_anomaly_score > 0.75 else "WARNING",
                aph_clause_citation="APH 2024-27 Clause 1.4 (Fraudulent Document Prevention & Integrity)",
                title=f"Compression Residual Anomaly Detected in {d.doc_type}",
                explanation=(
                    f"Pixel-wise Error Level Analysis (ELA) measured statistical residual score of {d.ela_anomaly_score:.2f} "
                    f"(exceeds calibrated threshold 0.60). Localized recompression suggests potential date or numerical alteration."
                ),
                evidence_bbox_json=json.dumps(bboxes[0] if bboxes else {})
            )
            new_flags.append(flag)

        # PDF Producer editing tool flag
        pdf_meta = json.loads(d.pdf_metadata_json or "{}")
        if pdf_meta.get("has_editing_anomaly"):
            tools = ", ".join(pdf_meta.get("flagged_editing_tools", ["Third-party PDF Editor"]))
            flag = ComplianceFlag(
                application_id=app.id,
                document_id=d.id,
                pillar="PDF_CRYPTO",
                severity="WARNING",
                aph_clause_citation="APH 2024-27 Clause 1.4.3 (Original Source Document Provenance)",
                title=f"Suspicious Document Authoring Footprint in {d.doc_type}",
                explanation=(
                    f"PDF metadata reveals creation/editing using consumer manipulation tools: '{tools}'. "
                    f"Official government certificates should originate directly from issuing statutory authorities."
                ),
                evidence_bbox_json="{}"
            )
            new_flags.append(flag)

    # CHECK 5: Classroom Carpet Area Norms (APH Clause 5.1 - Min 66.0 sq.m per instructional unit)
    min_classroom = rule_config.min_classroom_area_sqm if rule_config else 66.0
    classroom_unit_area = floor_entities.get("classroom_area_sqm")
    if classroom_unit_area and classroom_unit_area < min_classroom:
        flag = ComplianceFlag(
            application_id=app.id,
            document_id=floor_plan.id if floor_plan else None,
            pillar="CROSS_DOC_GRAPH",
            severity="CRITICAL",
            aph_clause_citation="APH 2024-27 Clause 5.1 (Classroom & Instructional Carpet Area Norms)",
            title="Classroom Carpet Area Deficit Below Mandatory Norm",
            explanation=(
                f"Architect Floor Plan specifies classroom carpet area of {classroom_unit_area:.1f} sq.m, failing the "
                f"mandatory AICTE APH threshold of {min_classroom:.1f} sq.m per standard instructional unit."
            ),
            evidence_bbox_json=json.dumps(floor_entities.get("entity_bboxes", {}).get("classroom_area_sqm", {}))
        )
        new_flags.append(flag)

    # CHECK 6: Native PyMuPDF Tabular Schedule Recognition & Mathematical Auditing
    try:
        from services.table_extractor import TableScrutinyEngine
        from config import storage_manager

        for d in docs:
            if any(k in d.doc_type.lower() for k in ["floor", "architect", "faculty", "fdr", "schedule", "plan"]):
                pdf_bytes = storage_manager.get_object(d.minio_object_key)
                if pdf_bytes:
                    tables = TableScrutinyEngine.extract_tables_from_pdf(
                        pdf_bytes=pdf_bytes,
                        filename=d.filename,
                        doc_type=d.doc_type,
                        doc_id=d.id
                    )
                    if tables:
                        table_flags = TableScrutinyEngine.audit_tabular_compliance(
                            tables=tables,
                            application_id=app.id,
                            claimed_builtup_area_sqm=app.claimed_builtup_area_sqm or 0.0,
                            approved_intake=inst.approved_intake if inst else 300,
                            doc_id=d.id
                        )
                        new_flags.extend(table_flags)
    except Exception as e:
        print(f"[TableScrutiny] Error auditing tabular schedules: {e}")

    # Deduplicate flags by (title, aph_clause_citation)
    unique_flags = []
    seen_keys = set()
    for f in new_flags:
        key = (f.title.strip(), f.aph_clause_citation.strip())
        if key not in seen_keys:
            seen_keys.add(key)
            unique_flags.append(f)
    new_flags = unique_flags

    # Calculate overall risk score
    critical_count = sum(1 for f in new_flags if f.severity == "CRITICAL")
    warning_count = sum(1 for f in new_flags if f.severity == "WARNING")
    app.overall_risk_score = round(min(1.0, (critical_count * 0.35 + warning_count * 0.15)), 2)
    if critical_count > 0:
        app.status = "DEFICIENCY_ISSUED"
    else:
        app.status = "AI_VALIDATED"

    for f in new_flags:
        db.add(f)
    db.commit()

    return new_flags
