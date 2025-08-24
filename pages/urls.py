# pages/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('about-us/', views.about, name='about'),
    path('privacy-policy/', views.privacy_policy, name='privacy_policy'),
    path('terms/', views.terms, name='terms'),
]