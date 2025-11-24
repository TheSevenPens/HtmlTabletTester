const appSettings = {
  canvasColor: "rgba(230, 230, 250, 1.0)",
  downloadFilename: "TabletTester_Untitled",
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

function resetAdvancedSettings() {
  uxProcessingSettings.pressureSmoothingSlider.value = 0.0;
  uxProcessingSettings.pressureCurveAmountSlider.value = 0.0;
  uxProcessingSettings.positionSmoothingSlider.value = 0.0;
  uxProcessingSettings.pressureQuantizationDropdown.value = 0.0;
  uxProcessingSettings.tiltSmoothingSlider.value = 0.0;
  updateSettingsFromUx();
}

function registerEventHandlers() {
  window.addEventListener("load", registerWindowLoadEventListeners, true);
  registerDocumentHotkeyEventListeners();
}

function registerDocumentHotkeyEventListeners() {
  // Hotkey for DELETE or BACKSPACE
  document.addEventListener("keydown", (e) => {
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault(); // Prevent browser back navigation
      clearCanvas();
    }
  });
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

function updateSettingsFromUx() {
    updateFormatSettingsFromUx();
    updateProcessingSettingsFromUx();
}

updateSettingsFromUx();
registerEventHandlers();
