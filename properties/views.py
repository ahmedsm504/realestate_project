from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.db.models import Q
from django.contrib import messages
from django.contrib.auth.decorators import login_required, user_passes_test
from .models import Property, PropertyImage, Feature
from .forms import PropertyForm

class PropertyListView(ListView):
    model = Property
    template_name = 'properties/property_list.html'
    context_object_name = 'properties'
    paginate_by = 6

    def get_queryset(self):
        queryset = Property.objects.filter(is_published=True).order_by('-published_date')
        query = self.request.GET.get('q')
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query) |
                Q(location_address__icontains=query) |
                Q(city__icontains=query) |
                Q(district__icontains=query)
            )
        property_type = self.request.GET.get('property_type')
        if property_type:
            queryset = queryset.filter(property_type=property_type)
        status = self.request.GET.get('status')
        if status:
            queryset = queryset.filter(status=status)
        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['property_type_choices'] = Property.PROPERTY_TYPES
        context['property_status_choices'] = Property.PROPERTY_STATUS
        return context

class PropertyDetailView(DetailView):
    model = Property
    template_name = 'properties/property_detail.html'
    context_object_name = 'property'
    slug_field = 'slug'
    slug_url_kwarg = 'slug'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # تجهيز الصور للقالب
        context['main_image'] = self.object.images.filter(is_main=True).first()
        context['extra_images'] = self.object.images.filter(is_main=False)
        return context

class PropertyCreateView(LoginRequiredMixin, UserPassesTestMixin, CreateView):
    model = Property
    form_class = PropertyForm
    template_name = 'properties/property_form.html'
    success_url = reverse_lazy('properties:my_properties')

    def test_func(self):
        return self.request.user.is_realtor

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # تجهيز قائمة المميزات
        context['all_features'] = Feature.objects.all()
        return context

    def form_valid(self, form):
        # 1. ربط العقار بالمستخدم
        form.instance.owner = self.request.user
        
        # 2. نطلب من الكلاس الأب أن يقوم بحفظ الفورم وتوجيهنا إلى صفحة النجاح
        # هذا السطر مهم جداً لأنه يقوم بحفظ العقار ويضع الكائن في self.object
        response = super().form_valid(form)

        # 3. الآن بعد أن تم حفظ العقار، يمكننا التعامل مع الصور والمميزات
        property_obj = self.object

        # التعامل مع الصورة الرئيسية
        main_image_file = self.request.FILES.get('main_image')
        if main_image_file:
            PropertyImage.objects.create(property=property_obj, image=main_image_file, is_main=True)

        # التعامل مع الصور الإضافية
        for image_file in self.request.FILES.getlist('images'):
            PropertyImage.objects.create(property=property_obj, image=image_file)

        # التعامل مع المميزات الجديدة
        new_features_str = form.cleaned_data.get('new_features')
        if new_features_str:
            new_features_list = [f.strip() for f in new_features_str.split(',') if f.strip()]
            for feature_name in new_features_list:
                feature, created = Feature.objects.get_or_create(name=feature_name)
                property_obj.features.add(feature)
        
        messages.success(self.request, 'تم إضافة العقار بنجاح!')
        return response

class PropertyUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Property
    form_class = PropertyForm
    template_name = 'properties/property_form.html'
    success_url = reverse_lazy('properties:my_properties')
    slug_field = 'slug'
    slug_url_kwarg = 'slug'

    def test_func(self):
        property_obj = self.get_object()
        return self.request.user == property_obj.owner

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # تجهيز الصور للقالب
        context['main_image'] = self.object.images.filter(is_main=True).first()
        context['extra_images'] = self.object.images.filter(is_main=False)
        return context

    def form_valid(self, form):
        # 1. نطلب من الكلاس الأب أن يقوم بحفظ الفورم وتوجيهنا إلى صفحة النجاح
        # هذا السطر مهم جداً لأنه يقوم بحفظ التحديثات ويضع الكائن في self.object
        response = super().form_valid(form)
        
        # 2. الآن بعد أن تم تحديث العقار، يمكننا التعامل مع الصور والمميزات
        property_obj = self.object

        # التعامل مع الصورة الرئيسية (تحديثها)
        main_image_file = self.request.FILES.get('main_image')
        if main_image_file:
            # حذف الصورة الرئيسية القديمة
            PropertyImage.objects.filter(property=property_obj, is_main=True).delete()
            # إنشاء صورة رئيسية جديدة
            PropertyImage.objects.create(property=property_obj, image=main_image_file, is_main=True)
            messages.info(self.request, 'تم تحديث الصورة الرئيسية بنجاح.')

        # التعامل مع الصور الإضافية
        for image_file in self.request.FILES.getlist('images'):
            PropertyImage.objects.create(property=property_obj, image=image_file)

        # التعامل مع المميزات الجديدة
        new_features_str = form.cleaned_data.get('new_features')
        if new_features_str:
            new_features_list = [f.strip() for f in new_features_str.split(',') if f.strip()]
            for feature_name in new_features_list:
                feature, created = Feature.objects.get_or_create(name=feature_name)
                property_obj.features.add(feature)
        
        messages.success(self.request, 'تم تحديث العقار بنجاح!')
        return response

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        for key, value in request.POST.items():
            if key.startswith('delete_image_'):
                image_id = key.split('_')[2]
                try:
                    image_to_delete = PropertyImage.objects.get(id=image_id, property=self.object)
                    image_to_delete.delete()
                    messages.info(request, 'تم حذف الصورة بنجاح.')
                except PropertyImage.DoesNotExist:
                    messages.error(request, 'الصورة غير موجودة أو لا تمتلك صلاحية حذفها.')
                except Exception as e:
                    messages.error(request, f'حدث خطأ أثناء حذف الصورة: {e}')
        
        return super().post(request, *args, **kwargs)

class PropertyDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Property
    template_name = 'properties/property_confirm_delete.html'
    success_url = reverse_lazy('properties:my_properties')
    slug_field = 'slug'
    slug_url_kwarg = 'slug'

    def test_func(self):
        property_obj = self.get_object()
        return self.request.user == property_obj.owner
    
    def delete(self, request, *args, **kwargs):
        messages.success(self.request, 'تم حذف العقار بنجاح!')
        return super().delete(request, *args, **kwargs)

@login_required
@user_passes_test(lambda u: u.is_realtor)
def my_properties_view(request):
    my_properties = Property.objects.filter(owner=request.user)
    context = {'my_properties': my_properties}
    return render(request, 'properties/my_properties.html', context)


# properties/views.py
from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic import DetailView
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth import get_user_model
from .models import Property, FavoriteProperty

# تأكد من أنك تستخدم هذا الـ View في urls.py
class PropertyDetailView(DetailView):
    model = Property
    template_name = 'properties/property_detail.html'
    context_object_name = 'property'

    def get_context_data(self, **kwargs):
        # استدعاء الدالة الأصلية للحصول على السياق
        context = super().get_context_data(**kwargs)
        
        # تهيئة متغير is_favorite
        is_favorite = False
        
        # الحصول على كائن العقار الحالي من الـ View
        current_property = self.get_object()

        # التحقق من أن المستخدم مسجل دخوله وليس مسوق عقاري
        if self.request.user.is_authenticated and not self.request.user.is_realtor:
            # التحقق من وجود العقار في قائمة المفضلة للمستخدم
            is_favorite = FavoriteProperty.objects.filter(
                user=self.request.user, 
                property=current_property
            ).exists()
        
        # إضافة حالة المفضلة إلى سياق القالب
        context['is_favorite'] = is_favorite
        
        return context

# باقي الدوال (add_remove_favorite, favorite_list) تبقى كما هي
@login_required
def add_remove_favorite(request, pk):
    if request.method == 'POST':
        property = get_object_or_404(Property, pk=pk)
        
        if request.user.is_realtor:
            return JsonResponse({'status': 'error', 'message': 'المسوقون العقاريون لا يمكنهم إضافة مفضلة.'}, status=403)

        favorite_exists = FavoriteProperty.objects.filter(user=request.user, property=property).exists()
        
        if favorite_exists:
            FavoriteProperty.objects.filter(user=request.user, property=property).delete()
            is_favorite = False
        else:
            FavoriteProperty.objects.create(user=request.user, property=property)
            is_favorite = True
            
        return JsonResponse({'status': 'success', 'is_favorite': is_favorite})
    
    return JsonResponse({'status': 'error', 'message': 'طريقة الطلب غير صالحة'}, status=400)

@login_required
def favorite_list(request):
    if request.user.is_realtor:
        messages.error(request, 'لا يمكنك الوصول إلى هذه الصفحة كمسوق عقاري.')
        return redirect('home')
    
    favorites = FavoriteProperty.objects.filter(user=request.user).select_related('property')
    return render(request, 'properties/favorite_list.html', {'favorites': favorites})
