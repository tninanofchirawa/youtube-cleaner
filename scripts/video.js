/**
 * ============================================================================
 * YOUTUBE CLEANER - Video Watch Page & Autoplay Script
 * ============================================================================
 */

(function (window) {
    'use strict';

    var lastDisabledAutoplayVideoId = '';

    function disableAutoplay() {
        var searchParams = new URLSearchParams(window.location.search);
        if (searchParams.has('list')) return;

        var videoId = searchParams.get('v');
        if (!videoId || videoId === lastDisabledAutoplayVideoId) return;

        var autoPlayToggle = document.querySelector('.ytp-autonav-toggle-button');
        if (autoPlayToggle) {
            if (autoPlayToggle.getAttribute('aria-checked') === 'true') {
                autoPlayToggle.click();
            }
            lastDisabledAutoplayVideoId = videoId;
        }
    }

    function scrubDescriptionHubLinks() {
        if (!window.location.pathname.startsWith('/watch')) return;

        var descriptionElements = document.querySelectorAll(
            'ytd-rich-metadata-renderer, ytd-rich-metadata-row-renderer, ytd-metadata-row-container-renderer, ytd-metadata-row-renderer, ytd-structured-description-content-renderer, ytd-info-panel-content-renderer, ytd-video-attributes-section-renderer'
        );

        descriptionElements.forEach(function (el) {
            el.remove();
        });

        var hubKeywordsRegex = /\b(gaming|music\.youtube\.com|podcasts|playables|premium|trending|subscriptions|storefront|news hub|live hub|sports hub)\b/i;
        var links = document.querySelectorAll('#description a[href], #description-inner a[href], ytd-watch-metadata a[href]');

        links.forEach(function (link) {
            var href = link.getAttribute('href') || '';
            var text = (link.textContent || '').toLowerCase();

            if (hubKeywordsRegex.test(href) || hubKeywordsRegex.test(text)) {
                var card = link.closest('ytd-rich-metadata-renderer, ytd-metadata-row-renderer, ytd-structured-description-content-renderer') || link;
                card.remove();
            }
        });
    }

    window.YTCleanerVideo = {
        disableAutoplay: disableAutoplay,
        scrubDescriptionHubLinks: scrubDescriptionHubLinks
    };

})(window);
