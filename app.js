/////////////////////////////////////////////////////////////////////////

var app_settings = {
  canvas_color: "rgba(230, 230, 250, 1.0)",
  download_filename: "TabletTester_Untitled",
};

function initPage() {
  setCanvasProps();
}




function toggleSmoothingSettings() {
  const flyout = document.getElementById("smoothingFlyout");
  flyout.style.display = flyout.style.display === "none" ? "block" : "none";
}

function toggleStrokeStatsVisibility() {
  const checkbox = document.getElementById("toggleStrokeStatsCheckbox");
  const strokeStatsPanel = document.getElementById("strokeStatsPanel");
  strokeStatsPanel.style.display = checkbox.checked ? "block" : "none";
}

// Close flyout when clicking outside
document.addEventListener('click', function(event) {
  const smoothingFlyout = document.getElementById("smoothingFlyout");
  const smoothingButton = document.getElementById("smoothingButton");
  
  if (smoothingFlyout && smoothingButton && 
      !smoothingFlyout.contains(event.target) && 
      !smoothingButton.contains(event.target) &&
      smoothingFlyout.style.display !== "none") {
    smoothingFlyout.style.display = "none";
  }
});

function resetAdvancedSettings() {
  ux_processing_settings.pressure_smoothing_slider.value = 0.0;
  ux_processing_settings.pressure_curve_amount_slider.value = 0.0;
  ux_processing_settings.position_smoothing_slider.value = 0.0;
  ux_processing_settings.pressure_quantization_dropdown.value = 0.0;
  ux_processing_settings.tilt_smoothing_slider.value = 0.0;
  update_settings_from_ux();
}

function register_event_handlers() {
  window.addEventListener("load", register_window_load_event_listeners, true);
  register_document_hotkey_event_listeners();
}

function register_document_hotkey_event_listeners() {
  // Hotkey for DELETE or BACKSPACE
  document.addEventListener("keydown", (e) => {
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault(); // Prevent browser back navigation
      clearCanvas();
    }
  });
}

update_settings_from_ux();
register_event_handlers();
