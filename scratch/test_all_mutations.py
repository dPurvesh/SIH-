import requests
import json
import io

BASE = "http://localhost:8000"

print("="*60)
print("AUDITING ALL MUTATION ENDPOINTS (POST, PUT, PATCH)")
print("="*60)

# 1. Test create custom application
print("\n--- 1. POST /api/applications/create ---")
create_payload = {
    "institution_name": "Antigravity Institute of Advanced Technology",
    "state": "Maharashtra",
    "region": "WRO",
    "aicte_permanent_id": "1-9999888877",
    "category": "EoA",
    "academic_year": "2026-27",
    "submitted_intake": 420,
    "claimed_land_area_sqm": 3500.0,
    "claimed_survey_no": "Survey 77/4B",
    "claimed_builtup_area_sqm": 5800.0,
    "registered_lat": 18.5204,
    "registered_lng": 73.8567,
    "campus_radius_meters": 500.0
}
r = requests.post(f"{BASE}/api/applications/create", json=create_payload)
print(f"Status: {r.status_code}")
created_app = r.json()
new_app_id = created_app.get("application_id") or created_app.get("id")
print(f"Created App ID: {new_app_id}")

# 2. Test document upload to this application
print("\n--- 2. POST /api/applications/{app_id}/upload-document ---")
# Create a dummy PDF in memory
dummy_pdf = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources <<>> /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000117 00000 n\ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n212\n%%EOF"
files = {"file": ("test_trust_deed.pdf", dummy_pdf, "application/pdf")}
data = {"doc_type": "Trust Deed / Society Registration"}
r = requests.post(f"{BASE}/api/applications/{new_app_id}/upload-document", files=files, data=data)
print(f"Status: {r.status_code}")
uploaded_doc = r.json().get("document", {})
doc_id = uploaded_doc.get("id")
print(f"Uploaded Doc ID: {doc_id}, SHA: {uploaded_doc.get('sha256_hash')[:16]}...")

# 3. Test standalone forensics upload
print("\n--- 3. POST /api/forensics/analyze-upload ---")
files = {"file": ("forensic_sample.pdf", dummy_pdf, "application/pdf")}
r = requests.post(f"{BASE}/api/forensics/analyze-upload", files=files)
print(f"Status: {r.status_code}, Anomaly Score: {r.json().get('ela_anomaly_score')}")

# 4. Test authority gateway verify
if doc_id:
    print(f"\n--- 4. POST /api/authority-gateway/verify/{doc_id} ---")
    r = requests.post(f"{BASE}/api/authority-gateway/verify/{doc_id}")
    print(f"Status: {r.status_code}, Authority Status: {r.json().get('authority_status')}")

# 5. Test HITL Decision
print("\n--- 5. POST /api/hitl/decision ---")
# Find any pending flag
r = requests.get(f"{BASE}/api/applications/{new_app_id}")
flags = r.json().get("flags", [])
if flags:
    flag_id = flags[0]["id"]
    hitl_payload = {
        "flag_id": flag_id,
        "action": "ACCEPT_DEFICIENCY",
        "officer_remarks": "Audited and verified by senior scrutinizer."
    }
    r = requests.post(f"{BASE}/api/hitl/decision", json=hitl_payload)
    print(f"Status: {r.status_code}, HITL Result: {r.json().get('status')}")
else:
    print("No flags on new app to review.")

# 6. Test PUT /api/rules/aph
print("\n--- 6. PUT /api/rules/aph ---")
rules_payload = {
    "academic_year": "2026-27",
    "min_land_area_sqm": 2500.0,
    "student_pc_ratio": 4,
    "updated_by": "Audit Verification Script"
}
r = requests.put(f"{BASE}/api/rules/aph", json=rules_payload)
print(f"Status: {r.status_code}, Msg: {r.json().get('message')}")

# 7. Test PATCH /api/institutions/{inst_id}/geofence
inst_id = created_app.get("institution", {}).get("id") or 1
print(f"\n--- 7. PATCH /api/institutions/{inst_id}/geofence ---")
geo_payload = {
    "registered_lat": 18.5210,
    "registered_lng": 73.8570,
    "campus_radius_meters": 600.0
}
r = requests.patch(f"{BASE}/api/institutions/{inst_id}/geofence", json=geo_payload)
print(f"Status: {r.status_code}, Geofence: {r.json().get('campus_radius_meters')}m")

# 8. Test Add Authority Registry Entry
print("\n--- 8. POST /api/authority-gateway/registry ---")
registry_payload = {
    "urn": "REG-MHD-2026-TEST999",
    "status": "VERIFIED",
    "authority": "Maharashtra Directorate of Technical Education",
    "institution_name": "Antigravity Institute of Advanced Technology",
    "issue_date": "2026-01-15",
    "expiry_date": "2027-03-31",
    "is_active": True
}
r = requests.post(f"{BASE}/api/authority-gateway/registry", json=registry_payload)
print(f"Status: {r.status_code}, Registered URN: {r.json().get('registered_urn')}")

# 9. Verify Ledger Cryptographic Chain
print("\n--- 9. Verify Audit Ledger Cryptographic Integrity ---")
r = requests.get(f"{BASE}/api/audit/verify-integrity")
integrity = r.json()
print(f"Chain Valid: {integrity.get('chain_valid')}, Blocks: {integrity.get('total_blocks')}, Status: {integrity.get('status')}")

print("\nALL MUTATION AUDIT TESTS EXECUTED.")
