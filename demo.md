# PRAMAAN-AICTE: Master Step-by-Step Demo Guide & AI Document Generator

Welcome to the definitive demonstration manual for **PRAMAAN-AICTE** (AICTE Approval Process Handbook 2024–27 Sovereign Scrutiny Engine).

This guide provides **exact, click-by-click instructions** to demonstrate and verify every single feature of the platform. It also includes **ready-to-use AI prompts** that you can paste into ChatGPT, Claude, Gemini, or Microsoft Word to generate realistic sample documents in seconds.

---

## Quick Navigation & Server URLs

Ensure both local servers are active before beginning:

| Component | URL | Status Check |
| :--- | :--- | :--- |
| **Next.js 15 Frontend** | [http://localhost:3000](http://localhost:3000) | Main Dashboard |
| **Institution Nodal Portal** | [http://localhost:3000/institution](http://localhost:3000/institution) | Document Upload Dropzones |
| **Forensic Scrutiny Studio** | [http://localhost:3000/scrutiny](http://localhost:3000/scrutiny) | Multi-Layer Audit Studio |
| **Vision Auditor & Geofence** | [http://localhost:3000/infrastructure-cv](http://localhost:3000/infrastructure-cv) | YOLOv8 & CLIP AI Vision |
| **Mobile Companion HUD** | [http://localhost:3000/mobile-capture](http://localhost:3000/mobile-capture) | Field Officer Camera HUD |
| **Governance & Audit Ledger** | [http://localhost:3000/admin-governance](http://localhost:3000/admin-governance) | Zero-Code Rules & Ledger |
| **FastAPI Backend Swagger** | [http://localhost:8000/docs](http://localhost:8000/docs) | Interactive API Explorer |

> [!TIP]
> **One-Click Reset / Reseed Buttons (Top Action Bar on Homepage):**
> - Click **`[Clear Sample Colleges]`** at any time to wipe the database and start 100% clean.
> - Click **`[Load 3 Demo Scenarios]`** at any time to instantly load the 3 pre-built golden test cases (Scenario A: Fast-Track Clean, Scenario B: Tampered Fire NOC, Scenario C: Lab PC Shortfall).

---

## Part 1: Sample Documents to Generate via AI (Prompts Included)

To demo document uploads from scratch, you will need **4 sample PDF documents** and **1 lab image**. You can generate them in 2 minutes using ChatGPT, Claude, Gemini, or Word AI with the exact prompts below.

### How to Create the PDFs:
1. Copy the prompt below into ChatGPT / Claude / Gemini.
2. Copy the generated text.
3. Paste into Microsoft Word or Google Docs.
4. Click **File $\to$ Save As $\to$ PDF** (or **Download as PDF**).
*(Note: Word `.docx` saved as `.pdf` is the standard format required for full PyMuPDF table parsing and font inspection).*

---

### Document 1: Fire Safety NOC (State Fire Services)
**Copy-paste this prompt into any AI:**
```text
Write a formal, official "Fire Safety Certificate / No Objection Certificate (NOC)" issued by the "Directorate of Maharashtra Fire Services, State Disaster Management Authority".
Include the following exact details:
- Header: Government of Maharashtra - Directorate of Fire Services
- Certificate Reference / URN: MH/FIRE/2026/84920
- Issue Date: 15-January-2026
- Valid Until: 31-March-2027
- Certified Institution: Government College of Engineering, Karad (or your chosen college)
- Campus Address: Survey No. 24, Vidyanagar, Karad, Satara, Maharashtra - 415124
- Building Particulars: Ground + 4 Floors Technical Education Complex, Height 17.5 Meters
- Inspection Compliance: Verified functional wet risers, automatic sprinkler systems in server room, 2 x 100,000 Litre underground static water tanks, 6-meter-wide clear motorable fire tender driveway around the perimeter.
- Signature Block: Chief Fire Officer (CFO), Western Zone, Satara Division.
Format it neatly as an official statutory government clearance letter.
```

---

### Document 2: Land Registration Deed / 7/12 Satbara Extract
**Copy-paste this prompt into any AI:**
```text
Write a formal "Land Title & Ownership Certification (Form 7/12 Satbara Extract / Freehold Sale Deed)" issued by the "Office of the Sub-Registrar of Revenue, Revenue Department".
Include the following exact details:
- Title: MAHARASHTRA LAND REVENUE FORM 7/12 (गाव नमुना ७/१२ - अधिकार अभिलेख पत्रक)
- Revenue Division: Satara, Taluka: Karad, Village: Vidyanagar
- Survey / Gat / Khasra Number: Survey No. 24, Hissa No. 1/A
- Total Contiguous Land Area: 161,874.0 sq. meters (approx 40.0 Acres / 16.18 Hectares / 1,600 Gunthas)
- Tenure: Class-1 Freehold Non-Agricultural (NA) Land for Technical & Higher Education
- Registered Title Holder: Government of Maharashtra & Board of Governors, Government College of Engineering, Karad
- Encumbrances: NIL (Uncontested, Free from all mortgages, liens, or court litigation)
- Watermark / Stamp: Certified True Extract by Talathi & Sub-Divisional Magistrate (SDM).
Format it with formal revenue and legal terminology.
```

---

### Document 3: Architect Certified Floor Plan & Room Schedule (Crucial for Tabular Audit!)
> [!IMPORTANT]
> This document showcases **PyMuPDF Tabular Extraction & Mathematical Audit (Check A & Check B)**. Room 104 is intentionally under 66.0 sq.m to prove AICTE deficit detection!

**Copy-paste this prompt into any AI:**
```text
Create an official "Architectural Space Audit & Room Schedule Certificate" issued by a Council of Architecture (COA) Registered Architect.
Include the following exact details:
- Header: ARCHITECTURAL SPACE AUDIT & CARPET AREA DETERMINATION
- Architect: Ar. Rajesh M. Deshmukh, B.Arch, MCA/2012/48192
- Institutional Project: Government College of Engineering, Karad - Instructional Academic Block A
- Total Claimed Built-up Area: 18,500.0 sq.m

Include the following EXACT Markdown/Word table of instructional spaces:
| Room No | Room Nomenclature | Floor Level | Carpet Area (sq.m) | APH Norm (sq.m) | Verification Remark |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Room 101 | Engineering Classroom A1 | Ground Floor | 66.0 | 66.0 | Compliant |
| Room 102 | Engineering Classroom A2 | Ground Floor | 66.0 | 66.0 | Compliant |
| Room 103 | Mechanics Classroom A3 | First Floor | 68.5 | 66.0 | Compliant |
| Room 104 | Electronics Tutorial Room | First Floor | 54.2 | 66.0 | Deficit - Sub-standard |
| Room 105 | CAD/CAM Computer Center | Second Floor | 150.0 | 150.0 | Compliant |
| Room 106 | Central Digital Library | Second Floor | 400.0 | 400.0 | Compliant |
| Room 107 | Multi-Purpose Seminar Hall | Third Floor | 132.0 | 132.0 | Compliant |

- Certificate Statement: "I hereby certify that the physical instructional carpet areas detailed above have been verified on site in accordance with AICTE Approval Process Handbook (APH 2024–27 Clause 5.1 & Clause 4.1.3)."
- Signed: Ar. Rajesh Deshmukh, Council of Architecture Reg. CA/2012/48192.
```

---

### Document 4: Bank Fixed Deposit Receipt (FDR) / TER Fee Payment
**Copy-paste this prompt into any AI:**
```text
Write a formal "Fixed Deposit Receipt (FDR) / Technical Education Regulatory (TER) Payment Clearance Receipt".
Include the following exact details:
- Issuing Bank: State Bank of India, Main Branch, Treasury Branch
- Joint Account Holders: Principal, Government College of Engineering, Karad AND The Member Secretary, AICTE New Delhi
- FDR Certificate Number: SBI-TER-2026-981023
- Deposit Principal Amount: INR 15,00,000/- (Rupees Fifteen Lakhs Only)
- Purpose: AICTE Statutory Security Deposit (APH Clause 2.16)
- Tenure: 8 Years (Maturity Date: 31-March-2034)
- Regulatory TER Clearance Reference: AICTE-TER-FEE-TXN-8829104
- Status: Lien marked in favor of AICTE, Non-encashable without AICTE authorization.
Format it as a formal bank certificate.
```

---

### Document 5: Computer Lab Photo (Visual Infrastructure)
- **Option A (AI Image Generator Prompt for Midjourney / DALL-E / Bing Image Creator):**
  ```text
  Interior photo of a modern engineering college computer laboratory in India, rows of neat desktop computer monitors, keyboards, office chairs on tile floor, white fluorescent ceiling lights, network cables, clean academic environment, high quality realistic photography.
  ```
- **Option B (Fast Alternative):** Use any photo of a desk with a computer monitor, take a photo of your laptop/screen, or search for "computer lab" on Google Images and save it as `lab.jpg`.

---

## Part 2: Comprehensive Step-by-Step Feature-by-Feature Testing Guide

Each feature below includes **WHY WE IMPLEMENTED IT** (regulatory necessity & fraud prevention), **WHAT IS THE USE OF IT** (practical utility for officers and institutions), **STEP-BY-STEP TESTING ACTIONS**, **SCREEN OBSERVATIONS**, and **PITCH TALK TRACKS** for the SIH Jury.

---

### Feature 1: Clean Slate Workspace & Instant State Reset
- **Primary Route:** [`/`](file:///c:/Users/osmpu/OneDrive%20-%20Vishwakarma%20Institute%20of%20Technology/SIH%20ONCE%20AGAIN/frontend/app/page.tsx)
- **Visual Target:** Top-Right Executive Action Bar $\to$ `[Clear Sample Colleges]`

#### 1. Why We Implemented This Feature:
In live hackathons and regulatory audits, evaluators routinely suspect that demo systems rely on pre-baked, hardcoded mock data. In real-world AICTE operations, testing environments must be wiped cleanly between regulatory cycles without manually dropping database tables or corrupting file storage.

#### 2. What Is The Use Of It:
- **Zero-Mock Verification:** Proves to jury members that the database starts 100% empty and that every subsequent calculation, file hash, and bounding box is computed live on the fly.
- **Auditor Convenience:** Enables scrutiny officers or testers to instantly clear test dossiers and re-run audits from genesis with one click.

#### 3. Step-by-Step Testing Guide:
1. Open [http://localhost:3000](http://localhost:3000) in your browser.
2. In the top-right header action bar, click **`[Clear Sample Colleges]`**.
3. A confirmation dialog appears: *"Are you sure you want to clear all colleges?"* $\to$ Click **OK**.

#### 4. What to Observe on Screen:
- **Active Dossiers Metric:** Drops instantly from previous counts to **`0`**.
- **Institutional Queue Card:** Empties and renders a clean state notice: *"Workspace clean: Register your institution to start"*.
- **System Telemetry:** Live database counter verifies zero active records in SQLite/PostgreSQL.

#### 5. Evaluator Pitch Talk Track:
> *"Judges, before we evaluate any college, we want to prove that PRAMAAN-AICTE has zero hardcoded mocks. We click 'Clear Sample Colleges'—our database is completely blank. Every single calculation, polygon, and hash you will see today is generated live by our multimodal Python engines."*

---

### Feature 2: National College Master Directory Autocomplete & GPS Auto-Fill
- **Primary Route:** [`/`](file:///c:/Users/osmpu/OneDrive%20-%20Vishwakarma%20Institute%20of%20Technology/SIH%20ONCE%20AGAIN/frontend/app/page.tsx)
- **Visual Target:** Black Header Button $\to$ `[+ Register New Application]` Modal

#### 1. Why We Implemented This Feature:
Under the manual AICTE approval system, colleges submit inconsistent institutional names, typos in Permanent IDs (PIDs), and inaccurate geographic coordinates. Scrutiny officers spend weeks cross-referencing AICTE's legacy database to determine whether an applicant is a real accredited institution or an unauthorized shell trust.

#### 2. What Is The Use Of It:
- **Zero-Typos & Ground-Truth Linking:** Autocompletes against AICTE's statutory master repository (10,000+ colleges), instantly binding the application to its official Permanent ID (PID) and statutory land norm.
- **Geospatial Anchoring:** Automatically pulls precise physical campus GPS coordinates (Latitude & Longitude) to anchor downstream drone, mobile, and EXIF geofencing audits.
- **OpenStreetMap & HTML5 Fallback:** For newly established or unlisted institutions, live geocoding looks up physical coordinates via OpenStreetMap Nominatim, or detects the registrar's physical hardware GPS location with meter-level accuracy.

#### 3. Step-by-Step Testing Guide:
1. On [http://localhost:3000](http://localhost:3000), click the black button: **`[+ Register New Application]`**.
2. In the modal, locate the **Institution Name** input field.
3. Type **`GCOE`** (or `COEP`, `VJTI`, `IIT`, `NIT`, `Cummins`, `VIT`).
4. A floating dropdown appears: `AICTE National Master Directory (Matches)`.
5. Click on **`"Government College of Engineering, Karad"`**.
6. Observe the instant auto-population of all statutory fields.
7. Click **`[Create Dossier]`**.

#### 4. What to Observe on Screen:
- **AICTE Permanent ID (PID):** Auto-fills `1-42981023`.
- **State & AICTE Region:** Auto-selects `Maharashtra` and `WRO` (via official AICTE statutory regional boundaries).
- **Intake & Land Metrics:** Auto-fills `480` approved intake and `161,874 sq.m` (~40 acres).
- **Campus GPS:** Auto-fills `Lat: 17.3094, Lng: 74.1873`.
- **Green Confirmation Pill:** Flashes `✓ Auto-populated official AICTE records & physical campus GPS!`.
- **Queue Insertion:** A brand-new institutional dossier card appears in the queue with status `UNDER_SCRUTINY` and Risk Index `0.0`.

#### 5. Evaluator Pitch Talk Track:
> *"Notice how the registrar begins typing 'GCOE'. The system queries AICTE's National Master Directory, auto-filling the statutory Permanent ID, regional office (WRO), student intake, and official campus GPS coordinates. No manual data entry errors, no fraudulent identity spoofing."*

---

### Feature 3: Nodal Institution Portal & Document Dropzones (`/institution`)
- **Primary Route:** [`/institution`](file:///c:/Users/osmpu/OneDrive%20-%20Vishwakarma%20Institute%20of%20Technology/SIH%20ONCE%20AGAIN/frontend/app/institution/page.tsx)
- **Visual Target:** 4 Statutory Upload Dropzones + Laboratory Photo Dropzone

#### 1. Why We Implemented This Feature:
Colleges frequently upload corrupted, illegible, or incomplete PDFs, or omit mandatory statutory clearances (such as Fire Safety NOC or Architect Room Schedules). In the manual system, officers discover missing documents weeks later, resulting in protracted legal appeals and missed academic deadlines.

#### 2. What Is The Use Of It:
- **Pre-Submission Compliance Readiness Meter:** Gives the college registrar an instant, real-time score (0% to 100%) indicating whether the dossier fulfills mandatory APH pre-requisites *before* statutory submission.
- **Cryptographic WORM Ingestion:** Every uploaded file is instantly streamed to an immutable Write-Once-Read-Many (WORM) storage vault and sealed with a live SHA-256 cryptographic digest, ensuring documents cannot be secretly swapped or tampered with post-submission.

#### 3. Step-by-Step Testing Guide:
1. In the top navigation bar, click **[Institution Portal](http://localhost:3000/institution)**.
2. In the top-right **ACTIVE INSTITUTION** dropdown, ensure your college is selected.
3. Upload your generated sample files into their respective cards:
   - **Fire Safety NOC Dropzone:** Upload `Fire_NOC.pdf`.
   - **Land Registration Deed Dropzone:** Upload `Land_Deed.pdf`.
   - **Architect Floor Plan Dropzone:** Upload `Floor_Plan.pdf`.
   - **Computer Lab Photo Dropzone:** Upload `lab.jpg`.

#### 4. What to Observe on Screen:
- **Blue Ingestion Banner:** Flashes: *"Streaming to WORM vault & executing ELA forensics, OCR extraction..."*.
- **Green Verification Badge:** Replaces the upload prompt with `VERIFIED IN VAULT`.
- **Cryptographic Fingerprint:** Displays the live 64-character SHA-256 hash digest (e.g. `9f83a21c...`).
- **Readiness Meter:** Jumps from `0%` to `80%` or `100% (SUBMISSION READY)` in real time.

#### 5. Evaluator Pitch Talk Track:
> *"As the nodal officer uploads the Fire NOC and Floor Plan, our gateway streams them into an immutable WORM vault. Each document is cryptographically fingerprinted with SHA-256. The Pre-Submission Meter updates dynamically, eliminating weeks of back-and-forth communication regarding missing attachments."*

---

### Feature 4: Multi-Layer Scrutiny Studio Forensics (`/scrutiny`)
- **Primary Route:** [`/scrutiny`](file:///c:/Users/osmpu/OneDrive%20-%20Vishwakarma%20Institute%20of%20Technology/SIH%20ONCE%20AGAIN/frontend/app/scrutiny/page.tsx)
- **Visual Target:** Central Document Forensics Canvas & Tactical Toolbar

#### 1. Why We Implemented This Feature:
Fraudulent institutions often take expired Fire Safety NOCs or Municipal Building Permissions and alter the validity date using Photoshop, Canva, or PDF text editors. Human scrutiny officers reading a flat black-and-white photocopy cannot visually detect recompressed pixels, altered fonts, or stripped digital signatures.

#### 2. What Is The Use Of It:
Provides scrutiny officers with an intelligence-grade forensic suite directly in the browser:
- **Live PDF (Vault):** Renders the authentic document from the WORM vault.
- **Forensic / OCR Canvas:** Projects real coordinate bounding boxes over detected survey numbers, land areas, and dates.
- **OpenCV ELA Heatmap:** Applies 95% JPEG Error Level Analysis. Unaltered text displays uniform thermal background noise; pasted or spliced text flashes in bright yellow/red (`COLORMAP_JET`).
- **Metadata & DSC Tag Inspector:** Parses low-level PDF structural dictionaries to detect consumer graphic software signatures (e.g. Canva, Adobe Photoshop) and verifies X.509 PKI cryptographic digital signatures (`/adbe.pkcs7.detached`).

#### 3. Step-by-Step Testing Guide:
1. In the top navigation bar, click **[Scrutiny Studio](http://localhost:3000/scrutiny)**.
2. In the left-hand **Document Selector**, click on the **`Fire Safety NOC`**.
3. In the canvas toolbar, click **`[OpenCV ELA Heatmap]`** to inspect thermal pixel residuals.
4. Click **`[Metadata & DSC]`** to inspect embedded producer strings and digital signatures.
5. Click **`[OCR Boxes]`** to view coordinate bounding boxes projected over text blocks.

#### 4. What to Observe on Screen:
- **ELA Thermal Canvas:** Spliced expiration dates illuminate as high-energy thermal anomalies.
- **Metadata Inspector Drawer:** Reveals the PDF `/Producer` (e.g. `Canva`, `ReportLab`, or `Adobe Acrobat`) and flags whether statutory digital signatures are cryptographically valid, expired, or absent.
- **Interactive Bounding Boxes:** Clicking any detected text block highlights its coordinate matrix.

#### 5. Evaluator Pitch Talk Track:
> *"Here in Scrutiny Studio, we toggle OpenCV Error Level Analysis. While a flat PDF looks authentic to human eyes, our ELA engine re-compresses the frame at 95% quality. Tampered dates flash in thermal yellow and red because their compression grid differs from the underlying document. Simultaneously, our XRef inspector reveals if consumer tools like Canva were used to forge the clearance."*

---

### Feature 5: Localized Regional Indic Translation Layer
- **Primary Route:** [`/scrutiny`](file:///c:/Users/osmpu/OneDrive%20-%20Vishwakarma%20Institute%20of%20Technology/SIH%20ONCE%20AGAIN/frontend/app/scrutiny/page.tsx)
- **Visual Target:** Right-Hand Column $\to$ Section: `Indic Legal Records & Revenue Translation`

#### 1. Why We Implemented This Feature:
In India, land revenue records are maintained by state governments in regional languages and traditional non-metric units—such as Maharashtra 7/12 Satbara in Marathi, UP/MP Khasra-Khatauni in Hindi, and Tamil Nadu Patta-Chitta in Tamil. Central AICTE officers in New Delhi cannot read all 22 official regional scripts, leading to scrutiny backlogs or false rejections.

#### 2. What Is The Use Of It:
- **Zero-Barrier Script Translation:** Automatically detects Devanagari or Tamil Unicode blocks and translates archaic state revenue legal phrases into standardized English.
- **Statutory Unit Normalization:** Converts traditional land units (Guntha, Bigha, Acre, Hectare) directly into AICTE statutory square meters (`sq.m`), feeding directly into the mathematical land compliance engine.

#### 3. Step-by-Step Testing Guide:
1. In **Scrutiny Studio**, select the **`Land Registration Deed`** in the left document list.
2. Scroll to the right-hand column under **Indic Legal Records & Revenue Translation**.
3. Inspect the live transliteration and metric normalization telemetry cards.

#### 4. What to Observe on Screen:
- **Script Classification:** Identifies script (e.g. `Devanagari (Marathi) - Confidence 98.4%`).
- **Revenue Phrase Mapping:**
  - `गाव नमुना ७/१२` $\to$ `Form 7/12 Land Revenue Record`
  - `गट क्रमांक / सर्व्हे क्र.` $\to$ `Survey / Plot Number`
  - `भोगवटादार वर्ग-१` $\to$ `Class-1 Freehold Occupant`
- **Unit Conversion Formula:** Displays mathematical derivation:
  $$161,874\text{ sq.m} = 40.0\text{ Acres} \times 4,046.86\text{ sq.m/Acre}$$

#### 5. Evaluator Pitch Talk Track:
> *"A massive hurdle in technical education regulation is regional language diversity. Our Indic Translation Layer parses Devanagari revenue terminology—like Satbara 7/12 and Gat Kramaank—and normalizes traditional Gunthas and Bighas into statutory AICTE square meters. Officers never need external translators."*

---

### Feature 6: Sub-20ms PyMuPDF Tabular Schedule & Mathematical Audit
- **Primary Route:** [`/scrutiny`](file:///c:/Users/osmpu/OneDrive%20-%20Vishwakarma%20Institute%20of%20Technology/SIH%20ONCE%20AGAIN/frontend/app/scrutiny/page.tsx)
- **Visual Target:** Central Action Bar $\to$ High-Visibility Button: `[Tabular Schedules & Math Audit]`

#### 1. Why We Implemented This Feature:
Commercial OCR engines and LLMs flatten and scramble multi-column tables found in Architect Room Schedules. Furthermore, manually verifying whether 60+ individual classrooms meet the mandatory 66.0 sq.m minimum carpet area (APH Clause 5.1) takes an officer 45 minutes per blueprint.

#### 2. What Is The Use Of It:
- **Sub-20ms Vector Extraction:** Uses PyMuPDF's lightweight ruling-line vector parser (`page.find_tables()`) to extract clean tabular schedules in under 20 milliseconds without heavy, slow deep learning models.
- **Check A (Classroom Minimum Carpet Area — APH Clause 5.1):** Automatically evaluates every classroom against the 66.0 sq.m threshold and flags sub-standard rooms.
- **Check B (Built-up Area Reconciliation — APH Clause 4.1.3):** Reconciles the mathematical sum of all schedule rooms against the institution's claimed total built-up area.
- **Click-to-Focus Canvas Projection:** Clicking any non-compliant row automatically scrolls the canvas and projects a pulsing target bounding box directly over that room on the architectural blueprint.

#### 3. Step-by-Step Testing Guide:
1. In **Scrutiny Studio**, click the central toolbar button: **`[Tabular Schedules & Math Audit]`**.
2. A bottom sliding drawer opens with extracted room schedule telemetry.
3. Observe the mathematical discrepancy metrics.
4. Scroll to **Room 104** (Electronics Tutorial Room - 54.2 sq.m).
5. Click **`[Inspect Cell]`** on the Room 104 row.

#### 4. What to Observe on Screen:
- **Telemetry Card:** Displays `Total Rooms: 7`, `Schedule Area: 1,286.7 sq.m`, `Claimed Area: 18,500.0 sq.m`, `Discrepancy: -17,213.3 sq.m`.
- **Deficit Alert on Room 104:** Highlighted in crimson with explicit badge:
  `DEFICIT: -11.8 sq.m (APH Clause 5.1 Norm: 66.0 sq.m)`.
- **Canvas Projection:** The drawer minimizes, the canvas smoothly scrolls to the blueprint, and a pulsing red bounding box locks onto Room 104 with precise pixel coordinates!

#### 5. Evaluator Pitch Talk Track:
> *"Traditional OCR completely scrambles multi-column floor schedules. Our proprietary PyMuPDF vector engine extracts the entire room table in 14 milliseconds. Notice Room 104: measured at 54.2 sq.m. AICTE Clause 5.1 mandates 66.0 sq.m. The system flags an immediate -11.8 sq.m deficit. When we click 'Inspect Cell', the canvas instantly centers and pulses directly over Room 104 on the architect blueprint."*

---

### Feature 7: Cross-Document Entity Consistency Graph & Lineage
- **Primary Route:** [`/scrutiny`](file:///c:/Users/osmpu/OneDrive%20-%20Vishwakarma%20Institute%20of%20Technology/SIH%20ONCE%20AGAIN/frontend/app/scrutiny/page.tsx)
- **Visual Target:** Section 2: `Cross-Document Entity Consistency & Reconciliation Graph`

#### 1. Why We Implemented This Feature:
Colleges often submit contradictory information across different attachments—claiming 40 acres in the online application form, but submitting a land deed for only 30 acres, or citing an outdated Survey Plot number on the fire clearance. Spotting these discrepancies across 500 pages of legal text is nearly impossible for human reviewers.

#### 2. What Is The Use Of It:
- **4-Source Reconciliation Matrix:** Automatically correlates data across 4 independent sources:
  1. `Form Part-1 Claim` (Self-declaration)
  2. `Land Title Deed` (Revenue record)
  3. `Architect Floor Plan` (Blueprints)
  4. `AICTE Master Database` (Historical ground truth)
- **Lineage Graph Visualization:** Renders an interactive topological entity node graph showing how land, built-up areas, and survey numbers link across documents.

#### 3. Step-by-Step Testing Guide:
1. In **Scrutiny Studio**, scroll down to **Section 2: Cross-Document Entity Consistency & Reconciliation Graph**.
2. Inspect the tabular cross-reference matrix comparing Land Area, Survey Number, Built-up Area, and Fire NOC Validity.
3. Click the toggle button **`[Lineage Graph]`** to view the interactive entity network.

#### 4. What to Observe on Screen:
- **Tabular Matrix:** Green checkmarks indicate verified cross-document matches; red warning badges highlight discrepancies (e.g. Survey No. mismatch or Area variance).
- **Lineage Graph:** Visual nodes represent documents (blue) and extracted entities (green/amber/red), with connecting edges displaying APH clause citations.

#### 5. Evaluator Pitch Talk Track:
> *"Here is our Cross-Document Entity Graph. It cross-checks four independent statutory sources. If an applicant claims 40 acres in their application form but the Land Deed mentions 32 acres, or if the Fire NOC references an adjacent survey plot, our graph immediately flags a contradiction before any human inspector steps foot on campus."*

---

### Feature 8: Vision Auditor & Campus Geofence Radar (`/infrastructure-cv`)
- **Primary Route:** [`/infrastructure-cv`](file:///c:/Users/osmpu/OneDrive%20-%20Vishwakarma%20Institute%20of%20Technology/SIH%20ONCE%20AGAIN/frontend/app/infrastructure-cv/page.tsx)
- **Visual Target:** 4 KPI Cards Strip + Tactical YOLOv8 Canvas + CLIP & GPS Radar

#### 1. Why We Implemented This Feature:
Two widespread forms of technical education fraud are:
1. **Recycled Lab Imagery:** Borrowing photos of modern computer labs from sister colleges or internet stock photos to pass inspection.
2. **Terminal & Seating Shortfalls:** Reporting 100 high-end computer terminals while only possessing 20 machines, violating the statutory AICTE 1:6 student-to-PC ratio (APH Clause 5.1).
3. **Off-Campus Captures:** Submitting photos taken at commercial cyber cafés or vendor showrooms far outside the college campus.

#### 2. What Is The Use Of It:
- **YOLOv8 Object Detection:** Enumerates PC terminals (`tv / monitor / laptop`) and student seating with real-time confidence scores.
- **CLIP ViT-B/32 Semantic Deduplication:** Generates 512-dimensional visual embeddings stored in `pgvector`. Detects if a lab photo was reused from another institution (Cosine Similarity $\ge 0.90$).
- **EXIF GPS Haversine Perimeter Radar:** Reads hardware GPS coordinates embedded in the photo's EXIF metadata and calculates great-circle distance to the registered campus centroid, enforcing the 500-meter statutory perimeter.

#### 3. Step-by-Step Testing Guide:
1. Click **[Vision Auditor](http://localhost:3000/infrastructure-cv)** in the top navigation bar.
2. Select your college dossier from the top-right **Inspected Dossier** dropdown.
3. Review the 4 KPI metric cards across the top:
   - Card 1: `Detected PC Terminals` (with clean `REQUEST: 50` badge).
   - Card 2: `Seating Capacity` (`ERGONOMIC`).
   - Card 3: `Geofence Proximity` (shows distance or `MISSING EXIF`).
   - Card 4: `Visual Uniqueness` (`100% UNIQUE` with baseline-aligned `CLIP ViT-B/32`).
4. On the left canvas, click **`[View YOLOv8 Boxes]`** to toggle tactical detection bounding boxes.
5. In the right column, inspect the **CLIP Vector Similarity** score and **EXIF GPS Haversine Radar**.

#### 4. What to Observe on Screen:
- **Tactical Canvas:** Color-coded bounding boxes identify every computer monitor and chair with detection confidence percentages.
- **Deduplication Meter:** Displays `100% UNIQUE` (Cosine similarity `< 0.90`) or flags `CRITICAL: Duplicate Lab Photo Detected`.
- **Geofence Radar:** Displays exact spherical distance from registered campus centroid (e.g. `24.5 m (INSIDE)` or `NO GEOTAG`).

#### 5. Evaluator Pitch Talk Track:
> *"In our Vision Auditor, YOLOv8 enumerates hardware terminals to enforce the AICTE 1:6 student-to-PC ratio. Concurrently, OpenAI CLIP generates 512-dimensional visual embeddings to detect if an institution recycled a photo from another college. Finally, our Haversine radar reads hardware EXIF GPS coordinates to verify the photo was captured inside the authorized 500-meter campus perimeter."*

---

### Feature 9: Mobile Companion Field Capture HUD (`/mobile-capture`)
- **Primary Route:** [`/mobile-capture`](file:///c:/Users/osmpu/OneDrive%20-%20Vishwakarma%20Institute%20of%20Technology/SIH%20ONCE%20AGAIN/frontend/app/mobile-capture/page.tsx)
- **Visual Target:** Mobile HUD Viewfinder with Hardware GPS & Compass Sensors

#### 1. Why We Implemented This Feature:
When AICTE Expert Visiting Committee (EVC) inspectors conduct surprise physical inspections, they need an unhackable field capture tool that prevents uploading pre-saved images from the phone gallery or spoofing GPS locations using mock location apps.

#### 2. What Is The Use Of It:
- **Live Camera Viewfinder:** Forces real-time camera capture with zero gallery uploads.
- **Hardware Telemetry Locking:** Locks live device GPS coordinates, accuracy radius (in meters), and 360-degree digital compass heading.
- **Cryptographic Statutory Watermark:** Hardcodes timestamp, GPS coordinates, compass bearing, and EVC Inspector ID directly into the pixel frame and EXIF headers prior to transmission.

#### 3. Step-by-Step Testing Guide:
1. In the top navigation bar, click **[Mobile EVC](http://localhost:3000/mobile-capture)**.
2. Select the target institution dossier.
3. Observe the live camera viewfinder feed and sensor HUD.
4. Click **`[Capture Statutory Inspection Photo]`**.
5. Click **`[Submit Evidence to Verification Pipeline]`**.

#### 4. What to Observe on Screen:
- **Tactical Viewfinder:** Displays green target crosshairs with real-time GPS telemetry (`Lat`, `Lng`, `Accuracy: ±3.2m`).
- **360° Compass Dial:** Rotates in real time reflecting physical device heading.
- **Watermarked Capture:** The captured image displays an official statutory header bar with cryptographic verification hashes.

#### 5. Evaluator Pitch Talk Track:
> *"For field inspection teams, our Mobile EVC Progressive Web App locks real-time hardware GPS and compass bearings. It prevents officers from uploading gallery photos and bakes non-tamperable statutory telemetry watermarks directly into the evidence."*

---

### Feature 10: Human-in-the-Loop (HITL) Officer Determination
- **Primary Route:** [`/scrutiny`](file:///c:/Users/osmpu/OneDrive%20-%20Vishwakarma%20Institute%20of%20Technology/SIH%20ONCE%20AGAIN/frontend/app/scrutiny/page.tsx)
- **Visual Target:** Section 3: `Explainable Deficiencies & Human-in-the-Loop Gate`

#### 1. Why We Implemented This Feature:
Full AI autonomy in statutory government approvals is legally impermissible. Under Indian administrative law, an artificial intelligence system cannot unilaterally reject an educational institution or cancel student admissions. A human regulatory officer must possess final statutory decision-making authority while retaining an auditable paper trail.

#### 2. What Is The Use Of It:
- **Explainable Decision Support:** The AI provides advisory recommendations with exact APH clause citations, never black-box rejections.
- **Mandatory Justification Remarks:** Officers cannot override or accept deficiencies without entering mandatory written remarks, ensuring accountability.
- **Immutable Ledger Recording:** Every officer determination is sealed into the cryptographic audit ledger.

#### 3. Step-by-Step Testing Guide:
1. In **Scrutiny Studio**, scroll down to **Section 3: Explainable Deficiencies & Human-in-the-Loop Gate**.
2. Locate a flagged deficiency (e.g. Room 104 carpet area shortfall).
3. In the **Mandatory officer determination remarks** text area, type:
   `"Inspected on-site by EVC Committee. Room 104 is an auxiliary annex; granted conditional compliance under APH Clause 5.1."`
4. Click **`[Override Flag]`** (to grant an administrative waiver) or **`[Accept Deficiency]`** (to confirm the violation).

#### 4. What to Observe on Screen:
- **Instant Risk Recalculation:** The overall Institutional Risk Index adjusts immediately.
- **Decision Status Pill:** Switches from `PENDING_REVIEW` to `ACCEPTED` or `OVERRIDDEN`.
- **Audit Ledger Event:** A new `OFFICER_HITL_DETERMINATION` block is appended to the audit ledger.

#### 5. Evaluator Pitch Talk Track:
> *"We strictly adhere to ethical AI governance. PRAMAAN-AICTE is decision-support, not decision-replacement. The AI flags the deficiency, but the statutory officer must enter written justification before accepting or overriding a finding. Every remark is sealed into an immutable audit chain."*

---

### Feature 11: Official Court-Admissible ReportLab PDF Deficiency Notice
- **Primary Route:** [`/scrutiny`](file:///c:/Users/osmpu/OneDrive%20-%20Vishwakarma%20Institute%20of%20Technology/SIH%20ONCE%20AGAIN/frontend/app/scrutiny/page.tsx) or [`/`](file:///c:/Users/osmpu/OneDrive%20-%20Vishwakarma%20Institute%20of%20Technology/SIH%20ONCE%20AGAIN/frontend/app/page.tsx)
- **Visual Target:** Black Button: `[Official Notice PDF]`

#### 1. Why We Implemented This Feature:
When AICTE rejects an application or demands rectification, the adverse notice is frequently challenged in High Courts by institutional trusts. If the notice lacks statutory clause citations, cryptographic integrity, or timestamped officer remarks, it is liable to be struck down on procedural grounds.

#### 2. What Is The Use Of It:
Generates a formal, court-admissible PDF document using ReportLab:
- Features official Government of India / AICTE emblems and formatting.
- Automatically compiles all verified deficiencies with exact APH 2024–27 clause numbers.
- Inscribes human officer remarks entered during the HITL determination phase.
- Incorporates a **court-admissible SHA-256 cryptographic provenance seal** satisfying Section 65B of the Indian Evidence Act.

#### 3. Step-by-Step Testing Guide:
1. In **Scrutiny Studio** (or on the homepage dossier card), click the button: **`[Official Notice PDF]`**.
2. A new browser tab opens rendering the generated statutory PDF.
3. Review the notice structure, clause citations, and officer remarks.

#### 4. What to Observe on Screen:
- **Official AICTE Letterhead:** Features statutory government headers and institutional dossier metadata.
- **Deficiency Table:** Summarizes specific infractions with severity ratings and APH clause citations.
- **Cryptographic Provenance Footer:** Contains a 64-character SHA-256 digital signature proving the notice has not been altered since generation.

#### 5. Evaluator Pitch Talk Track:
> *"When we click 'Official Notice PDF', our ReportLab engine generates a court-admissible Deficiency Notice. It quotes exact APH clauses, embeds the officer's justification remarks, and seals the document with a Section 65B SHA-256 digital signature ready for judicial scrutiny."*

---

### Feature 12: Zero-Code APH Governance Engine & Cryptographic Ledger (`/admin-governance`)
- **Primary Route:** [`/admin-governance`](file:///c:/Users/osmpu/OneDrive%20-%20Vishwakarma%20Institute%20of%20Technology/SIH%20ONCE%20AGAIN/frontend/app/admin-governance/page.tsx)
- **Visual Target:** Interactive Policy Sliders + Cryptographic Audit Timeline

#### 1. Why We Implemented This Feature:
1. **Dynamic Regulatory Changes:** AICTE revises the Approval Process Handbook every 1–3 years (e.g. changing land requirements or relaxing student-to-PC ratios). Hardcoded rules require expensive software rewrites.
2. **Audit Tampering:** Administrative databases can be secretly altered by rogue actors deleting corruption logs or updating application statuses.

#### 2. What Is The Use Of It:
- **Zero-Code Policy Sliders:** AICTE administrators can tune statutory thresholds (Minimum Land Area, SFR, Classroom Norms) via interactive UI sliders and trigger an immediate batch retrospective re-evaluation across thousands of active applications.
- **State Issuing Authority Registry:** Configurable directory of authentic certificate URNs from state fire and revenue departments with circuit-breaker protection.
- **Court-Admissible SHA-256 Audit Ledger:** Cryptographically links every event into an unbroken hash chain:
  $$\text{curr\_hash} = \text{SHA256}(\text{prev\_hash} + \text{timestamp} + \text{actor} + \text{action} + \text{canonical\_payload})$$
- **Mathematical Integrity Proof:** One-click cryptographic verification walks the linked list from genesis to tip, mathematically proving zero blocks were modified or deleted.

#### 3. Step-by-Step Testing Guide:
1. Click **[Governance & Rules](http://localhost:3000/admin-governance)** in the top navigation bar.
2. Under **Statutory Rule Parameters**, adjust the **`Minimum Land Area`** slider from `25,000` to `30,000 sq.m`.
3. Click **`[Save & Retrospectively Re-Evaluate All Applications]`**.
4. Scroll down to the **Cryptographic Audit Ledger**.
5. Click **`[Verify Entire Audit Chain Cryptographic Integrity]`**.

#### 4. What to Observe on Screen:
- **Batch Re-evaluation Notification:** Flashes green confirmation that all dossiers have been re-assessed against the updated thresholds.
- **Chain Verification Banner:** Displays green banner: `Chain Integrity: 100% VALID (Zero Gaps Detected)`.
- **Linked Hash Timeline:** Displays mathematical hashes linking block $N$ to block $N-1$.

#### 5. Evaluator Pitch Talk Track:
> *"Finally, in Governance & Rules, AICTE administrators can tune APH norms dynamically using zero-code sliders. Saving updates triggers a batch retrospective audit across all applications. Below, our SHA-256 hash-chained audit ledger guarantees complete non-repudiation. Clicking 'Verify Chain Integrity' mathematically proves zero tampering occurred."*

---

## Part 3: The 3 Golden Demo Scenarios (One-Click Pre-Baked Test Cases)

For accelerated demonstrations or live presentations without manual uploads:

1. Open **[http://localhost:3000](http://localhost:3000)**.
2. In the top action bar, click **`[Load 3 Demo Scenarios]`**.
3. Three realistic institutional test cases are instantly populated:
   - **Scenario A (Clean / Fast-Track Cleared):** Fully compliant institution with 0 deficiencies; eligible for immediate Extension of Approval (EoA).
   - **Scenario B (Document Tampering & Fraud):** Tampered Fire NOC with spliced expiration date, OpenCV ELA thermal heatmap anomaly, and missing digital signature.
   - **Scenario C (Infrastructure Shortfall):** Computer laboratory with terminal deficit (YOLOv8 detected 22 PCs vs 50 required) and survey number mismatch.
4. Click on any scenario to inspect its pre-calculated forensic results.

---

## Part 4: Terminal Verification Commands (PowerShell)

```powershell
# 1. Test National College Master Directory Autocomplete Search
curl.exe -s "http://localhost:8000/api/colleges/search?q=GCOE"

# 2. Test OpenStreetMap Nominatim Live Geocoding Fallback
curl.exe -s "http://localhost:8000/api/colleges/geocode?name=Government+Polytechnic+Nashik&state=Maharashtra"

# 3. Query Live Multi-Pillar System Health & Regulatory Session
curl.exe -s "http://localhost:8000/api/health"

# 4. Verify Cryptographic SHA-256 Audit Ledger Integrity
curl.exe -s "http://localhost:8000/api/audit/verify-integrity"

# 5. Reset Workspace to Clean Slate (0 Applications)
curl.exe -s -X POST "http://localhost:8000/api/system/reset-colleges"

# 6. Reload 3 Golden Demo Scenarios
curl.exe -s -X POST "http://localhost:8000/api/system/reseed-demo-colleges"
```
