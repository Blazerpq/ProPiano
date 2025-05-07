// Инициализация элементов управления
const sheetContainer = document.getElementById("sheet");
const logDiv = document.getElementById("log");
const zoomInBtn = document.getElementById("zoomInBtn");
const zoomOutBtn = document.getElementById("zoomOutBtn");
const midiFile2Input = document.getElementById("midiFile2");
const compareMidiBtn = document.getElementById("compareMidiBtn");
const summaryBox = document.getElementById("summary-box");

// Настройки OSMD
let zoom = 1.0;
let currentPage = 1;
let totalPages = 1;
const osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay(sheetContainer, {
    backend: "svg",
    drawTitle: true,
    autoResize: true
});

// Функции управления нотами
function updateView() {
    osmd.zoom = zoom;
    osmd.render();
}

async function loadMusicXML(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Ошибка загрузки нот');
        const xml = await response.text();
        
        if (!xml.includes("<score-partwise")) {
            logDiv.textContent = "❌ Формат файла не поддерживается";
            return false;
        }

        await osmd.load(xml);
        osmd.render();
        currentPage = 1;
        totalPages = osmd.Sheet?.PageCount || 1;
        return true;
    } catch (err) {
        logDiv.textContent = "❌ Ошибка загрузки нот";
        console.error(err);
        return false;
    }
}

// Обработчики событий

// Автоматическая загрузка нот при открытии страницы
document.addEventListener('DOMContentLoaded', async () => {
    const sheetMusicUrlElement = document.getElementById('sheet-music-url');
    if (sheetMusicUrlElement && sheetMusicUrlElement.dataset.url) {
        await loadMusicXML(sheetMusicUrlElement.dataset.url);
    } else {
        logDiv.textContent = "❌ Ноты недоступны";
    }
});


zoomInBtn.addEventListener("click", () => {
    zoom += 0.1;
    updateView();
});

zoomOutBtn.addEventListener("click", () => {
    zoom = Math.max(0.2, zoom - 0.1);
    updateView();
});



// MIDI сравнение
async function parseMidiBuffer(buffer) {
    try {
        return new Midi(buffer);
    } catch (err) {
        console.error("Ошибка парсинга MIDI:", err);
        throw new Error("Некорректный MIDI файл");
    }
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
        match ? matchCount++ : errors.push({
            time: note1.time,
            expected: `Нота ${note1.midi}, длит. ${note1.duration.toFixed(2)}`
        });
    });

    const similarity = (matchCount / Math.max(notes1.length, notes2.length)) * 100;
    return { similarity, errors: errors.slice(0, 3) };
}

compareMidiBtn.addEventListener("click", async () => {
    summaryBox.style.display = "none";
    
    // Загрузка эталонного MIDI
    const midiRefElement = document.getElementById('midi-ref-url');
    if (!midiRefElement?.dataset?.url) {
        summaryBox.innerHTML = "❌ Эталонный MIDI отсутствует";
        summaryBox.className = "bad";
        summaryBox.style.display = "block";
        return;
    }

    try {
        // Загрузка эталона
        const refResponse = await fetch(midiRefElement.dataset.url);
        const refMidiBuffer = await refResponse.arrayBuffer();
        const midiRef = await parseMidiBuffer(refMidiBuffer);

        // Загрузка пользовательского MIDI
        const userFile = midiFile2Input.files[0];
        if (!userFile) {
            summaryBox.innerHTML = "❌ Загрузите MIDI файл для сравнения";
            summaryBox.className = "bad";
            summaryBox.style.display = "block";
            return;
        }

        const userMidiBuffer = await userFile.arrayBuffer();
        const midiUser = await parseMidiBuffer(userMidiBuffer);

        // Сравнение
        const { similarity, errors } = compareMIDI(midiRef, midiUser);
        
        // Формирование отчета
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

        let html = `<div class="summary-content">
            <strong>Совпадение:</strong> ${similarity.toFixed(1)}%<br>
            <strong>Оценка:</strong> ${evaluation}`;

        if (errors.length > 0) {
            html += `<p><strong>Основные ошибки:</strong></p><ul>`;
            errors.forEach(e => {
                html += `<li>На ${e.time.toFixed(1)} сек — ${e.expected}</li>`;
            });
            html += `</ul>`;
        }
        html += `</div>`;

        summaryBox.innerHTML = html;
        summaryBox.className = `${className} summary-box`;
        summaryBox.style.display = "block";

    } catch (err) {
        summaryBox.innerHTML = `❌ Ошибка сравнения: ${err.message}`;
        summaryBox.className = "bad summary-box";
        summaryBox.style.display = "block";
        console.error(err);
    }
});

import { initMIDI } from "./midi7.js";

document.addEventListener("DOMContentLoaded", function () {
    const midi = initMIDI("midi-status", "midi-log");

    const connectBtn = document.getElementById("connect-midi-btn");
    connectBtn.addEventListener("click", () => {
        midi.connect();
    });
});

// Добавляем новые элементы управления
const recordMidiBtn = document.getElementById("recordMidiBtn");
const recordingStatus = document.getElementById("recording-status");

// Инициализация MIDI с записью
document.addEventListener("DOMContentLoaded", function () {
    const midi = initMIDI("midi-status", "midi-log");

    const connectBtn = document.getElementById("connect-midi-btn");
    connectBtn.addEventListener("click", () => {
        midi.connect();
    });

    // Обработчик кнопки записи
    recordMidiBtn.addEventListener("click", async () => {
        if (!midi.isRecording()) {
            const success = midi.startRecording();
            if (success) {
                recordMidiBtn.textContent = "⏹ Стоп";
                recordingStatus.textContent = "Статус: запись...";
            }
        } else {
            const midiBlob = midi.stopRecording();
            recordMidiBtn.textContent = "⏺ Запись";
            recordingStatus.textContent = "Статус: не записывается";
            
            if (midiBlob) {
                // Создаем временную ссылку для скачивания
                const url = URL.createObjectURL(midiBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'recorded-performance.mid';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                // Автоматически загружаем записанный файл для сравнения
                const dataTransfer = new DataTransfer();
                const file = new File([midiBlob], 'recorded-performance.mid', { type: 'audio/midi' });
                dataTransfer.items.add(file);
                midiFile2Input.files = dataTransfer.files;
                
                logDiv.textContent = "✅ Запись сохранена и готова к сравнению";
            }
        }
    });
});