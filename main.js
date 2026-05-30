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

cvs.addEventListener("mousedown", () => {
  // console.log("Clicked")
  if (currentTool == Tool.BRUSH) {
    brushClick();
  }
  if (currentTool == Tool.ERASER) {
    eraserClick()
  }
  clicked = true
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

function mainLoop(a) {

  window.requestAnimationFrame(mainLoop);
}

window.requestAnimationFrame(mainLoop)