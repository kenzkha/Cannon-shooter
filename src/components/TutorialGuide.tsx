/**
 * Interactive AR Training & Mission Briefing Modal
 */

import React from 'react';
import { Language } from '../types';
import { X, Smartphone, Crosshair, Flame, Zap, ShieldAlert, Sparkles } from 'lucide-react';

interface TutorialGuideProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
  onStartGame?: () => void;
}

export const TutorialGuide: React.FC<TutorialGuideProps> = ({
  isOpen,
  lang,
  onClose,
  onStartGame,
}) => {
  if (!isOpen) return null;

  const isIndo = lang === 'id';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-950 border border-cyan-500/50 rounded-2xl p-5 sm:p-6 shadow-[0_0_40px_rgba(6,182,212,0.3)] text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-orbitron font-bold text-white tracking-wide">
              {isIndo ? 'PANDUAN & TAKTIK TEMPUR AR' : 'AR TACTICAL COMBAT GUIDE'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Modules */}
        <div className="mt-4 space-y-3.5 text-xs sm:text-sm">
          {/* Module 1: AR Camera & Aiming */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-cyan-500/30 flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-cyan-300 text-xs sm:text-sm">
                {isIndo ? '1. Bidik Nyata 360° dengan Kamera AR' : '1. 360° AR Real-World Aiming'}
              </h3>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                {isIndo
                  ? 'Gunakan kamera belakang HP. Putar dan gerakkan HP ke segala arah (360°) untuk melacak monster yang terbang di sekitar ruanganmu! Kamu juga bisa menggeser layar (Touch Drag) atau mouse.'
                  : 'Look through your rear camera. Turn your phone 360° around your room to track flying monsters! Touch drag or mouse aim is also supported.'}
              </p>
            </div>
          </div>

          {/* Module 2: Weakpoints & Precision */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-amber-500/30 flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-400 flex items-center justify-center shrink-0">
              <Crosshair className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-amber-300 text-xs sm:text-sm">
                {isIndo ? '2. Incar Titik Lemah (Weakpoints)' : '2. Target Glowing Weakpoints'}
              </h3>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                {isIndo
                  ? 'Monster memiliki titik target kuning berputar. Tembak tepat di titik tersebut untuk menghasilkan 3x Kerusakan Kritis (Critical Hit) & melipatgandakan poin!'
                  : 'Monsters have rotating golden target cores. Hit them directly for 3x Critical Damage and massive bonus multipliers!'}
              </p>
            </div>
          </div>

          {/* Module 3: Combo System */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-orange-500/30 flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 border border-orange-400 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-orange-300" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-orange-300 text-xs sm:text-sm">
                {isIndo ? '3. Sistem Kombo Beruntun & Overdrive' : '3. Streak Combo & Overdrive System'}
              </h3>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                {isIndo
                  ? 'Tembak monster berturut-turut sebelum indikator kombo habis. Kombo meningkat dari 2x hingga 10x OVERDRIVE untuk meraih skor puncak tertinggi!'
                  : 'Chain consecutive monster eliminations before the decay gauge drains to boost your multiplier up to 10x OVERDRIVE!'}
              </p>
            </div>
          </div>

          {/* Module 4: EMP Ultimate & Overheat */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-purple-500/30 flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-purple-300 text-xs sm:text-sm">
                {isIndo ? '4. Senjata Khusus & Ledakan EMP Super' : '4. Special Weapons & Super EMP'}
              </h3>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                {isIndo
                  ? 'Ganti antara Meriam Plasma, Flak Sebar, dan Railgun Ion Penembus. Kumpulkan 100% energi untuk melepaskan gelombang EMP pemusnah massal!'
                  : 'Switch between Twin Plasma, Flak Scatter, and Ion Railgun. Charge up to 100% to unleash a screen-clearing EMP blast!'}
              </p>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="mt-5">
          <button
            onClick={() => {
              onClose();
              if (onStartGame) onStartGame();
            }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-slate-950 font-orbitron font-black text-xs sm:text-sm tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.6)] active:scale-98 transition uppercase"
          >
            {isIndo ? 'MENGERTI, SIAP TEMPUR!' : 'UNDERSTOOD, COMMENCE BATTLE!'}
          </button>
        </div>
      </div>
    </div>
  );
};
