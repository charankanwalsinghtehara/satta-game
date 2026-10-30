
import os

from .base import *

DEBUG = False

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("DJANGO_SECRET_KEY must be set.")

ALLOWED_HOSTS = [
    host.strip()
    for host in os.environ.get(
        "DJANGO_ALLOWED_HOSTS",
        "satta-bazar-api-zj17.onrender.com",
    ).split(",")
    if host.strip()
]

# Simple SQLite database instead of PostgreSQL.
# Data is temporary unless stored on a persistent disk.
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": os.environ.get(
            "DJANGO_SQLITE_PATH",
            "/tmp/satta-bazar.sqlite3",
        ),
        "OPTIONS": {
            "timeout": 20,
        },
    }
}

# Static files
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# WhiteNoise serves collected static files.
if "whitenoise.middleware.WhiteNoiseMiddleware" not in MIDDLEWARE:
    MIDDLEWARE.insert(
        1,
        "whitenoise.middleware.WhiteNoiseMiddleware",
    )

# Frontend and backend are separate Render services.
CORS_ALLOWED_ORIGINS = [
    origin.strip().rstrip("/")
    for origin in os.environ.get(
        "CORS_ALLOWED_ORIGINS",
        "https://satta-game.onrender.com",
    ).split(",")
    if origin.strip()
]

CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    origin.strip().rstrip("/")
    for origin in os.environ.get(
        "CSRF_TRUSTED_ORIGINS",
        "https://satta-game.onrender.com",
    ).split(",")
    if origin.strip()
]

# HTTPS on Render
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Required for session and CSRF cookies across separate HTTPS origins.
SESSION_COOKIE_SAMESITE = "None"
CSRF_COOKIE_SAMESITE = "None"
