from django.urls import re_path

# تعريف patterns باستخدام استيراد متأخر داخل دالة
def get_websocket_urlpatterns():
    from notifications.consumers import NotificationConsumer
    return [
        re_path(r'ws/notifications/$', NotificationConsumer.as_asgi()),
    ]

websocket_urlpatterns = get_websocket_urlpatterns()