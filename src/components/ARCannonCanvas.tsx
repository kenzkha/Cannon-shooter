/**
 * AR Cannon Canvas - 3D/AR Rendering Pipeline
 * Handles 360-degree polar projection, monster vector animations,
 * projectile ballistics, particle systems, floating damage typography, and AR HUD.
 */

import React, { useRef, useEffect } from 'react';
import {
  Monster,
  Projectile,
  Particle,
  FloatingText,
  WeaponType,
  AimMode,
} from '../types';
import { MONSTER_CONFIGS } from '../data/gameData';

interface ARCannonCanvasProps {
  monsters: Monster[];
  projectiles: Projectile[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  cameraYaw: number;
  cameraPitch: number;
  cameraRoll: number;
  crosshairX: number; // Screen center or touch pos
  crosshairY: number;
  currentWeapon: WeaponType;
  showARGrid: boolean;
  aimMode: AimMode;
  screenShake: number;
  isOverheated: boolean;
  onMonsterHitCheck?: (lockedMonster: Monster | null, isWeakpoint: boolean) => void;
}

export const ARCannonCanvas: React.FC<ARCannonCanvasProps> = ({
  monsters,
  projectiles,
  particles,
  floatingTexts,
  cameraYaw,
  cameraPitch,
  cameraRoll,
  crosshairX,
  crosshairY,
  showARGrid,
  screenShake,
  isOverheated,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      if (width === 0 || height === 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Apply screen shake
      ctx.save();
      if (screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * screenShake * 16;
        const shakeY = (Math.random() - 0.5) * screenShake * 16;
        ctx.translate(shakeX, shakeY);
      }

      const centerX = width / 2;
      const centerY = height / 2;

      // FOV (Field of View) in radians
      const hFOV = (80 * Math.PI) / 180;
      const vFOV = hFOV * (height / width);

      // Helper function to normalize angle difference to [-PI, PI]
      const normAngle = (rad: number) => {
        let a = rad % (Math.PI * 2);
        if (a > Math.PI) a -= Math.PI * 2;
        if (a < -Math.PI) a += Math.PI * 2;
        return a;
      };

      // 1. Draw AR Holographic Horizon & Compass Grid
      if (showARGrid) {
        drawARWorldGrid(ctx, width, height, cameraYaw, cameraPitch, hFOV, vFOV);
      }

      // 2. Render Projectiles (behind monsters or with depth)
      projectiles.forEach((proj) => {
        const dYaw = normAngle(proj.targetYaw - cameraYaw);
        const dPitch = proj.targetPitch - cameraPitch;

        // Project progress from cannon muzzle to target in 3D
        const progress = Math.min(1, proj.currentDist / proj.maxDist);
        const endScreenX = centerX + (dYaw / (hFOV / 2)) * (width / 2);
        const endScreenY = centerY - (dPitch / (vFOV / 2)) * (height / 2);

        const curX = proj.originX + (endScreenX - proj.originX) * progress;
        const curY = proj.originY + (endScreenY - proj.originY) * progress;
        const currentScale = Math.max(0.2, 1.4 - progress * 0.8);
        const curRadius = proj.radius * currentScale;

        // Draw projectile glow and tracer
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = proj.color;
        ctx.lineWidth = Math.max(1.5, curRadius * 0.8);
        ctx.shadowColor = proj.color;
        ctx.shadowBlur = 12;
        
        // Trail line
        const trailProgress = Math.max(0, progress - 0.15);
        const trailX = proj.originX + (endScreenX - proj.originX) * trailProgress;
        const trailY = proj.originY + (endScreenY - proj.originY) * trailProgress;
        ctx.moveTo(trailX, trailY);
        ctx.lineTo(curX, curY);
        ctx.stroke();

        // Projectile core head
        ctx.beginPath();
        ctx.arc(curX, curY, curRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.restore();
      });

      // 3. Render Monsters (Sorted by distance, furthest first)
      const sortedMonsters = [...monsters].sort((a, b) => b.distance - a.distance);

      let closestTargetUnderCrosshair: Monster | null = null;
      let minCrosshairDist = 60;

      sortedMonsters.forEach((monster) => {
        const dYaw = normAngle(monster.yaw - cameraYaw);
        const dPitch = monster.pitch - cameraPitch;

        const isInsideHFOV = Math.abs(dYaw) < (hFOV / 2) * 1.3;
        const isInsideVFOV = Math.abs(dPitch) < (vFOV / 2) * 1.3;

        const screenX = centerX + (dYaw / (hFOV / 2)) * (width / 2);
        const screenY = centerY - (dPitch / (vFOV / 2)) * (height / 2);

        // Distance perspective scaling
        const focalLength = 320;
        const depthScale = Math.max(0.25, Math.min(2.5, focalLength / monster.distance));
        const renderedRadius = monster.radius * depthScale;

        if (isInsideHFOV && isInsideVFOV) {
          // Render monster on screen
          ctx.save();
          ctx.translate(screenX, screenY);

          // Hit flash effect
          if (monster.isHit > 0) {
            ctx.filter = 'brightness(2.2) contrast(1.5)';
          }

          // Death fade
          if (monster.isDying) {
            ctx.globalAlpha = Math.max(0, 1 - monster.deathTimer);
            ctx.scale(1 + monster.deathTimer * 0.6, 1 + monster.deathTimer * 0.6);
          } else {
            ctx.globalAlpha = monster.cloakAlpha;
          }

          // Draw specific monster graphic
          drawMonsterEntity(ctx, monster, renderedRadius);

          ctx.restore();

          // Check if under crosshair for lock-on reticle
          const distToCrosshair = Math.hypot(screenX - crosshairX, screenY - crosshairY);
          if (distToCrosshair < renderedRadius * 1.2 && distToCrosshair < minCrosshairDist && !monster.isDying) {
            minCrosshairDist = distToCrosshair;
            closestTargetUnderCrosshair = monster;
          }

          // Draw Monster HUD / Health bar if damaged or boss
          if (!monster.isDying && (monster.hp < monster.maxHp || monster.type === 'LEVIATHAN_BOSS')) {
            drawMonsterHealthBar(ctx, screenX, screenY - renderedRadius - 14, monster, renderedRadius);
          }
        } else {
          // Off-screen threat radar indicator pointing towards enemy
          drawOffscreenIndicator(ctx, width, height, centerX, centerY, dYaw, dPitch, monster);
        }
      });

      // 4. Render Particle VFX
      particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;

        if (p.type === 'spark' || p.type === 'plasma') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'ring') {
          ctx.beginPath();
          ctx.lineWidth = 2;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.stroke();
        } else if (p.type === 'smoke') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(160, 160, 180, 0.25)';
          ctx.fill();
        } else if (p.type === 'debris') {
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        ctx.restore();
      });

      // 5. Render Floating Score & Combo Typography
      floatingTexts.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.font = `900 ${Math.round(18 * ft.scale)}px "Orbitron", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.lineWidth = 4;
        ctx.strokeText(ft.text, ft.x, ft.y);

        ctx.fillStyle = ft.color;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 12;
        ctx.fillText(ft.text, ft.x, ft.y);

        ctx.restore();
      });

      // 6. Draw Precision AR Targeting Reticle
      drawPrecisionCrosshair(
        ctx,
        crosshairX,
        crosshairY,
        closestTargetUnderCrosshair,
        isOverheated
      );

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    monsters,
    projectiles,
    particles,
    floatingTexts,
    cameraYaw,
    cameraPitch,
    cameraRoll,
    crosshairX,
    crosshairY,
    showARGrid,
    screenShake,
    isOverheated,
  ]);

  // Handle dynamic canvas resizing
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
};

/* ================= HELPER RENDERING FUNCTIONS ================= */

function drawMonsterEntity(ctx: CanvasRenderingContext2D, monster: Monster, radius: number) {
  const t = monster.timeAlive;
  const cfg = MONSTER_CONFIGS[monster.type];

  ctx.shadowColor = cfg.glowColor;
  ctx.shadowBlur = 16;

  if (monster.type === 'DRONE') {
    // Rotating outer ring with 3 energy blades
    ctx.save();
    ctx.rotate(t * 3);
    ctx.strokeStyle = cfg.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 3; i++) {
      ctx.rotate((Math.PI * 2) / 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(radius - 3, -2, 6, 4);
    }
    ctx.restore();

    // Central glowing core
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.48, 0, Math.PI * 2);
    ctx.fillStyle = cfg.color;
    ctx.fill();

    // Inner eye
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  } else if (monster.type === 'WYVERN') {
    // Mechanical wings & dragon-like cyber body
    const wingFlap = Math.sin(t * 8) * 0.5;

    // Left Wing
    ctx.save();
    ctx.rotate(-0.3 + wingFlap);
    ctx.fillStyle = cfg.color;
    ctx.beginPath();
    ctx.moveTo(-radius * 0.2, 0);
    ctx.lineTo(-radius * 1.3, -radius * 0.6);
    ctx.lineTo(-radius * 0.9, radius * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Right Wing
    ctx.save();
    ctx.rotate(0.3 - wingFlap);
    ctx.fillStyle = cfg.color;
    ctx.beginPath();
    ctx.moveTo(radius * 0.2, 0);
    ctx.lineTo(radius * 1.3, -radius * 0.6);
    ctx.lineTo(radius * 0.9, radius * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Armored Head & Body
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 0.45, radius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cyber visor eye
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-radius * 0.2, -radius * 0.35, radius * 0.4, radius * 0.15);
  } else if (monster.type === 'STALKER') {
    // Stealth holographic phantom
    ctx.save();
    ctx.strokeStyle = cfg.color;
    ctx.lineWidth = 2.5;

    // Outer glitching hexagon
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 + t * 1.5;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    // Holographic diamond center
    ctx.rotate(-t * 2);
    ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
    ctx.fillRect(-radius * 0.35, -radius * 0.35, radius * 0.7, radius * 0.7);

    ctx.restore();
  } else if (monster.type === 'KAMI_SPORE') {
    // Volatile ticking bomb with pulsing spikes
    const pulse = 1 + Math.sin(t * 14) * 0.15;
    ctx.fillStyle = cfg.color;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.55 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Spikes
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4 + t * 4;
      const sx = Math.cos(angle) * radius * 0.9 * pulse;
      const sy = Math.sin(angle) * radius * 0.9 * pulse;
      ctx.beginPath();
      ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#fef08a';
      ctx.fill();
    }

    // Warning alert ring
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.15, 0, Math.PI * 2);
    ctx.stroke();
  } else if (monster.type === 'LEVIATHAN_BOSS') {
    // Massive Dreadnought Cruiser
    ctx.save();
    ctx.rotate(t * 0.4);

    // Outer fortress barrier
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    // 4 Satellite Defense Orbs
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + t * 1.8;
      const ox = Math.cos(a) * (radius * 1.25);
      const oy = Math.sin(a) * (radius * 1.25);
      ctx.beginPath();
      ctx.arc(ox, oy, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.stroke();
    }

    // Core generator
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ca8a04';
    ctx.fill();

    // Eye reactor
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = '#fef08a';
    ctx.fill();

    ctx.restore();
  }

  // Draw Glowing Weakpoint Target if exposed
  if (monster.hasWeakpoint && !monster.isDying) {
    const wpAngle = monster.weakpointAngle;
    const wpDist = radius * 0.65;
    const wpx = Math.cos(wpAngle) * wpDist;
    const wpy = Math.sin(wpAngle) * wpDist;
    const wpRad = Math.max(5, monster.weakpointRadius * (radius / monster.radius));

    ctx.save();
    ctx.translate(wpx, wpy);

    // Pulsing golden weakpoint reticle
    const wpPulse = 1 + Math.sin(t * 12) * 0.25;
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.arc(0, 0, wpRad * wpPulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, wpRad * 0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

function drawMonsterHealthBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  monster: Monster,
  radius: number
) {
  const barWidth = Math.max(48, radius * 1.8);
  const barHeight = 5;
  const hpRatio = Math.max(0, monster.hp / monster.maxHp);

  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(x - barWidth / 2 - 1, y - 1, barWidth + 2, barHeight + 2);

  // Health fill
  ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.25 ? '#eab308' : '#ef4444';
  ctx.fillRect(x - barWidth / 2, y, barWidth * hpRatio, barHeight);

  // Name tag for Boss
  if (monster.type === 'LEVIATHAN_BOSS') {
    ctx.font = 'bold 11px "Orbitron", sans-serif';
    ctx.fillStyle = '#eab308';
    ctx.textAlign = 'center';
    ctx.fillText('TITAN BOSS', x, y - 6);
  }

  ctx.restore();
}

function drawOffscreenIndicator(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  dYaw: number,
  dPitch: number,
  monster: Monster
) {
  // Calculate angle on 2D screen perimeter
  const angle = Math.atan2(-dPitch, dYaw);
  const padding = 34;

  const edgeX = centerX + Math.cos(angle) * (width / 2 - padding);
  const edgeY = centerY + Math.sin(angle) * (height / 2 - padding);

  const cfg = MONSTER_CONFIGS[monster.type];

  ctx.save();
  ctx.translate(edgeX, edgeY);
  ctx.rotate(angle);

  // Glowing holographic chevron arrow
  ctx.fillStyle = cfg.color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = cfg.glowColor;
  ctx.shadowBlur = 10;

  ctx.beginPath();
  ctx.moveTo(10, 0);
  ctx.lineTo(-6, -8);
  ctx.lineTo(-2, 0);
  ctx.lineTo(-6, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Distance tag
  ctx.restore();
  ctx.save();
  ctx.font = '600 10px "Orbitron", sans-serif';
  ctx.fillStyle = '#e2e8f0';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.round(monster.distance)}m`, edgeX, edgeY + 18);
  ctx.restore();
}

function drawPrecisionCrosshair(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  lockedTarget: Monster | null,
  isOverheated: boolean
) {
  ctx.save();
  ctx.translate(x, y);

  const isLocked = Boolean(lockedTarget);
  const color = isOverheated ? '#ef4444' : isLocked ? '#ef4444' : '#38bdf8';

  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = isLocked ? 16 : 8;
  ctx.lineWidth = 1.8;

  // Outer segmented targeting ring
  const r = isLocked ? 26 : 22;
  const segments = 4;
  for (let i = 0; i < segments; i++) {
    const startA = (i * Math.PI) / 2 + Math.PI / 8;
    const endA = startA + Math.PI / 4;
    ctx.beginPath();
    ctx.arc(0, 0, r, startA, endA);
    ctx.stroke();
  }

  // Precision center dot and crosshair ticks
  ctx.beginPath();
  ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  const tickLen = 6;
  const tickGap = 8;
  ctx.beginPath();
  // Left
  ctx.moveTo(-tickGap - tickLen, 0);
  ctx.lineTo(-tickGap, 0);
  // Right
  ctx.moveTo(tickGap, 0);
  ctx.lineTo(tickGap + tickLen, 0);
  // Top
  ctx.moveTo(0, -tickGap - tickLen);
  ctx.lineTo(0, -tickGap);
  // Bottom
  ctx.moveTo(0, tickGap);
  ctx.lineTo(0, tickGap + tickLen);
  ctx.stroke();

  // If locked onto target, draw corner brackets and target distance readout
  if (lockedTarget) {
    const boxSize = 36;
    const bracketLen = 8;
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ef4444';

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(-boxSize / 2, -boxSize / 2 + bracketLen);
    ctx.lineTo(-boxSize / 2, -boxSize / 2);
    ctx.lineTo(-boxSize / 2 + bracketLen, -boxSize / 2);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(boxSize / 2 - bracketLen, -boxSize / 2);
    ctx.lineTo(boxSize / 2, -boxSize / 2);
    ctx.lineTo(boxSize / 2, -boxSize / 2 + bracketLen);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(-boxSize / 2, boxSize / 2 - bracketLen);
    ctx.lineTo(-boxSize / 2, boxSize / 2);
    ctx.lineTo(-boxSize / 2 + bracketLen, boxSize / 2);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(boxSize / 2 - bracketLen, boxSize / 2);
    ctx.lineTo(boxSize / 2, boxSize / 2);
    ctx.lineTo(boxSize / 2, boxSize / 2 - bracketLen);
    ctx.stroke();

    // Lock readout text
    ctx.font = 'bold 9px "Orbitron", sans-serif';
    ctx.fillStyle = '#ef4444';
    ctx.textAlign = 'center';
    ctx.fillText(`LOCK [${Math.round(lockedTarget.distance)}m]`, 0, boxSize / 2 + 14);
  }

  ctx.restore();
}

function drawARWorldGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cameraYaw: number,
  cameraPitch: number,
  hFOV: number,
  vFOV: number
) {
  ctx.save();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
  ctx.lineWidth = 1;

  const centerX = width / 2;
  const centerY = height / 2;

  // Pitch ladder (Horizon ± 10deg, ± 20deg, ± 30deg)
  for (let pitchDeg = -60; pitchDeg <= 60; pitchDeg += 15) {
    const pitchRad = (pitchDeg * Math.PI) / 180;
    const dPitch = pitchRad - cameraPitch;
    const y = centerY - (dPitch / (vFOV / 2)) * (height / 2);

    if (y >= 0 && y <= height) {
      ctx.beginPath();
      const isHorizon = pitchDeg === 0;
      const lineW = isHorizon ? width * 0.4 : width * 0.2;
      ctx.strokeStyle = isHorizon ? 'rgba(56, 189, 248, 0.35)' : 'rgba(56, 189, 248, 0.12)';
      ctx.moveTo(centerX - lineW / 2, y);
      ctx.lineTo(centerX + lineW / 2, y);
      ctx.stroke();

      if (!isHorizon) {
        ctx.font = '9px "Orbitron", monospace';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.textAlign = 'left';
        ctx.fillText(`${pitchDeg > 0 ? '+' : ''}${pitchDeg}°`, centerX + lineW / 2 + 6, y + 3);
      }
    }
  }

  // Compass Heading Bar at Top
  const headingDeg = ((cameraYaw * 180) / Math.PI + 360) % 360;
  ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
  ctx.font = 'bold 11px "Orbitron", monospace';
  ctx.textAlign = 'center';
  const cardinal =
    headingDeg > 337.5 || headingDeg <= 22.5
      ? 'N'
      : headingDeg > 22.5 && headingDeg <= 67.5
      ? 'NE'
      : headingDeg > 67.5 && headingDeg <= 112.5
      ? 'E'
      : headingDeg > 112.5 && headingDeg <= 157.5
      ? 'SE'
      : headingDeg > 157.5 && headingDeg <= 202.5
      ? 'S'
      : headingDeg > 202.5 && headingDeg <= 247.5
      ? 'SW'
      : headingDeg > 247.5 && headingDeg <= 292.5
      ? 'W'
      : 'NW';

  ctx.fillText(`${Math.round(headingDeg)}° ${cardinal}`, centerX, 36);

  ctx.restore();
}
