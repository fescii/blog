/* ══════════════════════════════════════════════════════════════════════════════
   custom.js — Premium Blog JavaScript Logic
   ══════════════════════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    // Restore saved theme before initializing switcher
    const savedTheme = localStorage.getItem('blog-theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    initThemeSwitcher();
    initCopyCodeButtons();
    initBackToTop();
    initTagFiltering();
    initGoatCounterViews();
  });

  /* ══════════════════════════════════════════════════════════════════════════════
     1. Client-Side Theme Switcher
     ══════════════════════════════════════════════════════════════════════════════ */
  function initThemeSwitcher() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'midnight_hearth';

    // --- Page Theme Cards Interactive Syncing ---
    const themeCards = document.querySelectorAll('.theme-card');
    themeCards.forEach(card => {
      if (card.dataset.theme === currentTheme) {
        card.classList.add('active');
        const btn = card.querySelector('.theme-select-btn');
        if (btn) btn.textContent = 'Active';
      }

      card.addEventListener('click', function() {
        const theme = card.dataset.theme;
        applyTheme(theme);
      });
    });

    function applyTheme(theme) {
      // Apply theme attributes
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('blog-theme', theme);

      // Sync page cards
      document.querySelectorAll('.theme-card').forEach(card => {
        const isActive = card.dataset.theme === theme;
        card.classList.toggle('active', isActive);
        const btn = card.querySelector('.theme-select-btn');
        if (btn) {
          btn.textContent = isActive ? 'Active' : 'Select';
        }
      });
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════════
     2. Copy Code Block Buttons & Language Labels
     ══════════════════════════════════════════════════════════════════════════════ */
  function initCopyCodeButtons() {
    const preBlocks = document.querySelectorAll('pre');
    
    preBlocks.forEach(function(pre) {
      // Ensure absolute positioning context
      pre.style.position = 'relative';

      // 1. Attempt to inject language labels
      const codeBlock = pre.querySelector('code');
      if (codeBlock) {
        // Typically class matches "language-go", "language-rust", etc.
        const classList = codeBlock.className.split(' ');
        const langClass = classList.find(c => c.startsWith('language-') || c.startsWith('lang-'));
        
        if (langClass) {
          const lang = langClass.replace(/^(language-|lang-)/, '');
          const label = document.createElement('span');
          label.className = 'code-lang-label';
          label.textContent = lang;
          pre.appendChild(label);
        }
      }

      // 2. Create Copy Button
      const copyBtn = document.createElement('button');
      copyBtn.className = 'code-copy-btn';
      copyBtn.type = 'button';
      copyBtn.textContent = 'Copy';
      
      pre.appendChild(copyBtn);

      copyBtn.addEventListener('click', function() {
        const textToCopy = codeBlock ? codeBlock.innerText : pre.innerText;

        navigator.clipboard.writeText(textToCopy).then(function() {
          copyBtn.textContent = 'Copied!';
          copyBtn.classList.add('success');

          setTimeout(function() {
            copyBtn.textContent = 'Copy';
            copyBtn.classList.remove('success');
          }, 2000);
        }).catch(function(err) {
          console.error('Failed to copy text: ', err);
          copyBtn.textContent = 'Error';
          setTimeout(function() {
            copyBtn.textContent = 'Copy';
          }, 2000);
        });
      });
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════════
     3. Back to Top Floating Button
     ══════════════════════════════════════════════════════════════════════════════ */
  function initBackToTop() {
    const btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.type = 'button';
    btn.innerHTML = '↑';
    btn.title = 'Scroll to top';
    document.body.appendChild(btn);

    window.addEventListener('scroll', function() {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    });

    btn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════════
     4. Client-side Post Tag Filtering
     ══════════════════════════════════════════════════════════════════════════════ */
  function initTagFiltering() {
    const filterContainer = document.getElementById('tag-filter-container');
    const postItems = document.querySelectorAll('.post-item');
    if (!filterContainer || postItems.length === 0) return;

    // Collect all unique tags and count their frequency
    const tagCounts = {};
    postItems.forEach(item => {
      const tagsAttr = item.getAttribute('data-tags');
      if (tagsAttr) {
        tagsAttr.split(',').forEach(tag => {
          const trimmed = tag.trim().toLowerCase();
          if (trimmed) {
            tagCounts[trimmed] = (tagCounts[trimmed] || 0) + 1;
          }
        });
      }
    });

    // Sort tags by frequency (descending) and take top 12
    const sortedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([tag]) => tag);

    if (sortedTags.length === 0) {
      filterContainer.style.display = 'none';
      return;
    }

    // Create "All" filter pill
    const allPill = document.createElement('button');
    allPill.className = 'filter-pill active';
    allPill.textContent = 'All';
    allPill.dataset.filter = 'all';
    filterContainer.appendChild(allPill);

    // Create custom tag pills sorted by frequency
    sortedTags.forEach(tag => {
      const pill = document.createElement('button');
      pill.className = 'filter-pill';
      pill.textContent = `#${tag}`;
      pill.dataset.filter = tag.toLowerCase();
      filterContainer.appendChild(pill);
    });

    // Filtering handler
    filterContainer.addEventListener('click', function(e) {
      const pill = e.target.closest('.filter-pill');
      if (!pill) return;

      // Update active pill styling
      filterContainer.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filterValue = pill.dataset.filter;

      // First, reset all items to visible
      postItems.forEach(item => {
        item.style.display = 'flex';
      });

      // Then apply filter if not "all"
      if (filterValue !== 'all') {
        postItems.forEach(item => {
          const itemTags = item.getAttribute('data-tags') || '';
          const tagArray = itemTags.split(',').map(tag => tag.trim().toLowerCase());
          if (!tagArray.includes(filterValue.toLowerCase())) {
            item.style.display = 'none';
          }
        });
      }

      // Hide or show year groups based on whether they contain visible items
      document.querySelectorAll('.year-group').forEach(group => {
        const items = group.querySelectorAll('.post-item');
        let visibleCount = 0;
        
        items.forEach(item => {
          if (item.style.display !== 'none') {
            visibleCount++;
          }
        });

        console.log('Year group check:', { itemsLength: items.length, visibleCount, willHide: items.length > 0 && visibleCount === 0 });

        if (items.length > 0 && visibleCount === 0) {
          group.style.display = 'none';
        } else {
          group.style.display = 'flex';
        }
      });

      // Also hide empty years if no items are visible at all
      const yearGroups = document.querySelectorAll('.year-group');
      let anyVisible = false;
      yearGroups.forEach(group => {
        if (group.style.display !== 'none') {
          anyVisible = true;
        }
      });

      if (!anyVisible) {
        // Show a "no results" message
        if (!document.querySelector('.no-results')) {
          const noResults = document.createElement('div');
          noResults.className = 'no-results';
          noResults.textContent = 'No posts found for this tag.';
          noResults.style.cssText = 'padding: var(--space-4); text-align: center; color: var(--textSecondary);';
          document.querySelector('.posts-list').appendChild(noResults);
        }
      } else {
        const noResults = document.querySelector('.no-results');
        if (noResults) noResults.remove();
      }
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════════
     5. GoatCounter View Counter Fetch
     ══════════════════════════════════════════════════════════════════════════════ */
  function initGoatCounterViews() {
    const viewsElements = document.querySelectorAll('.post-views');
    if (viewsElements.length === 0) return;

    const goatcounterCode = 'femar';

    viewsElements.forEach(element => {
      const path = element.getAttribute('data-goatcounter-page');
      if (!path) return;

      const url = `https://${goatcounterCode}.goatcounter.com/counter/${encodeURIComponent(path)}.json`;

      fetch(url)
        .then(response => {
          if (!response.ok) throw new Error('Network response not ok');
          return response.json();
        })
        .then(data => {
          if (data && typeof data.count !== 'undefined') {
            const countFormatted = Number(data.count).toLocaleString();
            element.textContent = `${countFormatted} views`;
          } else {
            element.textContent = '-- views';
          }
        })
        .catch(err => {
          element.textContent = '-- views';
        });
    });
  }

})();
