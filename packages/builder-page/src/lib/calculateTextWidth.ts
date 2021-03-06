const canvas = document.createElement("canvas");
canvas.style.display = "none";
canvas.id="steedosPageCalculateTextWidthCanvas";

const initCanvas = ()=>{
  if(document.body && document.body.appendChild){
    if(!document.getElementById("steedosPageCalculateTextWidthCanvas")){
      document.body.appendChild(canvas);
    }
  }
}

export function calculateTextWidth(text: string, container = document.body) {
  initCanvas();
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const containerStyle = window.getComputedStyle(container);
    ctx.font = `${containerStyle.fontSize} ${containerStyle.fontFamily}`;
    const textMetrics = ctx.measureText(text);
    let actualWidth = textMetrics.width;
    if ("actualBoundingBoxLeft" in textMetrics) {
      // only available on evergreen browsers
      actualWidth = Math.abs(textMetrics.actualBoundingBoxLeft) + Math.abs(textMetrics.actualBoundingBoxRight);
    }
    return actualWidth;
  }

  return null;
}
