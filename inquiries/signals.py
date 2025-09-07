# inquiries/signals.py

from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Inquiry
from notifications.models import Notification

@receiver(post_save, sender=Inquiry)
def inquiry_notification(sender, instance, created, **kwargs):
    channel_layer = get_channel_layer()

    if created:
        # الحالة الأولى: إرسال إشعار لمالك العقار عند وجود استفسار جديد
        target_user = instance.property.owner
        message = f"لديك استفسار جديد من {instance.inquirer.username} بخصوص عقار '{instance.property.title}'."
        link = "/inquiries/realtor/"  # رابط لصفحة استفسارات مالك العقار

        Notification.objects.create(user=target_user, message=message, link=link)

        notification_count = Notification.objects.filter(user=target_user, is_read=False).count()

        async_to_sync(channel_layer.group_send)(
            f'user_{target_user.id}',
            {
                'type': 'send_notification',
                'message': message,
                'link': link,
                'notification_count': notification_count,
            }
        )

    else:
        # التحقق من وجود تحديث في حقل الرد
        update_fields = kwargs.get('update_fields')
        # تحقق من الاسم الصحيح لحقل الرد (قد يكون 'reply' أو 'reply_message')
        if update_fields and 'reply' in update_fields:
            # الحالة الثانية: إرسال إشعار للمستفسر عند الرد على استفساره
            target_user = instance.inquirer
            message = f"قام صاحب العقار بالرد على استفسارك بخصوص '{instance.property.title}'."
            link = "/inquiries/user/"  # رابط لصفحة استفسارات المستخدم

            Notification.objects.create(user=target_user, message=message, link=link)

            notification_count = Notification.objects.filter(user=target_user, is_read=False).count()

            async_to_sync(channel_layer.group_send)(
                f'user_{target_user.id}',
                {
                    'type': 'send_notification',
                    'message': message,
                    'link': link,
                    'notification_count': notification_count,
                }
            )