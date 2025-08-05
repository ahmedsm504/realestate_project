# inquiries/models.py

from django.db import models
from django.conf import settings
from properties.models import Property

class Inquiry(models.Model):
    # ربط الاستفسار بالمستخدم الذي قام بإرساله
    inquirer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='inquiries_sent', verbose_name='المستفسر')

    # ربط الاستفسار بالعقار
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='inquiries_received', verbose_name='العقار')

    # نص الرسالة من المستفسر
    message = models.TextField(verbose_name='الرسالة')

    # حقل جديد للرد من صاحب العقار
    reply_message = models.TextField(blank=True, null=True, verbose_name='رد صاحب العقار')

    # تاريخ ووقت إرسال الاستفسار
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ الإرسال')
    
    # حقل اختياري لتحديد إذا كان الاستفسار تمت مراجعته
    is_reviewed = models.BooleanField(default=False, verbose_name='تمت المراجعة')

    class Meta:
        verbose_name = 'استفسار'
        verbose_name_plural = 'الاستفسارات'
        ordering = ['-created_at']

    def __str__(self):
        return f"استفسار من {self.inquirer.username} بخصوص {self.property.title}"
