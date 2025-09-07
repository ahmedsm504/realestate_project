import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # استيراد get_user_model هنا بدلاً من في مستوى المودول
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # التحقق من صحة المستخدم
        if self.scope["user"].is_anonymous:
            await self.close()
            return
            
        self.user = self.scope["user"]
        self.group_name = f"user_{self.user.id}"
        
        # الانضمام إلى مجموعة المستخدم
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # إرسال عدد الإشعارات غير المقروءة عند الاتصال
        count = await self.get_unread_count()
        await self.send(text_data=json.dumps({
            'type': 'initial_count',
            'notification_count': count
        }))

    async def disconnect(self, close_code):
        # مغادرة مجموعة المستخدم
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        # معالجة الرسائل الواردة من العميل
        pass

    async def send_notification(self, event):
        # إرسال الإشعار إلى العميل
        await self.send(text_data=json.dumps({
            'type': 'new_notification',
            'message': event['message'],
            'link': event.get('link', '#'),
            'id': event.get('id'),
            'notification_count': event.get('notification_count', 0)
        }))

    @database_sync_to_async
    def get_unread_count(self):
        # استيراد النماذج داخل الدالة
        from django.contrib.auth import get_user_model
        from notifications.models import Notification
        
        User = get_user_model()
        return Notification.objects.filter(user=self.user, is_read=False).count()