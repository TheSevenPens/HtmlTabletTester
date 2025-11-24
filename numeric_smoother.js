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
    this.oldSmoothed = null;
  }

  apply(input) 
  {
    var output = input;
    if (this.oldSmoothed != null )
    {
        if (this.amount>0.0)
        {
            const alpha = 1.0-this.amount;
            output = ( alpha * input ) + ((1.0 - alpha) * this.oldSmoothed);
        }
    }
    this.oldSmoothed = output;
    return output;
  }

}

