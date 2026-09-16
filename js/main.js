/* ============================================================
   主神空间 —— 页面交互
   ① 导航吸顶高亮  ② 图鉴页签切换  ③ 滚动出现动画  ④ 回到顶部
   ============================================================ */
(function () {
  'use strict';

  /* ---------- ① 导航：滚动后加深背景 ---------- */
  var nav = document.getElementById('nav');
  var toTop = document.getElementById('toTop');

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle('is-stuck', y > 40);
    if (toTop) toTop.classList.toggle('is-on', y > 400);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- ② 图鉴页签 ---------- */
  var tabs = document.querySelectorAll('#tabs .tab');
  var panels = document.querySelectorAll('#contents .panel');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var key = tab.dataset.tab;
      tabs.forEach(function (t) { t.classList.toggle('is-on', t === tab); });
      panels.forEach(function (p) {
        p.classList.toggle('is-on', p.dataset.panel === key);
      });
      // 切换后重新触发出现动画
      var panel = document.querySelector('#contents .panel.is-on');
      if (panel) {
        panel.querySelectorAll('.reveal').forEach(function (el) {
          el.classList.remove('is-in');
          requestAnimationFrame(function () { el.classList.add('is-in'); });
        });
      }
    });
  });

  /* ---------- ③ 滚动出现动画 ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- ④ 隐藏面板里的元素先标记可见 ---------- */
  document.querySelectorAll('#contents .panel .reveal').forEach(function (el) {
    if (!el.closest('.panel.is-on')) el.classList.add('is-in');
  });
})();
