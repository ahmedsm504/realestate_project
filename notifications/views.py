# في views.py أو في ملف منفصل للإشعارات

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import View
from django.utils import timezone
from datetime import datetime
from users.models import CustomUser
from notifications.models import Notification

@login_required
def notifications_api(request):
    """جلب الإشعارات الخاصة بالمستخدم"""
    if request.method == 'GET':
        # جلب الإشعارات غير المقروءة أولاً، ثم المقروءة
        notifications = request.user.notifications.all().order_by('-created_at')[:20]  # آخر 20 إشعار
        
        # تحويل الإشعارات لـ JSON
        notifications_data = []
        for notification in notifications:
            notifications_data.append({
                'id': notification.id,
                'message': notification.message,
                'link': notification.link or '#',
                'is_read': notification.is_read,
                'created_at': notification.created_at.strftime('%Y-%m-%d %H:%M')
            })
        
        # عد الإشعارات غير المقروءة
        unread_count = request.user.notifications.filter(is_read=False).count()
        
        return JsonResponse({
            'success': True,
            'notifications': notifications_data,
            'count': unread_count
        })
    
    return JsonResponse({'success': False, 'error': 'Method not allowed'})

@csrf_protect
@login_required
def mark_notifications_as_read(request):
    """تحديد الإشعارات كمقروءة"""
    if request.method == 'POST':
        try:
            # تحديث جميع الإشعارات غير المقروءة للمستخدم الحالي
            updated_count = request.user.notifications.filter(is_read=False).update(is_read=True)
            
            return JsonResponse({
                'success': True, 
                'message': f'تم تحديث {updated_count} إشعار كمقروء',
                'updated_count': updated_count
            })
        except Exception as e:
            return JsonResponse({
                'success': False, 
                'error': str(e)
            })
    
    return JsonResponse({'success': False, 'error': 'Method not allowed'})

# إذا كنت بتستخدم Class-based views
class NotificationAPIView(View):
    @method_decorator(login_required)
    def get(self, request):
        return notifications_api(request)
    
    @method_decorator(csrf_protect)
    @method_decorator(login_required) 
    def post(self, request):
        return mark_notifications_as_read(request)