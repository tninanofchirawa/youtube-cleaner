/**
 * ============================================================================
 * YOUTUBE CLEANER - Homepage Mind-Map Learning Hub Script
 * ============================================================================
 */

(function (window) {
    'use strict';

    var C = window.YTCleanerCommon;

    /* COLLISION AVOIDANCE & BOUNCE PHYSICS FOR TOPIC CARDS */
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

            var topics = C.getSavedTopics();
            var targetTopic = topics.find(function (t) { return t.id === topicId; });
            if (targetTopic) {
                targetTopic.x = newX;
                targetTopic.y = newY;
                C.saveTopics(topics);
            }

            drawConnectors();
        }
    }

    /* SVG CONNECTOR LINE CANVAS DRAWING */
    function drawConnectors() {
        var svg = document.getElementById('custom-connectors-svg');
        var cloud = document.querySelector('.custom-cloud-shape');
        if (!svg || !cloud) return;

        svg.innerHTML = '';
        var cloudRect = cloud.getBoundingClientRect();
        var cX = cloudRect.left + cloudRect.width / 2;
        var cY = cloudRect.top + cloudRect.height / 2;

        var topics = C.getSavedTopics();
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

    /* DRAG-AND-DROP HANDLER */
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
                var topics = C.getSavedTopics();
                var target = topics.find(function (t) { return t.id === topicId; });
                if (target) {
                    target.x = card.offsetLeft;
                    target.y = card.offsetTop;
                    C.saveTopics(topics);
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

    /* TOOLBAR STATE */
    function updateBottomToolbarState() {
        var topics = C.getSavedTopics();
        var history = C.getDeletedHistory();

        var addBtn = document.getElementById('tb-add-btn');
        var warnText = document.getElementById('tb-warning-notice');
        var historyBadge = document.getElementById('tb-history-count');

        if (historyBadge) {
            historyBadge.textContent = history.length;
        }

        if (!addBtn) return;

        if (topics.length >= C.MAX_TOPICS) {
            addBtn.classList.add('disabled-btn');
            if (warnText) warnText.style.display = 'block';
        } else {
            addBtn.classList.remove('disabled-btn');
            if (warnText) warnText.style.display = 'none';
        }
    }

    /* RENDER TOPIC CARDS */
    function renderTopicCards(container) {
        var existingCards = container.querySelectorAll('.custom-topic-card');
        existingCards.forEach(function (c) {
            c.remove();
        });

        var topics = C.getSavedTopics();
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
                C.deleteTopicWithHistory(t.id);
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
        C.applyCustomBackground();
    }

    /* MODAL DIALOGS */
    function openAddTopicModal(container) {
        var topics = C.getSavedTopics();
        if (topics.length >= C.MAX_TOPICS) {
            alert('Maximum of 7 topics allowed. Please remove a topic before adding a new one.');
            return;
        }

        var existingModal = document.getElementById('chrome-group-modal');
        if (existingModal) existingModal.remove();

        var selectedColor = C.PASTEL_PALETTE[0];

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
                    ${C.PASTEL_PALETTE.map((c, i) => `
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

            var currentTopics = C.getSavedTopics();
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

            C.saveTopics(currentTopics);
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

        var topics = C.getSavedTopics();

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
                        <strong>${C.escapeHtml(t.title)}</strong>
                    </td>
                    <td class="cg-td-url">${C.escapeHtml(t.url)}</td>
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
                C.deleteTopicWithHistory(topicId);
                renderTopicCards(container);
                openRemoveTopicsModal(container);
            }
        });
    }

    function openHistoryModal(container) {
        var existingModal = document.getElementById('chrome-group-modal');
        if (existingModal) existingModal.remove();

        var history = C.getDeletedHistory();
        var activeTopics = C.getSavedTopics();
        var isMaxReached = activeTopics.length >= C.MAX_TOPICS;

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
                        <strong>${C.escapeHtml(t.title)}</strong>
                        <small class="cg-deleted-time">(Deleted ${C.escapeHtml(t.deletedAt || '')})</small>
                    </td>
                    <td class="cg-td-url">${C.escapeHtml(t.url)}</td>
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
                var restored = C.restoreDeletedTopic(topicId);
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

        var currentBg = C.getBgImage();
        var currentBlur = C.getBgBlur();

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
                <input id="cg-bg-url" type="text" placeholder="https://images.unsplash.com/photo-..." value="${C.escapeHtml(currentBg.startsWith('data:') ? '' : currentBg)}" autocomplete="off" />

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
            C.saveBgImage('');
            C.saveBgBlur(12);
            C.applyCustomBackground();
            drawConnectors();
            closeModal();
        });

        document.getElementById('cg-save-bg-btn').addEventListener('click', function () {
            var newUrl = uploadedDataUrl;
            if (!newUrl) {
                newUrl = urlInput.value.trim();
            }

            C.saveBgImage(newUrl);
            C.saveBgBlur(blurSlider.value);
            C.applyCustomBackground();
            drawConnectors();
            closeModal();
        });
    }

    /* HOMEPAGE MIND-MAP WORKSPACE SYNCHRONIZATION */
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
        C.applyCustomBackground();

        var inputEl = document.getElementById('custom-search-input');
        if (inputEl) {
            inputEl.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (window.YTCleanerSearch && window.YTCleanerSearch.handleDirectSearch) {
                        window.YTCleanerSearch.handleDirectSearch(inputEl.value);
                    }
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

    /* EXPOSE GLOBALS TO OTHER MODULES */
    window.YTCleanerHome = {
        syncCenteredSearchUI: syncCenteredSearchUI,
        drawConnectors: drawConnectors
    };

})(window);
