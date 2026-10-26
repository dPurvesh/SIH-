import requests

tests = ['coep', 'vjti', 'iit bombay', 'vit', 'pec', 'thapar', 'nit trichy']
for t in tests:
    res = requests.get(f'http://127.0.0.1:8000/api/colleges/search?q={t}').json()
    c = res['colleges'][0] if res['colleges'] else None
    if c:
        print(f"[{t}] -> {c['short_name']} ({c['region']}) | PID: {c['aicte_permanent_id']} | GPS: {c['lat']}, {c['lng']}")
    else:
        print(f"[{t}] -> No matches found")
