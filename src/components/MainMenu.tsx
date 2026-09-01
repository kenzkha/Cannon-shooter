/**
 * Main Menu Screen Component
 */

import React from 'react';
import { GameSettings, Language } from '../types';
import { GAME_WAVES } from '../data/gameData';
import {
  Play,
  HelpCircle,
  Sliders,
  Camera,
  Trophy,
  Award,
  Sparkles,
  Crosshair,
  Shield,
} from 'lucide-react';

interface MainMenuProps {
  highScore: number;
  maxCombo: number;
  settings: GameSettings;
  onStartGame: (wave?: number) => void;
  onOpenTutorial: () => void;
  onOpenSettings: () => void;
  onSwitchCamera: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  highScore,
  maxCombo,
  settings,
  onStartGame,
  onOpenTutorial,
  onOpenSettings,
  onSwitchCamera,
}) => {
  const isIndo = settings.language === 'id';
  const [selectedWave, setSelectedWave] = React.useState<number>(1);
  const [showWaveSelect, setShowWaveSelect] = React.useState<boolean>(false);

  return (
    <div className="relative z-30 flex flex-col items-center justify-between min-h-screen p-5 sm:p-8 select-none text-slate-100">
      {/* Top Bar: Camera Mode Indicator & Settings */}
      <div className="w-full max-w-4xl flex items-center justify-between">
        <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-cyan-500/30">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] sm:text-xs font-orbitron font-bold text-cyan-300">
            {settings.cameraFacing === 'environment'
              ? isIndo ? 'AR KAMERA BELAKANG AKTIF' : 'AR REAR CAMERA LIVE'
              : settings.cameraFacing === 'user'
              ? isIndo ? 'AR KAMERA DEPAN' : 'FRONT CAMERA LIVE'
              : isIndo ? 'LATAR SIMULASI CYBER' : 'SIMULATED CYBER GRID'}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onSwitchCamera}
            className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-700 text-slate-300 transition active:scale-95 shadow-md flex items-center gap-1.5 text-xs font-orbitron"
            title="Switch Camera / Simulation"
          >
            <Camera className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">{isIndo ? 'Ganti Kamera' : 'Switch Cam'}</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-700 text-slate-300 transition active:scale-95 shadow-md"
            title="Settings"
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Center Title & Game Identity */}
      <div className="flex flex-col items-center text-center my-auto max-w-xl">
        {/* Holographic Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/80 text-cyan-300 text-[10px] sm:text-xs font-orbitron font-bold tracking-widest uppercase mb-4 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isIndo ? 'AUGMENTED REALITY POV SHOOTER' : 'AUGMENTED REALITY POV SHOOTER'}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black font-orbitron tracking-tight text-white drop-shadow-[0_0_25px_rgba(6,182,212,0.8)] leading-none">
          SKY ASSAULT
        </h1>
        <span className="text-sm sm:text-lg font-orbitron font-bold text-cyan-400 tracking-widest mt-1">
          AR CANNON STRIKE
        </span>

        <p className="text-xs sm:text-sm text-slate-300 mt-3 max-w-md font-mono leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
          {isIndo
            ? 'Bidikan meriam presisi 360° menghabisi kawanan monster udara langsung di ruangan sekitarmu dengan sistem kombo berlipat!'
            : 'Aim your POV sci-fi cannon in 360° augmented reality to obliterate flying monster swarms in your room with massive combo multipliers!'}
        </p>

        {/* High Score Panel */}
        <div className="flex items-center gap-6 bg-slate-950/80 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-cyan-500/40 mt-5 shadow-xl">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div className="text-left">
              <div className="text-[9px] text-slate-400 font-orbitron uppercase">{isIndo ? 'SKOR TERTINGGI' : 'HIGH SCORE'}</div>
              <div className="text-base font-black font-orbitron text-amber-300">
                {highScore.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="w-px h-8 bg-slate-800" />

          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-400" />
            <div className="text-left">
              <div className="text-[9px] text-slate-400 font-orbitron uppercase">{isIndo ? 'MAKS KOMBO' : 'BEST COMBO'}</div>
              <div className="text-base font-black font-orbitron text-orange-300">
                {maxCombo}x
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Main Action Buttons */}
      <div className="w-full max-w-sm flex flex-col gap-2.5">
        {/* Wave Selection Accordion / Picker */}
        {showWaveSelect && (
          <div className="bg-slate-950/90 backdrop-blur-md p-3 rounded-2xl border border-cyan-500/40 mb-2 animate-in fade-in slide-in-from-bottom-2">
            <span className="text-[10px] font-orbitron font-bold text-cyan-400 uppercase tracking-wider block mb-2">
              {isIndo ? 'Pilih Gelombang Awal:' : 'Select Starting Wave:'}
            </span>
            <div className="grid grid-cols-5 gap-1.5">
              {GAME_WAVES.map((w) => (
                <button
                  key={w.waveNumber}
                  onClick={() => setSelectedWave(w.waveNumber)}
                  className={`py-2 text-center rounded-xl border text-xs font-orbitron font-bold transition ${
                    selectedWave === w.waveNumber
                      ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.8)]'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  W{w.waveNumber}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Primary Start Game Button */}
        <button
          onClick={() => onStartGame(selectedWave)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-orbitron font-black text-base sm:text-lg tracking-wider flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(6,182,212,0.7)] transition active:scale-98"
        >
          <Play className="w-6 h-6 fill-current" />
          <span>{isIndo ? 'MULAI TEMPUR SEKARANG' : 'COMMENCE AR ASSAULT'}</span>
        </button>

        {/* Secondary Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowWaveSelect(!showWaveSelect)}
            className="flex-1 py-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-cyan-500/30 text-cyan-300 font-orbitron font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isIndo ? `GELOMBANG ${selectedWave}` : `WAVE ${selectedWave}`}</span>
          </button>

          <button
            onClick={onOpenTutorial}
            className="flex-1 py-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-700 text-slate-300 font-orbitron font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>{isIndo ? 'PANDUAN' : 'GUIDE'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
