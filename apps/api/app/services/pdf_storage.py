from ..config import settings


def resolve_pdf_url(product: dict) -> str | None:
    """Return the downloadable PDF URL for a product.

    Products can point to Google Drive, Cloudinary, or S3 URLs. Actual upload
    implementations should run from the admin upload endpoint with provider
    credentials stored as environment variables.
    """
    return product.get("pdf_url")


def storage_provider_status() -> dict:
    return {
        "provider": settings.pdf_storage_provider,
        "google_drive_ready": bool(settings.google_drive_folder_id),
        "cloudinary_ready": bool(settings.cloudinary_url),
        "s3_ready": bool(settings.aws_s3_bucket)
    }
