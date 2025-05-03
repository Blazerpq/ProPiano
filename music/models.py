from django.db import models

class Composition(models.Model):
    composition_id = models.AutoField(primary_key=True)
    composer_name = models.CharField(max_length=100)
    title = models.CharField(max_length=255)
    genre = models.CharField(max_length=100)
    # Файл с нотами (.musicxml)
    sheet_music = models.FileField(
        upload_to='music/notes/',
        verbose_name='Ноты (.musicxml)',
        null=True,
        blank=True
    )

    # Эталонный MIDI
    midi_file = models.FileField(
        upload_to='music/midi/',
        verbose_name='MIDI-файл (эталон)',
        null=True,
        blank=True
    )

    # Картинка к композиции
    image = models.ImageField(
        upload_to='music/image/',
        verbose_name='Обложка',
        null=True,
        blank=True
    )

    def _str_(self):
        return self.title
    
