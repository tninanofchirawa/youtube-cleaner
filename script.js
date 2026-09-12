(function () {
    'use strict';

    function disableAutoplay() {
        // Turn off YouTube's native autoplay switch
        const autoPlayToggle = document.querySelector('.ytp-autonav-toggle-button');
        if (autoPlayToggle && autoPlayToggle.getAttribute('aria-checked') === 'true') {
            autoPlayToggle.click();
        }
    }

    // Monitor DOM to turn off autoplay toggle as soon as player initialises
    const observer = new MutationObserver(() => {
        disableAutoplay();
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    window.addEventListener('load', disableAutoplay);
    window.addEventListener('yt-navigate-finish', disableAutoplay);
})();