import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  UploadCloud, 
  Sparkles, 
  FileCheck2, 
  AlertTriangle, 
  Scale, 
  ArrowRight, 
  DollarSign, 
  Calendar, 
  Home, 
  Key, 
  CheckCircle2, 
  Eye, 
  FileText 
} from 'lucide-react';

export default function LandingPage() {
  const auditAreas = [
    { title: 'Security Deposits', icon: DollarSign, desc: 'Detects arbitrary deduction terms and missing refund statutory deadlines.' },
    { title: 'Rent Increases', icon: ArrowRight, desc: 'Flags unpredictable price hikes and enforces written advance notice windows.' },
    { title: 'Notice Periods', icon: Calendar, desc: 'Identifies one-sided termination rules and unbalanced vacate notice requirements.' },
    { title: 'Lock-in Periods', icon: Key, desc: 'Highlights extreme forfeiture penalties for breaking leases early due to job transfers.' },
    { title: 'Maintenance Duties', icon: Home, desc: 'Spots illegal clauses transferring landlord structural repair costs to tenants.' },
    { title: 'Eviction & Subletting', icon: ShieldAlert, desc: 'Uncovers unlawful self-help lockouts, utility cut-offs, and severe guest bans.' },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 pt-12 pb-20 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 text-xs font-semibold tracking-wide border border-blue-200 dark:border-blue-800">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>AI-Powered Legal Contract Auditor for Renters</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Never sign an unfair rental agreement again.
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Upload your lease PDF or photo. RentWise breaks down legalese, scores high-risk clauses in plain English, uncovers missing protections, and writes polite landlord negotiation scripts.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/upload"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]"
            >
              <UploadCloud className="w-5 h-5" />
              <span>Review Your Agreement Now</span>
            </Link>
            <Link
              to="/report"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
            >
              <Eye className="w-5 h-5 text-slate-400" />
              <span>View Interactive Demo Report</span>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-2xl font-bold text-blue-600">7 Core</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Audit areas scanned</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-2xl font-bold text-rose-600">Red Flags</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">High-risk clause detector</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-2xl font-bold text-emerald-600">Scripts</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ready-to-send negotiations</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-2xl font-bold text-purple-600">100% Free</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">For student & family renters</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Walkthrough */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            What RentWise Checks in Your Lease
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Landlords frequently slip predatory terms into boilerplate templates. Our Gemini AI review audits each clause against standard tenant protections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auditAreas.map((area, idx) => {
            const Icon = area.icon;
            return (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500/50 hover:shadow-md transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  {area.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {area.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Visual Comparison: Legalese vs RentWise Plain English */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-10 shadow-xl overflow-hidden relative border border-slate-800">
          <div className="max-w-2xl mb-8 space-y-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-blue-400">
              The RentWise Difference
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold">
              Turning complex legalese into tenant power
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* The Trap */}
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-rose-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  What the Lease Says (High Risk)
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-medium">
                  Deposit Clause
                </span>
              </div>
              <p className="text-sm font-mono text-slate-300 italic bg-slate-900/60 p-3 rounded-lg border border-slate-700/60">
                "The Landlord may retain all or part of the security deposit for any perceived refurbishment or repair at Landlord's sole discretion without obligation of formal accounting."
              </p>
              <div className="text-xs text-rose-300 space-y-1">
                <p>⚠️ <strong>Risk:</strong> Gives landlord legal cover to keep your entire deposit without receipts or photos.</p>
              </div>
            </div>

            {/* RentWise Counter Proposal */}
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  What RentWise Gives You
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-medium">
                  Counter-Proposal Script
                </span>
              </div>
              <p className="text-sm text-slate-200 bg-slate-900/60 p-3 rounded-lg border border-slate-700/60">
                "Dear [Landlord], could we please update Clause 4 to state that any deposit deductions must be supported by itemized contractor receipts and photos, with the balance refunded within 21 days?"
              </p>
              <div className="text-xs text-emerald-300 space-y-1">
                <p>✅ <strong>Benefit:</strong> Polite, professional negotiation wording ready to copy-paste into email or WhatsApp.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Steps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            How RentWise Works in 3 Steps
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            From upload to negotiation in less than 30 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-3 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center mx-auto text-xl font-bold">
              1
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Upload Document</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Drag-and-drop your digital PDF lease or snap photos of a printed paper agreement.
            </p>
          </div>

          <div className="text-center space-y-3 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center mx-auto text-xl font-bold">
              2
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Gemini AI Audit</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Our backend extracts text and classifies clauses into Low, Medium, and High risk categories.
            </p>
          </div>

          <div className="text-center space-y-3 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center mx-auto text-xl font-bold">
              3
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Negotiate with Ease</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Review flagged terms and copy pre-formulated counter-proposals to ask your landlord for amendments.
            </p>
          </div>
        </div>

        <div className="text-center pt-4">
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all hover:scale-105"
          >
            <span>Start Your Agreement Audit</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
