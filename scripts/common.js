/**
 * ============================================================================
 * YOUTUBE CLEANER - Common Constants, Storage & State Helpers
 * ============================================================================
 */

(function (window) {
    'use strict';

    /* 1. CONSTANTS & CONFIGURATION */
    var STORAGE_KEY_TOPICS = '__yt_mindmap_topics__';
    var STORAGE_KEY_HISTORY = '__yt_mindmap_deleted_history__';
    var STORAGE_KEY_BG_IMG = '__yt_mindmap_bg_img__';
    var STORAGE_KEY_BG_BLUR = '__yt_mindmap_bg_blur__';

    var MAX_TOPICS = 7;
    var MAX_HISTORY = 10;

    var PASTEL_PALETTE = [
        '#fca34d', // Pastel Orange
        '#70d34e', // Pastel Green
        '#d69cf7', // Lavender Purple
        '#53e5e5', // Soft Cyan
        '#ff9fb2', // Soft Rose Pink
        '#ffe169', // Butter Yellow
        '#98c1d9', // Powder Blue
        '#c3bef0'  // Periwinkle
    ];

    var DEFAULT_TOPICS = [
        {
            id: 't-1',
            title: 'Real Analysis',
            sub: '(Click to Search)',
            url: '/results?search_query=Real+Analysis',
            bg: '#fca34d',
            color: '#1a1a1a',
            x: 140,
            y: 120
        },
        {
            id: 't-2',
            title: 'Linear Algebra',
            sub: '(Click to Search)',
            url: '/results?search_query=Linear+Algebra',
            bg: '#70d34e',
            color: '#1a1a1a',
            x: 150,
            y: 500
        },
        {
            id: 't-3',
            title: 'Graph Theory',
            sub: '(Click to Search)',
            url: '/results?search_query=Graph+Theory',
            bg: '#d69cf7',
            color: '#1a1a1a',
            x: 670,
            y: 580
        },
        {
            id: 't-4',
            title: 'Data Structures',
            sub: '(Click to Search)',
            url: '/results?search_query=Data+Structures',
            bg: '#53e5e5',
            color: '#1a1a1a',
            x: 1100,
            y: 490
        },
        {
            id: 't-5',
            title: 'Complex Analysis',
            sub: '(Click to Search)',
            url: '/results?search_query=Complex+Analysis',
            bg: '#75d64b',
            color: '#1a1a1a',
            x: 1090,
            y: 100
        }
    ];

    /* 2. COMPREHENSIVE BANNED SEARCH & BLOCKLIST PATTERNS (REGEX) */
    var BANNED_PATTERNS = [
        /* --- Movie Recaps & Time-Wasters --- */
        /\brecap\b/i, /\brecapped\b/i, /\brecaps\b/i, /\bmovie summary\b/i, /\bfilm summary\b/i,
        /\bin minutes\b/i, /\bmovie recaps\b/i, /\bmovie roll\b/i, /\bstory recapped\b/i,
        /\bminute movies\b/i, /\bcinema summary\b/i, /\bfilm recap\b/i, /\brecap king\b/i,
        /\bdetective recap\b/i, /\bpopcorn recap\b/i, /\bfast film\b/i, /\bprime recap\b/i,
        /\bplot summary\b/i, /\bspeedy recap\b/i, /\bsnack movies\b/i, /\brecap studio\b/i,
        /\bhorror recap\b/i, /\bsci fi recap\b/i, /\bquick movie\b/i, /\brecap zone\b/i,
        /\baction recap\b/i, /\bsuper recap\b/i, /\bmovie express\b/i, /\bstory cinema\b/i,
        /\brecap world\b/i, /\bmind recap\b/i, /\bmagic recap\b/i, /\bcinerecap\b/i,
        /\bspoiler recap\b/i, /\bmovie breakdown\b/i, /\bplot recap\b/i, /\bquick recap\b/i,
        /\breel recap\b/i, /\bdaily recap\b/i, /\bmovie bites\b/i, /\bscreen recap\b/i,
        /\bfilm digest\b/i, /\brecap central\b/i, /\bcinema rush\b/i, /\bmovie in minutes\b/i,

        /* --- Specific Sensational TV & Drama --- */
        /\bthe lobster\b/i, /\bthe mentalist\b/i, /\bgame of thrones\b/i, /\bdr house\b/i, /\bsex education\b/i,

        /* --- Adult & Explicit Blocklist --- */
        /\bnude\b/i, /\bnudity\b/i, /\bnaked\b/i, /\bnsfw\b/i, /\bporn\b/i, /\bporno\b/i,
        /\bpornography\b/i, /\bxnxx\b/i, /\bxvideos\b/i, /\bpornhub\b/i, /\bredtube\b/i,
        /\bxhamster\b/i, /\bonlyfans\b/i, /\berotic\b/i, /\berotica\b/i, /\bhentai\b/i,
        /\becchi\b/i, /\byaoi\b/i, /\byuri\b/i, /\bhot girl\b/i, /\bsexy girl\b/i,
        /\bbikini\b/i, /\blingerie\b/i, /\bhotscene\b/i, /\bintimate scene\b/i,
        /\bbed scene\b/i, /\bkissing scene\b/i, /\bbreastmilk\b/i, /\bbreast milk\b/i,
        /\bcleavage\b/i, /\bintercourse\b/i, /\borgasm\b/i, /\bmasturbat/i, /\bejaculat/i,
        /\bhand expression\b/i, /\bboob\b/i, /\bboobs\b/i, /\btits\b/i, /\btitties\b/i,
        /\bnipple\b/i, /\bvagina\b/i, /\bpenis\b/i, /\bdick\b/i, /\bcock\b/i, /\bpussy\b/i,
        /\banal\b/i, /\bblowjob\b/i, /\bhot massage\b/i, /\bsex massage\b/i, /\berotic massage\b/i,
        /\bnuru massage\b/i, /\bbusty\b/i, /\bmilf\b/i, /\blewd\b/i, /\buncensored\b/i, /\bstriptease\b/i
    ];

    /* 3. BANNED HUB PATHS */
    var BANNED_HUB_PATHS = [
        '/feed/trending',
        '/feed/subscriptions',
        '/feed/storefront',
        '/gaming',
        '/playables',
        '/podcasts',
        '/premium',
        '/feed/explore'
    ];

    function redirectBannedHubs() {
        var currentPath = window.location.pathname.toLowerCase();
        var isBanned = BANNED_HUB_PATHS.some(function (bannedPath) {
            return currentPath.startsWith(bannedPath.toLowerCase());
        });

        if (isBanned) {
            window.location.href = '/';
        }
    }

    function updatePageStateFlags() {
        redirectBannedHubs();
        var isPlaylist = new URLSearchParams(window.location.search).has('list');
        var isHome = window.location.pathname === '/' || window.location.pathname === '';

        document.documentElement.setAttribute('data-has-playlist', isPlaylist ? 'true' : 'false');
        document.documentElement.setAttribute('data-is-home', isHome ? 'true' : 'false');
    }

    /* 4. STORAGE HELPERS */
    function getSavedTopics() {
        var raw = localStorage.getItem(STORAGE_KEY_TOPICS);
        if (raw === null) return DEFAULT_TOPICS;
        try {
            var parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : DEFAULT_TOPICS;
        } catch (e) {
            return DEFAULT_TOPICS;
        }
    }

    function saveTopics(topics) {
        try {
            localStorage.setItem(STORAGE_KEY_TOPICS, JSON.stringify(topics));
        } catch (e) {
            console.error('YouTube Cleaner: Could not save topics to localStorage', e);
        }
    }

    function getDeletedHistory() {
        var raw = localStorage.getItem(STORAGE_KEY_HISTORY);
        if (!raw) return [];
        try {
            var parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    function pushDeletedHistory(topic) {
        if (!topic) return;
        var history = getDeletedHistory();

        history = history.filter(function (item) { return item.id !== topic.id; });
        topic.deletedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        history.unshift(topic);
        if (history.length > MAX_HISTORY) {
            history = history.slice(0, MAX_HISTORY);
        }

        try {
            localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
        } catch (e) {}
    }

    function restoreDeletedTopic(topicId) {
        var topics = getSavedTopics();
        if (topics.length >= MAX_TOPICS) {
            alert('Maximum of 7 active topics allowed. Please remove a topic before restoring.');
            return false;
        }

        var history = getDeletedHistory();
        var targetIndex = history.findIndex(function (item) { return item.id === topicId; });

        if (targetIndex !== -1) {
            var restoredTopic = history.splice(targetIndex, 1)[0];
            delete restoredTopic.deletedAt;

            topics.push(restoredTopic);
            saveTopics(topics);
            try { localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history)); } catch (e) {}
            return true;
        }
        return false;
    }

    function deleteTopicWithHistory(topicId) {
        var topics = getSavedTopics();
        var target = topics.find(function (item) { return item.id === topicId; });
        if (target) {
            pushDeletedHistory(target);
            var updated = topics.filter(function (item) { return item.id !== topicId; });
            saveTopics(updated);
        }
    }

    function getBgImage() { return localStorage.getItem(STORAGE_KEY_BG_IMG) || ''; }

    function saveBgImage(url) {
        if (url) {
            localStorage.setItem(STORAGE_KEY_BG_IMG, url);
        } else {
            localStorage.removeItem(STORAGE_KEY_BG_IMG);
        }
    }

    function getBgBlur() {
        var val = localStorage.getItem(STORAGE_KEY_BG_BLUR);
        return val !== null ? parseInt(val, 10) : 12;
    }

    function saveBgBlur(pxVal) {
        localStorage.setItem(STORAGE_KEY_BG_BLUR, String(pxVal));
    }

    function applyCustomBackground() {
        var container = document.getElementById('custom-mindmap-container');
        if (!container) return;

        var bgImage = getBgImage();
        var blurPx = getBgBlur();
        var bgLayer = document.getElementById('custom-bg-image-layer');

        if (!bgImage) {
            if (bgLayer) bgLayer.remove();
            container.removeAttribute('data-has-custom-bg');
            return;
        }

        container.setAttribute('data-has-custom-bg', 'true');
        if (!bgLayer) {
            bgLayer = document.createElement('div');
            bgLayer.id = 'custom-bg-image-layer';
            container.insertBefore(bgLayer, container.firstChild);
        }

        bgLayer.style.backgroundImage = 'url("' + bgImage.replace(/"/g, '\\"') + '")';
        bgLayer.style.filter = 'blur(' + blurPx + 'px) brightness(0.72) scale(1.06)';
    }

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /* EXPOSE GLOBALS TO OTHER MODULES */
    window.YTCleanerCommon = {
        STORAGE_KEY_TOPICS: STORAGE_KEY_TOPICS,
        STORAGE_KEY_HISTORY: STORAGE_KEY_HISTORY,
        STORAGE_KEY_BG_IMG: STORAGE_KEY_BG_IMG,
        STORAGE_KEY_BG_BLUR: STORAGE_KEY_BG_BLUR,
        MAX_TOPICS: MAX_TOPICS,
        MAX_HISTORY: MAX_HISTORY,
        PASTEL_PALETTE: PASTEL_PALETTE,
        DEFAULT_TOPICS: DEFAULT_TOPICS,
        BANNED_PATTERNS: BANNED_PATTERNS,
        BANNED_HUB_PATHS: BANNED_HUB_PATHS,
        redirectBannedHubs: redirectBannedHubs,
        updatePageStateFlags: updatePageStateFlags,
        getSavedTopics: getSavedTopics,
        saveTopics: saveTopics,
        getDeletedHistory: getDeletedHistory,
        pushDeletedHistory: pushDeletedHistory,
        restoreDeletedTopic: restoreDeletedTopic,
        deleteTopicWithHistory: deleteTopicWithHistory,
        getBgImage: getBgImage,
        saveBgImage: saveBgImage,
        getBgBlur: getBgBlur,
        saveBgBlur: saveBgBlur,
        applyCustomBackground: applyCustomBackground,
        escapeHtml: escapeHtml
    };

})(window);
