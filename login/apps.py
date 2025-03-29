from django.apps import AppConfig #импорт класса AppConfig


class LoginConfig(AppConfig): #наследование AppConfig
    default_auto_field = 'django.db.models.BigAutoField' #задаем тип поля по умолчанию для автоматических первичных ключей, bigautofield создает 64-битное целое число, нужно для ожидания большого кол-ва записей в таблиец
    name = 'login' #указывается имя приложения
