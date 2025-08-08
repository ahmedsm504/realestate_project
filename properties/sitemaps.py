from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from .models import Property
from datetime import datetime

class PropertySitemap(Sitemap):
    changefreq = "daily"
    priority = 0.9

    def items(self):
        # فقط العقارات المنشورة
        return Property.objects.filter(is_published=True)

    def lastmod(self, obj):
        return obj.updated_date

    def location(self, obj):
        return obj.get_absolute_url()

class StaticViewSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.7

    def items(self):
        # هنا أضف جميع الصفحات الثابتة المهمة في موقعك
        return [
            'home',
            'properties:property_list',
            'contact',
            'about',
            'faq',
            'login',
            'register',
        ]

    def location(self, item):
        return reverse(item)
