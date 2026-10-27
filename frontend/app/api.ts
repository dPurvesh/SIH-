/**
 * Dynamic API Base resolution:
 * - Client Browser (typeof window !== 'undefined'): Always use relative path ''
 *   unless a remote HTTPS URL is explicitly provided in NEXT_PUBLIC_API_URL.
 *   This routes all /api/* requests through the Next.js reverse proxy to the FastAPI backend,
 *   preventing Mixed Content (HTTP over HTTPS) blocks and localhost connection errors on Render.
 * - Server-side (SSR / Node): Connects to FastAPI on http://127.0.0.1:8000.
 */
export function getApiBase(): string {
  if (typeof window !== 'undefined') {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl && !envUrl.includes('127.0.0.1') && !envUrl.includes('localhost')) {
      return envUrl.replace(/\/$/, '');
    }
    return '';
  }
  return (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
}

export const API_BASE = getApiBase();

export interface Institution {
  id: number;
  aicte_permanent_id: string;
  name: string;
  state: string;
  region: string;
  registered_lat: number;
  registered_lng: number;
  campus_radius_meters: number;
  historical_land_area_sqm: number;
  approved_intake: number;
  ter_payment_status: string;
  previous_eoa_status: string;
}

export interface DocumentRecord {
  id: number;
  application_id: number;
  doc_type: string;
  filename: string;
  minio_object_key: string;
  file_url: string;
  file_size_bytes: number;
  mime_type: string;
  sha256_hash: string;
  phash: string;
  ocr_raw_text: string;
  extracted_entities: {
    survey_no?: string;
    land_area_sqm?: number;
    builtup_area_sqm?: number;
    issue_date?: string;
    expiry_date?: string;
    certificate_urn?: string;
    issuing_authority?: string;
    trust_name?: string;
    entity_bboxes?: Record<string, { page: number; x: number; y: number; w: number; h: number; x_rel: number; y_rel: number; w_rel: number; h_rel: number }>;
    qr_payload?: string;
    is_regional?: boolean;
    detected_language?: string;
    detected_script?: string;
    language_confidence?: number;
    regional_doc_type?: string;
    translations?: Array<{
      field: string;
      original_term: string;
      translated_term: string;
      source_language: string;
      conversion_rule?: string;
    }>;
  };
  ela_anomaly_score: number;
  ela_heatmap_url: string;
  ela_bounding_boxes: Array<{
    x: number;
    y: number;
    w: number;
    h: number;
    x_rel: number;
    y_rel: number;
    w_rel: number;
    h_rel: number;
    region_score: number;
  }>;
  pdf_metadata: {
    producer?: string;
    creator?: string;
    creation_date?: string;
    mod_date?: string;
    is_modified_post_creation?: boolean;
    has_editing_anomaly?: boolean;
    flagged_editing_tools?: string[];
    embedded_fonts?: string[];
    structural_integrity?: string;
    has_valid_x509_dsc?: boolean;
    signature_count?: number;
    signers?: string[];
    dsc_status?: string;
  };
  authority_status: 'VERIFIED' | 'MISMATCH_DETECTED' | 'EXPIRED' | 'VERIFICATION_PENDING' | 'SOURCE_UNAVAILABLE' | 'MANUAL_REVIEW_REQUIRED';
  authority_source_name: string;
  authority_response: any;
  authority_verified_at: string | null;
}

export interface InfrastructureEvidence {
  id: number;
  application_id: number;
  room_type: string;
  room_label: string;
  file_url: string;
  annotated_cv_url: string;
  sha256_hash: string;
  phash: string;
  detected_counts: {
    tv_monitor_pc?: number;
    chair_seat?: number;
    person?: number;
  };
  required_pc_count: number;
  cv_compliance_passed: boolean;
  exif_lat: number | null;
  exif_lng: number | null;
  exif_timestamp: string | null;
  distance_from_campus_meters: number;
  geofence_passed: boolean;
}

export interface ComplianceFlag {
  id: number;
  application_id: number;
  document_id: number | null;
  infra_id: number | null;
  pillar: 'CROSS_DOC_GRAPH' | 'FORENSIC_ELA' | 'PDF_CRYPTO' | 'AUTHORITY_API' | 'INFRA_CV' | 'GEOFENCE';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  aph_clause_citation: string;
  title: string;
  explanation: string;
  evidence_bbox: any;
  hitl_status: 'PENDING_OFFICER_REVIEW' | 'ACCEPTED_AS_DEFICIENCY' | 'OVERRIDDEN_BY_OFFICER';
  officer_remarks: string;
  reviewed_at: string | null;
}

export interface ReconciliationRow {
  attribute: string;
  form_claim: string;
  land_deed: string;
  floor_plan: string;
  fire_noc: string;
  historical_db: string;
  is_congruent: boolean;
}

export interface Application {
  id: number;
  application_no: string;
  institution_id: number;
  category: string;
  academic_year: string;
  submitted_intake: number;
  claimed_land_area_sqm: number;
  claimed_survey_no: string;
  claimed_builtup_area_sqm: number;
  status: 'DRAFT' | 'SUBMITTED' | 'AI_VALIDATED' | 'DEFICIENCY_ISSUED' | 'EVC_SCHEDULED' | 'APPROVED';
  overall_risk_score: number;
  created_at: string;
  updated_at: string;
  institution: Institution;
  documents: DocumentRecord[];
  infrastructure: InfrastructureEvidence[];
  flags: ComplianceFlag[];
  reconciliation_matrix?: ReconciliationRow[];
}

export interface AuditRecord {
  id: number;
  timestamp: string;
  actor_role: string;
  action_type: string;
  application_id: number | null;
  target_entity_id: string | null;
  payload: any;
  prev_hash: string;
  curr_hash: string;
}

export interface APHRuleConfig {
  id?: number;
  academic_year: string;
  category: string;
  mandatory_doc_types: string[];
  min_land_area_sqm: number;
  min_classroom_area_sqm: number;
  min_lab_area_sqm: number;
  min_tutorial_area_sqm?: number;
  min_seminar_area_sqm?: number;
  max_land_variance_percent?: number;
  max_builtup_variance_percent?: number;
  max_sfr_ratio?: number;
  max_geofence_radius_meters?: number;
  min_fdr_corpus_lakhs?: number;
  clip_duplicate_threshold?: number;
  ela_anomaly_threshold?: number;
  student_pc_ratio: number;
  require_valid_dsc: boolean;
  updated_by?: string;
  updated_at?: string;
}

// Typed API Client methods
export async function fetchHealth(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/health`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Backend health check failed');
  return res.json();
}

export async function fetchApplications(): Promise<Application[]> {
  const res = await fetch(`${API_BASE}/api/applications`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch applications');
  return res.json();
}

export async function fetchApplication(id: number): Promise<Application> {
  const res = await fetch(`${API_BASE}/api/applications/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch application ${id}`);
  return res.json();
}

export async function uploadDocument(appId: number, docType: string, file: File): Promise<any> {
  const formData = new FormData();
  formData.append('doc_type', docType);
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/api/applications/${appId}/upload-document`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Document upload failed');
  return res.json();
}

export async function uploadInfrastructure(
  appId: number,
  roomType: string,
  roomLabel: string,
  requiredPcs: number,
  file: File,
  lat?: number,
  lng?: number
): Promise<any> {
  const formData = new FormData();
  formData.append('room_type', roomType);
  formData.append('room_label', roomLabel);
  formData.append('required_pcs', requiredPcs.toString());
  formData.append('file', file);
  if (lat !== undefined && lat !== null) formData.append('lat', lat.toString());
  if (lng !== undefined && lng !== null) formData.append('lng', lng.toString());
  const res = await fetch(`${API_BASE}/api/applications/${appId}/upload-infrastructure`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Infrastructure evidence upload failed');
  return res.json();
}

export async function verifyAuthority(docId: number): Promise<any> {
  const res = await fetch(`${API_BASE}/api/authority-gateway/verify/${docId}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Authority gateway verification failed');
  return res.json();
}

export async function submitHitlDecision(flagId: number, decision: 'CONFIRM_DEFICIENCY' | 'OVERRIDE_ADVISORY', remarks: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/hitl/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ flag_id: flagId, decision, remarks }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed' }));
    throw new Error(err.detail || 'HITL decision recording failed');
  }
  return res.json();
}

export async function fetchRules(): Promise<APHRuleConfig> {
  const res = await fetch(`${API_BASE}/api/rules/aph`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch APH rules');
  return res.json();
}

export async function updateRules(rules: Partial<APHRuleConfig>): Promise<any> {
  const res = await fetch(`${API_BASE}/api/rules/aph`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rules),
  });
  if (!res.ok) throw new Error('Failed to update APH rules');
  return res.json();
}

export async function reevaluateAll(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/rules/re-evaluate`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Re-evaluation batch run failed');
  return res.json();
}

export async function fetchAuditLedger(): Promise<AuditRecord[]> {
  const res = await fetch(`${API_BASE}/api/audit-ledger`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch audit ledger');
  return res.json();
}

export async function verifyAuditIntegrity(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/audit/verify-integrity`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Integrity verification failed');
  return res.json();
}

export function getFileUrl(objectKey: string): string {
  return `${API_BASE}/api/storage/files/${objectKey}`;
}

export function getHeatmapUrl(heatmapKey: string): string {
  return `${API_BASE}/api/storage/heatmaps/${heatmapKey}`;
}

export function getDeficiencyPdfUrl(appId: number): string {
  return `${API_BASE}/api/applications/${appId}/deficiency-report.pdf`;
}

// ============================================================
// CHANGE 1 — System Analytics (live from DB)
// ============================================================
export interface SystemAnalytics {
  applications: { total: number; approved: number; deficiency_issued: number; ai_validated: number; submitted: number };
  documents: { total: number; tampered: number; tamper_rate_pct: number; authority_verified: number; authority_mismatch: number; authority_expired: number; authority_pass_rate_pct: number };
  infrastructure: { total_evidence: number; geofence_violations: number; cv_failures: number; cv_pass_rate_pct: number; geofence_pass_rate_pct: number };
  compliance_flags: { total: number; critical: number; pending_hitl: number; confirmed_deficiencies: number; overridden_by_officer: number; hitl_resolution_rate_pct: number };
  risk: { avg_risk_score: number; max_risk_score: number };
  audit_ledger: { total_blocks: number };
  generated_at: string;
}

export async function fetchSystemAnalytics(): Promise<SystemAnalytics> {
  const res = await fetch(`${API_BASE}/api/analytics/system`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch system analytics');
  return res.json();
}

// ============================================================
// CHANGE 2 — Category-Based Dynamic Checklist
// ============================================================
export interface ChecklistDocReq {
  doc_type: string;
  label: string;
  mandatory: boolean;
  aph_clause: string;
}
export interface ChecklistInfraReq {
  category?: string;
  item: string;
  value: string;
  aph_clause: string;
}
export interface ChecklistResponse {
  category: string;
  academic_year: string;
  document_requirements: ChecklistDocReq[];
  infrastructure_requirements: ChecklistInfraReq[];
  total_mandatory_docs: number;
  total_optional_docs: number;
  rule_last_updated: string | null;
  rule_updated_by: string;
}

export async function fetchChecklist(category: string): Promise<ChecklistResponse> {
  const res = await fetch(`${API_BASE}/api/rules/aph/${encodeURIComponent(category)}/checklist`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch checklist for ${category}`);
  return res.json();
}

// ============================================================
// CHANGE 3 — Authority Registry (DB-backed)
// ============================================================
export interface AuthorityRegistryEntry {
  urn: string;
  status: string;
  authority: string;
  institution_name: string;
  expiry_date: string | null;
  issue_date: string | null;
  is_active: boolean;
  source: string;
  extra: Record<string, any>;
}

export async function fetchAuthorityRegistry(): Promise<{ count: number; entries: AuthorityRegistryEntry[] }> {
  const res = await fetch(`${API_BASE}/api/authority-gateway/registry`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch authority registry');
  return res.json();
}

export async function addRegistryEntry(entry: {
  urn: string; status: string; authority: string; institution_name: string;
  issue_date?: string; expiry_date?: string; is_active?: boolean; extra_fields?: Record<string, any>;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/api/authority-gateway/registry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error('Failed to add registry entry');
  return res.json();
}

export async function clearAuthorityRegistry(): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE}/api/authority-gateway/registry/clear`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to clear authority registry');
  return res.json();
}

export async function reseedAuthorityRegistry(): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE}/api/authority-gateway/registry/reseed`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to reseed authority registry');
  return res.json();
}

// ============================================================
// CHANGE 4 — Dynamic Entity Reconciliation Graph
// ============================================================
export interface EntityGraphAttribute {
  attribute: string;
  sources: Record<string, any>;
  is_congruent: boolean;
  aph_clause: string;
}
export interface EntityGraph {
  application_id: number;
  application_no: string;
  institution_name: string;
  overall_risk_score: number;
  attributes: EntityGraphAttribute[];
  document_sources_count: number;
  generated_at: string;
}

export async function fetchEntityGraph(appId: number): Promise<EntityGraph> {
  const res = await fetch(`${API_BASE}/api/applications/${appId}/entity-graph`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch entity graph for application ${appId}`);
  return res.json();
}

// ============================================================
// CHANGE 5 — Custom Application Creator
// ============================================================
export interface CreateApplicationPayload {
  institution_name: string;
  state: string;
  region?: string;
  aicte_permanent_id?: string;
  category?: string;
  academic_year?: string;
  submitted_intake?: number;
  claimed_land_area_sqm?: number;
  claimed_survey_no?: string;
  claimed_builtup_area_sqm?: number;
  registered_lat?: number;
  registered_lng?: number;
  campus_radius_meters?: number;
}

export async function createApplication(payload: CreateApplicationPayload): Promise<any> {
  const res = await fetch(`${API_BASE}/api/applications/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed' }));
    throw new Error(err.detail || 'Application creation failed');
  }
  return res.json();
}

// ============================================================
// CHANGE 6 — Dynamic Institutions (GPS Geofence)
// ============================================================
export async function fetchInstitutions(): Promise<Institution[]> {
  const res = await fetch(`${API_BASE}/api/institutions`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch institutions');
  return res.json();
}

export async function fetchInstitution(id: number): Promise<Institution> {
  const res = await fetch(`${API_BASE}/api/institutions/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch institution ${id}`);
  return res.json();
}

export async function updateInstitutionGeofence(
  instId: number,
  data: { registered_lat?: number; registered_lng?: number; campus_radius_meters?: number }
): Promise<any> {
  const res = await fetch(`${API_BASE}/api/institutions/${instId}/geofence`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update institution geofence');
  return res.json();
}

// ============================================================
// PyMuPDF Tabular Schedule Extraction & APH Mathematical Audit
// ============================================================
export interface TableRow {
  row_index: number;
  room_no?: string;
  nomenclature?: string;
  carpet_area?: number;
  raw_area_text?: string;
  aph_prescribed_norm?: number;
  is_instructional?: boolean;
  is_compliant?: boolean;
  deficit?: number;
  flooring?: string;
  floor?: string;
  name?: string;
  designation?: string;
  department?: string;
  qualification?: string;
  bbox?: {
    page: number;
    x: number;
    y: number;
    w: number;
    h: number;
    x_rel: number;
    y_rel: number;
    w_rel: number;
    h_rel: number;
  };
  [key: string]: any;
}

export interface ExtractedTable {
  table_id: string;
  doc_type: string;
  filename: string;
  document_id?: number;
  page_number: number;
  table_type: 'ROOM_SCHEDULE' | 'FACULTY_ROSTER' | 'FDR_SCHEDULE' | 'GENERAL_SCHEDULE';
  bbox: [number, number, number, number];
  bbox_rel: {
    page: number;
    x: number;
    y: number;
    w: number;
    h: number;
    x_rel: number;
    y_rel: number;
    w_rel: number;
    h_rel: number;
  };
  headers: string[];
  rows: TableRow[];
  metrics: {
    total_rows?: number;
    total_rooms?: number;
    total_schedule_area_sqm?: number;
    claimed_builtup_area_sqm?: number;
    shortfall_sqm?: number;
    non_compliant_rooms_count?: number;
    [key: string]: any;
  };
}

export interface ApplicationTablesResponse {
  application_id: number;
  total_tables_detected: number;
  tables: ExtractedTable[];
}

export async function fetchApplicationTables(appId: number): Promise<ApplicationTablesResponse> {
  const res = await fetch(`${API_BASE}/api/applications/${appId}/tables`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch tables for application ${appId}`);
  return res.json();
}

export async function triggerReconciliation(appId: number): Promise<any> {
  const res = await fetch(`${API_BASE}/api/applications/${appId}/reconcile`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to trigger reconciliation for application ${appId}`);
  return res.json();
}

export async function resetColleges(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/system/reset-colleges`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset colleges');
  return res.json();
}

export async function reseedDemoColleges(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/system/reseed-demo-colleges`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reseed demo colleges');
  return res.json();
}

// ============================================================
// CHANGE 7 — National College Directory & Instant GPS Geocoding
// ============================================================
export interface CollegeDirectoryItem {
  name: string;
  short_name?: string;
  aicte_permanent_id: string;
  state: string;
  region: string;
  district?: string;
  lat: number;
  lng: number;
  campus_radius_meters: number;
  suggested_intake?: number;
  suggested_land_area_sqm?: number;
  survey_no?: string;
}

export async function searchColleges(query: string): Promise<CollegeDirectoryItem[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(`${API_BASE}/api/colleges/search?q=${encodeURIComponent(query.trim())}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.colleges || [];
  } catch (err) {
    console.warn('College search failed:', err);
    return [];
  }
}

export async function geocodeCollege(name: string, state?: string): Promise<any> {
  if (!name || name.trim().length < 3) return null;
  try {
    const url = `${API_BASE}/api/colleges/geocode?name=${encodeURIComponent(name)}${state ? `&state=${encodeURIComponent(state)}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.warn('Geocode lookup failed:', err);
    return null;
  }
}



