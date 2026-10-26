import requests
from PIL import Image
import io

# 1. Create a quick test image
img = Image.new("RGB", (640, 480), color=(100, 150, 200))
buf = io.BytesIO()
img.save(buf, format="JPEG")
buf.seek(0)

# 2. Upload to app #1
res = requests.post(
    "http://127.0.0.1:8000/api/applications/1/upload-infrastructure",
    data={"room_type": "COMPUTER_LAB", "room_label": "Lab-101", "required_pc_count": 50},
    files={"file": ("test_lab.jpg", buf, "image/jpeg")}
)
print("Upload status:", res.status_code)
d = res.json()
print("Evidence file_url:", d.get("evidence", {}).get("file_url"))
print("Annotated url:", d.get("evidence", {}).get("annotated_cv_url"))
print("Detected counts:", d.get("evidence", {}).get("detected_counts"))
