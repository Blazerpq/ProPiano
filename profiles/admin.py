from django.contrib import admin
from .models import Composition

class CompositionAdmin(admin.ModelAdmin):
    list_display = ('composition_id', 'composer_name', 'title', 'genre', 'sheet_music_url', 'audio_url', 'image')  # исправили имена полей
    search_fields = ('title', 'composer_name', 'genre')  # добавляем поиск по этим полям
    list_filter = ('genre',)  # фильтрация по жанру

admin.site.register(Composition, CompositionAdmin)