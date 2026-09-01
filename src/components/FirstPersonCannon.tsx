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

        {/* Base Turret Mount (Realistic Gun Chassis) */}
        <path
          d="M 60 220 L 90 120 L 250 120 L 280 220 Z"
          fill="url(#metalDark)"
          stroke="#1e293b"
          strokeWidth="2"
        />

        {/* Left Armor Plating */}
        <path
          d="M 80 180 L 105 110 L 140 125 L 95 200 Z"
          fill="url(#metalPlate)"
          stroke="#334155"
          strokeWidth="1.5"
        />
        
        {/* Right Armor Plating */}
        <path
          d="M 260 180 L 235 110 L 200 125 L 245 200 Z"
          fill="url(#metalPlate)"
          stroke="#334155"
          strokeWidth="1.5"
        />

        {/* Central Receiver / Upper Receiver */}
        <rect
          x="125"
          y="70"
          width="90"
          height="110"
          rx="6"
          fill="url(#metalDark)"
          stroke="#334155"
          strokeWidth="2"
        />

        {/* Picatinny Rail (Top) */}
        <path
          d="M 130 65 L 210 65 L 210 70 L 130 70 Z"
          fill="#0f172a"
        />
        {Array.from({length: 8}).map((_, i) => (
          <rect key={i} x={135 + i * 10} y="62" width="4" height="4" fill="#334155" />
        ))}

        {/* Heat Exhaust Vents */}
        <rect
          x="132"
          y="90"
          width="16"
          height="60"
          rx="2"
          fill={heatGlowColor}
          stroke="#ef4444"
          strokeWidth={isOverheated ? 1.5 : 0}
          className="transition-colors duration-150"
        />
        <rect
          x="192"
          y="90"
          width="16"
          height="60"
          rx="2"
          fill={heatGlowColor}
          stroke="#ef4444"
          strokeWidth={isOverheated ? 1.5 : 0}
          className="transition-colors duration-150"
        />

        {/* Vent details */}
        {Array.from({length: 5}).map((_, i) => (
          <line key={`L${i}`} x1="132" y1={100 + i * 12} x2="148" y2={100 + i * 12} stroke="#000" strokeWidth="2.5" />
        ))}
        {Array.from({length: 5}).map((_, i) => (
          <line key={`R${i}`} x1="192" y1={100 + i * 12} x2="208" y2={100 + i * 12} stroke="#000" strokeWidth="2.5" />
        ))}

        {/* Weapon Specific Barrels */}
        {weapon === 'PULSE_CANNON' && (
          // Tactical Plasma Rifle Barrels
          <g>
            {/* Left Barrel */}
            <rect x="142" y="10" width="12" height="60" fill="url(#metalPlate)" stroke="#1e293b" strokeWidth="1" />
            <rect x="138" y="25" width="20" height="15" rx="2" fill="#0f172a" />
            <circle cx="148" cy="15" r="4" fill="#38bdf8" className="animate-pulse" />

            {/* Right Barrel */}
            <rect x="186" y="10" width="12" height="60" fill="url(#metalPlate)" stroke="#1e293b" strokeWidth="1" />
            <rect x="182" y="25" width="20" height="15" rx="2" fill="#0f172a" />
            <circle cx="192" cy="15" r="4" fill="#38bdf8" className="animate-pulse" />
          </g>
        )}

        {weapon === 'SCATTER_BLAST' && (
          // Heavy Shotgun / Flak
          <g>
            <rect x="150" y="5" width="40" height="70" rx="4" fill="url(#metalPlate)" stroke="#334155" strokeWidth="2" />
            {/* Choke details */}
            <rect x="146" y="15" width="48" height="12" rx="1" fill="#0f172a" />
            {/* Tri-bore muzzle */}
            <circle cx="160" cy="10" r="5" fill="#f97316" className="animate-pulse" />
            <circle cx="180" cy="10" r="5" fill="#f97316" className="animate-pulse" />
            <circle cx="170" cy="20" r="6" fill="#fb923c" />
          </g>
        )}

        {weapon === 'ION_RAILGUN' && (
          // Sniper / Railgun Accel
          <g>
            <rect x="160" y="0" width="20" height="70" rx="2" fill="url(#metalDark)" stroke="#475569" strokeWidth="2" />
            {/* Coil rings */}
            <rect x="156" y="15" width="28" height="6" rx="1" fill="#c084fc" />
            <rect x="156" y="35" width="28" height="6" rx="1" fill="#a855f7" />
            <rect x="156" y="55" width="28" height="6" rx="1" fill="#9333ea" />
            {/* Muzzle tip */}
            <polygon points="170,0 162,10 178,10" fill="#d8b4fe" />
          </g>
        )}

        {/* Optical Sight / Holographic Scope Center */}
        <rect x="155" y="105" width="30" height="40" rx="4" fill="#020617" stroke="#334155" strokeWidth="2" />
        <circle cx="170" cy="125" r="10" fill="#020617" stroke={weaponInfo.color} strokeWidth="1.5" />
        <circle cx="170" cy="125" r="4" fill={weaponInfo.color} className="animate-pulse" />

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
