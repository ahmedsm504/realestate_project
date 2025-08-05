# users/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser
from .forms import CustomUserCreationForm, CustomUserChangeForm

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    # استخدام الفورمات المخصصة للـ Add/Change Forms
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm

    # إضافة الحقول المخصصة في لوحة الإدارة عند التعديل
    fieldsets = UserAdmin.fieldsets + (
        (('معلومات إضافية', {'fields': ('is_realtor', 'phone_number', 'profile_picture', 'bio')}),)
    )
    # إضافة الحقول المخصصة عند إضافة مستخدم جديد
    add_fieldsets = UserAdmin.add_fieldsets + (
        (('معلومات إضافية', {'fields': ('is_realtor', 'phone_number', 'profile_picture', 'bio')}),)
    )

    # لعرض الحقول المخصصة في قائمة المستخدمين
    list_display = UserAdmin.list_display + ('is_realtor', 'phone_number',)
    # لإضافة الحقول المخصصة في قائمة الفلترة
    list_filter = UserAdmin.list_filter + ('is_realtor',)
    # لعمل بحث على الحقول المخصصة (إذا أردت)
    search_fields = UserAdmin.search_fields + ('phone_number', 'bio')