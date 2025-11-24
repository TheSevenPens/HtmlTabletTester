 class PointerRecord {
    constructor(canvasRect, ptrEvent) {
        // get the pressure reported in the event
        // if it is pointer pen event, just use that pressure
        // if it is any other kind of event, then just the maximum pressure
        const pressureRaw = clampToRange(ptrEvent.pressure, PRESSURE_RANGE);

        const canvasPosXRaw = ptrEvent.offsetX;
        const canvasPosYRaw = ptrEvent.offsetY;
        this.type = ptrEvent.type;
        this.buttons = ptrEvent.buttons;
        this.pointerType = ptrEvent.pointerType;

        this.screenPosX = ptrEvent.clientX;
        this.screenPosY = ptrEvent.clientY;

        this.canvasPosXRaw = canvasPosXRaw;
        this.canvasPosYRaw = canvasPosYRaw;

        this.canvasPosXProcessed = processingSettings.posXSmoother.apply(canvasPosXRaw);
        this.canvasPosYProcessed = processingSettings.posYSmoother.apply(canvasPosYRaw);

        this.pressureRaw = pressureRaw;
        this.pressureProcessed = processPressure(pressureRaw);

        this.buttons = ptrEvent.buttons;

        this.tiltX = ptrEvent.tiltX;
        this.tiltY = ptrEvent.tiltY;

        this.tiltAzimuth = radiansToDegrees(ptrEvent.azimuthAngle);
        this.tiltAltitude = radiansToDegrees(ptrEvent.altitudeAngle);

        this.tiltXProcessed = processingSettings.tiltXSmoother.apply(ptrEvent.tiltX);
        this.tiltYProcessed = processingSettings.tiltYSmoother.apply(ptrEvent.tiltY);

        this.tiltAzimuthProcessed = radiansToDegrees(processingSettings.tiltAzimuthSmoother.apply(ptrEvent.azimuthAngle));
        this.tiltAltitudeProcessed = radiansToDegrees(processingSettings.tiltAltitudeSmoother.apply(ptrEvent.altitudeAngle));

        this.barrelRotation = ptrEvent.twist;

        this.time = performance.now();

        this.velocity = 0;
        this.direction = 0;

        if (paintState.canvasPosOld != null) {
            const dx = this.canvasPosXProcessed - paintState.canvasPosOldAllEvents.x;
            const dy = this.canvasPosYProcessed - paintState.canvasPosOldAllEvents.y;

            if (paintState.timeOld != null) {
                const dt = (this.time - paintState.timeOld) / 1000.0;
                if (dt > 0) {

                    const dist = Math.hypot(dx, dy);
                    const rawSpeed = dist / dt;
                    const smoothedSpeed = processingSettings.velocitySmoother.apply(rawSpeed);
                    var direction = Math.atan2(dy, dx) * 180.0 / Math.PI;
                    if (direction < 0) {
                        direction = 359 + direction;
                    }

                    this.velocity = smoothedSpeed;
                    this.direction = direction;

                }
            }

        }

    }
}