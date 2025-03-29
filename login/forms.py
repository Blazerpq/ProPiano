from django import forms #импорт модуля forms из Django
from django.contrib.auth import get_user_model #функция возвращает текущую модель пользователя
from django.contrib.auth.forms import AuthenticationForm #импорт встроенной формы для обработки входа пользователя

class LoginUserForm(AuthenticationForm): #наследуем стандартную форму и настраиваем под свои требования
    username = forms.CharField(label="Логин", widget=forms.TextInput(attrs={'class': 'form-input'})) #используем текстинпут и добавляем css класс
    password = forms.CharField(label="Пароль", widget=forms.PasswordInput(attrs={'class': 'form-input'})) #используем пасвординпут чтобы содержимое поля скрывалось

    class Meta: #создаем настройки для формы
        model = get_user_model() #форма должна работать с моделью пользователя
        fields = ['username', 'password'] #поля, которые будут отображаться в форме



class RegisterUserForm(forms.ModelForm): #наследуем ModelForm, чтобы создать форму, связанную с моделью пользователя
    username = forms.CharField(label="Логин") #поле для имени пользователя
    password = forms.CharField(label="Пароль", widget=forms.PasswordInput) #поле для пароля
    password2 = forms.CharField(label="Повтор пароля", widget=forms.PasswordInput) #поле для подтверждения пароля

    class Meta: #указываем модель пользователя, с которой будет работать форма
        model = get_user_model() #используем кастомную модель пользователя
        fields = ['username', 'email', 'password', 'password2'] #список полей
          
    def clean_password2(self): #метод проверяет совпадение пароля1 и пароля2 
        cd = self.cleaned_data #словарь, содержащий все данные формы, которые прошли базовую валидацию(не пустое и соответствует типу данных)
        if cd['password'] != cd['password2']: #сравнение двух паролей
            raise forms.ValidationError("Пароли не совпадают!") #исключение если не совпадают 
        return cd['password'] #подтверждает, что оба поля корректны, возвращая значение password
    
    def clean_email(self): #проверка уникальности почты
        email = self.cleaned_data['email'] #извлекаем email из словаря
        if get_user_model().objects.filter(email=email).exists(): #возвращает модель пользователя-запрашивает записи в бд-возвращает true если уже существует
            raise forms.ValidationError("Такой E-mail уже существует!") #исключение если существует
        return email #если уникален возвращает его
