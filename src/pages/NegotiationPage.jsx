import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  MessageSquare, 
  Copy, 
  Check, 
  Send, 
  Sparkles, 
  Sliders, 
  Mail, 
  ArrowLeft,
  FileCheck2,
  ShieldCheck
} from 'lucide-react';
import { DEMO_AGREEMENT } from '../api';

export default function NegotiationPage() {
  const location = useLocation();
  const agreement = location.state?.agreement || DEMO_AGREEMENT;
  const highlightClauseId = location.state?.highlightClauseId;

  const [tone, setTone] = useState('polite'); // 'polite', 'formal', 'casual'
  const [landlordName, setLandlordName] = useState('Landlord');
  const [tenantName, setTenantName] = useState('Tenant');
  const [propertyAddress, setPropertyAddress] = useState('Apartment 4B, 123 Maple Street');
  const [selectedClauseIds, setSelectedClauseIds] = useState(() => {
    // Default select high and medium risk clauses
    const initial = new Set();
    const clauses = agreement.clauses || [];
    clauses.forEach(c => {
      if ((c.risk || '').toLowerCase() === 'high' || (c.risk || '').toLowerCase() === 'medium') {
        initial.add(c.id);
      }
    });
    if (highlightClauseId) initial.add(highlightClauseId);
    return initial;
  });

  const [copied, setCopied] = useState(false);

  const clauses = agreement.clauses || [];

  const toggleClauseSelection = (id) => {
    const next = new Set(selectedClauseIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedClauseIds(next);
  };

  const selectedClauses = clauses.filter(c => selectedClauseIds.has(c.id));

  // Generate dynamic negotiation draft based on selected tone and clauses
  const generateMessageText = () => {
    if (selectedClauses.length === 0) {
      return "Please select at least one clause on the left to generate your negotiation message.";
    }

    if (tone === 'casual') {
      let msg = `Hi ${landlordName},\n\nI really like the place at ${propertyAddress} and I'm looking forward to moving in! I went through the draft agreement and had a quick question regarding a couple of clauses:\n\n`;
      selectedClauses.forEach((c, i) => {
        msg += `${i + 1}. Regarding the ${c.category || 'terms'}: ${c.suggestion}\n\n`;
      });
      msg += `Would you be open to adjusting these points so we can finalize the paperwork? Thanks so much!\n\nBest,\n${tenantName}`;
      return msg;
    }

    if (tone === 'formal') {
      let msg = `Dear ${landlordName},\n\nRE: Proposed Residential Lease Agreement for ${propertyAddress}\n\nThank you for transmitting the draft lease for our review. We are enthusiastic about proceeding with the tenancy. Upon reviewing the terms, we would like to respectfully propose minor revisions to align the agreement with mutual standards of fair tenancy:\n\n`;
      selectedClauses.forEach((c, i) => {
        msg += `Item ${i + 1} (${(c.category || 'Clause').toUpperCase()}):\n- Current Draft: "${c.text}"\n- Proposed Revision: ${c.suggestion}\n\n`;
      });
      msg += `These amendments will ensure clear clarity and risk parity for both parties throughout the lease term. Kindly confirm if these revisions are agreeable so that we may execute the agreement.\n\nSincerely,\n${tenantName}`;
      return msg;
    }

    // Default 'polite' tone
    let msg = `Dear ${landlordName},\n\nThank you for preparing the lease agreement for ${propertyAddress}. I am very excited about making this property my home!\n\nI carefully reviewed the agreement and noticed a few terms I would love to gently clarify and amend before signing:\n\n`;
    selectedClauses.forEach((c, i) => {
      msg += `• Regarding ${c.category || 'Lease Terms'}:\n  ${c.suggestion}\n  (Reason: ${c.explanation})\n\n`;
    });
    msg += `I want to ensure we have a great, transparent landlord-tenant relationship from day one. Please let me know if these small adjustments work for you, and I will be happy to sign the revised copy.\n\nWarm regards,\n${tenantName}`;
    return msg;
  };

  const currentMessage = generateMessageText();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <Link
            to="/report"
            state={{ agreement }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Risk Report</span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Landlord Negotiation Assistant
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Generate respectful, persuasive counter-proposals to request lease amendments without creating friction.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Document:</span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {agreement.filename}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Clause Selection & Customization Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Tone Selector */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              Message Tone
            </h3>
            
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'polite', label: 'Polite & Warm' },
                { id: 'formal', label: 'Formal Legal' },
                { id: 'casual', label: 'Short Text' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    tone === t.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Inputs */}
            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Landlord / Property Manager Name
                </label>
                <input
                  type="text"
                  value={landlordName}
                  onChange={(e) => setLandlordName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="e.g. Mr. Sharma, Acme Realty"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Your Name (Tenant)
                </label>
                <input
                  type="text"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Rental Property Address
                </label>
                <input
                  type="text"
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Address"
                />
              </div>
            </div>
          </div>

          {/* Clauses to Include Checklist */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                Select Clauses to Negotiate ({selectedClauses.length})
              </h3>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {clauses.map(clause => {
                const isSelected = selectedClauseIds.has(clause.id);
                const isHigh = (clause.risk || '').toLowerCase() === 'high';

                return (
                  <div
                    key={clause.id}
                    onClick={() => toggleClauseSelection(clause.id)}
                    className={`p-3 rounded-xl border cursor-pointer text-xs transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-slate-900 dark:text-white'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // Handled by parent div
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold capitalize">
                        <span>{clause.category || 'Clause'}</span>
                        {isHigh && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-bold">
                            High Risk
                          </span>
                        )}
                      </div>
                      <p className="line-clamp-2 text-slate-600 dark:text-slate-400">
                        {clause.suggestion}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Message Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Generated Landlord Message
                </h3>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:scale-105"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Full Message</span>
                  </>
                )}
              </button>
            </div>

            {/* Message Display Area */}
            <div className="relative">
              <pre className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-sans whitespace-pre-wrap leading-relaxed min-h-[380px]">
                {currentMessage}
              </pre>
            </div>

            {/* Quick Tips */}
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-300 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Tenant Negotiation Pro-Tip:
              </p>
              <p className="text-blue-800/80 dark:text-blue-400">
                Landlords are usually open to reasonable adjustments (like 21-day deposit timelines and maintenance thresholds) when presented professionally before signing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
