from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
   path('music', views.music, name='music'),
   path('my_composition', views.my_composition, name='my_composition'),
   path('composition_detail', views.composition_detail, name='composition_detail'),
   path('<int:composition_id>/', views.composition_detail, name='composition_detail'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
