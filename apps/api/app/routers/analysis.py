from fastapi import APIRouter, File, UploadFile

from ..schemas import MetricsRequest, ReportRequest
from ..services.ai_report import build_ai_report
from ..services.physique import calculate_physique
from ..services.vision import analyze_progress_photo

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("/metrics")
def metrics(payload: MetricsRequest):
    result = calculate_physique({
        "sex": payload.sex,
        "height_cm": payload.height_cm,
        "weight_kg": payload.weight_kg,
        "goal_body_fat": payload.goal_body_fat,
        "neck_cm": payload.neck_cm,
        "waist_cm": payload.waist_cm,
        "hips_cm": payload.hips_cm
    })
    return {"ok": True, "metrics": result}


@router.post("/photo")
async def photo_analysis(file: UploadFile = File(...)):
    image_bytes = await file.read()
    vision = analyze_progress_photo(image_bytes)
    return {"ok": True, "vision": vision.__dict__}


@router.post("/report")
def ai_report(payload: ReportRequest):
    report = build_ai_report(payload.model_dump())
    return {"ok": True, "report": report}
