# properties/models.py

from django.db import models
from django.contrib.auth import get_user_model # عشان نجيب نموذج المستخدم الافتراضي
from django.utils import timezone # عشان نستخدم الوقت الحالي في التاريخ
from django.template.defaultfilters import slugify # تأكد من استيراد slugify
from django.urls import reverse # تأكد من استيراد reverse


User = get_user_model() # ده بيجيب نموذج المستخدم اللي Django بيستخدمه (سواء الافتراضي أو المخصص)

class Property(models.Model):
    # الأنواع المتاحة للعقار
    PROPERTY_TYPES = (
        ('apartment', 'شقة'),
        ('villa', 'فيلا'),
        ('land', 'أرض'),
        ('commercial', 'محل/مكت'),
        ('chalet', 'شاليه'),
        ('other', 'أخرى'),
    )

    # حالة العقار (للبيع أو للإيجار)
    PROPERTY_STATUS = (
        ('for_sale', 'للبيع'),
        ('for_rent', 'للإيجار'),
    )

    # معلومات أساسية عن العقار
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='properties_owned', verbose_name='المالك')
    title = models.CharField(max_length=200, verbose_name='عنوان العقار')
    description = models.TextField(verbose_name='الوصف')
    property_type = models.CharField(max_length=50, choices=PROPERTY_TYPES, verbose_name='نوع العقار')
    status = models.CharField(max_length=50, choices=PROPERTY_STATUS, verbose_name='الحالة')
    price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='السعر') # DecimalField للأرقام العشرية زي الأسعار
    area = models.DecimalField(max_digits=10, decimal_places=2, help_text='بالمتر المربع', verbose_name='المساحة')
    bedrooms = models.IntegerField(default=0, verbose_name='عدد غرف النوم')
    bathrooms = models.IntegerField(default=0, verbose_name='عدد الحمامات')

    # معلومات الموقع
    location_address = models.CharField(max_length=255, verbose_name='العنوان بالتفصيل')
    city = models.CharField(max_length=100, verbose_name='المدينة')
    district = models.CharField(max_length=100, blank=True, null=True, verbose_name='الحي/المنطقة')

    # تم تعديل حقلي خطوط الطول والعرض هنا ليتوافق مع دقة عالية جداً
    latitude = models.DecimalField(max_digits=22, decimal_places=16, blank=True, null=True, verbose_name='خط العرض')
    longitude = models.DecimalField(max_digits=22, decimal_places=16, blank=True, null=True, verbose_name='خط الطول')

    # تاريخ الإضافة والتحديث
    published_date = models.DateTimeField(default=timezone.now, verbose_name='تاريخ النشر')
    updated_date = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')
    is_published = models.BooleanField(default=True, verbose_name='منشور')

    # مميزات إضافية (علاقة ManyToMany)
    features = models.ManyToManyField('Feature', blank=True, related_name='properties', verbose_name='المميزات')

    # حقل slug لإنشاء روابط لطيفة (SEO-friendly URLs)
    slug = models.SlugField(unique=False, max_length=255, blank=True, null=True, verbose_name=' ')

    def __str__(self):
        return self.title

    # دالة لحفظ الـ slug تلقائياً عند حفظ العقار
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    # دالة للحصول على رابط العقار بعد الحفظ
    def get_absolute_url(self):
        # هنا استخدمنا 'slug' بدلاً من 'pk' لإنشاء رابط لطيف
        return reverse('properties:property_detail', kwargs={'slug': self.slug})


    class Meta:
        verbose_name = 'عقار'
        verbose_name_plural = 'عقارات'
        ordering = ['-published_date'] # ترتيب العقارات تنازلياً حسب تاريخ النشر


class PropertyImage(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='images', verbose_name='العقار')
    image = models.ImageField(upload_to='properties/%Y/%m/%d/', verbose_name='صورة') # هيتم رفع الصور في media/properties/السنة/الشهر/اليوم/
    is_main = models.BooleanField(default=False, verbose_name='الصورة الرئيسية') # لو في صورة رئيسية للعرض

    def __str__(self):
        return f"صورة لـ {self.property.title}"

    class Meta:
        verbose_name = 'صورة عقار'
        verbose_name_plural = 'صور عقارات'


class Feature(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name='اسم الميزة')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'ميزة'
        verbose_name_plural = 'مميزات'


# نموذج لربط المستخدمين بالعقارات المفضلة لديهم
class FavoriteProperty(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='favorites')
    property = models.ForeignKey('Property', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # هذا يضمن أن المستخدم لا يمكنه تفضيل نفس العقار أكثر من مرة
        unique_together = ('user', 'property')
        verbose_name = 'عقار مفضل'
        verbose_name_plural = 'عقارات مفضلة'

    def __str__(self):
        return f'{self.user.username} - {self.property.title}'
