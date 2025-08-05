# users/urls.py

from django.urls import path,reverse_lazy
from . import views
from django.contrib.auth import views as auth_views # لاستخدام Views تسجيل الدخول والخروج وإعادة تعيين كلمة المرور الجاهزة

app_name = 'users'

urlpatterns = [
    # المصادقة الأساسية
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),

    # الملف الشخصي
    path('profile/', views.profile_view, name='profile'),
    path('profile/edit/', views.UserProfileUpdateView.as_view(), name='profile_edit'),
    path('profile/change-password/', views.password_change_view, name='password_change'),

    # إعادة تعيين كلمة المرور
    # 1 - طلب إعادة تعيين (إدخال البريد الإلكتروني)
    path('password_reset/', auth_views.PasswordResetView.as_view(
        template_name='users/password_reset_form.html',
        email_template_name='users/password_reset_email.html',
        subject_template_name='users/password_reset_subject.txt',
        success_url=reverse_lazy('users:password_reset_done')
    ), name='password_reset'),

    # 2 - تم إرسال بريد إعادة التعيين
    path('password_reset/done/', auth_views.PasswordResetDoneView.as_view(
        template_name='users/password_reset_done.html'
    ), name='password_reset_done'),

    # 3 - تأكيد إعادة التعيين (إدخال كلمة المرور الجديدة)
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(
        template_name='users/password_reset_confirm.html',
        success_url=reverse_lazy('users:password_reset_complete')
    ), name='password_reset_confirm'),

    # 4 - تم إعادة تعيين كلمة المرور بنجاح
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(
        template_name='users/password_reset_complete.html'
    ), name='password_reset_complete'),
]