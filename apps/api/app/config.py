from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://physique:physique@localhost:5432/physique_meter"
    gemini_api_key: str = ""
    jwt_secret: str = "change-me"
    cors_origin: str = "http://localhost:3000"
    admin_phonepe_qr_url: str = "https://example.com/phonepe-admin-qr.png"
    admin_upi_id: str = "your-upi-id@ybl"
    google_sheets_spreadsheet_id: str = ""
    google_service_account_json: str = ""
    pdf_storage_provider: str = "google_drive"
    google_drive_folder_id: str = ""
    cloudinary_url: str = ""
    aws_s3_bucket: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
