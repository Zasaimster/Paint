var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");


let isPainting = false;

canvas.addEventListener('mousemove', (e) => {
    if(!isPainting) return;
    const x = e.clientX;
    const y = e.clientY;

    ctx.lineWidth = 5;
    ctx.lineCap = "round";

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
})

canvas.addEventListener('mousedown', () => {
    isPainting = true;
});

canvas.addEventListener('mouseup', () => {
    isPainting = false;
    ctx.beginPath();
});

const run = () => {
    console.log("in run")
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("load", () => {
   run();
})