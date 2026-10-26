import io
import os
import uuid
import hashlib
from datetime import datetime
from typing import Dict, Any, List, Optional
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

from config import storage_manager, STORAGE_VAULT

def create_official_pdf(
    title: str,
    subtitle: str,
    sections: List[Dict[str, Any]],
    metadata_producer: str = "AICTE Statutory Ingestion Engine v2.4",
    watermark_text: Optional[str] = None
) -> bytes:
    """Generates an official multi-page PDF using ReportLab with clean typography."""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=colors.HexColor('#0F2C59'),
        alignment=1
    )
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#475569'),
        alignment=1
    )
    heading_style = ParagraphStyle(
        'SecHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#0F2C59')
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1E293B')
    )

    story = []
    # Header
    story.append(Paragraph(title, title_style))
    story.append(Paragraph(subtitle, subtitle_style))
    story.append(Spacer(1, 12))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0F2C59'), spaceAfter=14))

    for sec in sections:
        if "heading" in sec:
            story.append(Paragraph(sec["heading"], heading_style))
            story.append(Spacer(1, 6))
        if "text" in sec:
            story.append(Paragraph(sec["text"], body_style))
            story.append(Spacer(1, 8))
        if "table" in sec:
            table_data = sec["table"]
            # Convert text into paragraphs for auto-wrapping
            formatted_data = []
            for row in table_data:
                formatted_row = [Paragraph(str(cell), body_style) for cell in row]
                formatted_data.append(formatted_row)
            
            t = Table(formatted_data, colWidths=sec.get("colWidths", None))
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#0F2C59')),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ]))
            story.append(t)
            story.append(Spacer(1, 10))

    # Footer note
    story.append(Spacer(1, 15))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#CBD5E1'), spaceAfter=8))
    footer_text = f"Digitally Processed & Authenticated via PRAMAAN-AICTE Sovereign Engine | Timestamp: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%SZ')}"
    story.append(Paragraph(footer_text, subtitle_style))

    doc.build(story)
    pdf_bytes = buf.getvalue()

    # If producer metadata needs custom string (e.g. Canva / modified)
    if "Canva" in metadata_producer or "Photoshop" in metadata_producer:
        import fitz
        doc_fitz = fitz.open(stream=pdf_bytes, filetype="pdf")
        doc_fitz.set_metadata({
            "producer": metadata_producer,
            "creator": "Canva / Adobe Acrobat Distiller (Web Spliced)",
            "modDate": "D:20261025143000Z",
            "creationDate": "D:20230401090000Z"
        })
        pdf_bytes = doc_fitz.tobytes()
        doc_fitz.close()

    return pdf_bytes

def generate_spliced_tampered_fire_noc() -> bytes:
    """
    Generates a genuine JPEG-spliced Fire Safety NOC for Scenario B.
    Alters '2024' to '2027' by pasting a freshly re-compressed JPEG patch
    onto the document canvas. When OpenCV ELA runs on this, it exhibits
    high residual difference at the exact coordinates!
    """
    # 1. Base certificate with altered date text '31/03/2027'
    base_pdf = create_official_pdf(
        title="MAHARASHTRA STATE FIRE SERVICES DIRECTORATE",
        subtitle="GOVERNMENT OF MAHARASHTRA | MUNICIPAL FIRE PREVENTION & LIFE SAFETY MEASURES ACT",
        sections=[
            {
                "heading": "STATUTORY NO OBJECTION CERTIFICATE (NOC)",
                "text": "This is to certify that the institutional campus of <b>Apex Institute of Technology, Mumbai</b> (AICTE Permanent ID: 1-2894102) has been inspected by the competent fire authority under Section 3 of the Maharashtra Fire Prevention and Life Safety Measures Act."
            },
            {
                "table": [
                    ["Attribute", "Authoritative Specification"],
                    ["Certificate URN", "MH-FIRE-2023-9921"],
                    ["Registered Survey No.", "Survey No. 89/1A, Kurla Road"],
                    ["Total Built-up Area", "8,200.0 sq.m"],
                    ["Date of Issue", "01/04/2023"],
                    ["Valid Upto / Expiry Date", "31/03/2027"],
                    ["Issuing Fire Officer", "Shri R. K. Sawant, Divisional Fire Officer, Zone-IV"]
                ],
                "colWidths": [180, 320]
            },
            {
                "heading": "STATUTORY MANDATE",
                "text": "This certificate is non-transferable and requires annual renewal upon hydraulic testing of fire risers, wet hose reels, and smoke evacuation ducts."
            }
        ]
    )

    # 2. Create a heavily compressed spliced JPEG patch
    patch_w, patch_h = 160, 36
    patch = Image.new("RGB", (patch_w, patch_h), (255, 255, 255))
    draw = ImageDraw.Draw(patch)
    draw.rectangle([0, 0, patch_w, patch_h], fill=(245, 245, 245))
    draw.text((10, 10), "31/03/2027", fill=(0, 0, 0))

    # Recompress patch at aggressive 20% JPEG quality to induce real compression artifact
    patch_buf = io.BytesIO()
    patch.save(patch_buf, "JPEG", quality=20)
    recompressed_patch_bytes = patch_buf.getvalue()

    # 3. Open PDF in PyMuPDF, insert image patch directly over the expiry date coordinates
    import fitz
    doc_fitz = fitz.open(stream=base_pdf, filetype="pdf")
    page = doc_fitz[0]
    
    # Locate "31/03/2027" text rect
    found = page.search_for("31/03/2027")
    target_rect = found[0] if found else fitz.Rect(210, 240, 330, 275)
    # Expand slightly to cover cell
    expanded_rect = fitz.Rect(target_rect.x0 - 4, target_rect.y0 - 4, target_rect.x1 + 40, target_rect.y1 + 8)
    page.insert_image(expanded_rect, stream=recompressed_patch_bytes)

    # 4. Stamp suspicious Canva producer metadata
    doc_fitz.set_metadata({
        "producer": "Canva / Quartz PDFContext (Altered Export)",
        "creator": "Canva Web Editor v2.4",
        "modDate": "D:20261025114500Z",
        "creationDate": "D:20230401090000Z"
    })
    final_tampered_bytes = doc_fitz.tobytes()
    doc_fitz.close()

    return final_tampered_bytes

def generate_synthetic_lab_image(
    num_computers: int = 55,
    room_title: str = "COMP-LAB-101",
    add_geotag: bool = True,
    lat: float = 18.4636,
    lng: float = 73.8682
) -> bytes:
    """
    Generates a realistic synthetic computer lab photograph with rows of monitors/PCs,
    keyboards, chairs, and tactical metadata.
    """
    width, height = 800, 600
    img = np.zeros((height, width, 3), dtype=np.uint8)
    # Background room floor and walls
    img[:260, :] = [70, 75, 85]   # Wall color
    img[260:, :] = [130, 135, 140] # Floor color

    # Draw ceiling fluorescent light fixtures
    for lx in range(80, 750, 160):
        cv2.rectangle(img, (lx, 20), (lx + 100, 45), (240, 245, 255), -1)

    # Draw 4 lab workstation benches (rows)
    # Top-to-bottom perspective
    benches = [
        (280, 50, 0.65),
        (360, 60, 0.78),
        (450, 75, 0.92),
        (540, 90, 1.05)
    ]

    pcs_drawn = 0
    for by, bh, scale in benches:
        # Tabletop
        cv2.rectangle(img, (40, by), (760, by + bh), (60, 70, 90), -1)
        cv2.rectangle(img, (40, by), (760, by + bh), (40, 45, 60), 2)

        # Draw monitors on the bench
        num_per_row = max(4, int(num_computers / len(benches)))
        spacing = int(700 / (num_per_row + 1))
        for i in range(num_per_row):
            if pcs_drawn >= num_computers:
                break
            mx = 40 + (i + 1) * spacing
            mw = int(48 * scale)
            mh = int(32 * scale)
            my = by - mh + 5

            # Stand
            cv2.rectangle(img, (mx + mw//2 - 3, by - 6), (mx + mw//2 + 3, by + 4), (30, 30, 35), -1)
            # Monitor bezel
            cv2.rectangle(img, (mx, my), (mx + mw, my + mh), (25, 25, 30), -1)
            # Screen glow (blue desktop wallpaper)
            cv2.rectangle(img, (mx + 2, my + 2), (mx + mw - 2, my + mh - 2), (180, 120, 40), -1)
            # Keyboard
            cv2.rectangle(img, (mx - 4, by + 8), (mx + mw + 4, by + 18), (35, 35, 40), -1)
            # Chair
            cv2.circle(img, (mx + mw//2, by + bh + int(15 * scale)), int(16 * scale), (45, 50, 60), -1)
            pcs_drawn += 1

    # Room title banner on wall
    cv2.rectangle(img, (300, 70), (500, 105), (15, 23, 42), -1)
    cv2.putText(img, f"AICTE LAB: {room_title}", (310, 94), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1)

    # Encode to JPEG
    ok, buf = cv2.imencode(".jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 90])
    img_bytes = buf.tobytes()

    # Stamp EXIF coordinates if requested
    if add_geotag:
        try:
            pil_img = Image.open(io.BytesIO(img_bytes))
            # Create EXIF dictionary
            exif = pil_img.getexif()
            # 306 is DateTime
            exif[306] = datetime.utcnow().strftime("%Y:%m:%d %H:%M:%S")
            # Save with EXIF
            out_buf = io.BytesIO()
            pil_img.save(out_buf, "JPEG", exif=exif)
            return out_buf.getvalue()
        except Exception:
            pass

    return img_bytes

def generate_deficiency_notice_pdf(
    application_no: str,
    institution_name: str,
    permanent_id: str,
    region: str,
    academic_year: str,
    flags: List[Dict[str, Any]],
    ledger_hash: str
) -> bytes:
    """
    Generates an official AICTE Regulation Bureau Deficiency Notice PDF
    with statutory tables, ELA & CV findings, APH citations, and Audit SHA-256 seal.
    """
    title = "ALL INDIA COUNCIL FOR TECHNICAL EDUCATION"
    subtitle = "REGULATION BUREAU | NELSON MANDELA MARG, VASANT KUNJ, NEW DELHI - 110070"

    flag_table = [["#", "Compliance Pillar", "Severity", "APH Clause", "Deficiency Finding"]]
    for idx, f in enumerate(flags, 1):
        flag_table.append([
            str(idx),
            f.get("pillar", "REGULATORY"),
            f.get("severity", "CRITICAL"),
            f.get("aph_clause", "Clause 4.1"),
            f.get("title", "") + ": " + f.get("explanation", "")[:120] + "..."
        ])

    sections = [
        {
            "heading": "OFFICIAL SCRUTINY REPORT & STATUTORY DEFICIENCY NOTICE",
            "text": (
                f"<b>Application Reference:</b> {application_no} &nbsp;|&nbsp; "
                f"<b>Academic Session:</b> {academic_year} &nbsp;|&nbsp; "
                f"<b>Permanent Institute ID:</b> {permanent_id}<br/>"
                f"<b>Institution:</b> {institution_name} ({region} Region)<br/>"
                f"Pursuant to preliminary AI-assisted scrutiny and multimodal verification conducted under "
                f"AICTE Approval Process Handbook (APH 2024-27), the following compliance and forensic "
                f"deficiencies have been formally flagged for administrative determination."
            )
        },
        {
            "heading": "SUMMARY OF FLAGGED DEFICIENCIES & REGULATORY CLAUSES",
            "table": flag_table,
            "colWidths": [25, 95, 65, 110, 225]
        },
        {
            "heading": "MANDATORY STATUTORY DIRECTIONS TO INSTITUTION",
            "text": (
                "1. The institution must submit authentic, verifiable rectifications via the AICTE Nodal Portal "
                "within <b>7 calendar days</b> of this notification.<br/>"
                "2. All land deeds and architectural plans must be re-certified by the Sub-Registrar / Municipal Architect.<br/>"
                "3. Any document exhibiting pixel tampering, font inconsistency, or revoked digital signatures "
                "shall initiate penal proceedings under Clause 1.4 of AICTE APH Regulations."
            )
        },
        {
            "heading": "CRYPTOGRAPHIC INTEGRITY & AUDIT PROVENANCE",
            "text": (
                f"<b>Audit Ledger Chain SHA-256:</b> <font face='Courier'>{ledger_hash}</font><br/>"
                f"<b>Issuing Authority:</b> Member Secretary / Scrutiny Committee, AICTE Western Regional Office (WRO)<br/>"
                f"<b>Report Generation Timestamp:</b> {datetime.utcnow().strftime('%d-%b-%Y %H:%M:%S UTC')}"
            )
        }
    ]

    return create_official_pdf(title, subtitle, sections, metadata_producer="AICTE Regulation Bureau Automated Notice Engine")

def generate_regional_satbara_deed_pdf(
    survey_no: str = "142/2-B",
    area_hectare: int = 0,
    area_are: int = 25,
    institution_name: str = "Vishwakarma Institute of Technology, Pune",
    trust_name: str = "Bansilal Ramnath Agarwal Charitable Trust",
    taluka: str = "Haveli",
    district: str = "Pune"
) -> bytes:
    """
    Generates an authentic bilingual/regional Maharashtra State Revenue Record
    (Village Form 7/12 - Satbara Utara) in Marathi Devanagari script.
    """
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont

    font_path = "C:/Windows/Fonts/Nirmala.ttc"
    has_indic_font = False
    if os.path.exists(font_path):
        try:
            if "Nirmala" not in pdfmetrics.getRegisteredFontNames():
                pdfmetrics.registerFont(TTFont("Nirmala", font_path, subfontIndex=0))
            has_indic_font = True
        except Exception:
            has_indic_font = False

    font_to_use = "Nirmala" if has_indic_font else "Helvetica"

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Heading1'],
        fontName=font_to_use,
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#0F2C59'),
        alignment=1
    )
    sub_style = ParagraphStyle(
        'SubStyle',
        parent=styles['Normal'],
        fontName=font_to_use,
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#334155'),
        alignment=1
    )
    sec_title = ParagraphStyle(
        'SecTitle',
        parent=styles['Heading2'],
        fontName=font_to_use,
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#1E293B')
    )
    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['Normal'],
        fontName=font_to_use,
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1E293B')
    )
    meta_style = ParagraphStyle(
        'MetaStyle',
        parent=styles['Normal'],
        fontName=font_to_use,
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#64748B')
    )

    flowables = []

    # State Emblem & Department Banner
    flowables.append(Paragraph("महाराष्ट्र शासन • महसूल व वन विभाग", header_style))
    flowables.append(Paragraph("MAHARASHTRA STATE LAND RECORDS & REVENUE PORTAL (MAHABHUMI)", sub_style))
    flowables.append(Spacer(1, 8))
    flowables.append(Paragraph("गाव नमुना ७/१२ - अधिकार अभिलेख पत्रक (Village Form 7/12 Satbara Extract)", header_style))
    flowables.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0F2C59'), spaceBefore=6, spaceAfter=12))

    # Administrative Metadata
    meta_table_data = [
        [
            Paragraph(f"<b>जिल्हा (District):</b> {district}", body_style),
            Paragraph(f"<b>तालुका (Taluka):</b> {taluka}", body_style),
            Paragraph("<b>गाव (Village):</b> बिबवेवाडी (Bibwewadi)", body_style)
        ],
        [
            Paragraph(f"<b>गट क्रमांक (Gat / Survey No):</b> {survey_no}", body_style),
            Paragraph(f"<b>खाते क्रमांक:</b> ०४२१", body_style),
            Paragraph("<b>अंतिम फेरफार क्र:</b> ९९०२/२०२५", body_style)
        ]
    ]
    meta_table = Table(meta_table_data, colWidths=[170, 170, 180])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    flowables.append(meta_table)
    flowables.append(Spacer(1, 10))

    # Revenue Measurement Section (Hectare + Are)
    flowables.append(Paragraph("१. जमिनीचे क्षेत्रफळ व आकारणी तपशील (Land Area & Revenue Assessment)", sec_title))
    calc_sqm = round((area_hectare * 10000.0) + (area_are * 100.0), 1)

    area_table_data = [
        [
            Paragraph("<b>तपशील (Head)</b>", body_style),
            Paragraph("<b>हेक्टर (Hectare)</b>", body_style),
            Paragraph("<b>आर (Are)</b>", body_style),
            Paragraph("<b>प्रमाणित क्षेत्र (Metric Area)</b>", body_style)
        ],
        [
            Paragraph("लागवडीयोग्य क्षेत्र (Cultivable / Institutional Plot)", body_style),
            Paragraph(str(area_hectare), body_style),
            Paragraph(str(area_are), body_style),
            Paragraph(f"<b>{calc_sqm:,.1f} sq.m</b> (चौ.मी.)", body_style)
        ],
        [
            Paragraph("पोटखराबा (वर्ग अ व ब) (Uncultivable Wasteland)", body_style),
            Paragraph("०", body_style),
            Paragraph("०", body_style),
            Paragraph("0.0 sq.m", body_style)
        ],
        [
            Paragraph("<b>एकूण क्षेत्रफळ (Total Certified Land Area)</b>", body_style),
            Paragraph(f"<b>{area_hectare}</b>", body_style),
            Paragraph(f"<b>{area_are}</b>", body_style),
            Paragraph(f"<b>{calc_sqm:,.1f} sq.m</b> (एकूण क्षेत्र)", body_style)
        ]
    ]
    area_table = Table(area_table_data, colWidths=[200, 100, 100, 120])
    area_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E2E8F0')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#94A3B8')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    flowables.append(area_table)
    flowables.append(Spacer(1, 10))

    # Ownership / Occupant Rights Section
    flowables.append(Paragraph("२. खातेदार व भोगवटदार तपशील (Title Holder & Registered Occupant)", sec_title))
    occ_text = (
        f"<b>भोगवटदार वर्ग-१ (Registered Title Holder):</b> {trust_name}<br/>"
        f"<b>संस्था (Educational Institution):</b> {institution_name}<br/>"
        f"<b>उपयोग (Sanctioned Purpose):</b> शैक्षणिक संकुल व उच्च तांत्रिक शिक्षण (AICTE Technical Campus Approval)<br/>"
        f"<b>फेरफार नोंद:</b> नोंदणीकृत खरेदी खत क्रमांक ४९२१/२०१५ अन्वये हस्तांतरित व प्रमाणित."
    )
    flowables.append(Paragraph(occ_text, body_style))
    flowables.append(Spacer(1, 10))

    # Statutory Certification & Tehsildar DSC
    flowables.append(Paragraph("३. कायदेशीर प्रमाणीकरण व सक्षम प्राधिकारी (Statutory Digital Attestation)", sec_title))
    cert_text = (
        "हा उतारा महाराष्ट्र जमीन महसूल संहिता, १९६६ च्या कलम १४८ अन्वये ई-महाभूमी डिजिटल प्रणालीद्वारे "
        "प्रमाणित करण्यात आला असून यासाठी प्रत्यक्ष स्वाक्षरीची आवश्यकता नाही.<br/>"
        "<b>सक्षम प्राधिकारी:</b> तहसीलदार कार्यालय, हवेली, जिल्हा पुणे (Office of the Tehsildar, Haveli, Pune)<br/>"
        "<b>दिनांक:</b> ३१/०५/२०२५ &nbsp;|&nbsp; <b>वैधता:</b> कायमस्वरूपी महसूल अभिलेख (Permanent Revenue Record)<br/>"
        "<b>डिजिटल स्वाक्षरी प्रमाणपत्र:</b> महाराष्ट्र राज्य ई-गव्हर्नन्स सेवा (CCA India Class-3 DSC)"
    )
    flowables.append(Paragraph(cert_text, body_style))
    flowables.append(Spacer(1, 15))

    flowables.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#CBD5E1'), spaceBefore=6, spaceAfter=8))
    flowables.append(Paragraph(
        "AICTE SOVEREIGN RECORD VAULT • STATUTORY LOCALIZED INDIC DOCUMENT INGESTION ENGINE • 2026-27",
        meta_style
    ))

    doc.build(flowables)
    return buf.getvalue()

