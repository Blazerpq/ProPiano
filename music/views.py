from django.shortcuts import render, get_object_or_404, redirect
from .models import Composition
from django.contrib.auth.decorators import login_required

def music(request):
    genre_filter = request.GET.get('genre')

    # Получаем все уникальные жанры из базы данных
    genres = Composition.objects.values_list('genre', flat=True).distinct()

    # Выполняем запрос к модели Composition
    if genre_filter:
        compositions = Composition.objects.filter(genre=genre_filter)
    else:
        compositions = Composition.objects.all()

    return render(request, 'music/music.html', {
        'compositions': compositions,
        'genres': genres,  # Передаем список жанров
        'selected_genre': genre_filter,
    })

def my_composition(request):
    return render(request, 'music/my_composition.html')

def composition_detail(request, composition_id):
    composition = get_object_or_404(Composition, pk=composition_id)
    return render(request, 'music/composition_detail.html', {
        'composition': composition
    })

