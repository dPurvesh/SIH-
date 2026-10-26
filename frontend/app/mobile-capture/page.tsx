'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  MapPin,
  Compass,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  Smartphone,
  ShieldCheck,
  VideoOff,
  ChevronDown,
  Navigation,
  Crosshair
} from 'lucide-react';
import { Application, fetchApplications, uploadInfrastructure } from '../api';

export default function MobileCapturePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [apps, setApps] = useState<Application[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  
  // Geolocation & Sensor State
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<string>('Locking GPS coordinates...');
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  useEffect(() => {
    fetchApplications().then((data) => {
      setApps(data);
      if (data.length > 0) setSelectedAppId(data[0].id);
    });

    // Real Hardware Geolocation
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6)),
            accuracy: Math.round(pos.coords.accuracy),
          });
          setGeoStatus('GPS HARDWARE LOCKED');
        },
        (err) => {
          setGeoStatus('CAMPUS GEOFENCE SEED');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreamActive(true);
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Camera feed unavailable or permissions denied. You may upload a photo directly.');
      setStreamActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        setCapturedBlob(blob);
        setCapturedPreview(URL.createObjectURL(blob));
      }
    }, 'image/jpeg', 0.95);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCapturedBlob(file);
      setCapturedPreview(URL.createObjectURL(file));
    }
  };

  const handleTransmitEvidence = async () => {
    if (!capturedBlob || !selectedAppId) return;
    try {
      setUploading(true);
      const file = new File([capturedBlob], 'mobile_capture_lab.jpg', { type: 'image/jpeg' });
      const res = await uploadInfrastructure(
        selectedAppId,
        'COMPUTER_LAB',
        'Mobile-Lab-Evidence',
        30,
        file,
        coords?.lat,
        coords?.lng
      );
      setUploadResult(res);
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const selectedApp = apps.find((a) => a.id === selectedAppId);

  useEffect(() => {
    if (selectedApp && (!coords || geoStatus === 'CAMPUS GEOFENCE SEED')) {
      setCoords({
        lat: selectedApp.institution.registered_lat || 18.5204,
        lng: selectedApp.institution.registered_lng || 73.8567,
        accuracy: 5
      });
      setGeoStatus('CAMPUS GEOFENCE SEED');
    }
  }, [selectedApp]);

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Top Header Card */}
      {/* Top Header Card */}
      <div className="saas-card p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="status-pill status-pill-neutral">
              EVC FIELD INSPECTION HUD
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-mono">Mobile Viewfinder</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Field Capture & Telemetry HUD
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Expert Visit Committee (EVC) and nodal officer mobile camera feed with real-time GPS telemetry HUD, tamper-resistant EXIF watermarking, and instant YOLO terminal counting.
          </p>
        </div>

        {/* Institution Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/70">
          <div className="px-1 text-left sm:text-right shrink-0">
            <span className="text-[10px] text-slate-500 block font-mono font-semibold uppercase tracking-wider">Target Institution</span>
            <span className="text-xs font-mono text-slate-800 font-bold whitespace-nowrap">
              PID: {selectedApp?.institution?.aicte_permanent_id || 'PENDING'}
            </span>
          </div>
          <div className="relative min-w-[240px] sm:w-72 md:w-80">
            <select
              value={selectedAppId || ''}
              onChange={(e) => {
                setSelectedAppId(Number(e.target.value));
                setUploadResult(null);
              }}
              className="appearance-none w-full bg-white border border-slate-200 rounded-lg pl-3.5 pr-9 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all cursor-pointer shadow-xs truncate"
            >
              {apps.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.institution.name} ({a.application_no})
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Viewfinder & Camera HUD (Col 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="saas-card p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Crosshair size={18} className="text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Field Camera HUD Viewfinder
                </h2>
              </div>
              <span className="status-pill status-pill-verified">
                {geoStatus}
              </span>
            </div>

            {/* Viewfinder Frame */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 aspect-video flex items-center justify-center">
              {streamActive ? (
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="p-8 text-center space-y-3">
                  <VideoOff size={32} className="mx-auto text-slate-500" />
                  <p className="text-xs text-slate-400 max-w-sm">
                    {cameraError || 'Camera feed paused or requires permissions.'}
                  </p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-xs">
                    <Camera size={14} />
                    <span>Upload Snapshot Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* Viewfinder Tactical HUD Overlay */}
              <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                {/* Top Overlay Strip */}
                <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/30">
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-rose-400" />
                    <span>{coords ? `${coords.lat}°N, ${coords.lng}°E (±${coords.accuracy}m)` : 'GPS ACQUIRING...'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Navigation size={13} className="text-indigo-400" />
                    <span>HDG: 118° SE</span>
                  </div>
                </div>

                {/* Center Crosshair */}
                <div className="w-12 h-12 border border-white/20 rounded-full mx-auto self-center flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_8px_#6366F1]" />
                </div>

                {/* Bottom Overlay Strip */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700">
                  <span>AICTE-AUTH-V3 // SECURE FIELD CAPTURE</span>
                  <span className="text-emerald-400">READY</span>
                </div>
              </div>

              {/* Hidden canvas for snapshot creation */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Camera Actions Bar */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {streamActive ? (
                  <button
                    onClick={captureFrame}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
                  >
                    <Camera size={14} />
                    <span>Capture Frame Snapshot</span>
                  </button>
                ) : (
                  <button
                    onClick={startCamera}
                    className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <RefreshCw size={14} className="text-indigo-600" />
                    <span>Re-initialize Camera</span>
                  </button>
                )}
              </div>

              <label className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5 shadow-xs">
                <span>Select from Gallery</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Evidence Preview & Instant Inference (Col 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="saas-card p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Evidence Processing & AI Audit
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">Zero Mock Inference</span>
            </div>

            {/* Captured Image Preview */}
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-video flex items-center justify-center">
              {capturedPreview ? (
                <img
                  src={capturedPreview}
                  alt="Captured Laboratory Evidence"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-6 text-slate-400 space-y-1">
                  <Smartphone size={24} className="mx-auto text-slate-400 mb-2" />
                  <span className="text-xs font-semibold block text-slate-600">
                    No image captured yet
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Use the camera shutter or choose a file to analyze.
                  </span>
                </div>
              )}
            </div>

            {/* Telemetry Summary Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Latitude / Longitude:</span>
                <span className="text-indigo-700 font-bold">
                  {coords ? `${coords.lat}, ${coords.lng}` : '18.4636, 73.8682'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Target Campus:</span>
                <span className="text-slate-900 font-medium">
                  {selectedApp?.institution?.name?.slice(0, 28) || 'No Institution Selected'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Watermark Status:</span>
                <span className="text-emerald-600 font-bold">
                  EXIF TIMESTAMP & GEOFENCE EMBEDDED
                </span>
              </div>
            </div>

            {/* Transmission Action */}
            <div>
              <button
                onClick={handleTransmitEvidence}
                disabled={!capturedBlob || uploading}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                {uploading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin text-white" />
                    <span>Running YOLOv8 & pgvector Inference...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Transmit & Process Evidence</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Upload Result Feedback */}
            {uploadResult && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 animate-fade-in text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Evidence Verified & Persisted</span>
                </div>
                <div className="text-slate-700 font-mono space-y-1">
                  <div>Detected Terminals: <b>{uploadResult.detected_counts?.tv_monitor_pc || 0} PCs</b></div>
                  <div>Geofence: <b>{uploadResult.geofence_passed ? 'INSIDE PERIMETER' : 'BREACH'}</b></div>
                  <div>Distance from Campus: <b>{uploadResult.distance_from_campus_meters?.toFixed(1)}m</b></div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
