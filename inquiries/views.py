from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.urls import reverse

from properties.models import Property
from .models import Inquiry
from .forms import InquiryForm, ReplyForm
from .utils import send_notification  # دالة الإشعار المحلية لديك


# 📌 إرسال استفسار على عقار معين
@login_required
def create_inquiry(request, pk):  # ← استقبل pk من الـ URL
    property_obj = get_object_or_404(Property, pk=pk)

    # منع المالك من إرسال استفسار لنفسه
    if request.user == property_obj.owner:
        messages.error(request, 'لا يمكنك إرسال استفسار على عقارك الخاص.')
        return redirect('properties:property_detail', slug=property_obj.slug)

    if request.method == 'POST':
        form = InquiryForm(request.POST)
        if form.is_valid():
            inquiry = form.save(commit=False)
            inquiry.inquirer = request.user
            inquiry.property = property_obj
            inquiry.save()  # تشغيل signal للإشعار عند الإنشاء


            messages.success(request, 'تم إرسال استفسارك بنجاح!')
            return redirect('properties:property_detail', slug=property_obj.slug)
    else:
        form = InquiryForm()

    context = {'form': form, 'property': property_obj}
    return render(request, 'inquiries/inquiry_form.html', context)


# 📌 عرض كل الاستفسارات التي وصلت للتاجر
@login_required
@user_passes_test(lambda user: user.is_realtor, login_url='/users/login/')
def realtor_inquiries(request):
    realtor_properties = request.user.properties_owned.all()
    all_inquiries = Inquiry.objects.filter(
        property__in=realtor_properties
    ).order_by('-created_at')

    # أول ما يتفتح الـ page، نجعل كل الاستفسارات مقروءة
    for inquiry in all_inquiries:
        if not inquiry.is_reviewed:
            inquiry.is_reviewed = True
            inquiry.save(update_fields=['is_reviewed'])

    context = {
        'all_inquiries': all_inquiries,
        'reply_form': ReplyForm()
    }
    return render(request, 'inquiries/realtor_inquiries.html', context)


# 📌 الرد على استفسار (خاص بالتاجر صاحب العقار فقط)
@login_required
@user_passes_test(lambda user: user.is_realtor, login_url='/users/login/')
def reply_to_inquiry(request, inquiry_pk):
    inquiry = get_object_or_404(Inquiry, pk=inquiry_pk)

    if request.user != inquiry.property.owner:
        messages.error(request, 'لا تمتلك الصلاحية للرد على هذا الاستفسار.')
        return redirect('inquiries:realtor_inquiries')

    if request.method == 'POST':
        form = ReplyForm(request.POST, instance=inquiry)
        if form.is_valid():
            inquiry_obj = form.save(commit=False)
            inquiry_obj.save(update_fields=['reply_message'])

            # إرسال إشعار للمستخدم الذي أرسل الاستفسار
            send_notification(
                sender=request.user,
                recipient=inquiry.inquirer,
                message=f"قام {request.user.username} بالرد على استفسارك.",
                target=inquiry
            )

            messages.success(request, 'تم إرسال الرد بنجاح!')
            return redirect('inquiries:realtor_inquiries')

    return redirect('inquiries:realtor_inquiries')


# 📌 المستخدم يشاهد استفساراته المرسلة
@login_required
@user_passes_test(lambda user: not user.is_realtor, login_url='/users/login/')
def user_inquiries(request):
    user_inquiries = Inquiry.objects.filter(
        inquirer=request.user
    ).order_by('-created_at')

    context = {'user_inquiries': user_inquiries}
    return render(request, 'inquiries/user_inquiries.html', context)


# 📌 عرض تفاصيل استفسار فردي
@login_required
def inquiry_detail(request, inquiry_pk):
    inquiry = get_object_or_404(Inquiry, pk=inquiry_pk)

    # تأكد أن المستخدم إما أرسل الاستفسار أو هو صاحب العقار
    if request.user != inquiry.inquirer and request.user != inquiry.property.owner:
        messages.error(request, 'لا تمتلك الصلاحية لمشاهدة هذا الاستفسار.')
        return redirect('inquiries:user_inquiries')

    context = {'inquiry': inquiry}
    return render(request, 'inquiries/inquiry_detail.html', context)
