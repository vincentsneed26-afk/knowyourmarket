/* Know Your Market — standalone site behaviours
   Hand-rolled, framework-free. Drives: hover styles, decorative pseudo
   elements, sticky-nav shrink, mobile menu, scroll reveal, demo form. */
(function () {
  'use strict';

  // ---- hover / active / focus inline-style states ----
  function parseDecls(str) {
    var out = [];
    (str || '').split(';').forEach(function (d) {
      var i = d.indexOf(':');
      if (i < 0) return;
      var prop = d.slice(0, i).trim();
      var val = d.slice(i + 1).trim();
      if (prop) out.push([prop, val.replace(/\s*!important\s*$/, '')]);
    });
    return out;
  }
  function bindState(el, decls, onEvt, offEvt) {
    var list = parseDecls(decls);
    el.addEventListener(onEvt, function () {
      el.__saved = el.__saved || {};
      list.forEach(function (p) {
        if (!(p[0] in el.__saved)) el.__saved[p[0]] = el.style.getPropertyValue(p[0]);
        el.style.setProperty(p[0], p[1]);
      });
    });
    el.addEventListener(offEvt, function () {
      list.forEach(function (p) {
        var s = el.__saved && el.__saved[p[0]];
        if (s) el.style.setProperty(p[0], s);
        else el.style.removeProperty(p[0]);
      });
    });
  }
  function interactive() {
    document.querySelectorAll('[style-hover]').forEach(function (el) {
      bindState(el, el.getAttribute('style-hover'), 'mouseenter', 'mouseleave');
    });
    document.querySelectorAll('[style-active]').forEach(function (el) {
      bindState(el, el.getAttribute('style-active'), 'mousedown', 'mouseup');
    });
    document.querySelectorAll('[style-focus]').forEach(function (el) {
      bindState(el, el.getAttribute('style-focus'), 'focusin', 'focusout');
    });
  }

  // ---- decorative ::after / ::before, rebuilt as real spans ----
  function pseudos() {
    ['after', 'before'].forEach(function (pos) {
      document.querySelectorAll('[style-' + pos + ']').forEach(function (el) {
        var css = el.getAttribute('style-' + pos) || '';
        var span = document.createElement('span');
        span.setAttribute('aria-hidden', 'true');
        span.style.cssText = css.replace(/content\s*:[^;]*;?/i, '');
        if (!span.style.display) span.style.display = 'block';
        if (pos === 'after') el.appendChild(span);
        else el.insertBefore(span, el.firstChild);
      });
    });
  }

  // ---- sticky nav shrink on scroll ----
  function nav() {
    var h = document.querySelector('.kym-header');
    if (!h) return;
    var logo = h.querySelector('a img');
    function onScroll() {
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      var s = y > 28;
      h.style.height = s ? '70px' : '100px';
      h.style.background = s ? 'rgba(255,255,255,0.92)' : '#ffffff';
      h.style.borderBottomColor = s ? '#ECE7F0' : 'transparent';
      h.style.boxShadow = s ? '0 10px 34px -14px rgba(28,33,67,0.20)' : '0 0 0 rgba(0,0,0,0)';
      h.style.backdropFilter = s ? 'saturate(180%) blur(12px)' : 'none';
      h.style.webkitBackdropFilter = s ? 'saturate(180%) blur(12px)' : 'none';
      if (logo) logo.style.height = s ? '42px' : '52px';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---- mobile menu ----
  function menu() {
    var b = document.querySelector('.kym-burger');
    var m = document.querySelector('.kym-mobile-menu');
    if (!b || !m) return;
    b.addEventListener('click', function () { m.classList.toggle('kym-open'); });
    m.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { m.classList.remove('kym-open'); });
    });
  }

  // ---- scroll reveal ----
  function reveal() {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    var targets = [];
    var dr = document.querySelectorAll('[data-reveal]');
    if (dr.length) {
      dr.forEach(function (el) { el.__d = 0; targets.push(el); });
    } else {
      var groups = [
        ['.kym-about > div', 90],
        ['.kym-stats-head', 0],
        ['.kym-stats-grid > div', 90],
        ['.kym-testi-grid > div', 110],
        ['.kym-svc', 0],
        ['.kym-cta-card', 0],
        ['.kym-foot-grid > div', 70]
      ];
      groups.forEach(function (g) {
        document.querySelectorAll(g[0]).forEach(function (el, i) { el.__d = i * g[1]; targets.push(el); });
      });
    }
    targets.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = 'opacity .75s cubic-bezier(.16,1,.3,1), transform .75s cubic-bezier(.16,1,.3,1)';
      el.style.willChange = 'opacity, transform';
    });
    function show(el) {
      if (el.__r) return;
      el.__r = 1;
      el.style.transitionDelay = (el.__d || 0) + 'ms';
      el.style.opacity = '1';
      el.style.transform = 'none';
    }
    function inView(el) {
      var r = el.getBoundingClientRect();
      var vh = window.innerHeight || 0;
      return r.top < vh * 0.92 && r.bottom > 0;
    }
    requestAnimationFrame(function () { targets.forEach(function (el) { if (inView(el)) show(el); }); });
    if (typeof IntersectionObserver !== 'undefined') {
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (x) { if (x.isIntersecting) { show(x.target); io.unobserve(x.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
      targets.forEach(function (el) { if (!el.__r) io.observe(el); });
    } else {
      targets.forEach(show);
    }
    window.addEventListener('scroll', function () {
      targets.forEach(function (el) { if (!el.__r && inView(el)) show(el); });
    }, { passive: true });
    setTimeout(function () { targets.forEach(show); }, 2600);
  }

  // ---- Book a Demo form ----
  function form() {
    var f = document.getElementById('kym-demo-form');
    if (!f) return;
    function setInvalid(id, on, msg) {
      var el = document.getElementById(id);
      if (!el) return;
      el.classList.toggle('kym-invalid', on);
      if (on && msg) {
        var sp = el.querySelector('.kym-err span');
        if (sp) sp.textContent = msg;
      }
    }
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var get = function (n) { return f.elements[n] ? f.elements[n].value.trim() : ''; };
      var name = get('name'), email = get('email'), phone = get('phone'),
          interest = get('interest'), message = get('message');
      var ok = true;
      setInvalid('f-name', !name); if (!name) ok = false;
      if (!email) { setInvalid('f-email', true, 'Please enter your email.'); ok = false; }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setInvalid('f-email', true, 'Please enter a valid email address.'); ok = false; }
      else setInvalid('f-email', false);
      if (!phone) { setInvalid('f-phone', true, 'Please enter a contact number.'); ok = false; }
      else if (phone.replace(/[^0-9]/g, '').length < 7) { setInvalid('f-phone', true, 'Please enter a valid phone number.'); ok = false; }
      else setInvalid('f-phone', false);
      setInvalid('f-interest', !interest); if (!interest) ok = false;
      if (!ok) {
        var bad = f.querySelector('.kym-invalid input, .kym-invalid select, .kym-invalid textarea');
        if (bad) bad.focus();
        return;
      }
      var to = 'vincentsneed26@gmail.com';
      var subject = 'Book a Demo request — ' + name + ' (' + interest + ')';
      var body = 'New Book a Demo request from the Know Your Market website:\n\n' +
        'Name: ' + name + '\n' + 'Email: ' + email + '\n' + 'Telephone: ' + phone + '\n' +
        'Interested in: ' + interest + '\n\nMessage:\n' + (message || '(none)') + '\n';
      var KEY = '1e445864-1e01-4d9f-ac52-6a1e023038c8';
      function finish() {
        var su = document.getElementById('kym-success');
        var ff = document.getElementById('kym-form-fields');
        if (ff) ff.style.display = 'none';
        if (su) su.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      function fallback() {
        window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        finish();
      }
      if (KEY) {
        fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            access_key: KEY, subject: subject, from_name: name, email: email, name: name,
            telephone: phone, interested_in: interest, message: message || '(none)', replyto: email
          })
        }).then(function (r) { return r.json(); })
          .then(function (d) { if (d && d.success) finish(); else fallback(); })
          .catch(fallback);
      } else {
        fallback();
      }
    });
  }

  function init() { interactive(); pseudos(); nav(); menu(); reveal(); form(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
