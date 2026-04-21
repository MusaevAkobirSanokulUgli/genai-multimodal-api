from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    model_config = {"env_file": ".env", "env_prefix": "GENAI_"}

    app_name: str = "GenAI Multi-Modal API"
    debug: bool = False

    openai_api_key: str = ""
    default_llm: str = "gpt-4o"
    default_vision_model: str = "gpt-4o"
    default_image_model: str = "dall-e-3"
    default_tts_model: str = "tts-1"
    default_stt_model: str = "whisper-1"

    max_concurrent_requests: int = 10
    request_timeout: int = 120

    moderation_enabled: bool = True
    moderation_threshold: float = 0.5


settings = Settings()
