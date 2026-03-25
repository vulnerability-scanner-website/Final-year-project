"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Download, Shield, Bug, ExternalLink, Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const severityColor = (s) => {
  const v = (s || '').toLowerCase();
  if (v === 'critical') return { badge: 'bg-red-500/10 text-red-400 border-red-500/20',    bar: 'bg-red-500' };
  if (v === 'high')     return { badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20', bar: 'bg-orange-500' };
  if (v === 'medium')   return { badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', bar: 'bg-yellow-500' };
  if (v === 'low')      return { badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',   bar: 'bg-blue-500' };
  return { badge: 'bg-white/5 text-white/50 border-white/10', bar: 'bg-white/20' };
};

export default function ScanDetailPage({ backPath }) {
  const { scanId } = useParams();
  const router = useRouter();
  const [scan, setScan] = useState(null);
  const [progress, setProgress] = useState({ progress: 0, message: 'Initializing...' });
  const [loading, setLoading] = useState(true);
  const pollRef = useRef(null);
  const headers = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  });
  const fetchScan = async () => {
    try {
      const res = await fetch(`${API}/api/scans/${scanId}`, { headers: headers() });
      if (res.ok) {
        const data = await res.json();
        setScan(data);
        // Stop polling once completed/failed
        if (data.status === 'Completed' || data.status === 'Failed') {
          clearInterval(pollRef.current);
          setProgress({ progress: data.status === 'Completed' ? 100 : 0, message: data.status });
        }
      }
    } catch (e) {
      console.error('Failed to fetch scan:', e);
    } finally {
      setLoading(false);
    }
  };
  const fetchProgress = async () => {
    try {
      const res = await fetch(`${API}/api/scans/${scanId}/progress`, { headers: headers() });
      if (res.ok) setProgress(await res.json());
    } catch { /* ignore */ }
  };
  useEffect(() => {
    fetchScan();
    fetchProgress();
    pollRef.current = setInterval(async () => {
      await fetchScan();
      await fetchProgress();
    }, 2000);
    return () => clearInterval(pollRef.current);
  }, [scanId]);

  const handleDownload = () => {
    if (!scan) return;
    const lines = [
      `Security Scan Report`,
      `Target: ${scan.target}`,
      `Status: ${scan.status}`,
      `Date: ${new Date(scan.created_at).toLocaleString()}`,
      `Total Issues: ${scan.vulnerabilities?.length || 0}`,
      '',
      'VULNERABILITIES',
      '===============',
      ...(scan.vulnerabilities || []).map((v, i) => [
        `${i + 1}. ${v.title} [${v.severity}]`,
        v.description ? `   Description: ${v.description}` : '',
        v.url         ? `   URL: ${v.url}` : '',
        v.solution    ? `   Fix: ${v.solution}` : '',
        v.cwe         ? `   CWE: CWE-${v.cwe}` : '',
        '',
      ].filter(Boolean).join('\n')),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `scan-report-${scanId}.txt`;
    a.click();
  };

  if (loading) return (
    <div className="w-full min-h-screen bg-[#101010] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
    </div>
  );

  if (!scan) return (
    <div className="w-full min-h-screen bg-[#101010] flex items-center justify-center">
      <p className="text-white/40">Scan not found.</p>
    </div>
  );

  const isRunning = scan.status === 'Running';
  const pct = isRunning ? (progress.progress || 0) : (scan.status === 'Completed' ? 100 : 0);
  const vulns = scan.vulnerabilities || [];

  const severityCounts = vulns.reduce((acc, v) => {
    const k = (v.severity || 'info').toLowerCase();
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="w-full min-h-screen bg-[#101010] text-white space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push(backPath)} className="p-2 rounded-lg text-white/40 hover:text-yellow-400 hover:bg-yellow-500/10 transition">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Scan #{scanId}</h1>
            <p className="text-white/40 text-sm truncate max-w-md">{scan.target}</p>
          </div>
        </div>
        {scan.status === 'Completed' && (
          <button onClick={handleDownload} className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg transition text-sm">
            <Download className="w-4 h-4" /> Download Report
          </button>
        )}
      </div>

      {/* Live Progress Card — shown while running */}
      {isRunning && (
        <div className="bg-[#1a1a1a] border border-yellow-500/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
              <span className="font-semibold text-white">Scan In Progress</span>
            </div>
            <span className="text-3xl font-bold text-yellow-400">{Math.round(pct)}%</span>
          </div>

          {/* Percentage bar */}
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Stage message */}
          <p className="text-sm text-white/50">{progress.message || 'Scanning...'}</p>

          {/* Stage steps */}
          <div className="grid grid-cols-4 gap-2 mt-2">
            {[
              { label: 'Initializing', threshold: 5 },
              { label: 'Spider Crawl', threshold: 35 },
              { label: 'Active Scan',  threshold: 95 },
              { label: 'Complete',     threshold: 100 },
            ].map(({ label, threshold }) => (
              <div key={label} className={`text-center text-xs py-2 px-1 rounded-lg border transition-all ${
                pct >= threshold
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                  : 'bg-white/5 border-white/10 text-white/30'
              }`}>
                {label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overview Card */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-yellow-400" /> Scan Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-white/40 mb-1">Status</p>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              scan.status === 'Completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
              scan.status === 'Running'   ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
              scan.status === 'Failed'    ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
              'bg-white/5 text-white/50 border border-white/10'
            }`}>{scan.status}</span>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Started</p>
            <p className="text-sm text-white">{new Date(scan.created_at).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Progress</p>
            <p className="text-sm font-bold text-yellow-400">{Math.round(pct)}%</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Findings</p>
            <p className="text-sm font-bold text-red-400">{vulns.length} vulnerabilities</p>
          </div>
        </div>

        {/* Severity breakdown */}
        {vulns.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
            {['critical','high','medium','low','info'].map(s => severityCounts[s] ? (
              <span key={s} className={`px-3 py-1 rounded-full text-xs font-semibold border ${severityColor(s).badge}`}>
                {severityCounts[s]} {s}
              </span>
            ) : null)}
          </div>
        )}
      </div>

      {/* Vulnerabilities */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Bug className="w-5 h-5 text-red-400" />
          Vulnerabilities ({vulns.length})
        </h2>

        {vulns.length === 0 ? (
          <div className="text-center py-12 bg-[#1a1a1a] border border-white/10 rounded-xl">
            <Bug className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">{isRunning ? 'Scan in progress — vulnerabilities will appear here.' : 'No vulnerabilities found.'}</p>
          </div>
        ) : vulns.map((vuln, i) => {
          const sc = severityColor(vuln.severity);
          return (
            <div key={vuln.id || i} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">{vuln.title}</p>
                  <p className="text-xs text-white/40 mt-0.5">#{i + 1} · {vuln.source || 'Scanner'}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${sc.badge}`}>{vuln.severity}</span>
                  {vuln.ai_type && (
                    <span className="px-2 py-1 rounded-full text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      🤖 {vuln.ai_type} {vuln.ai_confidence ? `(${Math.round(vuln.ai_confidence * 100)}%)` : ''}
                    </span>
                  )}
                </div>
              </div>

              {vuln.description && (
                <div>
                  <p className="text-xs text-white/40 mb-1">Description</p>
                  <p className="text-sm text-white/70">{vuln.description}</p>
                </div>
              )}

              {vuln.url && (
                <div>
                  <p className="text-xs text-white/40 mb-1">Affected URL</p>
                  <p className="text-xs font-mono bg-white/5 text-yellow-400 px-3 py-2 rounded-lg break-all">{vuln.url}</p>
                </div>
              )}

              {vuln.param && (
                <div>
                  <p className="text-xs text-white/40 mb-1">Parameter</p>
                  <p className="text-xs font-mono bg-orange-500/5 text-orange-400 px-3 py-2 rounded-lg">{vuln.param}</p>
                </div>
              )}

              {vuln.evidence && (
                <div>
                  <p className="text-xs text-white/40 mb-1">Evidence</p>
                  <p className="text-xs font-mono bg-red-500/5 text-red-400 px-3 py-2 rounded-lg max-h-20 overflow-y-auto break-all">{vuln.evidence}</p>
                </div>
              )}

              {vuln.solution && (
                <div>
                  <p className="text-xs text-white/40 mb-1">How to Fix</p>
                  <p className="text-sm text-green-400 bg-green-500/5 px-3 py-2 rounded-lg">{vuln.solution}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2 border-t border-white/5 text-xs text-white/30">
                {vuln.cwe        && <span>CWE-{vuln.cwe}</span>}
                {vuln.cvss_score && <span>CVSS: {vuln.cvss_score}</span>}
                {vuln.source     && <span>Scanner: {vuln.source}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
