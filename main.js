import init, { fill } from './paint_engine/pkg/paint_engine.js';
const WIDTH = 800
const HEIGHT = 600
const cvs = document.getElementById("screen")
const ctx = cvs.getContext("2d")
cvs.width = WIDTH
cvs.height = HEIGHT

const lineWidthInput = document.getElementById("strokeWidth");
const colorInput = document.getElementById("colorInp");
const toolElements = document.querySelectorAll(".tools");

let clicked = false
let keepLoopAlive = false

const Tool = Object.freeze({ BRUSH: 0, ERASER: 1, FILL: 2 });
let currentTool = Tool.BRUSH;

function hexStringToRGB(hex) {
  hex = hex.replace('#', '');
  const num = parseInt(hex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  return { r, g, b };
}

async function setupApp() {
  // DEBUG
  await init();


  ctx.imageSmoothingEnabled = false;
  ctx.mozImageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.msImageSmoothingEnabled = false;

  // 1. Fill the entire canvas with solid white
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);


  toolElements.forEach((tool, i) => {
    let correspondingTool = null;
    const toolName = tool.id;

    if (tool.id == "brush")
      correspondingTool = Tool.BRUSH
    else if (tool.id == "eraser")
      correspondingTool = Tool.ERASER
    else if (tool.id == "fill")
      correspondingTool = Tool.FILL

    tool.addEventListener("click", () => {
      currentTool = correspondingTool;
      console.log(toolName)
    })
  });

  function freeHandTypeInit() {
    ctx.lineWidth = lineWidthInput.value
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.strokeStyle = colorInput.value
    ctx.beginPath();

  }
  function brushClick() {
    ctx.globalCompositeOperation = "source-over"
    freeHandTypeInit();
  }

  function eraserClick() {
    ctx.globalCompositeOperation = "destination-out"
    freeHandTypeInit();
  }

  function fillClick(x, y) {
    let data = ctx.getImageData(0, 0, WIDTH, HEIGHT);
    const col = hexStringToRGB(colorInput.value)
    fill(data.data, WIDTH, HEIGHT, col.r, col.g, col.b, x, y, 2500);
    ctx.putImageData(data, 0, 0);
  }

  cvs.addEventListener("mousedown", (e) => {
    const rect = cvs.getBoundingClientRect();
    let x = e.clientX - rect.left
    let y = e.clientY - rect.top
    // console.log("Clicked")
    if (currentTool == Tool.BRUSH) {
      brushClick();
    }
    if (currentTool == Tool.ERASER) {
      eraserClick()
    }
    clicked = true
    if (currentTool == Tool.FILL) {
      fillClick(x, y)
      clicked = false
    }

  })

  function brushMove(e, x, y) {

    ctx.lineTo(x, y);
    ctx.stroke()
    ctx.beginPath();
    ctx.moveTo(x, y)

  }

  function eraserMove(e, x, y) {
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  cvs.addEventListener("mousemove", (e) => {
    if (clicked) {
      const rect = cvs.getBoundingClientRect();
      let x = e.clientX - rect.left
      let y = e.clientY - rect.top

      if (currentTool == Tool.BRUSH) {
        brushMove(e, x, y);
      }
      else if (currentTool == Tool.ERASER) {
        eraserMove(e, x, y);
      }
    }
  })

  cvs.addEventListener("mouseleave", () => {
    clicked = false
  });

  cvs.addEventListener("mouseup", () => {
    console.log("Mouse Up")
    clicked = false
  });


  window.requestAnimationFrame(mainLoop)
}

function mainLoop(a) {

  window.requestAnimationFrame(mainLoop);
}

setupApp()