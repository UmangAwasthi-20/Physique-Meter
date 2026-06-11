from math import log10


def clamp(value: float, minimum: float, maximum: float) -> float:
    return min(maximum, max(minimum, value))


def estimate_measurements(sex: str, height_cm: float, weight_kg: float) -> dict:
    bmi = weight_kg / ((height_cm / 100) ** 2)
    neck = height_cm * (0.22 if sex == "male" else 0.19)
    if sex == "male":
        waist = height_cm * (0.43 + max(0, bmi - 22) * 0.008)
        hips = height_cm * 0.52
    else:
        waist = height_cm * (0.39 + max(0, bmi - 21) * 0.008)
        hips = height_cm * (0.55 + max(0, bmi - 21) * 0.006)

    return {
        "neck_cm": round(neck),
        "waist_cm": round(waist),
        "hips_cm": round(hips)
    }


def calculate_physique(payload: dict) -> dict:
    sex = payload.get("sex", "male")
    height = float(payload["height_cm"])
    weight = float(payload["weight_kg"])
    goal = float(payload.get("goal_body_fat", 14))
    estimated = estimate_measurements(sex, height, weight)
    neck = float(payload.get("neck_cm") or estimated["neck_cm"])
    waist = float(payload.get("waist_cm") or estimated["waist_cm"])
    hips = float(payload.get("hips_cm") or estimated["hips_cm"])

    if not 90 <= height <= 230:
        raise ValueError("height_cm must be between 90 and 230")
    if not 30 <= weight <= 260:
        raise ValueError("weight_kg must be between 30 and 260")

    if sex == "male":
        body_fat = 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
    else:
        body_fat = 495 / (1.29579 - 0.35004 * log10(waist + hips - neck) + 0.22100 * log10(height)) - 450

    body_fat = clamp(body_fat, 3, 60)
    bmi = weight / ((height / 100) ** 2)
    fat_mass_kg = weight * body_fat / 100
    lean_mass_kg = weight - fat_mass_kg
    target_weight_kg = lean_mass_kg / (1 - goal / 100)

    return {
        "body_fat": body_fat,
        "bmi": bmi,
        "fat_mass_kg": fat_mass_kg,
        "lean_mass_kg": lean_mass_kg,
        "target_weight_kg": target_weight_kg,
        "to_goal_kg": target_weight_kg - weight,
        "goal_body_fat": goal,
        "measurements": {
            "neck_cm": neck,
            "waist_cm": waist,
            "hips_cm": hips
        }
    }
