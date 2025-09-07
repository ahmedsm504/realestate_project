from notifications.models import Notification
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.urls import reverse

def send_notification(sender, recipient, message, target=None):
    """
    إنشاء إشعار جديد وإرساله عبر WebSocket للمستخدم المستلم.

    Parameters:
    - sender: المستخدم الذي أرسل الإشعار (عادة request.user)
    - recipient: المستخدم المستلم للإشعار
    - message: نص الإشعار
    - target: كائن مرتبط بالإشعار (مثل Inquiry) لاستخدامه في الرابط
    """

    # بناء الرابط الصحيح للإشعار
    link = reverse('inquiries:inquiry_detail', args=[target.id]) if target else '#'

    # إنشاء الإشعار في قاعدة البيانات
    notification = Notification.objects.create(
        user=recipient,
        message=message,
        link=link
    )

    # إرسال الإشعار عبر WebSocket
    channel_layer = get_channel_layer()
    group_name = f"user_{recipient.id}"
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            'type': 'send_notification',          # يجب أن يتطابق مع دالة send_notification في Consumer
            'message': notification.message,
            'link': notification.link,
            'id': notification.id,
            'notification_count': recipient.notifications.filter(is_read=False).count()
        }
    )
