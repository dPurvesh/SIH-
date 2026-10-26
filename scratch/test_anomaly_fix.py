import requests

# 1. Check health
h = requests.get("http://127.0.0.1:8000/api/health")
print("Health:", h.status_code)

# 2. Get applications
apps = requests.get("http://127.0.0.1:8000/api/applications").json()
print("Applications in DB:", len(apps))

if len(apps) > 0:
    app_id = apps[0]["id"]
    # Trigger reconciliation
    rec = requests.post(f"http://127.0.0.1:8000/api/applications/{app_id}/reconcile").json()
    print("Reconciled flags count:", rec["flags_count"], "risk:", rec["overall_risk_score"])
    
    # Check flags
    detail = requests.get(f"http://127.0.0.1:8000/api/applications/{app_id}").json()
    print("Docs in app:", len(detail["documents"]))
    for d in detail["documents"]:
        print(f"  Doc '{d['doc_type']}': ELA score = {d['ela_anomaly_score']}")
    print("Flags count:", len(detail["flags"]))
    for f in detail["flags"]:
        print(f"  Flag: {f['title']} ({f['severity']})")
