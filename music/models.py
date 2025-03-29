from django.db import models
from django.conf import settings  # Для получения текущего пользователя

class Composition(models.Model):
    composition_id = models.AutoField(primary_key=True)
    composer_name = models.CharField(max_length=100)
    title = models.CharField(max_length=255)
    genre = models.CharField(max_length=100)
    sheet_music_url = models.URLField()
    audio_url = models.URLField()
    image = models.URLField()

    class Meta:
        db_table = 'compositions'  # Название существующей таблицы
        managed = False  # Django не будет пытаться управлять этой таблицей (создавать или изменять её)

    def _str_(self):
        return self.title
    
