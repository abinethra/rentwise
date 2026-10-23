import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  CheckSquare, 
  Square, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  FileText, 
  ShieldCheck, 
  Printer,
  Sparkles
} from 'lucide-react';
import { DEMO_AGREEMENT } from '../api';

export default function ChecklistPage() {
  const location = useLocation();
  const agreement = location.state?.agreement || DEMO_AGREEMENT;
  const clauses = agreement.clauses || [];
  const missing = agreement.missing_protections || [];

  // Helper to determine status from agreement data
  const getCategoryStatus = (categoryKeyword) => {
    const foundClause = clauses.find(c => (c.category || '').toLowerCase().includes(categoryKeyword));
    if (!foundClause) {
      return { status: 'missing', label: 'Missing Protection', color: 'rose' };
    }
    const risk = (foundClause.risk || '').toLowerCase();
    if (risk === 'high') {
      return { status: 'high_risk', label: 'High Risk Clause Detected', color: 'rose', clause: foundClause };
    }
    if (risk === 'medium') {
      return { status: 'medium_risk', label: 'Ambiguous / Unfavorable', color: 'amber', clause: foundClause };
    }
    return { status: 'safe', label: 'Fair / Balanced', color: 'emerald', clause: foundClause };
  };

  const checklistItems = [
    {
      id: 'dep_1',
      title: 'Security Deposit Refund Timeline',
      category: 'deposit',
      importance: 'Critical',
      description: 'Specific deadline (e.g. 15 to 30 days maximum) for the return of your deposit post-move-out.',
      statusInfo: getCategoryStatus('deposit'),
      recommendation: 'Ensure a written deadline is stated with itemized receipts required for deductions.'
    },
    {
      id: 'rent_2',
      title: 'Fixed Rent & Advance Increase Notice',
      category: 'rent increase',
      importance: 'High',
      description: 'Rent must remain fixed during the initial term; any future hike must have 30-60 days written notice.',
      statusInfo: getCategoryStatus('rent increase'),
      recommendation: 'Strike out any clause permitting verbal or mid-term rent adjustments.'
    },
    {
      id: 'not_3',
      title: 'Mutual Symmetrical Notice Period',
      category: 'notice period',
      importance: 'High',
      description: 'Both tenant and landlord should have equal notice requirements (e.g. 30 days for both).',
      statusInfo: getCategoryStatus('notice period'),
      recommendation: 'Check that landlord cannot terminate on shorter notice than what you are bound to provide.'
    },
    {
      id: 'lock_4',
      title: 'Fair Lock-in Period & Relocation Exit',
      category: 'lock-in',
      importance: 'Medium',
      description: 'Provisions for early lease termination in case of unavoidable emergency, job loss, or employer transfer.',
      statusInfo: getCategoryStatus('lock-in'),
      recommendation: 'Avoid unconditional deposit forfeiture or multi-month penalty fees.'
    },
    {
      id: 'maint_5',
      title: 'Landlord Responsibility for Major Repairs',
      category: 'maintenance',
      importance: 'Critical',
      description: 'Landlord must handle structural, roof, plumbing mains, and pre-existing electrical maintenance.',
      statusInfo: getCategoryStatus('maintenance'),
      recommendation: 'Set a clear threshold (e.g. tenant handles minor repairs under $50; landlord covers the rest).'
    },
    {
      id: 'evict_6',
      title: 'Written Notice Before Eviction & Cure Period',
      category: 'eviction',
      importance: 'Critical',
      description: 'Right to formal written notice and at least a 7-day cure window for inadvertent late payment.',
      statusInfo: getCategoryStatus('eviction'),
      recommendation: 'Never accept clauses permitting self-help lock changes or immediate property removal.'
    },
    {
      id: 'sub_7',
      title: 'Subletting & Guest Privileges',
      category: 'subletting',
      importance: 'Medium',
      description: 'Fair guest policy without punitive overnight visitor fees; reasonable sublet approval.',
      statusInfo: getCategoryStatus('subletting'),
      recommendation: 'Ensure guests staying under 14 days do not trigger unauthorized occupant penalties.'
    },
    {
      id: 'insp_8',
      title: '24-Hour Notice for Landlord Entry',
      category: 'inspection',
      importance: 'High',
      description: 'Landlord must provide at least 24 hours written notice before entering for inspections or viewings.',
      statusInfo: missing.some(m => m.toLowerCase().includes('entry') || m.toLowerCase().includes('inspection'))
        ? { status: 'missing', label: 'Missing from Lease', color: 'rose' }
        : { status: 'safe', label: 'Checked', color: 'emerald' },
      recommendation: 'Protects your legal right to quiet enjoyment and personal privacy.'
    }
  ];

  const [checkedIds, setCheckedIds] = useState(new Set());

  const toggleCheck = (id) => {
    const next = new Set(checkedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCheckedIds(next);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Pre-Signing Audit
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500">{agreement.filename}</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Tenant Pre-Signing Checklist
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Ensure every essential protection is verified before putting your pen to paper.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-sm font-medium"
          >
            <Printer className="w-4 h-4" />
            <span>Print Checklist</span>
          </button>
          <Link
            to="/negotiation"
            state={{ agreement }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm"
          >
            <span>Draft Counter-Proposals</span>
          </Link>
        </div>
      </div>

      {/* Progress pill */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
            {checkedIds.size} / {checklistItems.length}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Checklist Verification Progress
            </p>
            <p className="text-xs text-slate-500">
              {checkedIds.size === checklistItems.length ? "All items reviewed and verified!" : "Tick off items as you negotiate or verify them in the lease."}
            </p>
          </div>
        </div>

        <div className="w-32 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div 
            className="bg-blue-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${(checkedIds.size / checklistItems.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="space-y-4">
        {checklistItems.map(item => {
          const isChecked = checkedIds.has(item.id);
          const { status, label, color, clause } = item.statusInfo;

          return (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-5 sm:p-6 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-slate-900 shadow-sm ${
                isChecked
                  ? 'border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-blue-400'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  className="mt-1 text-slate-400 hover:text-blue-600 focus:outline-none"
                >
                  {isChecked ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <Square className="w-6 h-6" />
                  )}
                </button>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-base font-bold ${isChecked ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                        {item.title}
                      </h3>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {item.importance} Priority
                      </span>
                    </div>

                    {/* AI detected status badge */}
                    <div>
                      {status === 'high_risk' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {label}
                        </span>
                      )}
                      {status === 'medium_risk' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200">
                          <HelpCircle className="w-3.5 h-3.5" />
                          {label}
                        </span>
                      )}
                      {status === 'missing' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {label}
                        </span>
                      )}
                      {status === 'safe' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {label}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    {item.description}
                  </p>

                  {/* Recommendation pill */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    <p className="font-semibold text-blue-600 dark:text-blue-400">
                      Smart Tenant Rule:
                    </p>
                    <p>{item.recommendation}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
