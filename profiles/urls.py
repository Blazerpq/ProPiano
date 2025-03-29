from django.urls import path
from . import views

urlpatterns = [
    path('profiles/', views.profile, name='profiles'),
    path('profiles/add/', views.add_composition, name='add_composition'),  # URL для добавления произведения
    path('profiles/delete/<int:composition_id>/', views.delete_composition, name='delete_composition'),
    path('profiles/profiles/', views.profile, name='profile'),  # Здесь добавьте этот путь
    path('profiles/update_profile/', views.update_profile, name='update_profile'),
    path('profiles/add_to_favorites/<int:composition_id>/', views.add_to_favorites, name='add_to_favorites'),
    path('profiles/remove_from_favorites/<int:favorite_id>/', views.remove_from_favorites, name='remove_from_favorites'),
    path('profiles/calendar/', views.calendar, name='calendar'),
    path('profiles/calendar/fill/', views.fill_calendar, name='fill_calendar'),
    path('profiles/calendar/update/', views.update_calendar, name='update_calendar'),
    
]
   
