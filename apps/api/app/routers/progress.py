from fastapi import APIRouter

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("/history")
def history():
    return {
        "ok": True,
        "entries": [
            {"week": "Week 1", "weight_kg": 84.4, "body_fat_percent": 20.1},
            {"week": "Week 4", "weight_kg": 83.1, "body_fat_percent": 18.9},
            {"week": "Today", "weight_kg": 82.0, "body_fat_percent": 17.6}
        ]
    }
