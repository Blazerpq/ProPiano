// Получаем форму по ее идентификатору и добавляем обработчик события отправки формы
document
  .getElementById("reviewForm")
  .addEventListener("submit", function (event) {
    // Предотвращаем стандартное действие отправки формы, чтобы обработать данные с помощью JavaScript
    event.preventDefault();

    // Получаем значение текстового поля внутри формы
    let inputText = document.querySelector("textarea").value;

    // Удаляем адреса URL из текста, используя регулярное выражение
    inputText = inputText.replace(/(https|http):\/\/[\n\S]+/gi, "");

    // Определяем список запрещенных слов
    let Words = ["спам", "мошенники", "spam"];

    // Создаем регулярное выражение для поиска всех вхождений запрещенных слов
    let regex = new RegExp(Words.join("|"), "gi");

    // Заменяем все вхождения запрещенных слов на "*", считаем количество вхождений
    let Count = 0;
    inputText = inputText.replace(regex, function (match) {
      Count++;
      return "*".repeat(match.length); // Заменяем слово на ряд звездочек (*)
    });

    // Выводим результат в соответствующий элемент на странице
    if (Count > 2) {
      document.getElementById("outputText").innerText =
        "Отзыв не был отправлен из-за большого количества запрещенных слов.";
    } else if (Count > 0) {
      document.getElementById("outputText").innerText =
        "Отзыв отправлен, но в нем были использованы запрещенные слова, поэтому они были исправлены системой:\n\n" +
        inputText;
    } else {
      document.getElementById("outputText").innerText =
        "Отзыв отправлен. \n\n" + inputText;
    }
  });
