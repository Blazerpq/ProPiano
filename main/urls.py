from django.urls import path
from . import views

urlpatterns = [
   path('', views.index, name='home'),
   path('review/', views.review, name='review'),
   path('login/', views.login, name='login')
]