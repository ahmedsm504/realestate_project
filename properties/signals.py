# properties/signals.py

from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Property
from notifications.models import Notification

@receiver(post_save, sender=Property)
def property_added_notification(sender, instance, created, **kwargs):
    """
    إرسال إشعار لمالك العقار عند إضافة عقار جديد بنجاح.
    """
    if created:
        # إنشاء الإشعار في قاعدة البيانات
        Notification.objects.create(
            user=instance.owner,
            message=f"تم نشر عقارك '{instance.title}' بنجاح!",
            link=instance.get_absolute_url()
        )

        # إرسال الإشعار بشكل فوري عبر WebSocket
        channel_layer = get_channel_layer()
        user_id = instance.owner.id
        notification_count = Notification.objects.filter(user_id=user_id, is_read=False).count()

        async_to_sync(channel_layer.group_send)(
            f'user_{user_id}', # اسم المجموعة الخاصة بالمستخدم
            {
                'type': 'send_notification',
                'message': f"تم نشر عقارك '{instance.title}' بنجاح!",
                'link': instance.get_absolute_url(),
                'notification_count': notification_count
            }
        )