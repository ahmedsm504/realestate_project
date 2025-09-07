from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    path('api/', views.notifications_api, name='notifications_api'),
    path('mark-as-read/', views.mark_notifications_as_read, name='mark_notifications_as_read'),
]
