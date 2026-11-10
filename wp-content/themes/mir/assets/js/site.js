(function () {
  'use strict';
  var d = document;

  /* menu mobilne */
  var burger = d.getElementById('burger'), menu = d.getElementById('menu');
  function zamknij() { menu.classList.remove('otwarte'); d.body.classList.remove('menu-otw'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Otwórz menu'); }
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var o = menu.classList.toggle('otwarte');
      d.body.classList.toggle('menu-otw', o);
      burger.setAttribute('aria-expanded', o ? 'true' : 'false');
      burger.setAttribute('aria-label', o ? 'Zamknij menu' : 'Otwórz menu');
    });
    menu.addEventListener('click', function (e) { var a = e.target.closest('a'); if (a && !a.closest('.menu-rozw')) zamknij(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') { zamknij(); zamknijPod(); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) zamknij(); });
  }

  /* podmenu Oferta: przycisk rozwija (telefon) / otwiera z klawiatury (komputer) */
  var pod = d.querySelector('.menu-pod'), rozw = pod ? pod.querySelector('.menu-rozw') : null;
  function zamknijPod() { if (pod) { pod.classList.remove('otw'); rozw.setAttribute('aria-expanded', 'false'); } }
  if (rozw) {
    rozw.addEventListener('click', function () {
      var o = pod.classList.toggle('otw');
      rozw.setAttribute('aria-expanded', o ? 'true' : 'false');
    });
    d.addEventListener('click', function (e) { if (window.innerWidth > 900 && !e.target.closest('.menu-pod')) zamknijPod(); });
    pod.addEventListener('mouseleave', function () { if (window.innerWidth > 900) zamknijPod(); });
    if (pod.querySelector('.pm-g a.akt') && window.innerWidth <= 900) { pod.classList.add('otw'); rozw.setAttribute('aria-expanded', 'true'); }
  }

  /* przeciąganie myszą torów i karuzel */
  function ciagnij(tor, poKoncu) {
    var x0 = 0, s0 = 0, wcisk = false, ruch = 0;
    tor.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('button') || tor.scrollWidth <= tor.clientWidth + 2) return;
      wcisk = true; ruch = 0; x0 = e.clientX; s0 = tor.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!wcisk) return; var dx = e.clientX - x0; ruch = Math.max(ruch, Math.abs(dx));
      if (ruch > 4) tor.classList.add('ciag');
      tor.scrollLeft = s0 - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!wcisk) return; wcisk = false; tor.classList.remove('ciag');
      if (poKoncu && ruch > 4) poKoncu(s0);
      setTimeout(function () { ruch = 0; }, 0);
    });
    tor.addEventListener('click', function (e) { if (ruch > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
    tor.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }
  d.querySelectorAll('[data-karuzela]').forEach(function (k) {
    var tor = k.querySelector('.kar-tor'), n = tor.children.length, licz = k.querySelector('.kar-licz');
    if (n < 2) return;
    function idx() { return Math.round(tor.scrollLeft / tor.clientWidth); }
    function idz(i) { i = Math.max(0, Math.min(n - 1, i)); tor.scrollTo({ left: i * tor.clientWidth, behavior: 'smooth' }); }
    var t; tor.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(function () { if (licz) licz.textContent = (idx() + 1) + ' / ' + n; }, 60); }, { passive: true });
    k.querySelector('.kar-l').addEventListener('click', function () { idz(idx() - 1); });
    k.querySelector('.kar-p').addEventListener('click', function () { idz(idx() + 1); });
    tor.tabIndex = 0; tor.setAttribute('aria-label', 'Zdjęcia, ' + n + ' szt., przewijane w bok');
    tor.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); idz(idx() + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); idz(idx() - 1); } });
    tor.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    ciagnij(tor, function (s0) {
      var w = tor.clientWidth, start = Math.round(s0 / w), dx = tor.scrollLeft - s0;
      idz(Math.abs(dx) > w * 0.15 ? start + (dx > 0 ? 1 : -1) : start);
    });
  });
  d.querySelectorAll('[data-przewijak]').forEach(function (t) { ciagnij(t); });
  d.querySelectorAll('.tor-b').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = d.getElementById(b.dataset.tor), el = t.firstElementChild;
      var krok = el ? (el.getBoundingClientRect().width + 18) * 2 : 600;
      t.scrollBy({ left: krok * Number(b.dataset.kier), behavior: 'smooth' });
    });
  });

  /* adresy e-mail: href wstawiany skryptem (ochrona przed robotami) */
  d.querySelectorAll('a[data-m]').forEach(function (a) {
    try { var m = atob(a.getAttribute('data-m').split('').reverse().join('')); a.href = 'mailto:' + m; a.textContent = m; } catch (e) {}
  });

  /* „Zgłoś awarię” ustawia rodzaj sprawy (też po przejściu na podstronę Kontakt) */
  function ustawSerwis() { var r = d.querySelector('.sprawa input[data-serwis]'); if (r) r.checked = true; }
  d.querySelectorAll('[data-sprawa="serwis"]').forEach(function (a) {
    a.addEventListener('click', function () { try { sessionStorage.setItem('mir-sprawa', 'serwis'); } catch (e) {} ustawSerwis(); });
  });
  try { if (sessionStorage.getItem('mir-sprawa') === 'serwis' && d.getElementById('zapytanie')) { ustawSerwis(); sessionStorage.removeItem('mir-sprawa'); } } catch (e) {}

  /* formularz: wysyłka bez przeładowania strony */
  var form = d.getElementById('zapytanie'), info = d.getElementById('form-info');
  if (form && form.getAttribute('method') === 'post') {
    var t0 = Date.now();
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = form.imie.value.trim(), t = form.tel.value.trim(), m = form.email.value.trim();
      function pokaz(ok, txt) { info.className = 'form-info ' + (ok ? 'ok' : 'blad'); info.textContent = txt; }
      if (!n || (!t && !m)) { pokaz(false, 'Podaj imię i nazwisko (albo firmę) oraz telefon lub e-mail.'); return; }
      if (m && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m)) { pokaz(false, 'Sprawdź adres e-mail.'); return; }
      if (t && t.replace(/\D+/g, '').length < 9) { pokaz(false, 'Sprawdź numer telefonu.'); return; }
      if (!form.zgoda.checked) { pokaz(false, 'Zaznacz zgodę na kontakt w sprawie zapytania.'); return; }
      form.czas.value = String(Date.now() - t0);
      var fd = new FormData(form); fd.append('ajax', '1');
      var btn = form.querySelector('button[type=submit]'); btn.disabled = true;
      pokaz(true, 'Wysyłanie...');
      fetch(form.getAttribute('action'), { method: 'POST', body: fd, credentials: 'same-origin' })
        .then(function (r) { return r.json(); })
        .then(function (x) { pokaz(!!x.ok, x.msg || ''); if (x.ok) { form.reset(); t0 = Date.now(); } })
        .catch(function () { pokaz(false, 'Nie udało się wysłać. Zadzwoń albo napisz e-mail.'); })
        .then(function () { btn.disabled = false; });
    });
  }

  /* pasek dolny na telefonie: po minięciu pierwszego ekranu, ukryty przy sekcji kontakt */
  var mob = d.getElementById('mob'), ha = d.getElementById('heroAkcje') || d.querySelector('.glowa'), kt = d.getElementById('kontakt');
  if ('IntersectionObserver' in window && mob && ha) {
    var za = false, wK = false;
    function ustaw() {
      var w = za && !wK;
      mob.classList.toggle('widac', w); mob.setAttribute('aria-hidden', String(!w));
      mob.querySelectorAll('a').forEach(function (a) { a.tabIndex = w ? 0 : -1; });
    }
    new IntersectionObserver(function (en) { za = !en[0].isIntersecting && en[0].boundingClientRect.top < 0; ustaw(); }).observe(ha);
    if (kt) new IntersectionObserver(function (en) { wK = en[0].isIntersecting; ustaw(); }, { threshold: 0.05 }).observe(kt);
  }

  /* powiększenie skanów referencji */
  var lupa = d.getElementById('lupa');
  if (lupa) {
    var limg = lupa.querySelector('img'), skad = null;
    function zamknijLupe() { lupa.hidden = true; d.body.classList.remove('lupa-otw'); limg.removeAttribute('src'); if (skad) skad.focus(); }
    d.addEventListener('click', function (e) {
      var a = e.target.closest('[data-lupa]');
      if (!a) return;
      e.preventDefault(); skad = a;
      limg.src = a.getAttribute('href'); limg.alt = (a.querySelector('img') || {}).alt || '';
      lupa.hidden = false; d.body.classList.add('lupa-otw'); lupa.querySelector('.lupa-x').focus();
    });
    lupa.addEventListener('click', function (e) { if (e.target !== limg) zamknijLupe(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lupa.hidden) zamknijLupe(); });
  }

  /* baner zgód cookies: wybór w przeglądarce na 12 miesięcy; mapa Google od razu, po odmowie zastępnik */
  var KL = 'mir-cookies', ROK = 365 * 864e5, zg = null;
  try { zg = JSON.parse(localStorage.getItem(KL) || 'null'); } catch (e) { zg = null; }
  if (zg && (!zg.t || Date.now() - zg.t > ROK)) zg = null;
  var ban = d.getElementById('cookies'), kat = d.getElementById('cookies-kat'), chMapy = d.getElementById('cookies-mapy');
  var mapa = d.querySelector('.mapa'), ifr = mapa ? mapa.querySelector('iframe') : null, ifrSrc = ifr ? ifr.src : '';
  function mapy() {
    if (!mapa || !ifr) return;
    var zgoda = !zg || zg.mapy, zast = mapa.querySelector('.mapa-zast');
    if (zgoda && !mapa.querySelector('iframe')) { if (zast) zast.remove(); ifr.src = ifrSrc; mapa.appendChild(ifr); }
    if (!zgoda && mapa.querySelector('iframe')) {
      ifr.remove();
      var adr = mapa.getAttribute('data-adres') || '';
      var x = d.createElement('div'); x.className = 'mapa-zast';
      x.innerHTML = '<b></b><p>Mapa Google jest wyłączona zgodnie z Twoim wyborem cookies.</p><div class="mz-akcje"><a class="btn btn-cz" target="_blank" rel="noopener">Wyznacz trasę</a><button type="button">Pokaż mapę</button></div>';
      x.querySelector('b').textContent = adr;
      x.querySelector('a').href = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(adr);
      x.querySelector('button').addEventListener('click', function () { zapisz({ mapy: true }); });
      mapa.appendChild(x);
    }
  }
  function zapisz(v) { zg = { mapy: !!v.mapy, t: Date.now() }; try { localStorage.setItem(KL, JSON.stringify(zg)); } catch (e) {} if (ban) ban.hidden = true; mapy(); }
  function otworz() { if (!ban) return; ban.hidden = false; if (chMapy) chMapy.checked = !zg || zg.mapy; }
  if (ban) {
    if (!zg) ban.hidden = false;
    ban.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cookies]'); if (!b) return;
      var a = b.getAttribute('data-cookies');
      if (a === 'tak') zapisz({ mapy: true });
      else if (a === 'nie') zapisz({ mapy: false });
      else if (a === 'ustawienia') { kat.hidden = false; b.hidden = true; ban.querySelector('[data-cookies=zapisz]').hidden = false; }
      else if (a === 'zapisz') zapisz({ mapy: chMapy.checked });
    });
    d.querySelectorAll('[data-cookies-otworz]').forEach(function (x) { x.addEventListener('click', otworz); });
  }
  mapy();
})();
