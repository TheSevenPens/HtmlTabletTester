
function paintStrokeStart()
{
    if (uxFormatSettings.eraseOnStrokeStart.checked)
    {
        clearCanvas();
    }
    paintState.isDrawing = true;
    paintStrokeStats.ptreventCount = 0;
    paintStrokeStats.startTime = performance.now();
    processingSettings.posXSmoother.resetState();
    processingSettings.posYSmoother.resetState();
    processingSettings.pressureSmoother.resetState();
    processingSettings.tiltXSmoother.resetState();
    processingSettings.tiltYSmoother.resetState();
    processingSettings.tiltAzimuthSmoother.resetState();
    processingSettings.tiltAltitudeSmoother.resetState();
    processingSettings.velocitySmoother.resetState();
}

function paintStrokeStop()
{
    paintState.isDrawing = false;
    paintStrokeStats.strokeCount = paintStrokeStats.strokeCount + 1;
    paintStrokeStats.endTime = performance.now();
    paintStrokeStats.duration = Math.round(paintStrokeStats.endTime - paintStrokeStats.startTime);
}


function getDabSize( ptrRec )
{
    var newSize = paintSettings.brushSize;

    // If the brush size is not dynamic,
    // simply use the the user's
    // desired brush size

    // HANDLE DAB SIZE
    if (paintSettings.brushSizeControl === "USER")
    {
        paintCurrentDabSettings.brushSize = newSize;
    }
    else if (paintSettings.brushSizeControl === "PRESSURE")
    {
        newSize = newSize * ptrRec.pressureProcessed; 
    }
    else if (paintSettings.brushSizeControl === "TILTX")
    {
        newSize = newSize * ptrRec.tiltXProcessed / pointerConstants.maxTiltX;
    }
    else if (paintSettings.brushSizeControl === "TILTY")
    {
        newSize = newSize * ptrRec.tiltYProcessed / pointerConstants.maxTiltY;
    }
    else if (paintSettings.brushSizeControl === "TILTAZ")
    {
        newSize = newSize * ptrRec.tiltAzimuthProcessed / pointerConstants.maxTiltAzimuth;
    }
    else if (paintSettings.brushSizeControl === "TILTALT")
    {
        newSize = newSize * ((1.0 - (ptrRec.tiltAltitudeProcessed / pointerConstants.maxTiltAltitude)) + 0.05); // when pen is vertical size is small, as pen tilts dab gets larger
    }
    newSize = clampToRange( newSize, BRUSHSIZE_RANGE )
    newSize = roundTo3DecimalPlaces( newSize );
    return newSize;
}

function getDabColor( ptrRec )
{
    var dabColor = settingStylusPenColor;

    if (ptrRec.buttons === pointerButtonCode.eraser)
    {
        dabColor = appSettings.canvasColor;
    }
    else if (paintSettings.brushColorControl ==="PRESSURE")
    {
        const hue1 = lerp(360, 150, ptrRec.pressureProcessed);
        dabColor = `hsl(${hue1}, 100%, 50%)`;
    }
    else if (paintSettings.brushColorControl ==="TILTALT")
    {
        const hue2 = lerp(360, 150, ptrRec.tiltAltitudeProcessed/ pointerConstants.maxTiltAltitude);
        dabColor = `hsl(${hue2}, 100%, 50%)`;
    }
    else if (paintSettings.brushColorControl ==="TILTAZ")
    {
        dabColor = angleToColor( ptrRec.tiltAzimuthProcessed, azimuthColorStops, azimuthAngleStops ) ;
        dabColor = dabColor.toWebRGB();
    }
    else if (paintSettings.brushColorControl ==="TILTX")
    {
        const hue3 = lerp(360, 150, ptrRec.tiltXProcessed/pointerConstants.maxTiltX );
        dabColor = `hsl(${hue3}, 100%, 50%)`;
    }
    else if (paintSettings.brushColorControl ==="TILTY")
    {
        const hue4 = lerp(360, 150, ptrRec.tiltYProcessed/pointerConstants.maxTiltY);
        dabColor = `hsl(${hue4}, 100%, 50%)`;
    }
    else if (paintSettings.brushColorControl ==="BARRELROTATION")
    {
        dabColor = getCETColor( ptrRec.barrelRotation) ;
    }
    else if (paintSettings.brushColorControl ==="ERASER")
    {
        dabColor = appSettings.canvasColor;
    }
    else if (paintSettings.brushColorControl ==="RED")
    {
        // CANVAS COLOR TO COLOR
        dabColor = "rgba(250, 0, 0, 1.0)";
    }

    return dabColor;
}

function updateDabSettings( ptrRec )
{
    // SIZE
    const newSize = getDabSize( ptrRec );
    paintCurrentDabSettings.brushSize = newSize;

    // COLOR
    paintCurrentDabSettings.brushColor = getDabColor( ptrRec  );
}

function paintDab( ptrRec )
{
    if (ptrRec.pressureRaw <= 0)
    {
        // If No pressure input
        // - reset any smoothing
        processingSettings.posXSmoother.resetState();
        processingSettings.posYSmoother.resetState();
        processingSettings.pressureSmoother.resetState();
        processingSettings.tiltXSmoother.resetState();
        processingSettings.tiltYSmoother.resetState();
        processingSettings.tiltAzimuthSmoother.resetState();
        processingSettings.tiltAltitudeSmoother.resetState();

    }


    const currentPos = new Position( ptrRec.canvasPosXProcessed, ptrRec.canvasPosYProcessed);
    
    switch (ptrRec.type) 
    {
        case "pointerdown":
            paintStrokeStart();
            paintState.canvasPosOld = currentPos;
            break;

        case "pointermove":
            if (!paintState.isDrawing) 
            {
                return;
            }

            updateDabSettings(ptrRec);


            if (ptrRec.pressureRaw > 0) 
            {
                drawLine( appCanvasContext,
                    paintState.canvasPosOld, 
                    currentPos, 
                    paintCurrentDabSettings.brushSize,
                    paintCurrentDabSettings.brushColor,
                    paintSettings.linecap); 
            }

            paintState.canvasPosOld = currentPos;
            break;
    }

}

