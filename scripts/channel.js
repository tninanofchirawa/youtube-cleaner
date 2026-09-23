/**
 * ============================================================================
 * YOUTUBE CLEANER - Channel Pages Script
 * ============================================================================
 */

(function (window) {
    'use strict';

    function scrubChannelShortsTabs() {
        var tabs = document.querySelectorAll('yt-tab-shape, tp-yt-paper-tab, .yt-tab-shape-wiz');
        tabs.forEach(function (tab) {
            var tabTitle = tab.getAttribute('tab-title') || '';
            var text = (tab.textContent || '').trim();
            if (tabTitle.toLowerCase() === 'shorts' || text.toLowerCase() === 'shorts') {
                tab.style.display = 'none';
            }
        });
    }

    window.YTCleanerChannel = {
        scrubChannelShortsTabs: scrubChannelShortsTabs
    };

})(window);
