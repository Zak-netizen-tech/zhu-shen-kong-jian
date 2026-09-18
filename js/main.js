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
      // 用 pushState：浏览器「后退」能回到上一个模块（hash 变化会触发 hashchange → 自动切回来）
      if (history.pushState) history.pushState(null, '', '#' + id);
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

  /* ---------- ⑥ 图鉴 / 模组详情弹层 ---------- */
  // 31 个内容的详情数据。文案取自模组自带说明文档（09-体质 / 10-物品 / 11-技能 / 12-状态），
  // 数值与机制逐条核对过，没有编造。
  var DETAILS = {
    /* ----- 体质 8 ----- */
    rinnegan: {
      name: '六道轮回眼', q: 'q-purple', qtext: '紫', img: 'img/rinnegan.png',
      mech: [
        '传说中六道仙人的眼睛。攻击命中即自动召唤天降双陨石，平时全属性大幅提升。',
        '陨石伤害 = 1 万 + 自身攻击 × 100%，第二颗 3 倍（伤害 / 范围 / 建模 / 特效全 ×3，爆炸半径 60 格），冷却 5 秒（冷却 / 间隔 / 下坠速度随世界倍速加快）。',
        '拥有者与其所在王国免疫自己的陨石；可无视地形（翻山 / 免疫岩浆火焰 / 泅渡水面，仍会被正常攻击）。',
        '有了它（或「永恒万花筒写轮眼」）之后，「三勾玉轮回眼」再也拿不到 —— 修改器手动授予也会被拒绝并弹提示；它与永恒万花筒可以共存。'
      ],
      skills: [
        ['天降双陨石', '攻击命中自动召唤，第一颗 = 1 万 + 攻击 × 100%，第二颗再 ×3（半径 60 格），冷却 5 秒'],
        ['全属性增幅', '生命 +50 万/+100%、伤害 +5 万/+100%、防御值 +5 万、免伤与破免伤各 +100%、寿命 +1 万年、移速 +100/+50%、攻速 +100/+50%、攻击距离 +100'],
        ['极速回血', '每秒回血 = 5000 + 最大生命的 20%'],
        ['无视地形', '翻山 / 免疫岩浆火焰 / 泅渡水面（不等于免疫攻击）']
      ],
      tune: '冷却秒数、陨石伤害与范围、全部属性数值都在「自定义内容数据 → 六道轮回眼」里改，改完立刻生效。'
    },
    mangekyou: {
      name: '永恒万花筒写轮眼', q: 'q-blue', qtext: '蓝', img: 'img/mangekyou.png',
      mech: [
        '宇智波一族的眼睛。攻击命中 或 自身被攻击时，自动开启「须佐能乎」（技能页那个独立内容）。',
        '自动开启的须佐持续 10 秒、冷却 5 游戏年；冷却从开启那一刻算起，期间不再自动开启、战斗中也不续期。',
        '有了它之后「三勾玉轮回眼」就拿不到（手动也失效）；它与「六道轮回眼」可以共存。'
      ],
      skills: [
        ['自动须佐能乎', '攻击命中 / 自身被攻击 → 获得 10 秒须佐：伤害与生命 +100%、防御值 +1000、免伤与破免伤 +20%、攻击范围 +20、可跨越地形'],
        ['属性增幅', '生命 +1 万且 +20%、伤害 +1000 且 +20%、移速 +50、攻速 +50、暴击率 +100%']
      ],
      tune: '须佐的持续秒数与冷却年数见「自定义内容数据 → 须佐能乎 / 永恒万花筒」（可调项 `susanoo.sec` 与 `susanoo.cd_years`）。'
    },
    sanmokudama: {
      name: '三勾玉轮回眼', q: 'q-green', qtext: '绿', img: 'img/sanmokudama.png',
      mech: [
        '宇智波一族的血脉。纯属性型内容，没有主动技能。',
        '只要身上有「六道轮回眼」或「永恒万花筒写轮眼」，它就永远无法获得（修改器手动添加也直接失效并弹提示）。',
        '反过来先有三勾玉、之后才拿六道 / 万花筒时，三勾玉会被自动顶掉（互斥组只留最高档）。'
      ],
      skills: [
        ['属性增幅', '生命 +500 且 +10%、伤害 +100 且 +10%、移速 +20、攻速 +10'],
        ['必定暴击', '暴击率 +100% —— 原版暴击率是 0~1 的概率，+100% 即必定暴击，暴击伤害仍是原版默认的 2 倍']
      ],
      tune: '每一项都能在「自定义内容数据 → 三勾玉轮回眼」里改。'
    },
    shiti: {
      name: '噬体', q: 'q-red', qtext: '红', img: 'img/shiti.png',
      mech: [
        '击杀成长型内容：起步只给基础属性，每次击杀都变强，累计击杀还会逐档解锁新能力。',
        '每次击杀：血 / 攻 +10 且 +1%、速 / 攻速 +1 且 +1%、攻距 +1%、回血 +10 且 +1%、防御值 +1，并掠夺目标 10% 总属性、吞噬其能力（负面内容除外）。',
        '成长属性统一封顶 21 亿，超过上限保持封顶、不再增长，防止数值溢出成负数。'
      ],
      skills: [
        ['基础属性', '血量 / 攻击 +1000 且 +10%、移速 / 攻速 +10 且 +10%、攻击距离 +10%、每秒回血 +10（随世界倍速）'],
        ['击杀掠夺', '每次击杀叠加上面那一串，并掠夺目标 10% 总属性、吞噬其能力'],
        ['攻击连锁', '击杀 100 人解锁：一次连锁 10 名敌人，每多 100 人再 +10 名（只连锁与攻击目标同阵营的）'],
        ['免伤 / 破免伤', '击杀 10 人后各 +1%，无上限'],
        ['无视地形', '击杀 100 人解锁：翻山 / 渡水 / 过岩浆'],
        ['免疫负面', '击杀 500 人解锁：免疫全部负面特质（残疾 / 独眼 / 肥胖等）并自动清除已有的']
      ],
      tune: '基础数值与各个解锁档位都在「自定义内容数据 → 噬体」里改。'
    },
    banwen: {
      name: '斑纹', q: 'q-blue', qtext: '蓝', img: 'img/banwen.png',
      mech: [
        '燃烧寿命换取全方位的增幅，属性很猛，但有寿命代价。',
        '寿命 -20% 只压一次，不会随属性重建反复叠加。',
        '身上有「缘一的体质」时实时免疫这个副作用（缘一被删掉后副作用立刻回来）。',
        '轮回或被「死亡变强系统」原地复活过一次之后，副作用自动解除 —— 解除标记跟着死亡快照走，所以轮回后的新身体同样有效，同一具身体再死也不会重新扣。'
      ],
      skills: [
        ['属性增幅', '生命 +2000 且 +200%、伤害 +2000 且 +200%、移速 +50 且 +200%、攻速 +50 且 +200%'],
        ['代价', '寿命 -20%（只压一次）'],
        ['免疫与解除', '有「缘一的体质」时免疫；轮回或重生一次后永久解除']
      ],
      tune: '数值见「自定义内容数据 → 斑纹」。'
    },
    yuanyi: {
      name: '缘一的体质', q: 'q-purple', qtext: '紫', img: 'img/yuanyi.png',
      mech: [
        '天生克制某种生物的高强度体质，纯属性型，同时自动附送三件内容。',
        '获得本内容时自动获得「斑纹」「赫刀」「通透世界」（原本就有的不重复给）。',
        '删除时只把它替你补上的那几项摘掉，你自己先有的那几项不动；持有期间完全免疫「斑纹」的寿命副作用（实时判定）。'
      ],
      skills: [
        ['属性增幅', '破免伤 +100%、伤害 +10 万且 +500%、生命 +1 万且 +100%、免伤 +50%、自身闪避率 +80%、移速 +2000、攻速 +2000、攻击范围 +500'],
        ['附带三件内容', '自动获得「斑纹」「赫刀」「通透世界」，并免疫斑纹的寿命副作用'],
        ['闪避口径', '自身闪避率只是加数：实际闪避率 = 移速项（自身移速 ÷ 对方移速 × 100 − 100）+ 自身闪避率，封顶 0~100%'],
        ['破免伤拉满', '100% 起步意味着对面的免伤基本被吃穿，配合巨额伤害就是「见谁秒谁」']
      ],
      tune: '数值见「自定义内容数据 → 缘一的体质」。'
    },
    muzan: {
      name: '无惨的体质', q: 'q-purple', qtext: '紫', img: 'img/muzan.png',
      mech: [
        '以寿命和每秒回血为核心的体质，几乎打不死。',
        '每秒回复「最大生命值的 10%」，随世界倍速加快 —— 世界倍速越高回得越快。',
        '唯一的克星是「赫刀之伤」：被它标记期间回不了血（见状态页）。'
      ],
      skills: [
        ['属性增幅', '生命 +10 万且 +100%、伤害 +5000 且 +50%、寿命 +9 亿年、免伤 +50%、破免伤 +20%、移速 +50、攻速 +100 且 +50%、攻击范围 +50'],
        ['百分比回血', '每秒回复最大生命值的 10%（随世界倍速加快）'],
        ['克星', '被「赫刀之伤」标记期间无法回血']
      ],
      tune: '数值见「自定义内容数据 → 无惨的体质」。'
    },
    sixeyes: {
      name: '六眼', q: 'q-red', qtext: '红', img: 'img/sixeyes.png',
      mech: [
        '「天上地下，为我独尊」：属性拉满，外加攻击命中时升起一个圆形领域。',
        '领域冷却 1 游戏年（随世界倍速）。以自身为中心升起直径 50 格的地形框架（半径 25、3 格厚）：内外两圈是「山」，中间那一圈再叠一层「光之墙」。',
        '覆盖范围内的建筑 / 植物 / 道路等一切内容一律摧毁；圈内除持有者自己以外的所有生物 AI 被直接停掉 —— 不动、不决策、不打人、不干活，不给任何特质、也不挂任何状态（生物面板里不会多出东西，也没有冰晶 / 图标）。',
        '出圈或领域到期立刻恢复行动；默认 10 秒后地形完全还原成原样（只还原「仍然是我们设的山」的格子，被别人改过的格子不动）。',
        '持续秒数大于冷却年数时会叠着放好几个领域，此时地形会一直保留到最后一个领域到期。'
      ],
      skills: [
        ['属性增幅', '生命 +60 万且 +60%、伤害 +6 万且 +60%、防御值 +60 万、免伤 +600%（无上限＝完全免伤）、闪避 +600%（封顶＝必定闪避）、破免伤 +600%、移速 +600、攻速 +600、攻击范围 +60'],
        ['六眼领域', '攻击命中时升起直径 50 格圆环（山 ×2 圈 + 光之墙），推平范围内一切建筑 / 植物 / 道路'],
        ['停 AI', '圈内生物（自己除外）AI 被停掉，默认 10 秒后才恢复'],
        ['地形还原', '出圈或到期立刻恢复行动，地形默认 10 秒后完全还原']
      ],
      tune: '直径 / 厚度 / 持续秒数 / 冷却年数 / 全部属性数值都能在「自定义内容数据 → 六眼」里改。'
    },

    /* ----- 物品 13 ----- */
    book: {
      name: '真理之书', q: 'q-gold', qtext: '金', img: 'img/book.png',
      mech: [
        '智力 +1000 且 +1000%，丢书立即还原。',
        '普通攻击命中「智力低于自己」的目标时不再按普通伤害结算，改为碾压。',
        '碾压这一记无视对方的免伤与防御值，并且不可被闪避（它的结算排在闪避判定之前，碾压时直接吞掉本次攻击）。',
        '目标没被打死（免死 / 保命 / 天地之力），或死了之后又复活（登仙 / 死亡变强 / 轮回空间），会带着「疯狂」和 0 智力继续存在或复活。',
        '铁律：观察者不受此效果影响；没触发碾压时的普通攻击仍可被闪避。'
      ],
      skills: [
        ['智力碾压', '先挂「疯狂」（智力锁 0），再打一记 21 亿物理伤害，无视免伤与防御值'],
        ['击杀归属', '击杀照常走原版击杀链，击杀数 / 经验 / 等级都算给持书者'],
        ['不可闪避', '碾压这一记不可被闪避；未触发碾压时的普通攻击可被闪避'],
        ['战斗连锁', '被打的人会连带被挂上「疯狂」——就算没死，复活后还是疯狂 + 0 智力']
      ],
      tune: '数值见「自定义内容数据 → 真理之书」。'
    },
    deathnote: {
      name: '死亡笔记', q: 'q-purple', qtext: '紫', img: 'img/death-note.png',
      mech: [
        '攻击目标时不结算伤害，改为给目标打上「死亡标记」状态（每 10 秒 21 亿物理伤害，直到该生物死亡）。',
        '目标已有标记时刷新赋予者与下一跳计时。',
        '每过 1 游戏年进行一次年度点名：对「敌方阵营击杀数最高的 5 位」造成 9 亿物理伤害；没有敌方阵营时改点「击杀数最高的 5 位中立生物」。',
        '绝不伤害友军（同阵营）与观察者。'
      ],
      skills: [
        ['死亡标记', '命中改挂标记：每 10 秒 21 亿物理伤害（用持有者破免伤抵消目标免伤），到死为止'],
        ['年度点名', '每 1 游戏年点名敌方击杀数最高的 5 位，每人 9 亿物理伤害'],
        ['伤害结算', '先过对方免伤（按持有者破免伤做减法）→ 再减防御值 → 溢出伤害击穿「天地之力」'],
        ['闪避', '命中那一下被闪避则挂不上；已挂上的每 10 秒一跳也能被闪避掷掉']
      ],
      tune: '数值见「自定义内容数据 → 死亡笔记」。'
    },
    gauntlet: {
      name: '无限手套', q: 'q-purple', qtext: '紫', img: 'img/gauntlet.png',
      mech: [
        '常驻加成极高（9 亿级），同时自带一个低血爆发。',
        '自身血量 ≤ 1/3，或「天地之力」≤ 上限的 1/3 时触发爆发：立刻自损 1/4 血量，并对全图「除自己与友军外」随机一半单位造成 20 亿物理伤害。',
        '爆发有 3 秒冷却（触发后要回到阈值以上才会再次累积）；持有者被击杀的瞬间也必定放出一次（独立于冷却，只放一次）。',
        '爆发绝不打友军，也不作用于观察者；伤害走统一结算（免伤 / 防御值 / 天地之力）。'
      ],
      skills: [
        ['常驻加成', '物理攻击 +9 亿、血量 +9 亿、防御值 +900 万、免伤 +50%、破免伤 +50%、移速 +300 且 +100%、攻速 +300 且 +100%、攻击范围 +300 且 +100%（三项各自独立可调）'],
        ['低血爆发', '血量或天地之力 ≤ 1/3 → 自损 1/4 血，对全图一半敌人（除自己与友军）造成 20 亿物理伤害'],
        ['死亡爆发', '被击杀的瞬间必定再放一次（只放一次）'],
        ['冷却', '常规爆发 3 秒冷却，避免同一瞬间反复触发']
      ],
      tune: '数值见「自定义内容数据 → 无限手套」。'
    },
    deathpower: {
      name: '死亡变强系统', q: 'q-gold', qtext: '金', img: 'img/death-power.png',
      mech: [
        '受到致命伤时原地复活 —— 不进入死亡结算，所以什么都不会丢。',
        '修为（含其它模组写入的数据）、全部特质、氏族 / 家族、性别、阵营关系、收藏星星等一切状态与死前一模一样。',
        '复活后年龄重置为 18 岁，同时回满血、去掉身上所有负面特质，有白色闪光提示。',
        '每复活一次永久叠加一层成长，层数无上限；双击移除内容后成长层数一并清空，属性回落到基础值。'
      ],
      skills: [
        ['原地复活', '致命伤不掉，年龄回 18 岁、回满血、清除全部负面特质'],
        ['永久成长', '每复活一次：伤害 +10 且 +1%、血量 +100 且 +1%、防御值 +10 且 +1%、移速 / 攻速 / 攻击范围 +10 且 +1%、寿命 +10 年'],
        ['抹不掉', '本模组的致死手段（死亡标记 / 年度点名 / 手套爆发 / 永恒之火）与原版橡皮擦打到它只等于一次普通击杀，不会抹除']
      ],
      tune: '数值见「自定义内容数据 → 死亡变强系统」。'
    },
    hunhuan10: {
      name: '十年魂环', q: 'q-white', qtext: '白', img: 'img/hunhuan-10.png',
      mech: [
        '「猎杀十年魂兽获得的魂环」，七枚魂环里最基础的一枚，纯属性强化、没有主动技能。',
        '加成在属性重建后叠加（生命按比例映射 —— 满血仍满血、残血保持比例），所以在人物面板里能直接看到这些数值。',
        '七枚魂环是同一个互斥组：十年 < 百年 < 千年 < 万年 < 十万年 < 百万年 < 千万年，同组只留最高档；被更高档顶掉的那件会按售价退还轮回币。',
        '多枚同时持有会全部累加；删掉某一枚，它那一份立即还原。'
      ],
      skills: [
        ['五项基础加成', '生命 / 伤害 / 防御值 / 移速 / 攻速 各 +10'],
        ['默认货架价', '10 轮回币（第一次打开商店时已铺好，可改价、可删）']
      ],
      tune: '七枚魂环每一项都能单独改（同一份数值）：扎克修改器 →「自定义内容数据」，或 轮回商店 → 该商品 →「自定义数值」。'
    },
    hunhuan100: {
      name: '百年魂环', q: 'q-yellow', qtext: '黄', img: 'img/hunhuan-100.png',
      mech: [
        '「猎杀百年魂兽获得的魂环」，纯属性强化、没有主动技能。',
        '加成写入原版属性表（生命按比例映射，满血仍满血、残血保持比例）。',
        '魂环互斥组只留最高档；多枚同时持有会全部累加，删掉某一枚立即还原。'
      ],
      skills: [
        ['五项基础加成', '生命 / 伤害 / 防御值 / 移速 / 攻速 各 +100'],
        ['默认货架价', '100 轮回币']
      ],
      tune: '数值见「自定义内容数据 → 百年魂环」或 轮回商店 → 该商品 →「自定义数值」。'
    },
    hunhuan1000: {
      name: '千年魂环', q: 'q-green', qtext: '绿', img: 'img/hunhuan-1000.png',
      mech: [
        '「猎杀千年魂兽获得的魂环」，前三年（十 / 百 / 千年）只给五项基础属性，万年起才额外给免伤 / 破免伤。',
        '加成写入原版属性表（生命按比例映射，满血仍满血、残血保持比例）。',
        '魂环互斥组只留最高档；多枚同时持有会全部累加，删掉某一枚立即还原。'
      ],
      skills: [
        ['五项基础加成', '生命 / 伤害 / 防御值 / 移速 / 攻速 各 +1000'],
        ['默认货架价', '1,000 轮回币']
      ],
      tune: '数值见「自定义内容数据 → 千年魂环」或 轮回商店 → 该商品 →「自定义数值」。'
    },
    hunhuan10000: {
      name: '万年魂环', q: 'q-blue', qtext: '蓝', img: 'img/hunhuan-10000.png',
      mech: [
        '「猎杀万年魂兽获得的魂环」—— 从这一档开始，除五项基础属性外还额外提供免伤 / 破免伤。',
        '加成写入原版属性表（生命按比例映射，满血仍满血、残血保持比例）。',
        '魂环互斥组只留最高档；多枚同时持有会全部累加，删掉某一枚立即还原。'
      ],
      skills: [
        ['五项基础加成', '生命 / 伤害 / 防御值 / 移速 / 攻速 各 +10000'],
        ['免伤 / 破免伤', '各 +1%'],
        ['默认货架价', '10,000 轮回币；品级默认蓝']
      ],
      tune: '数值见「自定义内容数据 → 万年魂环」或 轮回商店 → 该商品 →「自定义数值」。'
    },
    hunhuan100000: {
      name: '十万年魂环', q: 'q-purple', qtext: '紫', img: 'img/hunhuan-100000.png',
      mech: [
        '「猎杀十万年魂兽获得的魂环」，纯属性强化、没有主动技能。',
        '加成写入原版属性表（生命按比例映射，满血仍满血、残血保持比例）。',
        '魂环互斥组只留最高档；多枚同时持有会全部累加，删掉某一枚立即还原。'
      ],
      skills: [
        ['五项基础加成', '生命 / 伤害 / 防御值 / 移速 / 攻速 各 +100000'],
        ['免伤 / 破免伤', '各 +10%'],
        ['默认货架价', '100,000 轮回币；品级默认紫']
      ],
      tune: '数值见「自定义内容数据 → 十万年魂环」或 轮回商店 → 该商品 →「自定义数值」。'
    },
    hunhuan1000000: {
      name: '百万年魂环', q: 'q-red', qtext: '红', img: 'img/hunhuan-1000000.png',
      mech: [
        '「猎杀百万年魂兽获得的魂环」，纯属性强化、没有主动技能。',
        '加成写入原版属性表（生命按比例映射，满血仍满血、残血保持比例）。',
        '魂环互斥组只留最高档；多枚同时持有会全部累加，删掉某一枚立即还原。'
      ],
      skills: [
        ['五项基础加成', '生命 / 伤害 / 防御值 / 移速 / 攻速 各 +1000000'],
        ['免伤 / 破免伤', '各 +100%'],
        ['默认货架价', '1,000,000 轮回币；品级默认红']
      ],
      tune: '数值见「自定义内容数据 → 百万年魂环」或 轮回商店 → 该商品 →「自定义数值」。'
    },
    hunhuan10000000: {
      name: '千万年魂环', q: 'q-gold', qtext: '金', img: 'img/hunhuan-10000000.png',
      mech: [
        '「猎杀千万年魂兽获得的魂环」，七枚魂环里的最高档，纯属性强化、没有主动技能。',
        '加成写入原版属性表（生命按比例映射，满血仍满血、残血保持比例）。',
        '魂环互斥组里它是最高档 —— 身上有它时不会再买低档魂环；反过来被它顶掉的低档会按售价退还轮回币。'
      ],
      skills: [
        ['五项基础加成', '生命 / 伤害 / 防御值 / 移速 / 攻速 各 +10000000'],
        ['免伤 / 破免伤', '各 +1000%'],
        ['默认货架价', '10,000,000 轮回币（价格上限）；品级默认金']
      ],
      tune: '数值见「自定义内容数据 → 千万年魂环」或 轮回商店 → 该商品 →「自定义数值」。'
    },
    hedao: {
      name: '赫刀', q: 'q-yellow', qtext: '黄', img: 'img/hedao.png',
      mech: [
        '伤害 +1000，攻击命中时给目标附加「赫刀之伤」状态，持续 10 秒、每次命中刷新计时。',
        '中招者每秒掉 1000 点物理伤害，并且期间无法回复任何血量 —— 回血 / 吸血 / 吃药 / 每秒回血全部无效。',
        '对「无惨的体质」这类靠回血赖活的单位是唯一克星。',
        '不区分敌我：对友军、观察者同样会挂上伤口，只看「有没有被打到」。'
      ],
      skills: [
        ['属性增幅', '伤害 +1000'],
        ['赫刀之伤', '命中即挂 10 秒伤口：每秒 1000 点物理伤害 + 期间无法回血，每次命中刷新计时']
      ],
      tune: '数值见「自定义内容数据 → 赫刀 / 赫刀之伤」。'
    },
    totem: {
      name: '不死图腾', q: 'q-yellow', qtext: '黄', img: 'img/totem.png',
      mech: [
        '受到致命伤时原地满血复活一次 —— 不进入死亡结算，所以修为 / 特质 / 氏族 / 阵营关系等一切状态与死前一模一样。',
        '复活同时清除身上全部负面特质（残疾 / 独眼 / 肥胖 / 瘟疫 / 感染…）以及本模组的负面状态（赫刀之伤 / 永恒之火 / 死亡标记 / 停止 / 无法攻击）；「疯狂」不清，它按设计只能由修改器删除。',
        '只能用一次：触发复活后图腾立刻消失，不会变成无限复活。',
        '与「死亡变强系统」同时持有时优先走死亡变强系统，图腾留着不消耗；「抹除存在」是绝对抹除（有自己的硬删除兜底），图腾挡不住。'
      ],
      skills: [
        ['满血复活一次', '致命伤不掉、回满血，修为（含其它模组数据）/ 特质 / 氏族 / 性别 / 阵营关系 / 收藏全保留'],
        ['清除负面', '清掉全部负面特质与本模组的负面状态（「疯狂」除外）'],
        ['兜底改写', '永恒之火抹杀、死亡笔记 / 手套的致死点名、龙族强制致死这类绕过死亡结算的抹除兜底，都会改成「普通致命一击」由图腾救下（挡下即消耗图腾）'],
        ['次数', '只有一次，触发即消失']
      ],
      tune: '复活效果本身没有可调数值；其它内容的数值见「自定义内容数据」。'
    },

    /* ----- 技能 4 ----- */
    offering: {
      name: '六道祭品', q: 'q-purple', qtext: '紫', img: 'img/six-offering.png',
      mech: [
        '无其他常驻属性加成 —— 全部强度都来自「祭品期间」。',
        '杀满 6 人触发祭品效果：获得这 6 人（血 / 攻 / 移速 / 攻速）总和的 6 倍增幅。',
        '之后每击杀 1 人，该人的全部属性同样按 6 倍并入累计（不限数量：杀 100 人就是这 100 人全属性的 6 倍），同时持续时间 +1 游戏年。',
        '时间全部结束则移除全部增益。'
      ],
      skills: [
        ['六人祭品', '杀满 6 人 → 这 6 人（血 / 攻 / 移速 / 攻速）总和的 6 倍并入自身'],
        ['持续加码', '之后每击杀 1 人，其全属性同样 ×6 计入，持续 +1 游戏年'],
        ['祭品免伤', '期间额外 60% 免伤（无上限，可被「破免伤」抵消）'],
        ['免疫', '免疫原版全部负面特质（残疾 / 独眼 / 肥胖 / 瘟疫 / 感染等），以及燃烧 / 冻结 / 中毒 / 腐蚀等一切负面状态'],
        ['飞行', '可翻越山体 / 石壁等一切地形（仍在地面，会被地面单位正常打到）'],
        ['外观', '祭品期间半透明泛红，脚下有红色祭祀阵辉']
      ],
      tune: '数值见「自定义内容数据 → 六道祭品」。'
    },
    susanoo: {
      name: '须佐能乎', q: 'q-blue', qtext: '蓝', img: 'img/susanoo-icon.png',
      mech: [
        '「以特质为准」：只要身上有这个特质，单位身上就盖一张比人物略大（1.5 倍）的须佐贴图（模组自绘），不占用任何「状态」—— 状态栏里不会冒出须佐状态，也没有会回跳的倒计时。',
        '两个来源：① 修改器「技能」页直接授予（永久，直到双击删除）；② 持有「永恒万花筒写轮眼」的单位 攻击命中 或 自身被攻击 时自动获得 10 秒。',
        '自动获得的那份 10 秒内不会续期（被打多少次都是到点就收），10 秒后特质与特效一起消失，然后进入 5 游戏年冷却 —— 冷却从获得那一刻算起。',
        '这里的「秒」是世界时间秒（1 游戏年 = 60 秒）：世界倍速越快它过得越快（正常速度约 10 秒，5 倍速约 2 秒）。',
        '须佐不跟着轮回走：轮回者死时若正好开着须佐（10 秒窗口内），它不会被写进死亡记录、复活时也不会被穿上。'
      ],
      skills: [
        ['属性增幅', '攻击 +100%、生命值 +100%、防御值 +1000、免伤 +20%、破免伤 +20%、攻击距离 +20'],
        ['跨越地形', '翻越山体 / 石壁、渡水不溺水、免疫岩浆火焰（不等于是飞行，仍会被地面单位打到）'],
        ['两种来源', '修改器直接授予 = 永久；万花筒自动开启 = 10 秒、5 游戏年冷却'],
        ['外观', '身上盖一张 1.5 倍大的自绘须佐贴图；悬停特质图标可看全部效果']
      ],
      tune: '可调项 `susanoo.sec`（持续秒数）与 `susanoo.cd_years`（冷却年数）在「自定义内容数据 → 须佐能乎 / 永恒万花筒」里改。'
    },
    infinitedodge: {
      name: '无限闪避', q: 'q-green', qtext: '绿', img: 'img/infinite-dodge.png',
      mech: [
        '获得时自动获得原版「格挡」「闪避」两个特质（原本就有的不动）。',
        '拥有期间这两个特质的冷却变为 0，可以无限使用；冲刺 / 后撤步等其它动作不受影响。',
        '删除时只摘掉本内容补上的那两个特质，冷却恢复原版。'
      ],
      skills: [
        ['无限格挡 / 闪避', '原版「格挡」「闪避」冷却 = 0，可无限使用'],
        ['自动补齐', '获得时自动补上这两个原版特质；删除时只收回它补上的那份']
      ],
      tune: '它不含数值项 —— 只有「冷却归零」这一个开关式效果。'
    },
    toushi: {
      name: '通透世界', q: 'q-blue', qtext: '蓝', img: 'img/toushi.png',
      mech: [
        '纯属性型内容：看清人体内部结构，命中弱点更容易破防。',
        '加成口径与其它内容一致 ——「+固定值」先加、再乘「+百分比%」，统一按 21 亿上限封顶。'
      ],
      skills: [
        ['属性增幅', '破免伤 +50%、伤害 +5000 且 +50%、移速 +50、攻速 +50、攻击范围 +80']
      ],
      tune: '全部数值可在「自定义内容数据 → 通透世界」里改。'
    },

    /* ----- 状态 6 ----- */
    madness: {
      name: '疯狂', q: 'q-red', qtext: '红', img: 'img/madness.png',
      mech: [
        '被真理冲刷的下场：智力锁定为 0。',
        '锁定原版发狂（见谁打谁、身上发红），并被强制加入「疯癫」王国 —— 不能建国、不能被选为国王，本是国王会立即退位（模组周期性维持）。',
        '获得方式：修改器「状态」页授予，或被持「真理之书」者攻击（智力被碾压时冲垮理智）。',
        '观察者不受疯狂影响；复活与读档后依旧保留。'
      ],
      skills: [
        ['智力锁 0', '智力被永久锁定为 0'],
        ['强制发狂', '见谁打谁、身上发红，无法建国、不能被选为国王，本是国王立即退位'],
        ['解除', '只能由修改器「状态」页双击移除，之后还原智力并退出疯癫']
      ],
      tune: '它不是数值型状态，没有可调数字。'
    },
    eternalflame: {
      name: '永恒之火', q: 'q-gold', qtext: '金', img: 'img/burn.png',
      mech: [
        '超级真实伤害：每秒烧 40% 生命上限，无视免伤 / 防御 / 护盾等任何防护机制，足以致死。',
        '期间无法恢复生命；每跳同时燃烧目标上限 40% 的「天地之力」（鬼谷 · 武道）与「蓝条」（西幻 · 魔法能量 / 魔法盾）等特殊资源，直至烧空，燃烧期间天地之力被压为 0。',
        '累计烧尽一整管血即【抹杀】：清除当前世界实体，但保留鬼谷时间长河 / 轮回空间 / 英灵殿等其它模组的跨存档记录。',
        '带「死亡变强系统」的目标不抹除，只按普通致命伤处理（被它自己的复活机制拦下）—— 这种人只能杀死、抹不掉。',
        '「闪避率」对永恒之火无效；只能由修改器双击移除，不会被「到期 / 清除副作用」解除。'
      ],
      skills: [
        ['每秒 40% 最大生命', '无视一切护持与免伤，且期间无法恢复生命'],
        ['烧空特殊资源', '每跳同时烧上限 40% 的天地之力 / 蓝条，燃烧期间天地之力被压为 0'],
        ['烧尽即抹杀', '烧完一整管血直接清除当前世界实体（跨存档记录保留）'],
        ['不可闪避', '闪避率对永恒之火无效']
      ],
      tune: '数值见「自定义内容数据 → 永恒之火」。'
    },
    noattack: {
      name: '无法攻击', q: 'q-gold', qtext: '金', img: 'img/no-attack.png',
      mech: [
        '从「源头」掐断目标的攻击与施法能力，不只是事后拦伤害。',
        '① 行动管线封锁：普攻、武器 / 特质攻击回调、本体攻击结算、弹道推进全部跳过；弹道「照常生成、生成后立刻标记回收」—— 同样打不出去，但不会崩。',
        '② 鬼谷源头闸门：法则总开关（16 条法则的攻击 / 被动 / 保命都走它）、绝技触发、灵技触发一律跳过。',
        '③ 伤害中心补刀：仙羽 / 领域 / 道域 / 灵技 / 绝技 / 仙气装备等所有直写血量的中心函数，只要发起者是缴械者就整段跳过。',
        '结果：放不出任何技能、法则与弹道，也造不成任何伤害；仍可正常移动与日常 AI。法则 / 技能特质全部保留 —— 解除缴械立即恢复，不掉境界、不坏存档。'
      ],
      skills: [
        ['行动管线封锁', '普攻 / 攻击回调 / 攻击结算 / 弹道推进全部跳过'],
        ['源头闸门', '鬼谷法则总开关、绝技触发、灵技触发一律跳过'],
        ['伤害中心补刀', '所有直写血量的中心函数整段跳过，造成不了任何伤害'],
        ['生效范围', '原版与鬼谷 / 西幻等一切模组生物均生效（含登仙等高等存在）']
      ],
      tune: '它不是数值型状态，没有可调数字；只能由修改器双击移除。'
    },
    stop: {
      name: '停止', q: 'q-gold', qtext: '金', img: 'img/stop.png',
      mech: [
        '真 · 时间停止：完全停止 AI 与移动，并封锁一切攻击与施法。',
        '没有冰晶、没有冰冻特效 —— 那层冰是原版状态贴图画的，这里已把 texture 清空（游戏不会再回填 sprite_list）。',
        '取而代之的是自绘的「停止」图标：悬浮在单位头顶，同一个图标也用于单位面板的状态栏与内容列表。',
        '该状态不在鬼谷「元婴及以上状态免疫」清单里，登仙等高境界照样挂得上，也不会被「清除副作用」清掉。',
        '宿主每 0.25 秒兜底续停，只有手动移除该内容才会解除。'
      ],
      skills: [
        ['完全停止', '无法移动 / 攻击 / 行动；AI 决策、行为树、饥饿衰减、特质周期特效一并跳过'],
        ['叠加缴械', '叠加「无法攻击」的全部封锁，并清空路径、打断行为、清空攻击目标'],
        ['烈焰无效', '烈焰 / 灼烧命中不会解除，任何「清除副作用」机制也无法解除'],
        ['保底', '极端情况仍挂不上时，以属性压制（伤害 / 攻距 / 攻速 = 0 + 打断行为 + 白色提示）保底']
      ],
      tune: '状态 id 仍是 `zack_frozen`（改名不动 id，旧存档不丢）；它不是数值型状态。'
    },
    deathmark: {
      name: '死亡标记', q: 'q-purple', qtext: '紫', img: 'img/death-mark.png',
      mech: [
        '每 10 秒受到 21 亿物理伤害（用赋予者的破免伤抵消目标的免伤），直到该生物死亡。',
        '没有赋予者（例如修改器直接授予）时不吃破免伤加成。',
        '伤害与其它内容一样：先免伤 → 再减防御值 → 溢出伤害击穿「天地之力」。',
        '被持「死亡笔记」者攻击命中时自动施加；已被标记的目标再次被命中会刷新赋予者与下一跳计时。'
      ],
      skills: [
        ['每 10 秒 21 亿', '用赋予者的破免伤抵消目标免伤，直到目标死亡'],
        ['绝不施加于', '友军（同阵营）与观察者'],
        ['闪避', '命中那一下被闪避则挂不上；已挂上的每 10 秒一跳也能被闪避掷掉（按「赋予者 vs 目标」的移速算移速项）'],
        ['解除', '修改器「状态」页双击，标记与计时一并清除']
      ],
      tune: '数值见「自定义内容数据 → 死亡标记 / 死亡笔记」。'
    },
    hedaowound: {
      name: '赫刀之伤', q: 'q-purple', qtext: '紫', img: 'img/hedao-wound.png',
      mech: [
        '被赫刀撕裂的伤口，血流不止：每秒受到 1000 点物理伤害。',
        '期间无法回复任何血量 —— 回血 / 吸血 / 吃药 / 每秒回血全部被掐掉（和「永恒之火」共用同一段回血拦截）。',
        '由「赫刀」命中自动附加，持续 10 秒、每次命中刷新计时；修改器直接授予的伤口没有到期时间，永久保留。',
        '跳伤会记住施加者：移速项按「施加者 vs 目标」算，施加者已死 / 离场则移速项按 0；修改器直接授予的没有施加者 → 视为「玩家施加」，按 1000 移速算。'
      ],
      skills: [
        ['每秒 1000 物理伤害', '走统一物理伤害口径：先免伤 → 再减防御值 → 溢出部分击穿「天地之力」'],
        ['禁疗', '期间回血 / 吸血 / 吃药 / 每秒回血全部无效'],
        ['闪避', '对这条每秒伤害有效；但「赫刀」命中那一下若被闪避，连伤口都不会被挂上'],
        ['免疫', '观察者不受影响']
      ],
      tune: '数值见「自定义内容数据 → 赫刀 / 赫刀之伤」。'
    }
  };

  // 各大模组「轮回商店能改到它什么」。键名 / 数值 / 范围逐个对照过该模组自己的配置文件与源码。
  var MODDETAILS = {
    doupo: {
      name: '斗破人生 v0.32', img: 'img/mods/doupo.png',
      sub: '配置来源 mods_config\\DOUPO_LIFE.config（12 组）；属性键名取自源码 Code\\DoupoLifeDefines.cs',
      what: [
        ['CultiRule.CultiRateMult', '修炼速率倍率', '本机当前 3.0（它自己的说明写「1.0 为默认」，范围 0.2~3）。所有修士获取修为点的速度倍率，调高 → 斗者到斗圣的耗时等比缩短'],
        ['CultiRule.CultiNeedMult', '境界需求倍率', '范围 0.2~10。每个大境界所需的修为总量倍率，调小 = 修炼更快、调大 = 更慢'],
        ['CultiRule.CultiBreakMult', '突破概率倍率', '本机当前 3.0（说明写「1.0 为默认」，范围 0.2~3）。自然突破与顿悟的触发概率倍率，天赋越高基础概率越高'],
        ['SoulRule.SoulSpeedMult', '磨魂速率倍率', '本机当前 3.0（说明写「1.0 为默认」）。灵魂修为（磨魂）的积累速度；炼药师另有 ×6 加成，两者相乘'],
        ['SoulRule.SoulBreakMult', '灵魂破境概率倍率', '本机当前 3.0（说明写「1.0 为默认」）。凡境→灵境→天境→帝境的瓶颈突破概率（帝境基础 1%/年，尤难）'],
        ['FireRule.FireSpawnMult', '异火现世速率倍率', '本机当前 3.0（说明写「1.0 为默认」）。天地异火择主现世的速率；设为 0 则世间不再诞生新的异火'],
        ['FireRule.FireWorldCap', '世间异火上限', '本机当前 30，范围 1~30（它自己的说明写「默认 13」）。原著异火榜共二十三种，越大越容易群雄并起'],
        ['PillRule.PillAlchemySpeedMult', '炼丹速度倍率', '本机当前 3.0，范围 0.2~3。同组还有 PillRule.PillAlchemistCap 炼药师人数上限（范围 1~30）'],
        ['BeastRule.BeastGrowthMult', '妖兽成长倍率', '本机当前 3.0，范围 0.2~3。同组还有 BeastEnable 妖兽开关、BeastMetamorphMult 化形倍率（本机 5.0，范围 0.2~5）'],
        ['BloodRule.BloodPoisonChance', '厄难毒体血脉概率', '本机当前 0，范围 0~5。同组还有 BloodYaoChenChance 药尘血脉概率'],
        ['SkillRule.SkillChanceMult', '斗技触发倍率', '本机当前 3.0，范围 0.2~3。同组还有 SkillEnable 开关、ManaRegenMult 斗气恢复倍率'],
        ['RealmCapRule.RealmCapDouDi', '斗帝在世人数上限', '范围 0~999。同组还有斗王 / 斗皇 / 斗宗 / 斗尊 / 斗圣五项，0 表示不限'],
        ['DisplayRule.SecretRealmEnable', '秘境开关', '同组还有兽潮 BeastTideEnable、商人 TraderEnable、因果 KarmaEnable、毒道 PoisonWayEnable、总览数据 OverviewStatsEnable 等开关'],
        ['doupo_life_defense', '防御（斗气护体）', '它真注册的自定义属性。受击按 防御/(防御+300) 比例减伤（斗者 5 → 约 1.6%…斗帝 6000 → 约 95%），可被「空间穿透」无视部分'],
        ['doupo_life_penetration', '空间穿透', '攻击时无视敌方一定比例的斗气防御'],
        ['doupo_life_rule', '本源法则', '1 = 免疫减速 / 定身等空间控制；攻击无视敌方闪避与领域威压'],
        ['doupo_life_block / _break / _tenacity / _counter', '格挡 / 破击 / 韧性 / 反击', '器魂四维：格挡＝受击概率大幅减伤（默认减 70%）；破击＝削对方格挡率；韧性＝概率抵抗减速与封锁；反击＝受击后按概率回敬攻击者，伤害是这一击原始伤害的 30%'],
        ['doupo_life_realm / _fire / _talent_speed …', '斗气修为 / 异火亲和 / 修炼速度 …', '镜像类属性（境界数值镜像、异火数、修炼速度、天赋、灵魂境界、血脉纯度、妖兽阶…），cz.json 里都有中文名与说明；它们是斗破按境界算出来写进去的面板值，要改修炼快慢请改上面的倍率项']
      ],
      effect: '倍率调大 → 修炼 / 突破 / 炼丹 / 妖兽成长更快，异火上限调大 → 场上同时存在的异火更多；这些是它在启动时读一次的设置，保存后要重启游戏才生效。',
      src: '来源：mods_config\\DOUPO_LIFE.config（本机实际读出的组名 / 项名 / 范围）；中文名与说明取它自己的 Locales\\cz.json；属性键名取源码 Code\\DoupoLifeDefines.cs；入口说明取 说明文档\\14-轮回商店.txt「五、自定义数值」与「五之二、改其它模组自己的数值」。'
    },
    guigu: {
      name: '鬼谷修仙[重制]', img: 'img/mods/guigu.png',
      sub: '配置来源 mods_config\\XIUXIAN_STANDALONE.config（7 组 115 项）；中文名取它自己的 Locales\\locale.csv',
      what: [
        ['CultiRule.KillExpK', '击杀获取经验系数', '击杀修士后获得的修炼经验；系数越高，击杀高境界获得的经验越多'],
        ['CultiRule.SpiritualEnergyConcentrationTier', '灵气浓度（1~4）', '档位越高，修士每月获取修为经验越快；档位 1 为末法时代，仍可修炼'],
        ['CultiRule.XiandaoSpiritRootBirthChancePercent', '有灵根者比例', '启仙生效后新生儿走仙道路线（七系灵根、仙道先天气运）的概率，填 19 = 19%'],
        ['CultiRule.MaxXiandaoLuckLevel', '仙道最高气运等级', '0 仅凡尘 / 1 绿 / 2 蓝 / 3 紫 / 4 黄 / 5 红（天命之子、仙灵根）；高于设定档的不会在出生时随到'],
        ['CultiRule.ImmortalRevivalYear', '启仙元年', '到该游戏年份前新生儿不掷灵根；设为 0 表示立即启仙'],
        ['CultiRule.RealmMaxCountZhuJi', '仙道筑基同时存活上限', '默认 2000，填 0 = 不限。结晶 / 金丹 / 具灵 / 元婴 / 化神 / 悟道 / 羽化 / 登仙前中后期各有一项'],
        ['CultiRule.CultiRuleAutoFavoriteBreakthrough*', '突破自动收藏', '筑基 / 结晶 / 金丹 / 具灵 / 元婴 / 化神 / 悟道 / 羽化 / 登仙各一个开关'],
        ['WarRule.SpiritVeinSystem', '灵脉系统', '灵脉约每 120 年 28% 概率出世；争脉是有限战（不拉同盟、脉城易主或占对方一城即停战、最长约 6 地图年强制议和）'],
        ['WarRule.CitySurrender', '允许城市投降', '关闭后城市不会被其他国家占领，只能赶尽杀绝'],
        ['WarRule.LimitTraitGain', '禁止突破获得逆天改命', '开启后禁止角色在大境界突破时概率获得逆天改命特质'],
        ['WarRule.RealmOpinionPressure', '修为压人（境界差好感）', '按双方国王大境界差改对他国好感：每差一大境 ±8，单条封顶 ±40'],
        ['WarRule.SpellTerrainBreakPower', '神通 / 仙羽破坏地形能力', '0 = 焦化式破坏；1 = 作用半径内直接变为深海坑（绝技破地不受此项影响）'],
        ['WarRule.RefinerBirthChancePercent', '炼器师诞生概率（%）', '默认 2%。建议 2% 及以下：炼器师越多，锻造与器库分帧占用越多、世界越容易卡'],
        ['WarRule.AlchemistBirthChancePercent', '炼丹师诞生概率（%）', '范围 0~5%，0 = 永不诞生（默认 0.1%）；与炼器师独立掷骰、可同时觉醒为双职业'],
        ['SectRule.SectFoundXiandaoMajorRealmRank', '仙道建立宗门境界', '1 练气 2 筑基 3 结晶 4 金丹 5 具灵 6 元婴 7 化神 8 悟道 9 羽化 10 登仙，默认 4'],
        ['SectRule.SectScripturePlunderPercent', '灭门掠经比例上限（%）', '默认 40%，设为 0 则关闭；实际掠夺还受典籍品质影响'],
        ['HistoryRule.* / FabaoRule.* / PerfRule.*', '史册 / 法宝收藏 / 性能档位', '历史记录开关、法宝 / 玄宝 / 道器 / 仙器 / 本命自动收藏、性能预设等']
      ],
      effect: '击杀经验系数、灵气浓度调大 → 修炼更快；有灵根者比例决定了世界里有修士的比例；各境界在世人数上限决定了高阶修士能堆多少。这些是它在启动时读一次的配置，保存后要重启游戏才生效。',
      only: '★ 它没有注册自己的属性 —— 这一版源码（1.0.6.8）里 `BaseStatAsset` 0 处，境界 / 先天加成是直接写在原版属性上的（Code\\Core\\RealmTypeStats.cs、InnateLuckStats.cs）。所以「＋ 添加属性」里挑不到「鬼谷的东西」，要改它请走「其它模组数值」。',
      src: '来源：mods_config\\XIUXIAN_STANDALONE.config（7 组 115 项）；中文名与说明取它自己的 Locales\\locale.csv；「不注册自定义属性」由源码扫描确认。'
    },
    tianren: {
      name: '天人武道', img: 'img/mods/tianrenwudao.jpg',
      sub: '配置来源 mods_config\\TIANREN_MARTIAL_WAY.config；中文名取它自己的 Locales\\locale.csv',
      what: [
        ['MartialRule.MartialRuleKillExpMul', '击杀获取经验倍率', '范围 1~3。击杀后获得的武道修为倍率；只影响天人武者，高打低仍会衰减'],
        ['MartialRule.MartialRuleMartialAptitudeBirthChancePercent', '武道资质比例', '范围 0.1%~25%（它自己的说明写默认 20%，本机当前 25）。新生儿进入武道资质池的概率；命中者至少奇筋异骨、可修《归元决》，未命中者为凡人'],
        ['MartialRule.MartialRuleRealmSuppressionImmunityPercent', '境界压制免伤', '范围 30%~99%（它自己的说明写默认 60%，本机当前 99）。防御方大境界高于攻击方时减免受到的伤害；差两大境及以上时剩余伤害再减半'],
        ['MartialRule.MartialRuleEnableSystem', '启用武道系统', '关闭后年度调度与武道逻辑不再运行（特质与存档数据保留）'],
        ['MartialRule.MartialRuleCombatText', '伤害浮动显示', '战斗中显示伤害与回血飘字；若同时装了独立的「伤害浮动显示」模组，建议关掉其一以免双重飘字'],
        ['MartialFavorite.*', '自动收藏', '红 / 黄天赋、先天、宗师、大宗师共 5 个开关：获得时自动标为原版收藏'],
        ['MartialHistory.*', '史册开关', '突破（后天 / 先天 / 宗师 / 大宗师 / 天人 / 陆地神仙）、突破失败身死、意志争锋、大宗师陨落、王者征伐等 13 个开关'],
        ['MartialHistory.MartialHistoryTimedTrimKeepCount', '史册保留条数上限', '50~2500，默认 100。只删更早的记录，不影响之后新记录的写入与显示']
      ],
      effect: '资质比例决定武者的数量、击杀经验倍率决定成长速度、境界压制免伤决定高境界有多难被打死。这些是它在启动时读一次的配置，保存后要重启游戏才生效。',
      only: '★ 它同样没有注册自定义属性 —— 源码（1.0.7）里 `BaseStatAsset` 0 处，境界加成写在原版属性上：Code\\Core\\MartialRealmStatSystem.cs 里直接写 health / damage / speed / lifespan / range / stamina / mana 与 multiplier_mana / multiplier_stamina。所以「＋ 添加属性」里挑不到「天人武道的东西」。',
      src: '来源：mods_config\\TIANREN_MARTIAL_WAY.config；中文名与说明取它自己的 Locales\\locale.csv；属性写法取源码 Code\\Core\\MartialRealmStatSystem.cs。'
    },
    xuanjian: {
      name: '玄鉴仙族', img: 'img/mods/xuanjian.png',
      sub: '配置来源 mods_config\\XUANJIAN.config（6 组）；属性键名取自源码 code\\XuanJianVNext\\',
      what: [
        ['基础修炼.XuanJian_config_enable_cultivation', '允许修炼', '关闭后所有生物都不会进入玄鉴修炼链路（动物与动物亚种始终不可修炼）'],
        ['XuanJian_config_aptitude_grant_chance_percent', '修炼特质获得概率', '范围 25%~40%。五岁或六岁容错判定时获得修炼资质的普通判定上限，血脉与直系高境保底另行生效'],
        ['XuanJian_config_qiujinfa_chance_permille', '求金法参悟概率（千分制）', '10 表示 10‰ = 1%，50 表示 5%；龙属按该上限 2 倍结算，但仍封顶 5%'],
        ['XuanJian_config_sword_intent_chance_percent', '剑意领悟概率（%）', '范围 1%~10%。普通剑修由剑元悟入剑意的单次成功率上限'],
        ['XuanJian_config_daotai_merit_gain_curve_percent', '功绩比例设置', '范围 75~105。调节天地功绩的获取幅度，只影响此后获得的功绩'],
        ['世界生态.XuanJian_config_allow_sect_rebellion', '允许宗门叛乱', '开启后，满足高阶修士、距离与城镇数量条件的远方城镇可另立新宗'],
        ['XuanJian_config_enable_yao_xie_generation', '金性妖邪生成', '紫府冲击金丹失败时允许按规则诞生金性妖邪，并延迟触发阴司追索结算'],
        ['XuanJian_config_enable_longshu_generation', '龙属生成', '世界中至少有 9 名非龙属紫府 / 金丹同级高境修士时，可在远离陆地的海域生成龙属；每轮活动龙属上限 3 名'],
        ['洞天设置.XuanJian_config_qiyu_dongtian_spawn_years', '奇遇洞天出现间隔', '100~500 年。按玄鉴历的严格周期，改完立即按新周期对齐'],
        ['洞天设置.XuanJian_config_jindan_dongtian_cultivate_years', '金丹洞天闭关时长', '最低 1 年。调整后已闭关角色会按新设置重算本轮闭关结束年'],
        ['公告设置.* / 自动收藏.* / 性能维护.*', '公告 / 收藏 / 性能', '高境证道、权威职位、亡故、领悟、宝物里程碑、宗门、洞天、阴司、释修等公告开关；各境界自动收藏 13 项；内存整理 / 敌人搜索退避 / FPS 等 5 项'],
        ['ZhenYuan', '真元', '它真注册的自定义属性（code\\XuanJianVNext\\Traits\\XjVNextAssetRegistration.cs，范围 -999999~999999）'],
        ['MingShu', '先天命数', '同上文件注册（范围 -999999~999999）'],
        ['HuiGuang', '道慧', '同上文件注册（范围 -999999~999999）'],
        ['Resist', '抗击退', '它真注册的自定义属性（code\\XuanJianVNext\\Core\\XjSafeCore.cs，范围 0~999999）'],
        ['Dodge / Accuracy', '闪避率 / 命中率', '同上文件注册（0~99999）'],
        ['Vampire / ArmorPenPercent / Healback', '吸血 / 防御穿透 / 每秒回血', '同上文件注册（吸血 0~100、防御穿透 0~100、回血 0~2）'],
        ['XjKnockbackResistance', '防击退', '它真注册的自定义属性（code\\XuanJianVNext\\Traits\\XjKnockbackGuard.cs，0~1）'],
        ['XjCritChance / XjCritTakenReduction / XjShieldRatio / XjShieldBreak / XjSameRealmDamage / XjTrueDamageRatio', '（同批战斗细分属性）', 'XjSafeCore.cs 里同一段注册的，键名就是代码里的常量值；它自己的 cz.json 没有给这几个中文名，所以这里不替它编名字'],
        ['DamageReduce / CritChance / CritTakenReduction / ShieldRatio / ShieldBreak / SameRealmDamage / TrueDamageRatio', '（对应的 C# 常量名）', '上面那几个 Xj* 键名在源码里的常量名，方便你去源码里对号入座']
      ],
      effect: '允许修炼一关就整条链路停掉；资质概率 / 求金法 / 剑意 / 功绩比例直接影响修士成长快慢；洞天周期决定奇遇与闭关的节奏。配置是它在启动时读一次的，保存后要重启游戏才生效；而那批 ZhenYuan / Dodge / Accuracy 之类属性是往商品上「加属性」，点「添加」就立刻生效。',
      src: '来源：mods_config\\XUANJIAN.config；中文名取它自己的 Locales\\cz.json；属性键名与范围取源码 code\\XuanJianVNext\\Core\\XjSafeCore.cs、code\\XuanJianVNext\\Traits\\XjVNextAssetRegistration.cs、code\\XuanJianVNext\\Traits\\XjKnockbackGuard.cs；入口说明取 说明文档\\14-轮回商店.txt。'
    },
    qiyuan: {
      name: '启源修仙', img: 'img/mods/qiyuan.png',
      sub: '配置来源 mods_config\\CULTIWAY.config；属性键名取它自己的 Locales\\stats.csv（共 76 条）',
      what: [
        ['GeneralSettings.SPAWN_ELEMENT_ROOT_NATURALLY', '自然诞生灵根概率', '0 为禁用，1 为 100%'],
        ['GeneralSettings.ENABLE_GEO_SYSTEMS', '启用地理演化', '开启后世界地图上的地形会随时间推移发生变化'],
        ['ENABLE_CULTIBOOK_SYSTEMS', '启用功法系统', '小人可以通过研究功法来学习新的技能'],
        ['ENABLE_TALISMAN_SYSTEMS', '启用符箓系统', '小人可以制作符箓来释放各种临时法术'],
        ['ENABLE_ELIXIR_SYSTEMS', '启用丹药系统', '小人可以炼制丹药来获得各种增益效果'],
        ['ENABLE_AM_SYSTEMS', '启用师徒系统', '小人可以收徒和当师傅，进行师徒互动'],
        ['ENABLE_SKILL_SYSTEMS', '启用技能系统', '小人可以学习和使用各种技能'],
        ['ENABLE_SECT_SYSTEMS', '启用宗门系统', '关闭后不会再建立新宗门，已有宗门不会被销毁'],
        ['ENABLE_WAKAN_SPREAD', '启用灵气扩散', '灵气会在相邻地块之间自然流动'],
        ['ENABLE_NATURAL_HEALTH_RESTORE', '启用自然生命回复', '单位按月根据生命回复属性自然恢复生命'],
        ['ENABLE_NATURAL_WAKAN_RESTORE', '启用自然灵气吸收', '修士按月从脚下地块自然吸收灵气'],
        ['GeneralSettings.TRAIN_STATION_TIMED_DISPATCH_EXPERIMENTAL', '传送阵定时调度（实验）', '一个实验性开关，本机为关'],
        ['AnimSettings.ALL_RENDER', '全部动画渲染', '关掉可省性能（视觉效果会一起消失）'],
        ['RealmVisualSettings.*', '境界视觉表现 5 项', '总开关 / 光环 / 粒子 / 指示器 / 突破特效（本机配置里五项全为关）'],
        ['AIGCSettings.BASE_URL | API_KEY | MODEL', '它的 AIGC 接口 3 项', '文本项：接口地址（默认 https://api.deepseek.com）、密钥、模型（默认 deepseek-chat）'],
        ['IronArmor ~ EntropyArmor', '金 / 木 / 水 / 火 / 土 / 阴 / 阳 / 同化抗性', '真注册的 8 系元素护甲（抵抗对应属性伤害）'],
        ['IronMaster ~ EntropyMaster', '金 / 木 / 水 / 火 / 土 / 阴 / 阳 / 同化精通', '真注册的 8 系精通，提高对应属性攻击效果的掌握'],
        ['DivineSense / MaxSoul / MaxQiyun / MaxWakan / WakanRegen', '神识 / 元神上限 / 气运上限 / 灵气上限 / 灵气恢复', '真注册的自定义属性（stats.csv 里都给了中文名）'],
        ['MaxSpirit / MaxVigor / KnightEvasion / HealthRegen / ManaRegen / SpiritRegen', '精神力上限 / 斗气上限 / 闪避率 / 生命恢复 / 法力恢复 / 精神力恢复', '真注册的自定义属性'],
        ['RecruitRangeModifier / TeachingGainModifier / DeaconSlotModifier / ElderSlotModifier / TreasureCapacity …', '宗门人事类约 30 条', '招揽范围 / 招揽境界上限 / 收徒意愿门槛 / 师父弟子名额 / 传授收益 / 讲法听众上限 / 各职名额与门槛 / 研读与贡献 / 藏宝阁容量…']
      ],
      effect: '把某个系统的总开关关掉，那一整套玩法（功法 / 符箓 / 丹药 / 师徒 / 技能 / 宗门 / 灵气扩散）就当场停摆；自然诞生灵根概率决定世界里有没有修士。开关类保存后要重启游戏才生效；那 80 条属性是往商品上「加属性」，点「添加」立刻生效。',
      src: '来源：mods_config\\CULTIWAY.config（本机实测读出）；中文名取它自己的 Locales\\config.csv 与 Locales\\stats.csv；属性注册取源码 Source\\WorldboxBaseStats.cs 与 Source\\Abstract\\ExtendLibrary.cs。'
    },
    zidingyi: {
      name: '自定义修炼', img: 'img/mods/zidingyi.png',
      sub: '配置来源 mods_config\\INMNY_CUSTOMMODT001_CUSTOM.config；属性键名取源码 Source\\Stats.cs',
      what: [
        ['WarRule.CitySurrender', '允许城市投降', '关闭后城市不会被其他国家占领，只能赶尽杀绝'],
        ['WarRule.InheritSystemFromParents', '体系继承', '开启后多体系下单位将从父母继承体系'],
        ['WarRule.TurbulentWorld', '动荡世界', '开启后增加战争与叛乱'],
        ['WeaponRule.NoDurabilityLoss', '武器不损失耐久度', '开启后所有武器不会损失耐久度'],
        ['ActorHistory.BreakthroughHistory', '突破历史', '查看突破历史记录'],
        ['inmny.custommodt001_custom.dodge / .accuracy / .crit_resistance', '闪避 / 命中 / 抗暴', '真注册的自定义属性，1 点 = 1%（判定处按 0.01 × 值 换算，存储百分比整数）'],
        ['inmny.custommodt001_custom.life_steal / .life_regen / .mana_regen', '吸血 / 生命恢复 / 蓝量恢复', '真注册的自定义属性'],
        ['inmny.custommodt001_custom.physical_damage_reduction / .true_damage / .multiplier_armor', '固定免伤 / 真伤 / 防御（护甲倍率）', '真注册的自定义属性；multiplier_armor 是倍率型（作用在 armor 上）'],
        ['inmny.custommodt001_custom.control_give / .control_get', '控制时长 / 受控时长', '真注册的自定义属性，按百分比结算'],
        ['inmny.custommodt001_custom.status_time_give / .status_time_get', '赋状态时长 / 受状态时长', '真注册的自定义属性，按百分比结算'],
        ['inmny.custommodt001_custom.stats_stacked_effect / .knockback_reduction', '无限叠加属性效果 / 击退减免', '真注册的自定义属性，按百分比结算']
      ],
      effect: '开关类直接决定它那套体系的行为（城市能不能投降、体系能不能继承、武器掉不掉耐久）；那批属性往商品上一加，就等于给穿着这件商品的人换/加一份该模组的战斗数值。开关保存后要重启游戏才生效；「＋ 添加属性」立刻生效。',
      src: '来源：mods_config\\INMNY_CUSTOMMODT001_CUSTOM.config；源码 Source\\Stats.cs（属性键名 = 它自己的 asset_id_prefix + 字段名）；中文名取 Locales\\locale.csv。'
    },
    self: {
      name: '主神空间▪万界（本模组）', img: 'img/mod-icon.png',
      sub: '本模组自己注册的属性：源码 Code\\内容\\StatsInit.cs',
      what: [
        ['multiplier_range', '攻击范围倍率', '原版只给 生命 / 伤害 / 速度 / 攻速 / 体力 / 魔力 等倍率属性，攻击范围的倍率是本模组补注册的 —— ×1000 对应数值 999，装它「提升 1000 倍攻击范围」才真正生效'],
        ['multiplier_targets', '攻击目标数量倍率', '同上，本模组补注册，用来放大「一次打几个目标」'],
        ['multiplier_intelligence', '智力倍率', '本模组补注册的智力倍率属性'],
        ['multiplier_lifespan', '寿命倍率', '本模组补注册的寿命倍率属性']
      ],
      effect: '给商品加上这几条倍率属性，就等于把穿着它的人的「攻击范围 / 目标数 / 智力 / 寿命」整体乘上一个倍数；点「添加」立刻生效。',
      only: '★ 本模组那 31 个内容（魂环 / 三勾玉 / 六眼 / 真理之书…）的数值<b>不在这里改</b>：它们走「自定义内容数据」（扎克修改器 →「自定义内容数据」，或 轮回商店 → 该商品 →「自定义数值」里淡蓝色那几行），改的是全局内容数值、对所有持有者立刻生效，内容说明与网页图鉴里的数字也一起变。',
      src: '来源：主神空间▪万界 源码 Code\\内容\\StatsInit.cs（4 条倍率属性）；属性归属前辍表见 Code\\界面\\ZhaKeOtherModStats.cs 的 Rules 数组（`zack_*` 等前缀用来把属性认回本模组）；入口说明取 说明文档\\14-轮回商店.txt。'
    }
  };

  // 「怎么改」两种入口，所有模组共用一段
  var MOD_HOW = [
    '① 往商品上加这个模组的属性：轮回商店 → 点一件商品 →「定价表」→「自定义数值」→ 最下面那行「＋ 添加属性」→ 顶部搜索栏打模组名或属性名（界面不显示英文 id，但能按 id 搜）→ 点中属性 → 底部填「增加数值」→ 点「添加」。同一个属性再加一次 = 叠加；点「添加」立刻写进商品。</br>★ 立刻生效：点完后模组会扫全场，凡已经带着这件特质的活单位当场重算 —— 不用等它再轮回一次。',
    '② 改这个模组自己的数值：轮回商店 → 右上角「自定义内容数据」<b>左边</b>的「其它模组数值」→ 顶部搜索栏按模组名 / 组名 / 项名过滤（中英文都行）→ 数值项点那一行（底部显示已选、输入框自动填当前值）→ 改数字 → 点「保存」；开关项点一下就是切换（立刻保存，不用输入）。</br>★ 要重启游戏才生效：这些是别的模组启动时读一次的设置，我们只是把它的配置文件改掉；而且<b>不按它自己滑条的上限夹取</b>（斗破「修炼倍率」滑条上限是 3，这里能改成 5）。'
  ];

  /* ------- 弹层 DOM（只建一次） ------- */
  var dlg = document.createElement('div');
  dlg.className = 'detail-mask';
  dlg.innerHTML = '<div class="detail-card" role="dialog" aria-modal="true">'
    + '<button class="detail-close" type="button" aria-label="关闭">✕</button>'
    + '<div class="detail-body"></div></div>';
  document.body.appendChild(dlg);
  var dlgBody = dlg.querySelector('.detail-body');
  var dlgClose = dlg.querySelector('.detail-close');
  var lastFocus = null;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  // 允许数据里写极少数标签（<b> / <br> / </br>）——来源都是我们自己写死的文案
  function rich(s) {
    return esc(s).replace(/&lt;b&gt;/g, '<b>').replace(/&lt;\/b&gt;/g, '</b>')
      .replace(/&lt;br&gt;/g, '<br>').replace(/&lt;\/br&gt;/g, '<br>');
  }
  function key(s) { return '<code>' + esc(s) + '</code>'; }

  function openDetailCard(html) {
    dlgBody.innerHTML = html;
    dlg.classList.add('is-on');
    document.body.style.overflow = 'hidden';
    dlg.querySelector('.detail-card').scrollTop = 0;
    dlgClose.focus();
  }

  function closeDetail() {
    if (!dlg.classList.contains('is-on')) return;
    dlg.classList.remove('is-on');
    dlgBody.innerHTML = '';
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  // 内容详情：图标 + 名字 + 品质 chip / 机制 / 技能清单 / 可调数字
  function openItem(id) {
    var d = DETAILS[id];
    if (!d) return;
    var html = '<div class="detail-head"><img src="' + esc(d.img) + '" alt="' + esc(d.name) + '">'
      + '<div><h3>' + esc(d.name) + ' <span class="chip ' + esc(d.q) + '">' + esc(d.qtext) + '</span></h3>'
      + '<p class="detail-sub">机制 + 技能 / 效果清单</p></div></div>';
    html += '<div class="detail-sec"><h5>机制（简单）</h5><ul>';
    for (var i = 0; i < d.mech.length; i++) html += '<li>' + rich(d.mech[i]) + '</li>';
    html += '</ul></div>';
    html += '<div class="detail-sec"><h5>技能 / 效果清单</h5><ul>';
    for (var j = 0; j < d.skills.length; j++) {
      html += '<li><b>' + esc(d.skills[j][0]) + '</b>：' + rich(d.skills[j][1]) + '</li>';
    }
    html += '</ul></div>';
    if (d.tune) html += '<div class="detail-sec"><h5>可调数字</h5><p class="detail-note">' + rich(d.tune) + '</p></div>';
    html += '<p class="detail-src">来源：模组自带说明文档 09-体质 / 10-物品 / 11-技能 / 12-状态（本页只做简化，细节以游戏内为准）</p>';
    openDetailCard(html);
  }

  // 模组详情：能改什么 / 改它的作用 / 怎么改 / 出处
  function openMod(id) {
    var d = MODDETAILS[id];
    if (!d) return;
    var html = '<div class="detail-head"><img src="' + esc(d.img) + '" alt="' + esc(d.name) + '">'
      + '<div><h3>' + esc(d.name) + '</h3>'
      + '<p class="detail-sub">轮回商店能改到它的什么</p></div></div>';
    html += '<div class="detail-sec"><h5>① 能改什么（键名 + 中文说明）</h5><ul>';
    for (var i = 0; i < d.what.length; i++) {
      html += '<li>' + key(d.what[i][0]) + ' <b>' + esc(d.what[i][1]) + '</b> —— ' + rich(d.what[i][2]) + '</li>';
    }
    html += '</ul></div>';
    html += '<div class="detail-sec"><h5>② 改它的作用</h5><p class="detail-note">' + rich(d.effect) + '</p></div>';
    if (d.only) html += '<p class="detail-note">' + rich(d.only) + '</p>';
    html += '<div class="detail-sec"><h5>③ 怎么改（两个入口）</h5><ul>';
    for (var k = 0; k < MOD_HOW.length; k++) html += '<li>' + rich(MOD_HOW[k]) + '</li>';
    html += '</ul></div>';
    html += '<p class="detail-src">' + rich(d.sub) + '<br>' + rich(d.src) + '</p>';
    openDetailCard(html);
  }

  // 点卡片 / 点图标都能开；键盘 Tab 聚焦、Enter / Space 打开
  document.addEventListener('click', function (e) {
    var t = e.target;
    var el = t && t.closest ? t.closest('[data-detail],[data-mod]') : null;
    if (!el) return;
    if (el.hasAttribute('data-detail')) openItem(el.getAttribute('data-detail'));
    else openMod(el.getAttribute('data-mod'));
  });
  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var el = t.closest('[data-detail],[data-mod]');
    if (!el) return;
    if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
    e.preventDefault();
    if (el.hasAttribute('data-detail')) openItem(el.getAttribute('data-detail'));
    else openMod(el.getAttribute('data-mod'));
  });

  dlgClose.addEventListener('click', function () { closeDetail(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) closeDetail(); });
  document.addEventListener('keydown', function (e) {
    if (!dlg.classList.contains('is-on')) return;
    if (e.key === 'Escape' || e.key === 'Esc') { closeDetail(); return; }
    // 弹层打开时把 Tab 圈在卡片里，关掉后焦点回到原来那张卡
    if (e.key !== 'Tab') return;
    var focusables = dlg.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusables.length) return;
    var first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  // 记下打开前的焦点元素，关闭时还给它
  document.addEventListener('click', function (e) {
    var t = e.target;
    var el = t && t.closest ? t.closest('[data-detail],[data-mod]') : null;
    if (el) lastFocus = el;
  }, true);

  /* ---------- ⑤ 初始化 ---------- */
  // 没写 hash = 显示首页；写了（比如别人发来的 .../#mods）= 直接打开那个模块
  showView(viewFromHash());
})();
