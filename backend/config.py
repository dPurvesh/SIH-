import os
import io
import hashlib
from pathlib import Path
from typing import Optional, Tuple
from pydantic_settings import BaseSettings

BACKEND_DIR = Path(__file__).resolve().parent
STORAGE_VAULT = BACKEND_DIR / "storage" / "vault"
HEATMAPS_DIR = BACKEND_DIR / "storage" / "heatmaps"
STORAGE_VAULT.mkdir(parents=True, exist_ok=True)
HEATMAPS_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    # App
    PROJECT_NAME: str = "PRAMAAN-AICTE"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    ACADEMIC_YEAR: str = "2026-27"
    APH_VERSION: str = "APH 2024-27"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{BACKEND_DIR / 'pramaan.db'}"
    )
    
    # MinIO / Object Storage
    MINIO_ENDPOINT: str = os.getenv("MINIO_ENDPOINT", "localhost:9000")
    MINIO_ACCESS_KEY: str = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
    MINIO_SECRET_KEY: str = os.getenv("MINIO_SECRET_KEY", "minioadmin_secure")
    MINIO_BUCKET: str = os.getenv("MINIO_BUCKET", "aicte-worm-evidence")
    MINIO_SECURE: bool = os.getenv("MINIO_SECURE", "false").lower() == "true"
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # AI / Vision Keys (optional)
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Object Storage Manager with MinIO and Local Persistent WORM Vault fallback
class WormStorageManager:
    def __init__(self):
        self._minio_client = None
        self._use_minio = False
        try:
            from minio import Minio
            client = Minio(
                endpoint=settings.MINIO_ENDPOINT,
                access_key=settings.MINIO_ACCESS_KEY,
                secret_key=settings.MINIO_SECRET_KEY,
                secure=settings.MINIO_SECURE
            )
            # Check connection
            if client.bucket_exists(settings.MINIO_BUCKET):
                self._minio_client = client
                self._use_minio = True
            else:
                try:
                    client.make_bucket(settings.MINIO_BUCKET, object_lock=True)
                    self._minio_client = client
                    self._use_minio = True
                except Exception:
                    pass
        except Exception:
            self._use_minio = False

    @property
    def is_minio_active(self) -> bool:
        return self._use_minio

    def put_object(self, object_key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
        """Store object in MinIO if connected, else store in local WORM vault."""
        sha256_hash = hashlib.sha256(data).hexdigest()
        if self._use_minio and self._minio_client:
            try:
                self._minio_client.put_object(
                    bucket_name=settings.MINIO_BUCKET,
                    object_name=object_key,
                    data=io.BytesIO(data),
                    length=len(data),
                    content_type=content_type,
                    metadata={"sha256": sha256_hash, "worm_locked": "true"}
                )
                return object_key
            except Exception:
                pass
        
        # Local Persistent WORM Vault Fallback
        target_path = STORAGE_VAULT / object_key
        target_path.parent.mkdir(parents=True, exist_ok=True)
        if not target_path.exists():
            target_path.write_bytes(data)
        return object_key

    def get_object(self, object_key: str) -> Optional[bytes]:
        """Retrieve object bytes from MinIO or local WORM vault."""
        if self._use_minio and self._minio_client:
            try:
                response = self._minio_client.get_object(settings.MINIO_BUCKET, object_key)
                data = response.read()
                response.close()
                response.release_conn()
                return data
            except Exception:
                pass
        
        target_path = STORAGE_VAULT / object_key
        if target_path.exists():
            return target_path.read_bytes()
        return None

    def save_heatmap(self, filename: str, image_bytes: bytes) -> str:
        """Save generated ELA heatmap image to storage and return its serveable key."""
        target_path = HEATMAPS_DIR / filename
        target_path.write_bytes(image_bytes)
        return filename

storage_manager = WormStorageManager()
