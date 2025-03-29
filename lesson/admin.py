from django import forms
from django.contrib import admin
from django.db import models
from .models import Lesson

class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'short_description', 'theory_content', 'practical_content')
    search_fields = ('title', 'short_description')
    list_filter = ('short_description',)

    formfield_overrides = {
        models.JSONField: {'widget': forms.Textarea(attrs={'cols': 80, 'rows': 20})},
    }

admin.site.register(Lesson, LessonAdmin)