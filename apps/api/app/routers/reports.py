from io import BytesIO

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/latest.pdf")
def latest_pdf():
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    pdf.setTitle("Physique Meter AI Report")
    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(72, 740, "Physique Meter AI Report")
    pdf.setFont("Helvetica", 11)
    pdf.drawString(72, 710, "Summary: Shoulder-to-waist ratio is improving. Focus on upper chest development.")
    pdf.drawString(72, 690, "Strengths: Consistency, shoulder width, weight trend.")
    pdf.drawString(72, 670, "Suggested focus: Incline pressing, lateral raises, standardized weekly photos.")
    pdf.save()
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=physique-meter-report.pdf"}
    )
