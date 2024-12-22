const statusDiv = document.getElementById('status');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');

// Update status when the app toggles running state
window.electronAPI.onUpdateStatus((running) => {
    statusDiv.textContent = `Status: ${running ? 'Running' : 'Stopped'}`;
    startButton.disabled = running;
    stopButton.disabled = !running;
});

// Send start and stop events to the main process
startButton.addEventListener('click', () => window.electronAPI.toggleRunning(true));
stopButton.addEventListener('click', () => window.electronAPI.toggleRunning(false));
