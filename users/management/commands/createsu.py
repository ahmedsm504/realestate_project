import os
import django
from django.core.management import call_command

# ضبط إعدادات Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "my_real_estate_project.settings")
django.setup()

# تنفيذ المايجريشنز
print("Running migrations...")
call_command("makemigrations")
call_command("migrate")

# إنشاء السوبر يوزر من متغيرات البيئة
username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin")
email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@example.com")
password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "admin123")

from django.contrib.auth import get_user_model
User = get_user_model()

if not User.objects.filter(username=username).exists():
    print(f"Creating superuser '{username}'...")
    User.objects.create_superuser(username=username, email=email, password=password)
else:
    print(f"Superuser '{username}' already exists.")
