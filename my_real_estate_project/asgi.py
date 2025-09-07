import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'my_real_estate_project.settings')

django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

# دالة لاستيراد وتوفير routing للإشعارات
def get_notifications_router():
    from notifications.routing import websocket_urlpatterns
    return URLRouter(websocket_urlpatterns)

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        get_notifications_router()
    ),
})