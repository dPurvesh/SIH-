"""
PRAMAAN AICTE - Regional Indic Translation & Entity Normalization Engine
Provides localized OCR parsing, script detection, Indic digit normalization,
and land measurement unit conversion for non-English Indian legal & revenue documents
(Marathi, Hindi, Tamil, Telugu, Gujarati, Kannada).
"""

import re
from typing import Dict, Any, List, Optional, Tuple

# Digit mapping tables
DEVANAGARI_DIGITS = str.maketrans("०१२३४५६७८९", "0123456789")
TAMIL_DIGITS = str.maketrans("௦௧௨௩௪௫௬௭௮௯", "0123456789")
GUJARATI_DIGITS = str.maketrans("૦૧૨૩૪૫૬૭૮૯", "0123456789")
BENGALI_DIGITS = str.maketrans("০১২৩৪৫৬৭৮৯", "0123456789")
TELUGU_DIGITS = str.maketrans("౦౧౨౩౪౫౬౭౮౯", "0123456789")
KANNADA_DIGITS = str.maketrans("೦೧೨೩೪೫೬೭೮೯", "0123456789")

# Unicode Script Ranges
SCRIPT_RANGES = {
    "Devanagari": (0x0900, 0x097F),
    "Tamil": (0x0B80, 0x0BFF),
    "Telugu": (0x0C00, 0x0C7F),
    "Kannada": (0x0C80, 0x0CFF),
    "Gujarati": (0x0A80, 0x0AFF),
    "Bengali": (0x0980, 0x09FF),
}

# Lexical markers for language differentiation within Devanagari
MARATHI_LEXICON = [
    "सातबारा", "उतारा", "गाव नमुना", "गट क्रमांक", "गट क्र", "सर्व्हे क्र",
    "तलाठी", "तहसीलदार", "गुंठा", "गुंठे", "हेक्टर", "आर", "हवेली", "पुणे",
    "महाराष्ट्र", "दाखला", "भोगवटा", "चौ.मी.", "चौरस मीटर", "महानगरपालिका",
    "नगर परिषद", "ग्रामपंचायत", "खरेदी खत", "अग्नि सुरक्षा", "ना-हरकत"
]

HINDI_LEXICON = [
    "खसरा", "खतौनी", "गाटा", "रकबा", "लेखपाल", "बीघा", "बिस्वा", "बैनामा",
    "उत्तर प्रदेश", "मध्य प्रदेश", "अनापत्ति", "तहसील", "वर्ग मीटर", "भूखंड",
    "नामांतरण", "प्रमाण पत्र", "अग्निशमन"
]

TAMIL_LEXICON = [
    "பட்டா", "சிட்டா", "புல எண்", "சர்வே எண்", "கிரயப் பத்திரம்",
    "வருவாய்த்துறை", "வட்டாட்சியர்", "சதுர மீட்டர்", "ஹெக்டேர்",
    "தடையில்லாச் சான்றிதழ்", "தீயணைப்பு", "மாவட்டம்"
]

def normalize_indic_digits(text: str) -> str:
    """Normalizes all Indic numerals (Devanagari, Tamil, etc.) to standard ASCII digits."""
    return (
        text.translate(DEVANAGARI_DIGITS)
            .translate(TAMIL_DIGITS)
            .translate(GUJARATI_DIGITS)
            .translate(BENGALI_DIGITS)
            .translate(TELUGU_DIGITS)
            .translate(KANNADA_DIGITS)
    )

def detect_script_and_language(raw_text: str) -> Dict[str, Any]:
    """
    Analyzes Unicode character distribution and vocabulary markers
    to determine script, language, and confidence.
    """
    if not raw_text:
        return {
            "is_regional": False,
            "detected_script": "Latin",
            "detected_language": "English",
            "confidence": 1.0,
            "char_counts": {}
        }

    char_counts: Dict[str, int] = {script: 0 for script in SCRIPT_RANGES}
    latin_count = 0

    for ch in raw_text:
        code = ord(ch)
        matched = False
        for script, (start, end) in SCRIPT_RANGES.items():
            if start <= code <= end:
                char_counts[script] += 1
                matched = True
                break
        if not matched and (0x0041 <= code <= 0x005A or 0x0061 <= code <= 0x007A):
            latin_count += 1

    char_counts["Latin"] = latin_count
    total_indic = sum(v for k, v in char_counts.items() if k != "Latin")

    if total_indic < 15:
        return {
            "is_regional": False,
            "detected_script": "Latin",
            "detected_language": "English",
            "confidence": 0.98,
            "char_counts": char_counts
        }

    # Find predominant Indic script
    predominant_script = max(SCRIPT_RANGES.keys(), key=lambda s: char_counts.get(s, 0))
    indic_ratio = total_indic / max(1, total_indic + latin_count)
    confidence = min(0.99, round(0.70 + (indic_ratio * 0.28), 2))

    detected_language = predominant_script
    if predominant_script == "Devanagari":
        # Distinguish between Marathi and Hindi based on revenue terms
        text_lower = raw_text.lower()
        marathi_hits = sum(1 for kw in MARATHI_LEXICON if kw in text_lower)
        hindi_hits = sum(1 for kw in HINDI_LEXICON if kw in text_lower)
        if marathi_hits > hindi_hits:
            detected_language = "Marathi"
        elif hindi_hits > marathi_hits:
            detected_language = "Hindi"
        else:
            detected_language = "Marathi / Hindi (Bilingual)"
    elif predominant_script == "Tamil":
        detected_language = "Tamil"

    return {
        "is_regional": True,
        "detected_script": predominant_script,
        "detected_language": detected_language,
        "confidence": confidence,
        "char_counts": char_counts
    }

def parse_regional_indic_entities(
    raw_text: str,
    blocks: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Parses non-English legal and revenue documents into unified English schema
    with mathematical area unit conversion and provenance records.
    """
    blocks = blocks or []
    lang_info = detect_script_and_language(raw_text)
    
    if not lang_info["is_regional"]:
        return {
            "is_regional": False,
            "detected_language": "English",
            "detected_script": "Latin",
            "translations": [],
            "extracted_entities": {}
        }

    # Normalize digits for regex processing while keeping original text intact
    norm_text = normalize_indic_digits(raw_text)
    translations: List[Dict[str, Any]] = []
    entities: Dict[str, Any] = {
        "survey_no": None,
        "land_area_sqm": None,
        "builtup_area_sqm": None,
        "expiry_date": None,
        "issue_date": None,
        "certificate_urn": None,
        "issuing_authority": None,
        "doc_type": None,
        "entity_bboxes": {}
    }

    def find_block_for_term(term: str) -> Optional[Dict[str, Any]]:
        norm_term = normalize_indic_digits(term).lower()
        for b in blocks:
            norm_b = normalize_indic_digits(b.get("text", "")).lower()
            if norm_term in norm_b or term in b.get("text", ""):
                return {
                    "page": b.get("page", 1),
                    "x": b.get("x", 0), "y": b.get("y", 0),
                    "w": b.get("w", 0), "h": b.get("h", 0),
                    "x_rel": b.get("x_rel", 0.1), "y_rel": b.get("y_rel", 0.3),
                    "w_rel": b.get("w_rel", 0.3), "h_rel": b.get("h_rel", 0.05)
                }
        return None

    # -------------------------------------------------------------------------
    # 1. Survey / Plot / Gat / Khasra Number Extraction
    # -------------------------------------------------------------------------
    survey_patterns = [
        # Marathi / Hindi Indic Script
        r'(?:गट\s*(?:क्रमांक|क्र\.?)|सर्व्हे\s*(?:क्रमांक|क्र\.?)|खाते\s*(?:क्रमांक|क्र\.?))\s*[:\-]?\s*([0-9\/\-\sA-Za-z]+)',
        r'(?:खसरा\s*(?:संख्या|क्रमांक|नं\.?)|गाटा\s*(?:संख्या|सं\.?)|भूखंड\s*(?:संख्या|सं\.?))\s*[:\-]?\s*([0-9\/\-\sA-Za-z]+)',
        r'(?:புல\s*எண்|சர்வே\s*எண்)\s*[:\-]?\s*([0-9\/\-\sA-Za-z]+)',
        # Transliterated Revenue Records (e.g. Gat No / Gat Kramank / Khasra No)
        r'(?:Gat\s*(?:Kramank|No\.?|Number|\/\s*Survey\s*No\.?)|Khasra\s*No\.?|Khatauni\s*No\.?)\s*[:\-]?\s*([0-9\/\-\sA-Za-z]+)',
        r'(?:Survey\s*No\.?|Plot\s*No\.?)\s*[:\-]?\s*([0-9\/\-\sA-Za-z]+)'
    ]

    for pat in survey_patterns:
        m = re.search(pat, norm_text)
        if m:
            raw_val = m.group(1).strip()
            # Clean up trailing spaces or punctuation
            val = re.split(r'[\n\r,]', raw_val)[0].strip()
            if len(val) >= 2 and not val.lower().startswith("दिनांक"):
                entities["survey_no"] = val
                original_phrase = m.group(0).strip()
                translations.append({
                    "field": "survey_no",
                    "original_term": original_phrase,
                    "translated_term": f"Plot / Survey No: {val}",
                    "source_language": lang_info["detected_language"],
                    "conversion_rule": "Direct Indic script numeral transliteration"
                })
                bbox = find_block_for_term(original_phrase) or find_block_for_term(val)
                if bbox:
                    entities["entity_bboxes"]["survey_no"] = bbox
                break

    # -------------------------------------------------------------------------
    # 2. Land Area Extraction with Unit Normalization
    # -------------------------------------------------------------------------
    # A) Maharashtra Standard: Hectare + Are (e.g. 0 हेक्टर 25 आर or 0.25 हेक्टर)
    # 1 Hectare = 10,000 sq.m; 1 Are = 100 sq.m
    m_hec_are = re.search(r'([0-9]+)\s*(?:हेक्टर|हे\.?)\s*([0-9\.]+)\s*(?:आर|आर\.?)', norm_text)
    if m_hec_are:
        hec = float(m_hec_are.group(1))
        are = float(m_hec_are.group(2))
        total_sqm = round((hec * 10000.0) + (are * 100.0), 2)
        entities["land_area_sqm"] = total_sqm
        translations.append({
            "field": "land_area_sqm",
            "original_term": m_hec_are.group(0),
            "translated_term": f"{total_sqm:,.1f} sq.m ({hec} Hectare {are} Are)",
            "source_language": "Marathi / Hindi",
            "conversion_rule": "1 Hectare = 10,000 sq.m; 1 Are = 100 sq.m (State Revenue Standard)"
        })
        bbox = find_block_for_term(m_hec_are.group(0))
        if bbox:
            entities["entity_bboxes"]["land_area_sqm"] = bbox

    # B) Are alone (e.g. 25 आर or २५ आर)
    if not entities["land_area_sqm"]:
        m_are = re.search(r'([0-9\.]+)\s*(?:आर|आर\.?)\s*(?:क्षेत्रफळ)?', norm_text)
        if m_are:
            are_val = float(m_are.group(1))
            total_sqm = round(are_val * 100.0, 2)
            entities["land_area_sqm"] = total_sqm
            translations.append({
                "field": "land_area_sqm",
                "original_term": m_are.group(0),
                "translated_term": f"{total_sqm:,.1f} sq.m ({are_val} Are)",
                "source_language": "Marathi / Hindi",
                "conversion_rule": "1 Are = 100 sq.m"
            })
            bbox = find_block_for_term(m_are.group(0))
            if bbox:
                entities["entity_bboxes"]["land_area_sqm"] = bbox

    # C) Guntha (e.g. 25 गुंठे) -> 1 Guntha = 101.171 sq.m
    if not entities["land_area_sqm"]:
        m_guntha = re.search(r'([0-9\.]+)\s*(?:गुंठा|गुंठे|गुं.)', norm_text)
        if m_guntha:
            g_val = float(m_guntha.group(1))
            total_sqm = round(g_val * 101.171, 2)
            entities["land_area_sqm"] = total_sqm
            translations.append({
                "field": "land_area_sqm",
                "original_term": m_guntha.group(0),
                "translated_term": f"{total_sqm:,.1f} sq.m ({g_val} Guntha)",
                "source_language": "Marathi",
                "conversion_rule": "1 Guntha = 101.171 sq.m (1,089 sq.ft)"
            })
            bbox = find_block_for_term(m_guntha.group(0))
            if bbox:
                entities["entity_bboxes"]["land_area_sqm"] = bbox

    # D) Bigha (Hindi revenue records: e.g. 1 बीघा or 1.5 बीघा) -> Standard 2,529.3 sq.m
    if not entities["land_area_sqm"]:
        m_bigha = re.search(r'([0-9\.]+)\s*(?:बीघा|विघा)', norm_text)
        if m_bigha:
            b_val = float(m_bigha.group(1))
            total_sqm = round(b_val * 2529.28, 2)
            entities["land_area_sqm"] = total_sqm
            translations.append({
                "field": "land_area_sqm",
                "original_term": m_bigha.group(0),
                "translated_term": f"{total_sqm:,.1f} sq.m ({b_val} Bigha)",
                "source_language": "Hindi",
                "conversion_rule": "1 Pucca Bigha = 2,529.28 sq.m (Revenue Standard)"
            })
            bbox = find_block_for_term(m_bigha.group(0))
            if bbox:
                entities["entity_bboxes"]["land_area_sqm"] = bbox

    # E) Tamil: Hectare / Square Meter / Kuzhi
    # 1 Kuzhi = 13.378 sq.m
    if not entities["land_area_sqm"]:
        m_tam_hec = re.search(r'([0-9\.]+)\s*ஹெக்டேர்', norm_text)
        if m_tam_hec:
            h_val = float(m_tam_hec.group(1))
            total_sqm = round(h_val * 10000.0, 2)
            entities["land_area_sqm"] = total_sqm
            translations.append({
                "field": "land_area_sqm",
                "original_term": m_tam_hec.group(0),
                "translated_term": f"{total_sqm:,.1f} sq.m ({h_val} Hectares)",
                "source_language": "Tamil",
                "conversion_rule": "1 Hectare = 10,000 sq.m"
            })
            bbox = find_block_for_term(m_tam_hec.group(0))
            if bbox:
                entities["entity_bboxes"]["land_area_sqm"] = bbox

    # F) Direct Square Meters in Regional Words: चौ.मी., चौरस मीटर, சதுர மீட்டர்
    if not entities["land_area_sqm"]:
        m_sqm = re.search(r'([0-9,\.]+)\s*(?:चौ\.?\s*मी|चौरस\s*मीटर|वर्ग\s*मीटर|சதுர\s*மீட்டர்)', norm_text)
        if m_sqm:
            try:
                sqm_val = float(m_sqm.group(1).replace(",", ""))
                entities["land_area_sqm"] = sqm_val
                translations.append({
                    "field": "land_area_sqm",
                    "original_term": m_sqm.group(0),
                    "translated_term": f"{sqm_val:,.1f} sq.m",
                    "source_language": lang_info["detected_language"],
                    "conversion_rule": "Direct regional script metric unit"
                })
                bbox = find_block_for_term(m_sqm.group(0))
                if bbox:
                    entities["entity_bboxes"]["land_area_sqm"] = bbox
            except ValueError:
                pass

    # -------------------------------------------------------------------------
    # 3. Validity & Expiry Dates
    # -------------------------------------------------------------------------
    date_patterns = [
        r'(?:वैधता|कालावधी|मुदत\s*समाप्ती|செல்லுபடியாகும்\s*தேதி)\s*[:\-]?\s*(?:पर्यंत)?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})',
        r'दिनांक\s*[:\-]?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})'
    ]
    for pat in date_patterns:
        m_date = re.search(pat, norm_text)
        if m_date:
            date_str = m_date.group(1).strip()
            entities["expiry_date"] = date_str
            translations.append({
                "field": "expiry_date",
                "original_term": m_date.group(0),
                "translated_term": f"Validity / Expiry: {date_str}",
                "source_language": lang_info["detected_language"],
                "conversion_rule": "Indic date string normalized to DD/MM/YYYY"
            })
            bbox = find_block_for_term(m_date.group(0))
            if bbox:
                entities["entity_bboxes"]["expiry_date"] = bbox
            break

    # -------------------------------------------------------------------------
    # 4. Issuing Authority Regional Mapping
    # -------------------------------------------------------------------------
    authority_mappings = [
        ("तहसीलदार कार्यालय", "Office of the Tehsildar (State Revenue Authority)"),
        ("उपविभागीय अधिकारी", "Sub-Divisional Officer (SDO / Sub-Collector)"),
        ("जिल्हाधिकारी कार्यालय", "Office of the District Collector"),
        ("महानगरपालिका", "Municipal Corporation (Mahanagarpalika)"),
        ("नगर परिषद", "Municipal Council (Nagar Parishad)"),
        ("ग्रामपंचायत", "Village Gram Panchayat (Local Authority)"),
        ("अग्निशामक सेवा संचालनालय", "Directorate of Fire & Emergency Services"),
        ("अग्निशमन विभाग", "Fire & Rescue Services Department"),
        ("வட்டாட்சியர் அலுவலகம்", "Office of the Tahsildar (Revenue Dept)"),
        ("வருவாய்த்துறை", "Department of Revenue Administration"),
        ("தீயணைப்பு மற்றும் மீட்புப்பணிகள்", "Fire and Rescue Services Directorate"),
        ("Tehsildar", "Office of the Tehsildar (State Revenue Authority)"),
        ("Tahsildar", "Office of the Tahsildar (Revenue Dept)"),
        ("MahaBhumi", "MahaBhumi Land Records Directorate (Govt of Maharashtra)"),
    ]

    for regional_phrase, eng_translation in authority_mappings:
        if regional_phrase in raw_text:
            entities["issuing_authority"] = eng_translation
            translations.append({
                "field": "issuing_authority",
                "original_term": regional_phrase,
                "translated_term": eng_translation,
                "source_language": lang_info["detected_language"],
                "conversion_rule": "Statutory Authority Gazette Lexicon"
            })
            bbox = find_block_for_term(regional_phrase)
            if bbox:
                entities["entity_bboxes"]["issuing_authority"] = bbox
            break

    # -------------------------------------------------------------------------
    # 5. Document Type Regional Identification
    # -------------------------------------------------------------------------
    doc_type_mappings = [
        ("गाव नमुना ७/१२", "Form 7/12 Land Revenue Record (Satbara Utara)"),
        ("सातबारा उतारा", "Form 7/12 Land Revenue Record (Satbara Utara)"),
        ("खरेदी खत", "Registered Land Sale Deed"),
        ("विक्री पत्र", "Registered Land Conveyance / Sale Deed"),
        ("खसरा", "Khasra Land Title Record"),
        ("खतौनी", "Khatauni Revenue Ownership Record"),
        ("अग्नि सुरक्षा ना-हरकत", "Fire Safety NOC"),
        ("भोगवटा प्रमाणपत्र", "Occupancy Certificate"),
        ("बांधकाम पूर्णत्वाचा दाखला", "Building Completion Certificate"),
        ("பட்டா", "Patta Land Ownership Record"),
        ("சிட்டா", "Chitta Revenue Record"),
        ("தடையில்லாச் சான்றிதழ்", "No Objection Certificate (NOC)"),
    ]

    for regional_type, eng_type in doc_type_mappings:
        if regional_type in raw_text:
            entities["doc_type"] = eng_type
            translations.append({
                "field": "doc_type",
                "original_term": regional_type,
                "translated_term": eng_type,
                "source_language": lang_info["detected_language"],
                "conversion_rule": "State Statutory Registry Classification"
            })
            break

    return {
        "is_regional": True,
        "detected_script": lang_info["detected_script"],
        "detected_language": lang_info["detected_language"],
        "language_confidence": lang_info["confidence"],
        "translations": translations,
        "extracted_entities": entities
    }
