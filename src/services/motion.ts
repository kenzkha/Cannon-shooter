/**
 * Motion & Gyroscope Tracker for AR Camera Orientation
 */

export interface OrientationData {
  yaw: number; // in radians (-PI to PI)
  pitch: number; // in radians (-PI/2 to PI/2)
  roll: number;
}

type OrientationListener = (data: OrientationData) => void;

class MotionService {
  private isAvailable: boolean = false;
  private isListening: boolean = false;
  private permissionGranted: boolean = false;

  // Raw and calibrated angles (radians)
  private rawYaw: number = 0;
  private rawPitch: number = 0;
  private rawRoll: number = 0;

  private baseYaw: number = 0;
  private basePitch: number = 0;

  // Smoothed angles
  private currentYaw: number = 0;
  private currentPitch: number = 0;
  private currentRoll: number = 0;

  private manualYawOffset: number = 0;
  private manualPitchOffset: number = 0;

  private listeners: Set<OrientationListener> = new Set();
  private smoothingFactor: number = 0.35; // 0 (slow) to 1 (instant)

  constructor() {
    this.handleDeviceOrientation = this.handleDeviceOrientation.bind(this);
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // Check if iOS 13+ DeviceOrientationEvent permission API exists
    const doe = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (typeof doe !== 'undefined' && typeof doe.requestPermission === 'function') {
      try {
        const response = await doe.requestPermission();
        if (response === 'granted') {
          this.permissionGranted = true;
          this.startListening();
          return true;
        } else {
          this.permissionGranted = false;
          return false;
        }
      } catch (err) {
        console.warn('DeviceOrientation permission error:', err);
        return false;
      }
    } else {
      // Standard Android/browser permissions
      this.permissionGranted = true;
      this.startListening();
      return true;
    }
  }

  public startListening() {
    if (typeof window === 'undefined' || this.isListening) return;
    window.addEventListener('deviceorientation', this.handleDeviceOrientation, true);
    this.isListening = true;
  }

  public stopListening() {
    if (typeof window === 'undefined' || !this.isListening) return;
    window.removeEventListener('deviceorientation', this.handleDeviceOrientation, true);
    this.isListening = false;
  }

  public calibrateCenter() {
    this.baseYaw = this.rawYaw;
    this.basePitch = this.rawPitch;
    this.manualYawOffset = 0;
    this.manualPitchOffset = 0;
    this.currentYaw = 0;
    this.currentPitch = 0;
  }

  public addManualDelta(deltaYaw: number, deltaPitch: number) {
    this.manualYawOffset += deltaYaw;
    // Clamp pitch between -75 deg and +75 deg (-1.3 to +1.3 rad)
    this.manualPitchOffset = Math.max(-1.3, Math.min(1.3, this.manualPitchOffset + deltaPitch));
    this.notifyListeners();
  }

  public setManualAim(yaw: number, pitch: number) {
    this.manualYawOffset = yaw;
    this.manualPitchOffset = Math.max(-1.3, Math.min(1.3, pitch));
    this.notifyListeners();
  }

  public subscribe(fn: OrientationListener): () => void {
    this.listeners.add(fn);
    fn(this.getOrientation());
    return () => this.listeners.delete(fn);
  }

  public getOrientation(): OrientationData {
    return {
      yaw: this.currentYaw + this.manualYawOffset,
      pitch: Math.max(-1.4, Math.min(1.4, this.currentPitch + this.manualPitchOffset)),
      roll: this.currentRoll,
    };
  }

  public getIsAvailable(): boolean {
    return this.isAvailable;
  }

  private handleDeviceOrientation(e: DeviceOrientationEvent) {
    if (e.alpha === null || e.beta === null) return;
    this.isAvailable = true;

    // Convert degrees to radians
    // alpha: 0 to 360 (compass yaw)
    // beta: -180 to 180 (pitch front/back)
    // gamma: -90 to 90 (roll left/right)
    const alphaRad = (e.alpha * Math.PI) / 180;
    const betaRad = ((e.beta - 90) * Math.PI) / 180; // Standard 90deg upright offset
    const gammaRad = ((e.gamma || 0) * Math.PI) / 180;

    this.rawYaw = alphaRad;
    this.rawPitch = betaRad;
    this.rawRoll = gammaRad;

    // Relative delta from calibration point with shortest angular distance
    let diffYaw = this.rawYaw - this.baseYaw;
    while (diffYaw > Math.PI) diffYaw -= Math.PI * 2;
    while (diffYaw < -Math.PI) diffYaw += Math.PI * 2;

    const diffPitch = this.rawPitch - this.basePitch;

    // Exponential smoothing filter
    this.currentYaw += (diffYaw - this.currentYaw) * this.smoothingFactor;
    this.currentPitch += (diffPitch - this.currentPitch) * this.smoothingFactor;
    this.currentRoll += (gammaRad - this.currentRoll) * this.smoothingFactor;

    this.notifyListeners();
  }

  private notifyListeners() {
    const data = this.getOrientation();
    this.listeners.forEach((fn) => fn(data));
  }
}

export const motionService = new MotionService();
