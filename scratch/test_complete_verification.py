import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def run_tests():
    print("=" * 70)
    print("PRAMAAN-AICTE NATIONAL COLLEGE AUTOCOMPLETE & GEOCODING AUDIT")
    print("=" * 70)

    # 1. Test Health
    h = requests.get(f"{BASE_URL}/api/health")
    assert h.status_code == 200, f"Health check failed: {h.status_code}"
    print(f"[PASS] 1. Backend Health Check: HTTP {h.status_code}")

    # 2. Test Search across Top National Colleges
    search_queries = ["GCOE", "COEP", "VJTI", "IIT Bombay", "NIT Trichy", "Cummins", "PEC", "Thapar", "VIT"]
    print("\n--- 2. Autocomplete Search Directory ---")
    for q in search_queries:
        r = requests.get(f"{BASE_URL}/api/colleges/search?q={q}").json()
        assert r["count"] > 0, f"Expected results for '{q}', got 0"
        top = r["colleges"][0]
        print(f"  [FOUND] '{q}' -> {top['name']} ({top.get('short_name','')}) | PID: {top['aicte_permanent_id']} | Region: {top['region']} | GPS: ({top['lat']}, {top['lng']})")

    # 3. Test Live OSM Geocoding Fallback for an Unlisted Institution
    print("\n--- 3. Live OpenStreetMap Geocoding Fallback ---")
    osm_resp = requests.get(f"{BASE_URL}/api/colleges/geocode?name=Government+Polytechnic+Nashik&state=Maharashtra").json()
    assert osm_resp["status"] == "success", f"OSM geocoding failed: {osm_resp}"
    osm_res = osm_resp["result"]
    print(f"  [GEOCODED] {osm_res['name']} -> Lat: {osm_res['lat']}, Lng: {osm_res['lng']}, Region: {osm_res['region']}")

    # 4. Create an Application using Autocompleted Data
    print("\n--- 4. Register Application via Autocomplete Flow ---")
    gcoe_karad = requests.get(f"{BASE_URL}/api/colleges/search?q=GCOE+Karad").json()["colleges"][0]
    payload = {
        "institution_name": gcoe_karad["name"],
        "state": gcoe_karad["state"],
        "region": gcoe_karad["region"],
        "aicte_permanent_id": gcoe_karad["aicte_permanent_id"],
        "category": "EoA",
        "academic_year": "2026-27",
        "submitted_intake": gcoe_karad.get("suggested_intake", 480),
        "claimed_land_area_sqm": gcoe_karad.get("suggested_land_area_sqm", 161874.0),
        "claimed_survey_no": gcoe_karad.get("survey_no", "Survey No. 24, Karad"),
        "claimed_builtup_area_sqm": 8500.0,
        "registered_lat": gcoe_karad["lat"],
        "registered_lng": gcoe_karad["lng"],
        "campus_radius_meters": gcoe_karad.get("campus_radius_meters", 500.0)
    }

    create_res = requests.post(f"{BASE_URL}/api/applications/create", json=payload)
    assert create_res.status_code == 200, f"Create application failed: {create_res.text}"
    create_data = create_res.json()
    new_app_id = create_data["application_id"]
    print(f"  [CREATED] Dossier ID #{new_app_id} - App No: {create_data['application_no']}")
    print(f"    Name: {create_data['institution_name']}")
    print(f"    PID: {create_data['aicte_permanent_id']}")

    # 5. Verify PDF Generation for the newly created dossier
    print("\n--- 5. Deficiency PDF Report Generation ---")
    pdf_res = requests.get(f"{BASE_URL}/api/applications/{new_app_id}/deficiency-report.pdf")
    assert pdf_res.status_code == 200, f"PDF generation failed: {pdf_res.status_code}"
    assert pdf_res.headers.get("content-type") == "application/pdf"
    print(f"  [VERIFIED] PDF Report generated ({len(pdf_res.content)} bytes)")

    # 6. Verify Audit Ledger Non-Repudiation Chain
    print("\n--- 6. Cryptographic Audit Ledger ---")
    ledger_res = requests.get(f"{BASE_URL}/api/audit-ledger").json()
    assert len(ledger_res) > 0
    latest = ledger_res[-1]
    print(f"  [RECORDED] Action: {latest['action_type']} | App: {latest['application_id']} | Hash: {latest['curr_hash'][:16]}...")

    print("\n" + "=" * 70)
    print("ALL 6 STATUTORY CHECKS PASSED FLAWLESSLY!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
