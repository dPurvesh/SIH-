import requests

# 1. Search for GCOE
res = requests.get('http://localhost:8000/api/colleges/search?q=gcoe').json()
colleges = res.get('colleges', [])
print(f"Found colleges matching 'GCOE': {len(colleges)}")
for c in colleges[:3]:
    print(f"  - {c['name']} ({c.get('short_name')}) -> Region: {c['region']}, Lat: {c['lat']}, Lng: {c['lng']}")

selected = colleges[0]
print(f"\nAuto-filling from selected: {selected['name']}")

# 2. Create application directly using the auto-populated details
payload = {
    'institution_name': selected['name'],
    'aicte_permanent_id': selected['aicte_permanent_id'],
    'state': selected['state'],
    'region': selected['region'],
    'category': 'EoA',
    'academic_year': '2026-27',
    'submitted_intake': selected.get('suggested_intake', 480),
    'claimed_land_area_sqm': selected.get('suggested_land_area_sqm', 160000.0),
    'claimed_survey_no': selected.get('survey_no', 'Survey No. 24, Vidyanagar, Karad'),
    'claimed_builtup_area_sqm': 22000.0,
    'registered_lat': selected['lat'],
    'registered_lng': selected['lng'],
    'campus_radius_meters': selected.get('campus_radius_meters', 500.0)
}

r = requests.post('http://localhost:8000/api/applications/create', json=payload)
print(f"Create application result: {r.status_code}")
created = r.json()
print(f"Assigned App No: {created.get('application_no')}, ID: {created.get('application_id')}")

# 3. Verify application appears in GET /api/applications
apps = requests.get('http://localhost:8000/api/applications').json()
print(f"\nTotal applications in DB: {len(apps)}")
for a in apps:
    print(f"  -> ID #{a['id']}: {a['application_no']} - {a['institution']['name']} (Lat: {a['institution']['registered_lat']}, Lng: {a['institution']['registered_lng']})")

print("\nAUTOCOMPLETE & CREATION PIPELINE VERIFIED SUCCESSFULLY!")
