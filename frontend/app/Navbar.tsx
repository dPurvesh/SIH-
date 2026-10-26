'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  LayoutDashboard,
  FileSearch,
  Building2,
  Camera,
  Smartphone,
  Sliders,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { fetchHealth } from './api';

export default function Navbar() {
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [healthInfo, setHealthInfo] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const ping = () => {
      fetchHealth()
        .then((data) => {
          setIsOnline(true);
          setHealthInfo(data);
        })
        .catch(() => setIsOnline(false));
    };
    ping();
    const interval = setInterval(ping, 10000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { label: 'Overview', href: '/', icon: LayoutDashboard },
    { label: 'Scrutiny Studio', href: '/scrutiny', icon: FileSearch },
    { label: 'Institution Portal', href: '/institution', icon: Building2 },
    { label: 'Vision Auditor', href: '/infrastructure-cv', icon: Camera },
    { label: 'Mobile EVC', href: '/mobile-capture', icon: Smartphone },
    { label: 'Governance & Rules', href: '/admin-governance', icon: Sliders },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 border-b border-slate-200/70 transition-all">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs tracking-wider shadow-sm group-hover:scale-105 transition-transform">
              PR
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-slate-900">Pramaan</span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/80">
                  AICTE
                </span>
              </div>
            </div>
          </Link>

          {/* Navigation Items (Aetherfield clean style) */}
          <nav className="hidden lg:flex items-center gap-1 text-[13px]">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    isActive
                      ? 'text-slate-950 font-semibold bg-slate-100/80'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions & Status */}
        <div className="flex items-center gap-3">
          {/* Live Engine Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100/70 border border-slate-200/80 text-[11px]">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isOnline ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isOnline ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              />
            </span>
            <span className="text-slate-600 font-mono text-[10px]">
              {isOnline ? 'LIVE PORT:8000' : 'CONNECTING...'}
            </span>
          </div>

          <Link
            href="/scrutiny"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-md bg-slate-900 hover:bg-black text-white text-xs font-medium tracking-normal transition-all shadow-xs cursor-pointer"
          >
            <span className="text-[10px] font-mono leading-none">▪</span>
            <span>Launch Studio</span>
            <span className="text-xs">→</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 space-y-1 shadow-lg animate-fade-in">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-slate-950 font-semibold bg-slate-100'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-slate-900' : 'text-slate-400'} />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-100">
            <Link
              href="/scrutiny"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold"
            >
              <span>Launch Scrutiny Studio →</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
