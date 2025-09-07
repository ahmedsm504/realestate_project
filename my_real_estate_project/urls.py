from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('allauth.urls')),
    path('', include('pages.urls')),
    path('', include(('properties.urls', 'properties'), namespace='properties')),
    path('users/', include('users.urls')),
    path('inquiries/', include('inquiries.urls')),
    path('notifications/', include('notifications.urls')),  # ✅ هنا الاشعارات

    path("robots.txt", TemplateView.as_view(template_name="robots.txt", content_type="text/plain")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

from django.contrib.sitemaps.views import sitemap
from properties.sitemaps import PropertySitemap, StaticViewSitemap

sitemaps = {
    'properties': PropertySitemap,
    'static': StaticViewSitemap,
}

urlpatterns += [
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='sitemap'),
]
