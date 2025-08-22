import os
import django
from django.core.management import call_command

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "my_real_estate_project.settings")
django.setup()

# عمل المايجريشنز
call_command("makemigrations")
call_command("migrate")

# إنشاء السوبر يوزر
if not os.environ.get("DJANGO_SUPERUSER_USERNAME"):
    raise Exception("Set DJANGO_SUPERUSER_USERNAME environment variable")
if not os.environ.get("DJANGO_SUPERUSER_EMAIL"):
    raise Exception("Set DJANGO_SUPERUSER_EMAIL environment variable")
if not os.environ.get("DJANGO_SUPERUSER_PASSWORD"):
    raise Exception("Set DJANGO_SUPERUSER_PASSWORD environment variable")

try:
    call_command(
        "createsuperuser",
        interactive=False,
        username=os.environ["DJANGO_SUPERUSER_USERNAME"],
        email=os.environ["DJANGO_SUPERUSER_EMAIL"],
        password=os.environ["DJANGO_SUPERUSER_PASSWORD"],
    )
except Exception as e:
    print(f"Superuser creation skipped: {e}")
