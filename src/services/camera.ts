/**
 * Camera Stream Management for AR Background
 */

export interface CameraStatus {
  stream: MediaStream | null;
  isActive: boolean;
  facingMode: 'environment' | 'user' | 'simulated';
  error: string | null;
  hasTorch: boolean;
  torchOn: boolean;
}

type CameraStatusListener = (status: CameraStatus) => void;

class CameraService {
  private stream: MediaStream | null = null;
  private currentFacingMode: 'environment' | 'user' | 'simulated' = 'environment';
  private error: string | null = null;
  private torchOn: boolean = false;
  private listeners: Set<CameraStatusListener> = new Set();

  public subscribe(fn: CameraStatusListener): () => void {
    this.listeners.add(fn);
    fn(this.getStatus());
    return () => this.listeners.delete(fn);
  }

  public getStatus(): CameraStatus {
    const track = this.getVideoTrack();
    const capabilities = track && typeof track.getCapabilities === 'function' ? track.getCapabilities() : null;
    const hasTorch = Boolean(capabilities && 'torch' in capabilities);

    return {
      stream: this.stream,
      isActive: Boolean(this.stream && this.stream.active),
      facingMode: this.currentFacingMode,
      error: this.error,
      hasTorch,
      torchOn: this.torchOn,
    };
  }

  public async startCamera(facing: 'environment' | 'user' | 'simulated' = 'environment'): Promise<boolean> {
    this.stopCamera();
    this.currentFacingMode = facing;
    this.error = null;

    if (facing === 'simulated') {
      this.notify();
      return true;
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.error = 'Kamera tidak didukung di browser ini. Menggunakan latar simulasi AR.';
      this.currentFacingMode = 'simulated';
      this.notify();
      return false;
    }

    try {
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.stream = mediaStream;
      this.torchOn = false;
      this.notify();
      return true;
    } catch (err: unknown) {
      console.warn('Camera stream error:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      
      // Try fallback to any available camera if specific facing mode failed
      if (facing === 'environment') {
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          this.stream = fallbackStream;
          this.currentFacingMode = 'user';
          this.notify();
          return true;
        } catch {
          // Complete fallback to simulated environment
        }
      }

      this.error = `Izin kamera tidak diberikan (${errMsg}). Mode simulasi AR aktif.`;
      this.currentFacingMode = 'simulated';
      this.notify();
      return false;
    }
  }

  public stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    this.torchOn = false;
    this.notify();
  }

  public async toggleTorch(): Promise<boolean> {
    const track = this.getVideoTrack();
    if (!track) return false;

    const capabilities = typeof track.getCapabilities === 'function' ? track.getCapabilities() : null;
    if (!capabilities || !('torch' in capabilities)) return false;

    try {
      this.torchOn = !this.torchOn;
      await (track as unknown as { applyConstraints: (c: { advanced: [{ torch: boolean }] }) => Promise<void> }).applyConstraints({
        advanced: [{ torch: this.torchOn }],
      });
      this.notify();
      return this.torchOn;
    } catch (e) {
      console.warn('Failed to toggle torch:', e);
      return false;
    }
  }

  public async switchFacingMode(): Promise<void> {
    if (this.currentFacingMode === 'environment') {
      await this.startCamera('user');
    } else if (this.currentFacingMode === 'user') {
      await this.startCamera('simulated');
    } else {
      await this.startCamera('environment');
    }
  }

  private getVideoTrack(): MediaStreamTrack | null {
    if (!this.stream) return null;
    const tracks = this.stream.getVideoTracks();
    return tracks.length > 0 ? tracks[0] : null;
  }

  private notify() {
    const status = this.getStatus();
    this.listeners.forEach((fn) => fn(status));
  }
}

export const cameraService = new CameraService();
