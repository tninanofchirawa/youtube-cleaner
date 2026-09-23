/**
 * ============================================================================
 * YOUTUBE CLEANER - Core Entry Point & SPA Mutation Observer
 * ============================================================================
 */

(function (window) {
    'use strict';

    var C = window.YTCleanerCommon;
    var Home = window.YTCleanerHome;
    var Channel = window.YTCleanerChannel;
    var Video = window.YTCleanerVideo;
    var Search = window.YTCleanerSearch;

    /* 1. HIGH-PERFORMANCE PATH-CACHED MUTATION OBSERVER */
    if (window.__ytCleanerObserver) {
        window.__ytCleanerObserver.disconnect();
    }

    window.__ytIsTicking = false;
    var lastObservedPath = '';

    function handleDOMMutation() {
        var currentPath = window.location.pathname + window.location.search;

        if (currentPath !== lastObservedPath) {
            lastObservedPath = currentPath;
            C.redirectBannedHubs();
            C.updatePageStateFlags();
            if (Home) Home.syncCenteredSearchUI();
            if (Video) Video.disableAutoplay();
        }

        if (!window.__ytIsTicking) {
            window.__ytIsTicking = true;
            window.requestAnimationFrame(function () {
                if (Search) Search.scrubSearchFeed();
                if (Video) Video.scrubDescriptionHubLinks();
                if (Channel) Channel.scrubChannelShortsTabs();
                window.__ytIsTicking = false;
            });
        }
    }

    window.__ytCleanerObserver = new MutationObserver(handleDOMMutation);
    window.__ytCleanerObserver.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    /* 2. SPA NAVIGATION & LINK INTERCEPTORS */
    window.addEventListener('yt-navigate-start', function () {
        C.redirectBannedHubs();
        C.updatePageStateFlags();
        var isHome = window.location.pathname === '/' || window.location.pathname === '';
        if (!isHome) {
            var container = document.getElementById('custom-mindmap-container');
            if (container) {
                container.style.display = 'none';
                container.remove();
            }
        }
    });

    document.addEventListener('click', function (e) {
        var link = e.target.closest('a[href]');
        if (link) {
            var href = link.getAttribute('href') || '';
            var lowerHref = href.toLowerCase();

            var isBannedHubLink = C.BANNED_HUB_PATHS.some(function (bannedPath) {
                return lowerHref.includes(bannedPath.toLowerCase());
            }) || lowerHref.includes('music.youtube.com');

            if (isBannedHubLink) {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = '/';
                return;
            }

            if (href.startsWith('/watch') || href.startsWith('/results')) {
                document.documentElement.setAttribute('data-is-home', 'false');
                var container = document.getElementById('custom-mindmap-container');
                if (container) {
                    container.style.display = 'none';
                    container.remove();
                }
            }
        }
    }, true);

    /* 3. INITIALIZATION */
    function initAll() {
        C.updatePageStateFlags();
        if (Video) Video.disableAutoplay();
        if (Search) Search.scrubSearchFeed();
        if (Video) Video.scrubDescriptionHubLinks();
        if (Channel) Channel.scrubChannelShortsTabs();
        if (Home) Home.syncCenteredSearchUI();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }

    window.addEventListener('yt-navigate-finish', initAll);

})(window);
