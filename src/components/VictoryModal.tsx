/**
 * Victory & Campaign Cleared Modal
 */

import React, { useEffect } from 'react';
import { PlayerStats, Language } from '../types';
import confetti from 'canvas-confetti';
import { Trophy, Award, Flame, Crosshair, Target, RotateCcw, Home } from 'lucide-react';

interface VictoryModalProps {
  stats: PlayerStats;
  lang: Language;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  stats,
  lang,
  onPlayAgain,
  onMainMenu,
}) => {
  const isIndo = lang === 'id';
  const accuracy = stats.shotsFired > 0 ? Math.round((stats.shotsHit / stats.shotsFired) * 100) : 0;
  const isNewHighScore = stats.score >= stats.highScore && stats.score > 0;

  useEffect(() => {
    // Launch celebratory AR Fireworks
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#38bdf8', '#fbbf24', '#a855f7', '#22c55e'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#38bdf8', '#fbbf24', '#a855f7', '#22c55e'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-950 border border-yellow-500/60 rounded-2xl p-6 shadow-[0_0_50px_rgba(234,179,8,0.35)] text-center text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Golden Trophy Icon */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-600 to-amber-300 mx-auto flex items-center justify-center shadow-[0_0_24px_rgba(234,179,8,0.8)] border-2 border-white mb-3">
          <Trophy className="w-8 h-8 text-slate-950" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-yellow-500/20 border border-yellow-400 text-yellow-300 text-xs font-orbitron font-bold tracking-widest uppercase mb-1">
          {isIndo ? 'LANGIT BERSIH!' : 'SKIES CLEARED!'}
        </div>

        <h1 className="text-2xl sm:text-3xl font-black font-orbitron text-yellow-400 tracking-wider drop-shadow-[0_0_12px_rgba(234,179,8,0.8)]">
          {isIndo ? 'KEMENANGAN MUTLAK' : 'TOTAL VICTORY'}
        </h1>
        <p className="text-xs text-slate-300 mt-1 font-mono">
          {isIndo ? 'Seluruh gelombang monster & Titan berhasil dimusnahkan!' : 'All monster waves and Titan Dreadnought destroyed!'}
        </p>

        {/* Score Card */}
        <div className="my-5 p-4 rounded-xl bg-slate-900/90 border border-yellow-500/30 flex flex-col items-center">
          <span className="text-[10px] uppercase font-orbitron text-slate-400 tracking-wider">
            {isIndo ? 'TOTAL SKOR PENAKLUK' : 'CHAMPION SCORE'}
          </span>
          <span className="text-3xl sm:text-4xl font-black font-orbitron text-yellow-300 drop-shadow-[0_0_12px_rgba(234,179,8,0.9)] mt-0.5">
            {stats.score.toLocaleString()}
          </span>

          {isNewHighScore && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-orbitron font-bold animate-pulse">
              <Award className="w-3.5 h-3.5" />
              <span>{isIndo ? 'REKOR SKOR BARU!' : 'NEW HIGH SCORE!'}</span>
            </div>
          )}
        </div>

        {/* Tactical Performance */}
        <div className="grid grid-cols-2 gap-2 text-left mb-6">
          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-orange-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-orbitron">{isIndo ? 'Maks Kombo' : 'Max Combo'}</div>
              <div className="text-sm font-bold font-orbitron text-yellow-400">{stats.maxCombo}x</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-2.5">
            <Crosshair className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-orbitron">{isIndo ? 'Akurasi' : 'Accuracy'}</div>
              <div className="text-sm font-bold font-orbitron text-white">{accuracy}%</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-2.5">
            <Target className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-orbitron">{isIndo ? 'Monster Musnah' : 'Kills'}</div>
              <div className="text-sm font-bold font-orbitron text-white">{stats.monstersKilled}</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-2.5">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-orbitron">{isIndo ? 'Titik Lemah' : 'Crits'}</div>
              <div className="text-sm font-bold font-orbitron text-yellow-300">{stats.weakpointHits}</div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2.5">
          <button
            onClick={onMainMenu}
            className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-orbitron font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-98"
          >
            <Home className="w-4 h-4" />
            <span>{isIndo ? 'MENU' : 'MENU'}</span>
          </button>

          <button
            onClick={onPlayAgain}
            className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-orbitron font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_0_24px_rgba(234,179,8,0.6)] transition active:scale-98"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isIndo ? 'MAIN LAGI' : 'PLAY AGAIN'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
