import io
import json
import uuid
import hashlib
from datetime import datetime
from typing import Dict, Any, Optional
from PIL import Image, ImageDraw
from sqlalchemy.orm import Session

from config import storage_manager, settings
from models import (
    Base, User, Institution, APHRuleConfig, Application,
    DocumentRecord, InfrastructureEvidence, ComplianceFlag, AuditLedger
)
from services.forensics_engine import run_ela_analysis, inspect_pdf_structure, verify_pdf_dsc, compute_hashes
from services.ocr_entity_engine import extract_text_and_blocks, extract_entities_from_text, reconcile_application_graph
from services.cv_infrastructure_engine import analyze_lab_photo, check_visual_duplicates, verify_exif_geofence, compute_visual_embedding
from services.authority_gateway import verify_against_authoritative_gateway, decode_qr_code
from services.pdf_generator import (
    create_official_pdf, generate_spliced_tampered_fire_noc,
    generate_synthetic_lab_image, generate_deficiency_notice_pdf
)

def add_ledger_record(
    db: Session,
    actor_role: str,
    action_type: str,
    application_id: Optional[int] = None,
    payload: Optional[Dict[str, Any]] = None,
    actor_user_id: Optional[int] = None,
    target_entity_id: Optional[str] = None
) -> AuditLedger:
    """Cryptographically chains each audit record: curr_hash = SHA256(prev_hash + ...)"""
    latest = db.query(AuditLedger).order_by(AuditLedger.id.desc()).first()
    prev_hash = latest.curr_hash if latest else "GENESIS_AICTE_REGULATION_BUREAU_2026_000000000000000000000000"
    
    timestamp = datetime.utcnow()
    payload_json = json.dumps(payload or {}, sort_keys=True)
    curr_hash = AuditLedger.compute_hash(
        prev_hash=prev_hash,
        timestamp_iso=timestamp.isoformat(),
        actor_role=actor_role,
        action_type=action_type,
        payload_json=payload_json
    )
    
    entry = AuditLedger(
        timestamp=timestamp,
        actor_user_id=actor_user_id,
        actor_role=actor_role,
        action_type=action_type,
        application_id=application_id,
        target_entity_id=target_entity_id,
        payload_json=payload_json,
        prev_hash=prev_hash,
        curr_hash=curr_hash
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

def seed_system_rules_and_users(db: Session):
    """Bootstraps system users, genesis audit ledger, and APH rule configurations."""
    # 1. Seed Users if not present
    if db.query(User).count() == 0:
        nodal_user = User(
            email="nodal@vit.edu",
            password_hash="sha256$vitnodal2026",
            full_name="Prof. D. K. Shinde (Nodal Officer)",
            role="INSTITUTION_NODAL_OFFICER",
            region="WRO"
        )
        scrutiny_user = User(
            email="scrutiny.wro@aicte-india.org",
            password_hash="sha256$aicteofficer2026",
            full_name="Dr. Arvind V. Kulkarni (Regional Scrutiny Officer)",
            role="AICTE_SCRUTINY_OFFICER",
            region="WRO"
        )
        admin_user = User(
            email="admin.bureau@aicte-india.org",
            password_hash="sha256$aicteadmin2026",
            full_name="Shri M. S. Rathore (Director, Regulation Bureau)",
            role="AICTE_ADMIN",
            region="WRO"
        )
        db.add_all([nodal_user, scrutiny_user, admin_user])
        db.commit()

        # Genesis Audit Record
        add_ledger_record(
            db=db,
            actor_role="AICTE_ADMIN",
            action_type="GENESIS_SYSTEM_BOOTSTRAP",
            payload={"system": "PRAMAAN-AICTE", "regulatory_framework": "APH 2024-27", "session": "2026-27"},
            actor_user_id=admin_user.id
        )

    # 2. Seed Configurable APH Rule Config if not present
    if db.query(APHRuleConfig).count() == 0:
        rule_config = APHRuleConfig(
            academic_year="2026-27",
            category="EoA",
            mandatory_doc_types=json.dumps([
                "Fire Safety NOC", "Architect Floor Plan", "Land Registration Deed",
                "Bank FDR / TER Receipt", "Computer Lab Photo"
            ]),
            min_land_area_sqm=2500.0,
            min_classroom_area_sqm=66.0,
            min_lab_area_sqm=66.0,
            student_pc_ratio=6,
            require_valid_dsc=True,
            updated_by="AICTE Regulation Bureau"
        )
        db.add(rule_config)
        db.commit()

def reset_all_colleges(db: Session):
    """Wipes all institutions, applications, documents, infrastructure evidence, and flags."""
    db.query(ComplianceFlag).delete()
    db.query(InfrastructureEvidence).delete()
    db.query(DocumentRecord).delete()
    db.query(Application).delete()
    db.query(Institution).delete()
    db.commit()
    
    add_ledger_record(
        db=db,
        actor_role="AICTE_ADMIN",
        action_type="SYSTEM_COLLEGES_RESET",
        payload={"message": "All college dossiers cleared. System is clean for custom institution registration."}
    )

def seed_demo_colleges(db: Session):
    """Generates real physical PDF & image evidence files and seeds the 3 sample scenarios."""
    if db.query(Application).count() > 0:
        return

    # Helper function to ingest and process a real document
    def ingest_document(app_id: int, doc_type: str, filename: str, content_bytes: bytes) -> DocumentRecord:
        key = f"apps/{app_id}/{filename}"
        storage_manager.put_object(key, content_bytes, "application/pdf")
        sha, phash = compute_hashes(content_bytes, filename)
        
        # Real engines execution
        ela_res = run_ela_analysis(content_bytes)
        pdf_meta = inspect_pdf_structure(content_bytes)
        dsc_res = verify_pdf_dsc(content_bytes)
        pdf_meta.update(dsc_res)
        
        raw_text, blocks = extract_text_and_blocks(content_bytes, filename)
        entities = extract_entities_from_text(raw_text, blocks, doc_type)
        
        # QR Code decoding
        qr_data = decode_qr_code(content_bytes, filename)
        if qr_data:
            entities["qr_payload"] = qr_data
            if not entities.get("certificate_urn") and "URN:" in qr_data:
                entities["certificate_urn"] = qr_data.split("URN:")[-1].split(";")[0].strip()

        # Authority Gateway query
        urn_to_check = entities.get("certificate_urn") or ""
        auth_res = verify_against_authoritative_gateway(urn_to_check, entities, doc_type)

        doc_rec = DocumentRecord(
            application_id=app_id,
            doc_type=doc_type,
            filename=filename,
            minio_object_key=key,
            file_size_bytes=len(content_bytes),
            mime_type="application/pdf",
            sha256_hash=sha,
            phash=phash,
            ocr_raw_text=raw_text[:5000],
            extracted_entities_json=json.dumps(entities),
            ela_anomaly_score=ela_res["anomaly_score"],
            ela_heatmap_object_key=ela_res["heatmap_key"],
            ela_bounding_boxes_json=json.dumps(ela_res["bounding_boxes"]),
            pdf_metadata_json=json.dumps(pdf_meta),
            authority_verification_status=auth_res["status"],
            authority_source_name=auth_res["source_name"],
            authority_response_json=json.dumps(auth_res["response_payload"]),
            authority_verified_at=auth_res["timestamp"]
        )
        db.add(doc_rec)
        db.commit()
        db.refresh(doc_rec)
        return doc_rec

    # Helper function to ingest and process a real infrastructure photo
    def ingest_infra(
        app_id: int, 
        room_type: str, 
        room_label: str, 
        filename: str, 
        img_bytes: bytes,
        required_pcs: int,
        inst_lat: float,
        inst_lng: float
    ) -> InfrastructureEvidence:
        key = f"apps/{app_id}/infra/{filename}"
        storage_manager.put_object(key, img_bytes, "image/jpeg")
        sha, phash = compute_hashes(img_bytes, filename)
        
        # Real engines
        cv_res = analyze_lab_photo(img_bytes, required_pcs)
        geo_res = verify_exif_geofence(img_bytes, inst_lat, inst_lng, radius_m=500.0)
        embedding = compute_visual_embedding(img_bytes)

        infra_rec = InfrastructureEvidence(
            application_id=app_id,
            room_type=room_type,
            room_label=room_label,
            minio_object_key=key,
            annotated_cv_object_key=cv_res["annotated_key"],
            sha256_hash=sha,
            phash=phash,
            clip_embedding_json=json.dumps(embedding),
            yolo_detected_counts_json=json.dumps(cv_res["detected_counts"]),
            required_pc_count=required_pcs,
            cv_compliance_passed=cv_res["compliance_passed"],
            exif_lat=geo_res.get("lat"),
            exif_lng=geo_res.get("lng"),
            exif_timestamp=geo_res.get("timestamp"),
            distance_from_campus_meters=geo_res.get("distance_meters", 0.0),
            geofence_passed=geo_res["geofence_passed"]
        )
        db.add(infra_rec)
        db.commit()
        db.refresh(infra_rec)
        return infra_rec

    # =========================================================================
    # SCENARIO A: Clean Compliant EoA Application (Fast-Track Green Path)
    # =========================================================================
    inst_a = Institution(
        aicte_permanent_id="1-1049281",
        name="Vishwakarma Institute of Technology, Pune",
        state="Maharashtra",
        region="WRO",
        registered_lat=18.4636,
        registered_lng=73.8682,
        campus_radius_meters=600.0,
        historical_land_area_sqm=25000.0,
        approved_intake=360,
        ter_payment_status="PAID_VERIFIED",
        previous_eoa_status="APPROVED_2025_26"
    )
    db.add(inst_a)
    db.commit()

    app_a = Application(
        application_no="APP-2026-WRO-1049281",
        institution_id=inst_a.id,
        category="EoA",
        academic_year="2026-27",
        submitted_intake=360,
        claimed_land_area_sqm=25000.0,
        claimed_survey_no="Plot 42/B, Bibwewadi",
        claimed_builtup_area_sqm=18500.0,
        status="AI_VALIDATED",
        overall_risk_score=0.04
    )
    db.add(app_a)
    db.commit()

    # Documents for Scenario A
    fire_a_bytes = create_official_pdf(
        title="MAHARASHTRA STATE FIRE SERVICES DIRECTORATE",
        subtitle="GOVERNMENT OF MAHARASHTRA | MUNICIPAL LIFE SAFETY WING",
        sections=[
            {
                "heading": "STATUTORY FIRE SAFETY CLEARANCE CERTIFICATE",
                "text": "Certified that <b>Vishwakarma Institute of Technology</b> situated at Plot 42/B, Bibwewadi, Pune has adhered to all fire safety norms under National Building Code Part-IV."
            },
            {
                "table": [
                    ["Field", "Regulatory Particulars"],
                    ["Certificate URN", "MH-FIRE-2024-1049"],
                    ["Registered Survey No.", "Plot 42/B, Bibwewadi"],
                    ["Total Built-up Area", "18,500.0 sq.m"],
                    ["Date of Issue", "15/05/2024"],
                    ["Expiry Date", "31/05/2027"],
                    ["Issuing Authority", "Chief Fire Officer, Pune Municipal Corporation"]
                ],
                "colWidths": [180, 320]
            }
        ],
        metadata_producer="Government Printing Directorate, Maharashtra"
    )
    ingest_document(app_a.id, "Fire Safety NOC", "Fire_Safety_NOC_VIT.pdf", fire_a_bytes)

    land_a_bytes = create_official_pdf(
        title="DEPARTMENT OF REGISTRATION & STAMPS",
        subtitle="GOVERNMENT OF MAHARASHTRA | SUB-REGISTRAR OFFICE HAVELI",
        sections=[
            {
                "heading": "REGISTERED LAND TITLE DEED (PERPETUAL FREEHOLD)",
                "text": "Certified indenture executed in favor of Bansilal Ramnath Agarwal Charitable Trust for educational campus."
            },
            {
                "table": [
                    ["Field", "Particulars"],
                    ["Certificate URN", "MH-REV-PUN-4281"],
                    ["Plot Survey No.", "Plot 42/B, Bibwewadi"],
                    ["Total Land Area", "25,000.0 sq.m"],
                    ["Registration Date", "12/04/1983"],
                    ["Issuing Authority", "Sub-Registrar Office, Haveli No. 4, Pune"]
                ],
                "colWidths": [180, 320]
            }
        ]
    )
    ingest_document(app_a.id, "Land Registration Deed", "Land_Registration_Deed_VIT.pdf", land_a_bytes)

    floor_a_bytes = create_official_pdf(
        title="COUNCIL OF ARCHITECTURE CERTIFIED BUILDING PLAN",
        subtitle="MUNICIPAL CORPORATION APPROVED CAMPUS BLUEPRINT",
        sections=[
            {
                "heading": "ARCHITECTURAL FLOOR PLAN & CARPET AREA SCHEDULE",
                "text": "Comprehensive architectural layout certified under Council of Architecture norms."
            },
            {
                "table": [
                    ["Room No", "Nomenclature", "Carpet Area (sq.m)", "Flooring", "Status"],
                    ["101", "Classroom", "68.5 sq.m", "Kota Stone", "Compliant (Norm: 66.0 sq.m)"],
                    ["102", "Classroom", "66.0 sq.m", "Vitrified Tile", "Compliant (Norm: 66.0 sq.m)"],
                    ["103", "Computer Center / Lab", "72.0 sq.m", "Anti-static Vinyl", "Compliant (Norm: 66.0 sq.m)"],
                    ["104", "Classroom", "54.2 sq.m", "Kota Stone", "Deficit (-11.8 sq.m under APH 5.1)"],
                    ["105", "Tutorial Room", "36.0 sq.m", "Vitrified Tile", "Compliant (Norm: 33.0 sq.m)"],
                    ["106", "Seminar Hall", "134.0 sq.m", "Carpet Finish", "Compliant (Norm: 132.0 sq.m)"],
                    ["Total", "Total Schedule Area", "4,210.0 sq.m", "Multi-Floor", "Built-up Reconciled"]
                ],
                "colWidths": [70, 150, 110, 95, 115]
            }
        ]
    )
    ingest_document(app_a.id, "Architect Floor Plan", "Architect_Floor_Plan_VIT.pdf", floor_a_bytes)

    # Lab Photo for Scenario A
    lab_a_img = generate_synthetic_lab_image(55, "VIT-COMP-LAB-101", add_geotag=True, lat=18.4636, lng=73.8682)
    ingest_infra(app_a.id, "COMPUTER_LAB", "Lab-101", "Lab_101_VIT.jpg", lab_a_img, required_pcs=50, inst_lat=18.4636, inst_lng=73.8682)

    # Reconcile graph for Scenario A
    reconcile_application_graph(db, app_a.id)

    add_ledger_record(
        db=db,
        actor_role="SYSTEM_PIPELINE",
        action_type="APPLICATION_INGESTION_COMPLETED",
        application_id=app_a.id,
        payload={"application_no": app_a.application_no, "status": "AI_VALIDATED", "risk_score": app_a.overall_risk_score}
    )

    # =========================================================================
    # SCENARIO B: Tampered Expiry Date & Metadata Anomaly (Forensic Catch)
    # =========================================================================
    inst_b = Institution(
        aicte_permanent_id="1-2894102",
        name="Apex Institute of Technology, Mumbai",
        state="Maharashtra",
        region="WRO",
        registered_lat=19.0760,
        registered_lng=72.8777,
        campus_radius_meters=500.0,
        historical_land_area_sqm=3200.0,
        approved_intake=300,
        ter_payment_status="PAID_VERIFIED",
        previous_eoa_status="APPROVED_2025_26"
    )
    db.add(inst_b)
    db.commit()

    app_b = Application(
        application_no="APP-2026-WRO-2894102",
        institution_id=inst_b.id,
        category="EoA",
        academic_year="2026-27",
        submitted_intake=300,
        claimed_land_area_sqm=3200.0,
        claimed_survey_no="Survey No. 89/1A, Kurla Road",
        claimed_builtup_area_sqm=8200.0,
        status="DEFICIENCY_ISSUED",
        overall_risk_score=0.78
    )
    db.add(app_b)
    db.commit()

    # Tampered Fire NOC for Scenario B (Real JPEG recompression ELA anomaly!)
    tampered_fire_bytes = generate_spliced_tampered_fire_noc()
    ingest_document(app_b.id, "Fire Safety NOC", "Fire_Safety_NOC_Apex_Altered.pdf", tampered_fire_bytes)

    land_b_bytes = create_official_pdf(
        title="SUB-REGISTRAR OFFICE KURLA",
        subtitle="LAND REVENUE DEPARTMENT, MUMBAI SUBURBAN DISTRICT",
        sections=[
            {
                "heading": "REGISTERED SALE DEED",
                "text": "Freehold property title for Apex Educational Society campus."
            },
            {
                "table": [
                    ["Attribute", "Specification"],
                    ["Survey No.", "Survey No. 89/1A, Kurla Road"],
                    ["Total Land Area", "3,200.0 sq.m"],
                    ["Registration Year", "2012"],
                    ["Issuing Authority", "Sub-Registrar Office, Kurla"]
                ],
                "colWidths": [180, 320]
            }
        ]
    )
    ingest_document(app_b.id, "Land Registration Deed", "Land_Registration_Deed_Apex.pdf", land_b_bytes)

    lab_b_img = generate_synthetic_lab_image(50, "APEX-MAIN-LAB", add_geotag=True, lat=19.0760, lng=72.8777)
    ingest_infra(app_b.id, "COMPUTER_LAB", "Main-Lab", "Lab_Main_Apex.jpg", lab_b_img, required_pcs=50, inst_lat=19.0760, inst_lng=72.8777)

    reconcile_application_graph(db, app_b.id)

    add_ledger_record(
        db=db,
        actor_role="SYSTEM_PIPELINE",
        action_type="FORENSIC_TAMPERING_DETECTED",
        application_id=app_b.id,
        payload={"finding": "Pixel ELA compression anomaly and altered PDF producer detected in Fire NOC", "clause": "APH Clause 1.4"}
    )

    # =========================================================================
    # SCENARIO C: Cross-Document Area Mismatch & Duplicate Lab Photo (Graph + CV)
    # =========================================================================
    inst_c = Institution(
        aicte_permanent_id="1-9983142",
        name="St. Xavier Institute of Science & Technology",
        state="Maharashtra",
        region="WRO",
        registered_lat=19.0178,
        registered_lng=72.8478,
        campus_radius_meters=400.0,
        historical_land_area_sqm=2800.0,
        approved_intake=420,
        ter_payment_status="PAID_VERIFIED",
        previous_eoa_status="APPROVED_2025_26"
    )
    db.add(inst_c)
    db.commit()

    app_c = Application(
        application_no="APP-2026-WRO-9983142",
        institution_id=inst_c.id,
        category="EoA",
        academic_year="2026-27",
        submitted_intake=420,
        claimed_land_area_sqm=4500.0,  # Claims 4500 sq.m! But deed only shows 2800 sq.m!
        claimed_survey_no="Plot 108/A",
        claimed_builtup_area_sqm=4500.0,
        status="DEFICIENCY_ISSUED",
        overall_risk_score=0.92
    )
    db.add(app_c)
    db.commit()

    # Documents for Scenario C
    land_c_bytes = create_official_pdf(
        title="SUB-REGISTRAR OFFICE BANDRA",
        subtitle="GOVERNMENT OF MAHARASHTRA | PROPERTY REGISTRATION DIVISION",
        sections=[
            {
                "heading": "REGISTERED LEASE DEED",
                "text": "Certified indenture for educational trust land parcel."
            },
            {
                "table": [
                    ["Field", "Registered Record"],
                    ["Certificate URN", "MH-REV-MUM-7712"],
                    ["Survey No.", "Plot 108/A"],
                    ["Total Land Area", "2,800.0 sq.m"],  # Deficit: 2800 vs 4500 claimed!
                    ["Lease Term", "30 Years"],
                    ["Issuing Authority", "Sub-Registrar Bandra, Mumbai"]
                ],
                "colWidths": [180, 320]
            }
        ]
    )
    ingest_document(app_c.id, "Land Registration Deed", "Land_Registration_Deed_StXavier.pdf", land_c_bytes)

    floor_c_bytes = create_official_pdf(
        title="MUNICIPAL CORPORATION GREATER MUMBAI",
        subtitle="BUILDING PROPOSAL DEPARTMENT | ARCHITECTURAL APPROVAL",
        sections=[
            {
                "heading": "APPROVED SANCTIONED BUILDING PLAN",
                "text": "Institutional building sanctioned for technical campus."
            },
            {
                "table": [
                    ["Specification", "Metric"],
                    ["Survey No.", "Plot 108/A"],
                    ["Total Built-up Area", "4,500.0 sq.m"],
                    ["Number of Labs", "2 Computer Labs (100 Capacity)"],
                    ["Issuing Authority", "Chief Engineer (BP), MCGM"]
                ],
                "colWidths": [180, 320]
            }
        ]
    )
    ingest_document(app_c.id, "Architect Floor Plan", "Architect_Floor_Plan_StXavier.pdf", floor_c_bytes)

    # Infrastructure evidence: Lab 1 (clean) and Lab 2 (duplicate recycled crop of Lab 1 with PC shortfall!)
    lab_c1_img = generate_synthetic_lab_image(50, "ST-XAVIER-LAB-1", add_geotag=True, lat=19.0178, lng=72.8478)
    ev_c1 = ingest_infra(app_c.id, "COMPUTER_LAB", "Lab-1", "Lab_1_StXavier.jpg", lab_c1_img, required_pcs=50, inst_lat=19.0178, inst_lng=72.8478)

    # Lab 2 re-uses slightly cropped & blurred version of Lab 1 with only 18 PCs (triggering both duplicate CLIP match and shortfall!)
    pil_c1 = Image.open(io.BytesIO(lab_c1_img))
    # Crop slightly and resize back
    w, h = pil_c1.size
    cropped = pil_c1.crop((20, 15, w - 20, h - 15)).resize((w, h))
    # Draw a quick small banner for Lab-2
    draw = ImageDraw.Draw(cropped)
    draw.rectangle([300, 70, 500, 105], fill=(15, 23, 42))
    draw.text((315, 80), "AICTE LAB: ST-XAVIER-LAB-2", fill=(255, 255, 255))
    buf_c2 = io.BytesIO()
    cropped.save(buf_c2, "JPEG", quality=88)
    lab_c2_img = buf_c2.getvalue()

    ev_c2 = ingest_infra(app_c.id, "COMPUTER_LAB", "Lab-2", "Lab_2_StXavier_Duplicate.jpg", lab_c2_img, required_pcs=50, inst_lat=19.0178, inst_lng=72.8478)

    # Check duplicate on ev_c2 vs existing
    dup_res = check_visual_duplicates(lab_c2_img, db, exclude_evidence_id=ev_c2.id)
    if dup_res["is_duplicate"]:
        top = dup_res["top_match"]
        flag_dup = ComplianceFlag(
            application_id=app_c.id,
            infra_id=ev_c2.id,
            pillar="INFRA_CV",
            severity="CRITICAL",
            aph_clause_citation="APH 2024-27 Clause 5.2.1 (Physical Infrastructure Uniqueness)",
            title="Duplicate Reused Lab Photograph Detected (Visual Similarity Match)",
            explanation=(
                f"Infrastructure photo for 'Lab-2' matches submitted photo for '{top['room_label']}' "
                f"with {top['similarity_pct']} visual cosine similarity. Statutory rules prohibit reusing identical facility images."
            ),
            evidence_bbox_json="{}"
        )
        db.add(flag_dup)
        db.commit()

    reconcile_application_graph(db, app_c.id)

    add_ledger_record(
        db=db,
        actor_role="SYSTEM_PIPELINE",
        action_type="MULTIMODAL_CONTRADICTIONS_FLAGGED",
        application_id=app_c.id,
        payload={
            "contradiction_1": "Claimed 4,500 sq.m vs Registered Deed 2,800 sq.m",
            "contradiction_2": f"Duplicate Lab Photo detected ({dup_res.get('max_similarity', 0.96)*100:.1f}% similarity)"
        }
    )

def seed_database(db: Session):
    """Initializes system users and regulatory rules. Demo colleges are only seeded if SEED_DEMO_COLLEGES=true."""
    import os
    seed_system_rules_and_users(db)
    if os.getenv("SEED_DEMO_COLLEGES", "false").lower() == "true":
        seed_demo_colleges(db)

