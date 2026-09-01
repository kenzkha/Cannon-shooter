/**
 * Core types for AR Cannon Shooter: Sky Assault
 */

export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'VICTORY';

export type AimMode = 'GYROSCOPE' | 'TOUCH_DRAG' | 'JOYSTICK';

export type Language = 'id' | 'en';

export type MonsterType = 'DRONE' | 'WYVERN' | 'STALKER' | 'KAMI_SPORE' | 'LEVIATHAN_BOSS';

export interface MonsterConfig {
  name: string;
  nameId: string;
  type: MonsterType;
  maxHp: number;
  speed: number;
  scoreValue: number;
  radius: number;
  color: string;
  glowColor: string;
  hasWeakpoint: boolean;
  behavior: 'swirling' | 'dive_bomb' | 'stalking_cloak' | 'erratic_zigzag' | 'boss_orbiter';
}

export interface Monster {
  id: string;
  type: MonsterType;
  // Polar 3D coordinates relative to player center
  yaw: number; // Horizontal angle in radians (-PI to PI)
  pitch: number; // Vertical angle in radians (-PI/2 to PI/2)
  distance: number; // Distance in arbitrary 3D units (e.g. 50 to 500)
  targetDistance: number;
  
  // Velocity in angles and distance
  vYaw: number;
  vPitch: number;
  vDist: number;

  hp: number;
  maxHp: number;
  radius: number;
  scoreValue: number;
  color: string;
  glowColor: string;
  
  // State timers
  timeAlive: number;
  phase: number;
  isHit: number; // Flash timer
  isDying: boolean;
  deathTimer: number;
  cloakAlpha: number; // For stealth units (0.1 to 1.0)
  
  // Weakpoint mechanics
  hasWeakpoint: boolean;
  weakpointAngle: number; // local rotation angle
  weakpointRadius: number;
  
  // Attack mechanics
  attackCooldown: number;
  canAttack: boolean;
}

export type WeaponType = 'PULSE_CANNON' | 'SCATTER_BLAST' | 'ION_RAILGUN';

export interface WeaponInfo {
  type: WeaponType;
  name: string;
  nameId: string;
  damage: number;
  cooldownMs: number;
  heatPerShot: number;
  projectileSpeed: number;
  projectileRadius: number;
  color: string;
  tracerColor: string;
  isUnlocked: boolean;
  description: string;
  descriptionId: string;
}

export interface Projectile {
  id: string;
  originX: number; // Screen X at start
  originY: number; // Screen Y at start
  targetYaw: number;
  targetPitch: number;
  currentDist: number;
  maxDist: number;
  speed: number;
  damage: number;
  radius: number;
  type: WeaponType;
  color: string;
  isPiercing?: boolean;
  isExplosive?: boolean;
  splashRadius?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  type: 'spark' | 'ring' | 'smoke' | 'debris' | 'plasma' | 'crosshair_ping';
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  scale: number;
  alpha: number;
  vy: number;
  type: 'score' | 'combo' | 'weakpoint' | 'multiplier' | 'warning';
}

export interface WaveConfig {
  waveNumber: number;
  title: string;
  titleId: string;
  spawnCount: number;
  allowedTypes: MonsterType[];
  spawnInterval: number; // ms
  bossWave?: boolean;
}

export interface PlayerStats {
  score: number;
  highScore: number;
  combo: number;
  maxCombo: number;
  comboTimer: number; // 0 to 1
  hp: number;
  maxHp: number;
  heat: number; // 0 to 100
  isOverheated: boolean;
  shotsFired: number;
  shotsHit: number;
  weakpointHits: number;
  monstersKilled: number;
  ultimateCharge: number; // 0 to 100
}

export interface GameSettings {
  aimMode: AimMode;
  gyroSensitivity: number;
  touchSensitivity: number;
  invertPitch: boolean;
  soundVolume: number;
  hapticEnabled: boolean;
  cameraFacing: 'environment' | 'user' | 'simulated';
  showARGrid: boolean;
  language: Language;
  particleDensity: 'low' | 'high';
}
