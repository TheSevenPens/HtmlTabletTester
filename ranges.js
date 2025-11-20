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
// clamp 
//
function clamp(v, lower, upper) 
{
    return Math.min(Math.max(v, lower), upper);
}

/////////////////////////////////////////////////////////////////////////
// clamp to range
//
function clampToRange(v, r) 
{
    return clamp(v, r.Min, r.Max);
}

