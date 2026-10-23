import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs md:text-sm text-amber-800 dark:text-amber-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong>Tenant Guidance Only:</strong> RentWise provides automated risk analysis and counter-proposals for educational purposes, not licensed legal advice. Consult a tenant attorney or legal aid for formal dispute resolution.
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-1 text-xs text-amber-700/80 dark:text-amber-400/80 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Data Protected</span>
        </div>
      </div>
    </div>
  );
}
