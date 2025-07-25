

class RGBColor {
  constructor(r, g, b) {
    this.r = Math.max(0.0, Math.min(1.0, r));
    this.g = Math.max(0.0, Math.min(1.0, g));
    this.b = Math.max(0.0, Math.min(1.0, b));
  }

  static interpolate(color1, color2, t) {
    const tClamped = Math.max(0.0, Math.min(1.0, t));
    return new RGBColor(
      color1.r + (color2.r - color1.r) * tClamped,
      color1.g + (color2.g - color1.g) * tClamped,
      color1.b + (color2.b - color1.b) * tClamped
    );
  }

    toWebRGB() {
    const r = Math.round(this.r * 255);
    const g = Math.round(this.g * 255);
    const b = Math.round(this.b * 255);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

// CET-C7 key colors: Yellow, Magenta, Cyan, Green (approximate RGB values)
const cetC7_color_stops = [
    new RGBColor( 1.000, 1.000, 0.000 ) , // Yellow
    new RGBColor( 1.000, 0.000, 1.000 ), // Magenta
    new RGBColor( 0.000, 1.000, 1.000 ), // Cyan
    new RGBColor( 0.000, 8.000, 0.000 ), // Green
    new RGBColor( 1.000, 1.000, 0.000 )  // Yellow (cyclic)
];
const cetC7_angle_stops = [0, 90, 180, 270, 360]; // Angles for key colors

// Linear interpolation for RGB colors

// Get CET-C7 color for a given angle
function angle_to_color(angle, color_stops, angle_stops) {
    const normalizedAngle = angle % 360;
    let lowerIdx = 0;
    let upperIdx = 1;
    let t = 0;

    // Find the two closest stops
    for (let i = 0; i < angle_stops.length - 1; i++) {
        if (normalizedAngle >= angle_stops[i] && normalizedAngle <= angle_stops[i + 1]) {
            lowerIdx = i;
            upperIdx = i + 1;
            t = (normalizedAngle - angle_stops[i]) / (angle_stops[i + 1] - angle_stops[i]);
            break;
        }
    }

    // Interpolate between the two colors
    const output_color = RGBColor.interpolate(color_stops[lowerIdx], color_stops[upperIdx], t);
    const webcolor = output_color.toWebRGB();
    return webcolor;
}