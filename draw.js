function clearCanvas() 
{
    canvas_context.fillStyle = setting_canvas_color;
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
    var ex = pos.x - (size.width/2.0);
    var ey = pos.y - (size.height/2.0);
    canvas_context.fillStyle = color;  
    canvas_context.fillRect(
        ex, 
        ey, 
        size.width, size.height);
    canvas_context.fill();
}


