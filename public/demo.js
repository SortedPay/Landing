/* ============================================================
   SORTED — INTERACTIVE DEMO ENGINE
   No framework. Just DOM, state, and good vibes.
   ============================================================ */
(function () {
  'use strict';

  // ------- STATE -------
  const state = {
    balance: 1247.50,
    earnedToday: 0.11,
    lifetimeEarned: 3.80,
    handle: '@hannah',
    name: 'Hannah Reid',
    sendAmount: 0,
    sendRecipient: null,   // { name, handle, avatar, color, initials } or { phone, name } for SMS
    sendMode: 'handle',     // 'handle' | 'sms'
    topUpAmount: 500,
    pendingSms: null,       // { name, phone, amount } if a pending SMS send exists
    visitedHome: false,     // for caption switching
    contacts: [
      { name: 'Jack Lawson', handle: '@jackl', color: 'sky', initials: 'JL' },
      { name: 'Maya Chen', handle: '@maya', color: 'coral', initials: 'MC' },
      { name: 'Naomi Wilson', handle: '@naomi', color: 'butter', initials: 'NW' },
      { name: 'Charlie Nguyen', handle: '@charlien', color: 'plum', initials: 'CN' },
    ],
    activity: [
      { who: 'Yield earned', subtitle: 'Daily payout · 32m ago', amount: '+$0.11', color: 'lime', initials: '✦', section: 'TODAY' },
      { who: 'Jack Lawson', subtitle: 'banh mi · 1h ago', amount: '−$20.00', color: 'sky', initials: 'JL', section: 'TODAY' },
      { who: 'Maya Chen', subtitle: 'concert ticket · 4h ago', amount: '+$48.50', color: 'coral', initials: 'MC', section: 'TODAY' },
      { who: 'Yield earned', subtitle: 'Daily payout · 1d ago', amount: '+$0.10', color: 'lime', initials: '✦', section: 'YESTERDAY' },
      { who: 'Top up', subtitle: 'Bank transfer · CommBank ····0421', amount: '+$500.00', color: 'butter', initials: '$', section: 'YESTERDAY' },
      { who: 'Naomi Wilson', subtitle: 'rent share · 3d ago', amount: '−$420.00', color: 'butter', initials: 'NW', section: 'THIS WEEK' },
      { who: 'Yield earned', subtitle: 'Daily payout · 4d ago', amount: '+$0.09', color: 'lime', initials: '✦', section: 'THIS WEEK' },
    ],
    history: [],            // navigation history for back button
    current: null,
  };

  // ------- NAVIGATION -------
  const stage = document.getElementById('stage');

  function navigate(screenId, direction = 'forward', skipHistory = false) {
    if (!skipHistory && state.current && direction === 'forward') {
      state.history.push(state.current);
    }
    const oldScreen = stage.querySelector('.screen');
    const renderer = SCREENS[screenId];
    if (!renderer) {
      console.error('No screen:', screenId);
      return;
    }
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
    state.balance = 1247.50;
    state.sendAmount = 0;
    state.sendRecipient = null;
    state.sendMode = 'handle';
    state.pendingSms = null;
    state.visitedHome = false;
    state.history = [];
    state.current = null;
    const oldScreen = stage.querySelector('.screen');
    if (oldScreen) oldScreen.remove();
    navigate('welcome', 'forward', true);
  }

  // ------- CAPTIONS -------
  const CAPTIONS = {
    welcome: [
      { pos: 'tl', text: "G'day! Tap Continue to kick off the onboarding flow." },
      { pos: 'br', text: 'Free, instant peer-to-peer payments. Built on Solana.' },
    ],
    verify: [
      { pos: 'tr', text: 'OTP via SMS. Tap any cell to fill in the code.' },
    ],
    'claim-handle': [
      { pos: 'tl', text: 'Pick your @handle. This is how mates find you.' },
    ],
    'profile-setup': [
      { pos: 'br', text: 'Choose a colour for your avatar.' },
    ],
    'kyc-verifying': [
      { pos: 'tl', text: 'FrankieOne handles KYC. AUSTRAC-compliant.' },
      { pos: 'br', text: 'Wallet provisioning runs in parallel via Privy.' },
    ],
    'wallet-ready': [
      { pos: 'tl', text: "You're in. Tap to head to the home screen." },
    ],
    home: [
      { pos: 'tl', text: 'Your AUDD balance — earns 3.33% p.a., paid daily.' },
      { pos: 'tr', text: 'Tap Send to pay a mate by @handle or by phone.' },
    ],
    yield: [
      { pos: 'tl', text: 'Same model as the neobanks. No tiers, no lock-up.' },
    ],
    'send-who': [
      { pos: 'br', text: "Mate not on Sorted yet? Tap 'Send via SMS' to text them." },
    ],
    'send-amount': [
      { pos: 'tr', text: 'Big keypad, big numbers. Tap presets or type.' },
    ],
    'send-confirm': [
      { pos: 'br', text: 'Hold the green button to send. Solana settles in <2 sec.' },
    ],
    'send-done': [
      { pos: 'tl', text: 'Done. Receipt saved. Tx ID on-chain.' },
    ],
    'send-sms-number': [
      { pos: 'tl', text: 'No @handle needed — just their mobile number.' },
    ],
    'send-sms-confirm': [
      { pos: 'br', text: '24h undo + 12h reminder. Peace of mind built in.' },
    ],
    'send-sms-pending': [
      { pos: 'tr', text: "We'll text them this exact message. They claim in 60 sec." },
    ],
    receive: [
      { pos: 'tr', text: 'Share your @handle. Or show your QR.' },
    ],
    activity: [
      { pos: 'tl', text: 'All your sends, receives, and yield drops. One feed.' },
    ],
    'topup-amount': [
      { pos: 'br', text: 'Top up via PayID. Lands in seconds.' },
    ],
    'topup-payid': [
      { pos: 'tl', text: "Use this PayID in your bank app — or tap 'Simulate' for the demo." },
    ],
    settings: [
      { pos: 'tr', text: 'Profile, verification, notifications — all here.' },
    ],
    'settings-profile': [
      { pos: 'tl', text: '@handle and mobile locked once verified.' },
    ],
    'settings-verification': [
      { pos: 'br', text: 'Tier 1 ships free. Tier 2 unlocks higher limits.' },
    ],
    'settings-notifications': [
      { pos: 'tl', text: 'We default to less, not more.' },
    ],
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
      if (el) {
        el.querySelector('.caption-text').textContent = text;
        el.hidden = false;
      }
    });
  }

  // ------- DOM helpers -------
  function h(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (v == null) return;
      if (k === 'class') el.className = v;
      else if (k === 'style') el.setAttribute('style', v);
      else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'html') el.innerHTML = v;
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

  // ------- SHARED COMPONENTS -------
  function Header(eyebrow, onBack) {
    return h('div', { class: 'scr-header' },
      onBack ? h('button', { class: 'scr-back', onclick: onBack, type: 'button' }, '←') : h('div', { class: 'scr-spacer' }),
      eyebrow ? h('span', { class: 'scr-eyebrow' }, eyebrow) : h('span'),
      h('div', { class: 'scr-spacer' })
    );
  }

  function Tile(color, emoji) {
    return h('div', { class: `scr-tile scr-tile--${color}` }, emoji);
  }

  function Avatar(color, initials, size = 'md') {
    return h('div', { class: `scr-avatar scr-avatar--${size} scr-avatar--${color}` }, initials);
  }

  // ============================================================
  // SCREEN RENDERERS — return an HTMLElement (the .screen contents)
  // ============================================================
  const SCREENS = {};

  // ============================================================
  // 1. WELCOME
  // ============================================================
  SCREENS.welcome = function () {
    const wrap = h('div');

    wrap.appendChild(h('div', { class: 'scr-hero', style: 'padding-top: 80px;' },
      Tile('lime', '+'),
      h('h1', { class: 'scr-hero-title' }, 'Money,\nsorted.'),
      h('p', { class: 'scr-hero-sub' }, 'Send to any @handle, anywhere in Australia. Free. Instant. Done.')
    ));

    wrap.appendChild(h('div', { style: 'padding: 32px 24px 0;' },
      h('div', { style: 'font-family: var(--font-mono); font-size: 12px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-muted); margin-bottom: 8px;' }, 'MOBILE NUMBER'),
      h('input', { class: 'scr-input', type: 'tel', placeholder: '+61 04XX XXX XXX', value: '+61 0412 345 921' })
    ));

    wrap.appendChild(h('div', { style: 'padding: 32px 24px 0;' },
      h('button', { class: 'scr-btn scr-btn--primary', onclick: () => navigate('verify'), type: 'button' }, 'Continue')
    ));

    wrap.appendChild(h('p', {
      style: 'padding: 16px 24px 0; font-size: 12px; color: var(--ink-muted); text-align: center; line-height: 1.5;'
    }, "By continuing, you agree to Sorted's Terms and Privacy Policy."));

    return wrap;
  };

  // ============================================================
  // 2. VERIFY
  // ============================================================
  SCREENS.verify = function () {
    const wrap = h('div');
    wrap.appendChild(Header('VERIFY', back));

    wrap.appendChild(h('div', { class: 'scr-hero', style: 'padding-top: 8px;' },
      Tile('sky', '💬'),
      h('h1', { class: 'scr-hero-title' }, 'Check your\nmessages.'),
      h('p', { class: 'scr-hero-sub' }, 'We sent a 6-digit code to +61 04XX XXX 921. Pop it in below.')
    ));

    // OTP boxes
    const code = ['1', '2', '3', '4', '5', '6'];
    const otpRow = h('div', { style: 'display: flex; gap: 8px; justify-content: center; padding: 24px 0;' });
    code.forEach((digit, i) => {
      const cell = h('div', {
        style: 'width: 44px; height: 56px; border-radius: 14px; background: var(--paper-elevated); border: 2px solid var(--line); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 700; font-size: 24px; color: var(--ink); cursor: pointer;'
      });
      // Auto-fill on tap
      cell.addEventListener('click', () => {
        if (cell.textContent) return;
        cell.textContent = digit;
        cell.style.borderColor = 'var(--lime-deep)';
        cell.style.background = 'var(--lime-soft)';
        const allFilled = [...otpRow.children].every((c) => c.textContent);
        if (allFilled) {
          setTimeout(() => navigate('claim-handle'), 400);
        }
      });
      otpRow.appendChild(cell);
    });
    wrap.appendChild(otpRow);

    wrap.appendChild(h('p', {
      style: 'text-align: center; font-size: 14px; color: var(--ink-muted); padding: 0 24px;'
    }, "Didn't arrive? Resend in 28s."));

    // Hint button
    wrap.appendChild(h('div', { style: 'padding: 32px 24px 0;' },
      h('button', {
        class: 'scr-btn scr-btn--secondary', type: 'button',
        onclick: () => {
          [...otpRow.children].forEach((cell, i) => {
            setTimeout(() => cell.click(), i * 80);
          });
        }
      }, 'Auto-fill code (demo)')
    ));

    return wrap;
  };

  // ============================================================
  // 3. CLAIM HANDLE
  // ============================================================
  SCREENS['claim-handle'] = function () {
    const wrap = h('div');
    wrap.appendChild(Header('CLAIM HANDLE', back));

    wrap.appendChild(h('div', { class: 'scr-hero', style: 'padding-top: 8px;' },
      Tile('lime', '@'),
      h('h1', { class: 'scr-hero-title' }, 'Pick your\n@handle.'),
      h('p', { class: 'scr-hero-sub' }, "This is how mates find you to send money. Pick something you'll keep.")
    ));

    const input = h('input', { class: 'scr-input', type: 'text', value: '@hannah' });
    const hint = h('p', {
      style: 'margin-top: 8px; font-size: 14px; color: var(--lime-deep); font-weight: 600;'
    }, '✓ @hannah is yours.');

    input.addEventListener('input', (e) => {
      if (!e.target.value.startsWith('@')) e.target.value = '@' + e.target.value;
      state.handle = e.target.value;
      hint.textContent = `✓ ${e.target.value} is yours.`;
    });

    wrap.appendChild(h('div', { style: 'padding: 16px 24px 0;' }, input, hint));

    wrap.appendChild(h('div', { style: 'padding: 32px 24px 0;' },
      h('button', { class: 'scr-btn scr-btn--primary', type: 'button', onclick: () => navigate('profile-setup') },
        'Claim ' + state.handle)
    ));

    return wrap;
  };

  // ============================================================
  // 4. PROFILE SETUP
  // ============================================================
  SCREENS['profile-setup'] = function () {
    const wrap = h('div');
    wrap.appendChild(Header('YOUR DETAILS', back));

    wrap.appendChild(h('div', { style: 'padding: 8px 24px 16px;' },
      h('h1', { class: 'scr-title-h2' }, 'What should we call you?'),
      h('p', { class: 'scr-subtitle' }, 'Real name on the receipts. Pick a vibe colour.')
    ));

    // Avatar preview
    const avatar = Avatar('lime', 'HR', 'huge');
    const avatarWrap = h('div', { style: 'display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 16px 24px;' }, avatar);

    // Colour swatches
    const colors = [
      { var: 'var(--lime)', name: 'lime' },
      { var: 'var(--coral)', name: 'coral' },
      { var: 'var(--sky)', name: 'sky' },
      { var: 'var(--butter)', name: 'butter' },
      { var: 'var(--plum)', name: 'plum' },
    ];
    const swatchRow = h('div', { style: 'display: flex; gap: 12px;' });
    colors.forEach((c, i) => {
      const sw = h('div', {
        style: `width: 28px; height: 28px; border-radius: 999px; background: ${c.var}; cursor: pointer; ${i === 0 ? 'border: 2px solid var(--ink); box-shadow: 0 0 0 2px var(--paper);' : 'border: 2px solid transparent;'}`
      });
      sw.addEventListener('click', () => {
        [...swatchRow.children].forEach((s) => { s.style.border = '2px solid transparent'; s.style.boxShadow = 'none'; });
        sw.style.border = '2px solid var(--ink)';
        sw.style.boxShadow = '0 0 0 2px var(--paper)';
        avatar.className = `scr-avatar scr-avatar--huge scr-avatar--${c.name}`;
      });
      swatchRow.appendChild(sw);
    });
    avatarWrap.appendChild(swatchRow);
    wrap.appendChild(avatarWrap);

    // Name fields
    const fieldStyle = 'font-family: var(--font-mono); font-size: 12px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-muted); margin-bottom: 6px;';
    wrap.appendChild(h('div', { style: 'padding: 16px 24px 0; display: flex; flex-direction: column; gap: 16px;' },
      h('div', {},
        h('div', { style: fieldStyle }, 'FIRST NAME'),
        h('input', { class: 'scr-input', type: 'text', value: 'Hannah' })
      ),
      h('div', {},
        h('div', { style: fieldStyle }, 'LAST NAME'),
        h('input', { class: 'scr-input', type: 'text', value: 'Reid' })
      )
    ));

    wrap.appendChild(h('div', { style: 'padding: 32px 24px 0;' },
      h('button', { class: 'scr-btn scr-btn--primary', type: 'button', onclick: () => navigate('kyc-verifying') }, 'Continue')
    ));

    return wrap;
  };

  // ============================================================
  // 5. KYC VERIFYING
  // ============================================================
  SCREENS['kyc-verifying'] = function () {
    const wrap = h('div');

    wrap.appendChild(h('div', { class: 'scr-hero', style: 'padding-top: 64px;' },
      Tile('sky', '🛡'),
      h('h1', { class: 'scr-hero-title' }, 'Verifying\nyour details.'),
      h('p', { class: 'scr-hero-sub' }, 'Australian regulation, sorted in seconds. Powered by FrankieOne & Privy.')
    ));

    const steps = [
      { label: 'Verifying identity', detail: 'Cross-checking with FrankieOne', state: 'active' },
      { label: 'Reading your details', detail: 'Encrypted, never stored', state: 'queued' },
      { label: 'Provisioning your wallet', detail: 'Solana mainnet · TEE-secured via Privy', state: 'queued' },
      { label: 'Finalising', detail: 'Almost there', state: 'queued' },
    ];

    const stepRows = [];
    const stepsWrap = h('div', { style: 'padding: 16px 24px; display: flex; flex-direction: column; gap: 10px;' });
    steps.forEach((s, i) => {
      const row = h('div', {
        style: `display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 14px; background: var(--paper-elevated); border: 1.5px solid var(--line); transition: all 0.4s ease;`
      });
      const dot = h('div', {
        style: 'width: 24px; height: 24px; border-radius: 999px; background: var(--line); flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: var(--paper); font-weight: 700; font-size: 12px;'
      });
      const txt = h('div', { style: 'flex: 1;' },
        h('div', { style: 'font-family: var(--font-display); font-weight: 700; font-size: 15px; color: var(--ink);' }, s.label),
        h('div', { style: 'font-size: 12px; color: var(--ink-muted); margin-top: 2px;' }, s.detail)
      );
      row.appendChild(dot);
      row.appendChild(txt);
      stepsWrap.appendChild(row);
      stepRows.push({ row, dot });
    });
    wrap.appendChild(stepsWrap);

    // Animate through the steps
    setTimeout(() => {
      stepRows.forEach(({ row, dot }, i) => {
        setTimeout(() => {
          row.style.background = 'var(--lime-soft)';
          row.style.borderColor = 'var(--lime-deep)';
          dot.style.background = 'var(--lime)';
          dot.style.color = 'var(--ink)';
          dot.textContent = '✓';
          if (i === stepRows.length - 1) {
            setTimeout(() => navigate('wallet-ready'), 600);
          }
        }, i * 700);
      });
    }, 400);

    wrap.appendChild(h('p', {
      style: 'text-align: center; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; color: var(--ink-muted); padding: 16px 24px 0;'
    }, '256-BIT ENCRYPTED · AUSTRAC COMPLIANT'));

    return wrap;
  };

  // ============================================================
  // 6. WALLET READY
  // ============================================================
  SCREENS['wallet-ready'] = function () {
    const wrap = h('div');

    wrap.appendChild(h('div', { class: 'scr-hero', style: 'padding-top: 120px; gap: 24px;' },
      h('div', {
        style: 'width: 120px; height: 120px; border-radius: 999px; background: var(--lime); border: 3px solid var(--ink); display: flex; align-items: center; justify-content: center; font-size: 64px; font-weight: 700; color: var(--ink); box-shadow: 0 8px 0 var(--ink);'
      }, '✓'),
      h('h1', { style: 'font-family: var(--font-display); font-weight: 700; font-size: 64px; line-height: 0.95; letter-spacing: -0.04em; color: var(--ink); margin: 0; text-align: center;' }, "You're\nsorted.".split('\n').join('\n')),
      h('p', { class: 'scr-hero-sub' }, "Your wallet's ready. Top up to start sending.")
    ));

    wrap.appendChild(h('div', { style: 'padding: 64px 24px 0;' },
      h('button', { class: 'scr-btn scr-btn--primary', type: 'button',
        onclick: () => { state.visitedHome = true; navigate('home'); }
      }, 'Take me in')
    ));

    return wrap;
  };

  // ============================================================
  // 7. HOME (main)
  // ============================================================
  SCREENS.home = function () {
    const wrap = h('div', { style: 'padding-bottom: 90px;' });

    // Header — greeting + avatar
    wrap.appendChild(h('div', {
      style: 'display: flex; align-items: center; justify-content: space-between; padding: 16px 24px;'
    },
      h('div', {},
        h('div', { style: 'font-family: var(--font-mono); font-size: 11px; font-weight: 500; letter-spacing: 0.1em; color: var(--ink-muted); text-transform: uppercase;' }, "G'DAY"),
        h('div', { style: 'font-family: var(--font-display); font-weight: 700; font-size: 32px; letter-spacing: -0.02em; color: var(--ink); margin-top: 2px;' }, 'Hannah')
      ),
      Avatar('lime', 'HR', 'md')
    ));

    // Balance card
    const card = h('div', {
      style: 'margin: 0 24px; padding: 24px 20px 20px; border-radius: 24px; background: var(--ink); color: var(--paper); border: 2px solid var(--ink); box-shadow: 0 6px 0 var(--ink);'
    });
    card.appendChild(h('div', { style: 'font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; color: rgba(246,242,233,0.6); text-transform: uppercase;' }, 'AVAILABLE BALANCE'));
    const bal = h('div', { style: 'display: flex; align-items: baseline; gap: 4px; margin-top: 8px;' },
      h('span', { style: 'font-family: Inter, sans-serif; font-weight: 700; font-size: 28px; color: rgba(246,242,233,0.5);' }, '$'),
      h('span', { style: 'font-family: Inter, sans-serif; font-weight: 700; font-size: 56px; letter-spacing: -0.03em; color: var(--paper);' }, fmtMoney(state.balance).split('.')[0]),
      h('span', { style: 'font-family: Inter, sans-serif; font-weight: 700; font-size: 28px; color: rgba(246,242,233,0.5);' }, '.' + fmtMoney(state.balance).split('.')[1])
    );
    card.appendChild(bal);
    // Action buttons (Send / Receive / +)
    const actions = h('div', { style: 'display: flex; gap: 8px; margin-top: 20px;' });
    actions.appendChild(h('button', {
      style: 'flex: 1; padding: 12px 14px; border-radius: 12px; background: var(--lime); color: var(--ink); border: 2px solid var(--ink); font-family: var(--font-display); font-weight: 700; font-size: 14px; cursor: pointer;',
      type: 'button',
      onclick: () => navigate('send-who'),
    }, '↑ Send'));
    actions.appendChild(h('button', {
      style: 'flex: 1; padding: 12px 14px; border-radius: 12px; background: var(--paper-elevated); color: var(--ink); border: 2px solid var(--ink); font-family: var(--font-display); font-weight: 700; font-size: 14px; cursor: pointer;',
      type: 'button',
      onclick: () => navigate('receive'),
    }, '↓ Receive'));
    actions.appendChild(h('button', {
      style: 'width: 44px; padding: 12px 0; border-radius: 12px; background: rgba(255,255,255,0.1); color: var(--paper); border: 1px solid rgba(255,255,255,0.2); font-family: var(--font-display); font-weight: 700; font-size: 18px; cursor: pointer;',
      type: 'button',
      onclick: () => navigate('topup-amount'),
    }, '+'));
    card.appendChild(actions);
    wrap.appendChild(card);

    // Earnings strip
    const earn = h('div', {
      style: 'margin: 20px 24px 0; padding: 12px 16px; border-radius: 16px; background: var(--lime); display: flex; justify-content: space-between; align-items: center; cursor: pointer; border: 2px solid var(--ink); box-shadow: 0 3px 0 var(--ink);',
      onclick: () => navigate('yield'),
    });
    earn.appendChild(h('div', {},
      h('span', { style: 'font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; opacity: 0.65;' }, 'EARNED TODAY '),
      h('span', { style: 'font-family: Inter, sans-serif; font-weight: 700; font-size: 16px;' }, '+$0.11')
    ));
    earn.appendChild(h('div', { style: 'font-family: Inter, sans-serif; font-weight: 700; font-size: 18px;' },
      '3.33', h('span', { style: 'font-size: 13px;' }, '% '),
      h('span', { style: 'font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em;' }, 'APY')
    ));
    wrap.appendChild(earn);

    // Recent activity
    wrap.appendChild(h('div', {
      style: 'display: flex; justify-content: space-between; align-items: center; padding: 24px 24px 12px;'
    },
      h('div', { style: 'font-family: var(--font-display); font-weight: 700; font-size: 22px; color: var(--ink);' }, 'Recent activity'),
      h('div', { style: 'font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; color: var(--ink-muted); cursor: pointer;', onclick: () => navigate('activity') }, 'SEE ALL →')
    ));

    const list = h('div', { style: 'padding: 0 24px; display: flex; flex-direction: column; gap: 8px;' });

    // Show pending SMS if any
    if (state.pendingSms) {
      const pendingRow = h('div', {
        style: 'display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 14px; background: var(--butter); border: 1.5px solid var(--ink);'
      });
      pendingRow.appendChild(h('div', {
        style: 'width: 40px; height: 40px; border-radius: 999px; background: var(--paper-elevated); border: 2px dashed var(--ink); display: flex; align-items: center; justify-content: center; font-size: 18px;'
      }, '📱'));
      pendingRow.appendChild(h('div', { style: 'flex: 1;' },
        h('div', { style: 'display: flex; align-items: center; gap: 6px;' },
          h('div', { style: 'font-family: var(--font-display); font-weight: 700; font-size: 15px; color: var(--ink);' }, state.pendingSms.name),
          h('div', { style: 'padding: 1px 6px; border-radius: 999px; background: var(--paper-elevated); border: 1px solid var(--ink); font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.1em; font-weight: 600;' }, 'PENDING')
        ),
        h('div', { style: 'font-size: 12px; color: var(--ink-soft); margin-top: 2px;' }, 'SMS sent · awaiting claim · undo for 24h')
      ));
      pendingRow.appendChild(h('div', { style: 'font-family: Inter, sans-serif; font-weight: 700; font-size: 14px; color: var(--ink);' }, '−$' + fmtMoney(state.pendingSms.amount)));
      list.appendChild(pendingRow);
    }

    state.activity.filter((a) => a.section === 'TODAY').forEach((a) => {
      const row = h('div', {
        style: 'display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 14px; background: var(--paper-elevated); border: 1px solid var(--line);'
      });
      row.appendChild(Avatar(a.color, a.initials, 'md'));
      row.appendChild(h('div', { style: 'flex: 1;' },
        h('div', { style: 'font-family: var(--font-display); font-weight: 700; font-size: 15px; color: var(--ink);' }, a.who),
        h('div', { style: 'font-size: 12px; color: var(--ink-muted); margin-top: 2px;' }, a.subtitle)
      ));
      row.appendChild(h('div', {
        style: `font-family: Inter, sans-serif; font-weight: 700; font-size: 14px; color: ${a.amount.startsWith('−') ? 'var(--ink-soft)' : 'var(--ink)'};`
      }, a.amount));
      list.appendChild(row);
    });
    wrap.appendChild(list);

    // Bottom nav
    wrap.appendChild(BottomNav('home'));

    return wrap;
  };

  function BottomNav(active) {
    const nav = h('div', {
      style: 'position: absolute; bottom: 0; left: 0; right: 0; padding: 12px 24px 24px; background: var(--ink); display: flex; justify-content: space-between; align-items: center;'
    });
    const items = [
      { key: 'home',     label: 'HOME',     screen: 'home' },
      { key: 'activity', label: 'ACTIVITY', screen: 'activity' },
      { key: 'settings', label: 'SETTINGS', screen: 'settings' },
    ];
    items.forEach((item) => {
      const isActive = item.key === active;
      const btn = h('button', {
        style: `padding: 10px 20px; border-radius: 12px; background: ${isActive ? 'var(--lime)' : 'transparent'}; color: ${isActive ? 'var(--ink)' : 'rgba(246,242,233,0.6)'}; border: none; font-family: var(--font-mono); font-weight: 500; font-size: 11px; letter-spacing: 0.1em; cursor: pointer;`,
        type: 'button',
        onclick: () => { if (!isActive) navigate(item.screen); },
      }, item.label);
      nav.appendChild(btn);
    });
    return nav;
  }

  // ============================================================
  // 8. YIELD
  // ============================================================
  SCREENS.yield = function () {
    const wrap = h('div');
    wrap.appendChild(Header('EARNINGS', back));

    // Hero card (lime, 3.33%)
    const hero = h('div', {
      style: 'margin: 12px 24px; padding: 24px 20px; border-radius: 24px; background: var(--lime); border: 2.5px solid var(--ink); box-shadow: 0 6px 0 var(--ink);'
    });
    hero.appendChild(h('div', { style: 'font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; font-weight: 500; opacity: 0.65;' }, 'YOUR YIELD · LIVE'));
    hero.appendChild(h('div', { style: 'display: flex; align-items: baseline; gap: 4px; margin-top: 10px;' },
      h('span', { style: 'font-family: Inter, sans-serif; font-weight: 700; font-size: 72px; letter-spacing: -0.04em; color: var(--ink);' }, '3.33'),
      h('span', { style: 'font-family: Inter, sans-serif; font-weight: 700; font-size: 28px; color: var(--ink);' }, '%')
    ));
    hero.appendChild(h('div', { style: 'font-family: var(--font-body); font-size: 13px; color: var(--ink); margin-top: 6px; opacity: 0.7;' }, 'APY · Compounds daily · No lock-up'));
    wrap.appendChild(hero);

    // Lifetime card
    wrap.appendChild(h('div', {
      style: 'margin: 16px 24px; padding: 18px 20px; border-radius: 18px; background: var(--paper-elevated); border: 1px solid var(--line);'
    },
      h('div', { style: 'font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; color: var(--ink-muted);' }, 'LIFETIME EARNED'),
      h('div', { style: 'display: flex; align-items: baseline; gap: 2px; margin-top: 6px;' },
        h('span', { style: 'font-family: Inter, sans-serif; font-weight: 700; font-size: 18px; color: var(--ink-muted);' }, '$'),
        h('span', { style: 'font-family: Inter, sans-serif; font-weight: 700; font-size: 36px; letter-spacing: -0.02em; color: var(--ink);' }, '3'),
        h('span', { style: 'font-family: Inter, sans-serif; font-weight: 700; font-size: 18px; color: var(--ink-muted);' }, '.80')
      ),
      h('div', { style: 'font-size: 12px; color: var(--ink-muted); margin-top: 4px;' }, 'Compounds daily. Auto-deposits to your balance.')
    ));

    // How it works panel (dark)
    const panel = h('div', {
      style: 'margin: 16px 24px; padding: 18px 20px; border-radius: 18px; background: var(--ink); color: var(--paper);'
    });
    panel.appendChild(h('div', { style: 'display: flex; align-items: center; gap: 10px;' },
      h('div', { style: 'width: 24px; height: 24px; border-radius: 999px; background: var(--lime);' }),
      h('div', { style: 'font-family: var(--font-display); font-weight: 700; font-size: 17px;' }, 'How it works')
    ));
    const bullets = [
      'Your AUDD balance earns 3.33% APY automatically',
      'Yield drops once a day. No lock-up, no minimum',
      'Generated by Treasury-backed reserves on Solana',
    ];
    bullets.forEach((b) => {
      panel.appendChild(h('div', { style: 'display: flex; gap: 10px; margin-top: 12px; align-items: flex-start;' },
        h('div', { style: 'width: 5px; height: 5px; border-radius: 999px; background: var(--lime); margin-top: 8px; flex-shrink: 0;' }),
        h('div', { style: 'font-size: 13px; line-height: 1.5; opacity: 0.85;' }, b)
      ));
    });
    wrap.appendChild(panel);

    return wrap;
  };

  // ============================================================
  // 9. SEND · WHO (recipient picker)
  // ============================================================
  SCREENS['send-who'] = function () {
    const wrap = h('div');
    wrap.appendChild(Header('SEND', back));

    wrap.appendChild(h('div', { style: 'padding: 8px 24px 16px;' },
      h('h1', { class: 'scr-title-h2' }, "Who's it for?"),
      h('p', { class: 'scr-subtitle' }, 'Type a @handle, or pick a recent.')
    ));

    // Search input
    wrap.appendChild(h('div', { style: 'padding: 0 24px;' },
      h('input', { class: 'scr-input', type: 'text', placeholder: 'Search @handle or name' })
    ));

    // SMS option (lime soft card)
    const smsOpt = h('button', {
      style: 'margin: 24px 24px 0; padding: 14px 16px; border-radius: 14px; background: var(--lime-soft); border: 1.5px solid var(--lime-deep); display: flex; align-items: center; gap: 12px; cursor: pointer; width: calc(100% - 48px); text-align: left;',
      type: 'button',
      onclick: () => { state.sendMode = 'sms'; navigate('send-sms-number'); },
    });
    smsOpt.appendChild(h('div', {
      style: 'width: 40px; height: 40px; border-radius: 999px; background: var(--lime); border: 1.5px solid var(--ink); display: flex; align-items: center; justify-content: center; font-size: 18px;'
    }, '💬'));
    smsOpt.appendChild(h('div', { style: 'flex: 1;' },
      h('div', { style: 'font-family: var(--font-display); font-weight: 700; font-size: 15px; color: var(--ink);' }, 'Send via SMS'),
      h('div', { style: 'font-size: 12px; color: var(--ink-soft); margin-top: 2px;' }, 'Not on Sorted yet? Text them a claim link.')
    ));
    smsOpt.appendChild(h('div', { style: 'font-family: var(--font-display); font-weight: 700; font-size: 20px; color: var(--ink);' }, '→'));
    wrap.appendChild(smsOpt);

    // Recents
    wrap.appendChild(h('div', {
      style: 'font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; color: var(--ink-muted); padding: 24px 24px 12px;'
    }, 'RECENT'));

    const list = h('div', { style: 'padding: 0 24px; display: flex; flex-direction: column; gap: 8px;' });
    state.contacts.forEach((c) => {
      const row = h('button', {
        style: 'display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 14px; background: var(--paper-elevated); border: 1px solid var(--line); cursor: pointer; width: 100%; text-align: left;',
        type: 'button',
        onclick: () => {
          state.sendMode = 'handle';
          state.sendRecipient = c;
          navigate('send-amount');
        },
      });
      row.appendChild(Avatar(c.color, c.initials, 'md'));
      row.appendChild(h('div', { style: 'flex: 1;' },
        h('div', { style: 'font-family: var(--font-display); font-weight: 700; font-size: 15px; color: var(--ink);' }, c.name),
        h('div', { style: 'font-family: var(--font-mono); font-size: 12px; color: var(--ink-muted); margin-top: 2px;' }, c.handle)
      ));
      row.appendChild(h('div', { style: 'font-family: var(--font-display); font-weight: 700; font-size: 18px; color: var(--ink-muted);' }, '→'));
      list.appendChild(row);
    });
    wrap.appendChild(list);

    return wrap;
  };

  // ============================================================
  // 10. SEND · AMOUNT
  // ============================================================
  SCREENS['send-amount'] = function () {
    const wrap = h('div');
    wrap.appendChild(Header('SEND', back));

    const r = state.sendRecipient;
    if (r) {
      const recipBlock = h('div', { style: 'display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 24px;' });
      recipBlock.appendChild(Avatar(r.color, r.initials, 'lg'));
      recipBlock.appendChild(h('div', { style: 'font-family: var(--font-display); font-weight: 700; font-size: 22px; color: var(--ink);' }, r.name));
      recipBlock.appendChild(h('div', { style: 'font-family: var(--font-mono); font-size: 13px; color: var(--ink-muted);' }, r.handle));
      wrap.appendChild(recipBlock);
    }

    // Amount display
    let entered = String(state.sendAmount || 0);
    const amountWrap = h('div', { style: 'display: flex; flex-direction: column; align-items: center; padding: 20px 24px;' });
    const amountRow = h('div', { style: 'display: flex; align-items: baseline; gap: 4px;' },
      h('span', { style: 'font-family: Inter, sans-serif; font-weight: 700; font-size: 28px; color: var(--ink-muted);' }, '$'),
      h('span', {
        id: 'amountWhole',
        style: 'font-family: Inter, sans-serif; font-weight: 700; font-size: 64px; letter-spacing: -0.04em; color: var(--ink); line-height: 1;'
      }, '0'),
      h('span', { id: 'amountDecimal', style: 'font-family: Inter, sans-serif; font-weight: 700; font-size: 28px; color: var(--ink-muted);' }, '.00')
    );
    amountWrap.appendChild(amountRow);
    amountWrap.appendChild(h('div', {
      style: 'font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; color: var(--ink-muted); margin-top: 10px;'
    }, 'BALANCE · $' + fmtMoney(state.balance)));
    wrap.appendChild(amountWrap);

    // Preset chips
    const chipsRow = h('div', { style: 'display: flex; justify-content: center; gap: 8px; padding: 4px 24px 16px;' });
    [10, 20, 50, 100].forEach((v) => {
      const chip = h('button', {
        type: 'button',
        style: 'padding: 8px 16px; border-radius: 999px; background: var(--paper-elevated); border: 1.5px solid var(--ink); font-family: var(--font-display); font-weight: 600; font-size: 13px; cursor: pointer; box-shadow: 0 2px 0 var(--ink);',
        onclick: () => { entered = String(v * 100); update(); }, // store as cents
      }, '$' + v);
      chipsRow.appendChild(chip);
    });
    wrap.appendChild(chipsRow);

    // Review send button
    const reviewBtn = h('button', {
      class: 'scr-btn scr-btn--primary',
      style: 'margin: 0 24px; width: calc(100% - 48px);',
      type: 'button',
      onclick: () => {
        if (state.sendAmount > 0) {
          navigate(state.sendMode === 'sms' ? 'send-sms-confirm' : 'send-confirm');
        }
      },
    }, 'Review send');
    wrap.appendChild(reviewBtn);

    // Keypad
    const keypad = h('div', {
      style: 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; padding: 16px 18px 0; user-select: none;'
    });
    const keys = ['1','2','3','4','5','6','7','8','9','.','0','⌫'];
    keys.forEach((k) => {
      const key = h('button', {
        type: 'button',
        style: 'padding: 18px 0; background: transparent; border: none; font-family: var(--font-display); font-weight: 700; font-size: 28px; color: var(--ink); cursor: pointer; transition: background 0.1s ease;',
        onclick: () => {
          if (k === '⌫') {
            entered = entered.length > 1 ? entered.slice(0, -1) : '0';
          } else if (k === '.') {
            // For simplicity, just append a few zeros pattern in cents-store
            // Skip — we operate in cents
            return;
          } else {
            // Cap at 7 digits
            if (entered.length < 7) entered = (entered === '0' ? '' : entered) + k;
          }
          update();
        }
      }, k);
      key.addEventListener('mousedown', () => { key.style.background = 'var(--paper-deep)'; });
      key.addEventListener('mouseup', () => { key.style.background = 'transparent'; });
      key.addEventListener('mouseleave', () => { key.style.background = 'transparent'; });
      keypad.appendChild(key);
    });
    wrap.appendChild(keypad);

    function update() {
      const cents = parseInt(entered || '0');
      state.sendAmount = cents / 100;
      const whole = Math.floor(state.sendAmount).toString();
      const dec = '.' + (cents % 100).toString().padStart(2, '0');
      wrap.querySelector('#amountWhole').textContent = whole;
      wrap.querySelector('#amountDecimal').textContent = dec;
      reviewBtn.style.opacity = state.sendAmount > 0 ? '1' : '0.5';
    }
    // Default: pre-fill $20
    entered = '2000';
    update();

    return wrap;
  };

  // ============================================================
  // 11. SEND · CONFIRM (handle send)
  // ============================================================
  SCREENS['send-confirm'] = function () {
    const wrap = h('div');
    wrap.appendChild(Header('CONFIRM', back));

    const r = state.sendRecipient;
    const recipBlock = h('div', { style: 'display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 16px 24px;' });
    recipBlock.appendChild(Avatar(r.color, r.initials, 'lg'));
    recipBlock.appendChild(h('div', { style: 'font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; color: var(--ink-muted); margin-top: 6px;' }, 'SENDING TO'));
    recipBlock.appendChild(h('div', { style: 'font-family: var(--font-display); font-weight: 700; font-size: 24px; color: var(--ink);' }, r.name));
    recipBlock.appendChild(h('div', { style: 'font-family: var(--font-mono); font-size: 13px; color: var(--ink-muted);' }, r.handle));
    wrap.appendChild(recipBlock);

    // Amount display
    const amountRow = h('div', {
      style: 'display: flex; align-items: baseline; justify-content: center; gap: 4px; padding: 16px 24px;'
    },
      h('span', { style: 'font-family: Inter, sans-serif; font-weight: 700; font-size: 28px; color: var(--ink-muted);' }, '$'),
      h('span', { style: 'font-family: Inter, sans-serif; font-weight: 700; font-size: 64px; letter-spacing: -0.04em; color: var(--ink); line-height: 1;' }, Math.floor(state.sendAmount).toString()),
      h('span', { style: 'font-family: Inter, sans-serif; font-weight: 700; font-size: 28px; color: var(--ink-muted);' }, '.' + ((state.sendAmount * 100) % 100).toString().padStart(2, '0'))
    );
    wrap.appendChild(amountRow);

    // Detail card
    const details = [
      { label: 'Network', value: 'Solana' },
      { label: 'Network fee', value: '$0.0008' },
      { label: 'Arrives', value: 'Instantly' },
    ];
    const detailCard = h('div', {
      style: 'margin: 16px 24px; border-radius: 18px; background: var(--paper-elevated); border: 1px solid var(--line); overflow: hidden;'
    });
    details.forEach((d, i) => {
      detailCard.appendChild(h('div', {
        style: `display: flex; justify-content: space-between; padding: 14px 16px; ${i > 0 ? 'border-top: 1px solid var(--line);' : ''}`
      },
        h('span', { style: 'font-size: 14px; color: var(--ink-muted);' }, d.label),
        h('span', { style: 'font-family: var(--font-body); font-weight: 600; font-size: 14px; color: var(--ink);' }, d.value)
      ));
    });
    wrap.appendChild(detailCard);

    // Hold to send (long-press)
    const holdBtn = h('button', {
      class: 'scr-btn scr-btn--primary',
      style: 'margin: 32px 24px 0; width: calc(100% - 48px); position: relative; overflow: hidden;',
      type: 'button',
    }, 'Hold to send');
    const fill = h('div', {
      style: 'position: absolute; left: 0; top: 0; bottom: 0; width: 0; background: var(--lime-deep); z-index: 0; transition: width 0.05s linear;'
    });
    holdBtn.insertBefore(fill, holdBtn.firstChild);
    holdBtn.style.position = 'relative';
    let holdTimer = null;
    let holdStart = null;
    function startHold() {
      holdStart = Date.now();
      holdTimer = setInterval(() => {
        const elapsed = Date.now() - holdStart;
        const pct = Math.min(elapsed / 1200, 1);
        fill.style.width = (pct * 100) + '%';
        if (pct >= 1) {
          clearInterval(holdTimer);
          holdTimer = null;
          state.balance -= state.sendAmount;
          navigate('send-done');
        }
      }, 30);
    }
    function endHold() {
      if (holdTimer) clearInterval(holdTimer);
      holdTimer = null;
      fill.style.width = '0';
    }
    holdBtn.addEventListener('mousedown', startHold);
    holdBtn.addEventListener('touchstart', startHold);
    holdBtn.addEventListener('mouseup', endHold);
    holdBtn.addEventListener('mouseleave', endHold);
    holdBtn.addEventListener('touchend', endHold);
    wrap.appendChild(holdBtn);

    wrap.appendChild(h('div', {
      style: 'text-align: center; font-size: 13px; color: var(--ink-muted); padding: 14px 24px 0;'
    }, 'Tap and hold to confirm'));

    return wrap;
  };

  // ============================================================
  // 12. SEND · DONE (success)
  // ============================================================
  SCREENS['send-done'] = function () {
    const wrap = h('div');

    // Big lime check
    wrap.appendChild(h('div', { style: 'display: flex; flex-direction: column; align-items: center; padding: 48px 24px 24px;' },
      h('div', {
        style: 'width: 80px; height: 80px; border-radius: 999px; background: var(--lime); border: 2.5px solid var(--ink); display: flex; align-items: center; justify-content: center; font-size: 40px; font-weight: 700; box-shadow: 0 5px 0 var(--ink);'
      }, '✓'),
      h('div', { style: 'font-family: var(--font-display); font-weight: 700; font-size: 56px; letter-spacing: -0.03em; color: var(--ink); margin-top: 24px;' }, 'Sent.'),
      h('div', { style: 'display: flex; gap: 6px; align-items: center; margin-top: 8px;' },
        h('span', { style: 'font-family: Inter, sans-serif; font-weight: 700; font-size: 20px; color: var(--ink);' }, '$' + fmtMoney(state.sendAmount)),
        h('span', { style: 'font-size: 15px; color: var(--ink-muted);' }, 'to'),
        h('span', { style: 'font-family: var(--font-mono); font-size: 14px; color: var(--ink);' }, state.sendRecipient.handle)
      )
    ));

    // Receipt
    const receipt = h('div', {
      style: 'margin: 32px 24px 0; border-radius: 18px; background: var(--paper-elevated); border: 1px solid var(--line); overflow: hidden;'
    });
    const items = [
      { label: 'Status', value: 'CONFIRMED', isPill: true },
      { label: 'Network', value: 'Solana' },
      { label: 'Network fee', value: '$0.0008' },
      { label: 'Tx ID', value: '5KJp...9zQ2' },
    ];
    items.forEach((item, i) => {
      const row = h('div', {
        style: `display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; ${i > 0 ? 'border-top: 1px solid var(--line);' : ''}`
      });
      row.appendChild(h('span', { style: 'font-size: 14px; color: var(--ink-muted);' }, item.label));
      if (item.isPill) {
        row.appendChild(h('div', {
          style: 'display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; background: var(--lime); border: 1px solid var(--ink); font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; font-weight: 600;'
        }, h('div', { style: 'width: 5px; height: 5px; border-radius: 999px; background: var(--lime-deep);' }), item.value));
      } else {
        row.appendChild(h('span', { style: 'font-family: var(--font-body); font-weight: 600; font-size: 14px; color: var(--ink);' }, item.value));
      }
      receipt.appendChild(row);
    });
    wrap.appendChild(receipt);

    wrap.appendChild(h('div', { style: 'padding: 32px 24px 0;' },
      h('button', { class: 'scr-btn scr-btn--primary', type: 'button',
        onclick: () => { state.history = []; navigate('home', 'forward', true); }
      }, 'Done')
    ));

    return wrap;
  };

  // ============================================================
  // 13. SEND · SMS NUMBER
  // ============================================================
  SCREENS['send-sms-number'] = function () {
    const wrap = h('div');
    wrap.appendChild(Header('SEND VIA SMS', back));

    wrap.appendChild(h('div', { style: 'padding: 8px 24px 16px;' },
      h('h1', { class: 'scr-title-h2' }, "What's their number?"),
      h('p', { class: 'scr-subtitle' }, "We'll text them a link. They claim, you're done.")
    ));

    const fieldStyle = 'font-family: var(--font-mono); font-size: 12px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-muted); margin-bottom: 6px;';
    const phoneInput = h('input', { class: 'scr-input', type: 'tel', value: '+61 0412 345 678' });
    const nameInput = h('input', { class: 'scr-input', type: 'text', value: 'Mum' });

    wrap.appendChild(h('div', { style: 'padding: 0 24px; display: flex; flex-direction: column; gap: 16px;' },
      h('div', {},
        h('div', { style: fieldStyle }, 'MOBILE NUMBER'),
        phoneInput
      ),
      h('div', {},
        h('div', { style: fieldStyle }, 'NAME (OPTIONAL)'),
        nameInput
      )
    ));

    // Info card
    const infoCard = h('div', {
      style: 'margin: 24px 24px 0; padding: 14px 16px; border-radius: 14px; background: var(--paper-elevated); border: 1px solid var(--line);'
    });
    infoCard.appendChild(h('div', { style: 'font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; color: var(--ink-muted);' }, 'HOW IT WORKS'));
    const steps = [
      'They get a text from Sorted with a claim link',
      'They tap the link, set up their account in 60 seconds',
      'Your money lands in their balance · they keep it',
    ];
    steps.forEach((step, i) => {
      const row = h('div', { style: 'display: flex; gap: 10px; margin-top: 10px; align-items: flex-start;' });
      row.appendChild(h('div', {
        style: 'width: 20px; height: 20px; border-radius: 999px; background: var(--lime); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-family: Inter, sans-serif; font-weight: 700; font-size: 11px;'
      }, String(i + 1)));
      row.appendChild(h('div', { style: 'font-size: 13px; color: var(--ink-soft); line-height: 1.5;' }, step));
      infoCard.appendChild(row);
    });
    wrap.appendChild(infoCard);

    wrap.appendChild(h('div', { style: 'padding: 32px 24px 0;' },
      h('button', { class: 'scr-btn scr-btn--primary', type: 'button',
        onclick: () => {
          state.sendRecipient = { name: nameInput.value || 'Mate', phone: phoneInput.value, isSms: true };
          navigate('send-amount');
        }
      }, 'Continue')
    ));

    return wrap;
  };

  // ============================================================
  // 14. SEND · SMS CONFIRM
  // ============================================================
  SCREENS['send-sms-confirm'] = function () {
    const wrap = h('div');
    wrap.appendChild(Header('CONFIRM', back));

    const r = state.sendRecipient;

    // Dashed phone circle
    wrap.appendChild(h('div', { style: 'display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 16px 24px;' },
      h('div', {
        style: 'width: 56px; height: 56px; border-radius: 999px; background: var(--lime-soft); border: 2px dashed var(--lime-deep); display: flex; align-items: center; justify-content: center; font-size: 22px;'
      }, '📱'),
      h('div', { style: 'font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; color: var(--ink-muted); margin-top: 6px;' }, 'SENDING VIA SMS TO'),
      h('div', { style: 'font-family: var(--font-display); font-weight: 700; font-size: 24px; color: var(--ink);' }, r.name),
      h('div', { style: 'font-family: var(--font-mono); font-size: 13px; color: var(--ink-muted);' }, r.phone)
    ));

    // Amount
    wrap.appendChild(h('div', {
      style: 'display: flex; align-items: baseline; justify-content: center; gap: 4px; padding: 16px 24px;'
    },
      h('span', { style: 'font-family: Inter, sans-serif; font-weight: 700; font-size: 28px; color: var(--ink-muted);' }, '$'),
      h('span', { style: 'font-family: Inter, sans-serif; font-weight: 700; font-size: 64px; letter-spacing: -0.04em; color: var(--ink); line-height: 1;' }, Math.floor(state.sendAmount).toString()),
      h('span', { style: 'font-family: Inter, sans-serif; font-weight: 700; font-size: 28px; color: var(--ink-muted);' }, '.' + ((state.sendAmount * 100) % 100).toString().padStart(2, '0'))
    ));

    // Sky peace of mind card
    const undoCard = h('div', {
      style: 'margin: 16px 24px 0; padding: 14px 16px; border-radius: 14px; background: var(--sky-soft); border: 1.5px solid var(--sky);'
    });
    undoCard.appendChild(h('div', { style: 'display: flex; align-items: center; gap: 6px; margin-bottom: 6px;' },
      h('div', { style: 'width: 8px; height: 8px; border-radius: 999px; background: var(--sky);' }),
      h('div', { style: 'font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; font-weight: 500; color: var(--ink);' }, 'PEACE OF MIND')
    ));
    undoCard.appendChild(h('div', {
      style: 'font-size: 13px; line-height: 1.5; color: var(--ink);'
    }, "You can undo this anytime in the first 24 hours. We'll remind both of you after 12h if it's still unclaimed."));
    wrap.appendChild(undoCard);

    // Hold to send
    const holdBtn = h('button', {
      class: 'scr-btn scr-btn--primary',
      style: 'margin: 32px 24px 0; width: calc(100% - 48px); position: relative; overflow: hidden;',
      type: 'button',
    }, 'Hold to send via SMS');
    const fill = h('div', {
      style: 'position: absolute; left: 0; top: 0; bottom: 0; width: 0; background: var(--lime-deep); z-index: 0; transition: width 0.05s linear;'
    });
    holdBtn.insertBefore(fill, holdBtn.firstChild);
    let holdTimer = null;
    function startHold() {
      const start = Date.now();
      holdTimer = setInterval(() => {
        const pct = Math.min((Date.now() - start) / 1200, 1);
        fill.style.width = (pct * 100) + '%';
        if (pct >= 1) {
          clearInterval(holdTimer);
          holdTimer = null;
          state.pendingSms = { name: r.name, phone: r.phone, amount: state.sendAmount };
          navigate('send-sms-pending');
        }
      }, 30);
    }
    function endHold() {
      if (holdTimer) clearInterval(holdTimer);
      holdTimer = null;
      fill.style.width = '0';
    }
    holdBtn.addEventListener('mousedown', startHold);
    holdBtn.addEventListener('touchstart', startHold);
    holdBtn.addEventListener('mouseup', endHold);
    holdBtn.addEventListener('mouseleave', endHold);
    holdBtn.addEventListener('touchend', endHold);
    wrap.appendChild(holdBtn);

    wrap.appendChild(h('div', { style: 'text-align: center; font-size: 13px; color: var(--ink-muted); padding: 14px 24px 0;' }, 'Tap and hold to confirm'));

    return wrap;
  };

  // ============================================================
  // 15. SEND · SMS PENDING
  // ============================================================
  SCREENS['send-sms-pending'] = function () {
    const wrap = h('div');
    const r = state.sendRecipient;

    // Hero: butter plane
    wrap.appendChild(h('div', { style: 'display: flex; flex-direction: column; align-items: center; padding: 48px 24px 24px;' },
      h('div', {
        style: 'width: 80px; height: 80px; border-radius: 999px; background: var(--butter); border: 3px solid var(--ink); display: flex; align-items: center; justify-content: center; font-size: 36px; box-shadow: 0 5px 0 var(--ink);'
      }, '✈'),
      h('div', { style: 'font-family: var(--font-display); font-weight: 700; font-size: 48px; letter-spacing: -0.03em; color: var(--ink); margin-top: 24px;' }, 'On the way.'),
      h('div', { style: 'display: flex; gap: 6px; align-items: center; margin-top: 8px;' },
        h('span', { style: 'font-family: Inter, sans-serif; font-weight: 700; font-size: 20px; color: var(--ink);' }, '$' + fmtMoney(state.sendAmount)),
        h('span', { style: 'font-size: 15px; color: var(--ink-muted);' }, 'to'),
        h('span', { style: 'font-family: var(--font-body); font-weight: 600; font-size: 16px; color: var(--ink);' }, r.name)
      )
    ));

    // SMS preview
    const smsCard = h('div', {
      style: 'margin: 24px 24px 0; padding: 18px 20px; border-radius: 18px; background: var(--paper-elevated); border: 1px solid var(--line);'
    });
    smsCard.appendChild(h('div', { style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;' },
      h('div', { style: 'font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; color: var(--ink-muted);' }, 'TEXT WE SENT'),
      h('div', {
        style: 'display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; background: var(--butter); border: 1px solid var(--ink); font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; font-weight: 600;'
      },
        h('div', { style: 'width: 5px; height: 5px; border-radius: 999px; background: var(--ink-soft);' }),
        'PENDING'
      )
    ));
    smsCard.appendChild(h('div', {
      style: 'background: var(--paper-deep); padding: 12px 14px; border-radius: 14px; font-size: 14px; line-height: 1.5; color: var(--ink);'
    }, 'Hannah sent you $' + fmtMoney(state.sendAmount) + ' on Sorted. Tap to claim → sorted.au/c/9F2X'));
    wrap.appendChild(smsCard);

    // Actions row
    const actions = h('div', { style: 'display: flex; gap: 8px; padding: 24px 24px 0;' });
    actions.appendChild(h('button', {
      class: 'scr-btn scr-btn--secondary',
      style: 'flex: 1;',
      type: 'button',
      onclick: () => {
        state.balance += state.sendAmount;
        state.pendingSms = null;
        state.history = [];
        navigate('home', 'forward', true);
      }
    }, 'Undo'));
    actions.appendChild(h('button', {
      class: 'scr-btn scr-btn--primary',
      style: 'flex: 1;',
      type: 'button',
      onclick: () => {
        state.balance -= state.sendAmount;
        state.history = [];
        navigate('home', 'forward', true);
      }
    }, 'Done'));
    wrap.appendChild(actions);

    wrap.appendChild(h('div', {
      style: 'text-align: center; font-size: 12px; color: var(--ink-muted); padding: 14px 24px 0; line-height: 1.4;'
    }, "We'll text you when " + r.name + " claims it · or undo for 24h"));

    return wrap;
  };

  // ============================================================
  // 16. RECEIVE
  // ============================================================
  SCREENS.receive = function () {
    const wrap = h('div');
    wrap.appendChild(Header('RECEIVE', back));

    wrap.appendChild(h('div', { style: 'text-align: center; padding: 8px 24px 16px;' },
      h('h1', { style: 'font-family: var(--font-display); font-weight: 700; font-size: 56px; letter-spacing: -0.03em; color: var(--ink); margin: 0;' }, 'Get paid.'),
      h('p', { style: 'font-size: 15px; color: var(--ink-muted); margin-top: 8px;' }, 'Share your @handle. Lands instantly.')
    ));

    // Lime handle card
    const handleCard = h('div', {
      style: 'margin: 16px 24px; padding: 28px 24px; border-radius: 24px; background: var(--lime); border: 2.5px solid var(--ink); box-shadow: 0 6px 0 var(--ink); text-align: center;'
    });
    handleCard.appendChild(h('div', { style: 'font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; opacity: 0.65;' }, 'YOUR HANDLE'));
    handleCard.appendChild(h('div', {
      style: 'font-family: var(--font-display); font-weight: 700; font-size: 48px; letter-spacing: -0.03em; color: var(--ink); margin-top: 12px;'
    }, '@hannah'));
    const actionRow = h('div', { style: 'display: flex; gap: 8px; justify-content: center; margin-top: 16px;' });
    ['Copy', 'Share'].forEach((label) => {
      actionRow.appendChild(h('button', {
        type: 'button',
        style: 'padding: 8px 16px; border-radius: 999px; background: var(--paper-elevated); border: 2px solid var(--ink); font-family: var(--font-body); font-weight: 600; font-size: 13px; cursor: pointer;',
        onclick: () => {
          // visual ping
          this.style && (this.style.transform = 'scale(0.95)');
          if (label === 'Copy') {
            try { navigator.clipboard && navigator.clipboard.writeText('@hannah'); } catch (e) {}
          }
        }
      }, label));
    });
    handleCard.appendChild(actionRow);
    wrap.appendChild(handleCard);

    // QR card
    const qrCard = h('div', {
      style: 'margin: 16px 24px; padding: 24px; border-radius: 24px; background: var(--paper-elevated); border: 1px solid var(--line); text-align: center;'
    });
    // Faux-QR
    const qr = h('div', {
      style: 'width: 160px; height: 160px; border-radius: 12px; background: var(--ink); margin: 0 auto; position: relative;'
    });
    // 3 corner markers + scatter pixels
    const corners = [[16,16], [16,116], [116,16]];
    corners.forEach(([x, y]) => {
      qr.appendChild(h('div', {
        style: `position: absolute; left: ${x}px; top: ${y}px; width: 28px; height: 28px; background: var(--paper-elevated); border-radius: 4px;`
      }));
    });
    const pixels = [[55,55],[70,55],[55,70],[85,75],[100,80],[70,85],[85,100],[120,120],[100,120],[55,120]];
    pixels.forEach(([x,y]) => {
      qr.appendChild(h('div', {
        style: `position: absolute; left: ${x}px; top: ${y}px; width: 8px; height: 8px; background: var(--paper-elevated); border-radius: 2px;`
      }));
    });
    qrCard.appendChild(qr);
    qrCard.appendChild(h('div', {
      style: 'font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; color: var(--ink-muted); margin-top: 16px;'
    }, 'OR SCAN TO PAY @HANNAH'));
    wrap.appendChild(qrCard);

    return wrap;
  };

  // ============================================================
  // 17. ACTIVITY
  // ============================================================
  SCREENS.activity = function () {
    const wrap = h('div', { style: 'padding-bottom: 90px;' });

    // Title row
    wrap.appendChild(h('div', {
      style: 'display: flex; justify-content: space-between; align-items: center; padding: 20px 24px 8px;'
    },
      h('div', { style: 'font-family: var(--font-display); font-weight: 700; font-size: 40px; letter-spacing: -0.02em; color: var(--ink);' }, 'Activity'),
      h('div', {
        style: 'padding: 6px 14px; border-radius: 999px; background: var(--paper-elevated); border: 1px solid var(--line); font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; cursor: pointer;'
      }, 'ALL ↓')
    ));

    // Sections
    const sections = ['TODAY', 'YESTERDAY', 'THIS WEEK'];
    sections.forEach((section) => {
      const items = state.activity.filter((a) => a.section === section);
      if (items.length === 0 && !(section === 'TODAY' && state.pendingSms)) return;

      wrap.appendChild(h('div', {
        style: 'font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; color: var(--ink-muted); padding: 16px 24px 8px;'
      }, section));

      const list = h('div', { style: 'padding: 0 24px; display: flex; flex-direction: column; gap: 8px;' });

      if (section === 'TODAY' && state.pendingSms) {
        const pendingRow = h('div', {
          style: 'display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 14px; background: var(--butter); border: 1.5px solid var(--ink);'
        });
        pendingRow.appendChild(h('div', {
          style: 'width: 40px; height: 40px; border-radius: 999px; background: var(--paper-elevated); border: 2px dashed var(--ink); display: flex; align-items: center; justify-content: center; font-size: 18px;'
        }, '📱'));
        pendingRow.appendChild(h('div', { style: 'flex: 1;' },
          h('div', { style: 'display: flex; align-items: center; gap: 6px;' },
            h('div', { style: 'font-family: var(--font-display); font-weight: 700; font-size: 15px; color: var(--ink);' }, state.pendingSms.name),
            h('div', { style: 'padding: 1px 6px; border-radius: 999px; background: var(--paper-elevated); border: 1px solid var(--ink); font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.1em; font-weight: 600;' }, 'PENDING')
          ),
          h('div', { style: 'font-size: 12px; color: var(--ink-soft); margin-top: 2px;' }, 'SMS sent · awaiting claim · undo for 24h')
        ));
        pendingRow.appendChild(h('div', { style: 'font-family: Inter, sans-serif; font-weight: 700; font-size: 14px; color: var(--ink);' }, '−$' + fmtMoney(state.pendingSms.amount)));
        list.appendChild(pendingRow);
      }

      items.forEach((a) => {
        const row = h('div', {
          style: 'display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 14px; background: var(--paper-elevated); border: 1px solid var(--line);'
        });
        row.appendChild(Avatar(a.color, a.initials, 'md'));
        row.appendChild(h('div', { style: 'flex: 1;' },
          h('div', { style: 'font-family: var(--font-display); font-weight: 700; font-size: 15px; color: var(--ink);' }, a.who),
          h('div', { style: 'font-size: 12px; color: var(--ink-muted); margin-top: 2px;' }, a.subtitle)
        ));
        row.appendChild(h('div', {
          style: `font-family: Inter, sans-serif; font-weight: 700; font-size: 14px; color: ${a.amount.startsWith('−') ? 'var(--ink-soft)' : 'var(--ink)'};`
        }, a.amount));
        list.appendChild(row);
      });
      wrap.appendChild(list);
    });

    wrap.appendChild(BottomNav('activity'));
    return wrap;
  };

  // ============================================================
  // 18. TOP UP · AMOUNT
  // ============================================================
  SCREENS['topup-amount'] = function () {
    const wrap = h('div');
    wrap.appendChild(Header('TOP UP', back));

    // Hero: butter tile
    wrap.appendChild(h('div', { style: 'display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 24px;' },
      Tile('butter', '+'),
      h('div', { style: 'font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; color: var(--ink-muted);' }, 'ADD TO BALANCE')
    ));

    // Amount
    let entered = '50000';
    const amountWrap = h('div', { style: 'display: flex; flex-direction: column; align-items: center; padding: 16px 24px;' });
    const amountRow = h('div', { style: 'display: flex; align-items: baseline; gap: 4px;' },
      h('span', { style: 'font-family: Inter, sans-serif; font-weight: 700; font-size: 28px; color: var(--ink-muted);' }, '$'),
      h('span', { id: 'tuWhole', style: 'font-family: Inter, sans-serif; font-weight: 700; font-size: 64px; letter-spacing: -0.04em; color: var(--ink); line-height: 1;' }, '500'),
      h('span', { id: 'tuDecimal', style: 'font-family: Inter, sans-serif; font-weight: 700; font-size: 28px; color: var(--ink-muted);' }, '.00')
    );
    amountWrap.appendChild(amountRow);
    amountWrap.appendChild(h('div', {
      style: 'font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; color: var(--ink-muted); margin-top: 10px;'
    }, 'FROM · COMMBANK ····0421'));
    wrap.appendChild(amountWrap);

    // Chips
    const chipsRow = h('div', { style: 'display: flex; justify-content: center; gap: 8px; padding: 4px 24px 16px;' });
    [50, 100, 250, 500].forEach((v) => {
      chipsRow.appendChild(h('button', {
        type: 'button',
        style: 'padding: 8px 16px; border-radius: 999px; background: var(--paper-elevated); border: 1.5px solid var(--ink); font-family: var(--font-display); font-weight: 600; font-size: 13px; cursor: pointer; box-shadow: 0 2px 0 var(--ink);',
        onclick: () => { entered = String(v * 100); update(); }
      }, '$' + v));
    });
    wrap.appendChild(chipsRow);

    wrap.appendChild(h('div', { style: 'padding: 0 24px;' },
      h('button', {
        class: 'scr-btn scr-btn--primary', type: 'button',
        onclick: () => {
          state.topUpAmount = parseInt(entered) / 100;
          navigate('topup-payid');
        }
      }, 'Continue')
    ));

    // Keypad
    const keypad = h('div', {
      style: 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; padding: 16px 18px 0; user-select: none;'
    });
    const keys = ['1','2','3','4','5','6','7','8','9','.','0','⌫'];
    keys.forEach((k) => {
      keypad.appendChild(h('button', {
        type: 'button',
        style: 'padding: 16px 0; background: transparent; border: none; font-family: var(--font-display); font-weight: 700; font-size: 26px; color: var(--ink); cursor: pointer;',
        onclick: () => {
          if (k === '⌫') entered = entered.length > 1 ? entered.slice(0, -1) : '0';
          else if (k === '.') return;
          else if (entered.length < 7) entered = (entered === '0' ? '' : entered) + k;
          update();
        }
      }, k));
    });
    wrap.appendChild(keypad);

    function update() {
      const cents = parseInt(entered || '0');
      const whole = Math.floor(cents / 100).toString();
      const dec = '.' + (cents % 100).toString().padStart(2, '0');
      wrap.querySelector('#tuWhole').textContent = whole;
      wrap.querySelector('#tuDecimal').textContent = dec;
    }

    return wrap;
  };

  // ============================================================
  // 19. TOP UP · PAYID
  // ============================================================
  SCREENS['topup-payid'] = function () {
    const wrap = h('div');
    wrap.appendChild(Header('PAY-ID', back));

    wrap.appendChild(h('div', { style: 'padding: 8px 24px 16px;' },
      h('h1', { class: 'scr-title-h2' }, 'Send $' + fmtMoney(state.topUpAmount) + '\nfrom your bank.'),
      h('p', { class: 'scr-subtitle' }, 'Open your banking app and pay this PayID. Auto-detected when it lands.')
    ));

    // Lime PayID card
    const payidCard = h('div', {
      style: 'margin: 16px 24px; padding: 24px; border-radius: 24px; background: var(--lime); border: 2.5px solid var(--ink); box-shadow: 0 6px 0 var(--ink);'
    });
    payidCard.appendChild(h('div', { style: 'font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; opacity: 0.65;' }, 'PAY-ID'));
    payidCard.appendChild(h('div', { style: 'display: flex; justify-content: space-between; align-items: center; margin-top: 8px;' },
      h('div', { style: 'font-family: var(--font-display); font-weight: 700; font-size: 22px; letter-spacing: -0.02em; color: var(--ink);' }, 'topup@sorted.au'),
      h('button', {
        type: 'button',
        style: 'padding: 6px 14px; border-radius: 999px; background: var(--paper-elevated); border: 2px solid var(--ink); font-family: var(--font-body); font-weight: 600; font-size: 12px; cursor: pointer;',
        onclick: () => { try { navigator.clipboard && navigator.clipboard.writeText('topup@sorted.au'); } catch (e) {} }
      }, 'Copy')
    ));
    wrap.appendChild(payidCard);

    // Reference card
    wrap.appendChild(h('div', {
      style: 'margin: 16px 24px; padding: 16px 20px; border-radius: 18px; background: var(--paper-elevated); border: 1px solid var(--line);'
    },
      h('div', { style: 'font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; color: var(--ink-muted);' }, 'REFERENCE'),
      h('div', { style: 'font-family: var(--font-display); font-weight: 700; font-size: 18px; color: var(--ink); margin-top: 4px;' }, 'HANNAH-9F2X')
    ));

    // Waiting state pill
    wrap.appendChild(h('div', {
      style: 'margin: 16px 24px; padding: 12px 16px; border-radius: 999px; background: var(--butter); border: 1.5px solid var(--ink); display: flex; align-items: center; justify-content: center; gap: 8px;'
    },
      h('div', { style: 'width: 8px; height: 8px; border-radius: 999px; background: var(--ink-soft);' }),
      h('div', { style: 'font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; font-weight: 500; color: var(--ink);' }, 'WAITING FOR YOUR BANK · 0:23')
    ));

    // Simulate
    wrap.appendChild(h('div', { style: 'padding: 16px 24px 0;' },
      h('button', {
        class: 'scr-btn scr-btn--secondary', type: 'button',
        onclick: () => {
          state.balance += state.topUpAmount;
          state.history = [];
          navigate('home', 'forward', true);
        }
      }, 'Simulate bank payment')
    ));

    return wrap;
  };

  // ============================================================
  // 20. SETTINGS (home)
  // ============================================================
  SCREENS.settings = function () {
    const wrap = h('div', { style: 'padding-bottom: 90px;' });
    wrap.appendChild(h('div', { style: 'padding: 24px 24px 16px;' },
      h('div', { style: 'font-family: var(--font-display); font-weight: 700; font-size: 40px; letter-spacing: -0.02em; color: var(--ink);' }, 'Settings')
    ));

    // Profile card
    const profileCard = h('div', {
      style: 'margin: 0 24px; padding: 16px 20px; border-radius: 18px; background: var(--paper-elevated); border: 1px solid var(--line); display: flex; align-items: center; gap: 16px; cursor: pointer;',
      onclick: () => navigate('settings-profile'),
    });
    profileCard.appendChild(Avatar('lime', 'HR', 'lg'));
    profileCard.appendChild(h('div', { style: 'flex: 1;' },
      h('div', { style: 'font-family: var(--font-display); font-weight: 700; font-size: 16px; color: var(--ink);' }, 'Hannah Reid'),
      h('div', { style: 'display: flex; gap: 8px; align-items: center; margin-top: 4px;' },
        h('span', { style: 'font-family: var(--font-mono); font-size: 12px; color: var(--ink-muted);' }, '@hannah'),
        h('span', {
          style: 'padding: 1px 7px; border-radius: 999px; background: var(--lime-soft); border: 1px solid var(--lime-deep); font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.1em; font-weight: 600; color: var(--ink);'
        }, 'TIER 1')
      )
    ));
    profileCard.appendChild(h('div', { style: 'font-family: var(--font-display); font-weight: 700; font-size: 18px; color: var(--ink-muted);' }, '→'));
    wrap.appendChild(profileCard);

    // Menu
    const menu = h('div', {
      style: 'margin: 16px 24px; border-radius: 18px; background: var(--paper-elevated); border: 1px solid var(--line); overflow: hidden;'
    });
    const items = [
      { label: 'Profile', detail: 'Name, avatar, @handle', screen: 'settings-profile' },
      { label: 'Verification', detail: 'Tier 1 · upgrade for higher limits', screen: 'settings-verification' },
      { label: 'Notifications', detail: 'Push, email, daily yield', screen: 'settings-notifications' },
      { label: 'Help & support', detail: 'Docs, contact us' },
      { label: 'Reset demo', detail: 'Restart from onboarding', onClick: reset },
      { label: 'Sign out', detail: null, danger: true, onClick: reset },
    ];
    items.forEach((item, i) => {
      const row = h('div', {
        style: `display: flex; align-items: center; padding: 16px; cursor: pointer; ${i > 0 ? 'border-top: 1px solid var(--line);' : ''}`,
        onclick: () => {
          if (item.onClick) item.onClick();
          else if (item.screen) navigate(item.screen);
        },
      });
      row.appendChild(h('div', { style: 'flex: 1;' },
        h('div', { style: `font-family: var(--font-display); font-weight: 700; font-size: 15px; color: ${item.danger ? 'var(--coral)' : 'var(--ink)'};` }, item.label),
        item.detail ? h('div', { style: 'font-size: 12px; color: var(--ink-muted); margin-top: 2px;' }, item.detail) : null
      ));
      row.appendChild(h('div', {
        style: `font-family: var(--font-display); font-weight: 700; font-size: 15px; color: ${item.danger ? 'var(--coral)' : 'var(--ink-muted)'};`
      }, '→'));
      menu.appendChild(row);
    });
    wrap.appendChild(menu);

    wrap.appendChild(BottomNav('settings'));
    return wrap;
  };

  // ============================================================
  // 21. SETTINGS · PROFILE
  // ============================================================
  SCREENS['settings-profile'] = function () {
    const wrap = h('div');
    wrap.appendChild(Header('PROFILE', back));

    // Avatar + swatches
    const avatar = Avatar('lime', 'HR', 'huge');
    const avatarWrap = h('div', { style: 'display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 16px 24px;' }, avatar);
    const colors = ['lime','coral','sky','butter','plum'];
    const swatchRow = h('div', { style: 'display: flex; gap: 12px;' });
    colors.forEach((c, i) => {
      const sw = h('div', {
        style: `width: 28px; height: 28px; border-radius: 999px; background: var(--${c}); cursor: pointer; ${i === 0 ? 'border: 2px solid var(--ink); box-shadow: 0 0 0 2px var(--paper);' : 'border: 2px solid transparent;'}`
      });
      sw.addEventListener('click', () => {
        [...swatchRow.children].forEach((s) => { s.style.border = '2px solid transparent'; s.style.boxShadow = 'none'; });
        sw.style.border = '2px solid var(--ink)'; sw.style.boxShadow = '0 0 0 2px var(--paper)';
        avatar.className = `scr-avatar scr-avatar--huge scr-avatar--${c}`;
      });
      swatchRow.appendChild(sw);
    });
    avatarWrap.appendChild(swatchRow);
    wrap.appendChild(avatarWrap);

    // Fields
    const fieldStyle = 'font-family: var(--font-mono); font-size: 12px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-muted); margin-bottom: 6px;';
    const fields = [
      { label: 'FIRST NAME', value: 'Hannah', editable: true },
      { label: 'LAST NAME', value: 'Reid', editable: true },
      { label: '@HANDLE', value: '@hannah', editable: false },
      { label: 'MOBILE', value: '+61 04XX XXX 921', editable: false },
    ];
    const formWrap = h('div', { style: 'padding: 16px 24px; display: flex; flex-direction: column; gap: 16px;' });
    fields.forEach((f) => {
      const block = h('div', {});
      block.appendChild(h('div', { style: fieldStyle }, f.label));
      block.appendChild(h('input', {
        class: f.editable ? 'scr-input' : 'scr-input scr-input--disabled',
        type: 'text', value: f.value,
        disabled: f.editable ? null : 'disabled',
      }));
      if (!f.editable) block.appendChild(h('div', { style: 'font-size: 12px; color: var(--ink-muted); margin-top: 6px;' }, 'Locked. Contact support to change.'));
      formWrap.appendChild(block);
    });
    wrap.appendChild(formWrap);

    wrap.appendChild(h('div', { style: 'padding: 16px 24px 0;' },
      h('button', { class: 'scr-btn scr-btn--primary', type: 'button', onclick: back }, 'Save changes')
    ));

    return wrap;
  };

  // ============================================================
  // 22. SETTINGS · VERIFICATION
  // ============================================================
  SCREENS['settings-verification'] = function () {
    const wrap = h('div');
    wrap.appendChild(Header('VERIFICATION', back));

    // Tier 1 hero
    const tier1 = h('div', {
      style: 'margin: 12px 24px; padding: 24px 20px; border-radius: 24px; background: var(--lime); border: 2.5px solid var(--ink); box-shadow: 0 6px 0 var(--ink);'
    });
    tier1.appendChild(h('div', { style: 'display: flex; justify-content: space-between; align-items: center;' },
      h('div', { style: 'font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; opacity: 0.65;' }, 'VERIFIED · TIER 1'),
      h('div', {
        style: 'width: 32px; height: 32px; border-radius: 999px; background: var(--paper-elevated); border: 2px solid var(--ink); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 700; font-size: 16px;'
      }, '✓')
    ));
    tier1.appendChild(h('div', { style: 'font-family: var(--font-display); font-weight: 700; font-size: 28px; letter-spacing: -0.02em; color: var(--ink); margin-top: 14px;' }, "You're verified."));
    const limits = h('div', { style: 'display: flex; gap: 24px; margin-top: 16px;' });
    [
      { l: 'DAILY LIMIT', v: '$10,000' },
      { l: 'PER TXN LIMIT', v: '$5,000' },
    ].forEach((x) => {
      limits.appendChild(h('div', {},
        h('div', { style: 'font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; opacity: 0.65;' }, x.l),
        h('div', { style: 'font-family: Inter, sans-serif; font-weight: 700; font-size: 18px; color: var(--ink); margin-top: 2px;' }, x.v)
      ));
    });
    tier1.appendChild(limits);
    wrap.appendChild(tier1);

    // Verified list
    wrap.appendChild(h('div', {
      style: 'font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; color: var(--ink-muted); padding: 24px 24px 8px;'
    }, 'VERIFIED'));

    const verifiedCard = h('div', {
      style: 'margin: 0 24px; border-radius: 18px; background: var(--paper-elevated); border: 1px solid var(--line); overflow: hidden;'
    });
    const verified = [
      { l: 'Mobile number', v: '+61 04XX XXX 921' },
      { l: 'Identity (FrankieOne)', v: 'Verified · Apr 2026' },
      { l: 'Wallet provisioned', v: 'Solana mainnet · Privy' },
    ];
    verified.forEach((it, i) => {
      const row = h('div', {
        style: `display: flex; align-items: center; gap: 12px; padding: 14px 16px; ${i > 0 ? 'border-top: 1px solid var(--line);' : ''}`
      });
      row.appendChild(h('div', { style: 'width: 20px; height: 20px; border-radius: 999px; background: var(--lime); flex-shrink: 0;' }));
      row.appendChild(h('div', { style: 'flex: 1;' },
        h('div', { style: 'font-family: var(--font-display); font-weight: 700; font-size: 15px; color: var(--ink);' }, it.l),
        h('div', { style: 'font-size: 12px; color: var(--ink-muted); margin-top: 2px;' }, it.v)
      ));
      verifiedCard.appendChild(row);
    });
    wrap.appendChild(verifiedCard);

    // Tier 2 dark panel
    const tier2 = h('div', {
      style: 'margin: 24px 24px 0; padding: 24px 20px; border-radius: 24px; background: var(--ink); color: var(--paper);'
    });
    tier2.appendChild(h('div', { style: 'display: flex; justify-content: space-between; align-items: center;' },
      h('div', { style: 'font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; opacity: 0.65;' }, 'UNLOCK MORE'),
      h('div', { style: 'padding: 2px 10px; border-radius: 999px; background: var(--plum); font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; font-weight: 600;' }, 'TIER 2')
    ));
    tier2.appendChild(h('div', {
      style: 'font-family: var(--font-display); font-weight: 700; font-size: 28px; line-height: 1.05; letter-spacing: -0.02em; color: var(--paper); margin-top: 14px;'
    }, 'Higher limits.\nMore freedom.'));
    const t2lim = h('div', { style: 'display: flex; gap: 24px; margin-top: 14px;' });
    [
      { l: 'DAILY LIMIT', v: '$50,000' },
      { l: 'PER TXN LIMIT', v: '$25,000' },
    ].forEach((x) => {
      t2lim.appendChild(h('div', {},
        h('div', { style: 'font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; opacity: 0.65;' }, x.l),
        h('div', { style: 'font-family: Inter, sans-serif; font-weight: 700; font-size: 18px; color: var(--paper); margin-top: 2px;' }, x.v)
      ));
    });
    tier2.appendChild(t2lim);
    tier2.appendChild(h('div', { style: 'margin-top: 16px;' },
      h('button', { class: 'scr-btn scr-btn--primary scr-btn--md', type: 'button', style: 'width: 100%;' }, 'Upgrade to Tier 2')
    ));
    wrap.appendChild(tier2);

    return wrap;
  };

  // ============================================================
  // 23. SETTINGS · NOTIFICATIONS
  // ============================================================
  SCREENS['settings-notifications'] = function () {
    const wrap = h('div');
    wrap.appendChild(Header('NOTIFICATIONS', back));

    // Hero
    wrap.appendChild(h('div', { class: 'scr-hero', style: 'padding-top: 16px;' },
      Tile('sky', '🔔'),
      h('h1', { class: 'scr-hero-title' }, 'How should we ping you?'),
      h('p', { class: 'scr-hero-sub' }, 'Push notifications. We default to less, not more.')
    ));

    function Toggle(initial) {
      let on = initial;
      const t = h('button', {
        type: 'button',
        style: `width: 48px; height: 28px; border-radius: 999px; background: ${on ? 'var(--lime)' : 'var(--paper-deep)'}; border: 1.5px solid var(--ink); position: relative; cursor: pointer; padding: 0; transition: background 0.2s ease;`
      });
      const knob = h('div', {
        style: `position: absolute; top: 2px; left: ${on ? '22px' : '2px'}; width: 21px; height: 21px; border-radius: 999px; background: var(--paper-elevated); border: 1.5px solid var(--ink); transition: left 0.2s ease;`
      });
      t.appendChild(knob);
      t.addEventListener('click', () => {
        on = !on;
        t.style.background = on ? 'var(--lime)' : 'var(--paper-deep)';
        knob.style.left = on ? '22px' : '2px';
      });
      return t;
    }

    function Section(label, items) {
      const section = h('div', { style: 'padding: 16px 24px 0;' });
      section.appendChild(h('div', {
        style: 'font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; color: var(--ink-muted); padding: 0 8px 8px;'
      }, label));
      const card = h('div', {
        style: 'border-radius: 18px; background: var(--paper-elevated); border: 1px solid var(--line); overflow: hidden;'
      });
      items.forEach((item, i) => {
        const row = h('div', {
          style: `display: flex; align-items: center; gap: 12px; padding: 14px 16px; ${i > 0 ? 'border-top: 1px solid var(--line);' : ''}`
        });
        row.appendChild(h('div', { style: 'flex: 1;' },
          h('div', { style: 'font-family: var(--font-display); font-weight: 700; font-size: 15px; color: var(--ink);' }, item.label),
          h('div', { style: 'font-size: 12px; color: var(--ink-muted); margin-top: 2px;' }, item.detail)
        ));
        row.appendChild(Toggle(item.on));
        card.appendChild(row);
      });
      section.appendChild(card);
      return section;
    }

    wrap.appendChild(Section('MONEY', [
      { label: 'Money sent', detail: 'Confirmation when a payment goes through', on: true },
      { label: 'Money received', detail: 'Push when you get paid', on: true },
      { label: 'Top-up complete', detail: 'When your bank transfer lands', on: true },
      { label: 'Failed transactions', detail: "We'll always tell you about these", on: true },
    ]));

    wrap.appendChild(Section('YIELD', [
      { label: 'Daily yield drop', detail: '3.33% APY hits your balance', on: true },
      { label: 'Weekly summary', detail: 'Sundays · how much you earned', on: false },
    ]));

    return wrap;
  };

  // ============================================================
  // INIT — register controls + boot first screen
  // ============================================================
  document.getElementById('resetDemo').addEventListener('click', reset);

  // Edge swipe-back gesture
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

  // Boot
  navigate('welcome', 'forward', true);

  // Expose for debugging
  window.__sortedDemo = { state, navigate, back, reset };
})();
