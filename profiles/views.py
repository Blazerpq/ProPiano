from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .forms import CompositionForm, ProfileUpdateForm, PasswordChangeFormCustom
from django.http import Http404
from django.contrib import messages
from django.contrib.auth import update_session_auth_hash
from music.models import Composition
from .models import FavoriteComposition, CalendarItem # Импортируем модель из текущего приложения


@login_required  # Этот декоратор гарантирует, что только авторизованные пользователи могут попасть на страницу
def profile(request):
    favorite_compositions = FavoriteComposition.objects.filter(user=request.user)
    user_role = request.user.role  # Получаем роль пользователя

    if user_role == "moderator":
        compositions = Composition.objects.all()  # Получаем все произведения

        # Если метод запроса POST, создаем форму из данных POST, иначе создаем пустую форму
        if request.method == "POST":
            form = CompositionForm(request.POST, request.FILES)
            if form.is_valid():
                form.save()  # Сохраняем новое произведение
                return redirect(
                    "profiles"
                )  # После добавления произведения перенаправляем на страницу профиля
        else:
            form = CompositionForm()  # Создаем пустую форму для GET-запроса

        # Передаем форму и список произведений в контекст
        return render(
            request,
            "profiles/profile_moderator.html",
            {
                "compositions": compositions,
                "form": form,  # Передаем форму в шаблон
                "user_role": user_role,
            },
        )

    elif user_role == "student":
        return render(
            request,
            "profiles/profile_student.html",
            {
                "user_role": user_role,
                "favorite_compositions": favorite_compositions,
            },
        )

    elif user_role == "owner":
        compositions = Composition.objects.all()  # Получаем все произведения

        # Если метод запроса POST, создаем форму из данных POST, иначе создаем пустую форму
        if request.method == "POST":
            form = CompositionForm(request.POST, request.FILES)
            if form.is_valid():
                form.save()  # Сохраняем новое произведение
                return redirect(
                    "profiles"
                )  # После добавления произведения перенаправляем на страницу профиля
        else:
            form = CompositionForm()  # Создаем пустую форму для GET-запроса

        # Передаем форму и список произведений в контекст
        return render(
            request,
            "profiles/profile_owner.html",
            {
                "compositions": compositions,
                "form": form,  # Передаем форму в шаблон
                "user_role": user_role,
            },
        )

    else:
        return render(
            request,
            "profiles/profile.html",
            {"user_role": user_role},  # Добавляем роль в контекст
        )


def add_composition(request):
    if request.user.role not in ["moderator", "owner"]:
        return redirect(
            "profile"
        )  # Если не модератор, перенаправляем на личный кабинет

    if request.method == "POST":
        form = CompositionForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect(
                "profile"
            )  # После сохранения произведения перенаправляем в личный кабинет
    else:
        form = CompositionForm()

    return render(request, "profiles/add_composition.html", {"form": form})


def delete_composition(request, composition_id):
    if request.user.role not in ["moderator", "owner"]:
        return redirect(
            "profile"
        )  # Если не модератор, перенаправляем на личный кабинет

    try:
        composition = Composition.objects.get(composition_id=composition_id)
        composition.delete()
        return redirect("profile")  # Перенаправление на личный кабинет после удаления
    except Composition.DoesNotExist:
        raise Http404("Произведение не найдено")


@login_required
def update_profile(request):
    # Получаем текущие формы для пользователя
    profile_form = ProfileUpdateForm(instance=request.user)
    password_form = PasswordChangeFormCustom(request.user)

    # Обработка POST-запроса (отправка данных форм)
    if request.method == "POST":
        # Обрабатываем форму обновления профиля
        if "update_profile" in request.POST:
            profile_form = ProfileUpdateForm(request.POST, instance=request.user)
            if profile_form.is_valid():
                profile_form.save()
                return redirect("update_profile")

        # Обрабатываем форму изменения пароля
        elif "change_password" in request.POST:
            password_form = PasswordChangeFormCustom(request.user, request.POST)
            if password_form.is_valid():
                user = password_form.save()
                update_session_auth_hash(
                    request, user
                )  # Сохраняем сессию пользователя после изменения пароля
                messages.success(request, "Ваш пароль был успешно обновлен!")
                next_url = request.GET.get(
                    "next", "update_profile"
                )  # Если нет next, используем путь по умолчанию
                return redirect(next_url)  # Перенаправляем на URL, указанный в next

    # Отправляем формы в шаблон для отображения
    return render(
        request,
        "profiles/update_profile.html",
        {
            "profile_form": profile_form,
            "password_form": password_form,
        },
    )

@login_required
def add_to_favorites(request, composition_id):
    # Получаем произведение
    composition = Composition.objects.get(composition_id=composition_id)
    
    # Добавляем его в избранное
    if not FavoriteComposition.objects.filter(user=request.user, composition=composition).exists():
        FavoriteComposition.objects.create(user=request.user, composition=composition)

    return redirect('music')  # Перенаправляем на страницу с музыкой


@login_required
def remove_from_favorites(request, favorite_id):
    # Получаем объект FavoriteComposition для текущего пользователя и заданного ID
    favorite = get_object_or_404(FavoriteComposition, id=favorite_id, user=request.user)
    
    # Удаляем композицию из избранного
    favorite.delete()

    # Удаляем связанные записи из календаря
    CalendarItem.objects.filter(user=request.user, composition=favorite.composition).delete()
    
    # Перенаправляем обратно на страницу профиля
    return redirect('profile')  # Замените 'profiles:profile' на ваш актуальный URL профиля

@login_required
def calendar(request):
    # Извлекаем календарные данные для текущего пользователя
    calendar_items = CalendarItem.objects.filter(user=request.user)
    return render(request, 'profiles/calendar.html', {'calendar_items': calendar_items})

@login_required
def fill_calendar(request):
    # Заполняем календарь избранными произведениями
    favorite_compositions = FavoriteComposition.objects.filter(user=request.user)
    for favorite in favorite_compositions:
        CalendarItem.objects.get_or_create(user=request.user, composition=favorite.composition)
    return redirect('calendar')

@login_required
def update_calendar(request):
    if request.method == "POST":
        # Получаем все даты из формы
        dates = request.POST.getlist('dates')
        calendar_items = CalendarItem.objects.filter(user=request.user)

        # Обновляем даты в календаре
        for item, date in zip(calendar_items, dates):
            if date:
                item.date = date  # Сохраняем дату, если она существует
            else:
                item.date = None  # Если дата не указана, ставим None
            item.save()

        # Перенаправляем на страницу календаря после обновления
        return redirect('calendar')

    # Когда метод GET, получаем все элементы календаря, связанные с текущим пользователем
    calendar_items = CalendarItem.objects.filter(user=request.user)
    
    # Отправляем их в шаблон для отображения
    return render(request, 'calendar.html', {'calendar_items': calendar_items})

