from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()

def send_notification(user_id, message, link="#"):
    try:
        user = User.objects.get(id=user_id)
        
        # حفظ الإشعار في قاعدة البيانات
        notification = Notification.objects.create(
            user=user,
            message=message,
            link=link
        )
        
        # إرسال الإشعار عبر WebSocket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"user_{user.id}",
            {
                "type": "send_notification",
                "message": message,
                "link": link,
                "notification_count": user.notifications.filter(is_read=False).count()
            }
        )
        
        return True
    except User.DoesNotExist:
        return False