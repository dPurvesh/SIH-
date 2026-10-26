import sys
sys.path.insert(0, r"c:\Users\osmpu\OneDrive - Vishwakarma Institute of Technology\SIH ONCE AGAIN\backend")
from services.forensics_engine import run_ela_analysis
from services.pdf_generator import create_official_pdf

# Generate a clean official PDF
pdf = create_official_pdf(
    title="CLEAN TEST PDF",
    subtitle="Official Document",
    sections=[{"heading": "Section 1", "text": "This is a clean, genuine document without tampering."}]
)

res = run_ela_analysis(pdf)
print("Clean PDF ELA Result:", res["anomaly_score"], "Mean residual:", res["mean_residual"], "Boxes:", len(res["bounding_boxes"]))
