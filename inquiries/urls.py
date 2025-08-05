from django.urls import path
from . import views

app_name = 'inquiries'

urlpatterns = [
    path('submit/<int:property_pk>/', views.create_inquiry, name='create_inquiry'),
    path('realtor/', views.realtor_inquiries, name='realtor_inquiries'),
    path('user/', views.user_inquiries, name='user_inquiries'),
    path('reply/<int:inquiry_pk>/', views.reply_to_inquiry, name='reply_to_inquiry'),
]