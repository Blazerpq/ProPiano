const fileInput = document.getElementById("fileInput");
    const sheetContainer = document.getElementById("sheet");
    const logDiv = document.getElementById("log");

    const clearBtn = document.getElementById("clearBtn");
    const zoomInBtn = document.getElementById("zoomInBtn");
    const zoomOutBtn = document.getElementById("zoomOutBtn");
    const prevPageBtn = document.getElementById("prevPageBtn");
    const nextPageBtn = document.getElementById("nextPageBtn");

    let zoom = 1.0;
    let currentPage = 1;
    let totalPages = 1;

    const osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay(sheetContainer, {
      backend: "svg",
      drawTitle: true,
      autoResize: true,
    });

    function updateView() {
      osmd.zoom = zoom;
      osmd.render();
    }

    fileInput.addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      logDiv.textContent = "";

      const reader = new FileReader();
      reader.onload = async function(e) {
        try {
          const xml = e.target.result;

          if (!xml.includes("<score-partwise")) {
            logDiv.textContent = "❌ Поддерживается только формат score-partwise (.musicxml)";
            return;
          }

          await osmd.load(xml);
          osmd.render();

          currentPage = 1;
          totalPages = osmd.Sheet?.PageCount || 1;
        } catch (err) {
          console.error("Ошибка загрузки XML:", err);
          logDiv.textContent = "❌ Не удалось отобразить ноты.";
        }
      };
      reader.readAsText(file);
    });

    clearBtn.addEventListener("click", () => {
      sheetContainer.innerHTML = "";
      fileInput.value = "";
      logDiv.textContent = "";
    });

    zoomInBtn.addEventListener("click", () => {
      zoom += 0.1;
      updateView();
    });

    zoomOutBtn.addEventListener("click", () => {
      zoom = Math.max(0.2, zoom - 0.1);
      updateView();
    });

    nextPageBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        osmd.renderPage(currentPage);
      }
    });

    prevPageBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        osmd.renderPage(currentPage);
      }
    });

const midiFile1Input = document.getElementById("midiFile1");
    const midiFile2Input = document.getElementById("midiFile2");
    const compareMidiBtn = document.getElementById("compareMidiBtn");
    const summaryBox = document.getElementById("summary-box");

    
    async function parseMidiFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const midi = new Midi(reader.result);
            resolve(midi);
          } catch (err) {
            reject("Ошибка при парсинге MIDI файла");
          }
        };
        reader.readAsArrayBuffer(file);
      });
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
      const file1 = midiFile1Input.files[0];
      const file2 = midiFile2Input.files[0];
      if (!file1 || !file2) {
        summaryBox.innerHTML = "❌ Пожалуйста, загрузите оба файла.";
        summaryBox.className = "bad";
        summaryBox.style.display = "block";
        return;
      }

      try {
        const midi1 = await parseMidiFile(file1);
        const midi2 = await parseMidiFile(file2);
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
        summaryBox.innerHTML = "❌ Ошибка сравнения.";
        summaryBox.className = "bad";
        summaryBox.style.display = "block";
        console.error(err);
      }
    });