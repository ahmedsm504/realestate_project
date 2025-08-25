# properties/models.py

from django.db import models
from django.contrib.auth import get_user_model # عشان نجيب نموذج المستخدم الافتراضي
from django.utils import timezone # عشان نستخدم الوقت الحالي في التاريخ
from django.template.defaultfilters import slugify # تأكد من استيراد slugify
from django.urls import reverse # تأكد من استيراد reverse
import uuid

User = get_user_model() # ده بيجيب نموذج المستخدم اللي Django بيستخدمه (سواء الافتراضي أو المخصص)

class Property(models.Model):
    # الأنواع المتاحة للعقار
    PROPERTY_TYPES = (
        ('apartment', 'شقة'),
        ('villa', 'فيلا'),
        ('land', 'أرض'),
        ('commercial', 'محل/مكتب'),
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
    price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='السعر')
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

    # حقل slug محسن لإنشاء روابط لطيفة (SEO-friendly URLs)
    slug = models.SlugField(unique=True, max_length=255, blank=True, verbose_name='الرابط المخصص')

    # 🌟🌟 الحقل الجديد لتتبع المستخدمين الذين شاهدوا العقار 🌟🌟
    viewed_by = models.ManyToManyField(User, related_name='viewed_properties', blank=True, verbose_name='شاهده المستخدمون')

    # 🌟🌟 لا داعي لحقل views_count كحقل منفصل بعد الآن 🌟🌟
    # views_count = models.PositiveIntegerField(default=0, verbose_name='عدد المشاهدات')

    def __str__(self):
        return self.title

    def generate_unique_slug(self):
        """
        إنشاء slug فريد يحتوي على معلومات مفيدة للـ SEO
        """
        property_type_map = {
            'apartment': 'apartment',
            'villa': 'villa',
            'land': 'land',
            'commercial': 'commercial',
            'chalet': 'chalet',
            'other': 'property'
        }
        
        status_map = {
            'for_sale': 'for-sale',
            'for_rent': 'for-rent'
        }
        
        base_slug = slugify(self.title)
        if not base_slug:
            # استخدام المدينة ونوع العقار والسعر لتوليد slug أساسي إذا كان العنوان فارغًا
            base_slug = f"{property_type_map.get(self.property_type, 'property')}-{status_map.get(self.status, 'property')}-{slugify(self.city) if self.city else 'egypt'}-{int(self.price)}"
        
        slug_parts = [
            base_slug,
            property_type_map.get(self.property_type, 'property'),
            slugify(self.city) if self.city else 'egypt',
            f"{int(self.area)}m" if self.area else None
        ]
        
        slug_parts = [part for part in slug_parts if part]
        base_final_slug = '-'.join(slug_parts)
        
        slug = base_final_slug
        counter = 1
        
        while Property.objects.filter(slug=slug).exclude(pk=self.pk).exists():
            slug = f"{base_final_slug}-{counter}"
            counter += 1
            
        return slug

    # دالة save() المدمجة والمصححة
    def save(self, *args, **kwargs):
        # جزء الـ slug: إنشاء/تحديث الـ slug فقط لو مش موجود أو لو العنوان اتغير
        if not self.slug or (self.pk and Property.objects.get(pk=self.pk).title != self.title):
            self.slug = self.generate_unique_slug()
            
        # استدعاء دالة save الأصلية للموديل
        super().save(*args, **kwargs)

    # دالة للحصول على رابط العقار (موصى بها للـ SEO)
    def get_absolute_url(self):
        # تأكد إن عندك URL pattern باسم 'property_detail' بيقبل 'slug'
        return reverse('properties:property_detail', kwargs={'slug': self.slug})
    
    # دالة للحصول على رابط بالـ ID (لو لسه محتاجها، لكن حاول تعتمد على الـ slug)
    def get_absolute_url_by_id(self):
        # تأكد إن عندك URL pattern باسم 'property_detail_by_id' بيقبل 'pk'
        return reverse('properties:property_detail_by_id', kwargs={'pk': self.pk})

    @property
    def views_count(self):
        """
        خاصية لحساب عدد المشاهدات بناءً على عدد المستخدمين في حقل viewed_by.
        هذا أفضل من حقل views_count منفصل لأنه يضمن الدقة دائمًا.
        """
        return self.viewed_by.count()

    class Meta:
        verbose_name = 'عقار'
        verbose_name_plural = 'عقارات'
        ordering = ['-published_date'] # ترتيب العقارات تنازلياً حسب تاريخ النشر

from cloudinary.models import CloudinaryField  # 👈 هذا السطر الجديد والمهم

class PropertyImage(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='images', verbose_name='العقار')
    image = CloudinaryField('صورة')
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