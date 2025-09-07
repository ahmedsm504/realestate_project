from django.apps import AppConfig

class InquiriesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'inquiries'

    def ready(self):
        import inquiries.signals # 👈 أضف هذا السطر