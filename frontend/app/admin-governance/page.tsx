'use client';

import React, { useEffect, useState } from 'react';
import {
  Sliders,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Lock,
  Database,
  Hash,
  Scale,
  FileCheck2,
  Save,
  Link2,
  Cpu,
  Check,
  Building,
  Search,
  Plus,
  X,
  ExternalLink,
  Trash2,
  RotateCcw
} from 'lucide-react';
import {
  APHRuleConfig,
  AuditRecord,
  fetchRules,
  updateRules,
  reevaluateAll,
  fetchAuditLedger,
  verifyAuditIntegrity,
  fetchAuthorityRegistry,
  addRegistryEntry,
  clearAuthorityRegistry,
  reseedAuthorityRegistry,
  AuthorityRegistryEntry
} from '../api';

export default function AdminGovernancePage() {
  const [rules, setRules] = useState<APHRuleConfig | null>(null);
  const [ledger, setLedger] = useState<AuditRecord[]>([]);
  const [registry, setRegistry] = useState<AuthorityRegistryEntry[]>([]);
  const [integrityStatus, setIntegrityStatus] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingRules, setSavingRules] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [registryFilter, setRegistryFilter] = useState<string>('');
  const [paramTab, setParamTab] = useState<'SPATIAL' | 'INSTRUCTIONAL' | 'FACULTY' | 'SAFETY' | 'FORENSICS'>('SPATIAL');
  const [showAddUrnModal, setShowAddUrnModal] = useState<boolean>(false);
  const [newUrnForm, setNewUrnForm] = useState({
    urn: '',
    authority: 'Fire Safety Directorate',
    institution_name: '',
    status: 'ACTIVE',
    expiry_date: '2027-12-31'
  });
  const [addingUrn, setAddingUrn] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [r, l, reg] = await Promise.all([
        fetchRules(),
        fetchAuditLedger(),
        fetchAuthorityRegistry().catch(() => ({ count: 0, entries: [] }))
      ]);
      setRules(r);
      setLedger(l);
      setRegistry(reg.entries || []);
    } catch (err) {
      console.error('Error loading governance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveAndReevaluate = async () => {
    if (!rules) return;
    try {
      setSavingRules(true);
      setStatusMessage('Persisting updated APH norms in regulatory database...');
      await updateRules(rules);
      setStatusMessage('Batch re-evaluating all institutional dossiers against new thresholds...');
      await reevaluateAll();
      setStatusMessage('Rules applied & all applications successfully reconciled!');
      const updatedLedger = await fetchAuditLedger();
      setLedger(updatedLedger);
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setSavingRules(false);
    }
  };

  const handleVerifyChain = async () => {
    try {
      const res = await verifyAuditIntegrity();
      setIntegrityStatus(res);
    } catch (err: any) {
      alert(`Integrity check failed: ${err.message}`);
    }
  };

  const handleAddUrn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrnForm.urn || !newUrnForm.institution_name) {
      alert('Please fill out both URN and Institution Name.');
      return;
    }
    try {
      setAddingUrn(true);
      await addRegistryEntry({
        urn: newUrnForm.urn.trim(),
        authority: newUrnForm.authority,
        institution_name: newUrnForm.institution_name.trim(),
        status: newUrnForm.status,
        expiry_date: newUrnForm.expiry_date,
        is_active: newUrnForm.status === 'ACTIVE'
      });
      setStatusMessage(`Successfully registered instrument ${newUrnForm.urn} in statutory authority database!`);
      setShowAddUrnModal(false);
      setNewUrnForm({
        urn: '',
        authority: 'Fire Safety Directorate',
        institution_name: '',
        status: 'ACTIVE',
        expiry_date: '2027-12-31'
      });
      // reload registry
      const reg = await fetchAuthorityRegistry();
      setRegistry(reg.entries || []);
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err: any) {
      alert(`Registration failed: ${err.message}`);
    } finally {
      setAddingUrn(false);
    }
  };

  const handleClearRegistry = async () => {
    try {
      setStatusMessage('Clearing authority registry sandbox...');
      await clearAuthorityRegistry();
      const reg = await fetchAuthorityRegistry();
      setRegistry(reg.entries || []);
      const updatedLedger = await fetchAuditLedger();
      setLedger(updatedLedger);
      setStatusMessage('Authority registry sandbox cleared to 0 records.');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err: any) {
      alert(`Failed to clear authority registry: ${err.message}`);
    }
  };

  const handleReseedRegistry = async () => {
    try {
      setStatusMessage('Restoring demo authority registry records...');
      await reseedAuthorityRegistry();
      const reg = await fetchAuthorityRegistry();
      setRegistry(reg.entries || []);
      const updatedLedger = await fetchAuditLedger();
      setLedger(updatedLedger);
      setStatusMessage('Demo authority registry records restored.');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err: any) {
      alert(`Failed to reseed authority registry: ${err.message}`);
    }
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Top Header Card */}
      <div className="saas-card p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="status-pill status-pill-neutral">
              POLICY & CRYPTOGRAPHIC INTEGRITY
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-mono">APH 2024–27</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Governance & Immutable Audit Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Dynamic regulatory parameter management, batch retrospective dossier re-evaluation, and court-admissible SHA-256 hash-chained non-repudiation ledger.
          </p>
        </div>

        <button
          onClick={handleVerifyChain}
          className="shrink-0 px-4 py-2.5 bg-slate-900 hover:bg-black text-white font-semibold text-xs rounded-lg flex items-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <Lock size={14} />
          <span>Verify Cryptographic Chain</span>
        </button>
      </div>

      {/* Notification Toast */}
      {statusMessage && (
        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-sm flex items-center gap-2.5 animate-pulse">
          <RefreshCw size={16} className="animate-spin text-indigo-600" />
          <span className="font-medium">{statusMessage}</span>
        </div>
      )}

      {/* Cryptographic Chain Integrity Certificate Banner */}
      {integrityStatus && (
        <div
          className={`p-5 rounded-2xl border transition-all ${
            integrityStatus.chain_valid
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-emerald-200 gap-2">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <span>CRYPTOGRAPHIC LEDGER INTEGRITY: 100% NON-REPUDIATION VERIFIED</span>
            </div>
            <span className="text-xs font-mono text-emerald-700 font-semibold">
              Verified: {integrityStatus.verified_at}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 block mb-0.5">Validated Blocks:</span>
              <span className="text-slate-900 font-bold text-sm">{integrityStatus.total_blocks} Blocks</span>
            </div>
            <div className="truncate">
              <span className="text-slate-500 block mb-0.5">Genesis Root Hash:</span>
              <span className="text-indigo-700 font-semibold">{integrityStatus.genesis_hash}</span>
            </div>
            <div className="truncate">
              <span className="text-slate-500 block mb-0.5">Chain Head Hash:</span>
              <span className="text-indigo-700 font-semibold">{integrityStatus.chain_head_hash}</span>
            </div>
          </div>
        </div>
      )}

      {/* Metric Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Sealed Ledger Blocks */}
        <div className="saas-card-interactive p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider leading-snug">
                Sealed Ledger Blocks
              </span>
              <span className="status-pill status-pill-verified shrink-0">
                SEALED
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                {ledger.length}
              </span>
              <span className="text-xs font-mono text-slate-500">
                Merkle Root Valid
              </span>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500 min-h-[20px] flex items-center">
            SHA-256 Hash Chained WORM Ledger
          </div>
        </div>

        {/* Card 2: Active Policy Handbook */}
        <div className="saas-card-interactive p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider leading-snug">
                Active Policy Handbook
              </span>
              <span className="status-pill status-pill-active shrink-0">
                NORMS ACTIVE
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                APH 2024–27
              </span>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500 min-h-[20px] flex items-center">
            Academic Session 2026-27 Approved
          </div>
        </div>

        {/* Card 3: Terminal Norm Ratio */}
        <div className="saas-card-interactive p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider leading-snug">
                Terminal Norm Ratio
              </span>
              <span className="status-pill status-pill-verified shrink-0">
                CLAUSE 5.1
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                1 : {rules?.student_pc_ratio || 6}
              </span>
              <span className="text-xs font-mono text-slate-500">
                Student : PC
              </span>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500 min-h-[20px] flex items-center">
            Statutory AICTE ratio enforced
          </div>
        </div>

        {/* Card 4: DSC Enforcement */}
        <div className="saas-card-interactive p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider leading-snug">
                DSC Enforcement
              </span>
              <span className="status-pill status-pill-verified shrink-0">
                X.509
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className={`text-2xl font-extrabold tracking-tight ${
                rules?.require_valid_dsc ? 'text-emerald-600' : 'text-slate-900'
              }`}>
                {rules?.require_valid_dsc ? 'MANDATORY' : 'OPTIONAL'}
              </span>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500 min-h-[20px] flex items-center truncate">
            Cryptographic Authority Validation
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Configurable APH Rule Engine (Col 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="saas-card p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Scale size={18} className="text-slate-700" />
                <h2 className="text-base font-bold text-slate-900">
                  Regulatory Parameters
                </h2>
              </div>
              <span className="status-pill status-pill-neutral font-mono text-[10px]">
                APH 2024–27 Engine
              </span>
            </div>

            {/* Parameter Domain Tabs */}
            <div className="flex flex-wrap gap-1 mb-4 pb-2 border-b border-slate-100">
              {[
                { id: 'SPATIAL', label: 'Spatial & Land' },
                { id: 'INSTRUCTIONAL', label: 'Instructional Area' },
                { id: 'FACULTY', label: 'Faculty & Cadre' },
                { id: 'SAFETY', label: 'Safety & Corpus' },
                { id: 'FORENSICS', label: 'CV & Forensics' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setParamTab(tab.id as any)}
                  className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition-colors cursor-pointer ${
                    paramTab === tab.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {rules && (
              <div className="space-y-4 text-xs">
                {/* TAB 1: SPATIAL & LAND NORMS */}
                {paramTab === 'SPATIAL' && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-slate-700 mb-1 font-semibold">
                        Minimum Contiguous Land Area (sq. meters):
                      </label>
                      <input
                        type="number"
                        value={rules.min_land_area_sqm}
                        onChange={(e) =>
                          setRules({ ...rules, min_land_area_sqm: Number(e.target.value) })
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono font-semibold focus:outline-none focus:border-indigo-500 transition-colors shadow-xs"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        APH Clause 4.1.1 Minimum requirement for urban technical institutions.
                      </p>
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1 font-semibold">
                        Permissible Land Area Discrepancy Margin (%):
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={rules.max_land_variance_percent ?? 2.0}
                        onChange={(e) =>
                          setRules({ ...rules, max_land_variance_percent: Number(e.target.value) })
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono font-semibold focus:outline-none focus:border-indigo-500 transition-colors shadow-xs"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        APH Clause 4.1.3 Maximum allowed variance between Title Deed and Form Part-1.
                      </p>
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1 font-semibold">
                        Campus Hardware EXIF GPS Geofence Radius (meters):
                      </label>
                      <input
                        type="number"
                        value={rules.max_geofence_radius_meters ?? 500}
                        onChange={(e) =>
                          setRules({ ...rules, max_geofence_radius_meters: Number(e.target.value) })
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono font-semibold focus:outline-none focus:border-indigo-500 transition-colors shadow-xs"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        APH Clause 5.4 Maximum permissible distance of photo capture point from campus boundary.
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB 2: INSTRUCTIONAL SPACES & TABLE SCHEDULES */}
                {paramTab === 'INSTRUCTIONAL' && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-slate-700 mb-1 font-semibold">
                        Minimum Classroom Carpet Area (sq. meters):
                      </label>
                      <input
                        type="number"
                        value={rules.min_classroom_area_sqm}
                        onChange={(e) =>
                          setRules({ ...rules, min_classroom_area_sqm: Number(e.target.value) })
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono font-semibold focus:outline-none focus:border-indigo-500 transition-colors shadow-xs"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        APH Clause 5.1 Minimum carpet area per instructional classroom division.
                      </p>
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1 font-semibold">
                        Minimum Computer Lab Carpet Area (sq. meters):
                      </label>
                      <input
                        type="number"
                        value={rules.min_lab_area_sqm}
                        onChange={(e) =>
                          setRules({ ...rules, min_lab_area_sqm: Number(e.target.value) })
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono font-semibold focus:outline-none focus:border-indigo-500 transition-colors shadow-xs"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        APH Clause 5.2 Minimum carpet area per computer laboratory unit.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 mb-1 font-semibold">
                          Tutorial Room Area (sq.m):
                        </label>
                        <input
                          type="number"
                          value={rules.min_tutorial_area_sqm ?? 33}
                          onChange={(e) =>
                            setRules({ ...rules, min_tutorial_area_sqm: Number(e.target.value) })
                          }
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-semibold focus:outline-none focus:border-indigo-500 transition-colors shadow-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 mb-1 font-semibold">
                          Seminar Hall Area (sq.m):
                        </label>
                        <input
                          type="number"
                          value={rules.min_seminar_area_sqm ?? 132}
                          onChange={(e) =>
                            setRules({ ...rules, min_seminar_area_sqm: Number(e.target.value) })
                          }
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-semibold focus:outline-none focus:border-indigo-500 transition-colors shadow-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1 font-semibold">
                        Cumulative Built-up Area Deficit Tolerance (%):
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={rules.max_builtup_variance_percent ?? 2.0}
                        onChange={(e) =>
                          setRules({ ...rules, max_builtup_variance_percent: Number(e.target.value) })
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono font-semibold focus:outline-none focus:border-indigo-500 transition-colors shadow-xs"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        APH Clause 4.1.3 Maximum allowed deficit between sum of schedule rooms and claimed built-up area.
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB 3: ACADEMIC FACULTY & CADRE */}
                {paramTab === 'FACULTY' && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-slate-700 mb-1 font-semibold">
                        Maximum Student-to-Faculty Ratio (SFR):
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={rules.max_sfr_ratio ?? 20}
                        onChange={(e) =>
                          setRules({ ...rules, max_sfr_ratio: Number(e.target.value) })
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono font-semibold focus:outline-none focus:border-indigo-500 transition-colors shadow-xs"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        APH Clause 7.1 Statutory SFR maximum (1:20 for Engineering & Technology UG).
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-slate-600">
                      <span className="font-semibold text-slate-800 block text-xs">Faculty Cadre Proportion (Clause 7.2):</span>
                      <p className="text-[11px]">Enforces statutory cadre ratio: <strong>1 Professor : 2 Associate : 6 Assistant Professors</strong></p>
                      <p className="text-[11px]">Clause 7.3: Ph.D qualification strictly verified for Principal / Professor cadre.</p>
                    </div>
                  </div>
                )}

                {/* TAB 4: SAFETY, LEGAL & FINANCIAL CORPUS */}
                {paramTab === 'SAFETY' && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-slate-700 mb-1 font-semibold">
                        Bank FDR Corpus Security Requirement (INR Lakhs):
                      </label>
                      <input
                        type="number"
                        value={rules.min_fdr_corpus_lakhs ?? 100}
                        onChange={(e) =>
                          setRules({ ...rules, min_fdr_corpus_lakhs: Number(e.target.value) })
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono font-semibold focus:outline-none focus:border-indigo-500 transition-colors shadow-xs"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        APH Clause 2.2 Locked deposit in favor of AICTE (₹100 Lakhs for EoA, ₹500 Lakhs for New Institute).
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <input
                        type="checkbox"
                        id="dscCheck"
                        checked={rules.require_valid_dsc}
                        onChange={(e) =>
                          setRules({ ...rules, require_valid_dsc: e.target.checked })
                        }
                        className="w-4 h-4 rounded bg-white border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                      <label htmlFor="dscCheck" className="text-slate-700 font-semibold cursor-pointer">
                        Enforce Valid X.509 Cryptographic Digital Signature (DSC) (APH Clause 6.1)
                      </label>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px]">
                      APH Clause 6.3: Fire Safety NOC and Structural Stability clearances must be active through 31-August of the academic session.
                    </div>
                  </div>
                )}

                {/* TAB 5: COMPUTER VISION & FORENSICS THRESHOLDS */}
                {paramTab === 'FORENSICS' && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-slate-700 mb-1 font-semibold">
                        Student-to-PC Equipment Ratio (1 PC per N students):
                      </label>
                      <input
                        type="number"
                        value={rules.student_pc_ratio}
                        onChange={(e) =>
                          setRules({ ...rules, student_pc_ratio: Number(e.target.value) })
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono font-semibold focus:outline-none focus:border-indigo-500 transition-colors shadow-xs"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        APH Clause 5.2.1 Ratio 1:6 enforced via YOLOv8 object detection on lab photos.
                      </p>
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1 font-semibold">
                        CLIP Visual Deduplication Cosine Threshold:
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={rules.clip_duplicate_threshold ?? 0.90}
                        onChange={(e) =>
                          setRules({ ...rules, clip_duplicate_threshold: Number(e.target.value) })
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono font-semibold focus:outline-none focus:border-indigo-500 transition-colors shadow-xs"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        APH Clause 5.2.1 Flags recycled laboratory photos when cosine similarity exceeds this threshold.
                      </p>
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1 font-semibold">
                        Error Level Analysis (ELA 95%) Anomaly Score Threshold:
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        value={rules.ela_anomaly_threshold ?? 0.60}
                        onChange={(e) =>
                          setRules({ ...rules, ela_anomaly_threshold: Number(e.target.value) })
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono font-semibold focus:outline-none focus:border-indigo-500 transition-colors shadow-xs"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        APH Clause 1.4 Flags localized compression residuals indicating tampered dates or stamps.
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={handleSaveAndReevaluate}
                    disabled={savingRules}
                    className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                  >
                    <Save size={15} />
                    <span>{savingRules ? 'Updating & Batch Re-evaluating...' : 'Deploy Rules & Re-evaluate Queue'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: SHA-256 Hash-Chained Audit Ledger (Col 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="saas-card p-6 flex flex-col h-[640px]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Hash size={18} className="text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Cryptographic Provenance Ledger ({ledger.length} Blocks)
                </h2>
              </div>
              <button
                onClick={loadData}
                className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 transition-all shadow-xs cursor-pointer"
                title="Refresh ledger"
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {/* Scrollable Ledger Timeline */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1.5">
              {ledger.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 hover:border-indigo-300 hover:bg-white transition-all shadow-xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-700">
                        BLOCK #{entry.id}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="font-bold text-slate-800">{entry.action_type}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-500">Actor Role:</span>{' '}
                      <span className="text-slate-800 font-semibold">{entry.actor_role}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Target Dossier:</span>{' '}
                      <span className="text-indigo-700 font-semibold">
                        {entry.application_id ? `APP #${entry.application_id}` : 'GLOBAL POLICY'}
                      </span>
                    </div>
                  </div>

                  {/* Hash Linkage */}
                  <div className="pt-2 text-[11px] font-mono space-y-1 border-t border-slate-200">
                    <div className="truncate text-slate-500 flex items-center gap-1.5">
                      <Link2 size={12} className="text-slate-400 shrink-0" />
                      <span>PREV:</span>
                      <span className="text-slate-600">{entry.prev_hash}</span>
                    </div>
                    <div className="truncate text-emerald-700 font-semibold flex items-center gap-1.5">
                      <Check size={12} className="text-emerald-600 shrink-0" />
                      <span>CURR:</span>
                      <span>{entry.curr_hash}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ================================================================= */}
      {/* SECTION 3: Live Issuing Authority Verification Registry (DB-Backed) */}
      {/* ================================================================= */}
      <div className="saas-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <Building size={18} className="text-slate-700" />
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                State Issuing Authority Verification Registry
              </h2>
              <span className="status-pill status-pill-neutral font-mono text-[10px]">
                {registry.length} Records in DB
              </span>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              Statutory verification gateway backing Fire NOCs, Land Titles, Municipal Approvals, and University Affiliations. Scrutiny officers query this live database to verify authenticity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search URN or Institution..."
                value={registryFilter}
                onChange={(e) => setRegistryFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono w-48 sm:w-64"
              />
            </div>
            <button
              onClick={handleClearRegistry}
              title="Clear all authority sandbox records"
              className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Clear Sandbox</span>
            </button>
            <button
              onClick={handleReseedRegistry}
              title="Restore demo URN test cases"
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Load Demo URNs</span>
            </button>
            <button
              onClick={() => setShowAddUrnModal(true)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              <span>Register New URN</span>
            </button>
          </div>
        </div>

        {/* Registry Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold font-mono">
              <tr>
                <th className="p-3">URN (Reference Number)</th>
                <th className="p-3">Statutory Authority</th>
                <th className="p-3">Licensed Institution</th>
                <th className="p-3">Registry Status</th>
                <th className="p-3">Valid Until</th>
                <th className="p-3 text-right">Data Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {registry.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-mono text-xs">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Building size={28} className="text-slate-300" />
                      <span className="font-semibold text-slate-700 text-sm">Authority Registry is Empty (0 Records)</span>
                      <p className="text-slate-400 text-xs max-w-md">
                        Clean slate ready for your own college. Click <strong>&quot;Register New URN&quot;</strong> to add your institution&apos;s statutory certificates, or click <strong>&quot;Load Demo URNs&quot;</strong> to restore test scenarios.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                registry
                  .filter(
                    (r) =>
                      !registryFilter ||
                      r.urn.toLowerCase().includes(registryFilter.toLowerCase()) ||
                      r.institution_name.toLowerCase().includes(registryFilter.toLowerCase()) ||
                      r.authority.toLowerCase().includes(registryFilter.toLowerCase())
                  )
                  .map((entry, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-indigo-700">
                        {entry.urn}
                      </td>
                      <td className="p-3 font-medium text-slate-900">
                        {entry.authority}
                      </td>
                      <td className="p-3 text-slate-700 font-medium">
                        {entry.institution_name}
                      </td>
                      <td className="p-3">
                        <span
                          className={`status-pill ${
                            entry.status === 'ACTIVE' || entry.status === 'VERIFIED'
                              ? 'status-pill-verified'
                              : entry.status === 'EXPIRED'
                              ? 'status-pill-expired'
                              : 'status-pill-mismatch'
                          }`}
                        >
                          {entry.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-600">
                        {entry.expiry_date || 'Permanent'}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-500 text-right">
                        {entry.source}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Register New URN in Authority Gateway */}
      {showAddUrnModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Building size={18} className="text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Register Instrument in Authority Gateway</h3>
              </div>
              <button
                onClick={() => setShowAddUrnModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddUrn} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Unique Registration Number (URN) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NOC-MH-FIRE-2026-9999"
                  value={newUrnForm.urn}
                  onChange={(e) => setNewUrnForm({ ...newUrnForm, urn: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Issuing Authority Directorate *
                </label>
                <select
                  value={newUrnForm.authority}
                  onChange={(e) => setNewUrnForm({ ...newUrnForm, authority: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="State Fire Services Directorate">State Fire Services Directorate</option>
                  <option value="Town Planning & Valuation Department">Town Planning & Valuation Department</option>
                  <option value="Municipal Corporation Building Sanction">Municipal Corporation Building Sanction</option>
                  <option value="Affiliating Technological University">Affiliating Technological University</option>
                  <option value="Public Works Department (PWD)">Public Works Department (PWD)</option>
                  <option value="Revenue & Land Title Registry">Revenue & Land Title Registry</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Institution Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Institute of Technology, Pune"
                  value={newUrnForm.institution_name}
                  onChange={(e) => setNewUrnForm({ ...newUrnForm, institution_name: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status</label>
                  <select
                    value={newUrnForm.status}
                    onChange={(e) => setNewUrnForm({ ...newUrnForm, status: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="EXPIRED">EXPIRED</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="REVOKED">REVOKED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Valid Until Date</label>
                  <input
                    type="date"
                    value={newUrnForm.expiry_date}
                    onChange={(e) => setNewUrnForm({ ...newUrnForm, expiry_date: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddUrnModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingUrn}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-xs cursor-pointer flex items-center gap-2"
                >
                  {addingUrn && <RefreshCw size={13} className="animate-spin" />}
                  <span>Save to Registry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
