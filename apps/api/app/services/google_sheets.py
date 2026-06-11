from ..config import settings


def append_lead_to_sheet(lead: dict) -> bool:
    """Append customer lead data to Google Sheets.

    Configure GOOGLE_SHEETS_SPREADSHEET_ID and GOOGLE_SERVICE_ACCOUNT_JSON in
    production. The function returns False when credentials are not present so
    local development can continue without Google setup.
    """
    if not settings.google_sheets_spreadsheet_id or not settings.google_service_account_json:
        return False

    try:
        import json
        from google.oauth2.service_account import Credentials
        from googleapiclient.discovery import build

        info = json.loads(settings.google_service_account_json)
        credentials = Credentials.from_service_account_info(
            info,
            scopes=["https://www.googleapis.com/auth/spreadsheets"]
        )
        service = build("sheets", "v4", credentials=credentials)
        values = [[
            lead["date"],
            lead["name"],
            lead.get("whatsapp", ""),
            lead["email"],
            lead["product"],
            lead["amount"],
            lead.get("utr_id", ""),
            lead.get("payment_screenshot", ""),
            lead["status"],
            "Yes" if lead.get("pdf_sent") else "No"
        ]]
        service.spreadsheets().values().append(
            spreadsheetId=settings.google_sheets_spreadsheet_id,
            range="Leads!A:J",
            valueInputOption="USER_ENTERED",
            body={"values": values}
        ).execute()
        return True
    except Exception:
        return False


def fetch_sheet_orders() -> list[dict]:
    """Read order rows from Google Sheets for the protected admin panel."""
    if not settings.google_sheets_spreadsheet_id or not settings.google_service_account_json:
        return []

    try:
        import json
        from google.oauth2.service_account import Credentials
        from googleapiclient.discovery import build

        info = json.loads(settings.google_service_account_json)
        credentials = Credentials.from_service_account_info(
            info,
            scopes=["https://www.googleapis.com/auth/spreadsheets.readonly"]
        )
        service = build("sheets", "v4", credentials=credentials)
        result = service.spreadsheets().values().get(
            spreadsheetId=settings.google_sheets_spreadsheet_id,
            range="Leads!A:J"
        ).execute()
        rows = result.get("values", [])
        if not rows:
            return []

        headers = rows[0]
        return [dict(zip(headers, row)) for row in rows[1:]]
    except Exception:
        return []
