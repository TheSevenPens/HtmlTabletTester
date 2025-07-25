function clearCanvas() 
{
    canvas_context.fillStyle = appsettings.canvas_color;
    canvas_context.fillRect(0, 0, canvas_el.width, canvas_el.height);
}

function draw_line( canvas_context, frompos, topos, width, color, linecap)
{
    canvas_context.lineWidth = width;
    canvas_context.strokeStyle = color;    
    canvas_context.beginPath();
    canvas_context.lineCap = linecap;
    canvas_context.moveTo(frompos.x, frompos.y);
    var midPoint = lerp_point(frompos, topos, 0.5);
    canvas_context.quadraticCurveTo(frompos.x, frompos.y, midPoint.x, midPoint.y);
    canvas_context.lineTo(topos.x, topos.y);
    canvas_context.stroke();
}

function draw_centered_box( canvas_context, pos, size, color)
{
    /*
    console.log("BOX");
    var ex = pos.x - (size.width/2.0);
    var ey = pos.y - (size.height/2.0);
    canvas_context.fillStyle = color;  
    canvas_context.fillRect(
        ex, 
        ey, 
        size.width, size.height);
    canvas_context.fill();*/
    draw_line( canvas_context, pos, pos, size, "rounded");
}


function drawPressureCurve() {
  curveCtx.clearRect(0, 0, curveCanvas.width, curveCanvas.height);
  curveCtx.beginPath();
  curveCtx.moveTo(0, curveCanvas.height);
  for (let x = 0; x <= curveCanvas.width; x++) {
    const pressure = x / curveCanvas.width;
    const curvedPressure = paint_settings.pressure_curve.apply( pressure );  
    const y = curveCanvas.height * (1 - curvedPressure);
    curveCtx.lineTo(x, y);
  }
  curveCtx.strokeStyle = "rgb(150,180,255)";
  curveCtx.lineWidth = 3;
  curveCtx.stroke();

  // Draw axes
  curveCtx.beginPath();
  curveCtx.moveTo(0, 0);
  curveCtx.lineTo(0, curveCanvas.height);
  curveCtx.lineTo(curveCanvas.width, curveCanvas.height);
  curveCtx.strokeStyle = "black";
  curveCtx.lineWidth = 1;
  curveCtx.stroke();
}

