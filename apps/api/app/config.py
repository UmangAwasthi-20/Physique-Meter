from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://physique:physique@localhost:5432/physique_meter"
    gemini_api_key: str = ""
    jwt_secret: str = "change-me"
    cors_origin: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


settings = Settings()
