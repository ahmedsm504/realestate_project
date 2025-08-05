from django import forms
from .models import Property, Feature, PropertyImage

class PropertyForm(forms.ModelForm):
    # حقل لرفع الصورة الرئيسية
    main_image = forms.ImageField(
        label='الصورة الرئيسية للعقار',
        required=False,
        widget=forms.FileInput(attrs={'class': 'block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none'})
    )

    # حقل لرفع الصور الإضافية المتعددة
    # لا يوجد ويدجت مخصص هنا. سنضيف خاصية multiple في القالب يدوياً.
    images = forms.FileField(
        label='صور العقار الإضافية (يمكنك اختيار أكثر من صورة)',
        required=False
    )

    # حقل لإضافة مميزات جديدة
    new_features = forms.CharField(
        label='إضافة مميزات جديدة (افصل بينها بفاصلة)',
        required=False,
        widget=forms.TextInput(attrs={'placeholder': 'مثال: حديقة، أمن 24 ساعة، مسبح', 'class': 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'})
    )

    class Meta:
        model = Property
        fields = [
            'title', 'description', 'property_type', 'status', 'price',
            'area', 'bedrooms', 'bathrooms', 'location_address', 'city',
            'district', 'features', 'is_published'
        ]
        labels = {
            'title': 'عنوان العقار',
            'description': 'الوصف',
            'property_type': 'نوع العقار',
            'status': 'حالة العقار (للبيع/للإيجار)',
            'price': 'السعر',
            'area': 'المساحة (متر مربع)',
            'bedrooms': 'عدد غرف النوم',
            'bathrooms': 'عدد الحمامات',
            'location_address': 'العنوان التفصيلي',
            'city': 'المدينة',
            'district': 'الحي/المنطقة',
            'features': 'المميزات الموجودة',
            'is_published': 'نشر العقار',
        }
        widgets = {
            'title': forms.TextInput(attrs={'class': 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'}),
            'description': forms.Textarea(attrs={'rows': 4, 'class': 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'}),
            'property_type': forms.Select(attrs={'class': 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'}),
            'status': forms.Select(attrs={'class': 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'}),
            'price': forms.NumberInput(attrs={'class': 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'}),
            'area': forms.NumberInput(attrs={'class': 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'}),
            'bedrooms': forms.NumberInput(attrs={'class': 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'}),
            'bathrooms': forms.NumberInput(attrs={'class': 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'}),
            'location_address': forms.TextInput(attrs={'class': 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'}),
            'city': forms.TextInput(attrs={'class': 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'}),
            'district': forms.TextInput(attrs={'class': 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'}),
            'features': forms.CheckboxSelectMultiple(attrs={'class': 'mt-1'}),
            'is_published': forms.CheckboxInput(attrs={'class': 'form-checkbox h-5 w-5 text-blue-600'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['features'].widget.attrs.update({'class': 'grid grid-cols-2 md:grid-cols-3 gap-2'})