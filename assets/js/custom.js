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
    const postRows = document.querySelectorAll('.post-row');
    if (!filterContainer || postRows.length === 0) return;

    // Collect all unique tags
    const allTags = new Set();
    postRows.forEach(row => {
      const tagsAttr = row.getAttribute('data-tags');
      if (tagsAttr) {
        tagsAttr.split(',').forEach(tag => {
          const trimmed = tag.trim();
          if (trimmed) allTags.add(trimmed);
        });
      }
    });

    if (allTags.size === 0) {
      filterContainer.style.display = 'none';
      return;
    }

    // Create "All" filter pill
    const allPill = document.createElement('button');
    allPill.className = 'filter-pill active';
    allPill.textContent = 'All';
    allPill.dataset.filter = 'all';
    filterContainer.appendChild(allPill);

    // Create custom tag pills sorted alphabetically
    Array.from(allTags).sort().forEach(tag => {
      const pill = document.createElement('button');
      pill.className = 'filter-pill';
      pill.textContent = `#${tag}`;
      pill.dataset.filter = tag;
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

      // Filter rows and handle year heading empty groups
      postRows.forEach(row => {
        if (filterValue === 'all') {
          row.style.display = 'flex';
        } else {
          const rowTags = row.getAttribute('data-tags') || '';
          if (rowTags.split(',').includes(filterValue)) {
            row.style.display = 'flex';
          } else {
            row.style.display = 'none';
          }
        }
      });

      // Hide or show year headings based on whether they contain visible rows
      document.querySelectorAll('.year-group').forEach(group => {
        const visibleRows = group.querySelectorAll('.post-row[style="display: flex;"]');
        // If all children are filtered out (or if the selected filter results in zero items)
        const hiddenRows = group.querySelectorAll('.post-row[style="display: none;"]');
        const totalRows = group.querySelectorAll('.post-row');

        if (totalRows.length > 0 && visibleRows.length === 0) {
          group.style.display = 'none';
        } else {
          group.style.display = 'block';
        }
      });
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════════
     5. GoatCounter View Counter Fetch
     ══════════════════════════════════════════════════════════════════════════════ */
  function initGoatCounterViews() {
    const viewsSpan = document.getElementById('post-views');
    const separator = document.getElementById('views-separator');
    if (!viewsSpan) return;

    // Use current page path for query
    const path = window.location.pathname;

    // We fetch from GoatCounter's public API.
    // If you run on a dummy account, we default to the site title or path metrics.
    // Replace 'my-username' with your actual GoatCounter code if available.
    const goatcounterCode = 'my-username'; 
    const url = `https://${goatcounterCode}.goatcounter.com/counter/${encodeURIComponent(path)}.json`;

    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error('Network response not ok');
        return response.json();
      })
      .then(data => {
        if (data && typeof data.count !== 'undefined') {
          // Format the count with commas if large
          const countFormatted = Number(data.count).toLocaleString();
          viewsSpan.textContent = `${countFormatted} views`;
          
          // Make visible
          viewsSpan.style.display = 'inline';
          if (separator) separator.style.display = 'inline';
        } else {
          // Hide gracefully if count not present
          viewsSpan.style.display = 'none';
          if (separator) separator.style.display = 'none';
        }
      })
      .catch(err => {
        // Fallback gracefully on network / CORS errors, hiding placeholder
        viewsSpan.style.display = 'none';
        if (separator) separator.style.display = 'none';
      });
  }

})();
