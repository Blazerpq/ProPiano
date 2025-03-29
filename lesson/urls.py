# urls.py

from django.urls import path
from . import views


urlpatterns = [
    path('lesson/', views.lesson_list, name='lesson'),
    path('<int:lesson_id>/', views.lesson_detail, name='lesson_detail'),  # Страница с подробностями урока
    path('test/<int:lesson_id>/', views.lesson_test, name='lesson_test'),  # Новый URL для теста
]
