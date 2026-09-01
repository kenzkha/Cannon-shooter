/**
 * First Person POV Cannon Component
 * Renders the high-tech animated cannon turret with recoil, heat glow, barrel swivel, and weapon swapping.
 */

import React, { useEffect, useState } from 'react';
import { WeaponType } from '../types';
import { WEAPONS_DATA } from '../data/gameData';

interface FirstPersonCannonProps {
  weapon: WeaponType;
  recoil: number; // 0 to 1
  heat: number; // 0 to 100
  isOverheated: boolean;
  crosshairOffsetX: number; // For barrel swivel tracking
  muzzleFlash: boolean;
}

export const FirstPersonCannon: React.FC<FirstPersonCannonProps> = ({
  weapon,
  recoil,
  heat,
  isOverheated,
  crosshairOffsetX,
  muzzleFlash,
}) => {
  const [swivelAngle, setSwivelAngle] = useState(0);
  const weaponInfo = WEAPONS_DATA[weapon];

  // Calculate subtle barrel tracking toward crosshair
  useEffect(() => {
    const angle = Math.max(-15, Math.min(15, crosshairOffsetX * 0.04));
    setSwivelAngle(angle);
  }, [crosshairOffsetX]);

  // Recoil displacement (translates down and scales slightly)
  const recoilOffsetY = recoil * 24;
  const recoilScale = 1 - recoil * 0.04;

  const heatRatio = heat / 100;
  const heatGlowColor = isOverheated
    ? 'rgba(239, 68, 68, 0.9)'
    : heatRatio > 0.6
    ? `rgba(249, 115, 22, ${heatRatio})`
    : `rgba(56, 189, 248, 0.4)`;

  return (
    <div
      className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none z-20 transition-transform duration-75 origin-bottom"
      style={{
        transform: `translateX(-50%) translateY(${recoilOffsetY}px) scale(${recoilScale}) rotate(${swivelAngle}deg)`,
      }}
    >
      {/* Muzzle Flash VFX */}
      {muzzleFlash && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div
            className="w-24 h-24 rounded-full blur-md animate-ping"
            style={{ backgroundColor: weaponInfo.color }}
          />
          <div className="w-12 h-12 bg-white rounded-full blur-xs -mt-16" />
        </div>
      )}

      {/* Heavy Sci-Fi Cannon SVG Model */}
      <svg
        width="340"
        height="220"
        viewBox="0 0 340 220"
        className="drop-shadow-[0_-8px_24px_rgba(0,0,0,0.85)] max-w-[85vw] h-auto"
      >
        <defs>
          <linearGradient id="metalDark" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="metalPlate" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>

          <linearGradient id="laserBeam" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={weaponInfo.color} stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          <radialGradient id="heatGlow">
            <stop offset="0%" stopColor={heatGlowColor} />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>

        {/* Laser Sight Line projecting upwards */}
        <line
          x1="170"
          y1="20"
          x2="170"
          y2="-200"
          stroke={weaponInfo.color}
          strokeWidth="1.5"
          strokeDasharray="4 6"
          strokeOpacity="0.45"
        />

        {/* Base Turret Mount (Wide Cyber Chassis) */}
        <path
          d="M 20 220 L 70 140 L 270 140 L 320 220 Z"
          fill="url(#metalDark)"
          stroke="#475569"
          strokeWidth="2"
        />

        {/* Left Armor Wing */}
        <path
          d="M 50 160 L 95 110 L 130 130 L 75 180 Z"
          fill="url(#metalPlate)"
          stroke="#64748b"
          strokeWidth="1.5"
        />

        {/* Right Armor Wing */}
        <path
          d="M 290 160 L 245 110 L 210 130 L 265 180 Z"
          fill="url(#metalPlate)"
          stroke="#64748b"
          strokeWidth="1.5"
        />

        {/* Center Main Housing */}
        <rect
          x="120"
          y="80"
          width="100"
          height="90"
          rx="8"
          fill="url(#metalDark)"
          stroke="#64748b"
          strokeWidth="2"
        />

        {/* Heat Exhaust Grids (Left & Right) */}
        <rect
          x="128"
          y="100"
          width="20"
          height="50"
          rx="3"
          fill={heatGlowColor}
          stroke="#ef4444"
          strokeWidth={isOverheated ? 1.5 : 0}
          className="transition-colors duration-150"
        />
        <rect
          x="192"
          y="100"
          width="20"
          height="50"
          rx="3"
          fill={heatGlowColor}
          stroke="#ef4444"
          strokeWidth={isOverheated ? 1.5 : 0}
          className="transition-colors duration-150"
        />

        {/* Heat Vent Grille Lines */}
        <line x1="128" y1="112" x2="148" y2="112" stroke="#000" strokeWidth="2" />
        <line x1="128" y1="125" x2="148" y2="125" stroke="#000" strokeWidth="2" />
        <line x1="128" y1="138" x2="148" y2="138" stroke="#000" strokeWidth="2" />
        <line x1="192" y1="112" x2="212" y2="112" stroke="#000" strokeWidth="2" />
        <line x1="192" y1="125" x2="212" y2="125" stroke="#000" strokeWidth="2" />
        <line x1="192" y1="138" x2="212" y2="138" stroke="#000" strokeWidth="2" />

        {/* Weapon Specific Barrels */}
        {weapon === 'PULSE_CANNON' && (
          // Dual Plasma Barrels
          <g>
            {/* Left Barrel */}
            <rect
              x="138"
              y="20"
              width="18"
              height="75"
              rx="4"
              fill="url(#metalPlate)"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />
            <rect x="135" y="16" width="24" height="10" rx="2" fill="#0284c7" />
            <circle cx="147" cy="20" r="4" fill="#bae6fd" />

            {/* Right Barrel */}
            <rect
              x="184"
              y="20"
              width="18"
              height="75"
              rx="4"
              fill="url(#metalPlate)"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />
            <rect x="181" y="16" width="24" height="10" rx="2" fill="#0284c7" />
            <circle cx="193" cy="20" r="4" fill="#bae6fd" />
          </g>
        )}

        {weapon === 'SCATTER_BLAST' && (
          // Tri-Barrel Heavy Flak
          <g>
            {/* Center Barrel */}
            <rect
              x="157"
              y="15"
              width="26"
              height="80"
              rx="4"
              fill="url(#metalPlate)"
              stroke="#f97316"
              strokeWidth="2"
            />
            {/* Left Angled Nozzle */}
            <rect
              x="130"
              y="26"
              width="20"
              height="70"
              rx="4"
              transform="rotate(-8 140 60)"
              fill="url(#metalPlate)"
              stroke="#ea580c"
              strokeWidth="1.5"
            />
            {/* Right Angled Nozzle */}
            <rect
              x="190"
              y="26"
              width="20"
              height="70"
              rx="4"
              transform="rotate(8 200 60)"
              fill="url(#metalPlate)"
              stroke="#ea580c"
              strokeWidth="1.5"
            />
            {/* Flak Muzzle rings */}
            <circle cx="170" cy="18" r="8" fill="#fdba74" />
          </g>
        )}

        {weapon === 'ION_RAILGUN' && (
          // Piercing Linear Accelerator Rail
          <g>
            {/* Main Center Rail */}
            <rect
              x="158"
              y="5"
              width="24"
              height="95"
              rx="3"
              fill="url(#metalDark)"
              stroke="#a855f7"
              strokeWidth="2"
            />
            {/* Focusing Magnetic Ring 1 */}
            <rect x="150" y="24" width="40" height="8" rx="2" fill="#c084fc" />
            {/* Focusing Magnetic Ring 2 */}
            <rect x="152" y="50" width="36" height="8" rx="2" fill="#9333ea" />
            {/* Focusing Magnetic Ring 3 */}
            <rect x="154" y="74" width="32" height="8" rx="2" fill="#7e22ce" />
            {/* Ion Core Crystal */}
            <polygon points="170,8 165,18 175,18" fill="#ffffff" />
          </g>
        )}

        {/* Center Targeting Core LED HUD */}
        <circle cx="170" cy="120" r="14" fill="#020617" stroke="#38bdf8" strokeWidth="2" />
        <circle
          cx="170"
          cy="120"
          r="7"
          fill={weaponInfo.color}
          className="animate-pulse"
        />

        {/* Status Text on Cannon */}
        <text
          x="170"
          y="152"
          fill={isOverheated ? '#ef4444' : '#94a3b8'}
          fontSize="8"
          fontFamily="'Orbitron', monospace"
          fontWeight="bold"
          textAnchor="middle"
        >
          {isOverheated ? 'OVERHEAT!' : weaponInfo.name.toUpperCase()}
        </text>
      </svg>
    </div>
  );
};
