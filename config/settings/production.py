
import os

import dj_database_url
from django.core.exceptions import ImproperlyConfigured

from .base import *

# Production mode
DEBUG = False

# Security
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY")
if not SECRET_KEY:
    raise ImproperlyConfigured(
        "DJANGO_SECRET_KEY must be set in the environment."
    )

ALLOWED_HOSTS = [
    host.strip()
    for host in os.environ.get(
        "DJANGO_ALLOWED_HOSTS",
        "satta-bazar-api-zj17.onrender.com",
    ).split(",")
    if host.strip()
]

# Database: Render PostgreSQL
DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise ImproperlyConfigured(
        "DATABASE_URL must be set in the environment."
    )

DATABASES = {
    "default": dj_database_url.parse(
        DATABASE_URL,
        conn_max_age=600,
        ssl_require=True,
    )
}

# Static files
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# WhiteNoise: serve collected static files
if "whitenoise" in os.environ.get("INSTALLED_APPS", ""):
    pass

MIDDLEWARE = list(MIDDLEWARE)

if (
    "whitenoise.middleware.WhiteNoiseMiddleware"
    not in MIDDLEWARE
):
    MIDDLEWARE.insert(
        1,
        "whitenoise.middleware.WhiteNoiseMiddleware",
    )

# CORS: allow the deployed React frontend
CORS_ALLOWED_ORIGINS = [
    origin.strip().rstrip("/")
    for origin in os.environ.get(
        "CORS_ALLOWED_ORIGINS",
        "https://satta-game.onrender.com",
    ).split(",")
    if origin.strip()
]

# CSRF: trust the deployed frontend
CSRF_TRUSTED_ORIGINS = [
    origin.strip().rstrip("/")
    for origin in os.environ.get(
        "CSRF_TRUSTED_ORIGINS",
        "https://satta-game.onrender.com",
    ).split(",")
    if origin.strip()
]

# Render HTTPS proxy support
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
