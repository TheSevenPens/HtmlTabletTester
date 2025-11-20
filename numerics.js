
function format4_1(num) {
    const nbsp = "\u00A0";
    return num.toFixed(1).padStart(6, nbsp );
}

function format1_4(num) {
    return num.toFixed(4);
}


function round_to_4_decimal_places(v)
{
  return Math.round(v * 10000) / 10000;
}

function round_to_3_decimal_places(v) 
{
  return Math.round(v * 1000) / 1000;
}

function round_to_2_decimal_places(v) 
{
  return Math.round(v * 100) / 100;
}

function round_to_1_decimal_places(v) 
{
  return Math.round(v * 10) / 10;
}

function radians_to_degrees(r)
{
    return (r * 57.2958);
}

function quantize(value, levels) 
{
  if (typeof value !== 'number' || value < 0 || value > 1) {
    throw new Error('Input value must be a number between 0.0 and 1.0 inclusive.');
  }
  if (!Number.isInteger(levels) || levels < 2) {
    throw new Error('Number of quantization levels must be an integer greater than or equal to 2.');
  }
  return Math.round(value * (levels - 1)) / (levels - 1);
}

function GetSmoothingValue(input) 
{
    // first map it with a curve
    const output1 =  easeOutCubic( input );
    // second restrict to a slightly smaller range 
    const output2 = lerp( 0.985, 0.0, output1);
    // round it so that we easier-to-read numbers for the user
    const output3 = round_to_4_decimal_places(output2);

    return output3;
}

class NumericCurve {
  constructor() {
    this.setCurveAmount(0.0);
  }


  setCurveAmount(value)
  {
    this.amount = value;
  }

  resetSettings() 
  {
    this.setCurveAmount(0.0);
  }

  resetState() 
  {
    // do nothing
  }

  apply(input) {
    var output = input;
    const z = -1.0 *  this.amount;
    if (z===0.0)
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
  constructor(amount) {
    this.resetSettings();
    this.resetState();
    this.setSmoothingAmount(amount);
  }


  setSmoothingAmount(value)
  {
    this.amount = value;
  }

  resetSettings() 
  {
    this.setSmoothingAmount(0.0);
  }

  resetState() 
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
            const alpha = 1.0-this.amount;
            output = ( alpha * input ) + ((1.0 - alpha) * this.old_smoothed);
        }
    }
    this.old_smoothed = output;
    return output;
  }

}

function tiltxy_to_tiltazimuth(tiltX,tiltY)
{
    var azimuth = tiltX || tiltY 
                ? (Math.atan2(tiltY, tiltX) * 180 / Math.PI) 
                : 0;
    if (azimuth<0) {
        azimuth = 360  + azimuth;
    }
    return azimuth;
}

function tiltxy_to_tiltltitude(tiltX, tiltY)
{
   const angle = tiltX  || tiltY 
                ? (Math.sqrt( tiltX  * tiltX  + tiltY  * tiltY))
                : 0;
    return angle;
}