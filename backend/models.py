import json
import hashlib
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Index
)
from sqlalchemy.orm import DeclarativeBase, relationship

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # INSTITUTION_NODAL_OFFICER, AICTE_SCRUTINY_OFFICER, AICTE_EVC_INSPECTOR, AICTE_ADMIN
    region = Column(String(20), default="WRO")  # WRO, NRO, SRO, ERO
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=True)

    institution = relationship("Institution", back_populates="users")

class Institution(Base):
    __tablename__ = "institutions"

    id = Column(Integer, primary_key=True, index=True)
    aicte_permanent_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    state = Column(String(100), nullable=False)
    region = Column(String(50), default="WRO")
    registered_lat = Column(Float, nullable=False)
    registered_lng = Column(Float, nullable=False)
    campus_radius_meters = Column(Float, default=500.0)
    historical_land_area_sqm = Column(Float, default=2500.0)
    approved_intake = Column(Integer, default=300)
    ter_payment_status = Column(String(50), default="PAID_VERIFIED")
    previous_eoa_status = Column(String(50), default="APPROVED_2025_26")

    users = relationship("User", back_populates="institution")
    applications = relationship("Application", back_populates="institution")

class APHRuleConfig(Base):
    __tablename__ = "aph_rule_configs"

    id = Column(Integer, primary_key=True, index=True)
    academic_year = Column(String(20), default="2026-27")
    category = Column(String(50), default="EoA")  # EoA, NEW_INSTITUTE, INTAKE_INCREASE
    mandatory_doc_types = Column(Text, default="[]")  # JSON array
    min_land_area_sqm = Column(Float, default=2500.0)
    min_classroom_area_sqm = Column(Float, default=66.0)
    min_lab_area_sqm = Column(Float, default=66.0)
    min_tutorial_area_sqm = Column(Float, default=33.0)
    min_seminar_area_sqm = Column(Float, default=132.0)
    max_land_variance_percent = Column(Float, default=2.0)
    max_builtup_variance_percent = Column(Float, default=2.0)
    max_sfr_ratio = Column(Float, default=20.0)
    max_geofence_radius_meters = Column(Float, default=500.0)
    min_fdr_corpus_lakhs = Column(Float, default=100.0)
    clip_duplicate_threshold = Column(Float, default=0.90)
    ela_anomaly_threshold = Column(Float, default=0.25)
    student_pc_ratio = Column(Integer, default=6)  # 1 PC per 6 students
    require_valid_dsc = Column(Boolean, default=True)
    updated_by = Column(String(100), default="AICTE_REGULATION_BUREAU")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    application_no = Column(String(100), unique=True, index=True, nullable=False)
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=False)
    category = Column(String(50), default="EoA")
    academic_year = Column(String(20), default="2026-27")
    submitted_intake = Column(Integer, default=300)
    claimed_land_area_sqm = Column(Float, default=2500.0)
    claimed_survey_no = Column(String(100), default="Plot 42/B")
    claimed_builtup_area_sqm = Column(Float, default=4500.0)
    status = Column(String(50), default="SUBMITTED")  # DRAFT, SUBMITTED, AI_VALIDATED, DEFICIENCY_ISSUED, EVC_SCHEDULED, APPROVED
    overall_risk_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    institution = relationship("Institution", back_populates="applications")
    documents = relationship("DocumentRecord", back_populates="application", cascade="all, delete-orphan")
    infrastructure = relationship("InfrastructureEvidence", back_populates="application", cascade="all, delete-orphan")
    flags = relationship("ComplianceFlag", back_populates="application", cascade="all, delete-orphan")

class DocumentRecord(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    doc_type = Column(String(100), nullable=False)
    filename = Column(String(255), nullable=False)
    minio_object_key = Column(String(255), nullable=False)
    file_size_bytes = Column(Integer, default=0)
    mime_type = Column(String(100), default="application/pdf")
    sha256_hash = Column(String(64), index=True, nullable=False)
    phash = Column(String(64), index=True, nullable=False)
    
    ocr_raw_text = Column(Text, default="")
    extracted_entities_json = Column(Text, default="{}")  # survey_no, land_area_sqm, builtup_area_sqm, issue_date, expiry_date, etc.
    
    ela_anomaly_score = Column(Float, default=0.0)
    ela_heatmap_object_key = Column(String(255), default="")
    ela_bounding_boxes_json = Column(Text, default="[]")
    
    pdf_metadata_json = Column(Text, default="{}")  # Producer, Creator, ModDate, font_subsets, dsc
    
    authority_verification_status = Column(
        String(50), default="VERIFICATION_PENDING"
    )  # VERIFIED, MISMATCH_DETECTED, EXPIRED, VERIFICATION_PENDING, SOURCE_UNAVAILABLE, MANUAL_REVIEW_REQUIRED
    authority_source_name = Column(String(100), default="State / National Gateway")
    authority_response_json = Column(Text, default="{}")
    authority_verified_at = Column(DateTime, nullable=True)

    application = relationship("Application", back_populates="documents")
    flags = relationship("ComplianceFlag", back_populates="document")

class InfrastructureEvidence(Base):
    __tablename__ = "infrastructure_evidence"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    room_type = Column(String(50), default="COMPUTER_LAB")  # COMPUTER_LAB, CLASSROOM, LIBRARY, RAMP_BARRIER_FREE
    room_label = Column(String(100), default="Lab-101")
    minio_object_key = Column(String(255), nullable=False)
    annotated_cv_object_key = Column(String(255), default="")
    
    sha256_hash = Column(String(64), index=True, nullable=False)
    phash = Column(String(64), index=True, nullable=False)
    clip_embedding_json = Column(Text, default="[]")  # 512-dim normalized vector
    
    yolo_detected_counts_json = Column(Text, default="{}")  # {"tv_monitor_pc": int, "chair_seat": int, "person": int}
    required_pc_count = Column(Integer, default=50)
    cv_compliance_passed = Column(Boolean, default=True)
    
    exif_lat = Column(Float, nullable=True)
    exif_lng = Column(Float, nullable=True)
    exif_timestamp = Column(String(50), nullable=True)
    distance_from_campus_meters = Column(Float, default=0.0)
    geofence_passed = Column(Boolean, default=True)

    application = relationship("Application", back_populates="infrastructure")
    flags = relationship("ComplianceFlag", back_populates="infrastructure")

class ComplianceFlag(Base):
    __tablename__ = "compliance_flags"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    infra_id = Column(Integer, ForeignKey("infrastructure_evidence.id"), nullable=True)
    pillar = Column(String(50), nullable=False)  # CROSS_DOC_GRAPH, FORENSIC_ELA, PDF_CRYPTO, AUTHORITY_API, INFRA_CV, GEOFENCE
    severity = Column(String(20), default="CRITICAL")  # CRITICAL, WARNING, INFO
    aph_clause_citation = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    explanation = Column(Text, nullable=False)
    evidence_bbox_json = Column(Text, default="{}")
    
    hitl_status = Column(String(50), default="PENDING_OFFICER_REVIEW")  # PENDING_OFFICER_REVIEW, ACCEPTED_AS_DEFICIENCY, OVERRIDDEN_BY_OFFICER
    officer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    officer_remarks = Column(Text, default="")
    reviewed_at = Column(DateTime, nullable=True)

    application = relationship("Application", back_populates="flags")
    document = relationship("DocumentRecord", back_populates="flags")
    infrastructure = relationship("InfrastructureEvidence", back_populates="flags")

class AuditLedger(Base):
    __tablename__ = "audit_ledger"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    actor_user_id = Column(Integer, nullable=True)
    actor_role = Column(String(50), default="SYSTEM_PIPELINE")
    action_type = Column(String(100), nullable=False)
    application_id = Column(Integer, nullable=True, index=True)
    target_entity_id = Column(String(100), nullable=True)
    payload_json = Column(Text, default="{}")
    prev_hash = Column(String(64), nullable=False)
    curr_hash = Column(String(64), unique=True, nullable=False)

    @staticmethod
    def compute_hash(prev_hash: str, timestamp_iso: str, actor_role: str, action_type: str, payload_json: str) -> str:
        """Enforces cryptographic hash chaining: SHA256(prev_hash + timestamp_iso + actor_role + action_type + canonical_payload)"""
        try:
            # Canonicalize payload JSON
            canonical = json.dumps(json.loads(payload_json or "{}"), sort_keys=True, separators=(',', ':'))
        except Exception:
            canonical = payload_json or "{}"
        raw = f"{prev_hash}{timestamp_iso}{actor_role}{action_type}{canonical}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()
