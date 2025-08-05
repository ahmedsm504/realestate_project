# inquiries/views.py

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from properties.models import Property
from .models import Inquiry
from .forms import InquiryForm, ReplyForm

# View لإرسال استفسار على عقار معين
@login_required
def create_inquiry(request, property_pk):
    property_obj = get_object_or_404(Property, pk=property_pk)
    if request.user == property_obj.owner:
        messages.error(request, 'لا يمكنك إرسال استفسار على عقارك الخاص.')
        return redirect('properties:property_detail', pk=property_pk)
    if request.method == 'POST':
        form = InquiryForm(request.POST)
        if form.is_valid():
            inquiry = form.save(commit=False)
            inquiry.inquirer = request.user
            inquiry.property = property_obj
            inquiry.save()
            messages.success(request, 'تم إرسال استفسارك بنجاح!')
            return redirect('properties:property_detail', pk=property_obj.pk)
    else:
        form = InquiryForm()
    context = {'form': form, 'property': property_obj}
    return render(request, 'inquiries/inquiry_form.html', context)

# View لعرض جميع الاستفسارات التي وصلت لتاجر العقارات
@login_required
@user_passes_test(lambda user: user.is_realtor, login_url='/users/login/')
def realtor_inquiries(request):
    realtor_properties = request.user.properties_owned.all()
    all_inquiries = Inquiry.objects.filter(property__in=realtor_properties).order_by('-created_at')
    
    # تحويل حالة is_reviewed تلقائياً عند فتح الصفحة
    for inquiry in all_inquiries:
        if not inquiry.is_reviewed:
            inquiry.is_reviewed = True
            inquiry.save()

    context = {'all_inquiries': all_inquiries, 'reply_form': ReplyForm()}
    return render(request, 'inquiries/realtor_inquiries.html', context)

# View للرد على استفسار معين (لتاجر العقارات فقط)
@login_required
@user_passes_test(lambda user: user.is_realtor, login_url='/users/login/')
def reply_to_inquiry(request, inquiry_pk):
    inquiry = get_object_or_404(Inquiry, pk=inquiry_pk)
    # التأكد من أن التاجر هو صاحب العقار
    if request.user != inquiry.property.owner:
        messages.error(request, 'لا تمتلك الصلاحية للرد على هذا الاستفسار.')
        return redirect('inquiries:realtor_inquiries')

    if request.method == 'POST':
        form = ReplyForm(request.POST, instance=inquiry)
        if form.is_valid():
            form.save()
            messages.success(request, 'تم إرسال الرد بنجاح!')
            return redirect('inquiries:realtor_inquiries')
    return redirect('inquiries:realtor_inquiries')


# View للمستخدم لرؤية استفساراته المرسلة
@login_required
@user_passes_test(lambda user: not user.is_realtor, login_url='/users/login/')
def user_inquiries(request):
    user_inquiries = Inquiry.objects.filter(inquirer=request.user).order_by('-created_at')
    context = {'user_inquiries': user_inquiries}
    return render(request, 'inquiries/user_inquiries.html', context)