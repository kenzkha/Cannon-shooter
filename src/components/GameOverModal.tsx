/**
 * Game Over & Defeat Modal
 */

import React from 'react';
import { PlayerStats, Language } from '../types';
import { RotateCcw, Home, Award, Target, Flame, Crosshair } from 'lucide-react';

interface GameOverModalProps {
  stats: PlayerStats;
  currentWave: number;
  lang: Language;
  onRetry: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  currentWave,
  lang,
  onRetry,
  onMainMenu,
}) => {
  const isIndo = lang === 'id';
  const accuracy = stats.shotsFired > 0 ? Math.round((stats.shotsHit / stats.shotsFired) * 100) : 0;
  const isNewHighScore = stats.score >= stats.highScore && stats.score > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-950 border border-red-500/50 rounded-2xl p-6 shadow-[0_0_40px_rgba(239,68,68,0.3)] text-center text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Red Threat Beacon Header */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 border border-red-500 text-red-400 text-xs font-orbitron font-bold tracking-widest uppercase mb-3">
          {isIndo ? 'PERTAHANAN HANCUR' : 'HULL BREACHED'}
        </div>

        <h1 className="text-2xl sm:text-3xl font-black font-orbitron text-red-500 tracking-wider drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]">
          {isIndo ? 'MISI GAGAL' : 'MISSION FAILED'}
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          {isIndo ? `Kalah di Gelombang ${currentWave}` : `Defeated in Wave ${currentWave}`}
        </p>

        {/* Score & Highscore Card */}
        <div className="my-5 p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center">
          <span className="text-[10px] uppercase font-orbitron text-slate-400 tracking-wider">
            {isIndo ? 'SKOR AKHIR' : 'FINAL SCORE'}
          </span>
          <span className="text-3xl font-black font-orbitron text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] mt-0.5">
            {stats.score.toLocaleString()}
          </span>

          {isNewHighScore && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-orbitron font-bold animate-pulse">
              <Award className="w-3.5 h-3.5" />
              <span>{isIndo ? 'REKOR SKOR BARU!' : 'NEW HIGH SCORE!'}</span>
            </div>
          )}
        </div>

        {/* Tactical Battle Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-left mb-6">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-orange-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-orbitron">{isIndo ? 'Maks Kombo' : 'Max Combo'}</div>
              <div className="text-sm font-bold font-orbitron text-white">{stats.maxCombo}x</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2.5">
            <Crosshair className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-orbitron">{isIndo ? 'Akurasi' : 'Accuracy'}</div>
              <div className="text-sm font-bold font-orbitron text-white">{accuracy}%</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2.5">
            <Target className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-orbitron">{isIndo ? 'Monster Musnah' : 'Kills'}</div>
              <div className="text-sm font-bold font-orbitron text-white">{stats.monstersKilled}</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2.5">
            <Award className="w-5 h-5 text-yellow-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-orbitron">{isIndo ? 'Titik Lemah' : 'Crits'}</div>
              <div className="text-sm font-bold font-orbitron text-white">{stats.weakpointHits}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5">
          <button
            onClick={onMainMenu}
            className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-orbitron font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-98"
          >
            <Home className="w-4 h-4" />
            <span>{isIndo ? 'MENU' : 'MENU'}</span>
          </button>

          <button
            onClick={onRetry}
            className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-orbitron font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(239,68,68,0.5)] transition active:scale-98"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isIndo ? 'COBA LAGI' : 'RETRY MISSION'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
