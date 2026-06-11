from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, Header, HTTPException

from ..config import settings
from ..schemas import OrderCreateRequest, PaymentConfirmRequest, ProductPayload
from ..services.google_sheets import append_lead_to_sheet
from ..services.pdf_storage import resolve_pdf_url, storage_provider_status

router = APIRouter(prefix="/commerce", tags=["commerce"])
STATUS_OPTIONS = ["Pending", "Verified", "Rejected", "PDF Sent"]

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


def require_admin(x_admin_password: str | None = Header(default=None)):
    if not x_admin_password or x_admin_password != settings.admin_password:
        raise HTTPException(status_code=401, detail="Admin authentication required")
    return True


@router.get("/products")
def list_products():
    return {"ok": True, "products": [product for product in PRODUCTS.values() if product["active"]]}


@router.post("/admin/products")
def upsert_product(payload: ProductPayload, _admin: bool = Depends(require_admin)):
    PRODUCTS[payload.slug] = payload.model_dump()
    return {"ok": True, "product": PRODUCTS[payload.slug]}


@router.get("/admin/orders")
def admin_orders(_admin: bool = Depends(require_admin)):
    return {"ok": True, "orders": list(ORDERS.values())}


@router.get("/admin/storage")
def admin_storage(_admin: bool = Depends(require_admin)):
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
        "customer_whatsapp": payload.whatsapp,
        "payment_method": "phonepe_qr",
        "utr_id": payload.utr_id,
        "payment_screenshot_url": payload.payment_screenshot_url,
        "status": "Pending",
        "download_unlocked": False,
        "pdf_sent": False,
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
def confirm_payment(payload: PaymentConfirmRequest, _admin: bool = Depends(require_admin)):
    order = ORDERS.get(payload.order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if payload.status not in STATUS_OPTIONS:
        raise HTTPException(status_code=400, detail="Invalid status")

    product = PRODUCTS[order["product_slug"]]
    order["status"] = payload.status
    if payload.utr_id:
        order["utr_id"] = payload.utr_id
    if payload.payment_screenshot_url:
        order["payment_screenshot_url"] = payload.payment_screenshot_url
    order["download_unlocked"] = payload.status in ["Verified", "PDF Sent"]
    order["download_url"] = resolve_pdf_url(product)
    if payload.status in ["Verified", "PDF Sent"]:
        order["paid_at"] = datetime.now(timezone.utc).isoformat()
    if payload.status == "PDF Sent":
        order["pdf_sent"] = True
        order["pdf_sent_at"] = datetime.now(timezone.utc).isoformat()

    lead = {
        "date": order.get("paid_at") or order["created_at"],
        "name": order["customer_name"],
        "email": order["customer_email"],
        "whatsapp": order["customer_whatsapp"] or "",
        "product": order["product_name"],
        "amount": order["amount_inr"],
        "utr_id": order.get("utr_id") or "",
        "payment_screenshot": order.get("payment_screenshot_url") or "",
        "status": order["status"],
        "pdf_sent": order["pdf_sent"]
    }
    order["google_sheet_synced"] = append_lead_to_sheet(lead)
    return {"ok": True, "order": order}


@router.get("/orders/{order_id}")
def get_order(order_id: str):
    order = ORDERS.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"ok": True, "order": order}
