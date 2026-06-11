from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=8)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class BaselineRequest(BaseModel):
    gender: str
    age: int
    height_cm: float
    current_weight_kg: float
    target_weight_kg: float | None = None
    fitness_goal: str


class MetricsRequest(BaseModel):
    sex: str = "male"
    height_cm: float
    weight_kg: float
    goal_body_fat: float = 14
    neck_cm: float | None = None
    waist_cm: float | None = None
    hips_cm: float | None = None


class ReportRequest(BaseModel):
    weight_kg: float
    body_fat_percent: float | None = None
    shoulder_waist_ratio: float | None = None
    previous_shoulder_waist_ratio: float | None = None
    notes: str | None = None


class ProductPayload(BaseModel):
    slug: str
    name: str
    description: str | None = None
    price_inr: int
    pdf_url: str | None = None
    active: bool = True


class OrderCreateRequest(BaseModel):
    product_slug: str
    name: str
    email: EmailStr
    whatsapp: str | None = None
    utr_id: str | None = None
    payment_screenshot_url: str | None = None


class PaymentConfirmRequest(BaseModel):
    order_id: str
    status: str = "Verified"
    utr_id: str | None = None
    payment_screenshot_url: str | None = None
    admin_note: str | None = None
