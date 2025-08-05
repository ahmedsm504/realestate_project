# properties/admin.py

from django.contrib import admin
from .models import Property, PropertyImage, Feature

# عشان نقدر نضيف صور العقارات مباشرة من صفحة العقار في لوحة الإدارة
class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1 # عدد الحقول الإضافية اللي هتظهر لرفع الصور

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('title', 'property_type', 'status', 'price', 'city', 'is_published', 'owner')
    list_filter = ('property_type', 'status', 'city', 'is_published')
    search_fields = ('title', 'description', 'location_address', 'city')
    prepopulated_fields = {'title': ('title',)} # ممكن تستخدم لو عايز تحط قيمة افتراضية في حقل معين بناءً على حقل تاني
    inlines = [PropertyImageInline] # ربط صور العقارات بصفحة العقار
    raw_id_fields = ('owner',) # بيخلي حقل المالك يظهر كـ ID عشان لو عندك مستخدمين كتير
    date_hierarchy = 'published_date' # عشان تقدر تتنقل بين العقارات حسب التاريخ
    ordering = ('-published_date',) # ترتيب افتراضي في لوحة الإدارة
    list_editable = ('is_published',) # عشان تقدر تعدل حالة النشر مباشرة من القائمة

@admin.register(Feature)
class FeatureAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)