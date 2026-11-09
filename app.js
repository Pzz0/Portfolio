/* Prachiti Zemse — Portfolio
   All text and images come from site.json and projects.json,
   which are edited through the Pages CMS editor. No need to touch this file. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === undefined || v === null || v === false) return;
      if (k === 'text') el.textContent = v;
      else if (k === 'class') el.className = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c === null || c === undefined || c === false) continue;
      (Array.isArray(c) ? c : [c]).forEach(function (n) {
        if (n) el.appendChild(typeof n === 'string' ? document.createTextNode(n) : n);
      });
    }
    return el;
  }

  function str(v) { return typeof v === 'string' ? v.trim() : (v == null ? '' : String(v)); }
  function list(v) {
    if (Array.isArray(v)) return v.filter(function (x) { return x !== null && x !== undefined && x !== ''; });
    return v ? [v] : [];
  }
  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function formatDate(v) {
    v = str(v);
    if (!v) return '';
    var m = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
    var d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(v);
    if (isNaN(d)) return v;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function loadJSON(path) {
    return fetch(path, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(path + ' ' + r.status);
      return r.json();
    });
  }

  function placeholder(label) {
    return h('div', { class: 'ph', role: 'img', 'aria-label': label }, h('span', { text: label }));
  }

  function picture(src, alt, eager) {
    return h('img', { src: src, alt: alt || '', loading: eager ? 'eager' : 'lazy', decoding: 'async' });
  }

  /* ---------- Theme toggle ---------- */
  function initTheme() {
    var root = document.documentElement;
    function sync() {
      var dark = root.getAttribute('data-theme') === 'dark';
      $$('.theme-toggle').forEach(function (b) {
        b.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
        b.setAttribute('aria-pressed', dark ? 'true' : 'false');
      });
    }
    $$('.theme-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) {}
        sync();
      });
    });
    sync();
  }

  /* ---------- Header shadow on scroll ---------- */
  function initHeader() {
    var header = $('.site-header');
    if (!header) return;
    function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 20); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Parallax (hero) ---------- */
  function initParallax() {
    var layers = $$('[data-speed]');
    var badge = $('[data-rotate]');
    var hero = $('.hero');
    if (!hero || reduceMotion) return;
    var ticking = false;
    function update() {
      ticking = false;
      var y = window.scrollY;
      if (y > hero.offsetHeight * 1.2) return;
      layers.forEach(function (el) {
        var s = parseFloat(el.getAttribute('data-speed')) || 0;
        el.style.transform = 'translate3d(0,' + (y * s).toFixed(1) + 'px,0)';
      });
      var text = $('.hero-text');
      if (text) text.style.opacity = Math.max(0, 1 - y / (hero.offsetHeight * 0.75)).toFixed(3);
      if (badge) badge.style.transform = 'rotate(' + (y * 0.12).toFixed(1) + 'deg)';
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- Fade-in on scroll ---------- */
  var revealObserver = null;
  function reveal(els) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('is-visible'); revealObserver.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    }
    els.forEach(function (el, i) {
      if (el.dataset.stagger) el.style.transitionDelay = (i % 3) * 0.12 + 's';
      revealObserver.observe(el);
    });
  }

  /* ---------- Site content ---------- */
  function renderSite(site) {
    $$('[data-field]').forEach(function (el) {
      var key = el.getAttribute('data-field');
      var v = str(site[key]);
      if (v) el.textContent = v;
      if (!v && el.hasAttribute('data-hide-empty')) el.hidden = true;
    });

    var nameEl = $('[data-name-split]');
    var name = str(site.name) || 'Prachiti Zemse';
    if (nameEl) {
      var parts = name.split(/\s+/);
      var first = parts.shift();
      var rest = parts.join(' ');
      nameEl.textContent = '';
      nameEl.setAttribute('aria-label', name);
      nameEl.appendChild(h('span', { class: 'line', 'aria-hidden': 'true' }, h('span', { text: first })));
      if (rest) nameEl.appendChild(h('span', { class: 'line', 'aria-hidden': 'true' }, h('span', { text: rest })));
    }
    if (document.body.dataset.page === 'home') {
      document.title = name + ' — ' + (str(site.title) || 'Portfolio');
    }

    var mono = $('.arch-mono');
    if (mono) {
      var initials = name.split(/\s+/).map(function (w) { return w.charAt(0); });
      mono.textContent = '';
      mono.appendChild(document.createTextNode(initials[0] || ''));
      if (initials[1]) mono.appendChild(h('em', { text: initials[1].toLowerCase() }));
    }
    var heroMono = $('.hero-mono');
    if (heroMono) heroMono.textContent = name.split(/\s+/).map(function (w) { return w.charAt(0); }).join('').slice(0, 2);

    var portrait = str(site.portrait);
    var archImg = $('.arch-img');
    if (portrait && archImg) {
      archImg.src = portrait;
      archImg.alt = 'Portrait of ' + name;
      archImg.hidden = false;
      if (mono) mono.hidden = true;
    }

    var eduList = $('[data-list="education"]');
    if (eduList) {
      list(site.education).forEach(function (e) {
        eduList.appendChild(h('li', { class: 'edu-item reveal' },
          h('div', { class: 'edu-years', text: str(e.years) }),
          h('div', null,
            h('h3', { class: 'edu-degree', text: str(e.degree) }),
            str(e.institute) ? h('p', { class: 'edu-inst', text: str(e.institute) }) : null,
            str(e.details) ? h('p', { class: 'edu-details', text: str(e.details) }) : null
          )
        ));
      });
    }

    var skillList = $('[data-list="skills"]');
    if (skillList) {
      list(site.skills).forEach(function (s, i) {
        var label = typeof s === 'object' ? str(s.name || s.skill) : str(s);
        if (!label) return;
        skillList.appendChild(h('li', { class: 'skill reveal', 'data-stagger': '1' },
          h('span', { class: 'skill-num', text: pad(i + 1) }),
          h('span', { class: 'skill-name', text: label })
        ));
      });
    }

    var email = str(site.email);
    $$('[data-email]').forEach(function (a) {
      if (email) { a.href = 'mailto:' + email; a.textContent = email; } else a.hidden = true;
    });
    var linkedin = str(site.linkedin);
    $$('[data-linkedin]').forEach(function (a) {
      if (linkedin) a.href = linkedin; else a.closest('li').hidden = true;
    });

    var resume = str(site.resume);
    $$('[data-resume]').forEach(function (a) {
      if (resume) {
        a.href = resume;
      } else {
        a.textContent = 'Request resume';
        a.removeAttribute('target');
        a.href = email ? 'mailto:' + email + '?subject=' + encodeURIComponent('Resume request') : '#contact';
      }
    });

    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* ---------- Projects ---------- */
  function projectImages(p) {
    var imgs = [];
    var final = str(p.final_look);
    if (final) imgs.push({ src: final, label: 'Final look' });
    var concepts = list(p.concept_images).map(function (c) { return typeof c === 'object' ? str(c.image || c.src) : str(c); }).filter(Boolean);
    concepts.forEach(function (src, i) {
      imgs.push({ src: src, label: 'Concept development · ' + (i + 1) + ' / ' + concepts.length });
    });
    if (!imgs.length) {
      imgs = [
        { src: '', label: 'Final look' },
        { src: '', label: 'Concept development · 1 / 2' },
        { src: '', label: 'Concept development · 2 / 2' }
      ];
    } else if (!final) {
      imgs.unshift({ src: '', label: 'Final look' });
    }
    return imgs;
  }

  function card(p, index, onOpen) {
    var cover = str(p.final_look);
    var meta = [formatDate(p.date), str(p.fabrics)].filter(Boolean).join(' · ');
    return h('button', { class: 'project-card reveal', type: 'button', 'data-stagger': '1', onclick: function () { onOpen(p, index); } },
      h('div', { class: 'project-media' }, cover ? picture(cover, str(p.title) + ' — final look') : placeholder('Photo coming soon')),
      h('span', { class: 'project-index', text: pad(index + 1) }),
      h('h3', { class: 'project-title', text: str(p.title) || 'Untitled project' }),
      meta ? h('p', { class: 'project-meta', text: meta }) : null
    );
  }

  var modal, lastFocus;
  function buildModal() {
    modal = h('dialog', { class: 'modal', 'aria-labelledby': 'modal-title' });
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    modal.addEventListener('cancel', function (e) { e.preventDefault(); closeModal(); });
    modal.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { var n = $('.gallery-nav--next', modal); if (n && !n.hidden) n.click(); }
      if (e.key === 'ArrowLeft') { var p = $('.gallery-nav--prev', modal); if (p && !p.hidden) p.click(); }
    });
    document.body.appendChild(modal);
  }

  function closeModal() {
    if (!modal || !modal.open) return;
    modal.close();
    document.body.classList.remove('modal-open');
    if (lastFocus) lastFocus.focus();
  }

  function openProject(p) {
    if (!modal) buildModal();
    lastFocus = document.activeElement;
    var imgs = projectImages(p);
    var current = 0;
    var title = str(p.title) || 'Untitled project';

    var stage = h('div', { class: 'gallery-stage' });
    var caption = h('span', { class: 'gallery-caption' });
    var prev = h('button', { class: 'gallery-nav gallery-nav--prev', type: 'button', 'aria-label': 'Previous image', text: '←', onclick: function () { show(current - 1); } });
    var next = h('button', { class: 'gallery-nav gallery-nav--next', type: 'button', 'aria-label': 'Next image', text: '→', onclick: function () { show(current + 1); } });
    var thumbs = h('div', { class: 'thumbs', role: 'tablist', 'aria-label': 'Project images' });

    imgs.forEach(function (img, i) {
      thumbs.appendChild(h('button', { class: 'thumb', type: 'button', 'aria-label': img.label, onclick: function () { show(i); } },
        img.src ? picture(img.src, '') : placeholder('')));
    });

    function show(i) {
      current = (i + imgs.length) % imgs.length;
      var img = imgs[current];
      stage.textContent = '';
      stage.appendChild(caption);
      caption.textContent = img.label;
      stage.appendChild(img.src ? picture(img.src, title + ' — ' + img.label, true) : placeholder(img.label + ' — photo coming soon'));
      stage.appendChild(prev); stage.appendChild(next);
      prev.hidden = next.hidden = imgs.length < 2;
      $$('.thumb', thumbs).forEach(function (t, j) { t.setAttribute('aria-current', j === current ? 'true' : 'false'); });
      var active = thumbs.children[current];
      if (active && active.scrollIntoView) active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }

    var rows = [
      ['Fabrics used', str(p.fabrics)],
      ['Time taken', str(p.time_taken)],
      ['Total cost', str(p.cost)],
      ['Uploaded', formatDate(p.date)]
    ].filter(function (r) { return r[1]; });

    var onProjectsPage = document.body.dataset.page === 'projects';
    var specs = h('div', { class: 'specs' },
      h('div', { class: 'specs-top' },
        h('button', { class: 'modal-back', type: 'button', text: onProjectsPage ? '← All projects' : '← Back', onclick: closeModal }),
        h('button', { class: 'modal-close', type: 'button', 'aria-label': 'Close project', text: '×', onclick: closeModal })
      ),
      h('h2', { class: 'specs-title', id: 'modal-title', text: title }),
      str(p.description) ? h('p', { class: 'specs-desc', text: str(p.description) }) : null,
      rows.length ? h('dl', { class: 'spec-list' }, rows.map(function (r) {
        return h('div', { class: 'spec-row' }, h('dt', { text: r[0] }), h('dd', { text: r[1] }));
      })) : null
    );

    modal.textContent = '';
    modal.appendChild(h('div', { class: 'modal-grid' },
      h('div', { class: 'gallery' }, stage, imgs.length > 1 ? thumbs : null),
      specs
    ));
    show(0);
    modal.showModal();
    modal.scrollTop = 0;
    document.body.classList.add('modal-open');
    $('.modal-close', modal).focus();
  }

  function renderProjects(projects) {
    projects = list(projects).filter(function (p) { return p && typeof p === 'object' && p.hidden !== true; });
    $$('[data-count]').forEach(function (el) {
      el.textContent = projects.length ? '(' + projects.length + ')' : '';
      if (document.body.dataset.page === 'projects') el.textContent = projects.length + (projects.length === 1 ? ' project' : ' projects');
    });

    $$('[data-projects]').forEach(function (grid) {
      var mode = grid.getAttribute('data-projects');
      var items = projects.map(function (p, i) { return { p: p, i: i }; });
      if (mode === 'featured') {
        var featured = items.filter(function (x) { return x.p.featured; });
        items = (featured.length ? featured : items).slice(0, 3);
      }
      if (!items.length) {
        grid.appendChild(h('p', { class: 'muted', text: 'Projects coming soon.' }));
        return;
      }
      items.forEach(function (x) { grid.appendChild(card(x.p, x.i, openProject)); });
    });
  }

  /* ---------- Boot ---------- */
  initTheme();
  initHeader();
  initParallax();

  Promise.all([
    loadJSON('site.json').catch(function () { return {}; }),
    loadJSON('projects.json').catch(function () { return { projects: [] }; })
  ]).then(function (res) {
    renderSite(res[0] || {});
    renderProjects((res[1] && res[1].projects) || []);
    reveal($$('.reveal'));
  });
})();
