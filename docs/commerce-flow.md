# PDF Product Commerce Flow

```mermaid
sequenceDiagram
  participant C as Customer
  participant W as Next.js Storefront
  participant A as FastAPI Backend
  participant P as PostgreSQL
  participant S as Google Sheets
  participant D as PDF Storage

  C->>W: Views PDF products
  C->>W: Clicks Buy Now
  W->>A: POST /commerce/orders
  A->>P: Store pending order and lead
  A-->>W: Return PhonePe QR details
  C->>W: Scans PhonePe QR and pays
  C->>W: Submits UTR ID and screenshot
  W->>A: Store pending verification
  A-->>W: Show pending access message
  A->>A: Admin logs in with ADMIN_PASSWORD
  A->>A: Admin verifies or rejects order
  A->>P: Mark paid and unlock download
  A->>S: Append Date, Name, WhatsApp, Email, Product, Amount, UTR ID, Payment Screenshot, Status, PDF Sent
  A->>D: Resolve PDF download URL
  A-->>W: Return unlocked download access
```

## Products

| Product | Price |
| --- | ---: |
| Weight Gain Shake PDF | ₹49 |
| Vegetarian Muscle Gain Guide | ₹99 |

## Google Sheet Columns

| Date | Name | WhatsApp | Email | Product | Amount | UTR ID | Payment Screenshot | Status | PDF Sent |
| --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- |

Status options:

- Pending
- Verified
- Rejected
- PDF Sent

## Recommended Production Setup

- Use PhonePe Payment Gateway callbacks for automatic verification when available.
- Keep QR/manual confirmation as a simple first version for India.
- Store PDFs in Google Drive, Cloudinary, or AWS S3.
- Sync every paid lead to Google Sheets.
- Keep customer phone optional.
