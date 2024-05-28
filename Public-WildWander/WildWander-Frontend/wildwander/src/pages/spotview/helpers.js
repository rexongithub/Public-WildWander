export function displayAlert(message) {
    // Lock the page
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0)'; // Semi-transparent black overlay
    overlay.style.zIndex = '9998'; // Below the alert
    document.body.appendChild(overlay);

    const alertElement = document.createElement('div');
    alertElement.classList.add(
        'fixed', 'bottom-3', 'left-1/2', 'transform', '-translate-x-1/2', 'translate-y-full',
        'transition-all', 'duration-1000', 'ease-out'
    );
    alertElement.style.background = 'rgba(0, 0, 0, 0.7)';
    alertElement.style.color = '#fff';
    alertElement.style.padding = '10px 20px';
    alertElement.style.borderRadius = '5px';
    alertElement.style.zIndex = '9999';
    alertElement.style.textAlign = 'center';
    alertElement.style.width = '300px';

    // Message
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    alertElement.appendChild(messageElement);

    // Loading bar
    const loadingBar = document.createElement('div');
    loadingBar.style.position = 'absolute';
    loadingBar.style.bottom = '0';
    loadingBar.style.left = '0';
    loadingBar.style.width = '100%';
    loadingBar.style.height = '4px';
    loadingBar.style.background = 'rgba(255, 255, 255, 0.5)';
    alertElement.appendChild(loadingBar);

    const loadingBarFill = document.createElement('div');
    loadingBarFill.style.height = '100%';
    loadingBarFill.style.width = '100%';
    loadingBarFill.style.background = 'rgba(255, 255, 255, 0.8)';
    loadingBarFill.style.transition = 'width 2s linear';
    loadingBar.appendChild(loadingBarFill);

    document.body.appendChild(alertElement);

    // Triggering a reflow to start the transition
    alertElement.offsetHeight; // eslint-disable-line

    // Slide up animation
    alertElement.classList.remove('translate-y-full');

    // Start the loading bar animation
    setTimeout(() => {
        loadingBarFill.style.width = '0%';
    }, 10); // Allow slight delay for smooth transition


    // Automatically remove the alert and overlay after 2 seconds
    setTimeout(() => {
        alertElement.style.transitionTimingFunction = 'cubic-bezier(0.68, -0.55, 0.27, 1.55)';
        alertElement.classList.add('translate-y-full');
        alertElement.style.bottom = '-3rem';
        setTimeout(() => {
            alertElement.remove();
            overlay.remove(); // Remove the overlay when the alert is removed
        }, 1000); // Duration of the slide-up animation
    }, 2000); // Time before the alert is removed
}