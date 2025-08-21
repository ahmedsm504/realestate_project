from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.db.models import Q
from django.contrib import messages
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse, HttpResponsePermanentRedirect
from decimal import Decimal, InvalidOperation
from .models import Property, PropertyImage, Feature, FavoriteProperty
from .forms import PropertyForm


class PropertyListView(ListView):
    model = Property
    template_name = 'properties/property_list.html'
    context_object_name = 'properties' # سيتم تغيير هذا لاحقاً في get_context_data
    paginate_by = 6

    def get_queryset(self):
        queryset = Property.objects.filter(is_published=True).order_by('-published_date')

        # فلترة بالمدينة بشكل صريح
        city_search = self.request.GET.get('city_search')
        query = self.request.GET.get('q')
        if city_search:
            city_value = city_search.strip()
            if city_value:
                queryset = queryset.filter(city__icontains=city_value)
        elif query:
            # لو البحث يساوي اسم مدينة أو حي بالضبط، فلتر بالمدينة/الحي فقط لتجنب ظهور مدن أخرى
            query_value = query.strip()
            if queryset.filter(city__iexact=query_value).exists():
                queryset = queryset.filter(city__iexact=query_value)
            elif queryset.filter(district__iexact=query_value).exists():
                queryset = queryset.filter(district__iexact=query_value)
            else:
                # بحث عام على العنوان والوصف والعنوان التفصيلي والمدينة والحي
                queryset = queryset.filter(
                    Q(title__icontains=query)
                    | Q(description__icontains=query)
                    | Q(location_address__icontains=query)
                    | Q(city__icontains=query)
                    | Q(district__icontains=query)
                )

        # فلترة نوع العقار
        property_type = self.request.GET.get('property_type')
        if property_type:
            queryset = queryset.filter(property_type=property_type)

        # فلترة حالة العقار (للبيع أو للإيجار)
        status = self.request.GET.get('status')
        if status:
            queryset = queryset.filter(status=status)

        # فلترة السعر الأدنى والأقصى
        min_price = self.request.GET.get('min_price')
        if min_price:
            try:
                queryset = queryset.filter(price__gte=Decimal(min_price))
            except (InvalidOperation, ValueError):
                pass

        max_price = self.request.GET.get('max_price')
        if max_price:
            try:
                queryset = queryset.filter(price__lte=Decimal(max_price))
            except (InvalidOperation, ValueError):
                pass

        # فلترة عدد غرف النوم
        bedrooms = self.request.GET.get('bedrooms')
        if bedrooms and bedrooms.isdigit():
            bedrooms_num = int(bedrooms)
            if bedrooms_num >= 4:
                queryset = queryset.filter(bedrooms__gte=4)
            else:
                queryset = queryset.filter(bedrooms=bedrooms_num)

        # فلترة المساحة
        min_area = self.request.GET.get('min_area')
        if min_area:
            try:
                queryset = queryset.filter(area__gte=Decimal(min_area))
            except (InvalidOperation, ValueError):
                pass

        max_area = self.request.GET.get('max_area')
        if max_area:
            try:
                queryset = queryset.filter(area__lte=Decimal(max_area))
            except (InvalidOperation, ValueError):
                pass

        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # إضافة خيارات الفلترة إلى السياق
        context['property_type_choices'] = Property.PROPERTY_TYPES
        context['property_status_choices'] = Property.PROPERTY_STATUS
        
        # تجهيز العقارات مع مسار الصورة المعروضة لتجنب أخطاء القالب
        properties_with_display_image = []
        for prop in context['object_list']: # object_list يحتوي على العقارات للصفحة الحالية
            display_image_url = "https://placehold.co/600x336/E5E7EB/4B5563?text=لا+توجد+صورة" # صورة افتراضية

            # حاول الحصول على الصورة الرئيسية أولاً
            main_image = prop.images.filter(is_main=True).first()
            if main_image:
                display_image_url = main_image.image.url
            elif prop.images.first(): # إذا لم توجد صورة رئيسية، احصل على أول صورة متاحة
                display_image_url = prop.images.first().image.url
            
            properties_with_display_image.append({
                'property': prop,
                'display_image_url': display_image_url
            })
        
        context['properties'] = properties_with_display_image # استبدال properties بالقائمة الجديدة
        
        return context




from django.views.generic import DetailView
from django.shortcuts import get_object_or_404
from django.http import HttpResponsePermanentRedirect
# Make sure to import Property and FavoriteProperty from your models
from .models import Property, FavoriteProperty 


class PropertyDetailView(DetailView):
    model = Property
    template_name = 'properties/property_detail.html'
    context_object_name = 'property'

    def get_object(self, queryset=None):
        # ... (Your existing get_object method, which is already correct) ...
        if 'slug' in self.kwargs:
            obj = get_object_or_404(self.model, slug=self.kwargs['slug'], is_published=True)

            if self.request.user.is_authenticated:
                if not obj.viewed_by.filter(id=self.request.user.id).exists():
                    obj.viewed_by.add(self.request.user)
            return obj
        elif 'pk' in self.kwargs:
            property_obj = get_object_or_404(self.model, pk=self.kwargs['pk'], is_published=True)
            return HttpResponsePermanentRedirect(property_obj.get_absolute_url())
        else:
            return super().get_object(queryset)
    
    def get(self, request, *args, **kwargs):
        # ... (Your existing get method, which is already correct) ...
        if 'pk' in self.kwargs:
            property_obj = get_object_or_404(self.model, pk=self.kwargs['pk'], is_published=True)
            return HttpResponsePermanentRedirect(property_obj.get_absolute_url())
        return super().get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        context['main_image'] = self.object.images.filter(is_main=True).first()
        context['extra_images'] = self.object.images.filter(is_main=False)
        
        is_favorite = False
        
        # 🌟🌟 CORRECTED LOGIC HERE 🌟🌟
        # First, check if the user is authenticated.
        # Only THEN check for the 'is_realtor' attribute.
        if self.request.user.is_authenticated:
            # Check if the user is *not* a realtor.
            # Use hasattr defensively if 'is_realtor' might not always exist on User model extensions.
            # If your User model *always* has 'is_realtor', you can simplify.
            if not hasattr(self.request.user, 'is_realtor') or not self.request.user.is_realtor:
                is_favorite = FavoriteProperty.objects.filter(
                    user=self.request.user, 
                    property=self.object
                ).exists()
            # If the user *is* a realtor, is_favorite remains False, which is the default.
        
        context['is_favorite'] = is_favorite
        
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
        context['all_features'] = Feature.objects.all()
        return context

    def form_valid(self, form):
        form.instance.owner = self.request.user
        response = super().form_valid(form)

        property_obj = self.object

        main_image_file = self.request.FILES.get('main_image')
        if main_image_file:
            PropertyImage.objects.create(property=property_obj, image=main_image_file, is_main=True)

        for image_file in self.request.FILES.getlist('images'):
            PropertyImage.objects.create(property=property_obj, image=image_file)

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

    def get_object(self, queryset=None):
        """Get object by slug or pk"""
        if 'slug' in self.kwargs:
            return get_object_or_404(Property, slug=self.kwargs['slug'])
        elif 'pk' in self.kwargs:
            return get_object_or_404(Property, pk=self.kwargs['pk'])
        else:
            return super().get_object(queryset)

    def test_func(self):
        property_obj = self.get_object()
        return self.request.user == property_obj.owner

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['main_image'] = self.object.images.filter(is_main=True).first()
        context['extra_images'] = self.object.images.filter(is_main=False)
        return context

    def form_valid(self, form):
        response = super().form_valid(form)
        property_obj = self.object

        main_image_file = self.request.FILES.get('main_image')
        if main_image_file:
            PropertyImage.objects.filter(property=property_obj, is_main=True).delete()
            PropertyImage.objects.create(property=property_obj, image=main_image_file, is_main=True)
            messages.info(self.request, 'تم تحديث الصورة الرئيسية بنجاح.')

        for image_file in self.request.FILES.getlist('images'):
            PropertyImage.objects.create(property=property_obj, image=image_file)

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

    def get_object(self, queryset=None):
        """Get object by slug or pk"""
        if 'slug' in self.kwargs:
            return get_object_or_404(Property, slug=self.kwargs['slug'])
        elif 'pk' in self.kwargs:
            return get_object_or_404(Property, pk=self.kwargs['pk'])
        else:
            return super().get_object(queryset)

    def test_func(self):
        property_obj = self.get_object()
        return self.request.user == property_obj.owner
    
    def delete(self, request, *args, **kwargs):
        messages.success(self.request, 'تم حذف العقار بنجاح!')
        return super().delete(request, *args, **kwargs)


@login_required
@user_passes_test(lambda u: u.is_realtor)
def my_properties_view(request):
    my_properties = Property.objects.filter(owner=request.user).prefetch_related('images')

    properties_with_display_image = []
    for prop in my_properties:
        display_image_url = "https://placehold.co/600x336/E5E7EB/4B5563?text=لا+توجد+صورة"

        main_image = prop.images.filter(is_main=True).first()
        if main_image:
            display_image_url = main_image.image.url
        elif prop.images.first():
            display_image_url = prop.images.first().image.url
        
        properties_with_display_image.append({
            'property': prop,
            'display_image_url': display_image_url
        })

    context = {'my_properties_with_images': properties_with_display_image}
    return render(request, 'properties/my_properties.html', context)


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

from django.conf import settings

from django.conf import settings
from django.shortcuts import render

def my_map_view(request):
    return render(request, "map_page.html", {
        "GOOGLE_MAPS_API_KEY": settings.GOOGLE_MAPS_API_KEY
    })


from django.contrib.auth import get_user_model


User = get_user_model() # Get your custom user model

class OwnerPropertyListView(ListView):
    model = Property
    template_name = 'properties/owner_properties.html' # You'll need to create this template
    context_object_name = 'owner_properties'
    paginate_by = 10 # Optional: add pagination

    def get_queryset(self):
        # Get the owner based on the username from the URL
        owner = get_object_or_404(User, username=self.kwargs['username'])
        # Filter properties published by this owner and order by 'published_date'
        return Property.objects.filter(owner=owner, is_published=True).order_by('-published_date') # FIXED LINE
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['owner'] = get_object_or_404(User, username=self.kwargs['username'])
        return context