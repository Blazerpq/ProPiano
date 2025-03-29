from django.contrib.auth.models import AbstractUser
from django.db import models

class user_profile(AbstractUser):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('moderator', 'Moderator'),
        ('support', 'Support'),
        ('owner', 'Owner'),
    ]
    
    role = models.CharField(
        max_length=50,
        choices=ROLE_CHOICES,
        default='student',  # Роль по умолчанию
    )
    
    midi_id = models.IntegerField(null=True, blank=True)
