from django.contrib import admin #импорт модуля admin
from .models import user_profile #импорт user_profile из models.py

admin.site.register(user_profile) #регистрация модели 
