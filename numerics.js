/////////////////////////////////////////////////////////////////////////
// for ranges that have a lower and upper value
//
class OrderedRange
{
    constructor(min,max)
    {
        this.Min = min;
        this.Max = max;
    }
}

/////////////////////////////////////////////////////////////////////////
// 2D position
//
class Position
{
    constructor(x, y) 
    {
        this.x = x;
        this.y = y;
    }
}

/////////////////////////////////////////////////////////////////////////
// 2D size
//
class Size
{
    constructor(w, h) 
    {
        this.width = w;
        this.height = h;
    }
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

function round_to_4_decimal_places(v) 
{
  return Math.round(v * 10000) / 10000;
}

function round_to_3_decimal_places(v) 
{
  return Math.round(v * 1000) / 1000;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function GetSmoothingValue(input) 
{
    // first map it with a curve
    var output1 =  easeOutCubic( input );
    // second restrict to a slightly smaller range 
    var output2 = lerp( 0.985, 0.0, output1);
    // round it so that we easier-to-read numbers for the user
    var output3 = round_to_4_decimal_places(output2); 

    return output3;
}

function radians_to_degrees(r)
{
    return (r * 57.2958);
}


class NumericCurve {
  constructor() {
    this.setCurveAmount(0.0);
  }


  setCurveAmount(value)
  {
    this.amount = value;
  }

  reset() {
    this.setCurveAmount(0.0);
  }

  apply(input) {
    var output = input;
    var z = -1.0 *  this.amount;
    if (z==0.0)
    {
        output = input;
    }
    else if (z>0.0)
    {
        output = Math.pow(input, 1.0 - z);
    }
    else if (z<0.0)
    {
        output = Math.pow(input, 1.0/ (1.0 + z));
    }

    return output;
  }

}


class NumericSmoother {
  constructor() {
    this.setSmoothingAmount(0.0);
    this.old_smoothed = null;
  }


  setSmoothingAmount(value)
  {
    this.amount = value;
  }

  reset() 
  {
    this.old_smoothed = null;
  }

  apply(input) 
  {
    var output = input;
    if (this.old_smoothed != null )
    {
        if (this.amount>0.0)
        {
            var alpha = 1.0-this.amount;
            output = ( alpha * input ) + ((1.0 - alpha) * this.old_smoothed);
        }
    }
    this.old_smoothed = output;
    return output;
  }

}

