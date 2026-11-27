import { useRef, useState, useEffect } from 'react';

const STICKER_THEMES = [
  { bg: '#0E5A07', text: '#FFFFFF' },
  { bg: '#B79EFF', text: '#141124' },
  { bg: '#EF6C33', text: '#FFFFFF' },
  { bg: '#D13514', text: '#FFFFFF' },
  { bg: '#FF98CC', text: '#1C0D16' },
  { bg: '#45A7F5', text: '#FFFFFF' },
  { bg: '#FFE27A', text: '#2B2206' },
  { bg: '#BFF7B2', text: '#0D2E12' },
];

const DOODLE_FIGS = ['flower', 'cat', 'fish', 'bug'];

function hashStr(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function getDeckThemeForTask(task, index = 0) {
  const safeTitle = String(task && task.title ? task.title : 'Task');
  const seed = hashStr(String((task && task._id) || safeTitle || index));
  return STICKER_THEMES[seed % STICKER_THEMES.length];
}

function clearSelection() {
  if (typeof window !== 'undefined' && window.getSelection) {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) sel.removeAllRanges();
  }
}

function hexToRgb(hex) {
  const clean = String(hex || '#FFE27A').replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean.padEnd(6, '0').slice(0, 6);
  const num = parseInt(full, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function OutlinedWhiteLogo({ type }) {
  const strokeProps = {
    stroke: '#111111',
    strokeWidth: '2.4',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    fill: '#FFFFFF',
  };

  if (type === 'flower') {
    return (
      <svg className="sticker-doodle white-bordered-logo" viewBox="0 0 36 36">
        <circle cx="18" cy="9.5" r="4.3" {...strokeProps} />
        <circle cx="26" cy="15" r="4.3" {...strokeProps} />
        <circle cx="23" cy="24.5" r="4.3" {...strokeProps} />
        <circle cx="13" cy="24.5" r="4.3" {...strokeProps} />
        <circle cx="10" cy="15" r="4.3" {...strokeProps} />
        <circle cx="18" cy="17.5" r="3.5" fill="#FFFFFF" stroke="#111111" strokeWidth="2.2" />
      </svg>
    );
  }
  if (type === 'cat') {
    return (
      <svg className="sticker-doodle white-bordered-logo" viewBox="0 0 36 36">
        <path
          d="M9.5 14L8.5 7.5L14.2 11.2C15.4 10.6 16.7 10.4 18 10.4C19.3 10.4 20.6 10.6 21.8 11.2L27.5 7.5L26.5 14C28.3 15.8 29.2 18 29.2 20.6C29.2 25.8 24.1 29 18 29C11.9 29 6.8 25.8 6.8 20.6C6.8 18 7.7 15.8 9.5 14Z"
          {...strokeProps}
        />
        <circle cx="14.2" cy="19.5" r="1.4" fill="#111111" />
        <circle cx="21.8" cy="19.5" r="1.4" fill="#111111" />
        <path d="M16.5 23L18 24.4L19.5 23" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'fish') {
    return (
      <svg className="sticker-doodle white-bordered-logo" viewBox="0 0 36 36">
        <path
          d="M6.5 18C10.8 12 18.5 11 24.8 16.2L30.5 12.5V23.5L24.8 19.8C18.5 25 10.8 24 6.5 18Z"
          {...strokeProps}
        />
        <circle cx="12.8" cy="17" r="1.5" fill="#111111" />
      </svg>
    );
  }
  return (
    <svg className="sticker-doodle white-bordered-logo" viewBox="0 0 36 36">
      <ellipse cx="18" cy="19.5" rx="6.2" ry="8.2" {...strokeProps} />
      <path d="M13.8 12.8L11 10M22.2 12.8L25 10" fill="none" stroke="#111111" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M11.8 17L7.5 15.8M11.8 20.2L7.2 20.8M12.2 23.5L8.5 25.8" fill="none" stroke="#111111" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M24.2 17L28.5 15.8M24.2 20.2L28.8 20.8M23.8 23.5L27.5 25.8" fill="none" stroke="#111111" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function spawnSlowMotionRingBurst(originX, originY, hexColor) {
  if (typeof document === 'undefined') return;
  const { r, g, b } = hexToRgb(hexColor);
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = (document.querySelector(".auth-centered-card") ? "2" : "60");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const total = 190;
  const particles = Array.from({ length: total }, (_, idx) => {
    const baseAngle = (Math.PI * 2 * idx) / total;
    const angle = baseAngle + (Math.random() - 0.5) * 0.28;
    const ringRadius = 10 + Math.random() * 14;
    const speed = 0.75 + Math.random() * 1.45;
    const shadeShift = ((idx % 5) - 2) * 16;
    return {
      x: originX + Math.cos(angle) * ringRadius,
      y: originY + Math.sin(angle) * ringRadius,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed + 0.14,
      size: 1.8 + Math.random() * 2.6,
      alpha: 0.92,
      decay: 0.0085 + Math.random() * 0.0055,
      r: Math.max(0, Math.min(255, r + shadeShift)),
      g: Math.max(0, Math.min(255, g + shadeShift)),
      b: Math.max(0, Math.min(255, b + shadeShift)),
    };
  });

  let rafId = null;
  const drawFrame = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = 0;

    for (const p of particles) {
      if (p.alpha <= 0.01) continue;
      alive++;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.986;
      p.vy = p.vy * 0.986 + 0.008;
      p.alpha -= p.decay;

      ctx.fillStyle = 'rgba(' + p.r + ', ' + p.g + ', ' + p.b + ', ' + Math.max(0, p.alpha) + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    if (alive > 0) {
      rafId = requestAnimationFrame(drawFrame);
    } else if (canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  };

  rafId = requestAnimationFrame(drawFrame);
  setTimeout(() => {
    if (rafId) cancelAnimationFrame(rafId);
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
  }, 2800);
}

export default function TaskCard({
  task,
  index = 0,
  onToggle,
  onDelete,
  onInspect,
  trashRef,
  onDragStateChange,
  onTrashGulp,
}) {
  const cardRef = useRef(null);
  const [floatingMidAir, setFloatingMidAir] = useState(false);
  const [returningToHome, setReturningToHome] = useState(false);
  const [gone, setGone] = useState(false);
  const simControllerRef = useRef(null);

  const safeTitle = String(task && task.title ? task.title : 'Task');
  const seed = hashStr(String((task && task._id) || safeTitle || index));
  const theme = STICKER_THEMES[seed % STICKER_THEMES.length];
  const baseRgb = hexToRgb(theme.bg);
  const doodle = DOODLE_FIGS[(seed >>> 3) % DOODLE_FIGS.length];
  const tiltDeg = (((seed >>> 7) % 9) - 4) * 0.5;

  const slowMorphBackToBox = (cleanupFn) => {
    if (cleanupFn) cleanupFn();
    setFloatingMidAir(false);
    setReturningToHome(true);
    setTimeout(() => {
      setReturningToHome(false);
    }, 1450);
  };

  useEffect(() => {
    return () => {
      document.body.style.cursor = '';
      document.documentElement.style.cursor = '';
      if (simControllerRef.current && typeof simControllerRef.current.destroy === 'function') {
        simControllerRef.current.destroy();
      }
    };
  }, []);


  const prevRectRef = useRef(null);
  useEffect(() => {
    const el = cardRef.current;
    if (!el || gone || floatingMidAir) return undefined;
    const nextRect = el.getBoundingClientRect();
    const prev = prevRectRef.current;
    prevRectRef.current = nextRect;
    if (!prev) return undefined;

    const deltaX = prev.left - nextRect.left;
    const deltaY = prev.top - nextRect.top;
    if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) return undefined;

    el.style.transition = 'none';
    el.style.transform =
      'translate3d(' + deltaX + 'px, ' + deltaY + 'px, 0) rotate(' + tiltDeg + 'deg)';

    let raf = null;
    raf = requestAnimationFrame(() => {
      el.style.transition = 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1)';
      el.style.transform = 'translate3d(0px, 0px, 0) rotate(' + tiltDeg + 'deg)';
    });
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [task && task._id, gone, floatingMidAir, tiltDeg]);

  const isOverTrash = (clientX, clientY) => {
    const el = trashRef && trashRef.current;
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const pad = 28;
    return (
      clientX >= rect.left - pad &&
      clientX <= rect.right + pad &&
      clientY >= rect.top - pad &&
      clientY <= rect.bottom + pad
    );
  };

  const isHoveringOriginalSpot = (clientX, clientY) => {
    const el = cardRef.current;
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const pad = 36;
    return (
      clientX >= rect.left - pad &&
      clientX <= rect.right + pad &&
      clientY >= rect.top - pad &&
      clientY <= rect.bottom + pad
    );
  };

  const handleCheckClick = (e) => {
    e.stopPropagation();
    const nextDone = !(task && task.completed);
    const btnRect = e.currentTarget.getBoundingClientRect();
    if (nextDone) {
      spawnSlowMotionRingBurst(
        btnRect.left + btnRect.width / 2,
        btnRect.top + btnRect.height / 2,
        theme.bg
      );
    }
    if (onToggle) onToggle(task._id, nextDone);
  };

  const handlePointerDown = (e) => {
    if (e.button === 2) return;
    if (e.target.closest('.sticker-check-btn')) return;

    clearSelection();
    const el = cardRef.current;
    if (!el) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const rect = el.getBoundingClientRect();

    let activeCloth = false;
    let pointerX = startX;
    let pointerY = startY;
    let prevX = startX;
    let prevY = startY;
    let pointerVX = 0;
    let pointerVY = 0;

    let canvas = null;
    let ctx = null;
    let offCanvas = null;
    let offCtx = null;
    let topRail = [];
    let botRail = [];
    let allNodes = [];
    let pinnedNode = null;
    let grabOffsetX = 0;
    let grabOffsetY = 0;
    let mode = 'slide';
    let rafId = null;
    let destroyed = false;
    let time = seed % 100;

    const COLS = 22;
    const ribHalf = Math.min(44, Math.max(28, rect.height * 0.28));
    const segLen = Math.max(7, (rect.width * 0.94) / (COLS - 1));
    const ribLen = ribHalf * 2;
    const diagLen = Math.hypot(segLen, ribLen);
    const bendLen = segLen * 2;

    const cleanupSim = () => {
      if (destroyed) return;
      destroyed = true;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointerdown', onWindowAirGrab, true);
      if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
      document.body.style.cursor = '';
      document.documentElement.style.cursor = '';
      simControllerRef.current = null;
    };

    const satisfySpring = (a, b, restLen, stiffness) => {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 0.0001;
      const diff = ((restLen - d) / d) * stiffness;
      const ox = dx * diff * 0.5;
      const oy = dy * diff * 0.5;
      if (!a.pinned) { a.x -= ox; a.y -= oy; }
      if (!b.pinned) { b.x += ox; b.y += oy; }
    };

    const solveSilkMesh = () => {
      for (let iter = 0; iter < 14; iter++) {
        for (let i = 0; i < COLS - 1; i++) {
          satisfySpring(topRail[i], topRail[i + 1], segLen, 0.9);
          satisfySpring(botRail[i], botRail[i + 1], segLen, 0.9);
        }
        for (let i = 0; i < COLS; i++) {
          satisfySpring(topRail[i], botRail[i], ribLen, 0.85);
          if (i < COLS - 1) {
            satisfySpring(topRail[i], botRail[i + 1], diagLen, 0.42);
            satisfySpring(botRail[i], topRail[i + 1], diagLen, 0.42);
          }
        }
        for (let i = 0; i < COLS - 2; i++) {
          satisfySpring(topRail[i], topRail[i + 2], bendLen, 0.24);
          satisfySpring(botRail[i], botRail[i + 2], bendLen, 0.24);
        }
        if (mode === 'slide' && pinnedNode) {
          pinnedNode.x = pointerX + grabOffsetX;
          pinnedNode.y = pointerY + grabOffsetY;
        }
      }
    };

    const renderSilkTexture = () => {
      if (destroyed || !ctx || !offCtx) return;
      time += 0.045;

      pointerVX = pointerX - prevX;
      pointerVY = pointerY - prevY;
      prevX = pointerX;
      prevY = pointerY;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      offCtx.clearRect(0, 0, offCanvas.width, offCanvas.height);

      if (mode === 'slide' && pinnedNode) {
        pinnedNode.oldX = pinnedNode.x;
        pinnedNode.oldY = pinnedNode.y;
        pinnedNode.x = pointerX + grabOffsetX;
        pinnedNode.y = pointerY + grabOffsetY;

        for (let i = 0; i < COLS; i++) {
          const phase = i * 0.44;
          const drapeWave = Math.sin(time * 3.1 - phase) * 0.32;
          const perpX = -pointerVY * 0.022;
          const perpY = pointerVX * 0.022;

          for (const n of [topRail[i], botRail[i]]) {
            if (n.pinned) continue;
            const vx = (n.x - n.oldX) * 0.92;
            const vy = (n.y - n.oldY) * 0.92;
            n.oldX = n.x;
            n.oldY = n.y;
            n.x += vx + perpX * drapeWave + Math.sin(time * 2.4 + phase) * 0.12;
            n.y += vy + 0.34 + perpY * drapeWave + Math.cos(time * 2.7 + phase) * 0.14;
          }
        }
        solveSilkMesh();
      } else if (mode === 'floating') {
        const pad = 40;
        for (let i = 0; i < COLS; i++) {
          const phase = i * 0.34;
          const hoverX = Math.sin(time * 0.9 + phase) * 0.12;
          const hoverY = Math.cos(time * 1.1 + phase) * 0.14;

          for (const p of [topRail[i], botRail[i]]) {
            const vx = (p.x - p.oldX) * 0.968;
            const vy = (p.y - p.oldY) * 0.968;
            p.oldX = p.x;
            p.oldY = p.y;

            let boundX = 0;
            let boundY = 0;
            if (p.x < pad) boundX = 0.22;
            else if (p.x > window.innerWidth - pad) boundX = -0.22;
            if (p.y < pad + 20) boundY = 0.22;
            else if (p.y > window.innerHeight - pad - 20) boundY = -0.22;

            p.x += vx + hoverX + boundX;
            p.y += vy + hoverY + boundY;
          }
        }
        solveSilkMesh();
      }

      // Previous multi-strip draped cloth shading across mesh columns
      for (let i = 0; i < COLS - 1; i++) {
        const t0 = topRail[i];
        const t1 = topRail[i + 1];
        const b1 = botRail[i + 1];
        const b0 = botRail[i];

        const wave = Math.sin(time * 2.2 + i * 0.55);
        const shadeDelta = Math.round(wave * 24);
        const sr = Math.max(0, Math.min(255, baseRgb.r + shadeDelta));
        const sg = Math.max(0, Math.min(255, baseRgb.g + shadeDelta));
        const sb = Math.max(0, Math.min(255, baseRgb.b + shadeDelta));

        offCtx.beginPath();
        offCtx.moveTo(t0.x, t0.y);
        offCtx.lineTo(t1.x, t1.y);
        offCtx.lineTo(b1.x, b1.y);
        offCtx.lineTo(b0.x, b0.y);
        offCtx.closePath();

        offCtx.fillStyle = 'rgb(' + sr + ', ' + sg + ', ' + sb + ')';
        offCtx.fill();
        offCtx.strokeStyle = 'rgb(' + sr + ', ' + sg + ', ' + sb + ')';
        offCtx.lineWidth = 1.2;
        offCtx.stroke();
      }

      const spine = [];
      for (let i = 0; i < COLS; i++) {
        spine.push({
          x: (topRail[i].x + botRail[i].x) * 0.5,
          y: (topRail[i].y + botRail[i].y) * 0.5,
        });
      }

      const chars = Array.from(safeTitle);
      const count = chars.length;
      if (count > 0) {
        offCtx.fillStyle = theme.text;
        offCtx.font = '900 17px -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif';
        offCtx.textAlign = 'center';
        offCtx.textBaseline = 'middle';

        for (let cIdx = 0; cIdx < count; cIdx++) {
          const tPos = count === 1 ? 0.5 : cIdx / (count - 1);
          const mapped = tPos * (COLS - 1);
          const idx0 = Math.min(COLS - 2, Math.floor(mapped));
          const frac = mapped - idx0;

          const p0 = spine[idx0];
          const p1 = spine[idx0 + 1];
          const baseX = p0.x + (p1.x - p0.x) * frac;
          const baseY = p0.y + (p1.y - p0.y) * frac;
          let segAngle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
          if (segAngle > Math.PI / 2) segAngle -= Math.PI;
          if (segAngle < -Math.PI / 2) segAngle += Math.PI;

          const flowX = Math.sin(time * 3.0 + cIdx * 1.35) * 3.2;
          const flowY = Math.cos(time * 3.5 + cIdx * 1.1) * 3.4;

          offCtx.save();
          offCtx.translate(baseX + flowX, baseY + flowY);
          offCtx.rotate(segAngle * 0.4);
          offCtx.fillText(chars[cIdx], 0, 0);
          offCtx.restore();
        }
      }

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.42)';
      ctx.shadowBlur = 22;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 12;
      ctx.drawImage(offCanvas, 0, 0);
      ctx.restore();

      rafId = requestAnimationFrame(renderSilkTexture);
    };

    const onWindowAirGrab = (ev) => {
      if (destroyed || mode !== 'floating' || ev.button === 2) return;
      if (ev.target && ev.target.closest && ev.target.closest('.sticker-check-btn')) return;

      let best = allNodes[0];
      let bestDist = Infinity;
      for (const n of allNodes) {
        const d = Math.hypot(n.x - ev.clientX, n.y - ev.clientY);
        if (d < bestDist) {
          bestDist = d;
          best = n;
        }
      }
      if (!best || bestDist > ribHalf + 36) return;

      ev.preventDefault();
      clearSelection();
      if (pinnedNode) pinnedNode.pinned = false;
      pinnedNode = best;
      pinnedNode.pinned = true;
      grabOffsetX = pinnedNode.x - ev.clientX;
      grabOffsetY = pinnedNode.y - ev.clientY;
      pointerX = ev.clientX;
      pointerY = ev.clientY;
      prevX = ev.clientX;
      prevY = ev.clientY;
      mode = 'slide';
      document.body.style.cursor = 'grabbing';
      document.documentElement.style.cursor = 'grabbing';

      const onAirMove = (mv) => {
        clearSelection();
        pointerX = mv.clientX;
        pointerY = mv.clientY;
        if (onDragStateChange) onDragStateChange(true, isOverTrash(mv.clientX, mv.clientY));

        if (isHoveringOriginalSpot(mv.clientX, mv.clientY)) {
          window.removeEventListener('pointermove', onAirMove);
          window.removeEventListener('pointerup', onAirUp);
          if (onDragStateChange) onDragStateChange(false, false);
          slowMorphBackToBox(cleanupSim);
        }
      };

      const onAirUp = (up) => {
        window.removeEventListener('pointermove', onAirMove);
        window.removeEventListener('pointerup', onAirUp);
        document.body.style.cursor = '';
        document.documentElement.style.cursor = '';
        if (onDragStateChange) onDragStateChange(false, false);

        if (isOverTrash(up.clientX, up.clientY)) {
          cleanupSim();
          setFloatingMidAir(false);
          setGone(true);
          if (onTrashGulp) onTrashGulp();
          setTimeout(() => {
            if (onDelete) onDelete(task._id);
          }, 220);
          return;
        }

        if (isHoveringOriginalSpot(up.clientX, up.clientY)) {
          slowMorphBackToBox(cleanupSim);
          return;
        }

        if (pinnedNode) pinnedNode.pinned = false;
        for (let i = 0; i < COLS; i++) {
          const whip = Math.sin((i / COLS) * Math.PI) * 0.25;
          topRail[i].oldX -= pointerVX * whip;
          topRail[i].oldY -= pointerVY * whip;
          botRail[i].oldX -= pointerVX * whip;
          botRail[i].oldY -= pointerVY * whip;
        }
        mode = 'floating';
      };

      window.addEventListener('pointermove', onAirMove);
      const onAirCancel = () => {
          window.removeEventListener('pointermove', onAirMove);
          window.removeEventListener('pointerup', onAirUp);
          window.removeEventListener('pointercancel', onAirCancel);
          document.body.style.cursor = '';
          document.documentElement.style.cursor = '';
          if (onDragStateChange) onDragStateChange(false, false);
          if (pinnedNode) pinnedNode.pinned = false;
          mode = 'floating';
        };
        window.addEventListener('pointermove', onAirMove, { passive: false });
        window.addEventListener('pointerup', onAirUp);
        window.addEventListener('pointercancel', onAirCancel);
    };

    const startClothDrag = (curX, curY) => {
      activeCloth = true;
      setFloatingMidAir(true);
      document.body.style.cursor = 'grabbing';
      document.documentElement.style.cursor = 'grabbing';
      if (onDragStateChange) onDragStateChange(true, isOverTrash(curX, curY));

      canvas = document.createElement('canvas');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.position = 'fixed';
      canvas.style.inset = '0';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = (document.querySelector(".auth-centered-card") ? "2" : "60");
      document.body.appendChild(canvas);
      ctx = canvas.getContext('2d');

      offCanvas = document.createElement('canvas');
      offCanvas.width = canvas.width;
      offCanvas.height = canvas.height;
      offCtx = offCanvas.getContext('2d');

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const startX0 = centerX - ((COLS - 1) * segLen) / 2;

      topRail = [];
      botRail = [];
      for (let i = 0; i < COLS; i++) {
        const nx = startX0 + i * segLen;
        topRail.push({
          x: nx,
          y: centerY - ribHalf,
          oldX: nx,
          oldY: centerY - ribHalf,
          pinned: false,
        });
        botRail.push({
          x: nx,
          y: centerY + ribHalf,
          oldX: nx,
          oldY: centerY + ribHalf,
          pinned: false,
        });
      }
      allNodes = [...topRail, ...botRail];

      let best = allNodes[0];
      let bestDist = Infinity;
      for (const node of allNodes) {
        const d = Math.hypot(node.x - startX, node.y - startY);
        if (d < bestDist) {
          bestDist = d;
          best = node;
        }
      }
      pinnedNode = best;
      pinnedNode.pinned = true;
      grabOffsetX = pinnedNode.x - curX;
      grabOffsetY = pinnedNode.y - curY;

      pointerX = curX;
      pointerY = curY;
      prevX = curX;
      prevY = curY;
      mode = 'slide';

      window.addEventListener('pointerdown', onWindowAirGrab, { capture: true, passive: false });
      rafId = requestAnimationFrame(renderSilkTexture);
    };

    const onPointerMove = (mv) => {
      clearSelection();
      const dist = Math.hypot(mv.clientX - startX, mv.clientY - startY);
      if (!activeCloth && dist > 5) {
        startClothDrag(mv.clientX, mv.clientY);
      }
      if (activeCloth) {
        pointerX = mv.clientX;
        pointerY = mv.clientY;
        if (onDragStateChange) onDragStateChange(true, isOverTrash(mv.clientX, mv.clientY));
      }
    };

    const onPointerUp = (up) => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      document.body.style.cursor = '';
      document.documentElement.style.cursor = '';

      if (!activeCloth) {
        if (onInspect) onInspect(task);
        return;
      }

      if (onDragStateChange) onDragStateChange(false, false);

      if (isOverTrash(up.clientX, up.clientY)) {
        cleanupSim();
        setFloatingMidAir(false);
        setGone(true);
        if (onTrashGulp) onTrashGulp();
        setTimeout(() => {
          if (onDelete) onDelete(task._id);
        }, 220);
        return;
      }

      if (isHoveringOriginalSpot(up.clientX, up.clientY)) {
        slowMorphBackToBox(cleanupSim);
        return;
      }

      if (pinnedNode) pinnedNode.pinned = false;
      for (let i = 0; i < COLS; i++) {
        const whip = Math.sin((i / COLS) * Math.PI) * 0.25;
        topRail[i].oldX -= pointerVX * whip;
        topRail[i].oldY -= pointerVY * whip;
        botRail[i].oldX -= pointerVX * whip;
        botRail[i].oldY -= pointerVY * whip;
      }
      mode = 'floating';
    };

    simControllerRef.current = { destroy: cleanupSim };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  if (gone) return null;

  return (
    <div
      ref={cardRef}
      onPointerDown={handlePointerDown}
      className={
        'sticker-card small-curved-square-card ' +
        (task && task.completed ? 'done ' : '') +
        (floatingMidAir ? 'silk-floating-placeholder ' : '') +
        (returningToHome ? 'silk-returning-home ' : '')
      }
      style={{
        backgroundColor: theme.bg,
        color: theme.text,
        '--sticker-tilt': tiltDeg + 'deg',
        transform: 'rotate(' + tiltDeg + 'deg)',
      }}
    >
      <div className="sticker-top-row">
        <div className="sticker-title">{safeTitle}</div>
        <button
          type="button"
          className="sticker-check-btn card-done-circle"
          style={{
            borderColor: theme.text,
            backgroundColor: task && task.completed ? theme.text : 'transparent',
            color: theme.bg,
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleCheckClick}
          aria-label={task && task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {task && task.completed && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={theme.bg} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
      </div>

      {task && task.dueDate && (
        <div className="sticker-subdate" style={{ color: theme.text }}>
          {task.dueDate}
        </div>
      )}

      <div className="sticker-bottom-row">
        <OutlinedWhiteLogo type={doodle} />
      </div>
    </div>
  );
}
