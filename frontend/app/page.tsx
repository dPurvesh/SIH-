'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  AlertTriangle,
  ShieldCheck,
  Building2,
  CheckCircle2,
  FileSearch,
  Camera,
  Layers,
  ArrowRight,
  Download,
  Search,
  ChevronDown,
  Flame,
  Sparkles,
  TrendingDown,
  Lock,
  Compass,
  PlusCircle,
  X,
  BarChart3,
  RefreshCw,
  ClipboardList,
  MapPin,
  Trash2,
  RotateCcw,
  Plus,
  Navigation
} from 'lucide-react';
import {
  Application,
  fetchApplications,
  getDeficiencyPdfUrl,
  SystemAnalytics,
  fetchSystemAnalytics,
  ChecklistResponse,
  fetchChecklist,
  createApplication,
  CreateApplicationPayload,
  resetColleges,
  reseedDemoColleges,
  searchColleges,
  geocodeCollege,
  CollegeDirectoryItem
} from './api';

export default function OverviewDashboard() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('ALL');

  // CHANGE 1: Live system analytics from DB
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // CHANGE 2: Dynamic checklist
  const [checklistCategory, setChecklistCategory] = useState<string>('EOA');
  const [checklist, setChecklist] = useState<ChecklistResponse | null>(null);
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [selectedNormCategory, setSelectedNormCategory] = useState<string>('ALL');

  // CHANGE 5: Create Application modal & National College Autocomplete
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createSuccess, setCreateSuccess] = useState<any>(null);
  const [createError, setCreateError] = useState<string>('');
  const [collegeSuggestions, setCollegeSuggestions] = useState<CollegeDirectoryItem[]>([]);
  const [isSearchingColleges, setIsSearchingColleges] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [autoFilledBadge, setAutoFilledBadge] = useState<string | null>(null);
  const [locationDetecting, setLocationDetecting] = useState(false);
  const [createForm, setCreateForm] = useState<CreateApplicationPayload>({
    institution_name: '',
    state: '',
    region: 'WRO',
    aicte_permanent_id: '',
    category: 'EoA',
    academic_year: '2026-27',
    submitted_intake: 300,
    claimed_land_area_sqm: 2500,
    claimed_survey_no: 'Plot 01/A',
    claimed_builtup_area_sqm: 4500,
    registered_lat: 18.5204,
    registered_lng: 73.8567,
    campus_radius_meters: 500,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchApplications();
      setApps(data);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const data = await fetchSystemAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Analytics fetch failed:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadChecklist = async (cat: string) => {
    try {
      setChecklistLoading(true);
      const data = await fetchChecklist(cat);
      setChecklist(data);
    } catch (err) {
      console.error('Checklist fetch failed:', err);
    } finally {
      setChecklistLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadAnalytics();
    loadChecklist('EOA');
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('register') === '1' || params.get('new') === '1') {
        setShowCreateModal(true);
      }
    }
  }, []);

  const handleChecklistCategoryChange = (cat: string) => {
    setChecklistCategory(cat);
    loadChecklist(cat);
  };

  const handleInstitutionNameChange = async (val: string) => {
    setCreateForm(f => ({ ...f, institution_name: val }));
    setAutoFilledBadge(null);
    if (val.trim().length >= 2) {
      setIsSearchingColleges(true);
      setShowSuggestions(true);
      const results = await searchColleges(val);
      setCollegeSuggestions(results);
      setIsSearchingColleges(false);
    } else {
      setCollegeSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectCollegeSuggestion = (college: CollegeDirectoryItem) => {
    setCreateForm(f => ({
      ...f,
      institution_name: college.name,
      aicte_permanent_id: college.aicte_permanent_id,
      state: college.state,
      region: college.region,
      registered_lat: college.lat,
      registered_lng: college.lng,
      campus_radius_meters: college.campus_radius_meters || 500,
      submitted_intake: college.suggested_intake || f.submitted_intake,
      claimed_land_area_sqm: college.suggested_land_area_sqm || f.claimed_land_area_sqm,
      claimed_survey_no: college.survey_no || f.claimed_survey_no,
    }));
    setShowSuggestions(false);
    setAutoFilledBadge(`Auto-populated official AICTE records & physical campus GPS for ${college.short_name || college.name}!`);
  };

  const handleAutoGeocode = async () => {
    if (!createForm.institution_name || createForm.institution_name.trim().length < 3) {
      alert('Please enter a college name first.');
      return;
    }
    try {
      setIsGeocoding(true);
      const data = await geocodeCollege(createForm.institution_name, createForm.state);
      if (data && data.status === 'success' && data.result) {
        setCreateForm(f => ({
          ...f,
          registered_lat: data.result.lat,
          registered_lng: data.result.lng,
          state: data.result.state || f.state,
          region: data.result.region || f.region,
        }));
        setAutoFilledBadge(`Physical campus GPS located: ${data.result.lat}, ${data.result.lng} (${data.source})`);
      } else {
        alert('Could not find physical location coordinates for this college. You can use "Detect My GPS" or enter coordinates manually.');
      }
    } catch (err: any) {
      alert(`Geocoding lookup failed: ${err.message}`);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleDetectGPS = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setLocationDetecting(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(6));
          const lng = Number(pos.coords.longitude.toFixed(6));
          setCreateForm(f => ({
            ...f,
            registered_lat: lat,
            registered_lng: lng,
          }));
          setLocationDetecting(false);
          setAutoFilledBadge(`Hardware GPS locked to current position: ${lat}, ${lng} (±${Math.round(pos.coords.accuracy)}m)`);
        },
        (err) => {
          setLocationDetecting(false);
          alert('GPS permission was denied or signal unavailable.');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');
    setCreateSuccess(null);
    try {
      const result = await createApplication(createForm);
      setCreateSuccess(result);
      await loadData();
      await loadAnalytics();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create application');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleResetColleges = async () => {
    if (!confirm('Are you sure you want to clear all colleges? This will wipe all sample dossiers so you can start completely clean with your own institution.')) return;
    try {
      setLoading(true);
      await resetColleges();
      await loadData();
      await loadAnalytics();
    } catch (err: any) {
      alert('Reset failed: ' + (err.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  const handleReseedDemo = async () => {
    try {
      setLoading(true);
      await reseedDemoColleges();
      await loadData();
      await loadAnalytics();
    } catch (err: any) {
      alert('Reseed failed: ' + (err.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      app.institution.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.institution.aicte_permanent_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.application_no.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || app.category === selectedCategory;
    const matchesRisk =
      selectedRiskFilter === 'ALL' ||
      (selectedRiskFilter === 'CLEAN' && app.overall_risk_score < 0.2) ||
      (selectedRiskFilter === 'DEFICIENT' && app.overall_risk_score >= 0.2);
    return matchesSearch && matchesCategory && matchesRisk;
  });

  const totalDossiers = apps.length;
  const cleanCount = apps.filter((a) => a.overall_risk_score < 0.2).length;
  const deficiencyCount = apps.filter((a) => a.overall_risk_score >= 0.2).length;
  const topFlaggedApp = apps.find((a) => a.flags && a.flags.length > 0);

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-16 animate-fade-in">
      
      {/* Hero Section (Exact Aetherfield Editorial Typography + Sky Atmosphere) */}
      <section className="text-center max-w-4xl mx-auto space-y-6 pt-4 sm:pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-slate-200/90 text-slate-700 text-xs font-medium backdrop-blur-xs shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
          <span className="font-mono text-[11px] tracking-wide uppercase">AICTE Regulation Bureau • Session 2026-27</span>
        </div>

        <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl text-slate-900 leading-[1.08] tracking-tight">
          Regulatory scrutiny, <br className="hidden sm:inline" />
          built for technical education
        </h1>

        <p className="font-editorial text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Validate institutional records, detect document tampering, and accelerate approval decisions—with clarity and statutory confidence.
        </p>

        {/* Action Buttons (Aetherfield signature black rect buttons with ▪ bullet) */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <Link
            href="/scrutiny"
            className="px-6 py-3 rounded-md bg-slate-900 hover:bg-black text-white text-sm font-medium tracking-normal transition-all shadow-sm flex items-center gap-2.5 cursor-pointer"
          >
            <span className="text-[10px] font-mono leading-none">▪</span>
            <span>Launch Scrutiny Studio</span>
          </Link>
          <Link
            href="/institution"
            className="px-6 py-3 rounded-md bg-white hover:bg-slate-50 text-slate-800 text-sm font-medium tracking-normal border border-slate-300 transition-all shadow-xs flex items-center gap-2.5 cursor-pointer"
          >
            <span className="text-[10px] font-mono leading-none text-slate-400">▪</span>
            <span>Nodal Institution Portal</span>
          </Link>
        </div>
      </section>

      {/* Main Elevated Feature Card */}
      <section className="saas-card p-6 sm:p-8 md:p-10 space-y-8">
        {/* Card Header Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              AICTE Regulation & Scrutiny Bureau
            </h2>
            <p className="font-editorial text-slate-600 text-base mt-0.5">
              {apps.length > 0
                ? `${apps.length} institutional approval dossiers and compliance metrics ready to review.`
                : 'No dossiers currently active. Register a new institution or upload documents to start scrutiny.'}
            </p>
          </div>
          <button
            onClick={loadData}
            className="self-start sm:self-auto px-4 py-2 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs border border-slate-200 transition-colors"
          >
            Refresh Data
          </button>
        </div>

        {/* 4 Metric Swatches / Blocks (Image 1 layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Swatch 1 with Canary Yellow Block */}
          <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block">
                Active Dossiers
              </span>
              <div className="text-3xl font-extrabold text-slate-900">
                {totalDossiers}
              </div>
              <span className="text-xs text-slate-500 block">
                Ingested in WORM Vault
              </span>
            </div>
            {/* Signature Canary Yellow Pill */}
            <div className="bg-[#EBF854] text-slate-900 font-mono font-bold text-[11px] px-2.5 py-3 rounded-lg flex flex-col items-center justify-center shrink-0 border border-yellow-300">
              <span>100%</span>
              <span className="text-[9px] font-normal text-slate-700">SYNCED</span>
            </div>
          </div>

          {/* Swatch 2: Forensic Health — Live from DB */}
          <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                Authority Pass Rate
              </span>
              <Compass size={16} className="text-slate-400" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {analyticsLoading ? '—' : `${analytics?.documents.authority_pass_rate_pct ?? 0}`}
              <span className="text-xl font-normal text-slate-500">%</span>
            </div>
            <div className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <span>{analyticsLoading ? '...' : `${analytics?.documents.authority_verified ?? 0} docs verified`}</span>
              <span className="text-slate-500 font-normal">via authority gateway</span>
            </div>
          </div>

          {/* Swatch 3: Clean Sign-Offs — Live from DB */}
          <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                CV Infra Pass Rate
              </span>
              <CheckCircle2 size={16} className="text-emerald-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {analyticsLoading ? '—' : `${analytics?.infrastructure.cv_pass_rate_pct ?? 100}`}
              <span className="text-xl font-normal text-slate-500">%</span>
            </div>
            <div className="text-xs text-slate-500">
              {analyticsLoading ? '...' : `${(analytics?.infrastructure.total_evidence ?? 0) - (analytics?.infrastructure.cv_failures ?? 0)} of ${analytics?.infrastructure.total_evidence ?? 0} photos pass`}
            </div>
          </div>

          {/* Swatch 4: Deficiencies — Live from DB */}
          <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                Pending HITL Review
              </span>
              <span className="bg-[#FEF08A] text-[#854D0E] text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono">
                Advisory
              </span>
            </div>
            <div className="text-3xl font-extrabold text-rose-600">
              {analyticsLoading ? '—' : analytics?.compliance_flags.pending_hitl ?? 0}
            </div>
            <div className="text-xs text-slate-500">
              {analyticsLoading ? '...' : `${analytics?.compliance_flags.critical ?? 0} critical flags unresolved`}
            </div>
          </div>

        </div>

        {/* Minimalist Visual Inspection Pipeline Chart */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>PIPELINE VERIFICATION STAGES</span>
            <span>APH CLAUSE 2024–27</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
            {[
              {
                stage: 'Ingestion & SHA256',
                status: `${analytics?.documents.total ?? 0} Ingested`,
                active: (analytics?.documents.total ?? 0) > 0
              },
              {
                stage: 'OpenCV ELA Forensics',
                status: `${analytics?.documents.tampered ?? 0} Tampered`,
                active: (analytics?.documents.total ?? 0) > 0
              },
              {
                stage: 'PyMuPDF Font Inspect',
                status: `${analytics?.documents.total ?? 0} Inspected`,
                active: (analytics?.documents.total ?? 0) > 0
              },
              {
                stage: 'Cross-Doc Entity Graph',
                status: `${analytics?.compliance_flags.critical ?? 0} Flagged`,
                active: (analytics?.compliance_flags.total ?? 0) > 0
              },
              {
                stage: 'Authority QR Gateway',
                status: `${analytics?.documents.authority_verified ?? 0} Verified`,
                active: (analytics?.documents.total ?? 0) > 0
              },
              {
                stage: 'YOLOv8 + CLIP Audit',
                status: `${analytics?.infrastructure.total_evidence ?? 0} Evidence`,
                active: (analytics?.infrastructure.total_evidence ?? 0) > 0
              },
            ].map((col, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-left space-y-1">
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      col.active ? 'bg-slate-900 w-full' : 'bg-slate-300 w-1/4'
                    }`}
                  />
                </div>
                <div className="text-[11px] font-semibold text-slate-800 truncate">{col.stage}</div>
                <div className="text-[10px] text-slate-500 font-mono">{col.status}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Numbered Feature Breakdown */}
      <section className="saas-card p-8 md:p-12 space-y-10">
        <div className="max-w-2xl">
          <h2 className="font-editorial text-3xl sm:text-4xl text-slate-900 tracking-tight leading-tight">
            Everything you need to validate, authenticate, and act on institutional compliance
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Visual Card with Forensic Telemetry Canvas */}
          <div className="lg:col-span-5 bg-slate-950 text-slate-100 rounded-2xl p-6 border border-slate-800 relative overflow-hidden min-h-[360px] flex flex-col justify-between shadow-xl">
            {/* Top Bar with Audit Icon & Clause Pill */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-slate-300">
                  Forensic Audit Terminal
                </span>
              </div>
              <span className="bg-slate-900 px-2.5 py-1 rounded-md text-[10px] font-mono text-indigo-300 border border-slate-800">
                CLAUSE 4.1.3 & 5.1
              </span>
            </div>

            {/* Central Holographic Telemetry Panel */}
            <div className="my-4 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">X.509 DSC Authority:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={11} /> Valid (CCA India)
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Error Level Analysis:</span>
                <span className="text-indigo-300 font-semibold">0.04% Clean Vector</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">YOLOv8 PC Terminals:</span>
                <span className="text-amber-300 font-semibold">Verified against APH</span>
              </div>
            </div>

            {/* Dynamic Forecast / Status Pill */}
            {topFlaggedApp ? (
              <div className="bg-slate-900 rounded-xl p-4 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono border border-amber-500/30 inline-block">
                    REGULATORY FLAG
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Priority Review</span>
                </div>
                <div className="text-xs sm:text-sm font-semibold text-white leading-snug">
                  <span className="text-indigo-300 font-bold">{topFlaggedApp.institution.name}</span>: {topFlaggedApp.flags[0]?.title || 'Multi-source discrepancy flagged'}
                </div>
                <Link
                  href={`/scrutiny?id=${topFlaggedApp.id}`}
                  className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 pt-1 transition-colors"
                >
                  <span>Inspect forensic evidence</span>
                  <span className="text-sm">→</span>
                </Link>
              </div>
            ) : (
              <div className="bg-slate-900 rounded-xl p-4 border border-emerald-500/30 space-y-2">
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono border border-emerald-500/30 inline-block">
                  SYSTEM STATUS
                </span>
                <div className="text-xs sm:text-sm font-semibold text-white leading-snug">
                  {apps.length === 0 ? 'Workspace clean: Register your institution to start' : 'All dossiers verified and compliant'}
                </div>
                <Link
                  href={apps.length === 0 ? '/institution' : '/scrutiny'}
                  className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 pt-1 transition-colors"
                >
                  <span>{apps.length === 0 ? 'Open Institution Portal' : 'Launch Scrutiny Studio'}</span>
                  <span className="text-sm">→</span>
                </Link>
              </div>
            )}
          </div>

          {/* Right Numbered List (Image 3 exact typography: 001 Track, 002 Model, etc.) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="divide-y divide-slate-100">
              
              <div className="py-4 flex items-start justify-between gap-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Pixel Forensics & Font Tampering</h3>
                  <p className="font-editorial text-slate-600 text-sm mt-0.5">
                    OpenCV JPEG recompression error level analysis + PyMuPDF XRef Producer inspection.
                  </p>
                </div>
                <span className="font-mono text-xs text-slate-400 font-semibold shrink-0">001</span>
              </div>

              <div className="py-4 flex items-start justify-between gap-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Cross-Document Entity Graph</h3>
                  <p className="font-editorial text-slate-600 text-sm mt-0.5">
                    Reconciliation of Land Area, Khasra Plot Numbers, and Approved Intake with historical records.
                  </p>
                </div>
                <span className="font-mono text-xs text-slate-400 font-semibold shrink-0">002</span>
              </div>

              <div className="py-4 flex items-start justify-between gap-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Direct Authority Gateway</h3>
                  <p className="font-editorial text-slate-600 text-sm mt-0.5">
                    Live 2D QR decoding against issuing state registries emitting the 6 standardized AICTE statuses.
                  </p>
                </div>
                <span className="font-mono text-xs text-slate-400 font-semibold shrink-0">003</span>
              </div>

              <div className="py-4 flex items-start justify-between gap-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Computer Vision & Geofencing</h3>
                  <p className="font-editorial text-slate-600 text-sm mt-0.5">
                    Ultralytics YOLOv8 PC terminal enumeration and CLIP 512-dim visual cosine deduplication.
                  </p>
                </div>
                <span className="font-mono text-xs text-slate-400 font-semibold shrink-0">004</span>
              </div>

              <div className="py-4 flex items-start justify-between gap-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Cryptographic Non-Repudiation</h3>
                  <p className="font-editorial text-slate-600 text-sm mt-0.5">
                    SHA-256 hash-chained immutable audit ledger and official ReportLab PDF notices.
                  </p>
                </div>
                <span className="font-mono text-xs text-slate-400 font-semibold shrink-0">005</span>
              </div>

            </div>

            <div className="pt-2">
              <Link
                href="/admin-governance"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-slate-900 hover:bg-black text-white text-xs font-medium tracking-normal transition-all shadow-xs"
              >
                <span className="text-[10px] font-mono leading-none">▪</span>
                <span>Configure APH Rules & View Audit Ledger</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Dossiers Queue (Image 4 "Careers at Aetherfield" stacked cards layout) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-editorial text-3xl sm:text-4xl text-slate-900 tracking-tight">
              Active Institutional Approval Dossiers
            </h2>
            <p className="font-editorial text-slate-600 text-base mt-1">
              Review pre-screened applications awaiting statutory verification and officer determination.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-medium transition-all shadow-xs cursor-pointer"
            >
              <Plus size={13} />
              <span>Register New Application</span>
            </button>
            <button
              onClick={handleResetColleges}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium transition-all cursor-pointer"
              title="Clear all sample colleges from the database"
            >
              <Trash2 size={13} />
              <span>Clear Sample Colleges</span>
            </button>
            <button
              onClick={handleReseedDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-medium transition-all cursor-pointer"
              title="Reload the 3 sample demo colleges"
            >
              <RotateCcw size={13} />
              <span>Load 3 Demo Scenarios</span>
            </button>
            <span className="text-xs font-mono text-slate-500 ml-1">
              SHOWING {filteredApps.length} OF {apps.length} DOSSIERS
            </span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by Institution, PID, or Application #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none w-full sm:w-44 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-xs text-slate-700 font-medium focus:outline-none focus:border-slate-400 transition-colors cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                <option value="EoA">Extension of Approval (EoA)</option>
                <option value="New Inst">New Institution</option>
                <option value="Increase in Intake">Increase in Intake</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative flex-1 sm:flex-initial">
              <select
                value={selectedRiskFilter}
                onChange={(e) => setSelectedRiskFilter(e.target.value)}
                className="appearance-none w-full sm:w-44 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-xs text-slate-700 font-medium focus:outline-none focus:border-slate-400 transition-colors cursor-pointer"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="CLEAN">Auto-Validated (Clean)</option>
                <option value="DEFICIENT">Deficiencies Flagged</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Stacked White Cards (Image 4 clean list design) */}
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const isClean = app.overall_risk_score < 0.2;
            const riskPct = Math.round(app.overall_risk_score * 100);

            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-300 hover:shadow-md transition-all"
              >
                {/* Left Institutional Details */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                      {app.institution.name}
                    </h3>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      PID: {app.institution.aicte_permanent_id}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                      {app.category}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-mono">
                    <span>APP #{app.application_no}</span>
                    <span>•</span>
                    <span>{app.institution.region} ({app.institution.state})</span>
                    <span>•</span>
                    <span>Intake: {app.submitted_intake}</span>
                    <span>•</span>
                    <span>Land: {app.claimed_land_area_sqm} sq.m ({app.claimed_survey_no})</span>
                  </div>

                  {/* Highlighted Flags */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {app.flags.slice(0, 2).map((flag) => (
                      <span
                        key={flag.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200"
                      >
                        <AlertTriangle size={12} className="text-rose-500 shrink-0" />
                        <span>{flag.title}</span>
                      </span>
                    ))}
                    {app.flags.length > 2 && (
                      <span className="text-xs text-slate-500 font-mono self-center">
                        +{app.flags.length - 2} more advisories
                      </span>
                    )}
                    {app.flags.length === 0 && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                        <span>All checks passed • Fast-Track EoA Cleared</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Action & Risk Index */}
                <div className="flex flex-row md:flex-col items-end justify-between gap-4 shrink-0 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                      Overall Risk Index
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xl font-bold font-mono ${isClean ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {riskPct}%
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${isClean ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                        {isClean ? 'CLEAN' : 'DEFICIENT'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/scrutiny?id=${app.id}`}
                      className="px-4 py-2 rounded-md bg-slate-900 hover:bg-black text-white text-xs font-medium tracking-normal transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Open Studio</span>
                      <span>→</span>
                    </Link>
                    <a
                      href={getDeficiencyPdfUrl(app.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-md bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors shadow-xs"
                      title="Download Official AICTE Notice PDF"
                    >
                      <Download size={15} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredApps.length === 0 && (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
                <Building2 size={28} />
              </div>
              <div className="space-y-1">
                <h3 className="font-editorial text-2xl font-bold text-slate-900">Workspace is Clean (0 Colleges)</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  All sample colleges have been removed. You can now register your own technical institution to test every verification engine from scratch!
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-slate-900 hover:bg-black text-white text-xs font-medium tracking-normal transition-all shadow-xs cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Register Your College Application</span>
                </button>
                <button
                  onClick={handleReseedDemo}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium tracking-normal transition-all cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Reload 3 Sample Demo Scenarios</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ================================================================= */}
      {/* Dynamic APH Statutory Checklist (category-driven from DB) */}
      <section className="saas-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList size={16} className="text-slate-500" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">APH 2024–27 Regulatory Checklist</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Statutory Document & Infrastructure Requirements</h2>
            <p className="text-sm text-slate-500 mt-0.5">Requirements are loaded live from the APH Rule Config database — no hardcoded arrays.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <label className="text-xs text-slate-500 font-medium font-mono uppercase">Category</label>
            <select
              value={checklistCategory}
              onChange={(e) => handleChecklistCategoryChange(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <option value="EOA">Extension of Approval (EoA)</option>
              <option value="NEW_INSTITUTE">New Institute</option>
              <option value="INTAKE_INCREASE">Intake Increase</option>
            </select>
          </div>
        </div>

        {checklistLoading ? (
          <div className="flex items-center gap-3 py-8 text-slate-400">
            <RefreshCw size={16} className="animate-spin" />
            <span className="text-sm">Loading checklist from regulatory database…</span>
          </div>
        ) : checklist ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Document Requirements */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">Document Requirements</h3>
                <span className="font-mono text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                  {checklist.total_mandatory_docs} mandatory · {checklist.total_optional_docs} optional
                </span>
              </div>
              <div className="space-y-2">
                {checklist.document_requirements.map((doc) => (
                  <div
                    key={doc.doc_type}
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50/70 border border-slate-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${doc.mandatory ? 'bg-rose-500' : 'bg-slate-300'}`} />
                      <span className="text-sm text-slate-800">{doc.label}</span>
                      {doc.mandatory && (
                        <span className="text-[9px] font-mono uppercase bg-rose-50 text-rose-600 border border-rose-100 px-1.5 py-0.5 rounded">Required</span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 text-right hidden sm:block">{doc.aph_clause}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Comprehensive Statutory APH Compliance Engine */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Statutory APH Compliance Catalog ({checklist.infrastructure_requirements.length} Norms Active)
                  </h3>
                  <p className="text-xs text-slate-400">Deterministic criteria enforced across OCR, PyMuPDF tables, CV & forensics</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  APH 2024–27
                </span>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {['ALL', 'Spatial & Land', 'Instructional Area', 'Academic Cadre', 'Safety & Legal', 'CV & Geofence', 'Forensic Integrity'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedNormCategory(cat)}
                    className={`px-2 py-0.5 text-[11px] rounded-lg font-medium transition-colors ${
                      selectedNormCategory === cat
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {checklist.infrastructure_requirements.length > 0 ? (
                <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                  {checklist.infrastructure_requirements
                    .filter((req) => selectedNormCategory === 'ALL' || req.category === selectedNormCategory)
                    .map((req) => (
                    <div
                      key={req.item}
                      className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50/80 hover:bg-slate-100/60 border border-slate-100 transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-800">{req.item}</span>
                        {req.category && (
                          <span className="text-[10px] text-slate-400 font-mono">{req.category}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-right">
                        <span className="text-xs font-semibold text-slate-900 font-mono">{req.value}</span>
                        <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 hidden sm:inline-block">
                          {req.aph_clause}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">No infrastructure config seeded yet — update APH rules in the Admin panel.</p>
              )}

              {/* Checklist Footer: DB rule metadata */}
              <div className="px-4 py-3 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 font-mono space-y-0.5">
                <div>Academic Year: <span className="text-slate-600">{checklist.academic_year}</span></div>
                {checklist.rule_last_updated && (
                  <div>Last Updated: <span className="text-slate-600">{new Date(checklist.rule_last_updated).toLocaleDateString('en-IN')}</span></div>
                )}
                <div>Authority: <span className="text-slate-600">{checklist.rule_updated_by}</span></div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">Failed to load checklist. Check backend connectivity.</p>
        )}
      </section>

      {/* ================================================================= */}
      {/* CHANGE 5: Create New Application CTA */}
      {/* ================================================================= */}
      <section className="flex items-center justify-between bg-slate-900 rounded-3xl px-8 py-6 text-white">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-wider text-slate-400 mb-1">Institution Portal</div>
          <h2 className="text-xl font-bold">Submit a New Application Dossier</h2>
          <p className="text-slate-400 text-sm mt-1">Create a new institution record and EoA dossier — all persisted in the live database.</p>
        </div>
        <button
          onClick={() => { setShowCreateModal(true); setCreateSuccess(null); setCreateError(''); }}
          className="flex items-center gap-2 px-5 py-3 bg-[#EBF854] hover:bg-yellow-300 text-slate-900 rounded-xl font-semibold text-sm transition-all shadow-md shrink-0"
        >
          <PlusCircle size={16} />
          <span>New Dossier</span>
        </button>
      </section>

    {/* ================================================================= */}
    {/* Create Application Modal */}
    {/* ================================================================= */}
    {showCreateModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">New Application Dossier</h2>
                <p className="text-sm text-slate-500 mt-0.5">Institution & EoA details — persisted via POST /api/applications/create</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {createSuccess ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800">
                  <div className="font-semibold text-base mb-1">✓ Dossier Created Successfully</div>
                  <div className="text-sm space-y-1 font-mono">
                    <div>Application No: <strong>{createSuccess.application_no}</strong></div>
                    <div>Institution: {createSuccess.institution_name}</div>
                    <div>AICTE ID: {createSuccess.aicte_permanent_id}</div>
                    <div>App ID: #{createSuccess.application_id}</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link
                    href={`/scrutiny?id=${createSuccess.application_id}`}
                    className="flex-1 text-center py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-black transition-colors"
                  >
                    Open in Scrutiny Studio →
                  </Link>
                  <button
                    onClick={() => { setCreateSuccess(null); setCreateForm({ institution_name: '', state: '', region: 'WRO', category: 'EoA', academic_year: '2026-27', submitted_intake: 300, claimed_land_area_sqm: 2500, claimed_survey_no: 'Plot 01/A', claimed_builtup_area_sqm: 4500, registered_lat: 18.5204, registered_lng: 73.8567, campus_radius_meters: 500 }); }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
                  >
                    New Dossier
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit} className="space-y-5">
                {/* Auto-fill notification badge */}
                {autoFilledBadge && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-medium animate-fade-in">
                    <Sparkles size={15} className="text-emerald-600 shrink-0" />
                    <span className="flex-1">{autoFilledBadge}</span>
                    <button
                      type="button"
                      onClick={() => setAutoFilledBadge(null)}
                      className="text-emerald-600 hover:text-emerald-900"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Institution Name with Intelligent Autocomplete */}
                  <div className="sm:col-span-2 space-y-1.5 relative">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                        <Building2 size={13} className="text-slate-500" />
                        <span>Institution Name *</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">Type "GCOE", "COEP", "IIT", etc.</span>
                        <button
                          type="button"
                          onClick={handleAutoGeocode}
                          disabled={isGeocoding}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-medium transition-colors cursor-pointer"
                          title="Search physical coordinates across all institutions in India"
                        >
                          <Search size={11} />
                          <span>{isGeocoding ? 'Locating...' : 'Lookup GPS'}</span>
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        required
                        type="text"
                        placeholder="Type to search all colleges in India (e.g. GCOE Karad, VJTI, COEP, IIT)..."
                        value={createForm.institution_name}
                        onChange={(e) => handleInstitutionNameChange(e.target.value)}
                        onFocus={() => { if (collegeSuggestions.length > 0) setShowSuggestions(true); }}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 font-medium transition-all"
                      />
                      {isSearchingColleges && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                          <RefreshCw size={14} className="animate-spin text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* Live College Autocomplete Suggestions Dropdown */}
                    {showSuggestions && collegeSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl shadow-xl border border-slate-200 max-h-72 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                        <div className="px-3.5 py-1.5 bg-slate-50 text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center justify-between">
                          <span>AICTE National Master Directory ({collegeSuggestions.length} Matches)</span>
                          <span className="text-slate-400">Click to autofill GPS & details</span>
                        </div>
                        {collegeSuggestions.map((col, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectCollegeSuggestion(col)}
                            className="w-full text-left p-3 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3 group"
                          >
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                                  {col.name}
                                </span>
                                {col.short_name && (
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] font-semibold shrink-0">
                                    {col.short_name}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                                <span className="font-mono text-slate-700 font-medium">PID: {col.aicte_permanent_id}</span>
                                <span>•</span>
                                <span>{col.district ? `${col.district}, ` : ''}{col.state}</span>
                                <span>•</span>
                                <span className="text-indigo-600 font-mono font-medium">
                                  📍 {col.lat.toFixed(4)}, {col.lng.toFixed(4)}
                                </span>
                              </div>
                            </div>
                            <span className="px-2 py-1 rounded bg-slate-100 group-hover:bg-slate-900 group-hover:text-white text-slate-700 text-[10px] font-mono font-semibold transition-colors shrink-0">
                              {col.region}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* AICTE Permanent ID */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">AICTE Permanent ID (PID)</label>
                    <input
                      type="text"
                      placeholder="e.g. 1-42981023"
                      value={createForm.aicte_permanent_id || ''}
                      onChange={(e) => setCreateForm(f => ({ ...f, aicte_permanent_id: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </div>

                  {/* State */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">State *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Maharashtra"
                      value={createForm.state}
                      onChange={(e) => setCreateForm(f => ({ ...f, state: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </div>

                  {/* Region */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">AICTE Region</label>
                    <select
                      value={createForm.region}
                      onChange={(e) => setCreateForm(f => ({ ...f, region: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    >
                      <option value="WRO">WRO — Western (Mumbai)</option>
                      <option value="NRO">NRO — Northern (Kanpur)</option>
                      <option value="SRO">SRO — Southern (Chennai)</option>
                      <option value="SWRO">SWRO — South-Western (Bangalore)</option>
                      <option value="SCRO">SCRO — South-Central (Hyderabad)</option>
                      <option value="ERO">ERO — Eastern (Kolkata)</option>
                      <option value="NWRO">NWRO — North-West (Chandigarh)</option>
                      <option value="CRO">CRO — Central (Bhopal)</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Application Category</label>
                    <select
                      value={createForm.category}
                      onChange={(e) => setCreateForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    >
                      <option value="EoA">Extension of Approval (EoA)</option>
                      <option value="NEW_INSTITUTE">New Institute</option>
                      <option value="INTAKE_INCREASE">Intake Increase</option>
                    </select>
                  </div>

                  {/* Academic Year */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Academic Year</label>
                    <input
                      type="text"
                      value={createForm.academic_year}
                      onChange={(e) => setCreateForm(f => ({ ...f, academic_year: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </div>

                  {/* Intake */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Student Intake</label>
                    <input
                      type="number"
                      min={30}
                      max={2000}
                      value={createForm.submitted_intake}
                      onChange={(e) => setCreateForm(f => ({ ...f, submitted_intake: Number(e.target.value) }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </div>

                  {/* Land Area */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Claimed Land Area (sq.m)</label>
                    <input
                      type="number"
                      min={100}
                      value={createForm.claimed_land_area_sqm}
                      onChange={(e) => setCreateForm(f => ({ ...f, claimed_land_area_sqm: Number(e.target.value) }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </div>

                  {/* Survey No */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Survey / Plot Number</label>
                    <input
                      type="text"
                      value={createForm.claimed_survey_no}
                      onChange={(e) => setCreateForm(f => ({ ...f, claimed_survey_no: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </div>

                  {/* GPS Header with Auto-Detect Button */}
                  <div className="sm:col-span-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      <MapPin size={13} className="text-rose-500" />
                      <span>Campus GPS Coordinates (Auto-Filled)</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleDetectGPS}
                      disabled={locationDetecting}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                      title="Fetch current device GPS coordinates"
                    >
                      <Navigation size={12} className={locationDetecting ? 'animate-spin' : ''} />
                      <span>{locationDetecting ? 'Detecting...' : '🎯 Detect My GPS Location'}</span>
                    </button>
                  </div>

                  {/* GPS Lat */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Campus Latitude</label>
                    <input
                      type="number"
                      step={0.000001}
                      value={createForm.registered_lat}
                      onChange={(e) => setCreateForm(f => ({ ...f, registered_lat: Number(e.target.value) }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </div>

                  {/* GPS Lng */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Campus Longitude</label>
                    <input
                      type="number"
                      step={0.000001}
                      value={createForm.registered_lng}
                      onChange={(e) => setCreateForm(f => ({ ...f, registered_lng: Number(e.target.value) }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </div>

                  {/* Radius */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Geofence Radius (meters)</label>
                    <input
                      type="number"
                      min={100}
                      max={5000}
                      value={createForm.campus_radius_meters}
                      onChange={(e) => setCreateForm(f => ({ ...f, campus_radius_meters: Number(e.target.value) }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </div>
                </div>

                {createError && (
                  <div className="px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">{createError}</div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {createLoading ? (
                      <><RefreshCw size={14} className="animate-spin" /><span>Creating…</span></>
                    ) : (
                      <><PlusCircle size={14} /><span>Create Dossier</span></>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    )}

    </div>
  );
}
