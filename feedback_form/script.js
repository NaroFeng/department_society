/* ====================================
   金大資工新生指南 - 互動腳本
   功能：
   1. 捲動時導覽列陰影
   2. 手機選單切換
   3. 平滑捲動錨點 (offset for fixed nav)
   4. 中英雙語切換
   ==================================== */

(function () {
  'use strict';

  /* ---------------------------------------------
     中英翻譯字典
     - data-i18n：純文字 (textContent)
     - data-i18n-html：含 HTML 標籤 (innerHTML)
     --------------------------------------------- */
  const i18n = {
    zh: {
      // meta
      'page-title': '金大資工新生指南 | Welcome Freshers',
      'page-desc': '給金門大學資訊工程學系新生的全方位入門指南：優惠政策、系學會、社團與周邊生態。',

      // 導覽列
      'brand': '金大資工新生指南',
      'nav-policy': '優惠政策',
      'nav-association': '系學會',
      'nav-clubs': '熱門社團',
      'nav-life': '周邊生態',

      // Hero
      'hero-eyebrow': '👋 嗨，新生',
      'hero-title-1': '歡迎來到',
      'hero-title-2': '金門大學資工系',
      'hero-sub': '一頁帶你認識補助政策、系學會、熱門社團與校園周邊生活，讓你的大學第一天不再手忙腳亂。',
      'hero-btn-form': '📝 填寫報到表單',
      'hero-btn-explore': '先逛逛內容',
      'hero-pill-1': '🏝️ 離島補助',
      'hero-pill-2': '🤝 破冰活動',
      'hero-pill-3': '🎯 社團精選',
      'hero-pill-4': '🍜 在地生活',

      // 優惠政策
      'policy-tag': 'Section 01',
      'policy-title': '新生優惠政策 💸',
      'policy-desc': '金門縣政府與學校提供多項專屬補助，<span class="hl">詳情將於簽名活動現場說明</span>，這裡先幫你掌握大方向。',
      'policy-1-title': '學費減免',
      'policy-1-desc': '依據離島建設條例，符合身份可申請學費減免。',
      'policy-1-q': '誰可以申請？',
      'policy-1-a': '以學校公告與註冊組資訊為準，簽名活動當天會有完整說明。',
      'policy-2-title': '機票 / 交通補助',
      'policy-2-desc': '每學期提供往返台金機票或交通費用補貼。',
      'policy-2-q': '補助額度？',
      'policy-2-a': '依縣府當年度公告調整，建議現場確認最新版本。',
      'policy-3-title': '遷戶籍優惠',
      'policy-3-desc': '將戶籍遷至金門，可享有更多在地福利與補助。',
      'policy-3-q': '遷戶籍有什麼好處？',
      'policy-3-a': '可能包含就學津貼、醫療優惠、地方加碼等，現場會完整說明。',
      'policy-4-title': '縣府助學金',
      'policy-4-desc': '金門縣政府提供多項助學方案，協助學生安心就學。',
      'policy-4-q': '要去哪裡申請？',
      'policy-4-a': '請依學校與縣府公告流程辦理，記得關注截止日期。',
      'policy-callout': '<strong>提醒：</strong>本頁只整理政策方向，<u>實際內容以簽名活動現場公告為準</u>。若有疑問，歡迎當天向學長姐或系辦詢問！',

      // 系學會
      'assoc-tag': 'Section 02',
      'assoc-title': '系學會 🚀',
      'assoc-desc': '系學會不只是辦活動，更是<strong>提前體驗職場</strong>的舞台。透過規劃、統籌、會議討論，你能學到課堂不會教的事。',
      'assoc-hero-title': '為什麼要加入系學會？',
      'assoc-hero-p': '大學不只是讀書，更是<strong>找方向、練本事、交朋友</strong>的階段。系學會透過辦活動、處理突發狀況、與人合作，讓你在畢業前先累積一輪「出社會會用到」的能力。',
      'assoc-check-1': '✅ 活動規劃與專案管理',
      'assoc-check-2': '✅ 團隊溝通與會議主持',
      'assoc-check-3': '✅ 危機處理與時間掌控',
      'assoc-check-4': '✅ 拓展人脈、找到未來方向',
      'assoc-fc-1': '📅 活動企劃',
      'assoc-fc-2': '🗣️ 會議主持',
      'assoc-fc-3': '🤝 團隊合作',
      'assoc-fc-4': '🎯 解決問題',
      'assoc-block-title': '參加系學會，你會收穫…',
      'mini-1-title': '管理思維',
      'mini-1-desc': '從「被交付任務」升級到「能帶領專案」的人。',
      'mini-2-title': '統籌能力',
      'mini-2-desc': '學會把人、時程、預算整合成一個完整活動。',
      'mini-3-title': '職場模擬',
      'mini-3-desc': '開會、做簡報、跨組溝通，都是未來工作的日常。',
      'mini-4-title': '找到方向',
      'mini-4-desc': '從辦活動中發現自己的熱情與擅長的事。',
      'assoc-callout': '<strong>學長姐建議：</strong>抓 <u>1 到 2 學期</u> 參與系學會，從籌備到執行完整走過一輪活動，你會發現自己變得不一樣！',
      'contact-block-title': '聯絡我們',
      'office-title': '系學會辦公室',
      'office-desc': '理工大樓 <span class="hl">E316</span>　歡迎新生隨時來坐坐、問問題！',
      'contact-fb': 'Facebook 粉專',
      'contact-fb-pending': '待補：粉專連結',
      'contact-ig': 'Instagram',
      'contact-ig-pending': '待補：IG 帳號',
      'contact-email': 'Email',
      'contact-email-pending': '待補：系學會信箱',

      // 社團
      'clubs-tag': 'Section 03',
      'clubs-title': '熱門社團精選 🌟',
      'clubs-desc': '想拓展交友圈、培養興趣？這幾個金大熱門社團值得你加入！',
      'club-1-name': '熱音社',
      'club-1-type': '康樂性',
      'club-1-desc': '想組團、想表演、想當主唱？熱音社是金大夜晚最熱血的選擇。',
      'club-1-meta': '待補：FB / IG',
      'club-2-name': '熱舞社',
      'club-2-type': '康樂性',
      'club-2-desc': '零基礎也能跳，從基礎練起，站上舞台就是你下一個成就。',
      'club-2-meta': '待補：FB / IG',
      'club-3-name': '資訊社 / 程式設計社',
      'club-3-type': '學術性',
      'club-3-desc': '寫 code、參加比賽、接專案，技術力在這裡練起來。',
      'club-3-meta': '待補：FB / IG',
      'club-4-name': '系 / 校 籃球隊',
      'club-4-type': '體育性',
      'club-4-desc': '想打球、想交朋友、想為系爭光，球場是你最好的起點。',
      'club-4-meta': '待補：FB / IG',
      'club-5-name': '服務性社團',
      'club-5-type': '服務性',
      'club-5-desc': '帶營隊、淨灘、社區服務，把金門的回憶變成你的故事。',
      'club-5-meta': '待補：FB / IG',
      'club-6-name': '想推薦更多？',
      'club-6-type': '等你來補',
      'club-6-desc': '把你想介紹的社團名稱與簡述交給系學會，我們幫你上架！',
      'club-6-meta': '編輯中',
      'club-cta-p': '想看更多金大社團的完整介紹？',
      'club-cta-btn': '🔗 前往金大社團總覽',

      // 周邊生態
      'life-tag': 'Section 04',
      'life-title': '校園周邊生態 🏝️',
      'life-desc': '學校不在市中心，但機能其實很夠用。這裡幫你整理食衣住行的小眉角。',
      'life-1-title': '生活機能｜吃什麼？買什麼？',
      'life-food-1-title': '校內餐廳',
      'life-food-1-1': '圓樓（學生餐廳，各式餐點）',
      'life-food-1-2': '7-11 便利商店（零食、飲料、生活用品）',
      'life-food-1-3': '宵夜選項歡迎現場詢問學長姐',
      'life-food-2-title': '附近小吃 / 餐廳',
      'life-food-2-1': '歡迎跟學長姐詢問在地口袋名單 🍜',
      'life-food-2-2': '每個人口味不同，自己探險也是大學樂趣！',
      'life-food-2-3': '記得加入系學會社群，大家會即時分享',
      'life-food-3-title': '採買日用品',
      'life-food-3-1': '鈞統（學校附近，採買方便）',
      'life-food-3-2': '萬家福（原家樂福，金城生活圈）',
      'life-food-3-3': '金城生活圈（補給、逛街一次滿足）',
      'life-2-title': '交通｜怎麼移動？',
      'life-bus-title': '公車',
      'life-bus-1': '採 <strong>線上預約制</strong>，事先預約班次',
      'life-bus-2': '預約後到 <strong>學校站牌</strong> 候車即可',
      'life-bus-3': '時刻表依金門縣公車處公告為主',
      'life-transport-title': '代步工具',
      'life-transport-1': '<strong>推薦準備一台機車</strong>，移動最方便 🛵',
      'life-transport-2': '校園周邊與金城 / 金湖皆可輕鬆到達',
      'life-transport-3': '租車 / 二手機車可洽學長姐詢問店家',
      'life-leave-title': '出島交通',
      'life-leave-1': '<strong>碼頭 → 廈門</strong>：小三通航線',
      'life-leave-2': '<strong>機場 → 台灣本島</strong>：往返主要城市',
      'life-leave-3': '航班 / 船班時刻以航空公司 / 船公司公告為準',
      'life-3-title': '校內設施｜你會用到的',
      'facility-1': '宿舍',
      'facility-1-desc': '待補：房型 / 費用 / 入住資訊',
      'facility-2': '圖書館',
      'facility-2-desc': '待補：開放時間 / 借閱規定',
      'facility-3': '運動場 / 體育館',
      'facility-3-desc': '待補：場地借用 / 開放時段',
      'facility-4': '學生餐廳',
      'facility-4-desc': '待補：營業時間 / 餐飲類型',

      // 頁尾
      'footer-1': '🎓 金門大學資訊工程學系 系學會',
      'footer-2': '一起讓新生的大學第一步，走得更踏實。'
    },

    en: {
      // meta
      'page-title': 'NQU CS Freshers Guide | Welcome Freshers',
      'page-desc': 'A complete starter guide for new CS students at National Quemoy University: subsidies, student association, clubs and campus life.',

      // Nav
      'brand': 'NQU CS Guide',
      'nav-policy': 'Benefits',
      'nav-association': 'Association',
      'nav-clubs': 'Clubs',
      'nav-life': 'Campus Life',

      // Hero
      'hero-eyebrow': '👋 Hey, Freshers',
      'hero-title-1': 'Welcome to',
      'hero-title-2': 'NQU Computer Science',
      'hero-sub': 'One page to get to know subsidies, the student association, popular clubs and life around campus — no panic on your first day.',
      'hero-btn-form': '📝 Fill in Check-in Form',
      'hero-btn-explore': 'Browse content',
      'hero-pill-1': '🏝️ Island Subsidies',
      'hero-pill-2': '🤝 Ice-breaking',
      'hero-pill-3': '🎯 Club Picks',
      'hero-pill-4': '🍜 Local Life',

      // Benefits
      'policy-tag': 'Section 01',
      'policy-title': 'Freshman Benefits 💸',
      'policy-desc': 'The Kinmen County Government and NQU offer a number of exclusive subsidies. <span class="hl">Full details will be explained on-site at the sign-in event</span> — here\'s the overview.',
      'policy-1-title': 'Tuition Reduction',
      'policy-1-desc': 'Apply for tuition reduction under the Offshore Islands Development Act if eligible.',
      'policy-1-q': 'Who is eligible?',
      'policy-1-a': 'Refer to the official NQU and Registrar\'s Office notices; complete briefing will be given on the sign-in day.',
      'policy-2-title': 'Flight / Transport Subsidy',
      'policy-2-desc': 'Subsidies for round-trip flights between Taiwan and Kinmen each semester.',
      'policy-2-q': 'How much?',
      'policy-2-a': 'Amount is adjusted yearly by the County Government; check the latest version on-site.',
      'policy-3-title': 'Household-Registration Benefits',
      'policy-3-desc': 'Transfer your household registration to Kinmen for extra local benefits and subsidies.',
      'policy-3-q': 'What are the perks?',
      'policy-3-a': 'Possible benefits include study allowances, medical perks and local bonuses. Full briefing on-site.',
      'policy-4-title': 'County Scholarships',
      'policy-4-desc': 'The Kinmen County Government provides multiple scholarship schemes to support students.',
      'policy-4-q': 'Where to apply?',
      'policy-4-a': 'Follow the procedures announced by NQU and the County Government; mind the deadlines.',
      'policy-callout': '<strong>Note:</strong> This page is only an overview. <u>The actual content is based on the on-site announcement at the sign-in event</u>. Questions are welcome — ask seniors or the department office that day!',

      // Association
      'assoc-tag': 'Section 02',
      'assoc-title': 'Student Association 🚀',
      'assoc-desc': 'The CS Association is more than just events — it\'s a stage to <strong>experience the workplace early</strong>. Through planning, coordination and meetings, you\'ll learn things classes won\'t teach.',
      'assoc-hero-title': 'Why join the Association?',
      'assoc-hero-p': 'College isn\'t just about studying — it\'s about <strong>finding direction, building skills and making friends</strong>. Through running events, handling surprises and teamwork, you\'ll accumulate a full round of "real-world" abilities before graduation.',
      'assoc-check-1': '✅ Event planning & project management',
      'assoc-check-2': '✅ Team communication & meeting facilitation',
      'assoc-check-3': '✅ Crisis handling & time control',
      'assoc-check-4': '✅ Networking & future direction',
      'assoc-fc-1': '📅 Planning',
      'assoc-fc-2': '🗣️ Meetings',
      'assoc-fc-3': '🤝 Teamwork',
      'assoc-fc-4': '🎯 Problem-solving',
      'assoc-block-title': 'What you\'ll gain from joining',
      'mini-1-title': 'Management Mindset',
      'mini-1-desc': 'Level up from "task receiver" to "project leader".',
      'mini-2-title': 'Coordination',
      'mini-2-desc': 'Combine people, schedules and budget into a complete event.',
      'mini-3-title': 'Workplace Simulation',
      'mini-3-desc': 'Meetings, presentations, cross-team communication — your future daily life.',
      'mini-4-title': 'Find Your Path',
      'mini-4-desc': 'Discover your passion and strengths through running events.',
      'assoc-callout': '<strong>Senior\'s Tip:</strong> Spend <u>1 to 2 semesters</u> in the Association. Walk through a full cycle from planning to execution — you\'ll see yourself change!',
      'contact-block-title': 'Contact Us',
      'office-title': 'Association Office',
      'office-desc': 'Science & Engineering Building, <span class="hl">E316</span> — freshers are always welcome to drop by and ask questions!',
      'contact-fb': 'Facebook Page',
      'contact-fb-pending': 'TBD: page link',
      'contact-ig': 'Instagram',
      'contact-ig-pending': 'TBD: IG account',
      'contact-email': 'Email',
      'contact-email-pending': 'TBD: association email',

      // Clubs
      'clubs-tag': 'Section 03',
      'clubs-title': 'Featured Clubs 🌟',
      'clubs-desc': 'Want to expand your circle or pick up a hobby? These popular NQU clubs are worth joining!',
      'club-1-name': 'Music Club',
      'club-1-type': 'Recreation',
      'club-1-desc': 'Form a band, perform live, become a vocalist? Music Club is the most passionate pick on campus.',
      'club-1-meta': 'TBD: FB / IG',
      'club-2-name': 'Dance Club',
      'club-2-type': 'Recreation',
      'club-2-desc': 'Zero base? No problem. Start from basics and your next achievement is the stage.',
      'club-2-meta': 'TBD: FB / IG',
      'club-3-name': 'Info / Programming Club',
      'club-3-type': 'Academic',
      'club-3-desc': 'Code, compete, take projects — sharpen your tech skills here.',
      'club-3-meta': 'TBD: FB / IG',
      'club-4-name': 'Dept. / School Basketball',
      'club-4-type': 'Sports',
      'club-4-desc': 'Play ball, make friends, cheer for the department — the court is your best start.',
      'club-4-meta': 'TBD: FB / IG',
      'club-5-name': 'Service Clubs',
      'club-5-type': 'Service',
      'club-5-desc': 'Run camps, beach cleanup, community service — turn Kinmen memories into your story.',
      'club-5-meta': 'TBD: FB / IG',
      'club-6-name': 'Recommend more?',
      'club-6-type': 'TBD',
      'club-6-desc': 'Send us the name and description of a club you\'d like featured — we\'ll add it!',
      'club-6-meta': 'In editing',
      'club-cta-p': 'Want to see the full list of NQU clubs?',
      'club-cta-btn': '🔗 Go to NQU Club List',

      // Campus Life
      'life-tag': 'Section 04',
      'life-title': 'Campus & Surroundings 🏝️',
      'life-desc': 'NQU isn\'t downtown, but it has what you need. Here\'s a quick guide to food, shopping and getting around.',
      'life-1-title': 'Food & Shopping',
      'life-food-1-title': 'Campus Restaurants',
      'life-food-1-1': 'Yuan Lou (student cafeteria, various dishes)',
      'life-food-1-2': '7-Eleven (snacks, drinks, daily necessities)',
      'life-food-1-3': 'Late-night options — ask seniors on-site',
      'life-food-2-title': 'Nearby Eateries',
      'life-food-2-1': 'Ask seniors for local pocket lists 🍜',
      'life-food-2-2': 'Everyone\'s taste is different — exploring is part of the fun!',
      'life-food-2-3': 'Join the Association community for real-time recommendations',
      'life-food-3-title': 'Daily Shopping',
      'life-food-3-1': 'Jun-Tong (near campus, easy shopping)',
      'life-food-3-2': 'Wan Jia Fu (former Carrefour, Jincheng area)',
      'life-food-3-3': 'Jincheng shopping district (all-in-one supply + strolling)',
      'life-2-title': 'Getting Around',
      'life-bus-title': 'Bus',
      'life-bus-1': 'Requires <strong>online reservation</strong> — book the ride first',
      'life-bus-2': 'Wait at the <strong>school bus stop</strong> after booking',
      'life-bus-3': 'Schedule follows Kinmen County Bus Office announcements',
      'life-transport-title': 'Personal Transport',
      'life-transport-1': '<strong>Highly recommend getting a scooter</strong> — easiest way to move around 🛵',
      'life-transport-2': 'Reach campus surroundings and Jincheng / Jinhu easily',
      'life-transport-3': 'For rentals or second-hand scooters, ask seniors for shops',
      'life-leave-title': 'Off-island Transport',
      'life-leave-1': '<strong>Ferry → Xiamen</strong>: Mini Three Links route',
      'life-leave-2': '<strong>Airport → Taiwan</strong>: flights to major cities',
      'life-leave-3': 'Schedule based on airlines / shipping companies\' announcements',
      'life-3-title': 'Campus Facilities',
      'facility-1': 'Dormitory',
      'facility-1-desc': 'TBD: room types / fees / check-in info',
      'facility-2': 'Library',
      'facility-2-desc': 'TBD: hours / borrowing rules',
      'facility-3': 'Sports Field / Gym',
      'facility-3-desc': 'TBD: facility booking / hours',
      'facility-4': 'Student Cafeteria',
      'facility-4-desc': 'TBD: hours / food types',

      // Footer
      'footer-1': '🎓 NQU Department of Computer Science — Student Association',
      'footer-2': 'Making the first step of college life more solid, together.'
    }
  };

  /* ---------------------------------------------
     核心：切換語言
     --------------------------------------------- */
  function applyLang(lang) {
    if (!i18n[lang]) return;

    const dict = i18n[lang];
    const html = document.documentElement;
    html.lang = (lang === 'zh') ? 'zh-Hant' : 'en';

    // 純文字
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) el.textContent = dict[key];
      else if (key === 'page-desc') el.setAttribute('content', dict[key]);
    });

    // meta title（title 標籤需要特別處理，因為 data-i18n 預設會改 textContent）
    const titleEl = document.querySelector('title[data-i18n]');
    if (titleEl) {
      const k = titleEl.getAttribute('data-i18n');
      if (dict[k] !== undefined) document.title = dict[k];
    }

    // 含 HTML 標籤
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      const key = el.getAttribute('data-i18n-html');
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });

    // 更新切換按鈕狀態
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.lang === lang);
      btn.setAttribute('aria-pressed', btn.dataset.lang === lang ? 'true' : 'false');
    });

    // 儲存偏好
    try { localStorage.setItem('nqu-lang', lang); } catch (e) {}
  }

  /* ---------------------------------------------
     導覽列：捲動陰影 + 手機選單 + 錨點捲動
     --------------------------------------------- */
  const navbar    = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.querySelector('.nav-links');

  function onScroll() {
    if (window.scrollY > 8) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('open');
      });
    });
  }

  // 錨點捲動（避開 fixed 導覽列）
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId.length < 2) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const navHeight = navbar.offsetHeight || 70;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight + 1;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ---------------------------------------------
     FAQ 互動：開一個時自動收合其他
     --------------------------------------------- */
  document.querySelectorAll('.faq').forEach(function (faq) {
    faq.addEventListener('toggle', function () {
      if (!faq.open) return;
      const section = faq.closest('.grid') || faq.closest('section');
      if (!section) return;
      section.querySelectorAll('.faq[open]').forEach(function (other) {
        if (other !== faq) other.open = false;
      });
    });
  });

  /* ---------------------------------------------
     語言切換按鈕
     --------------------------------------------- */
  document.querySelectorAll('.lang-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyLang(btn.dataset.lang);
    });
  });

  // 載入時：先用 localStorage → 沒設定則偵測瀏覽器語言 → 預設中文
  let savedLang = null;
  try { savedLang = localStorage.getItem('nqu-lang'); } catch (e) {}
  if (!savedLang) {
    const browserLang = (navigator.language || '').toLowerCase();
    savedLang = browserLang.startsWith('zh') ? 'zh' : 'en';
  }
  applyLang(savedLang);
})();
