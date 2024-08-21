function new_range(min,max)
{
    var r ={ 
        Min: min,
        Max: max 
    }
    return r;
}

/////////////////////////////////////////////////////////////////////////
// clamp 
//
function clamp(v, lower, upper) 
{
    return Math.min(Math.max(v, lower), upper);
}

/////////////////////////////////////////////////////////////////////////
// clamp to range
//
function clamp_to_range(v, r) 
{
    return clamp(v, r.Min, r.Max);
}

/////////////////////////////////////////////////////////////////////////
// Linear interpolate between two values
//
function lerp(a, b, t ) 
{
    var c = (a * t) + (b * (1-t));
    return c;
}

/////////////////////////////////////////////////////////////////////////
// Linear interpolate between two points
//
function lerp_point(a, b, t) 
{
    var p = 
    {
        x: lerp(a.x, b.x, t),
        y: lerp(a.y, b.y, t)
    };

    return p;
}

/////////////////////////////////////////////////////////////////////////
// Create a new 2D position object
//
class Position
{
    constructor(x, y) 
    {
        // Assign the RGB values as a property of `this`.
        this.x = x;
        this.y = y;
    }
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

function draw_centered_box( canvas_context, pos, width, height, color)
{
    var ex = pos.x - (width/2.0);
    var ey = pos.y - (height/2.0);
    canvas_context.fillStyle = color;  
    canvas_context.fillRect(
        ex, 
        ey, 
        width, height);
    canvas_context.fill();
}


