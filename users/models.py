# users/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    # حقل جديد لتمييز ما إذا كان المستخدم تاجر عقارات أم لا
    is_realtor = models.BooleanField(default=False, verbose_name='هل هو تاجر عقارات؟')

    # حقول إضافية للملف الشخصي
    phone_number = models.CharField(max_length=20, blank=True, null=True, verbose_name='رقم الهاتف')
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True, verbose_name='الصورة الشخصية')
    bio = models.TextField(blank=True, null=True, verbose_name='نبذة تعريفية')

    class Meta:
        verbose_name = 'مستخدم'
        verbose_name_plural = 'المستخدمون'

    def __str__(self):
        return self.username
    
    