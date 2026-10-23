import React, { useEffect, useRef } from 'react';

/**
 * BrickBackground
 * Playful, interactive toy-brick city skyline & floating bricks background.
 *
 * Features:
 * - 3 distinct SVG depth layers (far, middle, near)
 * - 60fps buttery-smooth parallax via direct translate3d transforms (no React re-renders)
 * - Gentle idle floating / bobbing animation when stationary or on touch devices
 * - Gyroscope / device tilt fallback on mobile devices
 * - Strict prefers-reduced-motion compliance (static display with no animation loop)
 * - Visibility API optimization (pauses loop when tab is hidden)
 * - Non-blocking pointer-events: none and low-opacity tone to preserve readability
 */
export default function BrickBackground() {
  const farRef = useRef(null);
  const midRef = useRef(null);
  const nearRef = useRef(null);
  const looseBricksRef = useRef(null);

  useEffect(() => {
    // 1. Accessibility: Check for reduced motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animFrameId = null;
    let lastMoveTime = performance.now();
    let idleAngle = 0;

    const isTouchOnly =
      window.matchMedia('(hover: none)').matches ||
      'ontouchstart' in window;

    // Handle Desktop Mouse Move
    const handleMouseMove = (e) => {
      lastMoveTime = performance.now();
      // Normalise coordinates from -1.0 to +1.0
      const width = window.innerWidth || 1;
      const height = window.innerHeight || 1;
      targetX = ((e.clientX / width) * 2 - 1);
      targetY = ((e.clientY / height) * 2 - 1);
    };

    // Handle Mobile Device Tilt (if available)
    const handleDeviceOrientation = (e) => {
      if (e.gamma !== null && e.beta !== null) {
        lastMoveTime = performance.now();
        // Clamped tilt (-30deg to +30deg maps to -1 to +1)
        targetX = Math.max(-1, Math.min(1, e.gamma / 30));
        targetY = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
      }
    };

    // Parallax Render Loop using requestAnimationFrame
    const updateMotion = () => {
      const now = performance.now();
      const isIdle = isTouchOnly || now - lastMoveTime > 1800;

      if (isIdle) {
        // Subtle organic bobbing/drift when stationary or on touch
        idleAngle += 0.012;
        targetX = Math.sin(idleAngle) * 0.35;
        targetY = Math.cos(idleAngle * 0.7) * 0.25;
      }

      // Smooth lerp easing towards target
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;

      // Layer travel depths: Far (8px), Mid (18px), Near (32px)
      if (farRef.current) {
        const farX = (currentX * 8).toFixed(2);
        const farY = (currentY * 6).toFixed(2);
        farRef.current.style.transform = `translate3d(${farX}px, ${farY}px, 0)`;
      }

      if (midRef.current) {
        const midX = (currentX * 18).toFixed(2);
        const midY = (currentY * 14).toFixed(2);
        midRef.current.style.transform = `translate3d(${midX}px, ${midY}px, 0)`;
      }

      if (nearRef.current) {
        const nearX = (currentX * 32).toFixed(2);
        const nearY = (currentY * 24).toFixed(2);
        nearRef.current.style.transform = `translate3d(${nearX}px, ${nearY}px, 0)`;
      }

      if (looseBricksRef.current) {
        const rot = (currentX * 4.5).toFixed(2);
        const floatY = (Math.sin(idleAngle * 1.5) * 6).toFixed(2);
        looseBricksRef.current.style.transform = `translate3d(0, ${floatY}px, 0) rotate(${rot}deg)`;
      }

      animFrameId = requestAnimationFrame(updateMotion);
    };

    // Pause when document is hidden (battery/performance preservation)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animFrameId) cancelAnimationFrame(animFrameId);
      } else {
        lastMoveTime = performance.now();
        animFrameId = requestAnimationFrame(updateMotion);
      }
    };

    if (!isTouchOnly) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    } else {
      window.addEventListener('deviceorientation', handleDeviceOrientation, { passive: true });
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    animFrameId = requestAnimationFrame(updateMotion);

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden select-none bg-[#ECDFD2]/60"
    >
      <svg
        className="w-full h-full object-cover"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          {/* Stud gradient for cylindrical 3D look */}
          <linearGradient id="studGradNavy" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a2d6b" />
            <stop offset="100%" stopColor="#081849" />
          </linearGradient>
          <linearGradient id="studGradBlue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2e4bb0" />
            <stop offset="100%" stopColor="#213885" />
          </linearGradient>
          <linearGradient id="studGradPlum" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7a4496" />
            <stop offset="100%" stopColor="#5F3475" />
          </linearGradient>
          <linearGradient id="studGradBerry" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a83e8d" />
            <stop offset="100%" stopColor="#893172" />
          </linearGradient>
        </defs>

        {/* ====================================================
            LAYER 1: FAR DEPTH (Navy tones, low opacity 10-14%)
           ==================================================== */}
        <g ref={farRef} opacity="0.12" style={{ willChange: 'transform' }}>
          {/* Far Tower 1 */}
          <rect x="60" y="380" width="140" height="520" rx="6" fill="#081849" />
          {/* Studs */}
          <rect x="75" y="372" width="22" height="8" rx="2" fill="url(#studGradNavy)" />
          <rect x="105" y="372" width="22" height="8" rx="2" fill="url(#studGradNavy)" />
          <rect x="135" y="372" width="22" height="8" rx="2" fill="url(#studGradNavy)" />
          <rect x="165" y="372" width="22" height="8" rx="2" fill="url(#studGradNavy)" />

          {/* Far Tower 2 */}
          <rect x="280" y="290" width="180" height="610" rx="8" fill="#081849" />
          <rect x="300" y="282" width="24" height="8" rx="2" fill="url(#studGradNavy)" />
          <rect x="334" y="282" width="24" height="8" rx="2" fill="url(#studGradNavy)" />
          <rect x="368" y="282" width="24" height="8" rx="2" fill="url(#studGradNavy)" />
          <rect x="402" y="282" width="24" height="8" rx="2" fill="url(#studGradNavy)" />

          {/* Far Tower 3 */}
          <rect x="620" y="340" width="160" height="560" rx="8" fill="#081849" />
          <rect x="640" y="332" width="22" height="8" rx="2" fill="url(#studGradNavy)" />
          <rect x="672" y="332" width="22" height="8" rx="2" fill="url(#studGradNavy)" />
          <rect x="704" y="332" width="22" height="8" rx="2" fill="url(#studGradNavy)" />
          <rect x="736" y="332" width="22" height="8" rx="2" fill="url(#studGradNavy)" />

          {/* Far Tower 4 */}
          <rect x="940" y="260" width="210" height="640" rx="8" fill="#081849" />
          <rect x="965" y="252" width="26" height="8" rx="2" fill="url(#studGradNavy)" />
          <rect x="1005" y="252" width="26" height="8" rx="2" fill="url(#studGradNavy)" />
          <rect x="1045" y="252" width="26" height="8" rx="2" fill="url(#studGradNavy)" />
          <rect x="1085" y="252" width="26" height="8" rx="2" fill="url(#studGradNavy)" />

          {/* Far Tower 5 */}
          <rect x="1240" y="360" width="150" height="540" rx="6" fill="#081849" />
          <rect x="1260" y="352" width="22" height="8" rx="2" fill="url(#studGradNavy)" />
          <rect x="1292" y="352" width="22" height="8" rx="2" fill="url(#studGradNavy)" />
          <rect x="1324" y="352" width="22" height="8" rx="2" fill="url(#studGradNavy)" />
          <rect x="1356" y="352" width="22" height="8" rx="2" fill="url(#studGradNavy)" />
        </g>

        {/* ====================================================
            LAYER 2: MIDDLE DEPTH (Blue & Plum tones, 22-26%)
           ==================================================== */}
        <g ref={midRef} opacity="0.22" style={{ willChange: 'transform' }}>
          {/* Mid Building A (Brick Blue) */}
          <rect x="150" y="460" width="170" height="440" rx="8" fill="#213885" />
          <rect x="170" y="450" width="24" height="10" rx="3" fill="url(#studGradBlue)" />
          <rect x="206" y="450" width="24" height="10" rx="3" fill="url(#studGradBlue)" />
          <rect x="242" y="450" width="24" height="10" rx="3" fill="url(#studGradBlue)" />
          <rect x="278" y="450" width="24" height="10" rx="3" fill="url(#studGradBlue)" />
          {/* Windows / Block stripes */}
          <rect x="175" y="490" width="35" height="40" rx="4" fill="#ECDFD2" opacity="0.4" />
          <rect x="235" y="490" width="35" height="40" rx="4" fill="#ECDFD2" opacity="0.4" />
          <rect x="175" y="555" width="35" height="40" rx="4" fill="#ECDFD2" opacity="0.4" />
          <rect x="235" y="555" width="35" height="40" rx="4" fill="#ECDFD2" opacity="0.4" />

          {/* Mid Building B (Plum) */}
          <rect x="470" y="420" width="190" height="480" rx="8" fill="#5F3475" />
          <rect x="490" y="410" width="25" height="10" rx="3" fill="url(#studGradPlum)" />
          <rect x="528" y="410" width="25" height="10" rx="3" fill="url(#studGradPlum)" />
          <rect x="566" y="410" width="25" height="10" rx="3" fill="url(#studGradPlum)" />
          <rect x="604" y="410" width="25" height="10" rx="3" fill="url(#studGradPlum)" />
          {/* Plum building details */}
          <rect x="500" y="450" width="130" height="20" rx="4" fill="#893172" opacity="0.6" />
          <rect x="500" y="500" width="40" height="50" rx="4" fill="#ECDFD2" opacity="0.4" />
          <rect x="570" y="500" width="40" height="50" rx="4" fill="#ECDFD2" opacity="0.4" />

          {/* Mid Building C (Brick Blue) */}
          <rect x="790" y="480" width="180" height="420" rx="8" fill="#213885" />
          <rect x="810" y="470" width="25" height="10" rx="3" fill="url(#studGradBlue)" />
          <rect x="848" y="470" width="25" height="10" rx="3" fill="url(#studGradBlue)" />
          <rect x="886" y="470" width="25" height="10" rx="3" fill="url(#studGradBlue)" />
          <rect x="924" y="470" width="25" height="10" rx="3" fill="url(#studGradBlue)" />
          <rect x="825" y="520" width="45" height="45" rx="4" fill="#ECDFD2" opacity="0.4" />
          <rect x="895" y="520" width="45" height="45" rx="4" fill="#ECDFD2" opacity="0.4" />

          {/* Mid Building D (Plum) */}
          <rect x="1100" y="440" width="170" height="460" rx="8" fill="#5F3475" />
          <rect x="1120" y="430" width="24" height="10" rx="3" fill="url(#studGradPlum)" />
          <rect x="1156" y="430" width="24" height="10" rx="3" fill="url(#studGradPlum)" />
          <rect x="1192" y="430" width="24" height="10" rx="3" fill="url(#studGradPlum)" />
          <rect x="1228" y="430" width="24" height="10" rx="3" fill="url(#studGradPlum)" />
        </g>

        {/* ====================================================
            LAYER 3: NEAR ACCENTS & LOOSE FLOATING BRICKS
           ==================================================== */}
        <g ref={nearRef} style={{ willChange: 'transform' }}>
          {/* Loose floating bricks with independent subtle rotation/bob */}
          <g ref={looseBricksRef} style={{ willChange: 'transform' }}>
            {/* Top-Left: Floating Berry 2x4 Brick */}
            <g transform="translate(80, 140) rotate(-14)" opacity="0.38">
              <rect x="0" y="8" width="96" height="34" rx="6" fill="#893172" stroke="#081849" strokeWidth="2" />
              <rect x="8" y="0" width="18" height="8" rx="2" fill="url(#studGradBerry)" stroke="#081849" strokeWidth="1.5" />
              <rect x="30" y="0" width="18" height="8" rx="2" fill="url(#studGradBerry)" stroke="#081849" strokeWidth="1.5" />
              <rect x="52" y="0" width="18" height="8" rx="2" fill="url(#studGradBerry)" stroke="#081849" strokeWidth="1.5" />
              <rect x="74" y="0" width="18" height="8" rx="2" fill="url(#studGradBerry)" stroke="#081849" strokeWidth="1.5" />
            </g>

            {/* Top-Right: Floating Brick-Blue 2x2 Brick */}
            <g transform="translate(1280, 160) rotate(18)" opacity="0.36">
              <rect x="0" y="8" width="56" height="32" rx="6" fill="#213885" stroke="#081849" strokeWidth="2" />
              <rect x="8" y="0" width="18" height="8" rx="2" fill="url(#studGradBlue)" stroke="#081849" strokeWidth="1.5" />
              <rect x="30" y="0" width="18" height="8" rx="2" fill="url(#studGradBlue)" stroke="#081849" strokeWidth="1.5" />
            </g>

            {/* Mid-Left: Floating Plum 2x3 Brick */}
            <g transform="translate(40, 480) rotate(8)" opacity="0.32">
              <rect x="0" y="8" width="76" height="30" rx="5" fill="#5F3475" stroke="#081849" strokeWidth="2" />
              <rect x="8" y="0" width="16" height="8" rx="2" fill="url(#studGradPlum)" stroke="#081849" strokeWidth="1.5" />
              <rect x="30" y="0" width="16" height="8" rx="2" fill="url(#studGradPlum)" stroke="#081849" strokeWidth="1.5" />
              <rect x="52" y="0" width="16" height="8" rx="2" fill="url(#studGradPlum)" stroke="#081849" strokeWidth="1.5" />
            </g>

            {/* Mid-Right: Floating Cream/Berry 2x2 Accent Brick */}
            <g transform="translate(1360, 460) rotate(-22)" opacity="0.34">
              <rect x="0" y="8" width="54" height="30" rx="5" fill="#893172" stroke="#081849" strokeWidth="2" />
              <rect x="8" y="0" width="16" height="8" rx="2" fill="url(#studGradBerry)" stroke="#081849" strokeWidth="1.5" />
              <rect x="30" y="0" width="16" height="8" rx="2" fill="url(#studGradBerry)" stroke="#081849" strokeWidth="1.5" />
            </g>
          </g>

          {/* Near Foreground Baseplate Stud Strip at very bottom */}
          <g opacity="0.25">
            <rect x="0" y="884" width="1440" height="16" fill="#081849" />
            {Array.from({ length: 48 }).map((_, i) => (
              <circle
                key={i}
                cx={15 + i * 30}
                cy={884}
                r="6"
                fill="#213885"
                stroke="#081849"
                strokeWidth="1.5"
              />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}
