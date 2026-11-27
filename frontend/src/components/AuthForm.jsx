import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ThemeToggle from './ThemeToggle';

const API_BASE =
  import.meta.env.VITE_API_URL ||
  `http://${window.location.hostname}:5000/api`;
const AUTH_BASE = `${API_BASE}/auth`;

const INITIAL_TAGS = [
  { id: 't1', label: 'cook', bg: '#F7CE99', fg: '#2C1B08', leftPct: 0.22, topPct: 0.08, rot: -8 },
  { id: 't2', label: 'win', bg: '#9EC2FF', fg: '#111E3A', leftPct: 0.44, topPct: 0.05, rot: 11 },
  { id: 't3', label: 'snap', bg: '#B4E3FF', fg: '#0E2638', leftPct: 0.65, topPct: 0.09, rot: -12 },
  { id: 't4', label: 'ship', bg: '#C6F5AE', fg: '#15310A', leftPct: 0.86, topPct: 0.14, rot: 9 },
  { id: 't5', label: 'build', bg: '#FF9A4C', fg: '#2B1100', leftPct: 0.13, topPct: 0.28, rot: -14 },
  { id: 't6', label: 'flow', bg: '#F5F29A', fg: '#2B2904', leftPct: 0.11, topPct: 0.49, rot: 7 },
  { id: 't7', label: 'plan', bg: '#C4B7FF', fg: '#191336', leftPct: 0.09, topPct: 0.68, rot: -10 },
  { id: 't8', label: 'launch', bg: '#A6F0C6', fg: '#0A2E1B', leftPct: 0.17, topPct: 0.84, rot: 12 },
  { id: 't9', label: 'read', bg: '#9BC4FF', fg: '#0E1F3D', leftPct: 0.34, topPct: 0.88, rot: -9 },
  { id: 't10', label: 'think', bg: '#F8BBD9', fg: '#330E22', leftPct: 0.63, topPct: 0.85, rot: 10 },
  { id: 't11', label: 'rest', bg: '#FF9ED2', fg: '#360B22', leftPct: 0.85, topPct: 0.74, rot: -11 },
  { id: 't12', label: 'calm', bg: '#C8E1FF', fg: '#10243E', leftPct: 0.89, topPct: 0.50, rot: 8 },
  { id: 't13', label: 'create', bg: '#FF7A66', fg: '#330B05', leftPct: 0.81, topPct: 0.30, rot: -7 },
  { id: 't14', label: 'draft', bg: '#FFE27A', fg: '#2B2206', leftPct: 0.33, topPct: 0.20, rot: -6 },
  { id: 't15', label: 'sprint', bg: '#B79EFF', fg: '#141124', leftPct: 0.56, topPct: 0.22, rot: 7 },
  { id: 't16', label: 'sync', bg: '#BFF7B2', fg: '#0D2E12', leftPct: 0.74, topPct: 0.20, rot: -5 },
  { id: 't17', label: 'sketch', bg: '#FF98CC', fg: '#1C0D16', leftPct: 0.24, topPct: 0.64, rot: 6 },
  { id: 't18', label: 'focus', bg: '#45A7F5', fg: '#081E33', leftPct: 0.74, topPct: 0.62, rot: -8 },
  { id: 't19', label: 'review', bg: '#EF6C33', fg: '#FFFFFF', leftPct: 0.48, topPct: 0.78, rot: 5 },
];

function clearPageSelection() {
  if (typeof window !== 'undefined' && window.getSelection) {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      sel.removeAllRanges();
    }
  }
}

function StemmedFlowerIcon() {
  return (
    <svg
      className="auth-box-flower"
      viewBox="0 0 64 96"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M32 45 C31.5 62, 32.5 79, 32 94"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M32 34 C24 22, 26 7, 32 7 C38 7, 40 22, 32 34 Z"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      <path
        d="M27 36 C15 29, 8 16, 13 12 C18 8, 28 21, 27 36 Z"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      <path
        d="M37 36 C36 21, 46 8, 51 12 C56 16, 49 29, 37 36 Z"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      <path
        d="M25 41 C13 42, 4 35, 6 29 C8 23, 21 29, 25 41 Z"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      <path
        d="M39 41 C43 29, 56 23, 58 29 C60 35, 51 42, 39 41 Z"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      <path
        d="M27 45 C18 53, 12 62, 16 65 C20 68, 30 57, 27 45 Z"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      <path
        d="M37 45 C34 57, 44 68, 48 65 C52 62, 46 53, 37 45 Z"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      <ellipse
        cx="32"
        cy="40"
        rx="4.2"
        ry="3.6"
        stroke="currentColor"
        strokeWidth="2.8"
      />
    </svg>
  );
}

function SmallWindFanLogo({ spinning }) {
  return (
    <svg
      className={'small-fan-svg' + (spinning ? ' is-spinning' : '')}
      viewBox="0 0 40 44"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 29L17.5 41H22.5L20 29Z"
        fill="#2E9E6B"
        stroke="#1C6E49"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="17.5" r="13.5" stroke="#2E9E6B" strokeWidth="2.2" />
      <line x1="20" y1="4" x2="20" y2="31" stroke="#2E9E6B" strokeWidth="1.1" opacity="0.65" />
      <line x1="6.5" y1="17.5" x2="33.5" y2="17.5" stroke="#2E9E6B" strokeWidth="1.1" opacity="0.65" />
      <g className="fan-blades-group">
        <path
          d="M20 15.5C15.5 11.5 16.5 6.5 20.5 7.5C23.5 8.3 23 13 20 15.5Z"
          fill="#FF8298"
        />
        <path
          d="M22 18.5C27 16.5 30.5 20.5 28.2 23.8C26.4 26.4 22.5 23.2 22 18.5Z"
          fill="#FF8298"
        />
        <path
          d="M18.2 19.2C14.8 24.2 9.8 23.2 10.6 19.2C11.3 15.8 15.8 16.6 18.2 19.2Z"
          fill="#FF8298"
        />
      </g>
      <circle cx="20" cy="17.5" r="3.4" fill="#23493B" />
      <circle cx="20" cy="17.5" r="1.3" fill="#46C48A" />
    </svg>
  );
}

export default function AuthForm({ onAuthSuccess, theme, onToggleTheme }) {
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [tagPositions, setTagPositions] = useState(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const h = typeof window !== 'undefined' ? window.innerHeight : 720;
    const isPhone = w <= 600;
    const isTablet = w > 600 && w <= 1024;
    const pillW = isPhone ? 68 : isTablet ? 86 : 104;
    const pillH = isPhone ? 32 : isTablet ? 40 : 48;
    const padX = isPhone ? 10 : 18;
    const padTop = isPhone ? 62 : 72;
    const padBottom = isPhone ? 68 : 76;

    const map = {};
    for (const t of INITIAL_TAGS) {
      const rawLeft = t.leftPct * (w - pillW - padX * 2) + padX;
      const rawTop = t.topPct * (h - pillH - padTop - padBottom) + padTop;
      map[t.id] = {
        left: Math.round(Math.max(padX, Math.min(w - pillW - padX, rawLeft))),
        top: Math.round(Math.max(padTop, Math.min(h - pillH - padBottom, rawTop))),
        rot: t.rot,
      };
    }
    return map;
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isPhone = w <= 600;
      const isTablet = w > 600 && w <= 1024;
      const pillW = isPhone ? 68 : isTablet ? 86 : 104;
      const pillH = isPhone ? 32 : isTablet ? 40 : 48;
      const padX = isPhone ? 10 : 18;
      const padTop = isPhone ? 62 : 72;
      const padBottom = isPhone ? 68 : 76;

      setTagPositions(() => {
        const map = {};
        for (const t of INITIAL_TAGS) {
          const rawLeft = t.leftPct * (w - pillW - padX * 2) + padX;
          const rawTop = t.topPct * (h - pillH - padTop - padBottom) + padTop;
          map[t.id] = {
            left: Math.round(Math.max(padX, Math.min(w - pillW - padX, rawLeft))),
            top: Math.round(Math.max(padTop, Math.min(h - pillH - padBottom, rawTop))),
            rot: t.rot,
          };
        }
        return map;
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [bouncingTags, setBouncingTags] = useState({});
  const [hiddenIds, setHiddenIds] = useState({});
  const [windState, setWindState] = useState(null);
  const [allFlownAway, setAllFlownAway] = useState(false);
  const [fadingInBack, setFadingInBack] = useState(false);
  const [windLines, setWindLines] = useState([]);

  const pillRefs = useRef({});
  const activeSimsRef = useRef({});
  const bounceTimersRef = useRef({});
  const awayTimerRef = useRef(null);
  const fadeTimerRef = useRef(null);

  const setGrabbingCursor = (active) => {
    if (typeof document === 'undefined') return;
    document.body.style.cursor = active ? 'grabbing' : '';
    document.documentElement.style.cursor = active ? 'grabbing' : '';
  };

  useEffect(() => {
    return () => {
      setGrabbingCursor(false);
      if (awayTimerRef.current) clearTimeout(awayTimerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      Object.values(bounceTimersRef.current).forEach((t) => clearTimeout(t));
      bounceTimersRef.current = {};
      Object.values(activeSimsRef.current).forEach((sim) => {
        if (sim && typeof sim.destroy === 'function') sim.destroy();
      });
      activeSimsRef.current = {};
    };
  }, []);

  const triggerSlowScatteredWindBlow = () => {
    const angleRad = Math.random() * Math.PI * 2;
    const angleDeg = Math.round((angleRad * 180) / Math.PI);
    const dirX = Math.cos(angleRad);
    const dirY = Math.sin(angleRad);
    const perpX = -dirY;
    const perpY = dirX;
    const w = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const h = typeof window !== 'undefined' ? window.innerHeight : 720;
    const baseDist = Math.max(w, h) * 1.15 + 240;
    const gustId = Date.now() + Math.random();

    if (awayTimerRef.current) clearTimeout(awayTimerRef.current);
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);

    setFadingInBack(false);
    setAllFlownAway(false);

    const perTag = {};
    INITIAL_TAGS.forEach((t, idx) => {
      const speedScale = 0.72 + ((idx * 37) % 10) * 0.065;
      const scatterSpread = (((idx * 53) % 11) - 5) * 42;
      const durationSec = (3.4 + ((idx * 29) % 7) * 0.35).toFixed(2);
      const delaySec = ((idx * 19) % 8 * 0.14).toFixed(2);

      perTag[t.id] = {
        tx: Math.round(dirX * baseDist * speedScale + perpX * scatterSpread),
        ty: Math.round(dirY * baseDist * speedScale + perpY * scatterSpread),
        rotDelta: (((idx * 41) % 9) - 4) * 11,
        duration: durationSec + 's',
        delay: delaySec + 's',
      };
    });

    Object.entries(activeSimsRef.current).forEach(([id, sim], idx) => {
      if (sim && typeof sim.applySlowScatteredWind === 'function') {
        const nodeSpeed = 0.24 + ((idx * 17) % 5) * 0.06;
        const scatterAngle = angleRad + (((idx * 23) % 7) - 3) * 0.12;
        sim.applySlowScatteredWind(
          Math.cos(scatterAngle),
          Math.sin(scatterAngle),
          nodeSpeed
        );
      }
    });

    const streaks = Array.from({ length: 10 }, (_, idx) => ({
      id: gustId + '-' + idx,
      top: Math.round(12 + Math.random() * 76) + '%',
      left: Math.round(10 + Math.random() * 78) + '%',
      length: Math.round(65 + Math.random() * 70),
      angleDeg,
      tx: Math.round(dirX * 220),
      ty: Math.round(dirY * 220),
      delay: (idx * 0.14).toFixed(2) + 's',
    }));

    setWindLines(streaks);
    setWindState(null);

    requestAnimationFrame(() => {
      setWindState({ id: gustId, perTag });

      awayTimerRef.current = setTimeout(() => {
        Object.values(activeSimsRef.current).forEach((sim) => {
          if (sim && typeof sim.destroy === 'function') sim.destroy();
        });
        activeSimsRef.current = {};
        setWindLines([]);
        setAllFlownAway(true);

        fadeTimerRef.current = setTimeout(() => {
          setHiddenIds({});
          setBouncingTags({});
          setWindState(null);
          setAllFlownAway(false);
          setFadingInBack(true);

          fadeTimerRef.current = setTimeout(() => {
            setFadingInBack(false);
          }, 5500);
        }, 5000);
      }, 3900);
    });
  };

  const triggerBottomBallBounce = (id, customRect) => {
    const el = pillRefs.current[id];
    const rect = customRect || (el ? el.getBoundingClientRect() : null);
    const dropDist = rect
      ? Math.max(80, window.innerHeight - rect.top - rect.height - 4)
      : 360;

    if (bounceTimersRef.current[id]) {
      clearTimeout(bounceTimersRef.current[id]);
    }

    setBouncingTags((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    requestAnimationFrame(() => {
      setBouncingTags((prev) => ({
        ...prev,
        [id]: { dropDist, token: Date.now() + Math.random() },
      }));

      bounceTimersRef.current[id] = setTimeout(() => {
        setBouncingTags((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        delete bounceTimersRef.current[id];
      }, 1750);
    });
  };

  const handlePillPointerDown = (e, tag) => {
    if (e.button === 2) return;
    if (allFlownAway) return;
    const el = pillRefs.current[tag.id];
    if (!el) return;

    clearPageSelection();

    if (activeSimsRef.current[tag.id]) {
      activeSimsRef.current[tag.id].destroy();
    }

    const startX = e.clientX;
    const startY = e.clientY;
    const rect = el.getBoundingClientRect();
    let draggingCloth = false;

    const startSimpleSilkSlide = (curX, curY) => {
      draggingCloth = true;
      setGrabbingCursor(true);
      clearPageSelection();
      setBouncingTags((prev) => {
        if (!prev[tag.id]) return prev;
        const next = { ...prev };
        delete next[tag.id];
        return next;
      });
      setHiddenIds((prev) => ({ ...prev, [tag.id]: true }));

      const canvas = document.createElement('canvas');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.position = 'fixed';
      canvas.style.inset = '0';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = document.querySelector('.auth-centered-card') ? '3' : '60';
      document.body.appendChild(canvas);
      const ctx = canvas.getContext('2d');

      const offCanvas = document.createElement('canvas');
      offCanvas.width = canvas.width;
      offCanvas.height = canvas.height;
      const offCtx = offCanvas.getContext('2d');

      const COLS = 18;
      const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
      const silkScale = vw <= 600 ? 0.62 : vw <= 1024 ? 0.88 : Math.min(1.35, Math.max(1.05, vw / 1280));
      const halfH = Math.min(42 * silkScale, Math.max(14, rect.height * 0.54 * silkScale));
      const railOffset = halfH * 0.45;
      const segLen = Math.max(6, (rect.width * 0.94) / (COLS - 1));
      const ribLen = railOffset * 2;
      const diagLen = Math.hypot(segLen, ribLen);
      const bendLen = segLen * 2;
      const startLeft = rect.left + rect.width * 0.03;
      const centerY = rect.top + rect.height / 2;

      const topRail = [];
      const botRail = [];
      for (let i = 0; i < COLS; i++) {
        const nx = startLeft + i * segLen;
        topRail.push({
          x: nx,
          y: centerY - railOffset,
          oldX: nx,
          oldY: centerY - railOffset,
          pinned: false,
        });
        botRail.push({
          x: nx,
          y: centerY + railOffset,
          oldX: nx,
          oldY: centerY + railOffset,
          pinned: false,
        });
      }

      const allNodes = [...topRail, ...botRail];

      const findClosestNode = (px, py) => {
        let bestNode = topRail[0];
        let bestD = Infinity;
        for (const node of allNodes) {
          const d = Math.hypot(node.x - px, node.y - py);
          if (d < bestD) {
            bestD = d;
            bestNode = node;
          }
        }
        return { node: bestNode, dist: bestD };
      };

      let pinnedNode = findClosestNode(startX, startY).node;
      pinnedNode.pinned = true;
      let grabOffsetX = pinnedNode.x - startX;
      let grabOffsetY = pinnedNode.y - startY;

      let pointerX = curX;
      let pointerY = curY;
      let prevPointerX = curX;
      let prevPointerY = curY;
      let pointerVX = 0;
      let pointerVY = 0;
      let mode = 'slide';
      let gustDirX = 0;
      let gustDirY = 0;
      let gustBaseSpeed = 0;
      let motionEnergy = 1.0;
      let time = Math.random() * 10;
      let destroyed = false;
      let rafId = null;

      const chars = Array.from(tag.label.toLowerCase());

      const applySlowScatteredWind = (dirX, dirY, speed) => {
        if (mode === 'slide') {
          pinnedNode.pinned = false;
        }
        mode = 'gust';
        gustDirX = dirX;
        gustDirY = dirY;
        gustBaseSpeed = speed;
        motionEnergy = 1.6;
      };

      const updateHoverCursorOnFloat = (ev) => {
        if (mode !== 'floating') return;
        const hit = findClosestNode(ev.clientX, ev.clientY);
        if (hit.dist <= halfH + 26) {
          document.body.style.cursor = 'grab';
        } else if (document.body.style.cursor === 'grab') {
          document.body.style.cursor = '';
        }
      };

      const handleReGrab = (ev) => {
        if (mode !== 'floating' || ev.button === 2) return;
        const hit = findClosestNode(ev.clientX, ev.clientY);
        if (hit.dist > halfH + 26) return;

        clearPageSelection();
        const grabStartX = ev.clientX;
        const grabStartY = ev.clientY;
        let movedDuringReGrab = false;

        setGrabbingCursor(true);
        pinnedNode.pinned = false;
        pinnedNode = hit.node;
        pinnedNode.pinned = true;
        grabOffsetX = pinnedNode.x - ev.clientX;
        grabOffsetY = pinnedNode.y - ev.clientY;
        pointerX = ev.clientX;
        pointerY = ev.clientY;
        prevPointerX = ev.clientX;
        prevPointerY = ev.clientY;
        motionEnergy = 1.2;
        mode = 'slide';

        const onReMove = (mv) => {
          clearPageSelection();
          if (Math.hypot(mv.clientX - grabStartX, mv.clientY - grabStartY) > 5) {
            movedDuringReGrab = true;
          }
          pointerX = mv.clientX;
          pointerY = mv.clientY;
        };

        const onReUp = () => {
          window.removeEventListener('pointermove', onReMove);
          window.removeEventListener('pointerup', onReUp);
          setGrabbingCursor(false);
          pinnedNode.pinned = false;
          if (!movedDuringReGrab) {
            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            for (const p of allNodes) {
              if (p.x < minX) minX = p.x;
              if (p.x > maxX) maxX = p.x;
              if (p.y < minY) minY = p.y;
              if (p.y > maxY) maxY = p.y;
            }
            triggerBottomBallBounce(tag.id, {
              left: minX - halfH,
              right: maxX + halfH,
              top: minY - halfH,
              bottom: maxY + halfH,
            });
          }
          mode = 'floating';
        };

        window.addEventListener('pointermove', onReMove);
        window.addEventListener('pointerup', onReUp);
      };

      window.addEventListener('pointermove', updateHoverCursorOnFloat);
      window.addEventListener('pointerdown', handleReGrab, true);

      const cleanup = () => {
        if (destroyed) return;
        destroyed = true;
        setGrabbingCursor(false);
        if (rafId) cancelAnimationFrame(rafId);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointermove', updateHoverCursorOnFloat);
        window.removeEventListener('pointerdown', handleReGrab, true);
        canvas.remove();
        delete activeSimsRef.current[tag.id];
      };

      activeSimsRef.current[tag.id] = { destroy: cleanup, applySlowScatteredWind };

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
        for (let iter = 0; iter < 12; iter++) {
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

      const step = () => {
        if (destroyed) return;
        time += 0.045;

        pointerVX = pointerX - prevPointerX;
        pointerVY = pointerY - prevPointerY;
        prevPointerX = pointerX;
        prevPointerY = pointerY;

        const speed = Math.hypot(pointerVX, pointerVY);
        if (mode === 'slide' && speed > 0.4) {
          motionEnergy = Math.min(2.2, motionEnergy + speed * 0.05);
        } else {
          motionEnergy *= 0.945;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        offCtx.clearRect(0, 0, offCanvas.width, offCanvas.height);

        if (mode === 'slide') {
          pinnedNode.oldX = pinnedNode.x;
          pinnedNode.oldY = pinnedNode.y;
          pinnedNode.x = pointerX + grabOffsetX;
          pinnedNode.y = pointerY + grabOffsetY;

          for (let i = 0; i < COLS; i++) {
            const phase = i * 0.48;
            const silkFold = Math.sin(time * 3.4 - phase) * 0.34 * motionEnergy;
            const perpX = -pointerVY * 0.028;
            const perpY = pointerVX * 0.028;

            for (const railNode of [topRail[i], botRail[i]]) {
              if (railNode.pinned) continue;
              const vx = (railNode.x - railNode.oldX) * 0.92;
              const vy = (railNode.y - railNode.oldY) * 0.92;
              railNode.oldX = railNode.x;
              railNode.oldY = railNode.y;

              railNode.x += vx + perpX * silkFold + Math.sin(time * 2.6 + phase) * 0.16 * motionEnergy;
              railNode.y += vy + 0.42 + perpY * silkFold + Math.cos(time * 3.0 + phase) * 0.18 * motionEnergy;
            }
          }
          solveSilkMesh();
        } else if (mode === 'gust') {
          for (let i = 0; i < COLS; i++) {
            const nodeFactor = 0.75 + ((i * 13) % 7) * 0.09;
            const scatterWave = Math.sin(time * 3.2 + i * 0.65) * 0.25;

            for (const p of [topRail[i], botRail[i]]) {
              const vx = (p.x - p.oldX) * 0.975;
              const vy = (p.y - p.oldY) * 0.975;
              p.oldX = p.x;
              p.oldY = p.y;

              p.x += vx + gustDirX * gustBaseSpeed * nodeFactor - gustDirY * scatterWave;
              p.y += vy + gustDirY * gustBaseSpeed * nodeFactor + gustDirX * scatterWave;
            }
          }
          solveSilkMesh();
        } else if (mode === 'floating') {
          const pad = 44;
          for (let i = 0; i < COLS; i++) {
            const phase = i * 0.36;
            const breezeX = Math.sin(time * 0.9 + phase) * 0.11;
            const breezeY = Math.cos(time * 1.15 + phase) * 0.13;

            for (const p of [topRail[i], botRail[i]]) {
              const vx = (p.x - p.oldX) * 0.968;
              const vy = (p.y - p.oldY) * 0.968;
              p.oldX = p.x;
              p.oldY = p.y;

              let edgePushX = 0;
              let edgePushY = 0;
              if (p.x < pad) edgePushX = 0.22;
              else if (p.x > window.innerWidth - pad) edgePushX = -0.22;
              if (p.y < pad + 24) edgePushY = 0.22;
              else if (p.y > window.innerHeight - pad - 24) edgePushY = -0.22;

              p.x += vx + breezeX + edgePushX;
              p.y += vy + breezeY + edgePushY;
            }
          }
          solveSilkMesh();
        }

        const spine = [];
        for (let i = 0; i < COLS; i++) {
          spine.push({
            x: (topRail[i].x + botRail[i].x) * 0.5,
            y: (topRail[i].y + botRail[i].y) * 0.5,
          });
        }

        const buildSpine = (c) => {
          c.beginPath();
          c.moveTo(spine[0].x, spine[0].y);
          for (let i = 1; i < COLS - 1; i++) {
            const mx = (spine[i].x + spine[i + 1].x) / 2;
            const my = (spine[i].y + spine[i + 1].y) / 2;
            c.quadraticCurveTo(spine[i].x, spine[i].y, mx, my);
          }
          c.lineTo(spine[COLS - 1].x, spine[COLS - 1].y);
        };

        offCtx.save();
        offCtx.lineCap = 'round';
        offCtx.lineJoin = 'round';
        buildSpine(offCtx);
        offCtx.strokeStyle = tag.bg;
        offCtx.lineWidth = ribLen * 1.15;
        offCtx.stroke();

        const count = chars.length;
        if (count > 0) {
          offCtx.fillStyle = tag.fg || tag.color || '#111111';
          const vwFont = typeof window !== 'undefined' ? window.innerWidth : 1280;
          const fontScale = vwFont <= 600 ? 0.65 : vwFont <= 1024 ? 0.92 : Math.min(1.35, Math.max(1.12, vwFont / 1200));
          const silkFontPx = Math.round(22 * fontScale);
          offCtx.font = '900 ' + silkFontPx + 'px -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif';
          offCtx.textAlign = 'center';
          offCtx.textBaseline = 'middle';

          const liftFactor = mode === 'slide' || mode === 'gust' ? 1 : Math.min(1, motionEnergy * 0.5);

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

            const floatX = Math.sin(time * 6.5 + cIdx * 1.9) * 3.6 * liftFactor;
            const floatY = Math.cos(time * 7.2 + cIdx * 1.5) * 3.8 * liftFactor;
            const rotWobble = Math.sin(time * 6.0 + cIdx * 1.7) * 0.14 * liftFactor;

            offCtx.save();
            offCtx.translate(baseX + floatX, baseY + floatY);
            offCtx.rotate(segAngle * 0.45 + rotWobble);
            offCtx.fillText(chars[cIdx], 0, 0);
            offCtx.restore();
          }
        }
        offCtx.restore();

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 24;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 14;
        ctx.drawImage(offCanvas, 0, 0);
        ctx.restore();

        rafId = requestAnimationFrame(step);
      };

      const onMove = (mv) => {
        clearPageSelection();
        pointerX = mv.clientX;
        pointerY = mv.clientY;
      };

      const onUp = () => {
        setGrabbingCursor(false);
        if (mode === 'slide') {
          pinnedNode.pinned = false;
          mode = 'floating';
        }
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      rafId = requestAnimationFrame(step);
    };

    const onInitialMove = (mv) => {
      if (!draggingCloth && Math.hypot(mv.clientX - startX, mv.clientY - startY) > 5) {
        window.removeEventListener('pointermove', onInitialMove);
        window.removeEventListener('pointerup', onInitialUp);
        startSimpleSilkSlide(mv.clientX, mv.clientY);
      }
    };

    const onInitialUp = () => {
      window.removeEventListener('pointermove', onInitialMove);
      window.removeEventListener('pointerup', onInitialUp);
      setGrabbingCursor(false);
      triggerBottomBallBounce(tag.id);
    };

    window.addEventListener('pointermove', onInitialMove);
    window.addEventListener('pointerup', onInitialUp);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setStatusMsg('');
    setLoading(true);
    try {
      const res = await axios.post(AUTH_BASE + '/reset-password', {
        email: email.trim(),
        newPassword: password,
      });
      setStatusMsg(res.data?.message || 'Password updated. Sign in with your new password.');
      setPassword('');
      setIsForgotPassword(false);
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      if (serverMsg) {
        setError(serverMsg);
      } else if (err.request) {
        setError('Cannot reach backend at ' + AUTH_BASE + ' (check backend server & port)');
      } else {
        setError(err.message || 'Password reset failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const cleanEmail = email.trim();
    try {
      const endpoint = isRegister ? AUTH_BASE + '/register' : AUTH_BASE + '/login';
      const payload = isRegister
        ? { name: name.trim(), email: cleanEmail, password }
        : { email: cleanEmail, password };

      const res = await axios.post(endpoint, payload);
      const userObj = res.data.user || res.data;
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(userObj));
      onAuthSuccess(userObj);
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      if (serverMsg) {
        setError(serverMsg);
      } else if (err.request) {
        setError('Cannot reach backend at ' + AUTH_BASE + ' (check backend server & port)');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell auth-view-shell">
      <div className="bouncy-tags-layer">
        {INITIAL_TAGS.map((tag, idx) => {
          const pos = tagPositions[tag.id] || { left: 100, top: 100, rot: tag.rot };
          const bounceEntry = bouncingTags[tag.id];
          const isBouncing = Boolean(bounceEntry);
          const isHidden = Boolean(hiddenIds[tag.id]) || allFlownAway;
          const gustCfg = windState?.perTag?.[tag.id];
          const isWindBlown = Boolean(gustCfg) && !allFlownAway;

          return (
            <button
              key={tag.id}
              ref={(node) => {
                pillRefs.current[tag.id] = node;
              }}
              type="button"
              className={
                'bouncy-bg-pill' +
                (isBouncing ? ' is-bottom-bouncing' : '') +
                (isWindBlown && !hiddenIds[tag.id] ? ' is-wind-gust' : '') +
                (fadingInBack ? ' is-wind-fade-in' : '') +
                (isHidden ? ' is-silk-hidden' : '')
              }
              style={{
                backgroundColor: tag.bg,
                color: tag.fg || tag.color || '#111111',
                WebkitTextFillColor: tag.fg || tag.color || '#111111',
                top: pos.top + 'px',
                left: pos.left + 'px',
                '--pill-rot': pos.rot + 'deg',
                '--drop-dist': (isBouncing ? bounceEntry.dropDist : 360) + 'px',
                '--wind-tx': (gustCfg ? gustCfg.tx : 0) + 'px',
                '--wind-ty': (gustCfg ? gustCfg.ty : 0) + 'px',
                '--wind-rot': (gustCfg ? gustCfg.rotDelta : 0) + 'deg',
                animationDuration: isWindBlown ? gustCfg.duration : undefined,
                animationDelay: isBouncing
                  ? '0s'
                  : isWindBlown
                    ? gustCfg.delay
                    : fadingInBack
                      ? (idx * 0.28).toFixed(2) + 's'
                      : (idx * 0.45) + 's',
              }}
              onPointerDown={(e) => handlePillPointerDown(e, tag)}
            >
              {tag.label.toLowerCase()}
            </button>
          );
        })}
      </div>

      {windLines.length > 0 && (
        <div className="wind-streaks-layer" aria-hidden="true">
          {windLines.map((line) => (
            <div
              key={line.id}
              className="wind-streak-line"
              style={{
                top: line.top,
                left: line.left,
                width: line.length + 'px',
                '--streak-angle': line.angleDeg + 'deg',
                '--streak-tx': line.tx + 'px',
                '--streak-ty': line.ty + 'px',
                animationDelay: line.delay,
              }}
            />
          ))}
        </div>
      )}

      <div className="bottom-left-motto">DO NOT PANIC. ORGANIZE.</div>
      <header className="corner-header">
        <div className="hello-dawn">TaskIt</div>
        <div className="corner-right">
          <button
            type="button"
            className="wind-fan-btn"
            onClick={triggerSlowScatteredWindBlow}
            title="Blow tags slowly with scattered wind"
            aria-label="Blow tags slowly with scattered wind"
          >
            <SmallWindFanLogo spinning={Boolean(windState) && !allFlownAway} />
          </button>

          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </header>

      <div className="modal-card auth-centered-card">
        <div className="auth-header-row">
          <h2 className="auth-heading">{isForgotPassword ? 'Reset password' : isRegister ? 'Create account' : 'Welcome'}</h2>
          <StemmedFlowerIcon />
        </div>

        {error && <div className="auth-error-msg">{error}</div>}
        {statusMsg && <div className="auth-status-msg">{statusMsg}</div>}

        <form onSubmit={isForgotPassword ? handleResetPassword : handleSubmit} className="auth-stack-form">
          {!isForgotPassword && isRegister && (
            <input
              type="text"
              className="auth-field-input"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          )}

          <input
            type="email"
            className="auth-field-input"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <input
            type="password"
            className="auth-field-input"
            placeholder={isForgotPassword ? 'New Password' : 'Password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            required
          />

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Please wait...' : isForgotPassword ? 'Update Password' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {!isRegister && (
          <p className="auth-toggle-row">
            <button
              type="button"
              className="auth-inline-link"
              onClick={() => {
                setIsForgotPassword(!isForgotPassword);
                setError('');
                setStatusMsg('');
              }}
            >
              {isForgotPassword ? 'Back to Sign in' : 'Forgot password?'}
            </button>
          </p>
        )}

        <p className="auth-toggle-row">
          {isRegister ? 'Already have an account?' : 'New here?'}{' '}
          <button
            type="button"
            className="auth-inline-link"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
          >
            {isRegister ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </div>
    </div>
  );
}