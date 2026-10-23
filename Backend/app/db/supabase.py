import os
import logging
from supabase import create_client

logger = logging.getLogger(__name__)

_supabase = None

def get_supabase():
    global _supabase
    if _supabase is not None:
        return _supabase

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")

    if not url or not key:
        logger.warning("Supabase keys missing")
        return None

    try:
        _supabase = create_client(url, key)
        logger.info("Supabase connected")
        return _supabase
    except Exception:
        logger.exception("Failed to connect Supabase ")
        return None
