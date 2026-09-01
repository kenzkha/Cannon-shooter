/**
 * AR Tactical HUD Component
 * Displays Health, Score, Combo Streaks, 360 Radar, Weapon Swapper, and EMP Ultimate.
 */

import React from 'react';
import {
  PlayerStats,
  WeaponType,
  Monster,
  Language,
  AimMode,
} from '../types';
import { WEAPONS_DATA, COMBO_SETTINGS } from '../data/gameData';
import {
  Shield,
  Zap,
  RotateCcw,
  Camera,
  Pause,
  Sliders,
  Flame,
  Crosshair,
  Compass,
  Flashlight,
} from 'lucide-react';

interface ARHUDProps {
  stats: PlayerStats;
  currentWave: number;
  totalWaves: number;
  waveTitle: string;
  currentWeapon: WeaponType;
  monsters: Monster[];
  cameraYaw: number;
  aimMode: AimMode;
  lang: Language;
  hasTorch: boolean;
  torchOn: boolean;
  onFire: () => void;
  onSwitchWeapon: (w: WeaponType) => void;
  onTriggerEMP: () => void;
  onCalibrateGyro: () => void;
  onSwitchCamera: () => void;
  onToggleTorch: () => void;
  onPause: () => void;
  onOpenSettings: () => void;
}

export const ARHUD: React.FC<ARHUDProps> = ({
  stats,
  currentWave,
  totalWaves,
  waveTitle,
  currentWeapon,
  monsters,
  cameraYaw,
  aimMode,
  lang,
  hasTorch,
  torchOn,
  onFire,
  onSwitchWeapon,
  onTriggerEMP,
  onCalibrateGyro,
  onSwitchCamera,
  onToggleTorch,
  onPause,
  onOpenSettings,
}) => {
  const hpPercent = Math.max(0, (stats.hp / stats.maxHp) * 100);
  const ultPercent = Math.min(100, stats.ultimateCharge);
  const isUltReady = ultPercent >= 100;
  const comboMultiplier = COMBO_SETTINGS.getMultiplier(stats.combo);
  const comboTitle = COMBO_SETTINGS.getComboTitle(stats.combo, lang);

  const weaponsList: WeaponType[] = ['PULSE_CANNON', 'SCATTER_BLAST', 'ION_RAILGUN'];

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-3 sm:p-4 select-none">
      {/* Top Header Bar */}
      <div className="flex items-start justify-between gap-2 pointer-events-auto">
        {/* Left: Wave & Base Shield / HP */}
        <div className="flex flex-col gap-1.5 bg-slate-950/75 backdrop-blur-md border border-cyan-500/30 p-2.5 rounded-xl max-w-[210px] sm:max-w-[260px] shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-cyan-400 font-orbitron tracking-wider">
              {lang === 'id' ? 'GELOMBANG' : 'WAVE'} {currentWave}/{totalWaves}
            </span>
            <span className="text-[9px] text-slate-400 truncate max-w-[110px]">
              {waveTitle}
            </span>
          </div>

          {/* Player HP / Hull Bar */}
          <div className="flex items-center gap-1.5">
            <Shield className={`w-3.5 h-3.5 ${hpPercent < 30 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`} />
            <div className="flex-1 h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
              <div
                className={`h-full transition-all duration-200 ${
                  hpPercent < 30
                    ? 'bg-red-500 animate-pulse'
                    : hpPercent < 60
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-orbitron font-bold text-slate-200">
              {Math.round(stats.hp)}
            </span>
          </div>

          {/* Cannon Heat Bar */}
          <div className="flex items-center gap-1.5 text-[9px] font-orbitron text-slate-400">
            <span className={stats.isOverheated ? 'text-red-400 animate-pulse font-bold' : ''}>
              {stats.isOverheated ? (lang === 'id' ? 'OVERHEAT!' : 'OVERHEAT!') : 'HEAT'}
            </span>
            <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-100 ${
                  stats.isOverheated
                    ? 'bg-red-500'
                    : stats.heat > 70
                    ? 'bg-orange-500'
                    : 'bg-cyan-400'
                }`}
                style={{ width: `${Math.min(100, stats.heat)}%` }}
              />
            </div>
            <span>{Math.round(stats.heat)}%</span>
          </div>
        </div>

        {/* Center: Score & Highscore Display */}
        <div className="flex flex-col items-center bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 px-4 py-1.5 rounded-xl shadow-lg">
          <span className="text-[9px] tracking-widest text-slate-400 font-orbitron uppercase">
            {lang === 'id' ? 'SKOR AR' : 'AR SCORE'}
          </span>
          <span className="text-xl sm:text-2xl font-black text-cyan-300 font-orbitron drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
            {stats.score.toLocaleString()}
          </span>
          <span className="text-[9px] text-slate-400 font-mono">
            HI: {stats.highScore.toLocaleString()}
          </span>
        </div>

        {/* Right: Tactical Radar & Action Buttons */}
        <div className="flex items-start gap-2">
          {/* 360 Radar Minimap */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-slate-950/85 backdrop-blur-md rounded-full border border-cyan-500/50 shadow-lg flex items-center justify-center overflow-hidden">
            {/* Radar Grid Circles */}
            <div className="absolute inset-2 border border-cyan-500/20 rounded-full" />
            <div className="absolute inset-5 border border-cyan-500/20 rounded-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-px bg-cyan-500/20" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-full w-px bg-cyan-500/20" />
            </div>

            {/* Sweep radar beam */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-500/10 to-cyan-400/25 rounded-full animate-spin [animation-duration:3s]" />

            {/* Player FOV Cone */}
            <div
              className="absolute w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-cyan-400/30 -top-1"
              style={{
                transform: `rotate(${-(cameraYaw * 180) / Math.PI}deg)`,
                transformOrigin: '50% 100%',
              }}
            />

            {/* Enemy Blips */}
            {monsters.map((m) => {
              if (m.isDying) return null;
              // Angle relative to radar (North = 0)
              const relAngle = m.yaw - cameraYaw;
              const normDist = Math.min(1, m.distance / 500);
              const radarRadius = 26; // max px from center
              const bx = Math.sin(relAngle) * normDist * radarRadius;
              const by = -Math.cos(relAngle) * normDist * radarRadius;

              const isBoss = m.type === 'LEVIATHAN_BOSS';

              return (
                <div
                  key={m.id}
                  className={`absolute rounded-full transition-all duration-100 ${
                    isBoss
                      ? 'w-2.5 h-2.5 bg-yellow-400 animate-ping'
                      : m.type === 'KAMI_SPORE'
                      ? 'w-2 h-2 bg-red-500 animate-pulse'
                      : 'w-1.5 h-1.5 bg-cyan-400'
                  }`}
                  style={{
                    transform: `translate(${bx}px, ${by}px)`,
                  }}
                />
              );
            })}

            {/* Player Center Marker */}
            <div className="w-1.5 h-1.5 bg-white rounded-full z-10 shadow-[0_0_6px_#fff]" />
          </div>

          {/* Quick Action Mini Bar */}
          <div className="flex flex-col gap-1.5">
            <button
              onClick={onPause}
              className="w-8 h-8 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center transition active:scale-95"
              title="Pause Game"
            >
              <Pause className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenSettings}
              className="w-8 h-8 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center transition active:scale-95"
              title="Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>
            {hasTorch && (
              <button
                onClick={onToggleTorch}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition active:scale-95 ${
                  torchOn
                    ? 'bg-amber-500/30 border-amber-400 text-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                    : 'bg-slate-900/80 border-slate-700 text-slate-400'
                }`}
                title="Camera Flashlight"
              >
                <Flashlight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Middle Screen: Dynamic Combo Flame Bar */}
      {stats.combo > 1 && (
        <div className="self-center flex flex-col items-center animate-bounce [animation-duration:1s]">
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-red-600/90 via-orange-600/90 to-amber-500/90 backdrop-blur-md px-3.5 py-1 rounded-full border border-amber-300/80 shadow-[0_0_20px_rgba(249,115,22,0.8)]">
            <Flame className="w-4 h-4 text-yellow-200 animate-pulse" />
            <span className="font-orbitron font-black text-sm sm:text-base text-white tracking-wider">
              {stats.combo}x COMBO
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-yellow-200 font-orbitron">
              ({comboMultiplier}x {lang === 'id' ? 'POIN' : 'PTS'})
            </span>
          </div>

          {comboTitle && (
            <span className="text-[10px] font-orbitron font-bold text-amber-300 drop-shadow-[0_0_6px_#f59e0b] mt-0.5 tracking-wider uppercase">
              {comboTitle}
            </span>
          )}

          {/* Combo Decay Timer Bar */}
          <div className="w-28 h-1 bg-slate-900/80 rounded-full overflow-hidden mt-1 border border-amber-500/40">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-red-500 transition-all duration-75"
              style={{ width: `${Math.max(0, stats.comboTimer * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Bottom Control Deck */}
      <div className="flex items-end justify-between gap-3 pointer-events-auto">
        {/* Left Controls: Weapon Swap Deck & Calibrate */}
        <div className="flex flex-col gap-2">
          {/* Calibrate & Camera Toggle */}
          <div className="flex gap-2">
            <button
              onClick={onCalibrateGyro}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 flex items-center gap-1.5 text-[10px] font-orbitron transition active:scale-95 shadow-md"
              title="Calibrate Center"
            >
              <RotateCcw className="w-3 h-3 text-cyan-400" />
              <span>{lang === 'id' ? 'RESET BIDIK' : 'RECENTER'}</span>
            </button>

            <button
              onClick={onSwitchCamera}
              className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center transition active:scale-95 shadow-md"
              title="Switch Camera / AR Mode"
            >
              <Camera className="w-3.5 h-3.5 text-slate-300" />
            </button>
          </div>

          {/* Weapon Swapper Cards */}
          <div className="flex gap-1.5 bg-slate-950/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl">
            {weaponsList.map((w, idx) => {
              const wInfo = WEAPONS_DATA[w];
              const isSelected = currentWeapon === w;

              return (
                <button
                  key={w}
                  onClick={() => onSwitchWeapon(w)}
                  className={`flex flex-col items-center px-2 py-1 rounded-lg transition-all text-left ${
                    isSelected
                      ? 'bg-cyan-500/20 border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)] scale-105'
                      : 'bg-slate-900/60 hover:bg-slate-800 border border-transparent opacity-75'
                  }`}
                >
                  <span className="text-[8px] font-mono text-slate-400">[{idx + 1}]</span>
                  <span
                    className="text-[9px] sm:text-[10px] font-orbitron font-bold whitespace-nowrap"
                    style={{ color: isSelected ? wInfo.color : '#94a3b8' }}
                  >
                    {lang === 'id' ? (w === 'PULSE_CANNON' ? 'PLASMA' : w === 'SCATTER_BLAST' ? 'FLAK' : 'RAILGUN') : (w === 'PULSE_CANNON' ? 'PLASMA' : w === 'SCATTER_BLAST' ? 'FLAK' : 'RAILGUN')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Controls: EMP Ultimate & Main FIRE Trigger */}
        <div className="flex items-center gap-3">
          {/* EMP Ultimate Mega Blast */}
          <button
            onClick={onTriggerEMP}
            disabled={!isUltReady}
            className={`relative flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 transition-all active:scale-90 ${
              isUltReady
                ? 'bg-gradient-to-tr from-purple-700 to-indigo-500 border-purple-300 text-white shadow-[0_0_24px_rgba(168,85,247,0.9)] animate-pulse'
                : 'bg-slate-950/80 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
            }`}
          >
            <Zap className={`w-5 h-5 sm:w-6 sm:h-6 ${isUltReady ? 'text-yellow-300' : 'text-slate-500'}`} />
            <span className="text-[8px] sm:text-[9px] font-orbitron font-bold mt-0.5">
              {isUltReady ? 'EMP BLAST' : `${Math.round(ultPercent)}%`}
            </span>
          </button>

          {/* Primary FIRE Trigger Button */}
          <button
            id="main-fire-button"
            onClick={onFire}
            disabled={stats.isOverheated}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 flex flex-col items-center justify-center transition-transform duration-75 active:scale-90 shadow-2xl ${
              stats.isOverheated
                ? 'bg-red-950/80 border-red-500/50 text-red-400 cursor-not-allowed'
                : 'bg-gradient-to-b from-cyan-500 to-blue-700 border-cyan-300 text-white shadow-[0_0_28px_rgba(6,182,212,0.75)] hover:from-cyan-400 hover:to-blue-600'
            }`}
          >
            <Crosshair className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-[0_0_6px_#fff]" />
            <span className="text-[10px] sm:text-xs font-orbitron font-black tracking-wider uppercase mt-1">
              {stats.isOverheated ? (lang === 'id' ? 'PANAS' : 'COOLING') : (lang === 'id' ? 'TEMBAK' : 'FIRE')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
