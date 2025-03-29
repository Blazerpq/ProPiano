from django.shortcuts import render, redirect
from .forms import LoginUserForm, RegisterUserForm
from django.contrib.auth.views import LoginView

class LoginUser(LoginView): #класс добавляет кастомную форму, наследуется встроенный LoginView
    form_class = LoginUserForm #используется форма LoginUserForm
    template_name = 'login/login.html' #путь к шаблону
 


  
def register(request): #обработка процесса регистрации
    if request.method == 'POST': #если метод запроса POST, то обрабатывается регистрация
        form = RegisterUserForm(request.POST) #создается новый объект с введенными данными
        if form.is_valid(): #проверка корректности
            user = form.save(commit=False) #создается объект, но не сохраняется
            user.set_password(form.cleaned_data['password']) #устанавливается пароль пользователя в зашифрованном виде
            user.save() #пользователь сохраняется
            return redirect('login') #возвращается html
    else:
        form = RegisterUserForm() #если не POST, то создается пустая форма регистрации
    return render(request, 'login/register.html', {'form': form}) #рендерится шаблон с пустой или заполненной формой(если не прошла валидацию)

