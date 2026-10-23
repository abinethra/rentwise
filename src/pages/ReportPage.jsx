import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle, 
  Copy, 
  Check, 
  Filter, 
  MessageSquare, 
  ArrowRight, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';
import { DEMO_AGREEMENT, getAgreementReport } from '../api';

export default function ReportPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [agreement, setAgreement] = useState(location.state?.agreement || null);
  const [loading, setLoading] = useState(!agreement);
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [expandedClauseIds, setExpandedClauseIds] = useState(new Set());

  useEffect(() => {
    if (!agreement) {
      // If navigated directly to /report without state, load the default demo agreement
      setLoading(true);
      setTimeout(() => {
        setAgreement(DEMO_AGREEMENT);
        setLoading(false);
      }, 400);
    }
  }, [agreement]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mx-auto"></div>
        <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">
          Loading agreement analysis report...
        </p>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <FileText className="w-16 h-16 text-slate-400 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">No Agreement Found</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Please upload a rental agreement to generate an AI review report.
        </p>
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm"
        >
          Go to Upload
        </Link>
      </div>
    );
  }

  const clauses = agreement.clauses || [];
  const highRiskCount = clauses.filter(c => (c.risk || '').toLowerCase() === 'high').length;
  const medRiskCount = clauses.filter(c => (c.risk || '').toLowerCase() === 'medium').length;
  const lowRiskCount = clauses.filter(c => (c.risk || '').toLowerCase() === 'low').length;
  const missingProtections = agreement.missing_protections || [];

  // Filter clauses
  const filteredClauses = clauses.filter(c => {
    const matchesRisk = selectedRiskFilter === 'all' || (c.risk || '').toLowerCase() === selectedRiskFilter;
    const matchesCategory = selectedCategoryFilter === 'all' || (c.category || '').toLowerCase() === selectedCategoryFilter;
    return matchesRisk && matchesCategory;
  });

  const categories = ['all', 'deposit', 'rent increase', 'notice period', 'lock-in', 'maintenance', 'eviction', 'subletting'];

  const handleCopySuggestion = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleClauseExpand = (id) => {
    const next = new Set(expandedClauseIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedClauseIds(next);
  };

  const getRiskBadge = (risk) => {
    const r = (risk || '').toLowerCase();
    if (r === 'high') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <AlertTriangle className="w-3.5 h-3.5" />
          High Risk
        </span>
      );
    }
    if (r === 'medium') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <HelpCircle className="w-3.5 h-3.5" />
          Medium Risk
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Low Risk / Fair
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Contract Audit Report #{agreement.id}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500">{agreement.filename}</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Agreement Risk Assessment
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/negotiation"
            state={{ agreement }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Generate Landlord Scripts</span>
          </Link>
          <Link
            to="/checklist"
            state={{ agreement }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-medium text-sm"
          >
            <span>Pre-Signing Checklist</span>
          </Link>
        </div>
      </div>

      {/* Overview Card & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Executive Summary */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Executive Summary
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Overall Rating:</span>
              {getRiskBadge(agreement.overall_risk)}
            </div>
          </div>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {agreement.summary || "No summary text generated for this agreement."}
          </p>
        </div>

        {/* Risk Breakdown Cards */}
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                {highRiskCount}
              </div>
              <div>
                <p className="text-sm font-bold text-rose-900 dark:text-rose-200">High Risk Clauses</p>
                <p className="text-xs text-rose-600 dark:text-rose-400">Requires urgent negotiation</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                {medRiskCount}
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Medium Risk Clauses</p>
                <p className="text-xs text-amber-600 dark:text-amber-400">Review wording carefully</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                {lowRiskCount}
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Fair / Standard Clauses</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Balanced protections</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Missing Protections Warning Box */}
      {missingProtections.length > 0 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 space-y-4">
          <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h3 className="text-base font-bold">
                Crucial Tenant Protections Missing From This Lease
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                These industry-standard clauses were completely absent from the text. We recommend requesting their inclusion.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {missingProtections.map((item, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-200 dark:border-amber-900/60 text-xs sm:text-sm text-slate-800 dark:text-slate-200"
              >
                <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  !
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clauses Section */}
      <div className="space-y-6">
        
        {/* Controls & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Filter Clauses:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Risk filter */}
            <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-xs">
              {['all', 'high', 'medium', 'low'].map(r => (
                <button
                  key={r}
                  onClick={() => setSelectedRiskFilter(r)}
                  className={`px-3 py-1 rounded-md font-medium capitalize transition-colors ${
                    selectedRiskFilter === r
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Category select */}
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 font-medium text-slate-700 dark:text-slate-300"
            >
              {categories.map(c => (
                <option key={c} value={c} className="capitalize">
                  {c === 'all' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clause Cards List */}
        <div className="space-y-4">
          {filteredClauses.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
              No clauses match the selected filter criteria.
            </div>
          ) : (
            filteredClauses.map((clause) => {
              const risk = (clause.risk || '').toLowerCase();
              const isHigh = risk === 'high';
              const isMed = risk === 'medium';
              const isExpanded = expandedClauseIds.has(clause.id);

              return (
                <div
                  key={clause.id}
                  className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border transition-all shadow-sm ${
                    isHigh 
                      ? 'border-rose-200 dark:border-rose-950/80 hover:border-rose-400' 
                      : isMed 
                      ? 'border-amber-200 dark:border-amber-950/80 hover:border-amber-400' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      {getRiskBadge(clause.risk)}
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                        {clause.category || 'General'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopySuggestion(clause.id, clause.suggestion)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        {copiedId === clause.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600 font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>Copy Counter-Proposal</span>
                          </>
                        )}
                      </button>

                      <Link
                        to="/negotiation"
                        state={{ agreement, highlightClauseId: clause.id }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                      >
                        <span>Draft Script</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Original Text Excerpt */}
                  <div className="mb-4">
                    <p className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-1">
                      Original Clause in Lease
                    </p>
                    <blockquote className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-sm italic text-slate-700 dark:text-slate-300 font-mono leading-relaxed">
                      "{clause.text}"
                    </blockquote>
                  </div>

                  {/* Plain English Explanation */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 space-y-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        What this means for you
                      </h4>
                      <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                        {clause.explanation}
                      </p>
                    </div>

                    {/* Counter Proposal Suggestion */}
                    <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                        Recommended amendment
                      </h4>
                      <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                        {clause.suggestion}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
