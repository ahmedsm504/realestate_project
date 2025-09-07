from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Notification
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

@receiver(post_save, sender=Notification)
def send_realtime_notification(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        group_name = f"notifications_{instance.user.id}"  # 👈 نفس الاسم زي consumers.py
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "send_notification",
                "content": {
                    "id": instance.id,
                    "message": instance.message,
                    "link": instance.link,
                    "is_read": instance.is_read,
                    "created_at": instance.created_at.strftime("%Y-%m-%d %H:%M"),
                    "notification_count": instance.user.notifications.filter(is_read=False).count(),
                },
            },
        )
