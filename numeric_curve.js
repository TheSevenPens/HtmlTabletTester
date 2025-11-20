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

