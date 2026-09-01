/**
 * Settings and Aiming Controls Configuration Modal
 */

import React from 'react';
import { GameSettings, AimMode, Language } from '../types';
import { X, Smartphone, Hand, Sliders, Volume2, Globe, Sparkles, Grid } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onClose: () => void;
  onRequestGyroPermission: () => Promise<boolean>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onClose,
  onRequestGyroPermission,
}) => {
  if (!isOpen) return null;

  const isIndo = settings.language === 'id';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-950 border border-cyan-500/40 rounded-2xl p-5 sm:p-6 shadow-[0_0_35px_rgba(6,182,212,0.25)] text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-orbitron font-bold text-white tracking-wide">
              {isIndo ? 'PENGATURAN KONTROL & AR' : 'CONTROLS & AR SETTINGS'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Aim Control Mode */}
          <div>
            <label className="text-xs font-orbitron font-semibold text-cyan-400 uppercase tracking-wider block mb-2">
              {isIndo ? 'Metode Kontrol Bidik' : 'Aim Control Method'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={async () => {
                  await onRequestGyroPermission();
                  onUpdateSettings({ aimMode: 'GYROSCOPE' });
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition ${
                  settings.aimMode === 'GYROSCOPE'
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Smartphone className="w-5 h-5 mb-1 text-cyan-400" />
                <span className="text-xs font-orbitron font-bold">
                  {isIndo ? 'Giroskop AR (Gerak HP)' : 'AR Gyroscope'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 text-center">
                  {isIndo ? 'Putar HP 360° di sekitar' : 'Rotate phone 360° in room'}
                </span>
              </button>

              <button
                onClick={() => onUpdateSettings({ aimMode: 'TOUCH_DRAG' })}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition ${
                  settings.aimMode === 'TOUCH_DRAG'
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Hand className="w-5 h-5 mb-1 text-cyan-400" />
                <span className="text-xs font-orbitron font-bold">
                  {isIndo ? 'Geser Layar / Mouse' : 'Touch Drag / Mouse'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 text-center">
                  {isIndo ? 'Sentuh & geser untuk bidik' : 'Drag screen/mouse to aim'}
                </span>
              </button>
            </div>
          </div>

          {/* Sensitivity Sliders */}
          <div className="space-y-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-300">
                  {isIndo ? 'Sensitivitas Giroskop' : 'Gyro Sensitivity'}
                </span>
                <span className="text-cyan-400 font-bold">{settings.gyroSensitivity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={settings.gyroSensitivity}
                onChange={(e) => onUpdateSettings({ gyroSensitivity: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-300">
                  {isIndo ? 'Sensitivitas Sentuh (Touch Drag)' : 'Touch Sensitivity'}
                </span>
                <span className="text-cyan-400 font-bold">{settings.touchSensitivity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={settings.touchSensitivity}
                onChange={(e) => onUpdateSettings({ touchSensitivity: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Invert Pitch Toggle */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-300">
                {isIndo ? 'Balik Sumbu Vertikal (Invert Y)' : 'Invert Vertical Pitch'}
              </span>
              <button
                onClick={() => onUpdateSettings({ invertPitch: !settings.invertPitch })}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  settings.invertPitch ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                    settings.invertPitch ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* AR & Visual Options */}
          <div className="space-y-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
            <label className="text-xs font-orbitron font-semibold text-cyan-400 uppercase tracking-wider block">
              {isIndo ? 'Latar & Grafis AR' : 'AR Backdrop & Visuals'}
            </label>

            {/* Camera Selector */}
            <div className="grid grid-cols-3 gap-1.5">
              {(['environment', 'user', 'simulated'] as const).map((cam) => (
                <button
                  key={cam}
                  onClick={() => onUpdateSettings({ cameraFacing: cam })}
                  className={`py-2 px-1 text-center rounded-lg border text-[11px] font-orbitron transition ${
                    settings.cameraFacing === cam
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {cam === 'environment'
                    ? isIndo ? 'Kamera Belakang' : 'Rear Camera'
                    : cam === 'user'
                    ? isIndo ? 'Kamera Depan' : 'Front Camera'
                    : isIndo ? 'Simulasi Cyber' : 'Cyber Grid'}
                </button>
              ))}
            </div>

            {/* AR Grid Toggle */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-300 flex items-center gap-1.5">
                <Grid className="w-3.5 h-3.5 text-cyan-400" />
                {isIndo ? 'Tampilkan Grid Horizon & Kompas' : 'Show AR Horizon & Compass'}
              </span>
              <button
                onClick={() => onUpdateSettings({ showARGrid: !settings.showARGrid })}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  settings.showARGrid ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                    settings.showARGrid ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Audio & Haptic Feedback */}
          <div className="space-y-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  {isIndo ? 'Volume Efek Suara' : 'Sound SFX Volume'}
                </span>
                <span className="text-cyan-400 font-bold">{Math.round(settings.soundVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.soundVolume}
                onChange={(e) => onUpdateSettings({ soundVolume: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-300">
                {isIndo ? 'Getaran Haptik HP' : 'Haptic Vibration'}
              </span>
              <button
                onClick={() => onUpdateSettings({ hapticEnabled: !settings.hapticEnabled })}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  settings.hapticEnabled ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                    settings.hapticEnabled ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center justify-between bg-slate-900/40 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              {isIndo ? 'Bahasa / Language' : 'Language'}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => onUpdateSettings({ language: 'id' })}
                className={`px-3 py-1 rounded-lg text-xs font-orbitron font-bold ${
                  settings.language === 'id'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                ID
              </button>
              <button
                onClick={() => onUpdateSettings({ language: 'en' })}
                className={`px-3 py-1 rounded-lg text-xs font-orbitron font-bold ${
                  settings.language === 'en'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-orbitron font-black text-sm tracking-wider shadow-[0_0_16px_rgba(6,182,212,0.5)] active:scale-98 transition"
          >
            {isIndo ? 'SIMPAN & KEMBALI KE GAME' : 'SAVE & RESUME GAME'}
          </button>
        </div>
      </div>
    </div>
  );
};
