// CET-C7 key colors: Yellow, Magenta, Cyan, Green (approximate RGB values)
const cetC7 = [
    [1.000, 1.000, 0.000], // Yellow
    [1.000, 0.000, 1.000], // Magenta
    [0.000, 1.000, 1.000], // Cyan
    [0.000, 8.000, 0.000], // Green
    [1.000, 1.000, 0.000]  // Yellow (cyclic)
];
const cetC7Stops = [0, 90, 180, 270, 360]; // Angles for key colors

// Linear interpolation for RGB colors
function interpolateColor(color1, color2, t) {
    const r = color1[0] + t * (color2[0] - color1[0]);
    const g = color1[1] + t * (color2[1] - color1[1]);
    const b = color1[2] + t * (color2[2] - color1[2]);
    return [r, g, b];
}

// Get CET-C7 color for a given angle
function getCETColor(angle) {
    const normalizedAngle = angle % 360;
    let lowerIdx = 0;
    let upperIdx = 1;
    let t = 0;

    // Find the two closest stops
    for (let i = 0; i < cetC7Stops.length - 1; i++) {
        if (normalizedAngle >= cetC7Stops[i] && normalizedAngle <= cetC7Stops[i + 1]) {
            lowerIdx = i;
            upperIdx = i + 1;
            t = (normalizedAngle - cetC7Stops[i]) / (cetC7Stops[i + 1] - cetC7Stops[i]);
            break;
        }
    }

    // Interpolate between the two colors
    const [r, g, b] = interpolateColor(cetC7[lowerIdx], cetC7[upperIdx], t);
    return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}