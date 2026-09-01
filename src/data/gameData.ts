/**
 * Game Balance Data & Configurations
 */

import { MonsterConfig, MonsterType, WeaponInfo, WeaponType, WaveConfig } from '../types';

export const MONSTER_CONFIGS: Record<MonsterType, MonsterConfig> = {
  DRONE: {
    name: 'Void Scout Drone',
    nameId: 'Drone Pengintai',
    type: 'DRONE',
    maxHp: 35,
    speed: 0.9,
    scoreValue: 100,
    radius: 32,
    color: '#06b6d4', // Cyan
    glowColor: 'rgba(6, 182, 212, 0.6)',
    hasWeakpoint: true,
    behavior: 'swirling',
  },
  WYVERN: {
    name: 'Cyber Wyvern',
    nameId: 'Wyvern Siber',
    type: 'WYVERN',
    maxHp: 90,
    speed: 0.65,
    scoreValue: 250,
    radius: 46,
    color: '#f97316', // Orange
    glowColor: 'rgba(249, 115, 22, 0.7)',
    hasWeakpoint: true,
    behavior: 'dive_bomb',
  },
  STALKER: {
    name: 'Ghost Stalker',
    nameId: 'Penyusup Siluman',
    type: 'STALKER',
    maxHp: 50,
    speed: 1.1,
    scoreValue: 350,
    radius: 36,
    color: '#a855f7', // Purple
    glowColor: 'rgba(168, 85, 247, 0.7)',
    hasWeakpoint: false,
    behavior: 'stalking_cloak',
  },
  KAMI_SPORE: {
    name: 'Volatile Spore',
    nameId: 'Spora Peledak',
    type: 'KAMI_SPORE',
    maxHp: 25,
    speed: 1.35,
    scoreValue: 180,
    radius: 28,
    color: '#ef4444', // Red
    glowColor: 'rgba(239, 68, 68, 0.8)',
    hasWeakpoint: true,
    behavior: 'erratic_zigzag',
  },
  LEVIATHAN_BOSS: {
    name: 'Dreadnought Titan',
    nameId: 'Titan Penakluk Langit',
    type: 'LEVIATHAN_BOSS',
    maxHp: 450,
    speed: 0.4,
    scoreValue: 2000,
    radius: 80,
    color: '#eab308', // Gold
    glowColor: 'rgba(234, 179, 8, 0.8)',
    hasWeakpoint: true,
    behavior: 'boss_orbiter',
  },
};

export const WEAPONS_DATA: Record<WeaponType, WeaponInfo> = {
  PULSE_CANNON: {
    type: 'PULSE_CANNON',
    name: 'Twin Plasma Cannon',
    nameId: 'Meriam Plasma Ganda',
    damage: 35,
    cooldownMs: 140,
    heatPerShot: 8,
    projectileSpeed: 650,
    projectileRadius: 8,
    color: '#38bdf8',
    tracerColor: '#0284c7',
    isUnlocked: true,
    description: 'Rapid-fire dual plasma bolts with balanced damage and precision tracking.',
    descriptionId: 'Tembakan plasma beruntun seimbang dengan akurasi tinggi.',
  },
  SCATTER_BLAST: {
    type: 'SCATTER_BLAST',
    name: 'Flak Scatter Cannon',
    nameId: 'Meriam Flak Sebar',
    damage: 28, // Per pellet (3 pellets total)
    cooldownMs: 340,
    heatPerShot: 18,
    projectileSpeed: 520,
    projectileRadius: 10,
    color: '#fb923c',
    tracerColor: '#ea580c',
    isUnlocked: true,
    description: 'Fires a tri-spread projectile cluster, ideal for clearing agile swarms.',
    descriptionId: 'Menembakkan 3 peluru menyebar sekaligus untuk membasmi kawanan monster lincah.',
  },
  ION_RAILGUN: {
    type: 'ION_RAILGUN',
    name: 'Hyper Ion Railgun',
    nameId: 'Railgun Ion Penembus',
    damage: 110,
    cooldownMs: 650,
    heatPerShot: 32,
    projectileSpeed: 1400,
    projectileRadius: 6,
    color: '#c084fc',
    tracerColor: '#9333ea',
    isUnlocked: true,
    description: 'High-velocity piercing laser beam that tears through multiple targets.',
    descriptionId: 'Sinar laser berkecepatan tinggi yang menembus banyak monster dalam satu garis lurus.',
  },
};

export const GAME_WAVES: WaveConfig[] = [
  {
    waveNumber: 1,
    title: 'WAVE 1: RECON SQUAD',
    titleId: 'GELOMBANG 1: PASUKAN PENGINTAI',
    spawnCount: 8,
    allowedTypes: ['DRONE'],
    spawnInterval: 2200,
  },
  {
    waveNumber: 2,
    title: 'WAVE 2: AERIAL ASSAULT',
    titleId: 'GELOMBANG 2: SERANGAN UDARA',
    spawnCount: 12,
    allowedTypes: ['DRONE', 'WYVERN'],
    spawnInterval: 1900,
  },
  {
    waveNumber: 3,
    title: 'WAVE 3: PHANTOM CLOAKERS',
    titleId: 'GELOMBANG 3: PENYUSUP SILUMAN',
    spawnCount: 16,
    allowedTypes: ['DRONE', 'STALKER', 'KAMI_SPORE'],
    spawnInterval: 1600,
  },
  {
    waveNumber: 4,
    title: 'WAVE 4: VOLATILE SWARM',
    titleId: 'GELOMBANG 4: KAWANAN PELEDAK',
    spawnCount: 20,
    allowedTypes: ['DRONE', 'WYVERN', 'KAMI_SPORE', 'STALKER'],
    spawnInterval: 1300,
  },
  {
    waveNumber: 5,
    title: 'FINAL WAVE: TITAN DREADNOUGHT',
    titleId: 'GELOMBANG AKHIR: TITAN PENAKLUK',
    spawnCount: 18,
    allowedTypes: ['LEVIATHAN_BOSS', 'DRONE', 'KAMI_SPORE'],
    spawnInterval: 2000,
    bossWave: true,
  },
];

export const COMBO_SETTINGS = {
  decayTimeSec: 3.8, // Time to keep combo alive
  maxMultiplier: 10,
  getMultiplier: (combo: number) => {
    if (combo < 3) return 1;
    if (combo < 6) return 2;
    if (combo < 10) return 3;
    if (combo < 15) return 4;
    if (combo < 22) return 5;
    if (combo < 30) return 7;
    return 10; // OVERDRIVE
  },
  getComboTitle: (combo: number, lang: 'id' | 'en') => {
    if (combo >= 30) return lang === 'id' ? 'TITAN OVERDRIVE!' : 'TITAN OVERDRIVE!';
    if (combo >= 20) return lang === 'id' ? 'DESTRUKTIF!' : 'DESTRUCTIVE!';
    if (combo >= 15) return lang === 'id' ? 'LUAR BIASA!' : 'UNSTOPPABLE!';
    if (combo >= 10) return lang === 'id' ? 'KOMBO SUPER!' : 'SUPER COMBO!';
    if (combo >= 5) return lang === 'id' ? 'SERANGAN CEPAT!' : 'RAMPAGE!';
    return '';
  }
};
