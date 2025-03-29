from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from .models import Lesson  # Импортируем необходимые модели


# Список всех уроков
def lesson_list(request):
    lessons = Lesson.objects.all()
    return render(request, 'lesson/lesson_list.html', {'lessons': lessons})

def lesson_detail(request, lesson_id):
    lesson = get_object_or_404(Lesson, id=lesson_id)
    
    if request.method == 'POST':
        # Получение ответов пользователя
        user_answers = request.POST
        correct_answers = 0
        
        # Проверка ответов
        for question, answer in user_answers.items():
            if question in lesson.test_questions and answer in lesson.test_questions[question]:
                correct_answers += 1
        
        return HttpResponse(f'Вы ответили правильно на {correct_answers} из {len(lesson.test_questions)} вопросов.')
    
    return render(request, 'lesson/lesson_detail.html', {'lesson': lesson})

def lesson_test(request, lesson_id):
    lesson = get_object_or_404(Lesson, id=lesson_id)
    test_questions = lesson.test_questions

    if request.method == "POST":
        user_answers = {key: request.POST[key] for key in request.POST if key != 'csrfmiddlewaretoken'}
        correct_answers = 0
        incorrect_questions = {}

        for question, answers in lesson.test_questions.items():
            correct_answer = answers[0]  # Первый вариант — правильный
            user_answer = user_answers.get(question)

            if user_answer == correct_answer:
                correct_answers += 1
            else:
                incorrect_questions[question] = {"user_answer": user_answer, "correct_answer": correct_answer}

        # Оценка по 5-балльной системе
        if correct_answers == 10:
            grade = 5
        elif correct_answers >= 8:
            grade = 4
        elif correct_answers >= 6:
            grade = 3
        elif correct_answers >= 4:
            grade = 2
        else:
            grade = 1

        return render(request, 'lesson/test.html', {
            'lesson': lesson,
            'submitted': True,
            'correct_answers': correct_answers,
            'grade': grade,
            'incorrect_questions': incorrect_questions
        })

    
    return render(request, 'lesson/test.html', {'lesson': lesson, 'test_questions': test_questions})