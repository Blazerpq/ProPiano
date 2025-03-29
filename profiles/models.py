from django.db import models
from django.conf import settings
from music.models import Composition

class FavoriteComposition(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    composition = models.ForeignKey(Composition, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('user', 'composition')  # Чтобы одно произведение не добавлялось несколько раз

class CalendarItem(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    composition = models.ForeignKey(Composition, on_delete=models.CASCADE)
    date = models.DateField(null=True, blank=True)  # Убедитесь, что поле допускает пустое значение

    class Meta:
        unique_together = ('user', 'composition')