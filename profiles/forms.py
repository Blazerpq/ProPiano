from django import forms
from music.models import Composition
from django.contrib.auth.forms import UserChangeForm, PasswordChangeForm
from login.models import user_profile  # Импортируем вашу кастомную модель пользователя
from music.models import Composition  # Импортируем вашу кастомную модель пользователя

class CompositionForm(forms.ModelForm):
    class Meta:
        model = Composition
        fields = ['title', 'genre', 'composer_name', 'image', 'midi_file', 'sheet_music'] 

# Форма для обновления данных пользователя
class ProfileUpdateForm(UserChangeForm):
    class Meta:
        model = user_profile
        fields = ['username', 'first_name', 'last_name', 'email']  # Список полей для изменения

    # Мы не показываем пароль в форме, но добавляем поля для изменения пароля отдельно
    password = None  # Убираем поле для старого пароля

# Форма для изменения пароля
class PasswordChangeFormCustom(PasswordChangeForm):
    old_password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'form-control'}), label="Текущий пароль")
    new_password1 = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'form-control'}), label="Новый пароль")
    new_password2 = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'form-control'}), label="Подтвердите новый пароль")
    
