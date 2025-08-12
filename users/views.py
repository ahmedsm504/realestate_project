# users/views.py

from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate, get_user_model
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.urls import reverse_lazy # هذا هو السطر الذي يجب إضافته

from django.urls import reverse_lazy
from django.views.generic import UpdateView
from django.contrib.auth.forms import AuthenticationForm, PasswordChangeForm, PasswordResetForm, SetPasswordForm
from django.contrib.auth.views import PasswordResetConfirmView # لاستخدام View إعادة تعيين كلمة المرور

# استيراد النماذج والفورمات المخصصة
from .forms import CustomUserCreationForm, UserProfileUpdateForm # تأكد من استيراد UserProfileUpdateForm هنا

User = get_user_model() # للحصول على نموذج المستخدم المخصص

def register_view(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST, request.FILES) # Accept files for profile picture, etc.
        if form.is_valid():
            user = form.save()
            
            # --- The crucial fix for ValueError ---
            # Explicitly specify the allauth backend for login
            login(request, user, backend='allauth.account.auth_backends.AuthenticationBackend')
            # --- End of fix ---

            messages.success(request, 'تم إنشاء حسابك بنجاح وتسجيل دخولك!')
            return redirect('properties:property_list') # Redirect to your desired page after login
        else:
            # Display specific field errors
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{form.fields[field].label}: {error}')
            # Display non-field errors (e.g., password mismatch)
            if form.non_field_errors():
                for error in form.non_field_errors():
                    messages.error(request, error)
    else:
        form = CustomUserCreationForm()
    return render(request, 'users/register.html', {'form': form})
# 2. View لتسجيل دخول المستخدمين
def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f'مرحباً بك مجدداً, {username}!')
                next_url = request.GET.get('next')
                return redirect(next_url or 'properties:property_list')
            else:
                messages.error(request, 'اسم المستخدم أو كلمة المرور غير صحيحة.')
        else:
            messages.error(request, 'الرجاء إدخال اسم المستخدم وكلمة المرور.') # For invalid form submissions
    else:
        form = AuthenticationForm()
    return render(request, 'users/login.html', {'form': form})


# 3. View لتسجيل خروج المستخدمين
@login_required
def logout_view(request):
    logout(request)
    messages.info(request, 'تم تسجيل خروجك بنجاح.')
    return redirect('properties:property_list')


# 4. View لصفحة الملف الشخصي
@login_required
def profile_view(request):
    # يمكنك هنا جلب عقارات المستخدم التي قام بنشرها
    user_properties = request.user.properties_owned.all()
    return render(request, 'users/profile.html', {
        'user_obj': request.user,
        'user_properties': user_properties,
    })


# 5. View لتعديل الملف الشخصي
class UserProfileUpdateView(UpdateView):
    model = User
    form_class = UserProfileUpdateForm
    template_name = 'users/profile_edit.html'
    success_url = reverse_lazy('users:profile')

    def get_object(self):
        return self.request.user

    def form_valid(self, form):
        messages.success(self.request, 'تم تحديث ملفك الشخصي بنجاح!')
        return super().form_valid(form)

    def form_invalid(self, form):
        messages.error(self.request, 'حدث خطأ أثناء تحديث الملف الشخصي. الرجاء التحقق من البيانات.')
        return super().form_invalid(form)

# 6. View لتغيير كلمة المرور (بعد تسجيل الدخول)
@login_required
def password_change_view(request):
    if request.method == 'POST':
        form = PasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            # لتحديث الجلسة بعد تغيير كلمة المرور
            authenticate(request, username=user.username, password=form.cleaned_data['new_password1'])
            messages.success(request, 'تم تغيير كلمة مرورك بنجاح!')
            return redirect('users:profile')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{form.fields[field].label}: {error}')
            if form.non_field_errors():
                for error in form.non_field_errors():
                    messages.error(request, error)
    else:
        form = PasswordChangeForm(request.user)
    return render(request, 'users/password_change_form.html', {'form': form})


# 7. View لإعادة تعيين كلمة المرور (لو المستخدم نسيها) - الخطوة الأولى: طلب البريد الإلكتروني
# هذه الـ View يتم توفيرها بواسطة Django's auth views
# سنقوم فقط بتعديل القالب الذي تستخدمه
# def password_reset_view(request):
#     # This view is handled by auth_views.PasswordResetView in urls.py
#     pass

# 8. View لإعادة تعيين كلمة المرور - الخطوة الثانية: تأكيد رمز إعادة التعيين
# هذه الـ View يتم توفيرها بواسطة Django's auth views
# سنقوم فقط بتعديل القالب الذي تستخدمه
# def password_reset_confirm_view(request, uidb64, token):
#     # This view is handled by auth_views.PasswordResetConfirmView in urls.py
#     pass

# 9. View لإعادة تعيين كلمة المرور - الخطوة الثالثة: تم إرسال البريد الإلكتروني بنجاح
# هذه الـ View يتم توفيرها بواسطة Django's auth views
# def password_reset_done_view(request):
#     # This view is handled by auth_views.PasswordResetDoneView in urls.py
#     pass

# 10. View لإعادة تعيين كلمة المرور - الخطوة الرابعة: تم إعادة تعيين كلمة المرور بنجاح
# هذه الـ View يتم توفيرها بواسطة Django's auth views
# def password_reset_complete_view(request):
#     # This view is handled by auth_views.PasswordResetCompleteView in urls.py
#     pass