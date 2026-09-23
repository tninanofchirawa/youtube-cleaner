/**
 * ============================================================================
 * YOUTUBE CLEANER - Playlist Overview Page Script
 * ============================================================================
 */

(function (window) {
    'use strict';

    function isPlaylistPage() {
        return new URLSearchParams(window.location.search).has('list');
    }

    window.YTCleanerPlaylist = {
        isPlaylistPage: isPlaylistPage
    };

})(window);
