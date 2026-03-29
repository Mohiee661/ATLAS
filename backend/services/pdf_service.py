import pdfplumber
import io

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extracts text from a sequence of bytes (PDF)."""
    text = ""
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            extracted_text = page.extract_text()
            if extracted_text:
                text += extracted_text + "\n"
    return text.strip()
