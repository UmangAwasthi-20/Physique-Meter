from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from ..config import settings
from ..schemas import OrderCreateRequest, PaymentConfirmRequest, ProductPayload
from ..services.google_sheets import append_lead_to_sheet
from ..services.pdf_storage import resolve_pdf_url, storage_provider_status

router = APIRouter(prefix="/commerce", tags=["commerce"])

PRODUCTS = {
    "weight-gain-shake-pdf": {
        "slug": "weight-gain-shake-pdf",
        "name": "Weight Gain Shake PDF",
        "description": "High-calorie shake recipes for clean weight gain and daily consistency.",
        "price_inr": 49,
        "pdf_url": "https://drive.google.com/example-weight-gain-shake.pdf",
        "active": True
    },
    "vegetarian-muscle-gain-guide": {
        "slug": "vegetarian-muscle-gain-guide",
        "name": "Vegetarian Muscle Gain Guide",
        "description": "Indian vegetarian muscle-gain meal plan, protein options, and weekly structure.",
        "price_inr": 99,
        "pdf_url": "https://drive.google.com/example-vegetarian-guide.pdf",
        "active": True
    }
}

ORDERS = {}


@router.get("/products")
def list_products():
    return {"ok": True, "products": [product for product in PRODUCTS.values() if product["active"]]}


@router.post("/admin/products")
def upsert_product(payload: ProductPayload):
    PRODUCTS[payload.slug] = payload.model_dump()
    return {"ok": True, "product": PRODUCTS[payload.slug]}


@router.get("/admin/orders")
def admin_orders():
    return {"ok": True, "orders": list(ORDERS.values())}


@router.get("/admin/storage")
def admin_storage():
    return {"ok": True, "storage": storage_provider_status()}


@router.post("/orders")
def create_order(payload: OrderCreateRequest):
    product = PRODUCTS.get(payload.product_slug)
    if not product or not product["active"]:
        raise HTTPException(status_code=404, detail="Product not found")

    order_id = f"ORD-{uuid4().hex[:8].upper()}"
    now = datetime.now(timezone.utc).isoformat()
    order = {
        "id": order_id,
        "product_slug": product["slug"],
        "product_name": product["name"],
        "amount_inr": product["price_inr"],
        "customer_name": payload.name,
        "customer_email": payload.email,
        "customer_phone": payload.phone,
        "payment_method": "phonepe_qr",
        "payment_status": "pending",
        "download_unlocked": False,
        "download_url": None,
        "created_at": now
    }
    ORDERS[order_id] = order
    return {
        "ok": True,
        "order": order,
        "payment": {
            "method": "phonepe_qr",
            "qr_url": settings.admin_phonepe_qr_url,
            "upi_id": settings.admin_upi_id,
            "amount_inr": product["price_inr"]
        }
    }


@router.post("/orders/confirm-payment")
def confirm_payment(payload: PaymentConfirmRequest):
    order = ORDERS.get(payload.order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    product = PRODUCTS[order["product_slug"]]
    order["payment_status"] = "paid"
    order["download_unlocked"] = True
    order["download_url"] = resolve_pdf_url(product)
    order["paid_at"] = datetime.now(timezone.utc).isoformat()

    lead = {
        "name": order["customer_name"],
        "email": order["customer_email"],
        "phone": order["customer_phone"] or "",
        "purchase": order["product_name"],
        "date": order["paid_at"]
    }
    order["google_sheet_synced"] = append_lead_to_sheet(lead)
    return {"ok": True, "order": order}


@router.get("/orders/{order_id}")
def get_order(order_id: str):
    order = ORDERS.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"ok": True, "order": order}
