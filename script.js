(function () {
    'use strict';

    /* ==========================================================
       1. URL & PLAYLIST STATE DETECTION
       ========================================================== */
    function updatePlaylistState() {
        var isPlaylist = new URLSearchParams(window.location.search).has('list');
        document.documentElement.setAttribute('data-has-playlist', isPlaylist ? 'true' : 'false');
    }

    /* ==========================================================
       2. NATIVE AUTOPLAY SUPPRESSION
       ========================================================== */
    function disableAutoplay() {
        var autoPlayToggle = document.querySelector('.ytp-autonav-toggle-button');
        if (autoPlayToggle && autoPlayToggle.getAttribute('aria-checked') === 'true') {
            autoPlayToggle.click();
        }
    }

    /* ==========================================================
       3. COMPREHENSIVE BANNED SEARCH & NSFW PATTERNS
       ========================================================== */
    var BANNED_PATTERNS = [
        /* --- Movie Recap & Distraction Channels --- */
        /\brecap\b/i, /\brecapped\b/i, /\brecaps\b/i, /\bmovie summary\b/i, /\bfilm summary\b/i, /\bin minutes\b/i,
        /\bmovie recaps\b/i, /\bmovierecaps\b/i, /\bm r\b/i,
        /\bmystery recap\b/i, /\bmysteryrecap\b/i, /\bmystery r\b/i,
        /\bstory recapped\b/i, /\bstoryrecapped\b/i, /\bstory r\b/i,
        /\bdan dan theater\b/i, /\bdandantheater\b/i, /\bdan dan\b/i,
        /\bminute movies\b/i, /\bminutemovies\b/i, /\bminute m\b/i,
        /\bcinema summary\b/i, /\bcinemasummary\b/i, /\bcinema sum\b/i,
        /\bfilm recap\b/i, /\bfilmrecap\b/i, /\bf r\b/i,
        /\brecap king\b/i, /\brecapking\b/i, /\br king\b/i,
        /\bdaniel cc movie\b/i, /\bdanielccmovie\b/i, /\bdaniel cc\b/i,
        /\bdetective recap\b/i, /\bdetectiverecap\b/i, /\bdetective r\b/i,
        /\bmovie roll\b/i, /\bmovieroll\b/i, /\bm roll\b/i,
        /\bfilm recaps\b/i, /\bfilmrecaps\b/i, /\bfilm r\b/i,
        /\bpopcorn recap\b/i, /\bpopcornrecap\b/i, /\bp recap\b/i,
        /\bfast film\b/i, /\bfastfilm\b/i, /\bfast f\b/i,
        /\bprime recap\b/i, /\bprimerecap\b/i, /\bp r\b/i,
        /\bplot summary\b/i, /\bplotsummary\b/i, /\bplot sum\b/i,
        /\brecap land\b/i, /\brecapland\b/i, /\br land\b/i,
        /\bspeedy recap\b/i, /\bspeedyrecap\b/i, /\bspeedy r\b/i,
        /\bsnack movies\b/i, /\bsnackmovies\b/i, /\bsnack m\b/i,
        /\bmovie summary\b/i, /\bmoviesummary\b/i, /\bmovie sum\b/i,
        /\brecap studio\b/i, /\brecapstudio\b/i, /\br studio\b/i,
        /\bfox recap\b/i, /\bfoxrecap\b/i, /\bfox r\b/i,
        /\bmovie time recap\b/i, /\bmovietimerecap\b/i, /\bm t r\b/i,
        /\bhorror recap\b/i, /\bhorrorrecap\b/i, /\bh recap\b/i,
        /\bsci fi recap\b/i, /\bscifirecap\b/i, /\bs f r\b/i,
        /\bquick movie\b/i, /\bquickmovie\b/i, /\bquick m\b/i,
        /\brecap zone\b/i, /\brecapzone\b/i, /\br zone\b/i,
        /\baction recap\b/i, /\bactionrecap\b/i, /\ba recap\b/i,
        /\bsuper recap\b/i, /\bsuperrecap\b/i, /\bs recap\b/i,
        /\bmovie express\b/i, /\bmovieexpress\b/i, /\bm express\b/i,
        /\bstory cinema\b/i, /\bstorycinema\b/i, /\bs cinema\b/i,
        /\brecap world\b/i, /\brecapworld\b/i, /\br world\b/i,
        /\bmind recap\b/i, /\bmindrecap\b/i, /\bm recap\b/i,
        /\bmagic recap\b/i, /\bmagicrecap\b/i, /\bmagic r\b/i,
        /\bcine recap\b/i, /\bcinerecap\b/i, /\bc recap\b/i,
        /\bspoiler recap\b/i, /\bspoilerrecap\b/i, /\bs r\b/i,
        /\bmovie breakdown\b/i, /\bmoviebreakdown\b/i, /\bm b d\b/i,
        /\bplot recap\b/i, /\bplotrecap\b/i, /\bp recap\b/i,
        /\bmovie review recap\b/i, /\bmoviereviewrecap\b/i, /\bm r r\b/i,
        /\bquick recap\b/i, /\bquickrecap\b/i, /\bq recap\b/i,
        /\breel recap\b/i, /\breelrecap\b/i, /\breel r\b/i,
        /\bdaily recap\b/i, /\bdailyrecap\b/i, /\bdaily r\b/i,
        /\bmovie bites\b/i, /\bmoviebites\b/i, /\bm bites\b/i,
        /\bscreen recap\b/i, /\bscreenrecap\b/i, /\bscreen r\b/i,
        /\bfilm digest\b/i, /\bfilmdigest\b/i, /\bf digest\b/i,
        /\brecap central\b/i, /\brecapcentral\b/i, /\br central\b/i,
        /\bcinema rush\b/i, /\bcinemarush\b/i, /\bc rush\b/i,
        /\bmovie in minutes\b/i, /\bmovieinminutes\b/i, /\bm i m\b/i,
        /\bfilm summary\b/i, /\bfilmsummary\b/i, /\bfilm sum\b/i,
        /\bthe recap guy\b/i, /\btherecapguy\b/i, /\bt r g\b/i,

        /* --- Filtered TV Series & Sensational Drama --- */
        /\bthe lobster\b/i,
        /\bthe mentalist\b/i,
        /\bgame of thrones\b/i,
        /\bgot\b/i,
        /\bdr house\b/i,
        /\bsex education\b/i,

        /* --- Strict Explicit / NSFW / Nudity / Filth Blocklist --- */
        /\bnude\b/i, /\bnudity\b/i, /\bnaked\b/i, /\bnsfw\b/i, /\bporn\b/i, /\bporno\b/i, /\bpornography\b/i,
        /\bxnxx\b/i, /\bxvideos\b/i, /\bpornhub\b/i, /\bredtube\b/i, /\bxhamster\b/i, /\bonlyfans\b/i,
        /\berotic\b/i, /\berotica\b/i, /\bhitsugaya\b/i, /\bhentai\b/i, /\becchi\b/i, /\byaoi\b/i, /\byuri\b/i,
        /\bhot girl\b/i, /\bsexy girl\b/i, /\bhot girls\b/i, /\bsexy girls\b/i, /\bbikini\b/i, /\blingerie\b/i,
        /\bhotscene\b/i, /\bhotscenes\b/i, /\bintimate scene\b/i, /\bbed scene\b/i, /\bkissing scene\b/i,
        /\bbreastmilk\b/i, /\bbreast milk\b/i, /\bbra\b/i, /\bpanties\b/i, /\bcleavage\b/i,
        /\bsex\b/i, /\bsexy\b/i, /\bintercourse\b/i, /\borgasm\b/i, /\bmasturbat/i, /\bejaculat/i,
        /\bhandexpression\b/i, /\bhand expression\b/i,
        /\bboob\b/i, /\bboobs\b/i, /\bboob touch\b/i, /\btits\b/i, /\btitties\b/i, /\bnipple\b/i, /\bnipples\b/i,
        /\bvagina\b/i, /\bpenis\b/i, /\bdick\b/i, /\bcock\b/i, /\bpussy\b/i, /\banal\b/i, /\bblowjob\b/i,
        /\bmassage\b/i, /\bhot massage\b/i, /\bsex massage\b/i, /\berotic massage\b/i, /\bnuru massage\b/i,
        /\bbusty\b/i, /\bthicc\b/i, /\bmilf\b/i, /\bbowsette\b/i, /\blewd\b/i, /\buncensored\b/i, /\bstriptease\b/i
    ];

    /* ==========================================================
       4. SEARCH QUERY INTERCEPTION & FEED SCRUBBING
       ========================================================== */
    function scrubSearchFeed() {
        if (window.location.pathname.startsWith('/results')) {
            var searchParams = new URLSearchParams(window.location.search);
            var query = (searchParams.get('search_query') || '').toLowerCase();

            if (BANNED_PATTERNS.some(function (regex) {
                    return regex.test(query);
                })) {
                var contents = document.querySelector('ytd-section-list-renderer #contents, #primary');
                if (contents) {
                    contents.innerHTML = '<div style="padding: 40px; text-align: center; color: #aaa; font-size: 18px; font-weight: bold;">Content blocked by policy.</div>';
                }
                return;
            }

            var cards = document.querySelectorAll(
                'ytd-video-renderer, ytd-channel-renderer, ytd-reel-shelf-renderer, ytd-shelf-renderer, ytd-lockup-view-model, yt-lockup-view-model'
            );

            cards.forEach(function (card) {
                var rawText = card.innerText || '';
                if (BANNED_PATTERNS.some(function (regex) {
                        return regex.test(rawText);
                    })) {
                    card.remove();
                }
            });
        }

        var suggestions = document.querySelectorAll('.sbsb_c, .sbct, yt-searchbox yt-suggestion');
        suggestions.forEach(function (item) {
            var text = item.innerText || '';
            if (BANNED_PATTERNS.some(function (regex) {
                    return regex.test(text);
                })) {
                item.style.display = 'none';
            }
        });
    }

    /* ==========================================================
       5. SAFE RE-ENTRANT OBSERVER LIFECYCLE
       ========================================================== */
    if (window.__ytCleanerObserver) {
        window.__ytCleanerObserver.disconnect();
    }

    window.__ytIsTicking = false;

    function handleDOMMutation() {
        if (!window.__ytIsTicking) {
            window.__ytIsTicking = true;
            window.requestAnimationFrame(function () {
                disableAutoplay();
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

    /* ==========================================================
       6. CUSTOM CENTERED SEARCH (DIRECT URL REDIRECTION)
       ========================================================== */
    function handleDirectSearch(query) {
        var cleanQuery = query.trim();
        if (cleanQuery.length > 0) {
            window.location.href = '/results?search_query=' + encodeURIComponent(cleanQuery);
        }
    }

    function syncCenteredSearchUI() {
        if (!document.body) return;

        var isHome = window.location.pathname === '/' || window.location.pathname === '';
        var existingBox = document.getElementById('custom-minimal-search-layer');

        if (!isHome) {
            if (existingBox) existingBox.remove();
            return;
        }

        if (existingBox) return;

        var searchLayer = document.createElement('div');
        searchLayer.id = 'custom-minimal-search-layer';
        searchLayer.innerHTML =
            '<div class="custom-title-label">YouTube</div>' +
            '<div class="custom-input-wrapper">' +
            '  <input id="custom-search-input" type="text" placeholder="Search" autocomplete="off" autocorrect="off" spellcheck="false" />' +
            '</div>';

        document.body.appendChild(searchLayer);

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
            }, 150);
        }
    }

    /* ==========================================================
       7. LIFECYCLE INITIALIZATION
       ========================================================== */
    function initAll() {
        updatePlaylistState();
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