/**
 * AR Cannon Shooter: Sky Assault
 * Main Application & Game Loop Controller
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameState,
  Monster,
  Projectile,
  Particle,
  FloatingText,
  WeaponType,
  PlayerStats,
  GameSettings,
  AimMode,
} from './types';
import {
  MONSTER_CONFIGS,
  WEAPONS_DATA,
  GAME_WAVES,
  COMBO_SETTINGS,
} from './data/gameData';
import { sound } from './services/sound';
import { cameraService, CameraStatus } from './services/camera';
import { motionService, OrientationData } from './services/motion';

import { ARCameraBackground } from './components/ARCameraBackground';
import { ARCannonCanvas } from './components/ARCannonCanvas';
import { FirstPersonCannon } from './components/FirstPersonCannon';
import { ARHUD } from './components/ARHUD';
import { MainMenu } from './components/MainMenu';
import { SettingsModal } from './components/SettingsModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { TutorialGuide } from './components/TutorialGuide';

export default function App() {
  // Game State
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [currentWaveIdx, setCurrentWaveIdx] = useState<number>(0);
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>('PULSE_CANNON');

  // Camera & Motion State
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>(cameraService.getStatus());
  const [cameraYaw, setCameraYaw] = useState<number>(0);
  const [cameraPitch, setCameraPitch] = useState<number>(0);
  const [cameraRoll, setCameraRoll] = useState<number>(0);

  // Crosshair & Cannon Visuals
  const [crosshairPos, setCrosshairPos] = useState<{ x: number; y: number }>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const [recoil, setRecoil] = useState<number>(0);
  const [muzzleFlash, setMuzzleFlash] = useState<boolean>(false);
  const [screenShake, setScreenShake] = useState<number>(0);

  // Entities State
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  // Player Stats
  const [stats, setStats] = useState<PlayerStats>({
    score: 0,
    highScore: 0,
    combo: 0,
    maxCombo: 0,
    comboTimer: 0,
    hp: 100,
    maxHp: 100,
    heat: 0,
    isOverheated: false,
    shotsFired: 0,
    shotsHit: 0,
    weakpointHits: 0,
    monstersKilled: 0,
    ultimateCharge: 0,
  });

  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    aimMode: 'GYROSCOPE',
    gyroSensitivity: 1.0,
    touchSensitivity: 1.0,
    invertPitch: false,
    soundVolume: 0.8,
    hapticEnabled: true,
    cameraFacing: 'environment',
    showARGrid: true,
    language: 'id',
    particleDensity: 'high',
  });

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);

  // Refs for real-time game loop
  const gameStateRef = useRef<GameState>(gameState);
  gameStateRef.current = gameState;

  const statsRef = useRef<PlayerStats>(stats);
  statsRef.current = stats;

  const settingsRef = useRef<GameSettings>(settings);
  settingsRef.current = settings;

  const currentWeaponRef = useRef<WeaponType>(currentWeapon);
  currentWeaponRef.current = currentWeapon;

  const cameraYawRef = useRef<number>(0);
  const cameraPitchRef = useRef<number>(0);

  const monstersRef = useRef<Monster[]>([]);
  monstersRef.current = monsters;

  const projectilesRef = useRef<Projectile[]>([]);
  projectilesRef.current = projectiles;

  const particlesRef = useRef<Particle[]>([]);
  particlesRef.current = particles;

  const floatingTextsRef = useRef<FloatingText[]>([]);
  floatingTextsRef.current = floatingTexts;

  const lastShotTimeRef = useRef<number>(0);
  const waveSpawnsLeftRef = useRef<number>(0);
  const nextSpawnTimeRef = useRef<number>(0);

  // Touch drag tracking for manual aim
  const isDraggingRef = useRef<boolean>(false);
  const lastTouchPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Load Saved High Score
  useEffect(() => {
    try {
      const savedHi = localStorage.getItem('ar_cannon_highscore');
      const savedMaxCombo = localStorage.getItem('ar_cannon_maxcombo');
      if (savedHi) {
        setStats((prev) => ({
          ...prev,
          highScore: parseInt(savedHi, 10) || 0,
          maxCombo: parseInt(savedMaxCombo || '0', 10) || 0,
        }));
      }
    } catch {
      // Ignore local storage error
    }
  }, []);

  // Initialize Camera Stream & Listeners
  useEffect(() => {
    const unsubCam = cameraService.subscribe((status) => {
      setCameraStatus(status);
    });
    cameraService.startCamera(settings.cameraFacing);

    return () => {
      unsubCam();
      cameraService.stopCamera();
    };
  }, [settings.cameraFacing]);

  // Initialize Motion / Gyroscope Listeners
  useEffect(() => {
    const unsubMotion = motionService.subscribe((data: OrientationData) => {
      if (settingsRef.current.aimMode === 'GYROSCOPE') {
        const sens = settingsRef.current.gyroSensitivity;
        const pitchInvert = settingsRef.current.invertPitch ? -1 : 1;

        const finalYaw = data.yaw * sens;
        const finalPitch = data.pitch * sens * pitchInvert;

        cameraYawRef.current = finalYaw;
        cameraPitchRef.current = finalPitch;

        setCameraYaw(finalYaw);
        setCameraPitch(finalPitch);
        setCameraRoll(data.roll);
      }
    });

    motionService.startListening();

    return () => {
      unsubMotion();
      motionService.stopListening();
    };
  }, []);

  // Recenter / Calibrate Gyro
  const handleCalibrateGyro = useCallback(() => {
    motionService.calibrateCenter();
    cameraYawRef.current = 0;
    cameraPitchRef.current = 0;
    setCameraYaw(0);
    setCameraPitch(0);
  }, []);

  // Request iOS Gyro Permission
  const handleRequestGyroPermission = useCallback(async () => {
    const granted = await motionService.requestPermission();
    if (granted) {
      handleCalibrateGyro();
    }
    return granted;
  }, [handleCalibrateGyro]);

  // Switch Weapon
  const handleSwitchWeapon = useCallback((w: WeaponType) => {
    setCurrentWeapon(w);
  }, []);

  // Primary Fire Action
  const handleFire = useCallback(() => {
    if (gameStateRef.current !== 'PLAYING') return;

    const now = performance.now();
    const currentW = currentWeaponRef.current;
    const wInfo = WEAPONS_DATA[currentW];

    // Check cooldown & overheat
    if (now - lastShotTimeRef.current < wInfo.cooldownMs) return;
    if (statsRef.current.isOverheated) {
      sound.playOverheatAlert();
      return;
    }

    lastShotTimeRef.current = now;

    // Play SFX & Haptics
    sound.playFire(currentW);
    if (settingsRef.current.hapticEnabled) {
      sound.triggerHaptic(currentW === 'SCATTER_BLAST' ? 50 : 35);
    }

    // Recoil and Muzzle Flash visual kick
    setRecoil(1);
    setMuzzleFlash(true);
    setTimeout(() => setMuzzleFlash(false), 80);
    setScreenShake(currentW === 'ION_RAILGUN' ? 0.6 : currentW === 'SCATTER_BLAST' ? 0.45 : 0.25);

    // Heat buildup
    setStats((prev) => {
      const newHeat = prev.heat + wInfo.heatPerShot;
      const isOver = newHeat >= 100;
      if (isOver) sound.playOverheatAlert();
      return {
        ...prev,
        shotsFired: prev.shotsFired + 1,
        heat: Math.min(100, newHeat),
        isOverheated: isOver,
      };
    });

    // Spawn Projectiles
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const originX = screenW / 2;
    const originY = screenH - 60;

    const targetYaw = cameraYawRef.current;
    const targetPitch = cameraPitchRef.current;

    const newProjs: Projectile[] = [];

    if (currentW === 'SCATTER_BLAST') {
      // 3 Spread pellets (-3deg, 0deg, +3deg spread)
      [-0.05, 0, 0.05].forEach((spreadOffset) => {
        newProjs.push({
          id: `proj_${now}_${Math.random()}`,
          originX,
          originY,
          targetYaw: targetYaw + spreadOffset,
          targetPitch: targetPitch + spreadOffset * 0.5,
          currentDist: 0,
          maxDist: 500,
          speed: wInfo.projectileSpeed,
          damage: wInfo.damage,
          radius: wInfo.projectileRadius,
          type: currentW,
          color: wInfo.color,
        });
      });
    } else {
      // Single / Dual Plasma or Railgun
      newProjs.push({
        id: `proj_${now}_${Math.random()}`,
        originX,
        originY,
        targetYaw,
        targetPitch,
        currentDist: 0,
        maxDist: 600,
        speed: wInfo.projectileSpeed,
        damage: wInfo.damage,
        radius: wInfo.projectileRadius,
        type: currentW,
        color: wInfo.color,
        isPiercing: currentW === 'ION_RAILGUN',
      });
    }

    setProjectiles((prev) => [...prev, ...newProjs]);
  }, []);

  // Super EMP Mega Blast
  const handleTriggerEMP = useCallback(() => {
    if (statsRef.current.ultimateCharge < 100 || gameStateRef.current !== 'PLAYING') return;

    sound.playUltimateEMP();
    if (settingsRef.current.hapticEnabled) {
      sound.triggerHaptic(180);
    }

    setScreenShake(1.2);

    // Wipe all visible / active monsters with massive combo points
    setMonsters((prev) => {
      let kills = 0;
      let scoreGain = 0;

      const updated = prev.map((m) => {
        if (!m.isDying) {
          kills++;
          scoreGain += m.scoreValue * 2;
          return {
            ...m,
            hp: 0,
            isDying: true,
            deathTimer: 0,
          };
        }
        return m;
      });

      // Award massive combo & score
      setStats((s) => {
        const newCombo = s.combo + kills;
        const mult = COMBO_SETTINGS.getMultiplier(newCombo);
        const addedScore = scoreGain * mult;

        return {
          ...s,
          score: s.score + addedScore,
          combo: newCombo,
          maxCombo: Math.max(s.maxCombo, newCombo),
          comboTimer: 1.0,
          monstersKilled: s.monstersKilled + kills,
          ultimateCharge: 0,
        };
      });

      // Spawn EMP particle shockwaves
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const empParticles: Particle[] = [];
      for (let i = 0; i < 40; i++) {
        const angle = (i * Math.PI * 2) / 40;
        empParticles.push({
          x: screenW / 2,
          y: screenH / 2,
          vx: Math.cos(angle) * (12 + Math.random() * 8),
          vy: Math.sin(angle) * (12 + Math.random() * 8),
          size: 4 + Math.random() * 6,
          color: '#c084fc',
          alpha: 1,
          decay: 0.02,
          type: 'plasma',
        });
      }
      setParticles((p) => [...p, ...empParticles]);

      // EMP Floating text
      setFloatingTexts((ft) => [
        ...ft,
        {
          id: `emp_${Date.now()}`,
          text: 'EMP OVERDRIVE BURST!',
          x: screenW / 2,
          y: screenH / 2 - 40,
          color: '#c084fc',
          scale: 1.6,
          alpha: 1,
          vy: -1.2,
          type: 'multiplier',
        },
      ]);

      return updated;
    });
  }, []);

  // Start Game
  const handleStartGame = useCallback((startWave = 1) => {
    const waveIdx = Math.max(0, Math.min(GAME_WAVES.length - 1, startWave - 1));
    setCurrentWaveIdx(waveIdx);

    const waveCfg = GAME_WAVES[waveIdx];
    waveSpawnsLeftRef.current = waveCfg.spawnCount;
    nextSpawnTimeRef.current = performance.now() + 1000;

    setMonsters([]);
    setProjectiles([]);
    setParticles([]);
    setFloatingTexts([]);

    setStats((prev) => ({
      ...prev,
      score: 0,
      combo: 0,
      comboTimer: 0,
      hp: 100,
      heat: 0,
      isOverheated: false,
      shotsFired: 0,
      shotsHit: 0,
      weakpointHits: 0,
      monstersKilled: 0,
      ultimateCharge: 25,
    }));

    handleCalibrateGyro();
    setGameState('PLAYING');
  }, [handleCalibrateGyro]);

  // Main Game Loop (requestAnimationFrame)
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min(0.06, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      const currentWaveCfg = GAME_WAVES[currentWaveIdx];

      // 1. Spawning Monsters
      if (waveSpawnsLeftRef.current > 0 && currentTime >= nextSpawnTimeRef.current) {
        const allowed = currentWaveCfg.allowedTypes;
        const chosenType = allowed[Math.floor(Math.random() * allowed.length)];
        const cfg = MONSTER_CONFIGS[chosenType];

        // Random 360 polar coordinates
        const spawnYaw = (Math.random() - 0.5) * Math.PI * 2;
        const spawnPitch = (Math.random() - 0.5) * 0.8;
        const spawnDist = chosenType === 'LEVIATHAN_BOSS' ? 380 : 360 + Math.random() * 120;

        const newMonster: Monster = {
          id: `m_${Date.now()}_${Math.random()}`,
          type: chosenType,
          yaw: spawnYaw,
          pitch: spawnPitch,
          distance: spawnDist,
          targetDistance: chosenType === 'LEVIATHAN_BOSS' ? 240 : 80 + Math.random() * 100,
          vYaw: (Math.random() - 0.5) * 0.35 * cfg.speed,
          vPitch: (Math.random() - 0.5) * 0.2 * cfg.speed,
          vDist: -28 * cfg.speed,
          hp: cfg.maxHp,
          maxHp: cfg.maxHp,
          radius: cfg.radius,
          scoreValue: cfg.scoreValue,
          color: cfg.color,
          glowColor: cfg.glowColor,
          timeAlive: 0,
          phase: Math.random() * Math.PI * 2,
          isHit: 0,
          isDying: false,
          deathTimer: 0,
          cloakAlpha: chosenType === 'STALKER' ? 0.2 : 1.0,
          hasWeakpoint: cfg.hasWeakpoint,
          weakpointAngle: Math.random() * Math.PI * 2,
          weakpointRadius: cfg.radius * 0.3,
          attackCooldown: 2.5,
          canAttack: true,
        };

        setMonsters((prev) => [...prev, newMonster]);
        waveSpawnsLeftRef.current -= 1;
        nextSpawnTimeRef.current = currentTime + currentWaveCfg.spawnInterval;
      }

      // 2. Update Monsters (Physics, Behaviors & Proximity Attack)
      let playerDamageTaken = 0;

      setMonsters((prev) => {
        const updated: Monster[] = [];

        for (const m of prev) {
          if (m.isDying) {
            const nextDeath = m.deathTimer + dt * 2.2;
            if (nextDeath < 1.0) {
              updated.push({ ...m, deathTimer: nextDeath });
            }
            continue;
          }

          const t = m.timeAlive + dt;
          let newYaw = m.yaw + m.vYaw * dt;
          let newPitch = m.pitch + m.vPitch * dt;
          let newDist = m.distance + m.vDist * dt;
          let cloak = m.cloakAlpha;

          // Unique flight behaviors
          if (m.type === 'DRONE') {
            newPitch += Math.sin(t * 3 + m.phase) * 0.008;
            newYaw += Math.cos(t * 2 + m.phase) * 0.006;
          } else if (m.type === 'WYVERN') {
            newPitch += Math.sin(t * 4) * 0.015;
            newDist += Math.sin(t * 2) * 10 * dt;
          } else if (m.type === 'STALKER') {
            // Optical camouflage pulse
            cloak = 0.25 + Math.sin(t * 2.5) * 0.65;
            newYaw += (Math.random() - 0.5) * 0.03;
          } else if (m.type === 'KAMI_SPORE') {
            // Speed up as it nears player
            newDist -= (35 + (500 - newDist) * 0.1) * dt;
          } else if (m.type === 'LEVIATHAN_BOSS') {
            // Orbiting circular pattern
            newYaw += 0.15 * dt;
            newPitch = Math.sin(t * 0.8) * 0.25;
          }

          // Rotating weakpoint angle
          const wpAngle = m.weakpointAngle + dt * 3.5;
          const hitFlash = Math.max(0, m.isHit - dt * 5);

          // Proximity breach attack on player base
          if (newDist <= 60) {
            playerDamageTaken += m.type === 'KAMI_SPORE' ? 25 : m.type === 'LEVIATHAN_BOSS' ? 35 : 12;
            sound.playPlayerDamaged();
            if (settingsRef.current.hapticEnabled) sound.triggerHaptic(70);
            setScreenShake(0.8);
            // Self-destruct after delivering strike
            continue;
          }

          updated.push({
            ...m,
            timeAlive: t,
            yaw: newYaw,
            pitch: Math.max(-1.1, Math.min(1.1, newPitch)),
            distance: newDist,
            weakpointAngle: wpAngle,
            isHit: hitFlash,
            cloakAlpha: cloak,
          });
        }

        return updated;
      });

      // 3. Update Projectiles & Ballistic Collision Check
      setProjectiles((prevProjs) => {
        const remainingProjs: Projectile[] = [];
        const currentMonsters = monstersRef.current;

        for (const p of prevProjs) {
          const newDist = p.currentDist + p.speed * dt;

          if (newDist >= p.maxDist) {
            continue; // Projectile expired in distance
          }

          let hitMonster: Monster | null = null;
          let isWeakpointHit = false;

          // Check collision with active monsters
          for (const m of currentMonsters) {
            if (m.isDying) continue;

            // Distance match tolerance
            const distDiff = Math.abs(newDist - m.distance);
            if (distDiff < 38) {
              // Angular delta match
              let dYaw = Math.abs((p.targetYaw - m.yaw) % (Math.PI * 2));
              if (dYaw > Math.PI) dYaw = Math.PI * 2 - dYaw;

              const dPitch = Math.abs(p.targetPitch - m.pitch);
              const angularRadius = (m.radius / m.distance) * 1.5;

              if (dYaw < angularRadius && dPitch < angularRadius) {
                hitMonster = m;

                // Check Weakpoint precision
                if (m.hasWeakpoint) {
                  const wpAngularRadius = angularRadius * 0.45;
                  if (dYaw < wpAngularRadius && dPitch < wpAngularRadius) {
                    isWeakpointHit = true;
                  }
                }
                break;
              }
            }
          }

          if (hitMonster) {
            // Apply Damage and trigger SFX
            const damage = isWeakpointHit ? p.damage * 3 : p.damage;
            sound.playHit(isWeakpointHit);

            setMonsters((prevM) =>
              prevM.map((m) => {
                if (m.id === hitMonster!.id) {
                  const newHp = m.hp - damage;
                  const willDie = newHp <= 0;

                  if (willDie) {
                    sound.playExplosion(m.type);
                    if (settingsRef.current.hapticEnabled) sound.triggerHaptic(50);
                  }

                  return {
                    ...m,
                    hp: Math.max(0, newHp),
                    isHit: 1,
                    isDying: willDie,
                    deathTimer: 0,
                  };
                }
                return m;
              })
            );

            // Floating Combat Text
            const screenW = window.innerWidth;
            const screenH = window.innerHeight;
            setFloatingTexts((prevFt) => [
              ...prevFt,
              {
                id: `ft_${Date.now()}_${Math.random()}`,
                text: isWeakpointHit ? `CRITICAL! +${damage * 5}` : `+${damage}`,
                x: screenW / 2 + (Math.random() - 0.5) * 60,
                y: screenH / 2 - 30,
                color: isWeakpointHit ? '#fbbf24' : '#38bdf8',
                scale: isWeakpointHit ? 1.5 : 1.1,
                alpha: 1,
                vy: -1.4,
                type: isWeakpointHit ? 'weakpoint' : 'score',
              },
            ]);

            // Spawn Impact Sparks
            const impactParticles: Particle[] = [];
            const particleCount = isWeakpointHit ? 18 : 8;
            for (let i = 0; i < particleCount; i++) {
              const angle = Math.random() * Math.PI * 2;
              const spd = 2 + Math.random() * 6;
              impactParticles.push({
                x: screenW / 2 + (Math.random() - 0.5) * 20,
                y: screenH / 2 + (Math.random() - 0.5) * 20,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                size: 2 + Math.random() * 3.5,
                color: isWeakpointHit ? '#fbbf24' : p.color,
                alpha: 1,
                decay: 0.035,
                type: 'spark',
              });
            }
            setParticles((prevP) => [...prevP, ...impactParticles]);

            // Update Score, Combo, Accuracy, and Ult Charge
            setStats((s) => {
              const isKill = hitMonster!.hp - damage <= 0;
              const nextCombo = isKill ? s.combo + 1 : s.combo;
              const mult = COMBO_SETTINGS.getMultiplier(nextCombo);
              const scoreBonus = (isKill ? hitMonster!.scoreValue : 25) * mult * (isWeakpointHit ? 2 : 1);
              const newScore = s.score + scoreBonus;

              if (isKill && nextCombo > 1) {
                sound.playComboStreak(nextCombo);
              }

              return {
                ...s,
                score: newScore,
                highScore: Math.max(s.highScore, newScore),
                combo: nextCombo,
                maxCombo: Math.max(s.maxCombo, nextCombo),
                comboTimer: isKill ? 1.0 : s.comboTimer,
                shotsHit: s.shotsHit + 1,
                weakpointHits: isWeakpointHit ? s.weakpointHits + 1 : s.weakpointHits,
                monstersKilled: isKill ? s.monstersKilled + 1 : s.monstersKilled,
                ultimateCharge: Math.min(100, s.ultimateCharge + (isKill ? 12 : 3)),
              };
            });

            // If piercing weapon (Railgun), continue flying; else consume projectile
            if (p.isPiercing) {
              remainingProjs.push({ ...p, currentDist: newDist });
            }
          } else {
            remainingProjs.push({ ...p, currentDist: newDist });
          }
        }

        return remainingProjs;
      });

      // 4. Update Particles
      setParticles((prevP) => {
        return prevP
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            alpha: p.alpha - p.decay,
          }))
          .filter((p) => p.alpha > 0);
      });

      // 5. Update Floating Texts
      setFloatingTexts((prevFt) => {
        return prevFt
          .map((ft) => ({
            ...ft,
            y: ft.y + ft.vy,
            alpha: ft.alpha - 0.022,
          }))
          .filter((ft) => ft.alpha > 0);
      });

      // 6. Update Combo Decay, Heat Dissipation, Recoil & Screen Shake
      setRecoil((r) => Math.max(0, r - dt * 6));
      setScreenShake((s) => Math.max(0, s - dt * 4));

      setStats((s) => {
        let newHeat = Math.max(0, s.heat - dt * 26);
        let over = s.isOverheated;
        if (over && newHeat <= 10) {
          over = false;
        }

        // Combo decay
        let newCombo = s.combo;
        let newTimer = s.comboTimer;
        if (s.combo > 0) {
          newTimer = Math.max(0, s.comboTimer - dt / COMBO_SETTINGS.decayTimeSec);
          if (newTimer <= 0) {
            newCombo = 0; // Combo broke
          }
        }

        const newHp = Math.max(0, s.hp - playerDamageTaken);

        return {
          ...s,
          heat: newHeat,
          isOverheated: over,
          combo: newCombo,
          comboTimer: newTimer,
          hp: newHp,
        };
      });

      // 7. Check Game Over or Wave Cleared
      if (statsRef.current.hp <= 0) {
        setGameState('GAMEOVER');
        sound.playGameOver();
        try {
          localStorage.setItem('ar_cannon_highscore', String(statsRef.current.highScore));
          localStorage.setItem('ar_cannon_maxcombo', String(statsRef.current.maxCombo));
        } catch {
          // Ignore storage
        }
        return;
      }

      // Check Wave Completion
      if (
        waveSpawnsLeftRef.current <= 0 &&
        monstersRef.current.length === 0
      ) {
        // All enemies in wave defeated
        if (currentWaveIdx >= GAME_WAVES.length - 1) {
          // Final wave victory!
          setGameState('VICTORY');
          sound.playVictory();
          try {
            localStorage.setItem('ar_cannon_highscore', String(statsRef.current.highScore));
            localStorage.setItem('ar_cannon_maxcombo', String(statsRef.current.maxCombo));
          } catch {
            // Ignore storage
          }
          return;
        } else {
          // Advance to next wave
          const nextW = currentWaveIdx + 1;
          setCurrentWaveIdx(nextW);
          const nextCfg = GAME_WAVES[nextW];
          waveSpawnsLeftRef.current = nextCfg.spawnCount;
          nextSpawnTimeRef.current = currentTime + 2000;

          // Wave clear bonus
          sound.playComboStreak(15);
          setStats((s) => ({
            ...s,
            score: s.score + 1500,
            hp: Math.min(100, s.hp + 30), // Repair base hull
            ultimateCharge: Math.min(100, s.ultimateCharge + 40),
          }));

          const screenW = window.innerWidth;
          const screenH = window.innerHeight;
          setFloatingTexts((ft) => [
            ...ft,
            {
              id: `wave_clear_${Date.now()}`,
              text: `${settingsRef.current.language === 'id' ? 'GELOMBANG BERHASIL DIBERSIHKAN!' : 'WAVE CLEARED!'} +1500`,
              x: screenW / 2,
              y: screenH / 2 - 60,
              color: '#38bdf8',
              scale: 1.5,
              alpha: 1,
              vy: -1.0,
              type: 'score',
            },
          ]);
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, currentWaveIdx]);

  // Touch & Pointer Aim Controls (for TOUCH_DRAG mode)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (gameState !== 'PLAYING') return;

    // Check if clicked inside control buttons
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('#main-fire-button')) {
      return;
    }

    isDraggingRef.current = true;
    lastTouchPosRef.current = { x: e.clientX, y: e.clientY };

    // Fire immediately on tap if touching upper viewport
    if (e.clientY < window.innerHeight * 0.78) {
      handleFire();
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || gameState !== 'PLAYING') return;

    const dx = e.clientX - lastTouchPosRef.current.x;
    const dy = e.clientY - lastTouchPosRef.current.y;
    lastTouchPosRef.current = { x: e.clientX, y: e.clientY };

    if (settings.aimMode === 'TOUCH_DRAG') {
      const sens = settings.touchSensitivity * 0.0035;
      const pitchInvert = settings.invertPitch ? 1 : -1;

      motionService.addManualDelta(dx * sens, dy * sens * pitchInvert);
      const orient = motionService.getOrientation();

      cameraYawRef.current = orient.yaw;
      cameraPitchRef.current = orient.pitch;
      setCameraYaw(orient.yaw);
      setCameraPitch(orient.pitch);
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Keyboard Shortcuts (Space, 1, 2, 3, E, R, P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleFire();
      } else if (e.key === '1') {
        handleSwitchWeapon('PULSE_CANNON');
      } else if (e.key === '2') {
        handleSwitchWeapon('SCATTER_BLAST');
      } else if (e.key === '3') {
        handleSwitchWeapon('ION_RAILGUN');
      } else if (e.key === 'e' || e.key === 'E' || e.key === 'x' || e.key === 'X') {
        handleTriggerEMP();
      } else if (e.key === 'r' || e.key === 'R') {
        handleCalibrateGyro();
      } else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (gameState === 'PLAYING') setGameState('PAUSED');
        else if (gameState === 'PAUSED') setGameState('PLAYING');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleFire, handleSwitchWeapon, handleTriggerEMP, handleCalibrateGyro]);

  // Update sound settings
  useEffect(() => {
    sound.setVolume(settings.soundVolume);
  }, [settings.soundVolume]);

  const currentWaveConfig = GAME_WAVES[currentWaveIdx] || GAME_WAVES[0];
  const waveTitle = settings.language === 'id' ? currentWaveConfig.titleId : currentWaveConfig.title;

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-black select-none font-sans"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* 1. AR Camera Video Feed or Cyber Grid */}
      <ARCameraBackground
        cameraStatus={cameraStatus}
        cameraYaw={cameraYaw}
        cameraPitch={cameraPitch}
        isSimulated={settings.cameraFacing === 'simulated'}
      />

      {/* 2. 3D Projectiles, Monsters, Particles & AR Reticle Canvas */}
      <ARCannonCanvas
        monsters={monsters}
        projectiles={projectiles}
        particles={particles}
        floatingTexts={floatingTexts}
        cameraYaw={cameraYaw}
        cameraPitch={cameraPitch}
        cameraRoll={cameraRoll}
        crosshairX={crosshairPos.x}
        crosshairY={crosshairPos.y}
        currentWeapon={currentWeapon}
        showARGrid={settings.showARGrid}
        aimMode={settings.aimMode}
        screenShake={screenShake}
        isOverheated={stats.isOverheated}
      />

      {/* 3. First Person POV Heavy Cannon Model */}
      <FirstPersonCannon
        weapon={currentWeapon}
        recoil={recoil}
        heat={stats.heat}
        isOverheated={stats.isOverheated}
        crosshairOffsetX={0}
        muzzleFlash={muzzleFlash}
      />

      {/* 4. Active Game Tactical AR HUD */}
      {gameState === 'PLAYING' && (
        <ARHUD
          stats={stats}
          currentWave={currentWaveIdx + 1}
          totalWaves={GAME_WAVES.length}
          waveTitle={waveTitle}
          currentWeapon={currentWeapon}
          monsters={monsters}
          cameraYaw={cameraYaw}
          aimMode={settings.aimMode}
          lang={settings.language}
          hasTorch={cameraStatus.hasTorch}
          torchOn={cameraStatus.torchOn}
          onFire={handleFire}
          onSwitchWeapon={handleSwitchWeapon}
          onTriggerEMP={handleTriggerEMP}
          onCalibrateGyro={handleCalibrateGyro}
          onSwitchCamera={() => cameraService.switchFacingMode()}
          onToggleTorch={() => cameraService.toggleTorch()}
          onPause={() => setGameState('PAUSED')}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* 5. Main Menu Overlay */}
      {gameState === 'MENU' && (
        <MainMenu
          highScore={stats.highScore}
          maxCombo={stats.maxCombo}
          settings={settings}
          onStartGame={handleStartGame}
          onOpenTutorial={() => setIsTutorialOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onSwitchCamera={() => cameraService.switchFacingMode()}
        />
      )}

      {/* 6. Pause Overlay */}
      {gameState === 'PAUSED' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-950 border border-cyan-500/40 rounded-2xl p-6 text-center max-w-xs w-full shadow-2xl">
            <h2 className="text-xl font-orbitron font-black text-cyan-300 mb-4 tracking-wider">
              {settings.language === 'id' ? 'GAME DIJEDA' : 'GAME PAUSED'}
            </h2>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => setGameState('PLAYING')}
                className="py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-orbitron font-bold text-slate-950 text-xs tracking-wider active:scale-98 transition"
              >
                {settings.language === 'id' ? 'LANJUTKAN' : 'RESUME'}
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-orbitron font-bold text-xs"
              >
                {settings.language === 'id' ? 'PENGATURAN' : 'SETTINGS'}
              </button>
              <button
                onClick={() => setGameState('MENU')}
                className="py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-red-400 font-orbitron font-bold text-xs"
              >
                {settings.language === 'id' ? 'KEMBALI KE MENU' : 'QUIT TO MENU'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Game Over Modal */}
      {gameState === 'GAMEOVER' && (
        <GameOverModal
          stats={stats}
          currentWave={currentWaveIdx + 1}
          lang={settings.language}
          onRetry={() => handleStartGame(currentWaveIdx + 1)}
          onMainMenu={() => setGameState('MENU')}
        />
      )}

      {/* 8. Victory Modal */}
      {gameState === 'VICTORY' && (
        <VictoryModal
          stats={stats}
          lang={settings.language}
          onPlayAgain={() => handleStartGame(1)}
          onMainMenu={() => setGameState('MENU')}
        />
      )}

      {/* 9. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onUpdateSettings={(newS) => setSettings((prev) => ({ ...prev, ...newS }))}
        onClose={() => setIsSettingsOpen(false)}
        onRequestGyroPermission={handleRequestGyroPermission}
      />

      {/* 10. Tutorial & Training Guide Modal */}
      <TutorialGuide
        isOpen={isTutorialOpen}
        lang={settings.language}
        onClose={() => setIsTutorialOpen(false)}
        onStartGame={() => handleStartGame(1)}
      />
    </div>
  );
}
