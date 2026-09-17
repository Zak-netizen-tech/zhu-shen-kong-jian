/* ============================================================
   主神空间 —— 页面交互
   ① 顶部模块按钮：点一下切换显示（同一时间只显示一个模块）
   ② 导航滚动加深背景  ③ 图鉴页签切换  ④ 出现动画  ⑤ 回到顶部
   ============================================================ */
(function () {
  'use strict';

  var nav = document.getElementById('nav');
  var toTop = document.getElementById('toTop');

  /* ---------- ① 顶部模块按钮：切换显示 ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('#viewNav a[data-view]'));
  var views = Array.prototype.slice.call(document.querySelectorAll('.hero, .section'));

  function showView(id) {
    var target = document.getElementById(id);
    if (!target) return;
    views.forEach(function (v) { v.classList.toggle('view-off', v !== target); });
    navLinks.forEach(function (a) { a.classList.toggle('is-on', a.dataset.view === id); });
    // 刚显示的模块里，出现动画直接标记为已播放
    //（否则它们的 opacity 还是 0，切过去会看到一片空白）
    Array.prototype.forEach.call(target.querySelectorAll('.reveal'), function (el) {
      el.classList.add('is-in');
    });
    window.scrollTo(0, 0);
  }

  function viewFromHash() {
    var id = (location.hash || '').replace(/^#/, '') || 'top';
    return document.getElementById(id) ? id : 'top';
  }

  navLinks.forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var id = a.dataset.view;
      if (history.replaceState) history.replaceState(null, '', '#' + id);
      showView(id);
    });
  });

  /* 页面里其它 # 链接（首屏按钮、QQ 群按钮、页脚等）也走模块切换 */
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a || a.closest('#viewNav')) return;
    var id = a.getAttribute('href').slice(1);
    if (!id || !document.getElementById(id)) return;
    e.preventDefault();
    if (history.replaceState) history.replaceState(null, '', '#' + id);
    showView(id);
  });

  window.addEventListener('hashchange', function () { showView(viewFromHash()); });

  /* ---------- ② 导航：滚动后加深背景 ---------- */
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle('is-stuck', y > 40);
    if (toTop) toTop.classList.toggle('is-on', y > 400);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- ③ 图鉴页签（内容图鉴内部：体质 / 物品 / 技能 / 状态） ---------- */
  var tabs = document.querySelectorAll('#tabs .tab');
  var panels = document.querySelectorAll('#contents .panel');

  Array.prototype.forEach.call(tabs, function (tab) {
    tab.addEventListener('click', function () {
      var key = tab.dataset.tab;
      Array.prototype.forEach.call(tabs, function (t) { t.classList.toggle('is-on', t === tab); });
      Array.prototype.forEach.call(panels, function (p) {
        p.classList.toggle('is-on', p.dataset.panel === key);
      });
      var panel = document.querySelector('#contents .panel.is-on');
      if (panel) {
        Array.prototype.forEach.call(panel.querySelectorAll('.reveal'), function (el) {
          el.classList.remove('is-in');
          requestAnimationFrame(function () { el.classList.add('is-in'); });
        });
      }
    });
  });

  /* ---------- ④ 出现动画 ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('is-in'); });
  }

  /* ---------- ⑤ 初始化 ---------- */
  // 没写 hash = 显示首页；写了（比如别人发来的 .../#mods）= 直接打开那个模块
  showView(viewFromHash());
})();
