export function initMIDI(statusElementId, logElementId) {
    const statusEl = document.getElementById(statusElementId);
    const logEl = document.getElementById(logElementId);
    let midiInputs = [];
    let isRecording = false;
    let recordedNotes = [];
    let recordingStartTime = 0;

    function log(msg) {
        console.log(msg);
        if (logEl) {
            logEl.innerHTML = msg + "<br>" + logEl.innerHTML;
        }
    }

    function onMIDIMessage(event) {
        if (!isRecording) return;
        
        const [command, note, velocity] = event.data;
        const time = performance.now() - recordingStartTime;
        
        // Note-on (144) and note-off (128) events
        if (command === 144 && velocity > 0) {
            recordedNotes.push({
                type: 'noteOn',
                note,
                velocity,
                time: time / 1000 // convert to seconds
            });
        } else if (command === 128 || (command === 144 && velocity === 0)) {
            recordedNotes.push({
                type: 'noteOff',
                note,
                time: time / 1000
            });
        }
    }

    function onMIDISuccess(midiAccess) {
        midiInputs = Array.from(midiAccess.inputs.values());

        if (midiInputs.length === 0) {
            statusEl.textContent = "⚠️ Нет подключённых MIDI-устройств";
            log("Доступ к MIDI получен, но устройства не найдены.");
        } else {
            statusEl.textContent = "✅ MIDI-устройство подключено";
            for (let input of midiInputs) {
                input.onmidimessage = onMIDIMessage;
                log(`🎹 Найдено устройство: ${input.name}`);
            }
        }
    }

    function onMIDIFailure() {
        statusEl.textContent = "❌ Не удалось подключиться к MIDI";
        log("Ошибка подключения к MIDI.");
    }

    function startRecording() {
        if (midiInputs.length === 0) {
            log("❌ Нет подключенных MIDI устройств для записи");
            return false;
        }
        
        recordedNotes = [];
        recordingStartTime = performance.now();
        isRecording = true;
        log("⏺ Начата запись MIDI...");
        return true;
    }

    function stopRecording() {
        isRecording = false;
        log("⏹ Запись MIDI завершена");
        return generateMIDIFile();
    }

    function generateMIDIFile() {
        if (recordedNotes.length === 0) {
            log("❌ Нет записанных нот");
            return null;
        }
    
        const midi = new Midi();
        const track = midi.addTrack();
    
        track.instrument.number = 0; // Установить инструмент: фортепиано
        midi.header.setTempo(120);   // Установить темп
    
        const activeNotes = {};
    
        recordedNotes.forEach(event => {
            if (event.type === 'noteOn') {
                activeNotes[event.note] = event.time;
            } else if (event.type === 'noteOff' && activeNotes[event.note] !== undefined) {
                const startTime = activeNotes[event.note];
                const duration = Math.max(0.05, event.time - startTime);
    
                track.addNote({
                    midi: event.note,
                    time: startTime,
                    duration: duration,
                    velocity: 0.8 // громкость от 0 до 1
                });
    
                delete activeNotes[event.note];
            }
        });
    
        const midiArrayBuffer = midi.toArray();
        return new Blob([midiArrayBuffer], { type: 'audio/midi' });
    }    

    function connect() {
        if (navigator.requestMIDIAccess) {
            console.log("Запрос доступа к MIDI...");
            statusEl.textContent = "⏳ Ожидание подключения...";
            navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
        } else {
            statusEl.textContent = "❌ Web MIDI API не поддерживается";
            log("Браузер не поддерживает Web MIDI API.");
        }
    }

    return { 
        connect,
        startRecording,
        stopRecording,
        isRecording: () => isRecording
    };
}