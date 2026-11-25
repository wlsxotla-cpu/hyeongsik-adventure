/* 페리온 전사 — 게임 데이터 (아이템·몬스터·스킬·맵·퀘스트). DOM 금지, node/브라우저 공용 */
(function (root) {
  'use strict';
  const D = {};

  /* ───────── 경험치 / 공식 ───────── */
  D.MAX_LV = 200; D.JOB_LV = 30; D.JOB3_LV = 70; D.JOB4_LV = 120; // 원작처럼 2차 30 · 3차 70 · 4차 120 · 만렙 200
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


  // ───────── 장비 주문서 확장: 30% 단계 · 능력치 주문서(힘/민첩/체력 ×4단계) · 황금 망치 · 혼돈의 주문서 ─────────
  add('scW30', { n: '무기 공격력 주문서 30%', t: 'scroll', kind: 'weapon', rate: 0.3, mark: '공', icon: '📜', col: '#ff6a3a', price: 1000, desc: '착용 중인 무기의 공격력을 꽤 올려요. 성공 확률 30%. 성공·실패와 상관없이 강화 가능 횟수가 1 줄어요.' });
  add('scA30', { n: '방어구 방어력 주문서 30%', t: 'scroll', kind: 'armor', rate: 0.3, mark: '방', icon: '📜', col: '#5a8cff', price: 1000, desc: '착용 중인 방어구의 방어력을 꽤 올려요. 성공 확률 30%. 성공·실패와 상관없이 강화 가능 횟수가 1 줄어요.' });
  { const ST = [['S', '힘', 'str', 'STR', '#e05a3a'], ['D', '민첩', 'dex', 'DEX', '#3ac07a'], ['H', '체력', 'hp', '최대 HP', '#e05a8a']], RT = [[100, 1, 700], [60, 0.6, 1400], [30, 0.3, 2800], [10, 0.1, 7000]];
    for (const [k, nm, kind, lab, col] of ST) for (const [pc, rate, price] of RT) add('sc' + k + pc, { n: nm + ' 주문서 ' + pc + '%', t: 'scroll', kind, rate, mark: nm[0], icon: '📜', col, price, desc: `모든 장비에 쓸 수 있어요. 성공하면 ${lab}이(가) 오르고, 성공·실패와 상관없이 강화 가능 횟수가 1 줄어요. 성공 확률 ${pc}%.` }); }
  add('scG', { n: '황금 망치', t: 'scroll', kind: 'hammer', rate: 1, mark: '망', icon: '🔨', col: '#ffd24a', price: 20000, desc: '장비의 강화 가능 횟수를 1 늘려요. 장비 하나에 2번까지만 쓸 수 있어요. 성공 확률 100%.' });
  add('scC60', { n: '혼돈의 주문서 60%', t: 'scroll', kind: 'chaos', rate: 0.6, mark: '혼', icon: '🌀', col: '#b05aff', price: 12000, desc: '모든 장비에 쓸 수 있어요. 성공하면 공격력/방어력·STR·DEX·HP가 제각각 오르거나 내려가요(도박!). 성공 확률 60%, 강화 가능 횟수가 1 줄어요. 보스에게서 얻을 수 있어요.' });

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
  etc('flamefrag', '불꽃 가면 조각', '🔥', 90, '#ff6a3a'); etc('lavahide', '용암 가죽', '🟠', 120, '#c4452d'); etc('magmacore', '마그마 핵', '🔴', 200, '#ff4a1a');
  etc('zeye', '자쿰의 불꽃 눈', '🔥', 0, '#ff7a2a'); I.zeye.desc = '자쿰의 이마에서 타오르던 불꽃 눈. 경비대장 레온이 찾는 증표.';
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
  // Lv30+ 불꽃 협곡 장비
  eq('sw5', '플레임 소드', 'weapon', 32, { wt: 'sword', atk: 74, spd: 0.42, rng: 66, price: 52000, col: '#ff8a5a', str: 6, dex: 4, desc: '불꽃이 일렁이는 검' });
  eq('ax5', '용암 도끼', 'weapon', 32, { wt: 'axe', atk: 92, spd: 0.52, rng: 64, price: 56000, col: '#ff7a3a', str: 5, desc: '식지 않는 용암으로 벼린 도끼' });
  eq('gs4', '화염 대검', 'weapon', 32, { wt: 'great', atk: 108, spd: 0.62, rng: 88, price: 60000, col: '#ff6a4a', str: 7, desc: '타오르는 양손 대검' });
  eq('mc5', '마그마 해머', 'weapon', 32, { wt: 'mace', atk: 96, spd: 0.5, rng: 64, price: 56000, col: '#ff9a4a', str: 5, desc: '마그마가 흐르는 거대한 망치' });
  eq('sp5', '용암 창', 'weapon', 32, { wt: 'spear', atk: 110, spd: 0.55, rng: 94, price: 60000, col: '#ff7a5a', str: 6, dex: 4, desc: '용암을 두른 장창' });
  eq('hm5', '마그마 투구', 'helmet', 31, { def: 26, hp: 140, str: 3, price: 30000, col: '#c4452d', desc: '식은 마그마로 굳힌 투구' });
  eq('ar5', '용암 갑옷', 'armor', 32, { def: 52, hp: 240, str: 4, price: 70000, col: '#d6502a', desc: '뜨거운 열기를 막아내는 갑옷' });
  eq('gl4', '용암 건틀릿', 'gloves', 30, { def: 14, atk: 4, price: 24000, col: '#e0603a', desc: '불꽃이 새겨진 건틀릿' });
  eq('sh5', '용암 장화', 'shoes', 30, { def: 16, dex: 4, price: 24000, col: '#d6502a', desc: '용암 위도 걷는 장화' });
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
  eq('hmk', '자쿰의 투구', 'helmet', 30, { def: 42, atk: 6, str: 8, dex: 8, hp: 450, slots: 10, price: 150000, col: '#ff7a2a', desc: '불꽃의 제단을 지키던 자쿰의 투구. 불타는 왕관이 달려 있다. 강화 가능 횟수 10회!' });

  // ───────── 오르비스 확장: 새 물약·재료·장비 ─────────
  add('hp5', { n: '엘릭서', t: 'use', icon: '🧪', col: '#ffe6f0', heal: 2200, price: 1500, desc: 'HP 2200 회복' });
  add('mp4', { n: '고급 마나 엘릭서', t: 'use', icon: '💧', col: '#9a7cff', mana: 1000, price: 1300, desc: 'MP 1000 회복' });
  etc('cloudfrag', '구름 가면 조각', '☁️', 140, '#cfe4ff'); etc('cloudhide', '구름 멧돼지 가죽', '🟦', 170, '#aac8ff'); etc('stormcore', '폭풍 핵', '🌩️', 260, '#ffe44a');
  etc('goldleg', '황금 개미 다리', '🟡', 220, '#d9a82a'); etc('windbark', '바람 나무껍질', '🍃', 230, '#9ad8c8'); etc('gargoylechip', '가고일 파편', '🗿', 280, '#7a6a9a');
  etc('icefrag', '얼음 조각', '❄️', 300, '#9ad8ff'); etc('iceboarhide', '서리 가죽', '🧊', 320, '#6ab0e8'); etc('frostcore', '서리 핵', '💠', 420, '#6ad8ff');
  etc('frostleg', '서리 개미 다리', '🔹', 350, '#8ad0ff'); etc('blizzbark', '눈보라 나무껍질', '🌨️', 360, '#7aa8c8'); etc('yeticore', '설인의 핵', '🔷', 520, '#4aa8ff');
  etc('balrogclaw', '크림슨 발록의 손톱', '🩸', 900, '#c43a3a'); etc('frostcrown', '얼음 군주의 증표', '👑', 0, '#9ad8ff');
  I.balrogclaw.desc = '오르비스행 배에 나타나는 크림슨 발록의 손톱.'; I.frostcrown.desc = '얼음 군주의 이마에서 떨어진 서리 증표.';
  // 4세대 (Lv40~45): 하늘 / 5세대 (Lv50~56): 서리
  eq('sw6', '천공의 검', 'weapon', 42, { wt: 'sword', atk: 98, spd: 0.42, rng: 68, price: 95000, col: '#a8d8ff', str: 7, dex: 5, desc: '구름 위에서 벼린 가벼운 검' });
  eq('ax6', '구름 도끼', 'weapon', 42, { wt: 'axe', atk: 120, spd: 0.52, rng: 66, price: 100000, col: '#d8e8ff', str: 6, desc: '구름을 가르는 도끼' });
  eq('gs5', '하늘 대검', 'weapon', 42, { wt: 'great', atk: 142, spd: 0.62, rng: 90, price: 110000, col: '#b8d8ff', str: 8, desc: '하늘을 닮은 양손 대검' });
  eq('mc6', '번개 해머', 'weapon', 42, { wt: 'mace', atk: 128, spd: 0.5, rng: 66, price: 100000, col: '#ffe86a', str: 6, desc: '번개가 깃든 망치' });
  eq('sp6', '바람 창', 'weapon', 42, { wt: 'spear', atk: 146, spd: 0.55, rng: 96, price: 110000, col: '#c8ecff', str: 7, dex: 5, desc: '바람을 가르는 장창' });
  eq('sw7', '서리 검', 'weapon', 52, { wt: 'sword', atk: 126, spd: 0.42, rng: 70, price: 210000, col: '#8ae8ff', str: 9, dex: 6, desc: '얼어붙은 달빛의 검' });
  eq('ax7', '빙하 도끼', 'weapon', 52, { wt: 'axe', atk: 154, spd: 0.52, rng: 68, price: 220000, col: '#a8e0ff', str: 8, desc: '빙하를 깎아 만든 도끼' });
  eq('gs6', '빙산 대검', 'weapon', 52, { wt: 'great', atk: 182, spd: 0.62, rng: 92, price: 240000, col: '#9ad0f0', str: 10, desc: '빙산처럼 거대한 대검' });
  eq('mc7', '얼음 해머', 'weapon', 52, { wt: 'mace', atk: 164, spd: 0.5, rng: 68, price: 220000, col: '#c0f0ff', str: 8, desc: '영원히 녹지 않는 얼음 망치' });
  eq('sp7', '빙룡 창', 'weapon', 52, { wt: 'spear', atk: 188, spd: 0.55, rng: 98, price: 240000, col: '#7ad8ff', str: 9, dex: 6, desc: '빙룡의 이빨로 만든 창' });
  eq('hm6', '구름 투구', 'helmet', 41, { def: 34, hp: 190, str: 4, price: 60000, col: '#d8e8ff', desc: '구름처럼 가벼운 투구' });
  eq('ar6', '천공 갑옷', 'armor', 42, { def: 74, hp: 330, str: 5, price: 130000, col: '#9ac4f0', desc: '하늘빛으로 빛나는 갑옷' });
  eq('gl5', '구름 장갑', 'gloves', 40, { def: 19, atk: 6, price: 50000, col: '#c8dcff', desc: '구름 결이 흐르는 장갑' });
  eq('sh6', '구름 장화', 'shoes', 40, { def: 21, dex: 5, price: 50000, col: '#b8d0f0', desc: '구름 위를 걷는 장화' });
  eq('hm7', '서리 투구', 'helmet', 51, { def: 46, hp: 260, str: 5, price: 120000, col: '#9ad8ff', desc: '서리가 낀 투구' });
  eq('ar7', '서리 갑옷', 'armor', 52, { def: 96, hp: 440, str: 6, price: 260000, col: '#6ab4e8', desc: '얼음 결정으로 만든 갑옷' });
  eq('gl6', '서리 장갑', 'gloves', 50, { def: 26, atk: 8, price: 100000, col: '#8ac8f0', desc: '손끝까지 시린 장갑' });
  eq('sh7', '서리 장화', 'shoes', 50, { def: 28, dex: 6, price: 100000, col: '#7ab8e0', desc: '눈 위에도 미끄러지지 않는 장화' });
  eq('hmb', '크림슨 발록의 투구', 'helmet', 45, { def: 48, atk: 7, str: 7, dex: 7, hp: 380, slots: 10, price: 220000, col: '#c43a3a', desc: '오르비스행 배를 습격한 크림슨 발록의 투구. 강화 가능 횟수 10회!' });
  eq('hmf', '얼음 군주의 왕관', 'helmet', 55, { def: 62, atk: 9, str: 10, dex: 10, hp: 650, slots: 10, price: 420000, col: '#9ad8ff', desc: '서리 왕좌를 지배한 얼음 군주의 왕관. 강화 가능 횟수 10회!' });
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
    fighter: { n4: '히어로', n3: '크루세이더', n: '파이터', icon: '⚔️', col: '#ff9a6a', wts: ['sword', 'great'], wtn: '검·양손검', desc: '[검/양손검] 공격력이 가장 강한 공격형. 전 스킬 데미지가 올라가고, 강한 한 방(레이징 블로우)과 버서크로 보스를 녹인다.', bonus: '공격력 +8%' },
    page: { n4: '팔라딘', n3: '나이트', n: '페이지', icon: '🛡️', col: '#8fb6ff', wts: ['axe', 'mace'], wtn: '도끼·둔기', start: 'mc0', desc: '[도끼/둔기] 방어와 체력이 높은 탱커형. 파워 가드·방어 마스터리로 맞아도 버티며, 홀리 차지로 여러 마리를 쓸어낸다.', bonus: '방어력 +8, 최대 HP +8%' },
    spearman: { n4: '다크나이트', n3: '드래곤나이트', n: '스피어맨', icon: '🔱', col: '#7ae0a0', wts: ['spear'], wtn: '창', start: 'sp0', desc: '[창] 체력과 치명타가 좋은 사냥형. 드래곤 크러셔로 넓게 쓸고, 하이퍼 바디로 HP를 크게 늘린다.', bonus: '최대 HP +10%, 치명타 +3%' },
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
    crusher: { job: 'spearman', n: '드래곤 크러셔', icon: '🐉', kind: 'atk', reqLv: 30, maxLv: 10, mp: (l) => 20 + l, mult: (l) => 1.2 + 0.14 * l, hits: 3, targets: 2, rng: 130, cd: 2.2, fx: 'power',
      desc: (l) => `창으로 앞의 적(최대 2명)을 3연속으로 찌른다. 한 번에 ${Math.round((1.2 + 0.14 * l) * 100)}% 위력 × 3타. (MP ${20 + l})` },
    hyper: { job: 'spearman', n: '하이퍼 바디', icon: '💪', kind: 'buff', reqLv: 30, maxLv: 10, mp: (l) => 22 + l, cd: 1, dur: (l) => 40 + l * 5, buff: 'hp2', val: (l) => 0.1 + l * 0.02,
      desc: (l) => `${40 + l * 5}초 동안 최대 HP +${Math.round((0.1 + l * 0.02) * 100)}%. (MP ${22 + l})` },
    smastery: { job: 'spearman', n: '창 마스터리', icon: '📙', kind: 'passive', reqLv: 30, maxLv: 10,
      desc: (l) => `치명타 확률 +${(l * 1.5).toFixed(1)}%p, 최소 데미지 비율 +${l * 2}%p.` },
  });
  // ── 3차 전직 (Lv 50 + 오르비스 시험 퀘스트): 크루세이더 / 나이트 / 드래곤나이트 ──
  Object.assign(D.SKILLS, {
    brandish: { job: 'fighter', tier: 3, n: '브랜디쉬', icon: '🌙', kind: 'atk', reqLv: 70, maxLv: 10, mp: (l) => 26 + l, mult: (l) => 2.2 + 0.18 * l, hits: 2, targets: 3, rng: 112, cd: 2.4, fx: 'power',
      desc: (l) => `검을 두 번 휘둘러 앞의 적 최대 3명을 ${Math.round((2.2 + 0.18 * l) * 100)}% 위력으로 2연타. (MP ${26 + l})` },
    soulroar: { job: 'fighter', tier: 3, n: '소울 로어', icon: '🐲', kind: 'buff', reqLv: 70, maxLv: 10, mp: (l) => 30 + l, cd: 1, dur: (l) => 50 + l * 5, buff: 'atk3', val: (l) => 0.2 + l * 0.03,
      desc: (l) => `${50 + l * 5}초 동안 공격력 +${Math.round((0.2 + l * 0.03) * 100)}% (다른 공격 버프와 중첩). (MP ${30 + l})` },
    fmaster3: { job: 'fighter', tier: 3, n: '크루세이더 숙련', icon: '📕', kind: 'passive', reqLv: 70, maxLv: 10,
      desc: (l) => `공격력 +${l * 1.5}%, 치명타 확률 +${l}%p.` },
    elcharge: { job: 'page', tier: 3, n: '엘리멘탈 차지', icon: '⚡', kind: 'atk', reqLv: 70, maxLv: 10, mp: (l) => 28 + l, mult: (l) => 3.4 + 0.26 * l, targets: 5, rng: 130, cd: 3.0, fx: 'slash',
      desc: (l) => `속성의 힘을 실은 일격으로 최대 5명을 ${Math.round((3.4 + 0.26 * l) * 100)}% 위력으로 공격. (MP ${28 + l})` },
    achilles: { job: 'page', tier: 3, n: '아킬레스', icon: '🏺', kind: 'buff', reqLv: 70, maxLv: 10, mp: (l) => 30 + l, cd: 1, dur: (l) => 50 + l * 5, buff: 'def3', val: (l) => 40 + l * 8,
      desc: (l) => `${50 + l * 5}초 동안 방어력 +${40 + l * 8} (다른 방어 버프와 중첩). (MP ${30 + l})` },
    pmaster3: { job: 'page', tier: 3, n: '나이트 숙련', icon: '📗', kind: 'passive', reqLv: 70, maxLv: 10,
      desc: (l) => `방어력 +${l * 4}, 최대 HP +${l * 2}%.` },
    dragonfury: { job: 'spearman', tier: 3, n: '드래곤 퓨리', icon: '🔥', kind: 'atk', reqLv: 70, maxLv: 10, mp: (l) => 32 + l, mult: (l) => 1.0 + 0.12 * l, hits: 4, targets: 2, rng: 135, cd: 3.2, fx: 'power',
      desc: (l) => `용의 힘으로 앞의 적(최대 2명)을 4연속 가격. 한 번에 ${Math.round((1.0 + 0.12 * l) * 100)}% 위력 × 4타. (MP ${32 + l})` },
    dragonblood: { job: 'spearman', tier: 3, n: '드래곤 블러드', icon: '🩸', kind: 'buff', reqLv: 70, maxLv: 10, mp: (l) => 30 + l, cd: 1, dur: (l) => 50 + l * 5, buff: 'atk4', val: (l) => 0.22 + l * 0.03,
      desc: (l) => `${50 + l * 5}초 동안 공격력 +${Math.round((0.22 + l * 0.03) * 100)}% (다른 공격 버프와 중첩). (MP ${30 + l})` },
    smaster3: { job: 'spearman', tier: 3, n: '드래곤 숙련', icon: '📙', kind: 'passive', reqLv: 70, maxLv: 10,
      desc: (l) => `치명타 확률 +${(l * 1.2).toFixed(1)}%p, 최소 데미지 비율 +${l * 2}%p.` },
  });
  // ── 3차 추가 스킬 (직업당 총 5개) ──
  Object.assign(D.SKILLS, {
    swordpanic: { job: 'fighter', tier: 3, n: '소드 패닉', icon: '💢', kind: 'atk', reqLv: 70, maxLv: 10, mp: (l) => 36 + l, mult: (l) => 7.5 + 0.6 * l, targets: 1, rng: 100, cd: 4.0, fx: 'power', desc: (l) => `혼신의 일격으로 앞의 적 1명을 ${Math.round((7.5 + 0.6 * l) * 100)}% 위력으로 강타. (MP ${36 + l})` },
    shout: { job: 'fighter', tier: 3, n: '샤우트', icon: '📢', kind: 'atk', reqLv: 70, maxLv: 10, mp: (l) => 40 + l, mult: (l) => 2.4 + 0.2 * l, targets: 8, rng: 170, cd: 5.5, fx: 'quake', desc: (l) => `크게 외쳐 주변 최대 8명을 ${Math.round((2.4 + 0.2 * l) * 100)}% 위력으로 공격. (MP ${40 + l})` },
    blast3: { job: 'page', tier: 3, n: '블래스트', icon: '☄️', kind: 'atk', reqLv: 70, maxLv: 10, mp: (l) => 36 + l, mult: (l) => 2.6 + 0.2 * l, hits: 3, targets: 1, rng: 120, cd: 4.0, fx: 'power', desc: (l) => `앞의 적을 3연속 가격. 한 번에 ${Math.round((2.6 + 0.2 * l) * 100)}% 위력 × 3타. (MP ${36 + l})` },
    guardwall: { job: 'page', tier: 3, n: '가드월', icon: '🧱', kind: 'buff', reqLv: 70, maxLv: 10, mp: (l) => 34 + l, cd: 1, dur: (l) => 40 + l * 4, buff: 'dr1', val: (l) => 0.2 + l * 0.02, desc: (l) => `${40 + l * 4}초 동안 받는 피해 ${Math.round((0.2 + l * 0.02) * 100)}% 감소. (MP ${34 + l})` },
    dragonroar: { job: 'spearman', tier: 3, n: '드래곤 로어', icon: '🐲', kind: 'atk', reqLv: 70, maxLv: 10, mp: (l) => 38 + l, mult: (l) => 2.8 + 0.22 * l, targets: 6, rng: 180, cd: 5.0, fx: 'quake', desc: (l) => `포효로 주변 최대 6명을 ${Math.round((2.8 + 0.22 * l) * 100)}% 위력으로 공격. (MP ${38 + l})` },
    dragonthrust: { job: 'spearman', tier: 3, n: '드래곤 스러스트', icon: '🏹', kind: 'atk', reqLv: 70, maxLv: 10, mp: (l) => 38 + l, mult: (l) => 1.6 + 0.14 * l, hits: 5, targets: 1, rng: 140, cd: 4.2, fx: 'power', desc: (l) => `창으로 앞의 적을 5연속 찌른다. 한 번에 ${Math.round((1.6 + 0.14 * l) * 100)}% 위력 × 5타. (MP ${38 + l})` },
  });
  // ── 4차 전직 (Lv 120 + 마가티아 시험): 히어로 / 팔라딘 / 다크나이트, 직업당 5개 ──
  Object.assign(D.SKILLS, {
    rageupper: { job: 'fighter', tier: 4, n: '레이지 어퍼', icon: '🗡️', kind: 'atk', reqLv: 120, maxLv: 10, mp: (l) => 48 + l, mult: (l) => 2.6 + 0.2 * l, hits: 6, targets: 2, rng: 130, cd: 3.5, fx: 'power', desc: (l) => `앞의 적(최대 2명)을 6연속 베어 올린다. 한 번에 ${Math.round((2.6 + 0.2 * l) * 100)}% 위력 × 6타. (MP ${48 + l})` },
    swordflash: { job: 'fighter', tier: 4, n: '소드 플래시', icon: '⚡', kind: 'atk', reqLv: 120, maxLv: 10, mp: (l) => 56 + l, mult: (l) => 3.6 + 0.3 * l, targets: 10, rng: 210, cd: 6.0, fx: 'quake', desc: (l) => `검기를 사방으로 터뜨려 최대 10명을 ${Math.round((3.6 + 0.3 * l) * 100)}% 위력으로 공격. (MP ${56 + l})` },
    enrage: { job: 'fighter', tier: 4, n: '인레이지', icon: '😤', kind: 'buff', reqLv: 120, maxLv: 10, mp: (l) => 50 + l, cd: 1, dur: (l) => 60 + l * 5, buff: 'atk5', val: (l) => 0.35 + l * 0.04, desc: (l) => `${60 + l * 5}초 동안 공격력 +${Math.round((0.35 + l * 0.04) * 100)}% (다른 공격 버프와 중첩). (MP ${50 + l})` },
    stance: { job: 'fighter', tier: 4, n: '가디언 스탠스', icon: '🛡️', kind: 'buff', reqLv: 120, maxLv: 10, mp: (l) => 50 + l, cd: 1, dur: (l) => 60 + l * 5, buff: 'dr2', val: (l) => 0.25 + l * 0.02, desc: (l) => `${60 + l * 5}초 동안 받는 피해 ${Math.round((0.25 + l * 0.02) * 100)}% 감소. (MP ${50 + l})` },
    herowill: { job: 'fighter', tier: 4, n: '히어로의 의지', icon: '📕', kind: 'passive', reqLv: 120, maxLv: 10, desc: (l) => `공격력 +${l * 2}%, 치명타 확률 +${l}%p.` },
    holymace: { job: 'page', tier: 4, n: '성스러운 철퇴', icon: '🔨', kind: 'atk', reqLv: 120, maxLv: 10, mp: (l) => 48 + l, mult: (l) => 2.7 + 0.2 * l, hits: 6, targets: 2, rng: 130, cd: 3.5, fx: 'slash', desc: (l) => `성스러운 힘으로 앞의 적(최대 2명)을 6연속 내려친다. 한 번에 ${Math.round((2.7 + 0.2 * l) * 100)}% 위력 × 6타. (MP ${48 + l})` },
    holyblast: { job: 'page', tier: 4, n: '신성한 폭발', icon: '💥', kind: 'atk', reqLv: 120, maxLv: 10, mp: (l) => 56 + l, mult: (l) => 3.5 + 0.3 * l, targets: 10, rng: 210, cd: 6.0, fx: 'quake', desc: (l) => `신성한 폭발로 최대 10명을 ${Math.round((3.5 + 0.3 * l) * 100)}% 위력으로 공격. (MP ${56 + l})` },
    blessing: { job: 'page', tier: 4, n: '블레싱', icon: '🙏', kind: 'buff', reqLv: 120, maxLv: 10, mp: (l) => 50 + l, cd: 1, dur: (l) => 60 + l * 5, buff: 'atk6', val: (l) => 0.3 + l * 0.03, desc: (l) => `${60 + l * 5}초 동안 공격력 +${Math.round((0.3 + l * 0.03) * 100)}% (다른 공격 버프와 중첩). (MP ${50 + l})` },
    guardian: { job: 'page', tier: 4, n: '가디언', icon: '🏰', kind: 'buff', reqLv: 120, maxLv: 10, mp: (l) => 50 + l, cd: 1, dur: (l) => 60 + l * 5, buff: 'def4', val: (l) => 100 + l * 12, desc: (l) => `${60 + l * 5}초 동안 방어력 +${100 + l * 12} (다른 방어 버프와 중첩). (MP ${50 + l})` },
    paladinwill: { job: 'page', tier: 4, n: '팔라딘의 의지', icon: '📗', kind: 'passive', reqLv: 120, maxLv: 10, desc: (l) => `방어력 +${l * 6}, 최대 HP +${l * 3}%.` },
    darkspear: { job: 'spearman', tier: 4, n: '다크 스피어', icon: '🌑', kind: 'atk', reqLv: 120, maxLv: 10, mp: (l) => 48 + l, mult: (l) => 2.2 + 0.18 * l, hits: 7, targets: 2, rng: 145, cd: 3.5, fx: 'power', desc: (l) => `어둠의 창으로 앞의 적(최대 2명)을 7연속 꿰뚫는다. 한 번에 ${Math.round((2.2 + 0.18 * l) * 100)}% 위력 × 7타. (MP ${48 + l})` },
    cataclysm: { job: 'spearman', tier: 4, n: '대재앙', icon: '🌋', kind: 'atk', reqLv: 120, maxLv: 10, mp: (l) => 56 + l, mult: (l) => 3.6 + 0.3 * l, targets: 10, rng: 210, cd: 6.0, fx: 'quake', desc: (l) => `대지를 가르는 재앙으로 최대 10명을 ${Math.round((3.6 + 0.3 * l) * 100)}% 위력으로 공격. (MP ${56 + l})` },
    beholder: { job: 'spearman', tier: 4, n: '비홀더', icon: '👁️', kind: 'buff', reqLv: 120, maxLv: 10, mp: (l) => 50 + l, cd: 1, dur: (l) => 60 + l * 5, buff: 'atk7', val: (l) => 0.34 + l * 0.04, desc: (l) => `${60 + l * 5}초 동안 공격력 +${Math.round((0.34 + l * 0.04) * 100)}% (다른 공격 버프와 중첩). (MP ${50 + l})` },
    revenge: { job: 'spearman', tier: 4, n: '복수', icon: '🔥', kind: 'buff', reqLv: 120, maxLv: 10, mp: (l) => 50 + l, cd: 1, dur: (l) => 60 + l * 5, buff: 'dr3', val: (l) => 0.25 + l * 0.02, desc: (l) => `${60 + l * 5}초 동안 받는 피해 ${Math.round((0.25 + l * 0.02) * 100)}% 감소. (MP ${50 + l})` },
    dkwill: { job: 'spearman', tier: 4, n: '다크나이트의 의지', icon: '📙', kind: 'passive', reqLv: 120, maxLv: 10, desc: (l) => `치명타 확률 +${(l * 1.5).toFixed(1)}%p, 최소 데미지 비율 +${l * 2}%p.` },
  });
  D.SKILL_ORDER = ['power', 'slash', 'ironbody', 'rage', 'quake', 'mastery', 'toughness', 'rblow', 'berserk', 'fmastery', 'charge', 'guard', 'pmastery', 'crusher', 'hyper', 'smastery', 'brandish', 'soulroar', 'fmaster3', 'elcharge', 'achilles', 'pmaster3', 'dragonfury', 'dragonblood', 'smaster3', 'swordpanic', 'shout', 'blast3', 'guardwall', 'dragonroar', 'dragonthrust', 'rageupper', 'swordflash', 'enrage', 'stance', 'herowill', 'holymace', 'holyblast', 'blessing', 'guardian', 'paladinwill', 'darkspear', 'cataclysm', 'beholder', 'revenge', 'dkwill'];

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
  mon('bosstree', '고목 대장', 14, 'bosstree', { boss: true, ai: 'bosstree', hp: 28000, atk: 130, def: 30, exp: 700, speed: 30, w: 86, h: 110, aggro: 520, mesos: [900, 1500], drops: [['treeheart', 1], ['hp3', 1], ['hp3', 0.7], ['wood', 1]], eq: [['sw2', 0.35], ['ax2', 0.3], ['hm3', 0.3]] });
  mon('lavamask', '불꽃 가면', 30, 'woodmask', { hue: 'flame', hp: 3700, atk: 112, def: 90, speed: 62, w: 34, h: 42, ai: 'hop', aggro: 220, drops: [['flamefrag', 0.5], ['hp4', 0.07], ['mp3', 0.05]], eq: [['gl4', 0.01], ['hm5', 0.008], ['sw5', 0.005]] });
  mon('lavaboar', '용암 멧돼지', 32, 'boar', { hue: 'lava', hp: 4600, atk: 124, def: 100, speed: 66, w: 48, h: 34, ai: 'charge', aggro: 250, drops: [['lavahide', 0.5], ['hp4', 0.07], ['mp3', 0.05]], eq: [['sh5', 0.01], ['ax5', 0.005], ['mc5', 0.005]] });
  mon('magmagolem', '마그마 골렘', 34, 'golem', { hue: 'lava', hp: 5900, atk: 136, def: 114, speed: 40, w: 52, h: 60, ai: 'shoot', aggro: 270, drops: [['magmacore', 0.45], ['golemcore', 0.2], ['hp4', 0.07], ['mp3', 0.06]], eq: [['ar5', 0.007], ['gs4', 0.005], ['sp5', 0.005], ['hm5', 0.008]] });

  // ───────── 오르비스 확장 몬스터 ─────────
  mon('skymask', '구름 가면', 40, 'woodmask', { hue: 'sky', hp: 9200, atk: 168, def: 145, speed: 66, w: 34, h: 44, ai: 'hop', aggro: 230, drops: [['cloudfrag', 0.5], ['hp5', 0.06], ['mp4', 0.05]], eq: [['gl5', 0.01], ['hm6', 0.008], ['sw6', 0.005]] });
  mon('cloudboar', '구름 멧돼지', 42, 'boar', { hue: 'cloud', hp: 11000, atk: 180, def: 155, speed: 70, w: 48, h: 34, ai: 'charge', aggro: 260, drops: [['cloudhide', 0.5], ['hp5', 0.06], ['mp4', 0.05]], eq: [['sh6', 0.01], ['ax6', 0.005], ['mc6', 0.005]] });
  mon('stormgolem', '폭풍 골렘', 44, 'golem', { hue: 'storm', hp: 14500, atk: 195, def: 170, speed: 42, w: 52, h: 60, ai: 'shoot', aggro: 280, drops: [['stormcore', 0.45], ['hp5', 0.07], ['mp4', 0.06]], eq: [['ar6', 0.007], ['gs5', 0.005], ['sp6', 0.005], ['hm6', 0.008]] });
  mon('goldant', '황금 개미', 45, 'ant', { hue: 'gold', hp: 15500, atk: 200, def: 175, speed: 74, w: 38, h: 28, aggro: 240, drops: [['goldleg', 0.5], ['hp5', 0.06], ['mp4', 0.05]], eq: [['gl5', 0.01], ['sh6', 0.01], ['sw6', 0.005]] });
  mon('windstump', '바람 그루터기', 47, 'stump', { hue: 'sky', hp: 18000, atk: 210, def: 185, speed: 60, w: 40, h: 38, aggro: 230, drops: [['windbark', 0.5], ['hp5', 0.06], ['mp4', 0.05]], eq: [['hm6', 0.008], ['ar6', 0.006], ['mc6', 0.005]] });
  mon('gargoyle', '가고일', 49, 'woodmask', { hue: 'shadow', hp: 21000, atk: 222, def: 198, speed: 72, w: 38, h: 46, ai: 'hop', aggro: 260, drops: [['gargoylechip', 0.5], ['hp5', 0.07], ['mp4', 0.06]], eq: [['ar6', 0.007], ['gs5', 0.005], ['sp6', 0.005]] });
  mon('icemask', '얼음 가면', 48, 'woodmask', { hue: 'ice', hp: 19500, atk: 215, def: 190, speed: 70, w: 36, h: 44, ai: 'hop', aggro: 250, drops: [['icefrag', 0.5], ['hp5', 0.06], ['mp4', 0.05]], eq: [['gl6', 0.01], ['hm7', 0.008], ['sw7', 0.005]] });
  mon('frostboar', '서리 멧돼지', 50, 'boar', { hue: 'ice', hp: 23000, atk: 232, def: 205, speed: 74, w: 50, h: 36, ai: 'charge', aggro: 270, drops: [['iceboarhide', 0.5], ['hp5', 0.06], ['mp4', 0.05]], eq: [['sh7', 0.01], ['ax7', 0.005], ['mc7', 0.005]] });
  mon('icegolem', '얼음 골렘', 52, 'golem', { hue: 'ice', hp: 28000, atk: 250, def: 220, speed: 44, w: 54, h: 62, ai: 'shoot', aggro: 290, drops: [['frostcore', 0.45], ['icefrag', 0.3], ['hp5', 0.07], ['mp4', 0.06]], eq: [['ar7', 0.007], ['gs6', 0.005], ['sp7', 0.005], ['hm7', 0.008]] });
  mon('frostant', '서리 개미', 53, 'ant', { hue: 'ice', hp: 30000, atk: 255, def: 225, speed: 78, w: 40, h: 30, aggro: 260, drops: [['frostleg', 0.5], ['hp5', 0.06], ['mp4', 0.05]], eq: [['gl6', 0.01], ['sh7', 0.01], ['sw7', 0.005]] });
  mon('blizzstump', '눈보라 그루터기', 55, 'stump', { hue: 'ice', hp: 35000, atk: 270, def: 240, speed: 64, w: 42, h: 40, aggro: 250, drops: [['blizzbark', 0.5], ['hp5', 0.06], ['mp4', 0.05]], eq: [['hm7', 0.008], ['ar7', 0.006], ['mc7', 0.005]] });
  mon('yeti', '설인 골렘', 57, 'golem', { hue: 'ice', hp: 44000, atk: 295, def: 262, speed: 46, w: 62, h: 70, ai: 'shoot', aggro: 300, drops: [['yeticore', 0.45], ['frostcore', 0.2], ['hp5', 0.07], ['mp4', 0.06]], eq: [['ar7', 0.007], ['gs6', 0.005], ['sp7', 0.005], ['ax7', 0.005]] });
  mon('balrog', '크림슨 발록', 45, 'balrog', { boss: true, ai: 'bossbalrog', hp: 200000, atk: 340, def: 150, exp: 32000, speed: 30, w: 120, h: 150, aggro: 700, mesos: [30000, 45000], drops: [['balrogclaw', 1], ['hp5', 1], ['hp5', 0.8], ['mp4', 1]], eq: [['hmb', 0.25], ['sw6', 0.3], ['gs5', 0.25], ['ar6', 0.3], ['ax6', 0.25], ['mc6', 0.25], ['sp6', 0.25]] });
  mon('frostlord', '얼음 군주', 58, 'frostlord', { boss: true, ai: 'bossfrost', hp: 430000, atk: 410, def: 270, exp: 80000, speed: 28, w: 130, h: 150, aggro: 800, mesos: [60000, 90000], drops: [['frostcrown', 1], ['hp5', 1], ['hp5', 0.8], ['mp4', 1]], eq: [['hmf', 0.2], ['sw7', 0.3], ['gs6', 0.25], ['ar7', 0.3], ['ax7', 0.25], ['mc7', 0.25], ['sp7', 0.25]] });
  M.balrog.drops.push(['scW10', 1], ['scA10', 1], ['scW60', 1], ['scC60', 0.5], ['scG', 0.3]); M.frostlord.drops.push(['scW10', 2], ['scA10', 2], ['scW60', 2], ['scC60', 1], ['scG', 0.6], ['scS10', 0.5], ['scD10', 0.5], ['scH10', 0.5]);
  mon('zakum', '자쿰', 32, 'zakum', { boss: true, ai: 'bosszakum', hp: 210000, atk: 320, def: 105, exp: 12000, speed: 28, w: 120, h: 140, aggro: 700, mesos: [16000, 24000], drops: [['zeye', 1], ['hp4', 1], ['hp4', 0.8], ['mp3', 1]], eq: [['hmk', 0.2], ['sw4', 0.3], ['gs3', 0.3], ['ar4', 0.3], ['ax4', 0.2], ['mc4', 0.2], ['sp4', 0.2]] });
  mon('bossgolem', '바위왕 골렘', 30, 'bossgolem', { boss: true, ai: 'bossgolem', hp: 115000, atk: 245, def: 90, exp: 5200, speed: 30, w: 100, h: 126, aggro: 600, mesos: [9000, 14000], drops: [['goldcore', 1], ['hp4', 1], ['hp4', 0.8], ['mp3', 1]], eq: [['sw4', 0.3], ['gs3', 0.25], ['ar4', 0.3], ['ax4', 0.25]] });
  D.MON = M;
  // 주문서 드랍
  // 주문서 드랍 규칙 (생성된 몬스터도 같은 함수를 쓴다)
  const scrollDrops = (m) => {
    if (m.lv >= 3) m.drops.push(['scW100', 0.02], ['scA100', 0.02]); if (m.lv >= 8) m.drops.push(['scW60', 0.035], ['scA60', 0.035]); if (m.lv >= 14) m.drops.push(['scW10', 0.01], ['scA10', 0.01]);
    if (m.lv >= 20) m.drops.push(['scS100', 0.015], ['scD100', 0.015], ['scH100', 0.015]); if (m.lv >= 30) m.drops.push(['scS60', 0.01], ['scD60', 0.01], ['scH60', 0.01]);
    if (m.lv >= 40) m.drops.push(['scW30', 0.012], ['scA30', 0.012], ['scS30', 0.006], ['scD30', 0.006], ['scH30', 0.006]); if (m.lv >= 55) m.drops.push(['scS10', 0.003], ['scD10', 0.003], ['scH10', 0.003], ['scG', 0.003]); if (m.lv >= 60) m.drops.push(['scC60', 0.004]);
  };
  for (const id in M) { const m = M[id]; if (m.boss) continue; scrollDrops(m); }
  M.bosstree.drops.push(['scW10', 1], ['scA10', 0.6]); M.bossgolem.drops.push(['scW10', 1], ['scA10', 1]); M.zakum.drops.push(['scW10', 1], ['scA10', 1], ['scW60', 1]);

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
      { id: 'toPort', x: 2330, to: 'port', tx: 'back', label: '페리온 항구', lv: '오르비스행', col: '#5cf' },
      { id: 'toTrial', x: 2420, to: 'trial', tx: 'back', label: '시련의 탑 (점프맵)', lv: 'Lv 26+', col: '#fd8' },
    ],
    npcs: [
      { id: 'elder', n: '촌장 도란', x: 430, role: 'quest', look: 'elder', quests: ['q1', 'qa', 'q2', 'qb', 'qp'] },
      { id: 'inn', n: '여관 주인 미라', x: 720, role: 'inn', look: 'innkeeper', quests: ['qi1'] },
      { id: 'potion', n: '잡화상 포포', x: 1010, role: 'shop', shop: 'potion', look: 'merchant', quests: ['qpo1'] },
      { id: 'scribe', n: '주문서상 루나', x: 865, role: 'shop', shop: 'scroll', look: 'scribe', quests: ['qsc1'] },
      { id: 'smith', n: '대장장이 바르크', x: 1250, y: 330, role: 'shop', shop: 'smith', look: 'smith', quests: ['qs1', 'qs2', 'qs3'] },
      { id: 'miner', n: '광부 반장 곡', x: 1480, role: 'quest', look: 'miner', quests: ['q3', 'qm2', 'q6', 'qm3', 'qm4', 'qv3', 'qh3'] },
      { id: 'captain', n: '경비대장 레온', x: 1900, role: 'quest', look: 'captain', quests: ['q4', 'q5', 'qc2', 'q7', 'qc3', 'q8', 'qc4', 'qv1', 'qv2', 'qz', 'qh1', 'qh2', 'qh4'] },
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
    portals: [{ id: 'back', x: 60, to: 'ant1', tx: 'next', label: '개미굴 입구' }, { id: 'hid', x: 880, y: 228, to: 'hiddenA', tx: 'back', label: '숨겨진 갱도', hidden: true, col: '#b8f' }],
    npcs: [],
  };
  maps.quarry = {
    id: 'quarry', n: '버려진 채석장', sub: '', lvTxt: 'Lv 20~28', w: 2800, h: 560, theme: 'quarry', bgm: 'quarry',
    plats: [P(0, 500, 2800, 1), P(240, 432, 320), P(760, 432, 300), P(1280, 432, 340), P(1840, 432, 300), P(2340, 432, 320), P(480, 364, 280), P(1020, 364, 260), P(1560, 364, 260), P(2100, 364, 260), P(760, 296, 280), P(1340, 296, 280), P(1900, 296, 240), P(900, 228, 240)],
    ladders: [{ x: 900, y1: 432, y2: 500 }, { x: 2000, y1: 432, y2: 500 }],
    spawns: [{ m: 'stonemask', p: 0, n: 3 }, { m: 'fireboar', p: 0, n: 3 }, { m: 'stonegolem', p: 0, n: 2 }, { m: 'stonemask', p: 2, n: 2 }, { m: 'fireboar', p: 4, n: 2 }, { m: 'stonemask', p: 5, n: 2 }, { m: 'stonegolem', p: 7, n: 2 }, { m: 'fireboar', p: 8, n: 2 }, { m: 'stonegolem', p: 9, n: 1 }, { m: 'stonemask', p: 10, n: 2 }, { m: 'stonegolem', p: 11, n: 2 }, { m: 'firegolem', p: 13, n: 1 }],
    portals: [{ id: 'back', x: 60, to: 'perion', tx: 'toQuarry', label: '페리온 마을' }, { id: 'toLava', x: 2580, to: 'lava', tx: 'back', label: '불꽃 협곡', lv: 'Lv 29~36', col: '#f84' }, { id: 'next', x: 2740, to: 'bossgolem', tx: 'back', label: '골렘 사원', lv: 'Lv 26+ 보스', col: '#c9c' }],
    npcs: [],
  };
  maps.lava = {
    id: 'lava', n: '불꽃 협곡', sub: '', lvTxt: 'Lv 29~36', w: 3000, h: 560, theme: 'lava', bgm: 'lava',
    plats: [P(0, 500, 3000, 1), P(220, 432, 320), P(740, 432, 300), P(1260, 432, 340), P(1820, 432, 300), P(2360, 432, 320), P(2760, 364, 200), P(460, 364, 280), P(1000, 364, 260), P(1540, 364, 260), P(2080, 364, 260), P(740, 296, 280), P(1320, 296, 280), P(1880, 296, 240), P(2400, 296, 220), P(1000, 228, 260), P(1620, 228, 240)],
    ladders: [{ x: 880, y1: 432, y2: 500 }, { x: 2000, y1: 432, y2: 500 }, { x: 2860, y1: 364, y2: 500 }],
    spawns: [{ m: 'lavamask', p: 0, n: 3 }, { m: 'lavaboar', p: 0, n: 3 }, { m: 'magmagolem', p: 0, n: 2 }, { m: 'lavamask', p: 2, n: 2 }, { m: 'lavaboar', p: 4, n: 2 }, { m: 'lavamask', p: 6, n: 2 }, { m: 'magmagolem', p: 8, n: 2 }, { m: 'lavaboar', p: 9, n: 2 }, { m: 'lavamask', p: 11, n: 2 }, { m: 'magmagolem', p: 12, n: 2 }, { m: 'lavaboar', p: 14, n: 1 }, { m: 'magmagolem', p: 15, n: 1 }, { m: 'lavamask', p: 16, n: 1 }],
    portals: [{ id: 'back', x: 60, to: 'quarry', tx: 'toLava', label: '버려진 채석장' }, { id: 'next', x: 2940, to: 'zakum', tx: 'back', label: '자쿰의 제단', lv: 'Lv 30+ 보스', col: '#f96' }, { id: 'hid', x: 1740, y: 228, to: 'hiddenB', tx: 'back', label: '불의 비밀 통로', hidden: true, col: '#b8f' }],
    npcs: [],
  };
  // 히든 스트리트: 숨은 포탈로만 들어가는 사냥터 (몬스터 빽빽, 경험치·드랍 보너스)
  maps.hiddenA = {
    id: 'hiddenA', n: '숨겨진 갱도', sub: '히든 스트리트', lvTxt: 'Lv 17~24 · 경험치×1.6 드랍×1.5', w: 2200, h: 520, theme: 'cave2', bgm: 'hidden', expMul: 1.6, dropMul: 1.5,
    plats: [P(0, 460, 2200, 1), P(160, 392, 300), P(640, 392, 300), P(1120, 392, 300), P(1600, 392, 320), P(400, 324, 280), P(900, 324, 260), P(1380, 324, 260), P(1860, 324, 240), P(640, 256, 260), P(1160, 256, 260), P(1640, 256, 240)],
    ladders: [{ x: 300, y1: 392, y2: 460 }, { x: 1700, y1: 392, y2: 460 }],
    spawns: [{ m: 'zombieant', p: 0, n: 5 }, { m: 'soldierant', p: 0, n: 4 }, { m: 'stonemask', p: 0, n: 3 }, { m: 'zombieant', p: 1, n: 3 }, { m: 'soldierant', p: 2, n: 3 }, { m: 'stonemask', p: 3, n: 3 }, { m: 'zombieant', p: 4, n: 3 }, { m: 'zombieant', p: 5, n: 3 }, { m: 'soldierant', p: 6, n: 3 }, { m: 'stonemask', p: 7, n: 3 }, { m: 'zombieant', p: 8, n: 3 }, { m: 'stonemask', p: 9, n: 3 }, { m: 'soldierant', p: 10, n: 3 }, { m: 'zombieant', p: 11, n: 3 }],
    portals: [{ id: 'back', x: 60, to: 'ant2', tx: 'hid', label: '개미굴 깊은 곳' }],
    npcs: [],
  };
  maps.hiddenB = {
    id: 'hiddenB', n: '불의 비밀 통로', sub: '히든 스트리트', lvTxt: 'Lv 31~37 · 경험치×1.5 드랍×1.6', w: 2400, h: 520, theme: 'lava', bgm: 'hidden', expMul: 1.5, dropMul: 1.6,
    plats: [P(0, 460, 2400, 1), P(180, 392, 320), P(700, 392, 300), P(1240, 392, 320), P(1780, 392, 320), P(440, 324, 280), P(980, 324, 280), P(1520, 324, 260), P(2060, 324, 240), P(700, 256, 260), P(1260, 256, 260), P(1800, 256, 240)],
    ladders: [{ x: 320, y1: 392, y2: 460 }, { x: 1900, y1: 392, y2: 460 }],
    spawns: [{ m: 'magmagolem', p: 0, n: 4 }, { m: 'lavamask', p: 0, n: 4 }, { m: 'lavaboar', p: 0, n: 3 }, { m: 'lavamask', p: 1, n: 3 }, { m: 'magmagolem', p: 2, n: 3 }, { m: 'lavaboar', p: 3, n: 3 }, { m: 'lavamask', p: 4, n: 3 }, { m: 'magmagolem', p: 5, n: 3 }, { m: 'lavaboar', p: 6, n: 3 }, { m: 'lavamask', p: 7, n: 3 }, { m: 'magmagolem', p: 8, n: 3 }, { m: 'lavamask', p: 9, n: 3 }, { m: 'magmagolem', p: 10, n: 3 }, { m: 'lavaboar', p: 11, n: 3 }],
    portals: [{ id: 'back', x: 60, to: 'lava', tx: 'hid', label: '불꽃 협곡' }],
    npcs: [],
  };

  // ───────── 오르비스 확장: 항구 · 배 · 오르비스 · 사냥터 4곳 · 보스 · 히든 2곳 ─────────
  const huntMap = (id, n, lvTxt, theme, bgm, mons, portals, extra) => {
    const w = 2800;
    const plats = [P(0, 500, w, 1), P(240, 432, 320), P(760, 432, 300), P(1280, 432, 340), P(1840, 432, 300), P(2340, 432, 320), P(480, 364, 280), P(1020, 364, 260), P(1560, 364, 260), P(2100, 364, 260), P(760, 296, 280), P(1340, 296, 280), P(1900, 296, 240), P(900, 228, 240)];
    const slots = [[0, 3], [0, 3], [0, 2], [2, 2], [4, 2], [5, 2], [6, 2], [7, 2], [8, 2], [9, 2], [10, 2], [11, 2], [12, 1], [13, 1]];
    maps[id] = Object.assign({ id, n, sub: '', lvTxt, w, h: 560, theme, bgm, plats, ladders: [{ x: 900, y1: 432, y2: 500 }, { x: 2000, y1: 432, y2: 500 }],
      spawns: slots.map((s, i) => ({ m: mons[i % mons.length], p: s[0], n: s[1] })), portals, npcs: [] }, extra || {});
  };
  maps.port = { id: 'port', n: '페리온 항구', sub: '', lvTxt: '항구', town: true, w: 1600, h: 460, theme: 'sea', bgm: 'port',
    plats: [P(0, 400, 1600, 1)], ladders: [], spawns: [],
    portals: [{ id: 'back', x: 60, to: 'perion', tx: 'toPort', label: '페리온 마을' }],
    npcs: [{ id: 'sailor', n: '항해사 오스카', x: 1100, role: 'dock', look: 'miner', dest: 'orbis', quests: [] }] };
  maps.ship = { id: 'ship', n: '여객선', sub: '항해 중', lvTxt: '배 위', ship: true, w: 1500, h: 460, theme: 'sea', bgm: 'ship',
    plats: [P(0, 400, 1500, 1), P(200, 330, 300), P(1000, 330, 300), P(600, 240, 300)], ladders: [{ x: 340, y1: 330, y2: 400 }, { x: 1140, y1: 330, y2: 400 }, { x: 740, y1: 240, y2: 400 }],
    spawns: [], portals: [], npcs: [] };
  maps.orbis = { id: 'orbis', n: '오르비스', sub: '하늘의 도시', lvTxt: '마을', town: true, w: 3200, h: 460, theme: 'sky', bgm: 'orbis',
    plats: [P(0, 400, 3200, 1), P(1250, 330, 320), P(2300, 330, 300)], ladders: [{ x: 1310, y1: 330, y2: 400 }, { x: 2360, y1: 330, y2: 400 }], spawns: [],
    portals: [{ id: 'toCloud', x: 3100, to: 'cloud', tx: 'back', label: '구름 정원', lv: 'Lv 40~46', col: '#9cf' }],
    npcs: [
      { id: 'o_dock', n: '항해사 미리', x: 260, role: 'dock', look: 'miner', dest: 'port', quests: ['qb1'] },
      { id: 'o_inn', n: '여관 주인 엘리', x: 640, role: 'inn', look: 'innkeeper', quests: [] },
      { id: 'o_potion', n: '잡화상 루루', x: 980, role: 'shop', shop: 'potion2', look: 'merchant', quests: ['qo4', 'qo11'] },
      { id: 'o_smith', n: '대장장이 하르', x: 1400, y: 330, role: 'shop', shop: 'smith2', look: 'smith', quests: ['qo5', 'qo9', 'qo12'] },
      { id: 'o_scribe', n: '주문서상 세라', x: 1800, role: 'shop', shop: 'scroll', look: 'scribe', quests: ['qo3', 'qo7'] },
      { id: 'o_captain', n: '오르비스 수호대장 아델', x: 2200, role: 'quest', look: 'captain', quests: ['qo1', 'qo2', 'qo6', 'qo8', 'qo10', 'qf'] },
      { id: 'o_master3', n: '천공 기사단장 헬마', x: 2440, y: 330, role: 'master3', look: 'master', quests: ['qt3'] },
    ] };
  huntMap('cloud', '구름 정원', 'Lv 40~46', 'sky', 'cloud', ['skymask', 'cloudboar', 'stormgolem'],
    [{ id: 'back', x: 60, to: 'orbis', tx: 'toCloud', label: '오르비스' }, { id: 'next', x: 2740, to: 'garden', tx: 'back', label: '천상의 정원', lv: 'Lv 44~50', col: '#cfe' }]);
  huntMap('garden', '천상의 정원', 'Lv 44~50', 'sky', 'garden', ['goldant', 'windstump', 'gargoyle'],
    [{ id: 'back', x: 60, to: 'cloud', tx: 'next', label: '구름 정원' }, { id: 'next', x: 2740, to: 'ice1', tx: 'back', label: '얼음 협곡', lv: 'Lv 48~54', col: '#8df' }, { id: 'hid', x: 1020, y: 228, to: 'hiddenC', tx: 'back', label: '구름 속 비밀 정원', hidden: true, col: '#b8f' }]);
  huntMap('ice1', '얼음 협곡', 'Lv 48~54', 'ice', 'ice1', ['icemask', 'frostboar', 'icegolem'],
    [{ id: 'back', x: 60, to: 'garden', tx: 'next', label: '천상의 정원' }, { id: 'next', x: 2740, to: 'ice2', tx: 'back', label: '눈보라 고원', lv: 'Lv 52~58', col: '#9ef' }]);
  huntMap('ice2', '눈보라 고원', 'Lv 52~58', 'ice', 'ice2', ['frostant', 'blizzstump', 'yeti'],
    [{ id: 'back', x: 60, to: 'ice1', tx: 'next', label: '얼음 협곡' }, { id: 'next', x: 2740, to: 'frost', tx: 'back', label: '서리 왕좌', lv: 'Lv 55+ 보스', col: '#6ef' }, { id: 'hid', x: 1020, y: 228, to: 'hiddenD', tx: 'back', label: '얼어붙은 비밀 통로', hidden: true, col: '#b8f' }]);
  maps.frost = { id: 'frost', n: '서리 왕좌', sub: '보스', lvTxt: 'Lv 55+ 보스', w: 2000, h: 460, theme: 'ice', bgm: 'frost', boss: 'frostlord', bossX: 1400,
    plats: [P(0, 400, 2000, 1), P(160, 330, 280), P(1560, 330, 280), P(860, 240, 280)], ladders: [{ x: 980, y1: 240, y2: 400 }], spawns: [],
    portals: [{ id: 'back', x: 60, to: 'ice2', tx: 'next', label: '눈보라 고원' }], npcs: [] };
  maps.hiddenC = { id: 'hiddenC', n: '구름 속 비밀 정원', sub: '히든 스트리트', lvTxt: 'Lv 46~52 · 경험치×1.6 드랍×1.5', w: 2200, h: 520, theme: 'sky', bgm: 'hidden', expMul: 1.6, dropMul: 1.5,
    plats: [P(0, 460, 2200, 1), P(160, 392, 300), P(640, 392, 300), P(1120, 392, 300), P(1600, 392, 320), P(400, 324, 280), P(900, 324, 260), P(1380, 324, 260), P(1860, 324, 240), P(640, 256, 260), P(1160, 256, 260), P(1640, 256, 240)],
    ladders: [{ x: 300, y1: 392, y2: 460 }, { x: 1700, y1: 392, y2: 460 }],
    spawns: [['goldant', 0, 5], ['gargoyle', 0, 4], ['windstump', 0, 3], ['goldant', 1, 3], ['gargoyle', 2, 3], ['windstump', 3, 3], ['goldant', 4, 3], ['gargoyle', 5, 3], ['windstump', 6, 3], ['gargoyle', 7, 3], ['goldant', 8, 3], ['windstump', 9, 3], ['gargoyle', 10, 3], ['goldant', 11, 3]].map((a) => ({ m: a[0], p: a[1], n: a[2] })),
    portals: [{ id: 'back', x: 60, to: 'garden', tx: 'hid', label: '천상의 정원' }], npcs: [] };
  maps.hiddenD = { id: 'hiddenD', n: '얼어붙은 비밀 통로', sub: '히든 스트리트', lvTxt: 'Lv 55~60 · 경험치×1.5 드랍×1.6', w: 2400, h: 520, theme: 'ice', bgm: 'hidden', expMul: 1.5, dropMul: 1.6,
    plats: [P(0, 460, 2400, 1), P(180, 392, 320), P(700, 392, 300), P(1240, 392, 320), P(1780, 392, 320), P(440, 324, 280), P(980, 324, 280), P(1520, 324, 260), P(2060, 324, 240), P(700, 256, 260), P(1260, 256, 260), P(1800, 256, 240)],
    ladders: [{ x: 320, y1: 392, y2: 460 }, { x: 1900, y1: 392, y2: 460 }],
    spawns: [['yeti', 0, 4], ['frostant', 0, 4], ['blizzstump', 0, 3], ['frostant', 1, 3], ['yeti', 2, 3], ['blizzstump', 3, 3], ['frostant', 4, 3], ['yeti', 5, 3], ['blizzstump', 6, 3], ['frostant', 7, 3], ['yeti', 8, 3], ['blizzstump', 9, 3], ['yeti', 10, 3], ['frostant', 11, 3]].map((a) => ({ m: a[0], p: a[1], n: a[2] })),
    portals: [{ id: 'back', x: 60, to: 'ice2', tx: 'hid', label: '눈보라 고원' }], npcs: [] };
  maps.zakum = {
    id: 'zakum', n: '자쿰의 제단', sub: '보스', lvTxt: 'Lv 30+ 보스', w: 1900, h: 460, theme: 'temple', bgm: 'zakum', boss: 'zakum', bossX: 1300,
    plats: [P(0, 400, 1900, 1), P(160, 330, 260), P(1480, 330, 260), P(820, 262, 260)],
    ladders: [{ x: 940, y1: 262, y2: 400 }],
    spawns: [],
    portals: [{ id: 'back', x: 60, to: 'lava', tx: 'next', label: '불꽃 협곡' }],
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
    // 코스: 3구간(발판 점점 좁고 높아짐) + 중간 쉼터 2곳. 발판은 좌우로 불규칙하게 이어져, 떨어지면 아래 발판에 걸리거나 바닥까지 떨어진다
    const H = 2400, GY = H - 40, pl = [P(0, GY, 1400, 1)]; let y = GY, dir = 1, seed = 7, left = 300, right = 420;
    const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    const stages = [{ n: 9, w: 52, rise: 66, gap: 58 }, { rest: 1 }, { n: 10, w: 40, rise: 72, gap: 54 }, { rest: 1 }, { n: 11, w: 32, rise: 76, gap: 52 }];
    for (const st of stages) {
      const cnt = st.rest ? 1 : st.n;
      for (let i = 0; i < cnt; i++) {
        const w = st.rest ? 200 : st.w, rise = st.rest ? 66 : st.rise + Math.round((rnd() - 0.5) * 4), gap = st.rest ? 40 : st.gap + Math.round((rnd() - 0.5) * 3);
        if (rnd() < 0.4) dir = -dir;
        let nx = dir > 0 ? right + gap : left - gap - w;
        if (nx < 40 || nx + w > 1360) { dir = -dir; nx = dir > 0 ? right + gap : left - gap - w; }
        y -= rise; pl.push(P(nx, y, w)); left = nx; right = nx + w;
      }
    }
    { const t0 = pl[pl.length - 1]; pl[pl.length - 1] = P(t0.x + t0.w / 2 - 110, t0.y, 220); }
    const top = pl[pl.length - 1]; const xc = top.x + top.w / 2;
    maps.trial = { id: 'trial', n: '시련의 탑', sub: '점프맵', lvTxt: 'Lv 26+ 점프맵', w: 1400, h: H, theme: 'temple', bgm: 'trial', plats: pl, ladders: [], spawns: [],
      portals: [{ id: 'back', x: 60, to: 'perion', tx: 'toTrial', label: '페리온 마을' }],
      npcs: [{ id: 'chest', n: '고대 상자', x: xc, y, role: 'chest', look: 'chest' }] };
  })();
  D.MAPS = maps;

  /* ───────── 상점 ───────── */
  D.SHOPS = {
    potion: { n: '소비 상점', items: ['hp1', 'hp2', 'hp3', 'hp4', 'mp1', 'mp2', 'mp3', 'scroll'] },
    smith: { n: '장비 상점', items: ['sw1', 'ax1', 'gs1', 'mc1', 'sp1', 'sw2', 'ax2', 'gs2', 'mc2', 'sp2', 'mc3', 'sp3', 'hm1', 'hm2', 'hm3', 'ar1', 'ar2', 'ar3', 'gl1', 'gl2', 'gl3', 'sh1', 'sh2', 'sh3'] },
    scroll: { n: '주문서 상점 (100% 주문서·황금 망치)', items: ['scW100', 'scA100', 'scS100', 'scD100', 'scH100', 'scG'] },
    potion2: { n: '오르비스 잡화점', items: ['hp3', 'hp4', 'hp5', 'mp2', 'mp3', 'mp4', 'scroll'] },
    smith2: { n: '오르비스 장비 상점', items: ['sw6', 'ax6', 'gs5', 'mc6', 'sp6', 'hm6', 'ar6', 'gl5', 'sh6', 'sw7', 'ax7', 'gs6', 'mc7', 'sp7', 'hm7', 'ar7', 'gl6', 'sh7'] },
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
      done: '오오, 먹이를 잘 먹는구먼! 녀석이 자네가 마음에 들었나 봐. **펫 멧돌이가 함께하네!**\n🐾 펫은 자동 물약도 마시고, 근처에 떨어진 아이템도 대신 주워 준다네.',
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
      ask: '바위왕 골렘을 쓰러뜨렸다니, 대단하다! 하지만 전사의 길에는 끝이 없지.\n마을 오른쪽 끝의 **시련의 탑**은 점프 실력을 시험하는 곳이다. 몬스터는 없지만 발판이 좁고 높고, 옆에서 **공이 날아온다**. 점프로 피해라!\n꼭대기 **고대 상자**에서 **고대 골렘의 인장**을 가져오면 전설의 투구를 내주겠다! (떨어져도 다치지 않으니 걱정 마라)',
      doing: '시련의 탑은 마을 맨 오른쪽 문 근처의 포탈이다. 발판 끝에서 점프하고, 위층으로 계속 올라가라!',
      done: '해냈구나! 이 투구는 고대 골렘의 힘이 깃든 전설의 투구다. 강화 횟수가 10회나 되니 아껴서 써라!',
      goals: [{ item: 'relic', n: 1 }], reward: { exp: 12000, meso: 20000, items: [['hmz', 1], ['scW10', 1]] } },
    qa: { n: '달팽이 껍질 수집', npc: 'elder', lv: 2, pre: 'q1',
      ask: '달팽이 껍질은 약으로 쓰이지. **달팽이 껍질 10개**만 모아 주겠나? 마을 아이들이 감기에 걸렸거든.',
      doing: '바위산 초입의 달팽이가 가끔 껍질을 떨어뜨린다네.',
      done: '고맙네! 아이들이 금세 나을 걸세. 약소하지만 받게.',
      goals: [{ item: 'shell', n: 10 }], reward: { exp: 90, meso: 200, items: [['hp1', 5]] } },
    qb: { n: '파란 달팽이 소탕', npc: 'elder', lv: 4, pre: 'qa',
      ask: '파란 달팽이들이 밭을 망치고 있네. **파란 달팽이 12마리**를 처치해 주게. 주문서도 한 장 챙겨 주지.',
      doing: '파란 달팽이는 바위산 초입 안쪽에 있다네.',
      done: '수고했네! 이 주문서는 자네 장비를 단련하는 데 쓰게.',
      goals: [{ kill: 'bluesnail', n: 12 }], reward: { exp: 220, meso: 300, items: [['mp1', 5],['scW100', 1]] } },
    qi1: { n: '미라의 수프 재료', npc: 'inn', lv: 6, pre: 'q2',
      ask: '손님들이 수프를 찾는데 재료가 떨어졌어요. **파란 달팽이 껍질 6개**와 **나무 조각 6개**를 구해 주실래요? 푹 쉬시게 도와드릴게요!',
      doing: '껍질은 파란 달팽이가, 나무 조각은 그루터기가 떨어뜨려요.',
      done: '와, 정말 고마워요! 이 물약들은 제 마음이에요.',
      goals: [{ item: 'bshell', n: 6 },{ item: 'wood', n: 6 }], reward: { exp: 400, meso: 500, items: [['hp1', 15],['mp1', 10]] } },
    qs1: { n: '바르크의 숯 부탁', npc: 'smith', lv: 8, pre: 'q2',
      ask: '숯이 다 떨어져서 불을 못 피워! **나무 조각 15개**만 가져다 주면 내가 쓰던 **철 메이스와 단창**을 주지. 둔기와 창도 써 봐야 진짜 전사지!',
      doing: '나무 조각은 그루터기를 잡으면 나온다네.',
      done: '좋아, 약속한 무기다! 마음에 드는 걸로 써 봐라.',
      goals: [{ item: 'wood', n: 15 }], reward: { exp: 500, meso: 600, items: [['mc1', 1],['sp1', 1],['hp1', 10]] } },
    qpo1: { n: '포포의 약초 부탁', npc: 'potion', lv: 10, pre: 'q3',
      ask: '물약 재료가 부족해요! 나무 가면 조각을 갈아 넣으면 효과가 좋아지거든요. **나무 가면 조각 8개** 부탁드려요.',
      doing: '나무 가면은 바위산 중턱에서 폴짝폴짝 뛰어다녀요.',
      done: '역시 전사님! 물약을 넉넉히 드릴게요.',
      goals: [{ item: 'maskpiece', n: 8 }], reward: { exp: 1100, meso: 1200, items: [['hp2', 10],['mp1', 10]] } },
    qm2: { n: '광부의 안전모', npc: 'miner', lv: 11, pre: 'q3',
      ask: '나무 가면 놈들이 광부들을 자꾸 들이받아. **나무 가면 15마리**만 혼내 줘! 광부들이 안심하고 일하게.',
      doing: '나무 가면은 바위산 중턱에 많아. 폴짝 뛰니 타이밍을 봐서 치라고.',
      done: '시원하구만! 이건 광부들이 모은 사례금이야.',
      goals: [{ kill: 'woodmask', n: 15 }], reward: { exp: 1300, meso: 1500, items: [['hp2', 10],['mp2', 5]] } },
    qs2: { n: '불량품 회수', npc: 'smith', lv: 14, pre: 'q4',
      ask: '어두운 그루터기 놈들이 내 불량품 **강철 투구 재료**를 물어갔어! **어두운 나무껍질 10개**를 가져오면 새 무기로 바꿔 주마.',
      doing: '어두운 그루터기는 고목의 숲에 산다.',
      done: '좋아! 약속대로 전투 망치와 철 창이다.',
      goals: [{ item: 'darkbark', n: 10 }], reward: { exp: 2400, meso: 3000, items: [['mc2', 1],['sp2', 1],['hp3', 5]] } },
    qsc1: { n: '루나의 마법 잉크', npc: 'scribe', lv: 15, pre: 'q5',
      ask: '주문서를 쓰려면 특별한 잉크가 필요한데, 개미 다리를 갈면 만들 수 있어요. **개미 다리 15개**를 가져다 주세요! 주문서로 보답할게요.',
      doing: '개미 다리는 개미굴 입구의 개미가 떨어뜨려요.',
      done: '잉크가 완성됐어요! 주문서를 드릴게요 ✨',
      goals: [{ item: 'antleg', n: 15 }], reward: { exp: 3500, meso: 3000, items: [['scW100', 3],['scA100', 2]] } },
    qc2: { n: '병정 개미 소탕', npc: 'captain', lv: 17, pre: 'q5',
      ask: '병정 개미들이 점점 대담해지고 있다. **병정 개미 20마리**를 처치해 위협을 줄여라.',
      doing: '병정 개미는 개미굴 깊은 곳에 있다. 단단하니 방어 버프를 써라.',
      done: '수고했다. 보급품을 받아라.',
      goals: [{ kill: 'soldierant', n: 20 }], reward: { exp: 6000, meso: 5000, items: [['hp3', 10],['mp2', 10]] } },
    qm3: { n: '돌 가면 조각 모으기', npc: 'miner', lv: 21, pre: 'q6',
      ask: '채석장 돌 가면의 조각은 단단해서 연장을 만들기 좋아. **돌 조각 12개**를 모아 줘. 사례로 쓸 만한 철퇴를 주지!',
      doing: '돌 가면은 채석장에 있다. 돌 조각은 골렘도 가끔 떨어뜨려.',
      done: '잘했어! 이 가시 철퇴를 가져가.',
      goals: [{ item: 'stonefrag', n: 12 }], reward: { exp: 9500, meso: 8000, items: [['mc3', 1],['hp4', 6]] } },
    qs3: { n: '불꽃 단련의 시험', npc: 'smith', lv: 23, pre: 'q7',
      ask: '최고의 무기를 벼리려면 **불씨 10개**가 필요해. 불 멧돼지가 떨어뜨리는 불씨를 가져와라! 기사 창과 가시 철퇴, 주문서까지 얹어 주지.',
      doing: '불 멧돼지는 채석장에 산다. 돌진을 조심해!',
      done: '훌륭한 불씨군! 약속한 물건들이다.',
      goals: [{ item: 'ember', n: 10 }], reward: { exp: 11000, meso: 10000, items: [['sp3', 1],['mc3', 1],['scW60', 3]] } },
    qc3: { n: '불 멧돼지 사냥', npc: 'captain', lv: 24, pre: 'q7',
      ask: '채석장의 **불 멧돼지 20마리**를 처치해라. 돌진 공격에 주의하고 물약을 챙겨라.',
      doing: '불 멧돼지가 뛰어오면 점프로 피하고 반격해라.',
      done: '대단하다! 보급품을 받아라.',
      goals: [{ kill: 'fireboar', n: 20 }], reward: { exp: 13000, meso: 12000, items: [['hp4', 10],['mp3', 10]] } },
    qm4: { n: '골렘 핵 연구', npc: 'miner', lv: 27, pre: 'q8',
      ask: '골렘 핵을 연구하면 새 광석을 찾을 수 있을지도 몰라. **골렘 핵 8개**만 가져다 줘! 연구 지원금과 주문서를 줄게.',
      doing: '골렘 핵은 돌 골렘과 불 골렘이 떨어뜨려.',
      done: '굉장해! 이 핵으로 큰 발견을 하겠어.',
      goals: [{ item: 'golemcore', n: 8 }], reward: { exp: 18000, meso: 20000, items: [['scW10', 1],['scA10', 1],['hp4', 10]] } },
    qc4: { n: '불 골렘 토벌', npc: 'captain', lv: 28, pre: 'q8',
      ask: '바위왕이 쓰러졌지만 **불 골렘 30마리**가 아직 채석장을 어슬렁댄다. 전부 처치해라! 보상으로 전설의 **배틀 해머**와 **드래곤 랜스**를 내주겠다.',
      doing: '불 골렘은 멀리서 불꽃을 쏜다. 거리를 좁혀 싸워라.',
      done: '역시 페리온의 영웅이다! 약속한 전설의 무기를 받아라.',
      goals: [{ kill: 'firegolem', n: 30 }], reward: { exp: 24000, meso: 25000, items: [['mc4', 1],['sp4', 1],['hp4', 20],['mp3', 20]] } },
    qz: { n: '불꽃의 제단, 자쿰', npc: 'captain', lv: 30, pre: 'q9',
      ask: '페리온 최후의 위협이다. **불꽃 협곡** 깊숙한 곳 **불꽃의 제단**에 \'자쿰\'이 깨어났다. 팔이 여럿 달린 거대한 석상으로, 땅을 쪼개고 불덩이를 쏟아낸다.\n**자쿰을 처치**하고 이마의 **자쿰의 불꽃 눈**을 가져와라! 전설의 **자쿰의 투구**를 내주겠다.',
      doing: '채석장 오른쪽 주황색 포탈로 불꽃 협곡에 들어가 끝까지 가면 불꽃의 제단이다. 하늘에서 떨어지는 불덩이와 땅에서 솟는 바위를 조심해라! 물약을 넉넉히!',
      done: '자쿰을 쓰러뜨리다니… 네가 페리온 최강의 전사다! 약속한 투구를 받아라. 불꽃의 왕관이 너를 지켜줄 것이다.',
      goals: [{ kill: 'zakum', n: 1 }, { item: 'zeye', n: 1 }], reward: { exp: 60000, meso: 80000, items: [['hmk', 1], ['scW10', 2], ['scA10', 2], ['hp4', 20], ['mp3', 20]] } },
    qh1: { n: '돌 골렘 대청소', npc: 'captain', lv: 30, pre: 'qc4',
      ask: '채석장에 돌 골렘이 다시 늘었다. **돌 골렘 40마리**를 처치해라. 이제 전직한 너에게 어울리는 임무다!',
      doing: '돌 골렘은 채석장 곳곳에 있다. 단단하니 스킬을 아끼지 마라.',
      done: '훌륭하다! 보급품과 주문서를 받아라.',
      goals: [{ kill: 'stonegolem', n: 40 }], reward: { exp: 30000, meso: 30000, items: [['scW10', 2], ['scA10', 2], ['hp4', 15]] } },
    qh2: { n: '불 멧돼지 대청소', npc: 'captain', lv: 32, pre: 'qh1',
      ask: '불 멧돼지 무리가 또 번식했다. **불 멧돼지 50마리**를 처치해라!',
      doing: '불 멧돼지는 돌진 전에 멈칫한다. 그때 점프로 피해라.',
      done: '지치지도 않는군! 이건 수고비다.',
      goals: [{ kill: 'fireboar', n: 50 }], reward: { exp: 40000, meso: 40000, items: [['hp4', 20], ['mp3', 20], ['scW60', 5]] } },
    qh3: { n: '골렘 핵 대량 납품', npc: 'miner', lv: 33, pre: 'qm4',
      ask: '연구가 대성공이야! 이번엔 **골렘 핵 20개**가 필요해. 값은 후하게 쳐 줄게.',
      doing: '골렘 핵은 돌 골렘과 불 골렘이 떨어뜨려.',
      done: '이거면 충분해! 약속한 대금이야.',
      goals: [{ item: 'golemcore', n: 20 }], reward: { exp: 50000, meso: 60000, items: [['scW10', 3], ['scA10', 3]] } },
    qh4: { n: '불꽃 눈 수집가', npc: 'captain', lv: 34, pre: 'qz',
      ask: '자쿰의 불꽃 눈을 모으려는 학자가 있다. **자쿰의 불꽃 눈 3개**를 가져와라! 자쿰은 90초마다 다시 나타난다.',
      doing: '자쿰은 불꽃의 제단에서 다시 나타난다. 매번 불꽃 눈을 떨어뜨린다.',
      done: '대단한 수집량이군! 학자도 기뻐할 거다. 후한 사례다.',
      goals: [{ item: 'zeye', n: 3 }], reward: { exp: 100000, meso: 100000, items: [['scW10', 5], ['scA10', 5], ['hp4', 30], ['mp3', 30]] } },
    qv1: { n: '불꽃 협곡 개척', npc: 'captain', lv: 29, pre: 'q8',
      ask: '채석장 너머 **불꽃 협곡**이 열렸다. 용암 기운에 물든 몬스터들이 득실댄다. **불꽃 가면 25마리**를 처치해 길을 열어라. 협곡 입구는 채석장 오른쪽 주황 포탈이다.',
      doing: '채석장 오른쪽 끝 주황색 포탈이 협곡 입구다. 불꽃 가면은 폴짝 뛰며 들이받는다.',
      done: '좋다! 협곡 개척의 첫걸음이군. 용암 건틀릿을 받아라.',
      goals: [{ kill: 'lavamask', n: 25 }], reward: { exp: 22000, meso: 20000, items: [['gl4', 1], ['hp4', 15], ['mp3', 15]] } },
    qv2: { n: '용암 멧돼지 사냥', npc: 'captain', lv: 31, pre: 'qv1',
      ask: '협곡의 **용암 멧돼지 30마리**를 처치해라. 돌진이 빠르니 점프로 피하고 반격해라.',
      doing: '용암 멧돼지는 협곡 바닥을 질주한다. 멈칫하는 순간이 기회다.',
      done: '해냈군! 용암 장화를 받아라.',
      goals: [{ kill: 'lavaboar', n: 30 }], reward: { exp: 30000, meso: 28000, items: [['sh5', 1], ['hp4', 20], ['mp3', 20]] } },
    qv3: { n: '마그마 핵 연구', npc: 'miner', lv: 33, pre: 'qv2',
      ask: '협곡의 마그마 골렘에게서 나오는 **마그마 핵 10개**를 구해 줘. 최고의 연료가 될 거야! 사례로 용암 갑옷을 줄게.',
      doing: '마그마 골렘은 멀리서 불덩이를 던져. 거리를 좁혀서 싸워!',
      done: '이게 마그마 핵이구나! 이 갑옷을 가져가.',
      goals: [{ item: 'magmacore', n: 10 }], reward: { exp: 40000, meso: 50000, items: [['ar5', 1], ['scW10', 2], ['scA10', 2]] } },
    qo1: { n: '구름 정원 정찰', npc: 'o_captain', lv: 40, pre: null,
      ask: '어서 와라, 먼 길을 온 전사여. 오르비스는 하늘 위의 도시다. 수호대가 구름 정원의 **구름 가면 25마리**를 처치해 줄 용사를 찾고 있다.',
      doing: '오르비스 오른쪽 끝 포탈이 구름 정원이다. 구름 가면은 폴짝 뛰며 들이받는다.',
      done: '훌륭하다! 오르비스의 수호대는 너를 환영한다. 장갑을 받아라.',
      goals: [{ kill: 'skymask', n: 25 }], reward: { exp: 45000, meso: 40000, items: [['hp5', 10], ['mp4', 10], ['gl5', 1]] } },
    qo2: { n: '구름 멧돼지 퇴치', npc: 'o_captain', lv: 42, pre: 'qo1',
      ask: '구름 정원의 **구름 멧돼지 30마리**를 처치해라. 돌진이 빨라서 점프로 피해야 한다.',
      doing: '구름 멧돼지는 구름 정원 바닥을 질주한다.',
      done: '잘했다! 구름 장화와 보급품이다.',
      goals: [{ kill: 'cloudboar', n: 30 }], reward: { exp: 55000, meso: 50000, items: [['sh6', 1], ['hp5', 15], ['scW10', 2]] } },
    qo3: { n: '폭풍 핵 연구', npc: 'o_scribe', lv: 43, pre: 'qo1',
      ask: '폭풍 골렘의 핵으로 최고의 주문서를 만들 수 있어요! **폭풍 핵 10개**를 가져다 주세요. 주문서로 보답할게요 ✨',
      doing: '폭풍 골렘은 멀리서 번개를 던져요. 거리를 좁혀서 싸우세요.',
      done: '이 핵이면 충분해요! 약속한 주문서예요.',
      goals: [{ item: 'stormcore', n: 10 }], reward: { exp: 65000, meso: 60000, items: [['scW10', 3], ['scA10', 3], ['mp4', 15]] } },
    qo4: { n: '바람 나무껍질 부탁', npc: 'o_potion', lv: 46, pre: 'qo2',
      ask: '물약 재료가 바닥났어요! 바람 그루터기의 **바람 나무껍질 15개**만 모아 주시면 물약을 듬뿍 드릴게요.',
      doing: '바람 그루터기는 천상의 정원에 있어요.',
      done: '역시 대단해요! 물약을 가득 드릴게요.',
      goals: [{ item: 'windbark', n: 15 }], reward: { exp: 80000, meso: 70000, items: [['hp5', 20], ['mp4', 20]] } },
    qo5: { n: '황금 개미의 다리', npc: 'o_smith', lv: 45, pre: 'qo3',
      ask: '황금 개미의 다리는 최고급 장식 재료지! **황금 개미 다리 15개**를 구해 오면 구름 투구를 내주마.',
      doing: '황금 개미는 천상의 정원에 산다.',
      done: '반짝이는군! 약속한 투구다.',
      goals: [{ item: 'goldleg', n: 15 }], reward: { exp: 85000, meso: 80000, items: [['hm6', 1], ['scW10', 2], ['scA10', 2]] } },
    qo6: { n: '가고일 소탕', npc: 'o_captain', lv: 48, pre: 'qo2',
      ask: '천상의 정원에 석상 마물 **가고일 30마리**가 날뛰고 있다. 전부 처치해라!',
      doing: '가고일은 정원 위쪽 발판에도 나온다.',
      done: '용맹하구나! 천공 갑옷을 받아라.',
      goals: [{ kill: 'gargoyle', n: 30 }], reward: { exp: 110000, meso: 100000, items: [['ar6', 1], ['hp5', 20]] } },
    qo7: { n: '얼음 조각 모으기', npc: 'o_scribe', lv: 48, pre: 'qo3',
      ask: '얼음 협곡의 **얼음 조각 15개**가 필요해요. 주문서 잉크를 얼리면 훨씬 오래가거든요!',
      doing: '얼음 가면과 얼음 골렘이 얼음 조각을 떨어뜨려요.',
      done: '고마워요! 특별한 주문서를 드릴게요.',
      goals: [{ item: 'icefrag', n: 15 }], reward: { exp: 120000, meso: 100000, items: [['scW10', 4], ['scA10', 4]] } },
    qo8: { n: '서리 멧돼지 사냥', npc: 'o_captain', lv: 50, pre: 'qo6',
      ask: '얼음 협곡의 **서리 멧돼지 35마리**를 처치해라. 이번엔 수호대 무기고의 하늘 무기를 모두 내주겠다!',
      doing: '서리 멧돼지는 얼음 위를 미끄러지듯 돌진한다.',
      done: '대단하다! 하늘의 무기를 받아라. 네 직업에 맞는 걸 골라 써라.',
      goals: [{ kill: 'frostboar', n: 35 }], reward: { exp: 150000, meso: 130000, items: [['sw6', 1], ['ax6', 1], ['gs5', 1], ['mc6', 1], ['sp6', 1], ['hp5', 30], ['mp4', 30]] } },
    qb1: { n: '발록을 물리쳐라', npc: 'o_dock', lv: 45, pre: null,
      ask: '가끔 오르비스행 배에 **크림슨 발록**이 나타나 승객을 위협한다네. 놈의 **손톱 1개**를 가져오면 큰 보상을 주겠네! (배를 탈 때마다 나타나는 건 아니라네)',
      doing: '발록은 배를 탈 때 무작위로 나타난다. 항구에서 오르비스행 배를 타 보게!',
      done: '해냈구먼! 선원들이 크게 감사할 걸세. 보상일세.',
      goals: [{ item: 'balrogclaw', n: 1 }], reward: { exp: 120000, meso: 150000, items: [['scW10', 5], ['scA10', 5], ['hp5', 20], ['mp4', 20]] } },
    qt3: { n: '3차 전직의 시험', npc: 'o_master3', lv: 70, pre: 'qo6',
      ask: '너의 힘이 3차 전직에 이르렀는지 시험하겠다. 얼음 협곡의 **얼음 골렘 15마리**를 처치하고, 천상의 정원 가고일에게서 **가고일 파편 10개**를 가져와라. 통과하면 **3차 전직**을 시켜 주마!',
      doing: '얼음 골렘은 얼음 협곡에, 가고일은 천상의 정원에 있다.',
      done: '시험을 통과했다! 이제 3차 전직을 할 수 있다. 나에게 다시 말을 걸어라.',
      goals: [{ kill: 'icegolem', n: 15 }, { item: 'gargoylechip', n: 10 }], reward: { exp: 150000, meso: 100000, items: [['scW10', 3], ['scA10', 3]] } },
    qo9: { n: '서리 핵의 비밀', npc: 'o_smith', lv: 52, pre: 'qo7',
      ask: '서리 핵은 최고의 대장 재료다! **서리 핵 10개**를 가져오면 서리 갑옷을 만들어 주마.',
      doing: '서리 핵은 얼음 골렘이 떨어뜨린다.',
      done: '이거면 되겠군! 약속한 갑옷이다.',
      goals: [{ item: 'frostcore', n: 10 }], reward: { exp: 180000, meso: 150000, items: [['ar7', 1], ['hp5', 30]] } },
    qo10: { n: '서리 개미 토벌', npc: 'o_captain', lv: 53, pre: 'qo8',
      ask: '눈보라 고원의 **서리 개미 40마리**를 처치해라. 떼로 몰려오니 조심해라.',
      doing: '서리 개미는 눈보라 고원에 산다.',
      done: '정말 강하군! 서리 장갑과 장화를 받아라.',
      goals: [{ kill: 'frostant', n: 40 }], reward: { exp: 200000, meso: 160000, items: [['gl6', 1], ['sh7', 1], ['hp5', 30]] } },
    qo11: { n: '눈보라 그루터기', npc: 'o_potion', lv: 55, pre: 'qo4',
      ask: '눈보라 그루터기가 길을 막아 물건이 못 들어와요! **눈보라 그루터기 40마리**를 처치해 주세요.',
      doing: '눈보라 그루터기는 눈보라 고원에 있어요.',
      done: '정말 고마워요! 서리 투구를 드릴게요.',
      goals: [{ kill: 'blizzstump', n: 40 }], reward: { exp: 240000, meso: 200000, items: [['hm7', 1], ['mp4', 40]] } },
    qo12: { n: '설인 골렘 연구', npc: 'o_smith', lv: 57, pre: 'qo9',
      ask: '눈보라 고원의 **설인 골렘 20마리**를 쓰러뜨려라. 놈의 핵으로 전설의 무기를 만들 수 있다!',
      doing: '설인 골렘은 눈보라 고원 깊숙이 있다. 덩치가 크니 거리를 두고 싸워라.',
      done: '최고의 재료다! 수고비를 받아라.',
      goals: [{ kill: 'yeti', n: 20 }], reward: { exp: 260000, meso: 220000, items: [['scW10', 5], ['scA10', 5], ['hp5', 40], ['mp4', 40]] } },
    qf: { n: '얼음 군주 토벌', npc: 'o_captain', lv: 56, pre: 'qo10',
      ask: '눈보라 고원 너머 **서리 왕좌**에 얼음 군주가 깨어났다! 하늘의 도시마저 얼려 버릴 위협이다. **얼음 군주를 처치**하고 **얼음 군주의 증표**를 가져와라. 전설의 **얼음 군주의 왕관**을 내주겠다!',
      doing: '눈보라 고원 오른쪽 끝 포탈이 서리 왕좌다. 얼음 조각과 서리 바닥을 조심해라!',
      done: '얼음 군주를 쓰러뜨리다니… 너는 오르비스의 영웅이다! 약속한 왕관을 받아라.',
      goals: [{ kill: 'frostlord', n: 1 }, { item: 'frostcrown', n: 1 }], reward: { exp: 400000, meso: 500000, items: [['hmf', 1], ['scW10', 5], ['scA10', 5], ['hp5', 50], ['mp4', 50]] } },
  };
  D.QUEST_ORDER = ['q1', 'qa', 'q2', 'qb', 'qp', 'qi1', 'qs1', 'q3', 'qpo1', 'qm2', 'q4', 'qs2', 'q5', 'qsc1', 'q6', 'qc2', 'qm3', 'q7', 'qs3', 'qc3', 'q8', 'qm4', 'qv1', 'qv2', 'qv3', 'qc4', 'q9', 'qz', 'qh1', 'qh2', 'qh3', 'qh4', 'qo1', 'qo2', 'qo3', 'qo4', 'qo5', 'qo6', 'qo7', 'qo8', 'qb1', 'qt3', 'qo9', 'qo10', 'qo11', 'qo12', 'qf'];


  // ═════════════════ 만렙 200 월드 생성기: 마을 9곳 + 사냥터 2곳 + 보스 + 히든 + 장비 세트 + 퀘스트 ═════════════════
  // 원작처럼 1차(~29) · 2차 30 · 3차 70 · 4차 120 · 만렙 200. 수치는 레벨 공식으로 만든다.
  const GL = {
    hp: (L) => Math.round(30.5 * Math.pow(L, 1.8) * Math.pow(Math.max(1, L / 60), 0.9)), atk: (L) => Math.round(295 * Math.pow(L / 57, 1.1)), def: (L) => Math.round(262 * Math.pow(L / 57, 0.8)),
    exp: (L) => Math.round(D.expToNext(L) * (0.0055 - 0.0025 * Math.max(0, L - 58) / 142)),
  };
  D.GL = GL;
  // 포션 단계
  add('hp6', { n: '슈퍼 엘릭서', t: 'use', icon: '🧪', col: '#ffd0e8', heal: 5500, price: 3500, desc: 'HP 5500 회복' });
  add('hp7', { n: '프리미엄 엘릭서', t: 'use', icon: '🧪', col: '#ffb0d8', heal: 14000, price: 9000, desc: 'HP 14000 회복' });
  add('hp8', { n: '마스터 엘릭서', t: 'use', icon: '🧪', col: '#ff90c8', heal: 36000, price: 22000, desc: 'HP 36000 회복' });
  add('hp9', { n: '신의 영약', t: 'use', icon: '🧪', col: '#ff70b8', heal: 90000, price: 55000, desc: 'HP 90000 회복' });
  add('mp5', { n: '슈퍼 마나 엘릭서', t: 'use', icon: '💧', col: '#8a90ff', mana: 2500, price: 3000, desc: 'MP 2500 회복' });
  add('mp6', { n: '프리미엄 마나 엘릭서', t: 'use', icon: '💧', col: '#7a80ff', mana: 6000, price: 8000, desc: 'MP 6000 회복' });
  add('mp7', { n: '마스터 마나 엘릭서', t: 'use', icon: '💧', col: '#6a70ff', mana: 15000, price: 20000, desc: 'MP 15000 회복' });
  add('mp8', { n: '신의 마나 영약', t: 'use', icon: '💧', col: '#5a60ff', mana: 38000, price: 50000, desc: 'MP 38000 회복' });
  const potTier = (L) => (L < 75 ? ['hp5', 'mp4'] : L < 105 ? ['hp6', 'mp5'] : L < 140 ? ['hp7', 'mp6'] : L < 175 ? ['hp8', 'mp7'] : ['hp9', 'mp8']);
  const WMUL = { sword: 2.5, axe: 3.0, great: 3.5, mace: 3.2, spear: 3.6 }, WNAME = { sword: '검', axe: '도끼', great: '대검', mace: '망치', spear: '창' }, WSPD = { sword: 0.42, axe: 0.52, great: 0.62, mace: 0.5, spear: 0.55 }, WRNG = { sword: 66, axe: 64, great: 88, mace: 64, spear: 94 };
  const genSet = (rid, tag, name, col, L) => {
    const ids = []; const price = (k) => Math.round(Math.pow(L, 2.7) * k);
    for (const wt of ['sword', 'axe', 'great', 'mace', 'spear']) { const id = `g${rid}${tag}_${wt}`; eq(id, `${name} ${WNAME[wt]}`, 'weapon', L, { gen: true, wt, atk: Math.round(L * WMUL[wt]), spd: WSPD[wt], rng: WRNG[wt] + Math.round(L / 40), str: Math.round(L * 0.1), dex: (wt === 'sword' || wt === 'spear') ? Math.round(L * 0.07) : 0, price: price(6), col, desc: `${name}의 힘이 깃든 ${WNAME[wt]}` }); ids.push(id); }
    eq(`g${rid}${tag}_hm`, `${name} 투구`, 'helmet', L, { gen: true, def: Math.round(L * 0.7), hp: Math.round(L * 1.6), str: Math.round(L * 0.05), price: price(2.6), col, desc: `${name}의 투구` }); ids.push(`g${rid}${tag}_hm`);
    eq(`g${rid}${tag}_ar`, `${name} 갑옷`, 'armor', L, { gen: true, def: Math.round(L * 1.5), hp: Math.round(L * 3.2), str: Math.round(L * 0.06), price: price(5.5), col, desc: `${name}의 갑옷` }); ids.push(`g${rid}${tag}_ar`);
    eq(`g${rid}${tag}_gl`, `${name} 장갑`, 'gloves', L, { gen: true, def: Math.round(L * 0.35), atk: Math.round(L * 0.06), price: price(2.2), col, desc: `${name}의 장갑` }); ids.push(`g${rid}${tag}_gl`);
    eq(`g${rid}${tag}_sh`, `${name} 장화`, 'shoes', L, { gen: true, def: Math.round(L * 0.35), dex: Math.round(L * 0.05), price: price(2.2), col, desc: `${name}의 장화` }); ids.push(`g${rid}${tag}_sh`);
    return ids;
  };
  const ART = { woodmask: { w: 34, h: 44, ai: 'hop', icon: '🎭' }, boar: { w: 48, h: 34, ai: 'charge', icon: '🐗' }, golem: { w: 52, h: 60, ai: 'shoot', icon: '🗿' }, ant: { w: 38, h: 28, ai: 'walk', icon: '🐜' }, stump: { w: 40, h: 38, ai: 'walk', icon: '🪵' } };
  const REG = [
    { id: 'ludi', n: '루디브리엄', theme: 'toy', lv: [60, 72], sets: ['장난감', '시계태엽'], gc: ['#f0a8c8', '#e0b030'], hunts: ['장난감 공장', '시계탑'], boss: { n: '시계탑의 피에로 왕', art: 'balrog', tint: ['#7a3ac0', '#c8a0ff'] }, hid: '비밀 인형방', deco: ['#fbe7f0', '#e05a7a', '#5a8ae0'], npc: ['토리', '인형사 미미', '완구점 팡팡', '태엽 장인 기어', '장난감 병정 대장 루디', '비행선 조종사 팝'],
      mons: [['장난감 병정', 'woodmask', '#e0524a'], ['태엽 멧돼지', 'boar', '#f0b030'], ['블록 골렘', 'golem', '#4a8ae0'], ['시계 개미', 'ant', '#c8a050'], ['인형 그루터기', 'stump', '#d070b0'], ['피에로 가면', 'woodmask', '#7a5ae0']] },
    { id: 'aqua', n: '아쿠아로드', theme: 'ocean', lv: [72, 88], sets: ['산호', '심해'], gc: ['#f08a9a', '#3a8ac8'], hunts: ['산호 숲', '심해 협곡'], boss: { n: '심해의 군주', art: 'frostlord', tint: ['#1a4a78', '#4ab0c8'] }, hid: '가라앉은 보물선', deco: ['#d8f0f0', '#3a9ac0', '#f08a9a'], npc: ['말미잘 여관', '진주상 펄', '해초 약방 켈프', '조개 대장장이 쉘', '인어 경비대장 마리나', '고래 택시 웨일'],
      mons: [['해파리 가면', 'woodmask', '#7ad0f0'], ['가시 복어', 'boar', '#40a0b0'], ['산호 골렘', 'golem', '#e07a8a'], ['바다 개미', 'ant', '#4a8ab0'], ['조개 그루터기', 'stump', '#c8b090'], ['심해 가면', 'woodmask', '#2a4a8a']] },
    { id: 'leafre', n: '리프레', theme: 'dragon', lv: [88, 102], sets: ['용비늘', '용혼'], gc: ['#5aa070', '#e0b030'], hunts: ['용의 숲', '와이번 협곡'], boss: { n: '용의 군주', art: 'zakum', tint: ['#3a7a50', '#ffd24a'] }, hid: '고대 용의 둥지', deco: ['#e8f0d0', '#4a9a5a', '#c8a030'], npc: ['둥지 여관', '용알 상인 드레이', '비늘 약사 스케일', '용비늘 대장장이 파이어', '용기사 대장 리프', '용 조련사 와이번'],
      mons: [['새끼 용 가면', 'woodmask', '#7ac060'], ['용비늘 멧돼지', 'boar', '#5aa070'], ['용암석 골렘', 'golem', '#a06a40'], ['와이번 개미', 'ant', '#b09040'], ['고대 숲 그루터기', 'stump', '#6a8a40'], ['용사 가면', 'woodmask', '#d0a030']] },
    { id: 'mulung', n: '무릉', theme: 'bamboo', lv: [102, 116], sets: ['죽림', '도장'], gc: ['#8ab050', '#d06040'], hunts: ['대나무 숲', '수련 도장'], boss: { n: '무릉의 사범', art: 'bossgolem', tint: '#8a7a60' }, hid: '숨겨진 수련실', deco: ['#f4ecd0', '#6a9a50', '#c04a3a'], npc: ['다도 여관', '약초꾼 선화', '죽공예 상인 죽', '도장 대장장이 철', '도장 사범 무진', '학 택시 청학'],
      mons: [['대나무 가면', 'woodmask', '#8ab050'], ['호랑이 멧돼지', 'boar', '#e0a040'], ['석상 골렘', 'golem', '#9a9a8a'], ['수련 개미', 'ant', '#c0b090'], ['도장 그루터기', 'stump', '#a07840'], ['수도승 가면', 'woodmask', '#d06040']] },
    { id: 'magatia', n: '마가티아', theme: 'alchemy', lv: [116, 130], sets: ['연금', '현자'], gc: ['#a070d0', '#d0b050'], hunts: ['연금술 실험실', '고대 지하 서고'], boss: { n: '연금술사 장로', art: 'balrog', tint: ['#6a30a0', '#e0b8ff'] }, hid: '금지된 연구실', deco: ['#ece4f8', '#7a4ab0', '#50a8a0'], npc: ['플라스크 여관', '약제사 아르카', '시약 상인 레트', '연금 대장장이 골드', '연금술사 협회장 라자', '마법 열차 차장'],
      mons: [['연금 가면', 'woodmask', '#a070d0'], ['변이 멧돼지', 'boar', '#8a60a0'], ['플라스크 골렘', 'golem', '#50a8a0'], ['독충 개미', 'ant', '#80b040'], ['마법 그루터기', 'stump', '#9060b0'], ['고대 가면', 'woodmask', '#d0b050']] },
    { id: 'ariant', n: '아리안트', theme: 'desert', lv: [130, 145], sets: ['사막', '파라오'], gc: ['#d0a050', '#e0c030'], hunts: ['모래 언덕', '피라미드 입구'], boss: { n: '사막의 파라오', art: 'bossgolem', tint: '#d0a050' }, hid: '파라오의 비밀 무덤', deco: ['#f8ecc8', '#c08a40', '#5a9ac0'], npc: ['오아시스 여관', '향신료 상인 사하', '낙타 약방 카밀', '사막 대장장이 샌드', '투기장 대장 아리', '낙타 택시 카라반'],
      mons: [['모래 가면', 'woodmask', '#d8b070'], ['전갈 개미', 'ant', '#c08040'], ['사막 멧돼지', 'boar', '#d09050'], ['모래 골렘', 'golem', '#d0a060'], ['선인장 그루터기', 'stump', '#70a050'], ['미라 가면', 'woodmask', '#e0d0a0']] },
    { id: 'temple', n: '시간의 신전', theme: 'clock', lv: [145, 160], sets: ['톱니', '시간'], gc: ['#c0a050', '#7a8ac8'], hunts: ['망각의 길', '기억의 회랑'], boss: { n: '시간의 지배자', art: 'zakum', tint: ['#4a5a8a', '#ffe08a'] }, hid: '멈춰 버린 시간', deco: ['#efe6d6', '#8a7a58', '#6a7ab0'], npc: ['모래시계 여관', '시계방 약사 크로노', '태엽 상인 기어', '시간 대장장이 템포', '신전 수호대장 에온', '시간의 안내자 모멘트'],
      mons: [['톱니 가면', 'woodmask', '#c0a050'], ['시간 멧돼지', 'boar', '#6a8ab0'], ['태엽 골렘', 'golem', '#b08a50'], ['모래시계 개미', 'ant', '#a0a0b0'], ['시계 그루터기', 'stump', '#8a7a5a'], ['망각의 가면', 'woodmask', '#5a5a8a']] },
    { id: 'edel', n: '에델슈타인', theme: 'steam', lv: [160, 175], sets: ['증기', '강철'], gc: ['#a89a78', '#7080a0'], hunts: ['증기 공장', '지하 광산'], boss: { n: '철의 군주', art: 'frostlord', tint: ['#8a90a0', '#e0a040'] }, hid: '폐기된 연구소', deco: ['#e8e0d4', '#8a7a68', '#c08a40'], npc: ['굴뚝 여관', '기계 약사 볼트', '부품 상인 너트', '증기 대장장이 스팀', '저항군 대장 에델', '비공정 정비사 프롭'],
      mons: [['증기 가면', 'woodmask', '#8a8a90'], ['기계 멧돼지', 'boar', '#a05040'], ['철골 골렘', 'golem', '#7080a0'], ['나사 개미', 'ant', '#a09060'], ['굴뚝 그루터기', 'stump', '#6a5a4a'], ['폭주 로봇 가면', 'woodmask', '#c04040']] },
    { id: 'cosmos', n: '코스모스', theme: 'space', lv: [175, 200], sets: ['별빛', '공허'], gc: ['#a0a0ff', '#5a3aa8'], hunts: ['유성 평원', '공허의 심연'], boss: { n: '코스모스의 지배자', art: 'balrog', tint: ['#2a1a6a', '#a0c0ff'] }, hid: '은하의 틈', deco: ['#e0e0f8', '#5a4ab0', '#a0a0ff'], npc: ['별똥별 여관', '성운 약사 네뷸라', '우주 상인 코멧', '운석 대장장이 아스트로', '은하 수호대장 갤럭시', '우주선 조종사 오리온'],
      mons: [['별빛 가면', 'woodmask', '#a0a0ff'], ['혜성 멧돼지', 'boar', '#6a6aff'], ['운석 골렘', 'golem', '#6a5a8a'], ['우주 개미', 'ant', '#5a8aff'], ['성운 그루터기', 'stump', '#7a5ab0'], ['공허의 가면', 'woodmask', '#3a2a5a']] },
  ];
  D.REGIONS = REG.map((r) => ({ id: r.id, n: r.n, town: 'town_' + r.id, min: r.lv[0] - 2, lv: r.lv }));
  D.TOWNS = [{ id: 'perion', n: '페리온', min: 1, x: 700 }, { id: 'orbis', n: '오르비스', min: 38, x: 450 }].concat(D.REGIONS.map((r) => ({ id: r.town, n: r.n, min: r.min, x: 400 })));
  const QRW = [0.08, 0.1, 0.12, 0.14, 0.16, 0.18, 0.45];
  const genQuests = {}; const genOrder = [];
  REG.forEach((r, ri) => {
    const [L0, L1] = r.lv, span = L1 - L0, Lb = L1 + 2, [hpP, mpP] = potTier(L0);
    const mids = [], tag = r.id;
    // 몬스터 6 + 재료 6
    r.mons.forEach((mm, i) => {
      const L = Math.round(L0 + i * (span - 2) / 5), A = ART[mm[1]]; const mat = `${tag}m${i}`; etc(mat, `${mm[0]} 조각`, A.icon, Math.round(Math.pow(L, 1.9)), mm[2]); mids.push(mat);
    });
    const setA = genSet(tag, 'a', r.sets[0], r.gc[0], L0 + 2), setB = genSet(tag, 'b', r.sets[1], r.gc[1], L0 + Math.round(span * 0.65));
    r.mons.forEach((mm, i) => {
      const L = Math.round(L0 + i * (span - 2) / 5), A = ART[mm[1]]; const pool = i < 3 ? setA : setB; const eqd = [0, 1, 2].map((k) => [pool[(i * 3 + k) % pool.length], 0.008]);
      mon(`${tag}${i}`, mm[0], L, mm[1], { hue: mm[2], hp: GL.hp(L), atk: GL.atk(L), def: GL.def(L), exp: GL.exp(L), speed: 58 + Math.round(L / 6), w: A.w, h: A.h, ai: A.ai, aggro: 260, mesos: [Math.round(L * L * 0.7), Math.round(L * L * 1.2)], drops: [[mids[i], 0.5], [potTier(L)[0], 0.07], [potTier(L)[1], 0.05]], eq: eqd });
      scrollDrops(M[`${tag}${i}`]);
    });
    // 보스 + 증표 + 전용 투구
    const bl = Lb, bid = `${tag}b`, tk = `${tag}tk`; etc(tk, `${r.boss.n}의 증표`, '🏵️', 0, r.gc[1]);
    const bh = `${tag}bh`; eq(bh, `${r.boss.n}의 투구`, 'helmet', bl - 4, { gen: true, def: Math.round(bl * 0.9), atk: Math.round(bl * 0.12), str: Math.round(bl * 0.1), dex: Math.round(bl * 0.1), hp: Math.round(bl * 9), slots: 10, price: Math.round(Math.pow(bl, 2.7) * 8), col: Array.isArray(r.boss.tint) ? r.boss.tint[1] : r.boss.tint, desc: `${r.boss.n}를 쓰러뜨린 자의 투구. 강화 가능 횟수 10회!` });
    const ais = ['bosszakum', 'bossbalrog', 'bossfrost'];
    mon(bid, r.boss.n, bl, r.boss.art, { boss: true, ai: ais[ri % 3], tint: r.boss.tint, hp: GL.hp(bl) * 12, atk: Math.round(GL.atk(bl) * 1.2), def: Math.round(GL.def(bl) * 1.1), exp: Math.round(D.expToNext(bl) * 0.35), speed: 30, w: 125, h: 148, aggro: 800, mesos: [bl * bl * 6, bl * bl * 9], drops: [[tk, 1], [potTier(bl)[0], 1], [potTier(bl)[0], 0.8], [potTier(bl)[1], 1], ['scW10', 1], ['scA10', 1], ['scC60', 0.6], ['scG', 0.5], ['scS10', 0.5], ['scD10', 0.5], ['scH10', 0.5]], eq: [[bh, 0.2]].concat(setB.map((id) => [id, 0.22])) });
    // 포션·장비 상점
    D.SHOPS['tpot_' + tag] = { n: `${r.n} 잡화점`, items: [hpP, mpP, potTier(L1)[0], potTier(L1)[1], 'scroll'].filter((x, i, a) => a.indexOf(x) === i) };
    D.SHOPS['tsm_' + tag] = { n: `${r.n} 장비 상점`, items: setA.concat(setB) };
    // 맵
    const T = 'town_' + tag, H1 = tag + '_h1', H2 = tag + '_h2', BM = 'boss_' + tag, HM = 'hid_' + tag, mon3 = (a) => a.map((i) => `${tag}${i}`);
    const q = (k) => `${tag}q${k}`;
    maps[T] = { id: T, n: r.n, sub: '마을', lvTxt: `마을 · Lv ${L0}~${L1}`, town: true, w: 2800, h: 460, theme: r.theme, bgm: 'town_' + tag, deco: r.deco, plats: [P(0, 400, 2800, 1), P(1150, 330, 340), P(2050, 330, 320)], ladders: [{ x: 1220, y1: 330, y2: 400 }, { x: 2120, y1: 330, y2: 400 }], spawns: [],
      portals: [{ id: 'toHunt', x: 2720, to: H1, tx: 'back', label: r.hunts[0], lv: `Lv ${L0}~${Math.round(L0 + span / 2)}`, col: '#9cf' }],
      npcs: [
        { id: tag + '_inn', n: r.npc[0], x: 520, role: 'inn', look: 'innkeeper', quests: [] },
        { id: tag + '_potion', n: r.npc[1], x: 860, role: 'shop', shop: 'tpot_' + tag, shopKind: 'potion', look: 'merchant', quests: [q(2)] },
        { id: tag + '_smith', n: r.npc[3], x: 1320, y: 330, role: 'shop', shop: 'tsm_' + tag, shopKind: 'smith', look: 'smith', quests: [q(4)] },
        { id: tag + '_scribe', n: r.npc[2], x: 1700, role: 'shop', shop: 'scroll', shopKind: 'scroll', look: 'scribe', quests: [q(6)] },
        { id: tag + '_captain', n: r.npc[4], x: 2200, y: 330, role: 'quest', look: 'captain', quests: [q(1), q(3), q(5), q(7)] },
        { id: tag + '_travel', n: r.npc[5], x: 2480, role: 'travel', look: 'miner', quests: [] },
      ].concat(tag === 'magatia' ? [{ id: 'mag_master4', n: '시간의 관문지기 크로노스', x: 2600, role: 'master4', look: 'master', quests: ['qt4'] }] : []) };
    huntMap(H1, r.hunts[0], `Lv ${L0}~${Math.round(L0 + span * 0.55)}`, r.theme, 'hunt_' + tag, mon3([0, 1, 2]), [{ id: 'back', x: 60, to: T, tx: 'toHunt', label: r.n }, { id: 'next', x: 2740, to: H2, tx: 'back', label: r.hunts[1], lv: `Lv ${Math.round(L0 + span * 0.4)}~${L1}`, col: '#cfe' }]);
    huntMap(H2, r.hunts[1], `Lv ${Math.round(L0 + span * 0.4)}~${L1}`, r.theme, 'hunt_' + tag, mon3([3, 4, 5]), [{ id: 'back', x: 60, to: H1, tx: 'next', label: r.hunts[0] }, { id: 'next', x: 2740, to: BM, tx: 'back', label: r.boss.n, lv: `Lv ${bl - 2}+ 보스`, col: '#f96' }, { id: 'hid', x: 1020, y: 228, to: HM, tx: 'back', label: r.hid, hidden: true, col: '#b8f' }]);
    maps[BM] = { id: BM, n: `${r.boss.n}의 방`, sub: '보스', lvTxt: `Lv ${bl - 2}+ 보스`, w: 2000, h: 460, theme: r.theme, bgm: 'boss_' + tag, boss: bid, bossX: 1400, plats: [P(0, 400, 2000, 1), P(160, 330, 280), P(1560, 330, 280), P(860, 238, 280)], ladders: [{ x: 980, y1: 238, y2: 400 }], spawns: [], portals: [{ id: 'back', x: 60, to: H2, tx: 'next', label: r.hunts[1] }], npcs: [] };
    maps[HM] = { id: HM, n: r.hid, sub: '히든 스트리트', lvTxt: `Lv ${Math.round(L0 + span * 0.4)}~${L1} · 경험치×1.6 드랍×1.5`, w: 2200, h: 520, theme: r.theme, bgm: 'hidden', expMul: 1.6, dropMul: 1.5,
      plats: [P(0, 460, 2200, 1), P(160, 392, 300), P(640, 392, 300), P(1120, 392, 300), P(1600, 392, 320), P(400, 324, 280), P(900, 324, 260), P(1380, 324, 260), P(1860, 324, 240), P(640, 256, 260), P(1160, 256, 260), P(1640, 256, 240)], ladders: [{ x: 300, y1: 392, y2: 460 }, { x: 1700, y1: 392, y2: 460 }],
      spawns: [[3, 0, 5], [4, 0, 4], [5, 0, 3], [3, 1, 3], [4, 2, 3], [5, 3, 3], [3, 4, 3], [4, 5, 3], [5, 6, 3], [4, 7, 3], [3, 8, 3], [5, 9, 3], [4, 10, 3], [3, 11, 3]].map((a) => ({ m: `${tag}${a[0]}`, p: a[1], n: a[2] })), portals: [{ id: 'back', x: 60, to: H2, tx: 'hid', label: r.hunts[1] }], npcs: [] };
    // 퀘스트 7개
    const ex = (lv, k) => Math.round(D.expToNext(lv) * QRW[k - 1]), me = (lv, k) => Math.round(Math.pow(lv, 2.2) * (1 + k * 0.4));
    const mk = (k, name, npc, lv, ask, doing, done, goals, items) => { const id = q(k); genQuests[id] = { n: name, npc, lv, pre: k === 1 ? null : q(k - 1), ask, doing, done, goals, reward: { exp: ex(lv, k), meso: me(lv, k), items } }; genOrder.push(id); };
    const M0 = (i) => r.mons[i][0], Lv = (k) => Math.round(L0 + (k - 1) * span / 7);
    mk(1, `${r.hunts[0]} 정찰`, tag + '_captain', Lv(1), `${r.n}에 온 걸 환영한다! **${M0(0)} 40마리**를 처치해 길을 열어 주게.`, `${r.hunts[0]}은(는) 마을 오른쪽 끝 포탈이다.`, '수고했네! 이건 약소한 보상일세.', [{ kill: `${tag}0`, n: 40 }], [[hpP, 15], [mpP, 15], [setA[7], 1]]);
    mk(2, `${M0(1)} 사냥 부탁`, tag + '_potion', Lv(2), `물약 재료가 부족해요! **${r.mons[1][0]} 조각 15개**만 모아 주세요.`, `${r.mons[1][0]}에게서 가끔 나와요.`, '정말 고마워요! 물약을 드릴게요.', [{ item: mids[1], n: 15 }], [[hpP, 25], [mpP, 25]]);
    mk(3, `${M0(2)} 소탕`, tag + '_captain', Lv(3), `**${M0(2)} 45마리**를 처치해 주게. 놈들이 점점 많아지고 있네.`, `${r.hunts[0]} 깊은 곳에 있다.`, '훌륭하네! 투구를 받게.', [{ kill: `${tag}2`, n: 45 }], [[setA[5], 1], ['scW60', 3], ['scA60', 3]]);
    mk(4, `${M0(3)}의 부품`, tag + '_smith', Lv(4), `${M0(3)}의 조각으로 최고의 장비를 만들 수 있지. **${r.mons[3][0]} 조각 20개**를 가져오게.`, `${r.hunts[1]}에 나온다.`, '이거면 충분하군! 약속한 갑옷이야.', [{ item: mids[3], n: 20 }], [[setA[6], 1], ['scW30', 2], ['scA30', 2]]);
    mk(5, `${M0(4)} 토벌`, tag + '_captain', Lv(5), `**${M0(4)} 50마리**를 처치하게. 길을 막고 있어서 곤란하다네.`, `${r.hunts[1]}에 많네.`, '대단하군! 보급품을 받게.', [{ kill: `${tag}4`, n: 50 }], [[potTier(Lv(5))[0], 40], [potTier(Lv(5))[1], 40], [setB[8], 1]]);
    mk(6, `${M0(5)}의 비밀`, tag + '_scribe', Lv(6), `${M0(5)}에게서 얻는 조각으로 특별한 주문서를 만들 수 있어요! **${r.mons[5][0]} 조각 20개**를 모아 주세요.`, `${r.hunts[1]}의 가장 안쪽에서 나와요.`, '고마워요! 특별한 주문서를 드릴게요 ✨', [{ item: mids[5], n: 20 }], [['scS30', 3], ['scD30', 3], ['scH30', 3], ['scG', 1]]);
    mk(7, `${r.boss.n} 토벌`, tag + '_captain', Lb - 2, `**${r.boss.n}**가 깨어났다! 처치하고 **${r.boss.n}의 증표**를 가져오게. 전설의 장비를 내주겠네.`, `${r.hunts[1]} 오른쪽 끝 포탈이 보스의 방이다.`, '해냈군! 영웅이라 부르겠네. 보상을 받게.', [{ kill: bid, n: 1 }, { item: tk, n: 1 }], [[setB[6], 1], [setB[0], 1], [setB[1], 1], [setB[2], 1], [setB[3], 1], [setB[4], 1], ['scC60', 2], ['scG', 2]]);
  });
  // 4차 전직의 시험 (마가티아, Lv120): 마가티아 사냥터 몬스터 + 재료
  genQuests.qt4 = { n: '4차 전직의 시험', npc: 'mag_master4', lv: 120, pre: 'magatiaq3', ask: '4차 전직은 전사의 끝에 이른 자만 받을 수 있다. 마가티아의 **플라스크 골렘 30마리**를 처치하고, **독충 개미 조각 20개**를 가져와라. 통과하면 **4차 전직**을 시켜 주마!',
    doing: '마가티아의 연금술 실험실과 고대 지하 서고를 살펴라.', done: '시험을 통과했다! 이제 4차 전직을 할 수 있다. 나에게 다시 말을 걸어라.', goals: [{ kill: 'magatia2', n: 30 }, { item: 'magatiam3', n: 20 }], reward: { exp: Math.round(D.expToNext(120) * 0.5), meso: 400000, items: [['scW10', 3], ['scA10', 3], ['scG', 2]] } };
  genOrder.splice(genOrder.indexOf('magatiaq3') + 1, 0, 'qt4');
  // 오르비스 -> 새 지역: 비공정 조종사
  maps.orbis.npcs.push({ id: 'o_travel', n: '비공정 조종사 하리', x: 2800, role: 'travel', look: 'miner', quests: [] });
  Object.assign(D.QUESTS, genQuests); D.QUEST_ORDER = D.QUEST_ORDER.concat(genOrder);

  // 자동 밧줄: 위아래로 겹치는 발판 사이마다 밧줄을 놓아 모든 발판을 걸어서(밧줄로) 오를 수 있게 한다 (점프맵·마을 제외)
  for (const id in maps) {
    const m = maps[id]; if (m.town || id === 'trial') continue; m.ladders = m.ladders || [];
    for (const B of m.plats) {
      let A = null; for (const q of m.plats) { if (q.y > B.y && q.y - B.y <= 90 && Math.min(q.x + q.w, B.x + B.w) - Math.max(q.x, B.x) >= 40 && (!A || q.y < A.y)) A = q; }
      if (!A) continue;
      const lo = Math.max(A.x, B.x) + 14, hi = Math.min(A.x + A.w, B.x + B.w) - 14; if (hi - lo < 10) continue; const x = Math.round((lo + hi) / 2);
      if (m.ladders.some((l) => Math.abs(l.x - x) < 70 && l.y1 === B.y)) continue;
      m.ladders.push({ x, y1: B.y, y2: A.y });
    }
  }

  root.DATA = D;
  if (typeof module !== 'undefined' && module.exports) module.exports = D;
})(typeof window !== 'undefined' ? window : globalThis);
