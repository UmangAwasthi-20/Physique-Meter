from dataclasses import dataclass


@dataclass
class VisionMetrics:
    shoulder_width: float | None
    waist_width: float | None
    shoulder_waist_ratio: float | None


def analyze_progress_photo(image_bytes: bytes) -> VisionMetrics:
    """Extract rough physique proportions with MediaPipe/OpenCV.

    The production implementation should decode the image with OpenCV, detect pose
    landmarks with MediaPipe, then calculate shoulder and waist pixel widths. This
    function returns a stable fallback when landmarks are unavailable so the API
    can still generate reports during local development.
    """
    if not image_bytes:
        return VisionMetrics(None, None, None)

    try:
        import cv2  # noqa: F401
        import mediapipe as mp  # noqa: F401
    except Exception:
        return VisionMetrics(None, None, None)

    return VisionMetrics(shoulder_width=None, waist_width=None, shoulder_waist_ratio=None)
