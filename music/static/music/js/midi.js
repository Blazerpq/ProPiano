document.addEventListener("DOMContentLoaded", () => {
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    } else {
        document.getElementById("midi-status").innerText = "MIDI не поддерживается в вашем браузере.";
    }
});

function onMIDISuccess(midiAccess) {
    document.getElementById("midi-status").innerText = "MIDI-клавиатура подключена!";
    let inputs = midiAccess.inputs.values();
    for (let input of inputs) {
        input.onmidimessage = onMIDIMessage;
    }
}

function onMIDIFailure() {
    document.getElementById("midi-status").innerText = "Ошибка подключения MIDI.";
}

function onMIDIMessage(message) {
    let data = message.data;
    let note = data[1];
    let velocity = data[2];

    if (velocity > 0) {
        let noteName = midiNoteToName(note);
        let key = document.querySelector(`.key[data-note="${noteName}"]`);
        if (key) {
            key.classList.add("active");
            setTimeout(() => key.classList.remove("active"), 300);
        }
    }
}

function midiNoteToName(note) {
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    let octave = Math.floor(note / 12) - 1;
    let noteName = notes[note % 12] + octave;
    return noteName;
}
