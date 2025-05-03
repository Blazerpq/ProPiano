const midiFile1Url = document.getElementById("midiFile1Url").value;
const midiFile2Input = document.getElementById("midiFile2");
const compareMidiBtn = document.getElementById("compareMidiBtn");
const summaryBox = document.getElementById("summary-box");

async function fetchAndParseMidi(url) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return new Midi(buffer);
}

function compareMIDI(midi1, midi2) {
  const notes1 = midi1.tracks.flatMap(track => track.notes);
  const notes2 = midi2.tracks.flatMap(track => track.notes);

  const errors = [];
  let matchCount = 0;

  notes1.forEach(note1 => {
    const match = notes2.find(note2 =>
      Math.abs(note1.midi - note2.midi) < 1 &&
      Math.abs(note1.duration - note2.duration) < 0.2 &&
      Math.abs(note1.time - note2.time) < 0.3
    );
    if (match) {
      matchCount++;
    } else {
      errors.push({
        time: note1.time,
        expected: `Нота ${note1.midi}, длит. ${note1.duration.toFixed(2)}`
      });
    }
  });

  const similarity = (matchCount / Math.max(notes1.length, notes2.length)) * 100;

  return { similarity, errors: errors.slice(0, 3) };
}

compareMidiBtn.addEventListener("click", async () => {
  const file2 = midiFile2Input.files[0];
  if (!file2) {
    summaryBox.innerHTML = "❌ Пожалуйста, загрузите файл с исполнением.";
    summaryBox.className = "bad";
    summaryBox.style.display = "block";
    return;
  }

  try {
    const midi1 = await fetchAndParseMidi(midiFile1Url);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const midi2 = new Midi(reader.result);
        const { similarity, errors } = compareMIDI(midi1, midi2);

        let evaluation = "";
        let className = "";

        if (similarity >= 90) {
          evaluation = "Отлично! Почти без ошибок.";
          className = "excellent";
        } else if (similarity >= 75) {
          evaluation = "Хорошо! Есть незначительные неточности.";
          className = "good";
        } else {
          evaluation = "Требуется доработка. Попробуйте снова.";
          className = "bad";
        }

        let html = `<strong>Совпадение:</strong> ${similarity.toFixed(1)}%<br>`;
        html += `<strong>Оценка:</strong> ${evaluation}`;

        if (errors.length > 0) {
          html += "<p><strong>Основные ошибки:</strong></p><ul>";
          errors.forEach(e => {
            html += `<li>На ${e.time.toFixed(1)} сек — ${e.expected}</li>`;
          });
          html += "</ul>";
        }

        summaryBox.innerHTML = html;
        summaryBox.className = className;
        summaryBox.classList.add("summary-box");
        summaryBox.style.display = "block";
      } catch (err) {
        summaryBox.innerHTML = "❌ Ошибка при анализе MIDI.";
        summaryBox.className = "bad";
        summaryBox.style.display = "block";
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(file2);
  } catch (err) {
    summaryBox.innerHTML = "❌ Не удалось загрузить эталонный MIDI.";
    summaryBox.className = "bad";
    summaryBox.style.display = "block";
    console.error(err);
  }
});
