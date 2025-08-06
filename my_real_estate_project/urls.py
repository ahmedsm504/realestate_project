# my_real_estate_project/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings # لاستخدام MEDIA_URL في التطوير
from django.conf.urls.static import static # لاستخدام MEDIA_URL في التطوير

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('properties.urls', namespace='properties')),
    path('users/', include('users.urls')),          # روابط تطبيق المستخدمين
    path('inquiries/', include('inquiries.urls')),  # روابط تطبيق الاستفسارات
    # path('', include('pages.urls')), # إذا أنشأت تطبيق pages للصفحة الرئيسية
]

# لخدمة ملفات الوسائط في وضع التطوير فقط
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
