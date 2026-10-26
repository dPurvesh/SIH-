import requests

res = requests.get('http://127.0.0.1:8000/api/colleges/geocode?name=Government+Polytechnic+Solapur&state=Maharashtra').json()
print("Geocode response:", res)
