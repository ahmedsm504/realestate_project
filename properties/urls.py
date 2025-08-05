from django.urls import path
from . import views
from .views import PropertyListView, PropertyDetailView, PropertyCreateView, PropertyUpdateView, PropertyDeleteView,add_remove_favorite,favorite_list

app_name = 'properties'

urlpatterns = [
    path('', PropertyListView.as_view(), name='property_list'),
    path('<int:pk>/', PropertyDetailView.as_view(), name='property_detail'),
    path('add/', PropertyCreateView.as_view(), name='add_property'),
    path('update/<int:pk>/', PropertyUpdateView.as_view(), name='update_property'),
    path('delete/<int:pk>/', PropertyDeleteView.as_view(), name='delete_property'),
    path('my-properties/', views.my_properties_view, name='my_properties'), # تأكد من وجود هذا المسار
    path('favorite/<int:pk>/', views.add_remove_favorite, name='add_remove_favorite'),
    path('favorites/', views.favorite_list, name='favorite_list'),
]
