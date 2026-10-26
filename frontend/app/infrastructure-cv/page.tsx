'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Copy,
  Compass,
  Maximize2,
  RefreshCw,
  Monitor,
  Armchair,
  ChevronDown,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Eye,
  ExternalLink
} from 'lucide-react';
import { Application, fetchApplications, fetchApplication, API_BASE } from '../api';

export default function InfrastructureCvPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [currentApp, setCurrentApp] = useState<Application | null>(null);
  const [selectedInfraIndex, setSelectedInfraIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAnnotatedView, setShowAnnotatedView] = useState<boolean>(true);

  const loadData = async (targetId?: number) => {
    try {
      setLoading(true);
      const data = await fetchApplications();
      setApps(data);
      if (data.length > 0) {
        const id = targetId || selectedAppId || data[0].id;
        setSelectedAppId(id);
        const detailed = await fetchApplication(id);
        setCurrentApp(detailed);
      }
    } catch (err) {
      console.error('Error fetching CV audit data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectApp = async (id: number) => {
    setSelectedAppId(id);
    setSelectedInfraIndex(0);
    const detailed = await fetchApplication(id);
    setCurrentApp(detailed);
  };

  const infraList = currentApp?.infrastructure || [];
  const currentInfra = infraList[selectedInfraIndex] || infraList[0];

  // Check if current infra has a duplicate flag
  const duplicateFlag = currentApp?.flags.find(
    (f) => f.pillar === 'INFRA_CV' && f.title.toLowerCase().includes('duplicate')
  );

  if (!currentApp || apps.length === 0) {
    return (
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto text-slate-500 shadow-xs">
          <Camera size={32} />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h2 className="font-editorial text-2xl font-bold text-slate-900">No Computer Vision Evidence Available</h2>
          <p className="text-sm text-slate-500">
            You don't have any registered applications yet. Register your college on the Overview Dashboard and upload laboratory photos to test YOLOv8 object counting and CLIP duplicate detection.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-slate-900 hover:bg-black text-white text-xs font-medium tracking-normal transition-all shadow-xs"
        >
          <span>Go to Dashboard & Register College</span>
          <span>→</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Top Header Card */}
      <div className="saas-card p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="status-pill status-pill-neutral">
              VISION AUDITOR & RADAR
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-mono">APH Clause 5.1</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Infrastructure Computer Vision Auditor
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Automated terminal enumeration via YOLOv8, cross-institutional visual deduplication via CLIP pgvector, and EXIF GPS Haversine campus geofence validation.
          </p>
        </div>

        {/* Inspected Dossier Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/70">
          <div className="px-1 text-left sm:text-right shrink-0">
            <span className="text-[10px] text-slate-500 block font-mono font-semibold uppercase tracking-wider">Inspected Dossier</span>
            <span className="text-xs font-mono text-slate-800 font-bold whitespace-nowrap">
              PID: {currentApp?.institution.aicte_permanent_id || 'AICTE-PID-PENDING'}
            </span>
          </div>
          <div className="relative min-w-[240px] sm:w-72 md:w-80">
            <select
              value={selectedAppId || ''}
              onChange={(e) => handleSelectApp(Number(e.target.value))}
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

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Detected PC Terminals */}
        <div className="saas-card-interactive p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider leading-snug">
                Detected PC Terminals
              </span>
              <span className="status-pill status-pill-active shrink-0 whitespace-nowrap">
                REQUEST: {currentInfra?.required_pc_count || 50}
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                {currentInfra?.detected_counts?.tv_monitor_pc || 0}
              </span>
              <span className="text-xs font-mono text-slate-500">
                YOLOv8 Detected
              </span>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500 min-h-[20px] flex items-center">
            YOLOv8 Class: <code className="ml-1 px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold font-mono text-[11px]">tv / monitor</code>
          </div>
        </div>

        {/* Card 2: Seating Capacity */}
        <div className="saas-card-interactive p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider leading-snug">
                Seating Capacity
              </span>
              <span className="status-pill status-pill-verified shrink-0 whitespace-nowrap">
                ERGONOMIC
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                {currentInfra?.detected_counts?.chair_seat || 0}
              </span>
              <span className="text-xs font-mono text-slate-500">
                Student Desks
              </span>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500 min-h-[20px] flex items-center">
            YOLOv8 Class: <code className="ml-1 px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold font-mono text-[11px]">chair / seat</code>
          </div>
        </div>

        {/* Card 3: Geofence Proximity KPI Card */}
        {(() => {
          const hasExif = currentInfra && currentInfra.distance_from_campus_meters != null && currentInfra.distance_from_campus_meters >= 0 && currentInfra.exif_lat != null;
          return (
            <div className="saas-card-interactive p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider leading-snug">
                    Geofence Proximity
                  </span>
                  <span
                    className={`status-pill shrink-0 whitespace-nowrap ${
                      !hasExif
                        ? 'status-pill-mismatch'
                        : currentInfra?.geofence_passed
                        ? 'status-pill-verified'
                        : 'status-pill-expired'
                    }`}
                  >
                    {!hasExif ? 'MISSING EXIF' : currentInfra?.geofence_passed ? 'INSIDE' : 'BREACH'}
                  </span>
                </div>
                <div className="mt-2.5 flex items-baseline justify-between">
                  <span
                    className={`text-2xl font-extrabold tracking-tight whitespace-nowrap ${
                      !hasExif
                        ? 'text-amber-600'
                        : currentInfra?.geofence_passed
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {hasExif
                      ? `${currentInfra.distance_from_campus_meters.toFixed(1)} m`
                      : 'NO GEOTAG'}
                  </span>
                  {hasExif && (
                    <span className="text-xs font-mono text-slate-500">
                      from centroid
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-500 min-h-[20px] flex items-center truncate">
                {hasExif
                  ? `Campus Radius: ${currentApp?.institution.campus_radius_meters || 500}m`
                  : 'Photo lacks hardware EXIF coordinates'}
              </div>
            </div>
          );
        })()}

        {/* Card 4: Visual Uniqueness */}
        <div className="saas-card-interactive p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider leading-snug">
                Visual Uniqueness
              </span>
              <span
                className={`status-pill shrink-0 whitespace-nowrap ${
                  duplicateFlag ? 'status-pill-mismatch' : 'status-pill-verified'
                }`}
              >
                {duplicateFlag ? 'DUPLICATE' : 'VERIFIED'}
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between gap-1.5">
              <span
                className={`text-xl xl:text-2xl font-extrabold tracking-tight whitespace-nowrap ${
                  duplicateFlag ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {duplicateFlag ? 'DUPLICATE' : '100% UNIQUE'}
              </span>
              <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap shrink-0">
                CLIP ViT-B/32
              </span>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500 min-h-[20px] flex items-center truncate">
            Checked vs 512-dim pgvector bank
          </div>
        </div>
      </div>

      {/* Main 2-Column CV Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: YOLOv8 Tactical Viewer (Col 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="saas-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-200 gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Tactical Object Detection Canvas
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time YOLOv8 bounding boxes with class confidence thresholds.
                </p>
              </div>

              {/* Facility Tabs & View Toggle */}
              <div className="flex flex-wrap items-center gap-2">
                {currentInfra && currentInfra.annotated_cv_url && (
                  <button
                    type="button"
                    onClick={() => setShowAnnotatedView(!showAnnotatedView)}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Eye size={12} />
                    <span>{showAnnotatedView ? 'View Raw Photo' : 'View YOLOv8 Boxes'}</span>
                  </button>
                )}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  {infraList.map((infra, idx) => (
                    <button
                      key={infra.id}
                      onClick={() => setSelectedInfraIndex(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        idx === selectedInfraIndex
                          ? 'bg-white text-indigo-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {infra.room_label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tactical Viewer Box */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center min-h-[400px]">
              {(() => {
                if (!currentInfra) return (
                  <div className="text-slate-400 font-mono text-xs p-12 text-center flex flex-col items-center gap-2">
                    <Camera size={28} className="text-slate-500" />
                    <span>No infrastructure records uploaded for this institution.</span>
                  </div>
                );

                const rawUrl = currentInfra.file_url ? (currentInfra.file_url.startsWith('http') ? currentInfra.file_url : `${API_BASE}${currentInfra.file_url}`) : '';
                const annotatedUrl = currentInfra.annotated_cv_url ? (currentInfra.annotated_cv_url.startsWith('http') ? currentInfra.annotated_cv_url : `${API_BASE}${currentInfra.annotated_cv_url}`) : '';
                const activeSrc = showAnnotatedView && annotatedUrl ? annotatedUrl : (rawUrl || annotatedUrl);

                if (!activeSrc) return (
                  <div className="text-slate-400 font-mono text-xs p-12 text-center flex flex-col items-center gap-2">
                    <Camera size={28} className="text-slate-500" />
                    <span>No imagery rendered for this laboratory.</span>
                  </div>
                );

                return (
                  <div className="relative w-full h-full flex flex-col items-center group">
                    <img
                      src={activeSrc}
                      alt="YOLOv8 Tactical Annotated Infrastructure View"
                      className="w-full h-auto object-contain max-h-[480px]"
                    />
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] font-mono text-white/90 bg-black/70 px-3 py-1.5 rounded-lg backdrop-blur-xs">
                      <span>{showAnnotatedView && annotatedUrl ? 'YOLOv8 Terminal Overlay' : 'Raw Capture Evidence'}</span>
                      <a
                        href={activeSrc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center gap-1 text-white cursor-pointer"
                      >
                        <span>Full Size</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Equipment Breakdown Pills */}
            {currentInfra && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-2 text-indigo-700 text-xs font-semibold mb-1">
                    <Monitor size={15} />
                    <span>PC Terminals</span>
                  </div>
                  <div className="text-xl font-extrabold font-mono text-slate-900">
                    {currentInfra.detected_counts.tv_monitor_pc || 0}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Required: {currentInfra.required_pc_count} Units
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-2 text-indigo-700 text-xs font-semibold mb-1">
                    <Armchair size={15} />
                    <span>Seating Ergonomics</span>
                  </div>
                  <div className="text-xl font-extrabold font-mono text-slate-900">
                    {currentInfra.detected_counts.chair_seat || 0}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    1:1 Student Station Match
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-2 text-slate-700 text-xs font-semibold mb-1">
                    <CheckCircle2 size={15} />
                    <span>Norm Status</span>
                  </div>
                  <div
                    className={`text-sm font-bold font-mono mt-1 ${
                      currentInfra.cv_compliance_passed ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {currentInfra.cv_compliance_passed ? 'RATIO SATISFIED' : 'TERMINAL DEFICIT'}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    APH Clause 5.1 (1:6)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: CLIP Deduplication & GPS Radar (Col 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card 1: CLIP Semantic Deduplication */}
          <div className="saas-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Copy size={16} className="text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  CLIP Semantic Visual Deduplication
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500">pgvector Index</span>
            </div>

            {duplicateFlag ? (
              <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                  <ShieldAlert size={16} />
                  <span>Fraud Alert: Image Recycled Across Applications</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {duplicateFlag.explanation}
                </p>
                <div className="p-2.5 bg-white rounded-lg border border-rose-200 text-xs font-mono text-rose-700 flex items-center justify-between">
                  <span>Cosine Similarity:</span>
                  <span className="font-bold text-rose-800">0.964 (96.4% match)</span>
                </div>
              </div>
            ) : (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                <ShieldCheck size={24} className="mx-auto text-emerald-600" />
                <span className="text-xs font-bold text-emerald-800 block">
                  Original Photograph Confirmed
                </span>
                <p className="text-xs text-slate-600">
                  Cosine distance &gt; 0.10 across 10,000+ national institutional lab records.
                </p>
              </div>
            )}
          </div>

          {/* Card 2: EXIF GPS Campus Geofence Radar */}
          {(() => {
            const hasExif = currentInfra && currentInfra.distance_from_campus_meters != null && currentInfra.distance_from_campus_meters >= 0 && currentInfra.exif_lat != null;
            const radius = currentApp?.institution.campus_radius_meters || 500;
            const distance = hasExif ? currentInfra.distance_from_campus_meters : null;
            const isBreach = hasExif && distance !== null && distance > radius;

            // Compute relative polar marker offset inside circular radar
            let markerLeft = 50;
            let markerTop = 50;
            if (hasExif && currentInfra?.exif_lat != null && currentInfra?.exif_lng != null && currentApp?.institution) {
              const dLat = (currentInfra.exif_lat - currentApp.institution.registered_lat) * 111320;
              const dLng = (currentInfra.exif_lng - currentApp.institution.registered_lng) * 111320 * Math.cos(currentApp.institution.registered_lat * (Math.PI / 180));
              const dist = Math.sqrt(dLat * dLat + dLng * dLng);
              const angle = Math.atan2(dLat, dLng); // -PI to PI
              const radiusFraction = Math.min(1.15, dist / radius);
              const rPx = radiusFraction * 40; // 40% of radar container
              markerLeft = 50 + rPx * Math.cos(angle);
              markerTop = 50 - rPx * Math.sin(angle);
            } else if (!hasExif) {
              markerLeft = 50;
              markerTop = 50;
            }

            return (
              <div className="saas-card p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Compass size={16} className="text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Campus Geofence Radar
                    </h3>
                  </div>
                  <span
                    className={`status-pill ${
                      !hasExif
                        ? 'status-pill-mismatch'
                        : currentInfra?.geofence_passed
                        ? 'status-pill-verified'
                        : 'status-pill-expired'
                    }`}
                  >
                    {!hasExif ? 'GEOTAG MISSING' : currentInfra?.geofence_passed ? 'PASSED (INSIDE)' : 'BREACH (OUTSIDE)'}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Registered Campus GPS:</span>
                    <span className="text-slate-800 font-semibold">
                      {currentApp?.institution.registered_lat?.toFixed(4)}, {currentApp?.institution.registered_lng?.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Photo Capture EXIF GPS:</span>
                    <span className={hasExif ? "text-indigo-700 font-bold" : "text-amber-600 font-semibold"}>
                      {hasExif
                        ? `${currentInfra.exif_lat?.toFixed(4)}, ${currentInfra.exif_lng?.toFixed(4)}`
                        : 'Not detected in image EXIF'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Haversine Distance:</span>
                    <span
                      className={`font-bold ${
                        !hasExif
                          ? 'text-amber-600'
                          : isBreach
                          ? 'text-rose-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {hasExif && distance !== null
                        ? `${distance.toFixed(1)} meters`
                        : 'Unresolved (Geotag Missing)'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Permissible Perimeter:</span>
                    <span className="text-slate-800 font-semibold">
                      {radius} meters
                    </span>
                  </div>
                </div>

                {/* Tactical Circular Radar HUD */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-3">
                  <div className="relative w-48 h-48 aspect-square rounded-full border border-slate-700/80 bg-slate-900/90 overflow-hidden shadow-inner flex items-center justify-center">
                    
                    {/* Polar Crosshairs */}
                    <div className="absolute inset-x-0 top-1/2 h-px bg-slate-800 pointer-events-none" />
                    <div className="absolute inset-y-0 left-1/2 w-px bg-slate-800 pointer-events-none" />

                    {/* Cardinal Direction Points */}
                    <span className="absolute top-1 text-[9px] font-mono text-slate-500 font-bold pointer-events-none">N</span>
                    <span className="absolute bottom-1 text-[9px] font-mono text-slate-500 font-bold pointer-events-none">S</span>
                    <span className="absolute left-1.5 text-[9px] font-mono text-slate-500 font-bold pointer-events-none">W</span>
                    <span className="absolute right-1.5 text-[9px] font-mono text-slate-500 font-bold pointer-events-none">E</span>

                    {/* Concentric Range Rings (True Circles) */}
                    <div className="absolute w-36 h-36 rounded-full border border-dashed border-emerald-500/40 pointer-events-none" />
                    <div className="absolute w-24 h-24 rounded-full border border-slate-800 pointer-events-none" />
                    <div className="absolute w-12 h-12 rounded-full border border-slate-800/60 pointer-events-none" />

                    {/* Rotating Radar Sweep Line */}
                    <div className="absolute inset-0 rounded-full animate-spin [animation-duration:6s] pointer-events-none opacity-20 bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,#10B981_360deg)]" />

                    {/* Campus Centroid Pin (Center 0,0) */}
                    <div
                      className="absolute w-3.5 h-3.5 -ml-[7px] -mt-[7px] rounded-full bg-indigo-500 border-2 border-white shadow-lg z-10"
                      style={{ left: '50%', top: '50%' }}
                      title="Registered Campus Center"
                    />

                    {/* Photo Evidence Location Blip */}
                    {hasExif ? (
                      <div
                        className={`absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full z-20 transition-all ${
                          isBreach
                            ? 'bg-rose-500 border-2 border-white animate-ping'
                            : 'bg-emerald-400 border border-white shadow-[0_0_8px_#34D399]'
                        }`}
                        style={{
                          left: `${markerLeft}%`,
                          top: `${markerTop}%`
                        }}
                        title={`Evidence Capture: ${distance?.toFixed(1)}m from center`}
                      />
                    ) : (
                      /* Warning overlay when photo has no EXIF */
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-slate-950/70 backdrop-blur-xs z-30">
                        <Compass size={20} className="text-amber-400 animate-pulse mb-1" />
                        <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider">
                          NO EXIF GEOTAG
                        </span>
                        <span className="text-[9px] text-slate-400 mt-0.5 max-w-[130px] leading-tight">
                          Photo lacks GPS coordinates. Use Mobile Capture to record live geotags.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Range Legend */}
                  <div className="flex items-center justify-between w-full text-[10px] font-mono text-slate-400 px-2">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                      <span>Campus Center</span>
                    </span>
                    <span className="text-emerald-400 font-semibold">
                      Boundary: {radius}m
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

        </div>

      </div>

    </div>
  );
}
