from django.urls import path
from . import views
from .views import (
    PropertyListView,
    PropertyDetailView,
    PropertyCreateView,
    PropertyUpdateView,
    PropertyDeleteView,
    add_remove_favorite,
    favorite_list
)
from django.contrib.sitemaps.views import sitemap
from .sitemaps import PropertySitemap

app_name = 'properties'

sitemaps = {
    'properties': PropertySitemap,
}



urlpatterns = [
    # الصفحة الرئيسية للعقارات
    path('', PropertyListView.as_view(), name='property_list'),

    # روابط ثابتة
    path('add/', PropertyCreateView.as_view(), name='add_property'),
    path('my-properties/', views.my_properties_view, name='my_properties'),
    path('favorites/', views.favorite_list, name='favorite_list'),
    path('favorite/<int:pk>/', views.add_remove_favorite, name='add_remove_favorite'),
    path('owner/<str:username>/', views.OwnerPropertyListView.as_view(), name='owner_properties'),

    # الروابط القديمة بالـ ID
    path('id/<int:pk>/', PropertyDetailView.as_view(), name='property_detail_by_id'),
    path('update/id/<int:pk>/', PropertyUpdateView.as_view(), name='update_property_by_id'),
    path('delete/id/<int:pk>/', PropertyDeleteView.as_view(), name='delete_property_by_id'),

    # الروابط الجديدة بالـ slug
    path('<slug:slug>/', PropertyDetailView.as_view(), name='property_detail'),
    path('update/<slug:slug>/', PropertyUpdateView.as_view(), name='update_property'),
    path('delete/<slug:slug>/', PropertyDeleteView.as_view(), name='delete_property'),

    # خريطة الموقع
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='sitemap'),
]
