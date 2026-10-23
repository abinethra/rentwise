import React from 'react';
import { ShieldCheck, Heart, Github, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                RW
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">RentWise</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
              An AI-assisted contract review platform built specifically for tenants to demystify complex lease jargon, evaluate unfair clauses, and negotiate balanced terms before signing.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-200/50 dark:bg-slate-800/50 px-2.5 py-1 rounded-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>B.Tech AI & Data Science Capstone Portfolio Project</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Application
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/upload" className="hover:text-blue-600">Upload Document</Link></li>
              <li><Link to="/report" className="hover:text-blue-600">Sample Analysis</Link></li>
              <li><Link to="/negotiation" className="hover:text-blue-600">Negotiation Scripts</Link></li>
              <li><Link to="/checklist" className="hover:text-blue-600">Pre-Signing Checklist</Link></li>
              <li><Link to="/history" className="hover:text-blue-600">Audit History</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Legal Disclaimer
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              RentWise operates purely as an automated informational aid and does not constitute formal legal representation, advocacy, or advice. Always consult local housing authority tenant guidelines or legal aid attorneys.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} RentWise. Built with FastAPI, SQLite, and Gemini 2.5.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              Designed for Tenants Everywhere
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
