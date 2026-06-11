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
            lead["name"],
            lead["email"],
            lead.get("phone", ""),
            lead["purchase"],
            lead["date"]
        ]]
        service.spreadsheets().values().append(
            spreadsheetId=settings.google_sheets_spreadsheet_id,
            range="Leads!A:E",
            valueInputOption="USER_ENTERED",
            body={"values": values}
        ).execute()
        return True
    except Exception:
        return False
