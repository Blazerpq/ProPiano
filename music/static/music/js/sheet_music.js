document.addEventListener("DOMContentLoaded", () => {
    let canvas = document.getElementById("sheet-music");
    let ctx = canvas.getContext("2d");

    canvas.width = 800;
    canvas.height = 300;

    let notes = [
        { name: "C4", x: 50, y: 100 },
        { name: "D4", x: 150, y: 100 },
        { name: "E4", x: 250, y: 100 },
        { name: "F4", x: 350, y: 100 },
        { name: "G4", x: 450, y: 100 },
        { name: "A4", x: 550, y: 100 },
        { name: "B4", x: 650, y: 100 },
    ];

    function drawNotes() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        notes.forEach(note => {
            ctx.beginPath();
            ctx.arc(note.x, note.y, 10, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    function moveNotes() {
        notes.forEach(note => note.x -= 2);
        drawNotes();
        requestAnimationFrame(moveNotes);
    }

    drawNotes();
    moveNotes();
});
