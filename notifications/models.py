from django.db import models
from django.conf import settings  # 👈 عشان نستخدم AUTH_USER_MODEL


class Notification(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # 👈 بدل User العادي
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    message = models.TextField(verbose_name='رسالة الإشعار')
    link = models.URLField(blank=True, null=True, verbose_name='رابط الإشعار')
    is_read = models.BooleanField(default=False, verbose_name='مقروء')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')

    # إضافة نوع الإشعار (اختياري)
    NOTIFICATION_TYPES = [
        ('info', 'معلومات'),
        ('warning', 'تحذير'),
        ('success', 'نجاح'),
        ('error', 'خطأ'),
    ]
    notification_type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPES,
        default='info',
        verbose_name='نوع الإشعار'
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'إشعار'
        verbose_name_plural = 'الإشعارات'

    def __str__(self):
        return f"{self.user} - {self.message[:50]}"

    def mark_as_read(self):
        """تحديد الإشعار كمقروء"""
        self.is_read = True
        self.save()

    @classmethod
    def create_notification(cls, user, message, link=None, notification_type='info'):
        """إنشاء إشعار جديد"""
        return cls.objects.create(
            user=user,
            message=message,
            link=link,
            notification_type=notification_type
        )
