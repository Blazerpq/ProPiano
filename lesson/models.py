from django.db import models
from django.conf import settings

class Lesson(models.Model):
    title = models.CharField(max_length=255)
    short_description = models.TextField(max_length=500, blank=True, null=True)
    theory_content = models.TextField(blank=True, null=True)
    practical_content = models.TextField(blank=True, null=True)
    test_questions = models.JSONField(blank=True, null=True)  # Список вопросов и вариантов ответов
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    def _str_(self):  # Исправлен метод __str__
        return self.title
