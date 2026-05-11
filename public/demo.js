/* ============================================================
   SORTED — INTERACTIVE DEMO ENGINE
   Each screen renderer matches the Figma design pixel-for-pixel
   while keeping all interactivity (keypad, holds, toggles, etc).
   ============================================================ */
(function () {
  'use strict';

  // ============================================================
  // STATE
  // ============================================================
  const initialState = () => ({
    balance: 1247.50,
    earnedToday: 0.11,
    lifetimeEarned: 3.80,
    handle: '@hannah',
    name: 'Hannah Reid',
    avatarColor: 'lime',
    sendAmount: 0,
    sendRecipient: null,
    sendMode: 'handle',   // 'handle' | 'sms'
    topUpAmount: 500,
    pendingSms: null,
    contacts: [
      { name: 'Jack Lawson',    handle: '@jackl',    color: 'sky',    initials: 'JL' },
      { name: 'Maya Chen',      handle: '@maya',     color: 'coral',  initials: 'MC' },
      { name: 'Naomi Wilson',   handle: '@naomi',    color: 'butter', initials: 'NW' },
      { name: 'Charlie Nguyen', handle: '@charlien', color: 'plum',   initials: 'CN' },
    ],
    activity: [
      { who: 'Yield earned', subtitle: 'Daily payout · 32m ago', amount: '+$0.11',   color: 'lime',   initials: '✦', section: 'TODAY' },
      { who: 'Jack Lawson',  subtitle: 'banh mi · 1h ago',       amount: '−$20.00', color: 'sky',    initials: 'JL', section: 'TODAY' },
      { who: 'Maya Chen',    subtitle: 'concert ticket · 4h ago',amount: '+$48.50', color: 'coral',  initials: 'MC', section: 'TODAY' },
      { who: 'Yield earned', subtitle: 'Daily payout · 1d ago',  amount: '+$0.10',   color: 'lime',   initials: '✦', section: 'YESTERDAY' },
      { who: 'Top up',       subtitle: 'Bank transfer · CommBank ····0421', amount: '+$500.00', color: 'butter', initials: '$', section: 'YESTERDAY' },
      { who: 'Naomi Wilson', subtitle: 'rent share · 3d ago',    amount: '−$420.00',color: 'butter', initials: 'NW', section: 'THIS WEEK' },
      { who: 'Yield earned', subtitle: 'Daily payout · 4d ago',  amount: '+$0.09',   color: 'lime',   initials: '✦', section: 'THIS WEEK' },
    ],
    history: [],
    current: null,
  });
  let state = initialState();

  // ============================================================
  // NAVIGATION
  // ============================================================
  const stage = document.getElementById('stage');

  function navigate(screenId, direction = 'forward', skipHistory = false) {
    if (!skipHistory && state.current && direction === 'forward') {
      state.history.push(state.current);
    }
    const oldScreen = stage.querySelector('.screen');
    const renderer = SCREENS[screenId];
    if (!renderer) { console.error('No screen:', screenId); return; }

    const newScreen = renderer();
    newScreen.classList.add('screen');
    newScreen.dataset.screenId = screenId;
    newScreen.dataset.state = direction === 'forward' ? 'entering-right' : 'entering-left';
    stage.appendChild(newScreen);

    if (oldScreen) {
      oldScreen.dataset.state = direction === 'forward' ? 'exiting-left' : 'exiting-right';
      setTimeout(() => oldScreen.remove(), 320);
    }
    state.current = screenId;
    updateCaptions(screenId);
  }
  function back() {
    if (state.history.length === 0) return;
    const prev = state.history.pop();
    navigate(prev, 'back', true);
  }
  function reset() {
    state = initialState();
    const old = stage.querySelector('.screen'); if (old) old.remove();
    navigate('welcome', 'forward', true);
  }

  // ============================================================
  // CAPTIONS
  // ============================================================
  const CAPTIONS = {
    welcome: [
      { pos: 'tl', text: "G'day! Tap Continue to start the onboarding flow." },
      { pos: 'br', text: 'Free, instant peer-to-peer payments. Built on Solana.' },
    ],
    verify: [{ pos: 'tr', text: 'OTP via SMS. Tap any cell to fill in the code, or hit Auto-fill.' }],
    'claim-handle': [{ pos: 'tl', text: 'Pick your @handle. This is how mates find you.' }],
    'profile-setup': [{ pos: 'br', text: 'Choose a colour for your avatar.' }],
    'kyc-verifying': [
      { pos: 'tl', text: 'FrankieOne handles KYC. AUSTRAC-compliant.' },
      { pos: 'br', text: 'Privy provisions your wallet on Solana mainnet.' },
    ],
    'wallet-ready': [{ pos: 'tl', text: "You're in. Tap to head to the home screen." }],
    home: [
      { pos: 'tl', text: 'Your AUDD balance — earns 3.33% p.a., paid daily.' },
      { pos: 'tr', text: 'Tap Send to pay by @handle or SMS.' },
    ],
    yield: [{ pos: 'tl', text: 'Same model as the neobanks. No tiers, no lock-up.' }],
    'send-who': [{ pos: 'br', text: "Mate not on Sorted yet? Tap 'Send via SMS' to text them." }],
    'send-amount': [{ pos: 'tr', text: 'Big keypad, big numbers. Tap presets or type.' }],
    'send-confirm': [{ pos: 'br', text: 'Hold the green button to send. Solana settles in <2 sec.' }],
    'send-done': [{ pos: 'tl', text: 'Done. Receipt saved. Tx ID on-chain.' }],
    'send-sms-number': [{ pos: 'tl', text: 'No @handle needed — just their mobile number.' }],
    'send-sms-confirm': [{ pos: 'br', text: '24h undo + 12h reminder. Peace of mind built in.' }],
    'send-sms-pending': [{ pos: 'tr', text: "We'll text them this exact message. They claim in 60 sec." }],
    receive: [{ pos: 'tr', text: 'Share your @handle. Or show your QR.' }],
    activity: [{ pos: 'tl', text: 'Every send, receive, and yield drop. One feed.' }],
    'topup-amount': [{ pos: 'br', text: 'Top up via PayID. Lands in seconds.' }],
    'topup-payid': [{ pos: 'tl', text: "Use this PayID in your bank app — or tap 'Simulate' for the demo." }],
    settings: [{ pos: 'tr', text: 'Profile, verification, notifications — all here.' }],
    'settings-profile': [{ pos: 'tl', text: '@handle and mobile lock once verified.' }],
    'settings-verification': [{ pos: 'br', text: 'Tier 1 ships free. Tier 2 unlocks higher limits.' }],
    'settings-notifications': [{ pos: 'tl', text: 'We default to less, not more.' }],
  };
  const captionEls = {
    tl: document.querySelector('[data-caption="tl"]'),
    tr: document.querySelector('[data-caption="tr"]'),
    bl: document.querySelector('[data-caption="bl"]'),
    br: document.querySelector('[data-caption="br"]'),
  };
  function updateCaptions(screenId) {
    Object.values(captionEls).forEach((el) => { el.hidden = true; });
    const caps = CAPTIONS[screenId] || [];
    caps.forEach(({ pos, text }) => {
      const el = captionEls[pos];
      if (el) { el.querySelector('.caption-text').textContent = text; el.hidden = false; }
    });
  }

  // ============================================================
  // DOM HELPER
  // ============================================================
  function h(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (v == null) return;
      if (k === 'class') el.className = v;
      else if (k === 'style') el.setAttribute('style', v);
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
      else el.setAttribute(k, v);
    });
    children.flat().forEach((c) => {
      if (c == null || c === false) return;
      if (typeof c === 'string' || typeof c === 'number') el.appendChild(document.createTextNode(c));
      else el.appendChild(c);
    });
    return el;
  }
  function fmtMoney(n) {
    return n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // ============================================================
  // SHARED PARTS
  // ============================================================
  function Header(eyebrow, onBack) {
    return h('div', { class: 'scr-header' },
      onBack ? h('button', { class: 'scr-back', type: 'button', onclick: onBack }, '←') : h('div', { class: 'scr-spacer-40' }),
      eyebrow ? h('span', { class: 'scr-eyebrow-md' }, eyebrow) : h('span'),
      h('div', { class: 'scr-spacer-40' })
    );
  }
  function Avatar(color, initials, size = 'md') {
    return h('div', { class: `scr-avatar scr-avatar--${size} scr-avatar--${color}` }, initials);
  }
  function Tile(color, emoji, size = 'lg') {
    return h('div', { class: `scr-tile scr-tile--${size} scr-tile--${color}` }, emoji);
  }
  function BottomNav(active) {
    const nav = h('div', { class: 'scr-bottom-nav' });
    [
      { key: 'home',     label: 'HOME',     screen: 'home' },
      { key: 'activity', label: 'ACTIVITY', screen: 'activity' },
      { key: 'settings', label: 'SETTINGS', screen: 'settings' },
    ].forEach((item) => {
      const isActive = item.key === active;
      nav.appendChild(h('button', {
        type: 'button',
        class: `scr-nav-item ${isActive ? 'is-active' : ''}`,
        onclick: () => { if (!isActive) { state.history = []; navigate(item.screen, 'forward', true); } },
      }, item.label));
    });
    return nav;
  }

  // ============================================================
  // SCREEN REGISTRY (each renderer below)
  // ============================================================
  const SCREENS = {};

  // ============================================================
  // 7. HOME — built from exact Figma 48:68 spec
  // ============================================================
  SCREENS.home = function () {
    const wrap = h('div', { style: 'position: relative; min-height: 100%; padding-bottom: 104px;' });

    // Header: G'DAY eyebrow + Hannah h2 + avatar (absolute-positioned per Figma: top 60-16=44 + 16pad)
    const header = h('div', {
      style: 'display: flex; align-items: center; justify-content: space-between; padding: 16px 24px;'
    },
      h('div', { style: 'display: flex; flex-direction: column; gap: 4px; flex: 1;' },
        h('div', { class: 'scr-eyebrow-sm' }, "G'DAY"),
        h('div', { class: 'scr-h2' }, 'Hannah')
      ),
      Avatar('lime', 'HR', 'md')
    );
    wrap.appendChild(header);

    // Balance card — exact Figma: 342w, 200h, dark ink, 22px padding-top/x, 18px padding-bottom, 16px gap
    const card = h('div', {
      style: 'margin: 8px 24px 0; padding: 22px 22px 18px; height: 200px; border-radius: 24px; background: var(--ink); color: var(--text-inverse); display: flex; flex-direction: column; gap: 16px; box-sizing: border-box;'
    });
    card.appendChild(h('div', {
      style: 'font-family: var(--font-mono); font-weight: 500; font-size: 11px; line-height: 16px; letter-spacing: 1.98px; text-transform: uppercase; color: var(--text-inverse);'
    }, 'AVAILABLE BALANCE'));

    // Big balance: Inter 56px with .55 opacity on $ and cents
    const balRow = h('div', { style: 'display: flex; gap: 4px; align-items: baseline; color: var(--text-inverse);' });
    balRow.appendChild(h('span', {
      style: 'font-family: var(--font-numeric); font-weight: 700; font-size: 22px; opacity: 0.55;'
    }, '$'));
    balRow.appendChild(h('span', {
      style: 'font-family: var(--font-numeric); font-weight: 700; font-size: 56px; line-height: 56px; letter-spacing: -2.24px;'
    }, fmtMoney(state.balance).split('.')[0]));
    balRow.appendChild(h('span', {
      style: 'font-family: var(--font-numeric); font-weight: 700; font-size: 22px; opacity: 0.55;'
    }, '.' + fmtMoney(state.balance).split('.')[1]));
    card.appendChild(balRow);

    // Action buttons: ↑ Send (lime, flex:1), ↓ Receive (paper-elevated, flex:1), + (white-10 alpha, 44x44 square)
    const actions = h('div', { style: 'display: flex; gap: 8px; height: 44px;' });
    actions.appendChild(h('button', {
      type: 'button',
      style: 'flex: 1; border: none; padding: 11px 16px; border-radius: 14px; background: var(--lime); color: var(--text-primary); font-family: var(--font-body); font-weight: 600; font-size: 14px; letter-spacing: -0.14px; cursor: pointer;',
      onclick: () => navigate('send-who'),
    }, '↑ Send'));
    actions.appendChild(h('button', {
      type: 'button',
      style: 'flex: 1; border: none; padding: 11px 16px; border-radius: 14px; background: var(--paper-elevated); color: var(--text-primary); font-family: var(--font-body); font-weight: 600; font-size: 14px; letter-spacing: -0.14px; cursor: pointer;',
      onclick: () => navigate('receive'),
    }, '↓ Receive'));
    actions.appendChild(h('button', {
      type: 'button',
      style: 'width: 44px; height: 44px; border: none; border-radius: 14px; background: rgba(255,255,255,0.1); color: var(--text-inverse); font-family: var(--font-numeric); font-weight: 700; font-size: 22px; cursor: pointer; padding: 0;',
      onclick: () => navigate('topup-amount'),
    }, '+'));
    card.appendChild(actions);
    wrap.appendChild(card);

    // Earnings strip — lime, 342w, 16px padding-x, 12px padding-y, 16px radius
    const earnings = h('button', {
      type: 'button',
      style: 'margin: 20px 24px 0; width: calc(100% - 48px); background: var(--lime); border: none; padding: 12px 16px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; box-sizing: border-box;',
      onclick: () => navigate('yield'),
    });
    earnings.appendChild(h('div', { style: 'display: flex; gap: 8px; align-items: center;' },
      h('span', {
        style: 'font-family: var(--font-mono); font-weight: 500; font-size: 10px; line-height: 14px; letter-spacing: 1.6px; text-transform: uppercase; opacity: 0.65; color: var(--text-primary);'
      }, 'EARNED TODAY'),
      h('span', {
        style: 'font-family: var(--font-numeric); font-weight: 700; font-size: 17px; line-height: 20px; color: var(--text-primary);'
      }, '+$0.11')
    ));
    earnings.appendChild(h('div', { style: 'display: flex; gap: 4px; align-items: baseline;' },
      h('span', { style: 'font-family: var(--font-numeric); font-weight: 700; font-size: 20px; color: var(--text-primary);' }, '3.33'),
      h('span', { style: 'font-family: var(--font-numeric); font-weight: 700; font-size: 14px; color: var(--text-primary);' }, '%'),
      h('span', { style: 'font-family: var(--font-mono); font-weight: 500; font-size: 10px; letter-spacing: 1.6px; text-transform: uppercase; color: var(--text-primary);' }, 'APY')
    ));
    wrap.appendChild(earnings);

    // Recent activity section
    const activitySection = h('div', { style: 'padding: 20px 24px 0; display: flex; flex-direction: column; gap: 12px;' });
    activitySection.appendChild(h('div', { style: 'display: flex; justify-content: space-between; align-items: center;' },
      h('div', { class: 'scr-h4' }, 'Recent activity'),
      h('button', {
        type: 'button',
        style: 'background: none; border: none; padding: 0; cursor: pointer; font-family: var(--font-mono); font-weight: 500; font-size: 10px; letter-spacing: 1.6px; text-transform: uppercase; color: var(--text-tertiary);',
        onclick: () => navigate('activity'),
      }, 'SEE ALL →')
    ));

    // Activity list
    const list = h('div', { style: 'display: flex; flex-direction: column; gap: 8px;' });

    // Pending SMS pinned on top if present
    if (state.pendingSms) {
      const row = h('div', { class: 'scr-activity-row scr-activity-row--pending' });
      row.appendChild(h('div', {
        style: 'width: 40px; height: 40px; border-radius: 999px; background: var(--paper-elevated); border: 2px dashed var(--ink); display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;'
      }, '📱'));
      row.appendChild(h('div', { class: 'scr-activity-details' },
        h('div', { style: 'display: flex; gap: 6px; align-items: center;' },
          h('div', { class: 'scr-h6' }, state.pendingSms.name),
          h('span', { class: 'scr-pill scr-pill--pending', style: 'padding: 1px 6px; font-size: 9px;' }, 'PENDING')
        ),
        h('div', { class: 'scr-body-xs' }, 'SMS sent · awaiting claim · undo for 24h')
      ));
      row.appendChild(h('div', { class: 'scr-activity-amount scr-activity-amount--out' }, '−$' + fmtMoney(state.pendingSms.amount)));
      list.appendChild(row);
    }

    // Today's activities (first 4 to fit Figma)
    state.activity.filter((a) => a.section === 'TODAY').slice(0, 3).forEach((a) => {
      list.appendChild(buildActivityRow(a));
    });
    // Yield earned 1d ago (Figma shows this on home)
    const yesterdayYield = state.activity.find((a) => a.section === 'YESTERDAY' && a.who === 'Yield earned');
    if (yesterdayYield) list.appendChild(buildActivityRow(yesterdayYield));

    activitySection.appendChild(list);
    wrap.appendChild(activitySection);

    wrap.appendChild(BottomNav('home'));
    return wrap;
  };

  function buildActivityRow(a) {
    const row = h('div', { class: 'scr-activity-row' });
    row.appendChild(Avatar(a.color, a.initials, 'md'));
    row.appendChild(h('div', { class: 'scr-activity-details' },
      h('div', { class: 'scr-h6' }, a.who),
      h('div', { class: 'scr-body-xs' }, a.subtitle)
    ));
    row.appendChild(h('div', {
      class: 'scr-activity-amount' + (a.amount.startsWith('−') ? ' scr-activity-amount--out' : '')
    }, a.amount));
    return row;
  }

  // ============================================================
  // INIT — boot to Welcome (but Welcome isn't built yet,
  // so for testing we'll boot to home for now)
  // ============================================================
  document.getElementById('resetDemo').addEventListener('click', reset);

  const screenContainer = document.getElementById('screen');
  const backIndicator = document.getElementById('backIndicator');
  let touchStartX = null;
  screenContainer.addEventListener('touchstart', (e) => {
    if (e.touches[0].clientX < 25) touchStartX = e.touches[0].clientX;
  }, { passive: true });
  screenContainer.addEventListener('touchmove', (e) => {
    if (touchStartX == null) return;
    const dx = e.touches[0].clientX - touchStartX;
    if (dx > 0) backIndicator.style.width = Math.min(dx, 120) + 'px';
  }, { passive: true });
  screenContainer.addEventListener('touchend', () => {
    if (touchStartX == null) return;
    const w = parseInt(backIndicator.style.width || '0');
    if (w > 60) back();
    backIndicator.style.width = '0';
    touchStartX = null;
  });

  // TEMP: boot to home for testing Batch 1
  navigate('home', 'forward', true);

  window.__sortedDemo = { state, navigate, back, reset, SCREENS };
})();
