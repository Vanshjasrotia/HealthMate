import os
from functools import lru_cache

from dotenv import load_dotenv


load_dotenv()


@lru_cache
def get_gemini_api_key() -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY environment variable is not set.")
    return api_key

