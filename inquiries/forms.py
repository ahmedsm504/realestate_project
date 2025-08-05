# inquiries/forms.py

from django import forms
from .models import Inquiry

class InquiryForm(forms.ModelForm):
    class Meta:
        model = Inquiry
        fields = ['message']
        labels = {
            'message': 'رسالتك',
        }
        widgets = {
            'message': forms.Textarea(attrs={'rows': 4, 'placeholder': 'اكتب رسالتك هنا...', 'class': 'w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500'}),
        }

class ReplyForm(forms.ModelForm):
    class Meta:
        model = Inquiry
        fields = ['reply_message']
        labels = {
            'reply_message': 'اكتب ردك هنا',
        }
        widgets = {
            'reply_message': forms.Textarea(attrs={'rows': 3, 'class': 'w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500'}),
        }