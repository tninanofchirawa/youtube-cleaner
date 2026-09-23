/**
 * ============================================================================
 * YOUTUBE CLEANER - Search Interception & Feed Filtering Script
 * ============================================================================
 */

(function (window) {
    'use strict';

    var C = window.YTCleanerCommon;

    function scrubSearchFeed() {
        if (!window.location.pathname.startsWith('/results')) {
            return;
        }

        var searchParams = new URLSearchParams(window.location.search);
        var query = (searchParams.get('search_query') || '').toLowerCase();

        var isQueryBanned = C.BANNED_PATTERNS.some(function (pattern) {
            return pattern.test(query);
        });

        if (isQueryBanned) {
            var contents = document.querySelector('ytd-section-list-renderer #contents, #primary');
            if (contents) {
                contents.innerHTML = '<div class="custom-search-blocked-notice">Content blocked by policy.</div>';
            }
            return;
        }

        var cards = document.querySelectorAll(
            'ytd-video-renderer, ytd-channel-renderer, ytd-reel-shelf-renderer, ytd-shelf-renderer, ytd-lockup-view-model, yt-lockup-view-model'
        );

        cards.forEach(function (card) {
            var text = card.innerText || '';
            var isCardBanned = C.BANNED_PATTERNS.some(function (pattern) {
                return pattern.test(text);
            });
            if (isCardBanned) {
                card.remove();
            }
        });

        var suggestions = document.querySelectorAll('.sbsb_c, .sbct, yt-searchbox yt-suggestion');
        suggestions.forEach(function (item) {
            var text = item.innerText || '';
            var isSuggestionBanned = C.BANNED_PATTERNS.some(function (pattern) {
                return pattern.test(text);
            });
            if (isSuggestionBanned) {
                item.style.display = 'none';
            }
        });
    }

    function handleDirectSearch(query) {
        var cleanQuery = (query || '').trim();
        if (cleanQuery.length > 0) {
            var container = document.getElementById('custom-mindmap-container');
            if (container) {
                container.style.opacity = '0';
                container.style.transition = 'opacity 0.12s ease';
            }
            window.location.href = '/results?search_query=' + encodeURIComponent(cleanQuery);
        }
    }

    window.YTCleanerSearch = {
        scrubSearchFeed: scrubSearchFeed,
        handleDirectSearch: handleDirectSearch
    };

})(window);
