import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  History, 
  Trash2, 
  Eye, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  FileText, 
  UploadCloud, 
  Search,
  Filter,
  Loader2
} from 'lucide-react';
import { getAgreementHistory, deleteAgreement, getAgreementReport } from '../api';

export default function HistoryPage() {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRisk, setFilterRisk] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const riskParam = filterRisk === 'all' ? null : filterRisk;
      const data = await getAgreementHistory(50, 0, riskParam);
      setHistoryItems(data.items || []);
    } catch (err) {
      console.error("Failed to fetch agreement history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filterRisk]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to remove this agreement review from your history?")) {
      return;
    }

    try {
      await deleteAgreement(id);
      setHistoryItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("Failed to delete agreement:", err);
    }
  };

  const handleOpenReport = async (item) => {
    setLoading(true);
    try {
      const fullReport = await getAgreementReport(item.id);
      navigate('/report', { state: { agreement: fullReport } });
    } catch (err) {
      console.error("Failed to load full report:", err);
      navigate('/report', { state: { agreement: item } });
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = historyItems.filter(item => {
    return item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (item.summary || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getRiskBadge = (risk) => {
    const r = (risk || '').toLowerCase();
    if (r === 'high') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
          <AlertTriangle className="w-3.5 h-3.5" />
          High Risk
        </span>
      );
    }
    if (r === 'medium') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          <HelpCircle className="w-3.5 h-3.5" />
          Medium Risk
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Low Risk
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Audit Archive
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Agreement Review History
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Access past lease audits, revisit counter-proposals, or purge records.
          </p>
        </div>

        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm transition-all"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Audit New Document</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs w-full sm:w-auto justify-center">
          {['all', 'high', 'medium', 'low'].map(r => (
            <button
              key={r}
              onClick={() => setFilterRisk(r)}
              className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-colors ${
                filterRisk === r
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {r === 'all' ? 'All Risks' : r}
            </button>
          ))}
        </div>
      </div>

      {/* History Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-sm text-slate-500">Loading audit records...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Review Records Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            You haven't audited any rental agreements matching this filter yet.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm"
          >
            Upload Your First Lease
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => handleOpenReport(item)}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-md cursor-pointer space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                      {item.filename}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Audited {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {getRiskBadge(item.overall_risk)}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {item.summary || "No executive summary available."}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                    <p className="font-bold text-slate-900 dark:text-white">{item.clause_count}</p>
                    <p className="text-[10px] text-slate-400">Total Clauses</p>
                  </div>
                  <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60">
                    <p className="font-bold text-rose-600 dark:text-rose-400">{item.high_risk_count}</p>
                    <p className="text-[10px] text-rose-500">High Risk</p>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60">
                    <p className="font-bold text-amber-600 dark:text-amber-400">{item.missing_protections_count}</p>
                    <p className="text-[10px] text-amber-500">Missing</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Report</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleDelete(item.id, e)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                  title="Delete from history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
