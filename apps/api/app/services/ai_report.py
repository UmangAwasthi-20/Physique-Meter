from .vision import VisionMetrics
from ..config import settings


def build_ai_report(metrics: dict, vision: VisionMetrics | None = None) -> dict:
    ratio = metrics.get("shoulder_waist_ratio") or (vision.shoulder_waist_ratio if vision else None)
    previous = metrics.get("previous_shoulder_waist_ratio")

    context = {
        "weight_kg": metrics.get("weight_kg"),
        "body_fat_percent": metrics.get("body_fat_percent"),
        "shoulder_waist_ratio": ratio,
        "previous_shoulder_waist_ratio": previous,
        "notes": metrics.get("notes")
    }

    if settings.gemini_api_key:
      try:
        import google.generativeai as genai
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = (
            "Create a concise physique progress report with summary, strengths, "
            "weaknesses, suggested focus areas, and weekly progress summary. "
            f"Use this data: {context}"
        )
        response = model.generate_content(prompt)
        summary = response.text.strip()
      except Exception:
        summary = fallback_summary(ratio, previous)
    else:
        summary = fallback_summary(ratio, previous)

    return {
        "summary": summary,
        "strengths": ["Improving consistency", "Clear baseline tracking", "Goal-oriented progress"],
        "weaknesses": ["Upper chest and posterior-chain detail need more evidence", "Progress photos should be standardized"],
        "focus_areas": ["Weekly front/side/back photos", "Incline pressing", "Protein consistency", "Waist measurement trend"],
        "weekly_summary": "Weight and visual proportions should be reviewed weekly against the previous upload."
    }


def fallback_summary(ratio: float | None, previous: float | None) -> str:
    if ratio and previous and ratio > previous:
        return (
            "Your shoulder-to-waist ratio appears improved compared to the previous upload. "
            "Upper chest development is lagging behind shoulder development, so prioritize incline work."
        )
    return (
        "Your baseline is captured. Keep photo angles, lighting, and distance consistent so future "
        "AI reports can compare shoulder width, waist taper, and muscle balance more accurately."
    )
