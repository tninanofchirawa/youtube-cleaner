/**
 * ============================================================================
 * YOUTUBE CLEANER - Minimal AI-Style Interface & Distraction Filter Script
 * ============================================================================
 * 
 * ARCHITECTURE OVERVIEW FOR BEGINNERS:
 * -----------------------------------
 * This JavaScript file is injected into YouTube pages as a Chrome Extension Content
 * Script (specified in manifest.json). It runs in the context of YouTube web pages
 * and performs 9 core responsibilities:
 * 
 *  1. State Detection: Identifies whether current page is Homepage or Playlist watch view.
 *  2. Autoplay Suppression: Prevents YouTube from automatically playing next videos.
 *  3. Search & Content Filtering: Uses Regular Expressions (RegEx) to hide clickbait,
 *     movie recaps, and sensationalist/NSFW content from search results.
 *  4. Homepage Mind-Map Interface: Hides default YouTube recommendations and replaces
 *     the homepage with a clean, interactive mind-map of user learning topics.
 *  5. Custom Blurred Background: Allows uploading local background pictures or image URLs
 *     with adjustable real-time Gaussian blur effects.
 *  6. Right-Side Auto-Hiding Control Dock: Vertical drawer for Add, Remove Table,
 *     and Deleted History buttons that slides out on hover.
 *  7. Collision Avoidance & Bounce Physics: Automatically detects overlaps between topic
 *     cards and the central cloud search hub, gently bouncing cards outward to safe coordinates.
 *  8. Drag-and-Drop & SVG Canvas: Draws thick high-contrast curved connection lines
 *     connecting user topic cards to a central search cloud.
 *  9. Zero-Delay Video Loading & Optimized Observer: Path-cached MutationObserver
 *     eliminates main-thread blocking, allowing HTML5 videos to open and play instantly.
 * ============================================================================
 */

(function () {
    'use strict';

    /* ==========================================================================
       1. CONSTANTS & CONFIGURATION
       ========================================================================== */

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

    /* ==========================================================================
       2. COMPREHENSIVE BANNED SEARCH & BLOCKLIST PATTERNS (REGEX)
       ========================================================================== */

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

    /* ==========================================================================
       3. PAGE STATE DETECTION (INSTANT DOM FLAGS)
       ========================================================================== */

    var BANNED_HUB_PATHS = [
        '/feed/trending',
        '/feed/subscriptions',
        '/feed/storefront',
        '/gaming',
        '/playables',
        '/podcasts',
        '/premium',
        '/feed/explore',
        '/channel/UC4R8DWoMoI7CAwX8_LjQHigh',
        '/channel/UC-9-kyTW8ZkZNDHQJ6FgpwQ',
        '/channel/UCYfdidRxbB8Qhf0Nx7ioOYw',
        '/channel/UCrpQ4p1TIw2vn3VQ06FJ-JA',
        '/channel/UCEgdi0XIXXZ-qJOFPf4JSKw'
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

    function updatePageStateFlags() {
        redirectBannedHubs();
        var isPlaylist = new URLSearchParams(window.location.search).has('list');
        var isHome = window.location.pathname === '/' || window.location.pathname === '';
        
        document.documentElement.setAttribute('data-has-playlist', isPlaylist ? 'true' : 'false');
        document.documentElement.setAttribute('data-is-home', isHome ? 'true' : 'false');
    }

    updatePageStateFlags();

    var lastDisabledAutoplayVideoId = '';

    function disableAutoplay() {
        var searchParams = new URLSearchParams(window.location.search);
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

    /* ==========================================================================
       4. SEARCH INTERCEPTION & FEED SCRUBBING
       ========================================================================== */

    function scrubSearchFeed() {
        if (!window.location.pathname.startsWith('/results')) {
            return;
        }

        var searchParams = new URLSearchParams(window.location.search);
        var query = (searchParams.get('search_query') || '').toLowerCase();

        var isQueryBanned = BANNED_PATTERNS.some(function (pattern) {
            return pattern.test(query);
        });

        if (isQueryBanned) {
            var contents = document.querySelector('ytd-section-list-renderer #contents, #primary');
            if (contents) {
                contents.innerHTML = '<div style="padding: 60px; text-align: center; color: var(--yt-cleaner-subtext, #888); font-size: 18px; font-weight: bold;">Content blocked by policy.</div>';
            }
            return;
        }

        var cards = document.querySelectorAll(
            'ytd-video-renderer, ytd-channel-renderer, ytd-reel-shelf-renderer, ytd-shelf-renderer, ytd-lockup-view-model, yt-lockup-view-model'
        );

        cards.forEach(function (card) {
            var text = card.innerText || '';
            var isCardBanned = BANNED_PATTERNS.some(function (pattern) {
                return pattern.test(text);
            });
            if (isCardBanned) {
                card.remove();
            }
        });

        var suggestions = document.querySelectorAll('.sbsb_c, .sbct, yt-searchbox yt-suggestion');
        suggestions.forEach(function (item) {
            var text = item.innerText || '';
            var isSuggestionBanned = BANNED_PATTERNS.some(function (pattern) {
                return pattern.test(text);
            });
            if (isSuggestionBanned) {
                item.style.display = 'none';
            }
        });
    }

    /* ==========================================================================
       5. HIGH-PERFORMANCE PATH-CACHED MUTATION OBSERVER
       ========================================================================== */

    if (window.__ytCleanerObserver) {
        window.__ytCleanerObserver.disconnect();
    }

    window.__ytIsTicking = false;
    var lastObservedPath = '';

    /**
     * Optimized MutationObserver callback.
     * Caches current URL path so state flags & mindmap sync only execute on actual path changes.
     * Prevents main-thread blocking and eliminates 1-second video buffering delays!
     */
    function handleDOMMutation() {
        var currentPath = window.location.pathname + window.location.search;

        if (currentPath !== lastObservedPath) {
            lastObservedPath = currentPath;
            redirectBannedHubs();
            updatePageStateFlags();
            syncCenteredSearchUI();
            disableAutoplay();
        }

        if (!window.__ytIsTicking) {
            window.__ytIsTicking = true;
            window.requestAnimationFrame(function () {
                scrubSearchFeed();
                window.__ytIsTicking = false;
            });
        }
    }

    window.__ytCleanerObserver = new MutationObserver(handleDOMMutation);
    window.__ytCleanerObserver.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    /* ==========================================================================
       6. DIRECT SEARCH REDIRECTION & INSTANT VIDEO NAVIGATION
       ========================================================================== */

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

    window.addEventListener('yt-navigate-start', function () {
        redirectBannedHubs();
        updatePageStateFlags();
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

            var isBannedHubLink = BANNED_HUB_PATHS.some(function (bannedPath) {
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

    /* ==========================================================================
       7. STORAGE & CUSTOM BACKGROUND LOGIC
       ========================================================================== */

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

    /* ==========================================================================
       8. COLLISION AVOIDANCE & BOUNCE PHYSICS FOR TOPIC CARDS
       ========================================================================== */

    function checkAndBounceCollisions(card, topicId) {
        var cloud = document.querySelector('.custom-cloud-shape');
        if (!card || !cloud) return;

        var cardRect = card.getBoundingClientRect();
        var cloudRect = cloud.getBoundingClientRect();

        var cardCenterX = cardRect.left + cardRect.width / 2;
        var cardCenterY = cardRect.top + cardRect.height / 2;

        var cloudCenterX = cloudRect.left + cloudRect.width / 2;
        var cloudCenterY = cloudRect.top + cloudRect.height / 2;

        var cloudRadiusX = cloudRect.width / 2 + cardRect.width / 2 + 25;
        var cloudRadiusY = cloudRect.height / 2 + cardRect.height / 2 + 25;

        var dx = cardCenterX - cloudCenterX;
        var dy = cardCenterY - cloudCenterY;

        var normDist = Math.pow(dx / cloudRadiusX, 2) + Math.pow(dy / cloudRadiusY, 2);

        if (normDist < 1) {
            var angle = Math.atan2(dy, dx);
            if (Math.abs(dx) < 5 && Math.abs(dy) < 5) angle = -Math.PI / 4;

            var targetCenterX = cloudCenterX + Math.cos(angle) * (cloudRadiusX + 15);
            var targetCenterY = cloudCenterY + Math.sin(angle) * (cloudRadiusY + 15);

            var newX = Math.max(20, Math.min(window.innerWidth - cardRect.width - 20, targetCenterX - cardRect.width / 2));
            var newY = Math.max(20, Math.min(window.innerHeight - cardRect.height - 80, targetCenterY - cardRect.height / 2));

            card.style.transition = 'left 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), top 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            card.style.left = newX + 'px';
            card.style.top = newY + 'px';

            setTimeout(function () {
                card.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease';
            }, 320);

            var topics = getSavedTopics();
            var targetTopic = topics.find(function (t) { return t.id === topicId; });
            if (targetTopic) {
                targetTopic.x = newX;
                targetTopic.y = newY;
                saveTopics(topics);
            }

            drawConnectors();
        }
    }

    /* ==========================================================================
       9. SVG CONNECTOR LINE CANVAS DRAWING
       ========================================================================== */

    function drawConnectors() {
        var svg = document.getElementById('custom-connectors-svg');
        var cloud = document.querySelector('.custom-cloud-shape');
        if (!svg || !cloud) return;

        svg.innerHTML = '';
        var cloudRect = cloud.getBoundingClientRect();
        var cX = cloudRect.left + cloudRect.width / 2;
        var cY = cloudRect.top + cloudRect.height / 2;

        var topics = getSavedTopics();
        topics.forEach(function (topic) {
            var card = document.getElementById(topic.id);
            if (!card) return;

            var r = card.getBoundingClientRect();
            var startX = r.left + r.width / 2;
            var startY = r.top + r.height / 2;

            var endX = startX < cX ? cloudRect.left + 50 : cloudRect.right - 50;
            var endY = startY < cY ? cloudRect.top + 60 : cloudRect.bottom - 60;

            var cp1X = (startX + endX) / 2;
            var cp1Y = startY;
            var cp2X = (startX + endX) / 2;
            var cp2Y = endY;

            var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M ' + startX + ' ' + startY + ' C ' + cp1X + ' ' + cp1Y + ', ' + cp2X + ' ' + cp2Y + ', ' + endX + ' ' + endY);
            path.setAttribute('class', 'custom-connector-path');
            path.setAttribute('stroke-width', '3');
            path.setAttribute('stroke-dasharray', '8,6');
            path.setAttribute('fill', 'none');
            svg.appendChild(path);
        });
    }

    /* ==========================================================================
       10. DRAG-AND-DROP HANDLER (LEAK-FREE & COLLISION BOUNCE)
       ========================================================================== */

    function makeDraggable(card, topicId) {
        var isDragging = false;
        var startMouseX, startMouseY, startCardX, startCardY;
        var hasMoved = false;

        function onMouseMove(e) {
            if (!isDragging) return;
            var dx = e.clientX - startMouseX;
            var dy = e.clientY - startMouseY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved = true;

            var newX = Math.max(10, Math.min(window.innerWidth - card.offsetWidth - 10, startCardX + dx));
            var newY = Math.max(10, Math.min(window.innerHeight - card.offsetHeight - 80, startCardY + dy));

            card.style.left = newX + 'px';
            card.style.top = newY + 'px';
            drawConnectors();
        }

        function onMouseUp() {
            if (!isDragging) return;
            isDragging = false;
            card.style.zIndex = '3';

            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);

            if (hasMoved) {
                var topics = getSavedTopics();
                var target = topics.find(function (t) { return t.id === topicId; });
                if (target) {
                    target.x = card.offsetLeft;
                    target.y = card.offsetTop;
                    saveTopics(topics);
                }
                checkAndBounceCollisions(card, topicId);
            }
        }

        card.addEventListener('mousedown', function (e) {
            if (e.target.closest('.topic-delete-btn')) return;
            
            isDragging = true;
            hasMoved = false;
            startMouseX = e.clientX;
            startMouseY = e.clientY;
            startCardX = card.offsetLeft;
            startCardY = card.offsetTop;
            card.style.zIndex = '10';
            e.preventDefault();

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        });

        card.addEventListener('click', function (e) {
            if (hasMoved) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }

    /* ==========================================================================
       11. DOCK & CARDS RENDERING
       ========================================================================== */

    function updateBottomToolbarState() {
        var topics = getSavedTopics();
        var history = getDeletedHistory();
        
        var addBtn = document.getElementById('tb-add-btn');
        var warnText = document.getElementById('tb-warning-notice');
        var historyBadge = document.getElementById('tb-history-count');

        if (historyBadge) {
            historyBadge.textContent = history.length;
        }

        if (!addBtn) return;

        if (topics.length >= MAX_TOPICS) {
            addBtn.classList.add('disabled-btn');
            if (warnText) warnText.style.display = 'block';
        } else {
            addBtn.classList.remove('disabled-btn');
            if (warnText) warnText.style.display = 'none';
        }
    }

    function renderTopicCards(container) {
        var existingCards = container.querySelectorAll('.custom-topic-card');
        existingCards.forEach(function (c) {
            c.remove();
        });

        var topics = getSavedTopics();
        topics.forEach(function (t) {
            var card = document.createElement('a');
            card.id = t.id;
            card.className = 'custom-topic-card';
            card.href = t.url;
            card.style.backgroundColor = t.bg;
            card.style.color = t.color || '#1a1a1a';
            card.style.left = t.x + 'px';
            card.style.top = t.y + 'px';

            var delBtn = document.createElement('button');
            delBtn.className = 'topic-delete-btn';
            delBtn.setAttribute('title', 'Delete Topic');
            delBtn.setAttribute('aria-label', 'Delete topic ' + t.title);
            delBtn.textContent = '×';

            delBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                deleteTopicWithHistory(t.id);
                renderTopicCards(container);
                updateBottomToolbarState();
                drawConnectors();
            });

            var titleEl = document.createElement('div');
            titleEl.className = 'topic-title';
            titleEl.textContent = t.title;

            var subEl = document.createElement('div');
            subEl.className = 'topic-sub';
            subEl.textContent = t.sub || '(Click to Search)';

            card.appendChild(delBtn);
            card.appendChild(titleEl);
            card.appendChild(subEl);

            makeDraggable(card, t.id);
            container.appendChild(card);

            setTimeout(function () {
                checkAndBounceCollisions(card, t.id);
            }, 50);
        });

        drawConnectors();
        updateBottomToolbarState();
        applyCustomBackground();
    }

    /* ==========================================================================
       12. MODAL DIALOGS (ADD, REMOVE, HISTORY, & BACKGROUND SETTINGS)
       ========================================================================== */

    function openAddTopicModal(container) {
        var topics = getSavedTopics();
        if (topics.length >= MAX_TOPICS) {
            alert('Maximum of 7 topics allowed. Please remove a topic before adding a new one.');
            return;
        }

        var existingModal = document.getElementById('chrome-group-modal');
        if (existingModal) existingModal.remove();

        var selectedColor = PASTEL_PALETTE[0];

        var modal = document.createElement('div');
        modal.id = 'chrome-group-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');

        modal.innerHTML = `
        <div class="cg-modal-card">
            <div class="cg-modal-header">
                <span class="cg-modal-title">Add YouTube Topic</span>
                <button class="cg-modal-close" id="cg-close-btn" aria-label="Close dialog">&times;</button>
            </div>

            <div class="cg-modal-body">
                <label class="cg-input-label" for="cg-topic-name">Topic Name</label>
                <input id="cg-topic-name" type="text" placeholder="e.g. Graph Theory Lectures" autocomplete="off" />

                <label class="cg-input-label" for="cg-topic-url">Topic URL or Search Query</label>
                <input id="cg-topic-url" type="text" placeholder="e.g. Real Analysis or https://..." autocomplete="off" />

                <label class="cg-input-label">Card Color</label>
                <div class="cg-palette-wrapper">
                    ${PASTEL_PALETTE.map((c, i) => `
                        <div class="cg-color-circle ${i === 0 ? 'active' : ''}" data-color="${c}" style="background: ${c};" role="button" aria-label="Color ${i + 1}"></div>
                    `).join('')}
                </div>
            </div>

            <div class="cg-modal-footer">
                <button class="cg-btn cg-btn-cancel" id="cg-cancel-btn">Cancel</button>
                <button class="cg-btn cg-btn-save" id="cg-save-btn">Create Topic</button>
            </div>
        </div>
        `;

        document.body.appendChild(modal);

        var swatches = modal.querySelectorAll('.cg-color-circle');
        swatches.forEach(function (sw) {
            sw.addEventListener('click', function () {
                swatches.forEach(function (s) { s.classList.remove('active'); });
                sw.classList.add('active');
                selectedColor = sw.getAttribute('data-color');
            });
        });

        function closeModal() {
            window.removeEventListener('keydown', onKeyDown);
            modal.remove();
        }

        function onKeyDown(e) { if (e.key === 'Escape') closeModal(); }

        window.addEventListener('keydown', onKeyDown);
        document.getElementById('cg-close-btn').addEventListener('click', closeModal);
        document.getElementById('cg-cancel-btn').addEventListener('click', closeModal);

        modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

        document.getElementById('cg-save-btn').addEventListener('click', function () {
            var nameInput = document.getElementById('cg-topic-name');
            var urlInput = document.getElementById('cg-topic-url');
            var name = (nameInput.value || '').trim();
            var rawUrl = (urlInput.value || '').trim();

            if (!name) {
                alert('Please enter a name for the topic.');
                nameInput.focus();
                return;
            }

            var finalUrl = rawUrl;
            if (!finalUrl) {
                finalUrl = '/results?search_query=' + encodeURIComponent(name);
            } else if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://') && !finalUrl.startsWith('/')) {
                finalUrl = '/results?search_query=' + encodeURIComponent(finalUrl);
            }

            var currentTopics = getSavedTopics();
            var spawnX = 200 + (currentTopics.length * 60) % 500;
            var spawnY = 160 + (currentTopics.length * 40) % 300;

            currentTopics.push({
                id: 't-' + Date.now(),
                title: name,
                sub: '(Click to Search)',
                url: finalUrl,
                bg: selectedColor,
                color: '#1a1a1a',
                x: spawnX,
                y: spawnY
            });

            saveTopics(currentTopics);
            renderTopicCards(container);
            closeModal();
        });

        setTimeout(function () {
            var nameInput = document.getElementById('cg-topic-name');
            if (nameInput) nameInput.focus();
        }, 100);
    }

    function openRemoveTopicsModal(container) {
        var existingModal = document.getElementById('chrome-group-modal');
        if (existingModal) existingModal.remove();

        var topics = getSavedTopics();

        var modal = document.createElement('div');
        modal.id = 'chrome-group-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');

        var rowsHtml = '';
        if (topics.length === 0) {
            rowsHtml = `<tr><td colspan="3" class="cg-table-empty">No active topics found.</td></tr>`;
        } else {
            rowsHtml = topics.map(function (t) {
                return `
                <tr>
                    <td class="cg-td-title">
                        <span class="cg-color-dot" style="background: ${t.bg};"></span>
                        <strong>${escapeHtml(t.title)}</strong>
                    </td>
                    <td class="cg-td-url">${escapeHtml(t.url)}</td>
                    <td class="cg-td-action">
                        <button class="cg-table-btn cg-btn-danger" data-remove-id="${t.id}">Remove</button>
                    </td>
                </tr>
                `;
            }).join('');
        }

        modal.innerHTML = `
        <div class="cg-modal-card cg-modal-large">
            <div class="cg-modal-header">
                <span class="cg-modal-title">Remove a Topic</span>
                <button class="cg-modal-close" id="cg-close-btn" aria-label="Close dialog">&times;</button>
            </div>

            <div class="cg-modal-body">
                <p class="cg-table-sub">Select any topic below to remove it from your homepage canvas.</p>
                <div class="cg-table-wrapper">
                    <table class="cg-topics-table">
                        <thead>
                            <tr>
                                <th>Topic Name</th>
                                <th>Target Query / Link</th>
                                <th style="text-align: right;">Action</th>
                            </tr>
                        </thead>
                        <tbody id="cg-remove-tbody">
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="cg-modal-footer">
                <button class="cg-btn cg-btn-cancel" id="cg-cancel-btn">Done</button>
            </div>
        </div>
        `;

        document.body.appendChild(modal);

        function closeModal() {
            window.removeEventListener('keydown', onKeyDown);
            modal.remove();
        }

        function onKeyDown(e) { if (e.key === 'Escape') closeModal(); }

        window.addEventListener('keydown', onKeyDown);
        document.getElementById('cg-close-btn').addEventListener('click', closeModal);
        document.getElementById('cg-cancel-btn').addEventListener('click', closeModal);

        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeModal();

            var removeBtn = e.target.closest('[data-remove-id]');
            if (removeBtn) {
                var topicId = removeBtn.getAttribute('data-remove-id');
                deleteTopicWithHistory(topicId);
                renderTopicCards(container);
                openRemoveTopicsModal(container);
            }
        });
    }

    function openHistoryModal(container) {
        var existingModal = document.getElementById('chrome-group-modal');
        if (existingModal) existingModal.remove();

        var history = getDeletedHistory();
        var activeTopics = getSavedTopics();
        var isMaxReached = activeTopics.length >= MAX_TOPICS;

        var modal = document.createElement('div');
        modal.id = 'chrome-group-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');

        var rowsHtml = '';
        if (history.length === 0) {
            rowsHtml = `<tr><td colspan="3" class="cg-table-empty">No recently deleted topics in history.</td></tr>`;
        } else {
            rowsHtml = history.map(function (t) {
                return `
                <tr>
                    <td class="cg-td-title">
                        <span class="cg-color-dot" style="background: ${t.bg};"></span>
                        <strong>${escapeHtml(t.title)}</strong>
                        <small class="cg-deleted-time">(Deleted ${escapeHtml(t.deletedAt || '')})</small>
                    </td>
                    <td class="cg-td-url">${escapeHtml(t.url)}</td>
                    <td class="cg-td-action">
                        <button class="cg-table-btn cg-btn-restore ${isMaxReached ? 'disabled-btn' : ''}" 
                                data-restore-id="${t.id}" 
                                ${isMaxReached ? 'disabled title="Max 7 topics active"' : ''}>
                            Restore
                        </button>
                    </td>
                </tr>
                `;
            }).join('');
        }

        modal.innerHTML = `
        <div class="cg-modal-card cg-modal-large">
            <div class="cg-modal-header">
                <span class="cg-modal-title">Recently Deleted Topics (Max 10)</span>
                <button class="cg-modal-close" id="cg-close-btn" aria-label="Close dialog">&times;</button>
            </div>

            <div class="cg-modal-body">
                <p class="cg-table-sub">Accidentally removed a topic? Click <strong>Restore</strong> to bring it back to your canvas.</p>
                <div class="cg-table-wrapper">
                    <table class="cg-topics-table">
                        <thead>
                            <tr>
                                <th>Topic Name</th>
                                <th>Target Query / Link</th>
                                <th style="text-align: right;">Action</th>
                            </tr>
                        </thead>
                        <tbody id="cg-history-tbody">
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="cg-modal-footer">
                <button class="cg-btn cg-btn-cancel" id="cg-cancel-btn">Done</button>
            </div>
        </div>
        `;

        document.body.appendChild(modal);

        function closeModal() {
            window.removeEventListener('keydown', onKeyDown);
            modal.remove();
        }

        function onKeyDown(e) { if (e.key === 'Escape') closeModal(); }

        window.addEventListener('keydown', onKeyDown);
        document.getElementById('cg-close-btn').addEventListener('click', closeModal);
        document.getElementById('cg-cancel-btn').addEventListener('click', closeModal);

        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeModal();

            var restoreBtn = e.target.closest('[data-restore-id]');
            if (restoreBtn && !restoreBtn.classList.contains('disabled-btn')) {
                var topicId = restoreBtn.getAttribute('data-restore-id');
                var restored = restoreDeletedTopic(topicId);
                if (restored) {
                    renderTopicCards(container);
                    openHistoryModal(container);
                }
            }
        });
    }

    function openBackgroundModal(container) {
        var existingModal = document.getElementById('chrome-group-modal');
        if (existingModal) existingModal.remove();

        var currentBg = getBgImage();
        var currentBlur = getBgBlur();

        var modal = document.createElement('div');
        modal.id = 'chrome-group-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');

        modal.innerHTML = `
        <div class="cg-modal-card">
            <div class="cg-modal-header">
                <span class="cg-modal-title">Set Canvas Background Image</span>
                <button class="cg-modal-close" id="cg-close-btn" aria-label="Close dialog">&times;</button>
            </div>

            <div class="cg-modal-body">
                <label class="cg-input-label" for="cg-bg-url">Image Web URL</label>
                <input id="cg-bg-url" type="text" placeholder="https://images.unsplash.com/photo-..." value="${escapeHtml(currentBg.startsWith('data:') ? '' : currentBg)}" autocomplete="off" />

                <label class="cg-input-label">Upload Image File</label>
                <div class="cg-file-upload-box" id="cg-file-trigger" role="button" tabindex="0">
                    <span class="cg-upload-icon">📁</span>
                    <span id="cg-file-name-text">${currentBg.startsWith('data:') ? 'Image File Loaded (Click to Change)' : 'Click to choose image file from device'}</span>
                    <input id="cg-bg-file" type="file" accept="image/*" style="display: none;" />
                </div>

                <label class="cg-input-label" for="cg-bg-blur-slider" style="margin-top: 18px !important;">
                    Background Blur: <span id="cg-blur-val">${currentBlur}</span>px
                </label>
                <div class="cg-slider-wrapper">
                    <input id="cg-bg-blur-slider" type="range" min="0" max="30" value="${currentBlur}" class="cg-range-input" />
                </div>
            </div>

            <div class="cg-modal-footer cg-footer-split">
                <button class="cg-btn cg-btn-ghost-danger" id="cg-reset-bg-btn">Reset Canvas</button>
                <div class="cg-footer-right">
                    <button class="cg-btn cg-btn-cancel" id="cg-cancel-btn">Cancel</button>
                    <button class="cg-btn cg-btn-save" id="cg-save-bg-btn">Apply Background</button>
                </div>
            </div>
        </div>
        `;

        document.body.appendChild(modal);

        var fileTrigger = document.getElementById('cg-file-trigger');
        var fileInput = document.getElementById('cg-bg-file');
        var urlInput = document.getElementById('cg-bg-url');
        var fileNameText = document.getElementById('cg-file-name-text');
        var blurSlider = document.getElementById('cg-bg-blur-slider');
        var blurValText = document.getElementById('cg-blur-val');
        var uploadedDataUrl = '';

        fileTrigger.addEventListener('click', function () {
            fileInput.click();
        });

        blurSlider.addEventListener('input', function () {
            blurValText.textContent = blurSlider.value;
        });

        fileInput.addEventListener('change', function (e) {
            var file = e.target.files[0];
            if (file) {
                var reader = new FileReader();
                reader.onload = function (evt) {
                    uploadedDataUrl = evt.target.result;
                    fileNameText.textContent = file.name;
                    urlInput.value = '';
                };
                reader.readAsDataURL(file);
            }
        });

        function closeModal() {
            window.removeEventListener('keydown', onKeyDown);
            modal.remove();
        }

        function onKeyDown(e) { if (e.key === 'Escape') closeModal(); }

        window.addEventListener('keydown', onKeyDown);
        document.getElementById('cg-close-btn').addEventListener('click', closeModal);
        document.getElementById('cg-cancel-btn').addEventListener('click', closeModal);

        modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

        document.getElementById('cg-reset-bg-btn').addEventListener('click', function () {
            saveBgImage('');
            saveBgBlur(12);
            applyCustomBackground();
            drawConnectors();
            closeModal();
        });

        document.getElementById('cg-save-bg-btn').addEventListener('click', function () {
            var newUrl = uploadedDataUrl;
            if (!newUrl) {
                newUrl = urlInput.value.trim();
            }

            saveBgImage(newUrl);
            saveBgBlur(blurSlider.value);
            applyCustomBackground();
            drawConnectors();
            closeModal();
        });
    }

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /* ==========================================================================
       13. HOMEPAGE MIND-MAP WORKSPACE SYNCHRONIZATION
       ========================================================================== */

    function syncCenteredSearchUI() {
        if (!document.body) return;

        var isHome = window.location.pathname === '/' || window.location.pathname === '';
        var existingContainer = document.getElementById('custom-mindmap-container');

        if (!isHome) {
            if (existingContainer) existingContainer.remove();
            return;
        }

        if (existingContainer) return;

        var container = document.createElement('div');
        container.id = 'custom-mindmap-container';

        container.innerHTML = `
        <svg id="custom-connectors-svg"></svg>

        <div class="custom-cloud-center">
            <div class="custom-cloud-shape"></div>
            <div class="custom-cloud-content">
                <div class="custom-brand-heading">
                    <svg class="custom-yt-icon" viewBox="0 0 68 48" aria-hidden="true">
                        <path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="#FF0000"></path>
                        <path d="M45 24L27 14v20" fill="#FFFFFF"></path>
                    </svg>
                    <span class="custom-title-label">YouTube</span>
                </div>
                <div class="custom-input-wrapper">
                    <input id="custom-search-input" type="text" placeholder="Search" autocomplete="off" autocorrect="off" spellcheck="false" aria-label="YouTube Search Input" />
                </div>
            </div>
        </div>

        <div class="custom-right-dock" id="custom-right-dock">
            <div class="tb-right-handle" aria-hidden="true"></div>
            <button class="tb-item-btn" id="tb-add-btn" aria-label="Add a Topic">
                <span class="tb-bullet"></span>
                <span>+ Add Topic</span>
            </button>
            <button class="tb-item-btn" id="tb-remove-btn" aria-label="Remove a Topic">
                <span class="tb-bullet tb-bullet-remove"></span>
                <span>Remove Topic</span>
            </button>
            <button class="tb-item-btn" id="tb-history-btn" aria-label="Recently Deleted Topics History">
                <span class="tb-bullet tb-bullet-history"></span>
                <span>Deleted (<span id="tb-history-count">0</span>)</span>
            </button>
            <div id="tb-warning-notice">Max 7 topics reached.</div>
        </div>

        <button id="custom-bg-btn" class="tb-item-btn tb-floating-bg-btn" aria-label="Set Custom Background Image">
            <span class="tb-bullet tb-bullet-bg"></span>
            <span>📷 Background</span>
        </button>
        `;

        document.body.appendChild(container);
        renderTopicCards(container);
        applyCustomBackground();

        var inputEl = document.getElementById('custom-search-input');
        if (inputEl) {
            inputEl.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleDirectSearch(inputEl.value);
                }
            });
            setTimeout(function () {
                inputEl.focus();
            }, 100);
        }

        // Toolbar & Background Button Listeners
        document.getElementById('tb-add-btn').addEventListener('click', function () {
            openAddTopicModal(container);
        });

        document.getElementById('tb-remove-btn').addEventListener('click', function () {
            openRemoveTopicsModal(container);
        });

        document.getElementById('tb-history-btn').addEventListener('click', function () {
            openHistoryModal(container);
        });

        document.getElementById('custom-bg-btn').addEventListener('click', function () {
            openBackgroundModal(container);
        });

        window.addEventListener('resize', drawConnectors);
    }

    /* ==========================================================================
       14. INITIALIZATION & SPA EVENT LISTENERS
       ========================================================================== */

    function initAll() {
        updatePageStateFlags();
        disableAutoplay();
        scrubSearchFeed();
        syncCenteredSearchUI();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }

    window.addEventListener('yt-navigate-finish', initAll);

})();