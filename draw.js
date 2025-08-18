function clearCanvas() 
{
    app_canvas_context.fillStyle = app_settings.canvas_color;
    app_canvas_context.fillRect(0, 0, app_canvas_el.width, app_canvas_el.height);
}

function draw_line( canvas_context, from_pos, to_pos, width, color, linecap)
{
    canvas_context.lineWidth = width;
    canvas_context.strokeStyle = color;    
    canvas_context.beginPath();
    canvas_context.lineCap = linecap;
    canvas_context.moveTo(from_pos.x, from_pos.y);
    var midPoint = lerp_point(from_pos, to_pos, 0.5);
    canvas_context.quadraticCurveTo(from_pos.x, from_pos.y, midPoint.x, midPoint.y);
    canvas_context.lineTo(to_pos.x, to_pos.y);
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
  app_pressure_curve_canvas_ctx.clearRect(0, 0, app_pressure_curve_canvas.width, app_pressure_curve_canvas.height);
  app_pressure_curve_canvas_ctx.beginPath();
  app_pressure_curve_canvas_ctx.moveTo(0, app_pressure_curve_canvas.height);
  for (let x = 0; x <= app_pressure_curve_canvas.width; x++) {
    const pressure = x / app_pressure_curve_canvas.width;
    const curvedPressure = paint_settings.pressure_curve.apply( pressure );  
    const y = app_pressure_curve_canvas.height * (1 - curvedPressure);
    app_pressure_curve_canvas_ctx.lineTo(x, y);
  }
  app_pressure_curve_canvas_ctx.strokeStyle = "rgb(150,180,255)";
  app_pressure_curve_canvas_ctx.lineWidth = 3;
  app_pressure_curve_canvas_ctx.stroke();

  // Draw axes
  app_pressure_curve_canvas_ctx.beginPath();
  app_pressure_curve_canvas_ctx.moveTo(0, 0);
  app_pressure_curve_canvas_ctx.lineTo(0, app_pressure_curve_canvas.height);
  app_pressure_curve_canvas_ctx.lineTo(app_pressure_curve_canvas.width, app_pressure_curve_canvas.height);
  app_pressure_curve_canvas_ctx.strokeStyle = "black";
  app_pressure_curve_canvas_ctx.lineWidth = 1;
  app_pressure_curve_canvas_ctx.stroke();
}

