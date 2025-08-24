from django.shortcuts import render

# Create your views here.

def about(request):
    return render(request, 'pages/about.html')

def privacy_policy(request):
    return render(request, 'pages/privacy_policy.html')

def terms(request):
    return render(request, 'pages/terms.html')