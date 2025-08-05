# users/forms.py

from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import CustomUser

class CustomUserCreationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = CustomUser
        fields = UserCreationForm.Meta.fields + ('is_realtor', 'phone_number', 'bio', 'profile_picture')
        labels = {
            'username': 'اسم المستخدم',
            'email': 'البريد الإلكتروني',
            'password': 'كلمة المرور',
            'password2': 'تأكيد كلمة المرور',
            'is_realtor': 'هل أنت تاجر عقارات؟',
            'phone_number': 'رقم الهاتف',
            'bio': 'نبذة تعريفية',
            'profile_picture': 'الصورة الشخصية',
        }
        widgets = {
            'bio': forms.Textarea(attrs={'rows': 3}),
        }

class CustomUserChangeForm(UserChangeForm):
    password = None # لإخفاء حقل كلمة المرور في صفحة التعديل العادية

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'first_name', 'last_name', 'is_realtor', 'phone_number', 'bio', 'profile_picture')
        labels = {
            'username': 'اسم المستخدم',
            'email': 'البريد الإلكتروني',
            'first_name': 'الاسم الأول',
            'last_name': 'الاسم الأخير',
            'is_realtor': 'تاجر عقارات',
            'phone_number': 'رقم الهاتف',
            'bio': 'نبذة تعريفية',
            'profile_picture': 'الصورة الشخصية',
        }
        widgets = {
            'bio': forms.Textarea(attrs={'rows': 3}),
        }

# هذا الفورم سيتم استخدامه في View لتعديل الملف الشخصي
class UserProfileUpdateForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = ['first_name', 'last_name', 'email', 'phone_number', 'bio', 'profile_picture']
        labels = {
            'first_name': 'الاسم الأول',
            'last_name': 'الاسم الأخير',
            'email': 'البريد الإلكتروني',
            'phone_number': 'رقم الهاتف',
            'bio': 'نبذة تعريفية',
            'profile_picture': 'الصورة الشخصية',
        }
        widgets = {
            'email': forms.EmailInput(attrs={'placeholder': 'example@example.com'}),
            'bio': forms.Textarea(attrs={'rows': 4}),
        }