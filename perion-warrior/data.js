/* 페리온 전사 — 게임 데이터 (아이템·몬스터·스킬·맵·퀘스트). DOM 금지, node/브라우저 공용 */
(function (root) {
  'use strict';
  const D = {};

  /* ───────── 경험치 / 공식 ───────── */
  D.MAX_LV = 40; D.JOB_LV = 30;
  D.expToNext = (lv) => Math.round((9 * lv * lv + 12 * lv + 2) * (1 + lv / 20));
  D.monExp = (lv) => Math.round(1.5 * Math.pow(lv, 1.5) + 4);
  D.monHp = (lv) => Math.round(11 + 2.7 * Math.pow(lv, 1.95));

  /* ───────── 아이템 ───────── */
  const I = {};
  const add = (id, o) => { I[id] = Object.assign({ id }, o); };

  // 소비
  add('hp1', { n: '빨간 물약', t: 'use', icon: '🧪', col: '#e5484d', heal: 60, price: 30, desc: 'HP 60 회복' });
  add('hp2', { n: '주황 물약', t: 'use', icon: '🧪', col: '#f08a24', heal: 180, price: 90, desc: 'HP 180 회복' });
  add('hp3', { n: '하얀 물약', t: 'use', icon: '🧪', col: '#e9eef7', heal: 420, price: 240, desc: 'HP 420 회복' });
  add('hp4', { n: '고급 하얀 물약', t: 'use', icon: '🧪', col: '#cfe6ff', heal: 850, price: 560, desc: 'HP 850 회복' });
  add('mp1', { n: '파란 물약', t: 'use', icon: '💧', col: '#3e7bfa', mana: 40, price: 50, desc: 'MP 40 회복' });
  add('mp2', { n: '큰 파란 물약', t: 'use', icon: '💧', col: '#2b5fe0', mana: 150, price: 190, desc: 'MP 150 회복' });
  add('mp3', { n: '마나 엘릭서', t: 'use', icon: '💧', col: '#7a5cff', mana: 400, price: 520, desc: 'MP 400 회복' });
  add('scroll', { n: '마을 귀환 주문서', t: 'use', icon: '📜', col: '#d9c07a', town: true, price: 400, desc: '사용하면 페리온 마을로 순간이동' });

  // 강화 주문서 (착용 중인 장비에 사용)
  add('scW100', { n: '무기 공격력 주문서 100%', t: 'scroll', kind: 'weapon', rate: 1, mark: '공', icon: '📜', col: '#e8b04a', price: 450, desc: '착용 중인 무기의 공격력을 조금 올려요. 성공 확률 100%! 강화 가능 횟수가 1 줄어요.' });
  add('scA100', { n: '방어구 방어력 주문서 100%', t: 'scroll', kind: 'armor', rate: 1, mark: '방', icon: '📜', col: '#7fb0d8', price: 450, desc: '착용 중인 투구·갑옷·장갑·신발의 방어력을 조금 올려요. 성공 확률 100%!' });
  add('scW60', { n: '무기 공격력 주문서 60%', t: 'scroll', kind: 'weapon', rate: 0.6, mark: '공', icon: '📜', col: '#e5484d', price: 700, desc: '착용 중인 무기의 공격력을 올려요. 성공 확률 60%. 성공·실패와 상관없이 강화 가능 횟수가 1 줄어요. (무기 7회 · 한벌옷 10회 · 모자·장갑·신발 5회)' });
  add('scW10', { n: '무기 공격력 주문서 10%', t: 'scroll', kind: 'weapon', rate: 0.1, mark: '공', icon: '📜', col: '#ff8a2a', price: 1500, desc: '착용 중인 무기의 공격력을 크게 올려요. 성공 확률 10%. 보스에게서 얻을 수 있어요.' });
  add('scA60', { n: '방어구 방어력 주문서 60%', t: 'scroll', kind: 'armor', rate: 0.6, mark: '방', icon: '📜', col: '#3e7bfa', price: 700, desc: '착용 중인 투구·갑옷·장갑·신발의 방어력을 올려요. 성공 확률 60%.' });
  add('scA10', { n: '방어구 방어력 주문서 10%', t: 'scroll', kind: 'armor', rate: 0.1, mark: '방', icon: '📜', col: '#8a5cff', price: 1500, desc: '착용 중인 방어구의 방어력을 크게 올려요. 성공 확률 10%. 보스에게서 얻을 수 있어요.' });

  // 기타(팔기·퀘스트)
  const etc = (id, n, icon, price, col) => add(id, { n, t: 'etc', icon, price, col: col || '#8b8f9c', desc: '잡다한 전리품. 상점에 팔 수 있다.' });
  etc('shell', '달팽이 껍질', '🐚', 4, '#e9d6a8');
  etc('bshell', '파란 껍질', '🐚', 9, '#7bb8ff');
  etc('wood', '나무 조각', '🪵', 14, '#a47148');
  etc('axefrag', '도끼 파편', '🪓', 30, '#8f98a8');
  etc('maskpiece', '가면 조각', '🎭', 48, '#b4854a');
  etc('darkbark', '검은 나무껍질', '🌑', 70, '#4a3d52');
  etc('antleg', '개미 다리', '🦵', 90, '#7a3e2a');
  etc('antjaw', '병정 개미 턱', '🦷', 130, '#a8452d');
  etc('zfang', '좀비 이빨', '🦷', 175, '#8fb36a');
  etc('stonefrag', '돌 파편', '🪨', 210, '#9a9a9a');
  etc('ember', '불씨', '🔥', 260, '#ff8a3a');
  etc('golemcore', '골렘 조각', '💠', 340, '#6fd0e8');
  etc('treeheart', '고목의 심장', '💚', 900, '#4cc46a');
  etc('goldcore', '바위왕의 핵', '💎', 3000, '#ffd24a');
  etc('relic', '고대 골렘의 인장', '🗿', 0, '#ffd24a'); I.relic.desc = '시련의 탑 꼭대기 고대 상자에 잠들어 있던 인장.'; I.relic.q = true;
  I.stonefrag.q = true; I.axefrag.q = true; I.treeheart.q = true; I.goldcore.q = true;

  // 장비. slot: weapon/helmet/armor/gloves/shoes
  const eq = (id, n, slot, lv, o) => add(id, Object.assign({ n, t: 'equip', slot, lv, icon: ({ weapon: '⚔️', helmet: '⛑️', armor: '🥋', gloves: '🧤', shoes: '👢' })[slot], atk: 0, def: 0, str: 0, dex: 0, hp: 0 }, o));
  // 검 (한손, 빠름)
  eq('sw0', '낡은 검', 'weapon', 1, { wt: 'sword', atk: 14, spd: 0.42, rng: 58, price: 100, col: '#bfc7d1', desc: '평범한 한손검' });
  eq('sw1', '철검', 'weapon', 8, { wt: 'sword', atk: 22, spd: 0.42, rng: 58, price: 900, col: '#cfd6df', desc: '단단한 철로 만든 검' });
  eq('sw2', '강철 검', 'weapon', 14, { wt: 'sword', atk: 32, spd: 0.42, rng: 60, price: 3000, col: '#a9c8ee', desc: '날이 선 강철 검' });
  eq('sw3', '기사의 검', 'weapon', 20, { wt: 'sword', atk: 44, spd: 0.42, rng: 62, price: 8500, col: '#e9d28a', str: 3, desc: '기사단이 쓰는 금빛 손잡이 검' });
  eq('sw4', '미스릴 소드', 'weapon', 26, { wt: 'sword', atk: 58, spd: 0.42, rng: 64, price: 22000, col: '#9fe8ff', str: 5, dex: 3, desc: '푸른 빛이 도는 미스릴 검' });
  // 도끼 (한손, 느리고 셈)
  eq('ax1', '손도끼', 'weapon', 5, { wt: 'axe', atk: 21, spd: 0.52, rng: 56, price: 700, col: '#9aa3b2', desc: '느리지만 묵직한 손도끼' });
  eq('ax2', '전투 도끼', 'weapon', 12, { wt: 'axe', atk: 36, spd: 0.52, rng: 58, price: 3200, col: '#b0b8c6', desc: '전장에서 쓰는 도끼' });
  eq('ax3', '중량 도끼', 'weapon', 20, { wt: 'axe', atk: 54, spd: 0.52, rng: 60, price: 9800, col: '#c8d0dd', desc: '엄청 무거운 도끼' });
  eq('ax4', '바위 도끼', 'weapon', 27, { wt: 'axe', atk: 72, spd: 0.52, rng: 62, price: 26000, col: '#d9a15b', str: 4, desc: '골렘의 돌로 벼린 도끼' });
  // 대검 (양손, 가장 느리고 범위 넓음)
  eq('gs1', '대검', 'weapon', 10, { wt: 'great', atk: 34, spd: 0.62, rng: 74, price: 2400, col: '#c4ccd8', desc: '양손으로 휘두르는 큰 검' });
  eq('gs2', '철 대검', 'weapon', 18, { wt: 'great', atk: 58, spd: 0.62, rng: 78, price: 8800, col: '#d6dde8', desc: '두꺼운 철 대검' });
  eq('gs3', '용살검', 'weapon', 26, { wt: 'great', atk: 84, spd: 0.62, rng: 84, price: 30000, col: '#ff9c7a', str: 6, desc: '용도 벤다는 전설의 대검' });
  // 둔기 (한손, 페이지용)
  eq('mc0', '나무 망치', 'weapon', 1, { wt: 'mace', atk: 14, spd: 0.5, rng: 56, price: 100, col: '#a2754a', desc: '둔기의 기본, 나무 망치' });
  eq('mc1', '철 메이스', 'weapon', 8, { wt: 'mace', atk: 25, spd: 0.5, rng: 56, price: 1000, col: '#aab2bd', desc: '묵직한 철 곤봉' });
  eq('mc2', '전투 망치', 'weapon', 14, { wt: 'mace', atk: 38, spd: 0.5, rng: 58, price: 3300, col: '#b6bece', desc: '전장에서 쓰는 큰 망치' });
  eq('mc3', '가시 철퇴', 'weapon', 20, { wt: 'mace', atk: 56, spd: 0.5, rng: 60, price: 10000, col: '#cdd5e2', str: 2, desc: '가시가 박힌 무시무시한 철퇴' });
  eq('mc4', '배틀 해머', 'weapon', 27, { wt: 'mace', atk: 76, spd: 0.5, rng: 62, price: 27000, col: '#e8cf7a', str: 4, desc: '금빛 장식의 전쟁 망치' });
  // 창 (양손, 스피어맨용: 사거리 길고 2마리까지 관통)
  eq('sp0', '나무 창', 'weapon', 1, { wt: 'spear', atk: 15, spd: 0.55, rng: 72, price: 120, col: '#a2754a', desc: '창의 기본, 나무 창' });
  eq('sp1', '단창', 'weapon', 6, { wt: 'spear', atk: 26, spd: 0.55, rng: 76, price: 900, col: '#cfd6df', desc: '가볍고 빠른 철 단창' });
  eq('sp2', '철 창', 'weapon', 12, { wt: 'spear', atk: 40, spd: 0.55, rng: 80, price: 3400, col: '#b0b8c6', desc: '길고 단단한 철 창' });
  eq('sp3', '기사 창', 'weapon', 20, { wt: 'spear', atk: 60, spd: 0.55, rng: 84, price: 10000, col: '#e9d28a', str: 3, desc: '기사단의 금빛 창' });
  eq('sp4', '드래곤 랜스', 'weapon', 27, { wt: 'spear', atk: 86, spd: 0.55, rng: 90, price: 30000, col: '#ff9c7a', str: 5, dex: 3, desc: '용의 비늘로 벼린 전설의 창' });
  // 투구
  eq('hm1', '가죽 모자', 'helmet', 1, { def: 3, price: 150, col: '#a2754a', desc: '질긴 가죽 모자' });
  eq('hm2', '철 투구', 'helmet', 8, { def: 7, price: 1100, col: '#aab2bd', desc: '튼튼한 철 투구' });
  eq('hm3', '강철 투구', 'helmet', 15, { def: 12, price: 3800, col: '#8fb6e6', hp: 40, desc: '푸른 강철 투구' });
  eq('hm4', '기사 투구', 'helmet', 22, { def: 18, price: 11000, col: '#f1d37a', hp: 90, str: 2, desc: '붉은 깃털 장식 투구' });
  eq('hmz', '고대 골렘의 투구', 'helmet', 28, { def: 30, atk: 4, str: 6, dex: 6, hp: 300, slots: 10, price: 60000, col: '#d9b84a', desc: '시련의 탑을 정복한 자에게만 허락된 전설의 투구. 강화 가능 횟수 10회!' });
  // 갑옷
  eq('ar0', '천 옷', 'armor', 1, { def: 4, price: 80, col: '#c9b48a', desc: '모험가 기본 옷' });
  eq('ar1', '가죽 갑옷', 'armor', 5, { def: 9, price: 800, col: '#9b6a3f', desc: '가볍고 질긴 가죽 갑옷' });
  eq('ar2', '철 갑옷', 'armor', 12, { def: 16, price: 3300, col: '#9aa3b0', hp: 30, desc: '철판을 덧댄 갑옷' });
  eq('ar3', '강철 갑옷', 'armor', 20, { def: 26, price: 10000, col: '#7ea6d8', hp: 80, desc: '푸른 빛 강철 갑옷' });
  eq('ar4', '기사 갑옷', 'armor', 26, { def: 38, price: 28000, col: '#e8cf7a', hp: 150, str: 3, desc: '금빛 문장이 새겨진 갑옷' });
  // 장갑
  eq('gl1', '가죽 장갑', 'gloves', 5, { def: 2, price: 450, col: '#a2754a', desc: '손을 보호하는 장갑' });
  eq('gl2', '철 장갑', 'gloves', 12, { def: 5, atk: 1, price: 2000, col: '#aab2bd', desc: '철 조각을 단 장갑' });
  eq('gl3', '강철 건틀릿', 'gloves', 20, { def: 9, atk: 3, price: 7000, col: '#8fb6e6', desc: '묵직한 강철 건틀릿' });
  // 신발
  eq('sh1', '가죽 신발', 'shoes', 1, { def: 2, price: 200, col: '#8a5a34', desc: '평범한 가죽 신발' });
  eq('sh2', '철 장화', 'shoes', 10, { def: 5, price: 1700, col: '#98a0ac', desc: '발끝에 철을 댄 장화' });
  eq('sh3', '강철 장화', 'shoes', 18, { def: 9, price: 5800, col: '#7ea6d8', desc: '단단한 강철 장화' });
  eq('sh4', '기사의 장화', 'shoes', 24, { def: 13, dex: 3, price: 15000, col: '#e8cf7a', desc: '발걸음이 가벼운 장화' });
  D.ITEMS = I;

  /* ───────── 스킬 ───────── */
  D.SKILLS = {
    power: { n: '파워 스트라이크', icon: '💥', kind: 'atk', reqLv: 1, maxLv: 10, mp: (l) => 4 + Math.floor(l / 2), mult: (l) => 1.5 + 0.13 * l, targets: 1, rng: 76, cd: 0.7, fx: 'power',
      desc: (l) => `앞의 적 1명을 ${Math.round((1.5 + 0.13 * l) * 100)}% 위력으로 강타한다. (MP ${4 + Math.floor(l / 2)})` },
    slash: { n: '슬래시 블러스트', icon: '🌀', kind: 'atk', reqLv: 6, maxLv: 10, mp: (l) => 7 + l, mult: (l) => 1.05 + 0.08 * l, targets: 5, rng: 118, cd: 1.0, fx: 'slash',
      desc: (l) => `넓게 베어 최대 5명을 ${Math.round((1.05 + 0.08 * l) * 100)}% 위력으로 공격. (MP ${7 + l})` },
    ironbody: { n: '아이언 바디', icon: '🛡️', kind: 'buff', reqLv: 10, maxLv: 10, mp: (l) => 10 + l, cd: 1, dur: (l) => 30 + l * 6, buff: 'def', val: (l) => 8 + l * 4,
      desc: (l) => `${30 + l * 6}초 동안 방어력 +${8 + l * 4}. (MP ${10 + l})` },
    rage: { n: '분노의 함성', icon: '🔥', kind: 'buff', reqLv: 14, maxLv: 10, mp: (l) => 12 + l, cd: 1, dur: (l) => 30 + l * 6, buff: 'atk', val: (l) => 0.1 + l * 0.02,
      desc: (l) => `${30 + l * 6}초 동안 공격력 +${Math.round((0.1 + l * 0.02) * 100)}%. (MP ${12 + l})` },
    quake: { n: '대지 가르기', icon: '🌋', kind: 'atk', reqLv: 20, maxLv: 10, mp: (l) => 18 + l * 2, mult: (l) => 2.0 + 0.2 * l, targets: 8, rng: 190, cd: 4.5, fx: 'quake',
      desc: (l) => `땅을 내리쳐 넓은 범위를 ${Math.round((2.0 + 0.2 * l) * 100)}% 위력으로 강타. (MP ${18 + l * 2})` },
    mastery: { n: '무기 숙련', icon: '📘', kind: 'passive', reqLv: 4, maxLv: 10,
      desc: (l) => `최소 데미지 비율 ${Math.round((0.2 + l * 0.05) * 100)}% (최대 데미지는 그대로).` },
    toughness: { n: '체력 단련', icon: '❤️', kind: 'passive', reqLv: 8, maxLv: 10,
      desc: (l) => `최대 HP +${l * 4}%, HP 자연회복 증가.` },
  };
  // ── 2차 전직 (Lv 30 + 고대 골렘의 시련 완료) ──
  D.JOBS = {
    fighter: { n: '파이터', icon: '⚔️', col: '#ff9a6a', wts: ['sword', 'great'], wtn: '검·양손검', desc: '[검/양손검] 공격력이 가장 강한 공격형. 전 스킬 데미지가 올라가고, 강한 한 방(레이징 블로우)과 버서크로 보스를 녹인다.', bonus: '공격력 +8%' },
    page: { n: '페이지', icon: '🛡️', col: '#8fb6ff', wts: ['axe', 'mace'], wtn: '도끼·둔기', start: 'mc0', desc: '[도끼/둔기] 방어와 체력이 높은 탱커형. 파워 가드·방어 마스터리로 맞아도 버티며, 홀리 차지로 여러 마리를 쓸어낸다.', bonus: '방어력 +8, 최대 HP +8%' },
    spearman: { n: '스피어맨', icon: '🔱', col: '#7ae0a0', wts: ['spear'], wtn: '창', start: 'sp0', desc: '[창] 체력과 치명타가 좋은 사냥형. 드래곤 크러셔로 넓게 쓸고, 하이퍼 바디로 HP를 크게 늘린다.', bonus: '최대 HP +10%, 치명타 +3%' },
  };
  Object.assign(D.SKILLS, {
    rblow: { job: 'fighter', n: '레이징 블로우', icon: '🗡️', kind: 'atk', reqLv: 30, maxLv: 10, mp: (l) => 14 + l, mult: (l) => 2.6 + 0.25 * l, targets: 1, rng: 84, cd: 1.6, fx: 'power',
      desc: (l) => `혼신의 일격! 앞의 적 1명을 ${Math.round((2.6 + 0.25 * l) * 100)}% 위력으로 강타. (MP ${14 + l})` },
    berserk: { job: 'fighter', n: '버서크', icon: '😡', kind: 'buff', reqLv: 30, maxLv: 10, mp: (l) => 20 + l, cd: 1, dur: (l) => 40 + l * 5, buff: 'atk2', val: (l) => 0.15 + l * 0.03,
      desc: (l) => `${40 + l * 5}초 동안 공격력 +${Math.round((0.15 + l * 0.03) * 100)}% (분노의 함성과 중첩). (MP ${20 + l})` },
    fmastery: { job: 'fighter', n: '파이터 숙련', icon: '📕', kind: 'passive', reqLv: 30, maxLv: 10,
      desc: (l) => `공격력 +${l * 2}%, 최소 데미지 비율 +${l}%p.` },
    charge: { job: 'page', n: '홀리 차지', icon: '✨', kind: 'atk', reqLv: 30, maxLv: 10, mp: (l) => 16 + l, mult: (l) => 2.0 + 0.2 * l, targets: 4, rng: 110, cd: 2.0, fx: 'slash',
      desc: (l) => `성스러운 검기로 최대 4명을 ${Math.round((2.0 + 0.2 * l) * 100)}% 위력으로 공격. (MP ${16 + l})` },
    guard: { job: 'page', n: '파워 가드', icon: '🔰', kind: 'buff', reqLv: 30, maxLv: 10, mp: (l) => 20 + l, cd: 1, dur: (l) => 40 + l * 5, buff: 'def2', val: (l) => 20 + l * 6,
      desc: (l) => `${40 + l * 5}초 동안 방어력 +${20 + l * 6} (아이언 바디와 중첩). (MP ${20 + l})` },
    pmastery: { job: 'page', n: '방어 마스터리', icon: '📗', kind: 'passive', reqLv: 30, maxLv: 10,
      desc: (l) => `방어력 +${l * 3}, 최대 HP +${l * 2}%.` },
    crusher: { job: 'spearman', n: '드래곤 크러셔', icon: '🐉', kind: 'atk', reqLv: 30, maxLv: 10, mp: (l) => 20 + l, mult: (l) => 1.7 + 0.18 * l, targets: 7, rng: 150, cd: 2.5, fx: 'power',
      desc: (l) => `창을 휘둘러 앞의 넓은 범위 최대 7명을 ${Math.round((1.7 + 0.18 * l) * 100)}% 위력으로 공격. (MP ${20 + l})` },
    hyper: { job: 'spearman', n: '하이퍼 바디', icon: '💪', kind: 'buff', reqLv: 30, maxLv: 10, mp: (l) => 22 + l, cd: 1, dur: (l) => 40 + l * 5, buff: 'hp2', val: (l) => 0.1 + l * 0.02,
      desc: (l) => `${40 + l * 5}초 동안 최대 HP +${Math.round((0.1 + l * 0.02) * 100)}%. (MP ${22 + l})` },
    smastery: { job: 'spearman', n: '창 마스터리', icon: '📙', kind: 'passive', reqLv: 30, maxLv: 10,
      desc: (l) => `치명타 확률 +${(l * 1.5).toFixed(1)}%p, 최소 데미지 비율 +${l * 2}%p.` },
  });
  D.SKILL_ORDER = ['power', 'slash', 'ironbody', 'rage', 'quake', 'mastery', 'toughness', 'rblow', 'berserk', 'fmastery', 'charge', 'guard', 'pmastery', 'crusher', 'hyper', 'smastery'];

  /* ───────── 몬스터 ───────── */
  const M = {};
  // mon(id, 이름, 레벨, 외형, 옵션)
  const mon = (id, n, lv, art, o) => {
    const base = Object.assign({ id, n, lv, art, hp: D.monHp(lv), atk: Math.round(3 + lv * 3.7), def: Math.round(lv * 1.6), exp: D.monExp(lv), speed: 40, w: 30, h: 30, aggro: 150, drops: [], eq: [], boss: false, ai: 'walk' }, o);
    if (!base.mesos) { const k = lv >= 18 ? 1.5 : 1; base.mesos = [Math.round((lv * lv * 0.1 + lv * 1.8 + 3) * k), Math.round((lv * lv * 0.16 + lv * 2.8 + 6) * k)]; }
    M[id] = base;
  };
  mon('snail', '달팽이', 1, 'snail', { hp: 14, atk: 5, def: 0, exp: 5, speed: 18, w: 28, h: 20, aggro: 0, drops: [['shell', 0.55], ['hp1', 0.05]], eq: [['hm1', 0.012], ['sh1', 0.01]] });
  mon('bluesnail', '파란 달팽이', 3, 'snail', { hue: 'blue', hp: 36, atk: 12, def: 2, speed: 22, w: 30, h: 22, aggro: 0, exp: 11, drops: [['bshell', 0.5], ['hp1', 0.07], ['mp1', 0.03]], eq: [['ar1', 0.008], ['hm1', 0.01]] });
  mon('stump', '그루터기', 5, 'stump', { hp: 80, atk: 25, def: 5, speed: 34, w: 32, h: 30, aggro: 130, drops: [['wood', 0.5], ['hp1', 0.07], ['mp1', 0.05]], eq: [['ar1', 0.012], ['gl1', 0.012], ['ax1', 0.008]] });
  mon('axestump', '도끼 그루터기', 8, 'stump', { hue: 'axe', hp: 190, atk: 42, def: 12, speed: 42, w: 36, h: 34, aggro: 170, drops: [['axefrag', 0.5], ['wood', 0.35], ['hp2', 0.05], ['mp1', 0.05]], eq: [['sw1', 0.01], ['hm2', 0.012], ['sh2', 0.008]] });
  mon('woodmask', '나무 가면', 10, 'woodmask', { hp: 290, atk: 54, def: 16, speed: 52, w: 30, h: 40, aggro: 190, ai: 'hop', drops: [['maskpiece', 0.5], ['hp2', 0.06], ['mp1', 0.06]], eq: [['gs1', 0.008], ['ar2', 0.008], ['gl2', 0.008]] });
  mon('darkstump', '어두운 그루터기', 12, 'stump', { hue: 'dark', hp: 450, atk: 66, def: 22, speed: 56, w: 38, h: 36, aggro: 190, drops: [['darkbark', 0.5], ['hp2', 0.07], ['mp2', 0.03]], eq: [['ax2', 0.008], ['hm3', 0.008], ['sw2', 0.006]] });
  mon('ant', '개미', 13, 'ant', { hp: 540, atk: 66, def: 26, speed: 62, w: 34, h: 22, aggro: 170, drops: [['antleg', 0.5], ['hp2', 0.07], ['mp2', 0.04]], eq: [['sh2', 0.01], ['gl2', 0.008], ['ar2', 0.008]] });
  mon('soldierant', '병정 개미', 16, 'ant', { hue: 'soldier', hp: 820, atk: 78, def: 34, speed: 68, w: 36, h: 28, aggro: 200, drops: [['antjaw', 0.5], ['hp3', 0.05], ['mp2', 0.05]], eq: [['sw2', 0.008], ['hm3', 0.01], ['sh3', 0.008]] });
  mon('zombieant', '좀비 개미', 19, 'ant', { hue: 'zombie', hp: 1150, atk: 84, def: 44, speed: 50, w: 36, h: 28, aggro: 190, drops: [['zfang', 0.5], ['hp3', 0.06], ['mp2', 0.05]], eq: [['gs2', 0.008], ['ar3', 0.007], ['gl3', 0.007]] });
  mon('stonemask', '돌 가면', 20, 'woodmask', { hue: 'stone', hp: 1350, atk: 84, def: 52, speed: 60, w: 34, h: 42, ai: 'hop', aggro: 210, drops: [['stonefrag', 0.5], ['hp3', 0.07], ['mp3', 0.03]], eq: [['sw3', 0.007], ['ax3', 0.007], ['hm4', 0.006]] });
  mon('fireboar', '불 멧돼지', 23, 'boar', { hp: 1750, atk: 88, def: 60, speed: 62, w: 46, h: 32, ai: 'charge', aggro: 240, drops: [['ember', 0.5], ['hp3', 0.07], ['mp3', 0.04]], eq: [['sh3', 0.008], ['ar3', 0.007], ['sh4', 0.005]] });
  mon('stonegolem', '돌 골렘', 25, 'golem', { hp: 2400, atk: 92, def: 72, speed: 36, w: 48, h: 56, aggro: 200, drops: [['golemcore', 0.4], ['stonefrag', 0.35], ['hp4', 0.05], ['mp3', 0.05]], eq: [['ar4', 0.006], ['sw4', 0.005], ['gs3', 0.004]] });
  mon('firegolem', '불 골렘', 28, 'golem', { hue: 'fire', hp: 3100, atk: 108, def: 84, speed: 40, w: 50, h: 58, ai: 'shoot', aggro: 260, drops: [['golemcore', 0.45], ['ember', 0.4], ['hp4', 0.06], ['mp3', 0.05]], eq: [['ax4', 0.005], ['ar4', 0.006], ['hm4', 0.006]] });
  // 보스
  mon('bosstree', '고목 대장', 14, 'bosstree', { boss: true, ai: 'bosstree', hp: 14000, atk: 92, def: 30, exp: 700, speed: 30, w: 86, h: 110, aggro: 520, mesos: [900, 1500], drops: [['treeheart', 1], ['hp3', 1], ['hp3', 0.7], ['wood', 1]], eq: [['sw2', 0.35], ['ax2', 0.3], ['hm3', 0.3]] });
  mon('bossgolem', '바위왕 골렘', 30, 'bossgolem', { boss: true, ai: 'bossgolem', hp: 62000, atk: 185, def: 90, exp: 5200, speed: 30, w: 100, h: 126, aggro: 600, mesos: [9000, 14000], drops: [['goldcore', 1], ['hp4', 1], ['hp4', 0.8], ['mp3', 1]], eq: [['sw4', 0.3], ['gs3', 0.25], ['ar4', 0.3], ['ax4', 0.25]] });
  D.MON = M;
  // 주문서 드랍
  for (const id in M) { const m = M[id]; if (m.boss) continue; if (m.lv >= 3) m.drops.push(['scW100', 0.02], ['scA100', 0.02]); if (m.lv >= 8) m.drops.push(['scW60', 0.035], ['scA60', 0.035]); if (m.lv >= 14) m.drops.push(['scW10', 0.01], ['scA10', 0.01]); }
  M.bosstree.drops.push(['scW10', 1], ['scA10', 0.6]); M.bossgolem.drops.push(['scW10', 1], ['scA10', 1]);

  /* ───────── 맵 ───────── */
  const maps = {};
  const P = (x, y, w, solid) => ({ x, y, w, solid: !!solid });
  // 지형 헬퍼: 1번째는 항상 바닥(solid)
  maps.perion = {
    id: 'perion', n: '페리온', sub: '전사의 마을', lvTxt: '마을', town: true, w: 2600, h: 460, theme: 'town', bgm: 'town',
    plats: [P(0, 400, 2600, 1), P(1060, 330, 320), P(2020, 330, 300)],
    ladders: [{ x: 1120, y1: 330, y2: 400 }, { x: 2260, y1: 330, y2: 400 }],
    spawns: [],
    portals: [
      { id: 'toRock', x: 70, to: 'rock1', tx: 'back', label: '바위산 초입', lv: 'Lv 1~6', col: '#7ac' },
      { id: 'toAnt', x: 1650, to: 'ant1', tx: 'back', label: '개미굴', lv: 'Lv 12~19', col: '#c87' },
      { id: 'toQuarry', x: 2530, to: 'quarry', tx: 'back', label: '버려진 채석장', lv: 'Lv 20~28', col: '#da6' },
      { id: 'toTrial', x: 2420, to: 'trial', tx: 'back', label: '시련의 탑 (점프맵)', lv: 'Lv 26+', col: '#fd8' },
    ],
    npcs: [
      { id: 'elder', n: '촌장 도란', x: 430, role: 'quest', look: 'elder', quests: ['q1', 'q2', 'qp'] },
      { id: 'inn', n: '여관 주인 미라', x: 720, role: 'inn', look: 'innkeeper' },
      { id: 'potion', n: '잡화상 포포', x: 1010, role: 'shop', shop: 'potion', look: 'merchant' },
      { id: 'scribe', n: '주문서상 루나', x: 865, role: 'shop', shop: 'scroll', look: 'scribe' },
      { id: 'smith', n: '대장장이 바르크', x: 1250, y: 330, role: 'shop', shop: 'smith', look: 'smith' },
      { id: 'miner', n: '광부 반장 곡', x: 1480, role: 'quest', look: 'miner', quests: ['q3', 'q6'] },
      { id: 'captain', n: '경비대장 레온', x: 1900, role: 'quest', look: 'captain', quests: ['q4', 'q5', 'q7', 'q8'] },
      { id: 'master', n: '전사 교관 발도', x: 2180, y: 330, role: 'master', look: 'master', quests: ['q9'] },
    ],
  };
  maps.rock1 = {
    id: 'rock1', n: '페리온 바위산 초입', sub: '', lvTxt: 'Lv 1~6', w: 2200, h: 440, theme: 'rock', bgm: 'field',
    plats: [P(0, 400, 2200, 1), P(260, 332, 340), P(760, 332, 300), P(1240, 332, 340), P(1700, 332, 330), P(420, 264, 280), P(1100, 264, 260), P(1560, 264, 240)],
    ladders: [{ x: 1010, y1: 332, y2: 400 }],
    spawns: [{ m: 'snail', p: 0, n: 4 }, { m: 'bluesnail', p: 0, n: 3 }, { m: 'snail', p: 2, n: 2 }, { m: 'bluesnail', p: 1, n: 2 }, { m: 'stump', p: 3, n: 2 }, { m: 'stump', p: 6, n: 1 }, { m: 'bluesnail', p: 5, n: 2 }, { m: 'stump', p: 7, n: 1 }],
    portals: [{ id: 'back', x: 60, to: 'perion', tx: 'toRock', label: '페리온 마을' }, { id: 'next', x: 2140, to: 'rock2', tx: 'back', label: '바위산 중턱', lv: 'Lv 5~12' }],
    npcs: [],
  };
  maps.rock2 = {
    id: 'rock2', n: '페리온 바위산 중턱', sub: '', lvTxt: 'Lv 5~12', w: 2600, h: 520, theme: 'rock2', bgm: 'field',
    plats: [P(0, 460, 2600, 1), P(200, 392, 300), P(640, 392, 300), P(1080, 392, 320), P(1560, 392, 300), P(2000, 392, 320), P(380, 324, 260), P(900, 324, 240), P(1320, 324, 260), P(1800, 324, 260), P(620, 256, 260), P(1150, 256, 300), P(1650, 256, 240)],
    ladders: [{ x: 780, y1: 392, y2: 460 }, { x: 1700, y1: 392, y2: 460 }],
    spawns: [{ m: 'stump', p: 0, n: 3 }, { m: 'axestump', p: 0, n: 3 }, { m: 'axestump', p: 2, n: 2 }, { m: 'stump', p: 1, n: 2 }, { m: 'axestump', p: 4, n: 2 }, { m: 'stump', p: 6, n: 2 }, { m: 'axestump', p: 8, n: 2 }, { m: 'axestump', p: 9, n: 2 }, { m: 'axestump', p: 11, n: 2 }, { m: 'stump', p: 12, n: 1 }],
    portals: [{ id: 'back', x: 60, to: 'rock1', tx: 'next', label: '바위산 초입' }, { id: 'next', x: 2540, to: 'forest', tx: 'back', label: '고목의 숲', lv: 'Lv 9~14' }],
    npcs: [],
  };
  maps.forest = {
    id: 'forest', n: '고목의 숲', sub: '', lvTxt: 'Lv 9~14', w: 2400, h: 520, theme: 'forest', bgm: 'forest',
    plats: [P(0, 460, 2400, 1), P(180, 392, 280), P(600, 392, 300), P(1040, 392, 280), P(1500, 392, 320), P(1980, 392, 260), P(360, 324, 260), P(860, 324, 260), P(1380, 324, 240), P(1820, 324, 260), P(620, 256, 260), P(1160, 256, 280), P(1640, 256, 240)],
    ladders: [{ x: 760, y1: 392, y2: 460 }, { x: 1700, y1: 392, y2: 460 }],
    spawns: [{ m: 'woodmask', p: 0, n: 3 }, { m: 'darkstump', p: 0, n: 3 }, { m: 'axestump', p: 1, n: 2 }, { m: 'woodmask', p: 3, n: 2 }, { m: 'darkstump', p: 4, n: 2 }, { m: 'woodmask', p: 6, n: 2 }, { m: 'darkstump', p: 7, n: 2 }, { m: 'woodmask', p: 9, n: 2 }, { m: 'darkstump', p: 11, n: 2 }, { m: 'woodmask', p: 12, n: 1 }],
    portals: [{ id: 'back', x: 60, to: 'rock2', tx: 'next', label: '바위산 중턱' }, { id: 'next', x: 2340, to: 'bosstree', tx: 'back', label: '고목 대장의 둥지', lv: 'Lv 12+ 보스', col: '#8c6' }],
    npcs: [],
  };
  maps.bosstree = {
    id: 'bosstree', n: '고목 대장의 둥지', sub: '보스', lvTxt: 'Lv 12+ 보스', w: 1500, h: 460, theme: 'forest', bgm: 'boss', boss: 'bosstree', bossX: 1050,
    plats: [P(0, 400, 1500, 1), P(160, 330, 240), P(1100, 330, 240), P(640, 262, 220)],
    ladders: [{ x: 750, y1: 262, y2: 400 }],
    spawns: [],
    portals: [{ id: 'back', x: 60, to: 'forest', tx: 'next', label: '고목의 숲' }],
    npcs: [],
  };
  maps.ant1 = {
    id: 'ant1', n: '개미굴 입구', sub: '', lvTxt: 'Lv 12~19', w: 2400, h: 520, theme: 'cave', bgm: 'cave',
    plats: [P(0, 460, 2400, 1), P(220, 392, 300), P(700, 392, 280), P(1160, 392, 320), P(1660, 392, 300), P(2060, 392, 260), P(420, 324, 260), P(960, 324, 260), P(1440, 324, 240), P(1880, 324, 260), P(560, 256, 240), P(1240, 256, 260), P(1740, 256, 220)],
    ladders: [{ x: 300, y1: 392, y2: 460 }, { x: 1800, y1: 392, y2: 460 }],
    spawns: [{ m: 'ant', p: 0, n: 4 }, { m: 'soldierant', p: 0, n: 2 }, { m: 'ant', p: 1, n: 2 }, { m: 'ant', p: 3, n: 2 }, { m: 'soldierant', p: 4, n: 2 }, { m: 'ant', p: 6, n: 2 }, { m: 'soldierant', p: 7, n: 2 }, { m: 'ant', p: 9, n: 2 }, { m: 'soldierant', p: 11, n: 2 }, { m: 'ant', p: 12, n: 1 }],
    portals: [{ id: 'back', x: 60, to: 'perion', tx: 'toAnt', label: '페리온 마을' }, { id: 'next', x: 2340, to: 'ant2', tx: 'back', label: '개미굴 깊은 곳', lv: 'Lv 16~22' }],
    npcs: [],
  };
  maps.ant2 = {
    id: 'ant2', n: '개미굴 깊은 곳', sub: '', lvTxt: 'Lv 16~22', w: 2600, h: 560, theme: 'cave2', bgm: 'cave',
    plats: [P(0, 500, 2600, 1), P(200, 432, 300), P(660, 432, 300), P(1120, 432, 340), P(1640, 432, 300), P(2100, 432, 320), P(420, 364, 260), P(940, 364, 260), P(1400, 364, 260), P(1900, 364, 260), P(700, 296, 260), P(1240, 296, 280), P(1760, 296, 240), P(760, 228, 240)],
    ladders: [{ x: 260, y1: 432, y2: 500 }, { x: 1780, y1: 432, y2: 500 }],
    spawns: [{ m: 'soldierant', p: 0, n: 3 }, { m: 'zombieant', p: 0, n: 4 }, { m: 'zombieant', p: 2, n: 2 }, { m: 'soldierant', p: 3, n: 2 }, { m: 'zombieant', p: 5, n: 2 }, { m: 'zombieant', p: 6, n: 2 }, { m: 'zombieant', p: 7, n: 2 }, { m: 'soldierant', p: 8, n: 2 }, { m: 'zombieant', p: 10, n: 2 }, { m: 'zombieant', p: 11, n: 2 }, { m: 'zombieant', p: 13, n: 1 }],
    portals: [{ id: 'back', x: 60, to: 'ant1', tx: 'next', label: '개미굴 입구' }],
    npcs: [],
  };
  maps.quarry = {
    id: 'quarry', n: '버려진 채석장', sub: '', lvTxt: 'Lv 20~28', w: 2800, h: 560, theme: 'quarry', bgm: 'quarry',
    plats: [P(0, 500, 2800, 1), P(240, 432, 320), P(760, 432, 300), P(1280, 432, 340), P(1840, 432, 300), P(2340, 432, 320), P(480, 364, 280), P(1020, 364, 260), P(1560, 364, 260), P(2100, 364, 260), P(760, 296, 280), P(1340, 296, 280), P(1900, 296, 240), P(900, 228, 240)],
    ladders: [{ x: 900, y1: 432, y2: 500 }, { x: 2000, y1: 432, y2: 500 }],
    spawns: [{ m: 'stonemask', p: 0, n: 3 }, { m: 'fireboar', p: 0, n: 3 }, { m: 'stonegolem', p: 0, n: 2 }, { m: 'stonemask', p: 2, n: 2 }, { m: 'fireboar', p: 4, n: 2 }, { m: 'stonemask', p: 5, n: 2 }, { m: 'stonegolem', p: 7, n: 2 }, { m: 'fireboar', p: 8, n: 2 }, { m: 'stonegolem', p: 9, n: 1 }, { m: 'stonemask', p: 10, n: 2 }, { m: 'stonegolem', p: 11, n: 2 }, { m: 'firegolem', p: 13, n: 1 }],
    portals: [{ id: 'back', x: 60, to: 'perion', tx: 'toQuarry', label: '페리온 마을' }, { id: 'next', x: 2740, to: 'bossgolem', tx: 'back', label: '골렘 사원', lv: 'Lv 26+ 보스', col: '#c9c' }],
    npcs: [],
  };
  maps.bossgolem = {
    id: 'bossgolem', n: '골렘 사원', sub: '보스', lvTxt: 'Lv 26+ 보스', w: 1700, h: 460, theme: 'temple', bgm: 'boss', boss: 'bossgolem', bossX: 1180,
    plats: [P(0, 400, 1700, 1), P(180, 330, 240), P(1280, 330, 240), P(730, 262, 240)],
    ladders: [{ x: 840, y1: 262, y2: 400 }],
    spawns: [],
    portals: [{ id: 'back', x: 60, to: 'quarry', tx: 'next', label: '버려진 채석장' }],
    npcs: [],
  };
  // 점프맵: 시련의 탑 (몬스터 없음, 발판을 점프로 올라가 꼭대기 고대 상자까지)
  (function () {
    const pl = [P(0, 960, 1400, 1)]; let xc = 300, dir = 1, y = 960; const W = 96;
    for (let i = 0; i < 14; i++) { const nx = xc + dir * 150; if (nx > 1150 || nx < 250) dir = -dir; else xc = nx; y -= 60; pl.push(P(xc - W / 2, y, W)); }
    pl[pl.length - 1] = P(xc - 110, y, 220);
    maps.trial = { id: 'trial', n: '시련의 탑', sub: '점프맵', lvTxt: 'Lv 26+ 점프맵', w: 1400, h: 1000, theme: 'temple', bgm: 'boss', plats: pl, ladders: [], spawns: [],
      portals: [{ id: 'back', x: 60, to: 'perion', tx: 'toTrial', label: '페리온 마을' }],
      npcs: [{ id: 'chest', n: '고대 상자', x: xc, y, role: 'chest', look: 'chest' }] };
  })();
  D.MAPS = maps;

  /* ───────── 상점 ───────── */
  D.SHOPS = {
    potion: { n: '소비 상점', items: ['hp1', 'hp2', 'hp3', 'hp4', 'mp1', 'mp2', 'mp3', 'scroll'] },
    smith: { n: '장비 상점', items: ['sw1', 'ax1', 'gs1', 'mc1', 'sp1', 'sw2', 'ax2', 'gs2', 'mc2', 'sp2', 'mc3', 'sp3', 'hm1', 'hm2', 'hm3', 'ar1', 'ar2', 'ar3', 'gl1', 'gl2', 'gl3', 'sh1', 'sh2', 'sh3'] },
    scroll: { n: '주문서 상점 (100% 주문서만 판매)', items: ['scW100', 'scA100'] },
  };


  /* ───────── 퀘스트 ───────── */
  D.QUESTS = {
    q1: { n: '첫 사냥', npc: 'elder', lv: 1, pre: null,
      ask: '자네가 새로 온 전사 지망생인가? 페리온은 강한 전사를 환영하네.\n먼저 마을 서쪽 바위산 초입에서 **달팽이 5마리**를 잡아 실력을 보여주게!',
      doing: '바위산 초입은 마을 왼쪽 끝 포탈이라네. 공격 버튼으로 달팽이를 쓰러뜨리게!',
      done: '허허, 제법이군! 이건 약속한 보상일세. 다음엔 그루터기를 상대해 보게.',
      goals: [{ kill: 'snail', n: 5 }], reward: { exp: 40, meso: 120, items: [['hp1', 8]] } },
    q2: { n: '그루터기 소동', npc: 'elder', lv: 3, pre: 'q1',
      ask: '요즘 바위산에 그루터기들이 늘어 광부들이 곤란해하네.\n바위산 초입에서 **그루터기 10마리**를 처치해 주게. 무기가 약하면 대장장이 바르크에게 철검을 맞춰 가게나.',
      doing: '그루터기는 바위산 초입 위쪽 바위에 많이 있다네.',
      done: '정말 고맙네! 이 가죽 갑옷을 받게. 이제 바위산 중턱까지 가도 괜찮겠어.',
      goals: [{ kill: 'stump', n: 10 }], reward: { exp: 180, meso: 400, items: [['ar1', 1], ['hp1', 10], ['scW100', 2]] } },
    qp: { n: '길 잃은 새끼 멧돼지', npc: 'elder', lv: 5, pre: 'q2',
      ask: '바위산에서 어미를 잃은 새끼 멧돼지가 마을 근처를 맴돌고 있네. 배가 고픈가 봐.\n그루터기가 떨어뜨리는 **나무 조각 8개**를 모아 먹이로 주면 자네를 따를지도 모르지!\n\n🐾 **펫**이 생기면 메뉴 설정에서 **자동 물약**을 쓸 수 있다네.',
      doing: '나무 조각은 바위산의 그루터기가 가끔 떨어뜨리네. 8개를 모아 오게!',
      done: '오오, 먹이를 잘 먹는구먼! 녀석이 자네가 마음에 들었나 봐. **펫 멧돌이가 함께하네!**\n🐾 메뉴 ⚙️ 설정에서 자동 물약을 켜 보게.',
      goals: [{ item: 'wood', n: 8 }], reward: { exp: 260, meso: 500, items: [['hp1', 10], ['mp1', 5]], pet: '멧돌이' } },
    q3: { n: '광부의 부탁', npc: 'miner', lv: 8, pre: 'qp',
      ask: '어이, 전사 양반! 중턱 도끼 그루터기들 때문에 곡괭이가 계속 부러져.\n놈들이 떨어뜨리는 **도끼 파편 8개**를 모아다 줄 수 있나? 대신 튼튼한 투구를 주지.',
      doing: '도끼 그루터기는 바위산 중턱에 있어. 파편은 가끔 떨어지니 끈기있게!',
      done: '오오, 이 정도면 충분해! 약속한 철 투구다. 써 보라고!',
      goals: [{ item: 'axefrag', n: 8 }], reward: { exp: 600, meso: 900, items: [['hm2', 1], ['hp2', 8]] } },
    q4: { n: '고목 대장을 쓰러뜨려라', npc: 'captain', lv: 12, pre: 'q3',
      ask: '고목의 숲 깊은 곳에 거대한 \'고목 대장\'이 눌러앉았다. 놈이 숲을 오염시키고 있어.\n**고목 대장을 처치**하고 **고목의 심장**을 가져와라! 물약을 넉넉히 챙기는 게 좋을 거다.',
      doing: '고목의 숲 오른쪽 끝 포탈이 놈의 둥지로 이어진다. 놈은 땅을 내리치고 잎사귀를 쏟아낸다!',
      done: '해냈구나! 네 실력은 이제 경비대도 인정한다. 보상을 받아라.',
      goals: [{ kill: 'bosstree', n: 1 }, { item: 'treeheart', n: 1 }], reward: { exp: 2500, meso: 3000, items: [['sw2', 1], ['hp3', 10], ['mp2', 10], ['scW60', 3]] } },
    q5: { n: '개미굴 수색', npc: 'captain', lv: 13, pre: 'q4',
      ask: '마을 동쪽 개미굴에서 개미 떼가 몰려나오고 있다. 개미굴 입구에서 **개미 25마리**를 처치해 길을 열어줘라.',
      doing: '개미굴 포탈은 마을 중앙 오른쪽 돌문이다. 개미는 단단하니 방어 버프를 써라.',
      done: '좋다! 개미굴이 한결 조용해졌군. 이건 수고비다.',
      goals: [{ kill: 'ant', n: 25 }], reward: { exp: 3200, meso: 3500, items: [['hp3', 10], ['mp2', 10]] } },
    q6: { n: '병정 개미의 턱', npc: 'miner', lv: 16, pre: 'q5',
      ask: '개미굴 깊은 곳에 병정 개미들이 있다던데... 놈들의 단단한 **병정 개미 턱 10개**로 곡괭이를 만들면 최고급이 될 거야!',
      doing: '병정 개미는 개미굴 입구 윗층에도 나오고 깊은 곳에도 나와.',
      done: '이거야 이거! 이걸로 최고의 곡괭이를 만들겠어. 사례로 이 장갑을 줄게.',
      goals: [{ item: 'antjaw', n: 10 }], reward: { exp: 5200, meso: 5000, items: [['gl2', 1], ['hp3', 10]] } },
    q7: { n: '좀비 개미 퇴치', npc: 'captain', lv: 19, pre: 'q6',
      ask: '개미굴 깊은 곳에는 썩어가는 **좀비 개미**가 있다. **20마리**를 처치해 감염이 퍼지는 걸 막아라.',
      doing: '좀비 개미는 느리지만 아주 단단하다. 체력 관리를 잊지 마라.',
      done: '대단하군. 너라면 채석장도 맡길 수 있겠어. 이건 보상이다.',
      goals: [{ kill: 'zombieant', n: 20 }], reward: { exp: 9000, meso: 8000, items: [['hp4', 8], ['mp3', 8]] } },
    q8: { n: '바위왕 골렘', npc: 'captain', lv: 26, pre: 'q7',
      ask: '채석장 깊은 곳 골렘 사원의 \'바위왕 골렘\'이 깨어났다. 페리온 최대의 위협이다.\n**바위왕 골렘을 처치**하고 **바위왕의 핵**을 가져와라. 전사의 이름을 걸고!',
      doing: '채석장 오른쪽 끝 포탈이 사원으로 이어진다. 낙석과 충격파를 조심해라!',
      done: '…믿기지 않는군. 페리온의 영웅이 탄생했다! 2차 전직 소식은 발도 교관에게 들어봐라.',
      goals: [{ kill: 'bossgolem', n: 1 }, { item: 'goldcore', n: 1 }], reward: { exp: 20000, meso: 30000, items: [['ar4', 1], ['hp4', 20], ['mp3', 20], ['scW10', 1], ['scA10', 1]] } },
    q9: { n: '고대 골렘의 시련', npc: 'master', lv: 28, pre: 'q8',
      ask: '바위왕 골렘을 쓰러뜨렸다니, 대단하다! 하지만 전사의 길에는 끝이 없지.\n마을 오른쪽 끝의 **시련의 탑**은 점프 실력을 시험하는 곳이다. 몬스터는 없지만 발판이 좁고 높다.\n꼭대기 **고대 상자**에서 **고대 골렘의 인장**을 가져오면 전설의 투구를 내주겠다! (떨어져도 다치지 않으니 걱정 마라)',
      doing: '시련의 탑은 마을 맨 오른쪽 문 근처의 포탈이다. 발판 끝에서 점프하고, 위층으로 계속 올라가라!',
      done: '해냈구나! 이 투구는 고대 골렘의 힘이 깃든 전설의 투구다. 강화 횟수가 10회나 되니 아껴서 써라!',
      goals: [{ item: 'relic', n: 1 }], reward: { exp: 12000, meso: 20000, items: [['hmz', 1], ['scW10', 1]] } },
  };
  D.QUEST_ORDER = ['q1', 'q2', 'qp', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9'];

  root.DATA = D;
  if (typeof module !== 'undefined' && module.exports) module.exports = D;
})(typeof window !== 'undefined' ? window : globalThis);
