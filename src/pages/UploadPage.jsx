import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  FlaskConical,
  ClipboardPaste,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';
import { 
  uploadAgreement, 
  analyzeText, 
  FIVE_SAMPLE_AGREEMENTS,
  ZERO_RISK_LEASE_TEXT,
  PREDATORY_LEASE_TEXT
} from '../api';

export default function UploadPage() {
  const [activeTab, setActiveTab] = useState('paste'); // 'paste' | 'upload' | 'samples'
  const [pastedText, setPastedText] = useState(ZERO_RISK_LEASE_TEXT);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const ALLOWED_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'txt'];
  const MAX_SIZE_MB = 10;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  const validateFile = (selectedFile) => {
    setErrorMessage('');
    if (!selectedFile) return false;

    if (selectedFile.size > MAX_SIZE_BYTES) {
      setErrorMessage(`File is too large (${(selectedFile.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is ${MAX_SIZE_MB}MB.`);
      return false;
    }

    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      setErrorMessage(`Unsupported format .${ext}. Please upload a PDF, TXT, or image file.`);
      return false;
    }

    return true;
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected && validateFile(selected)) {
      setFile(selected);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  };

  const handleAnalyzePastedText = async () => {
    if (!pastedText.trim()) {
      setErrorMessage('Please paste lease agreement text before analyzing.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setProgressStep('Running 7-point legal risk analysis with Gemini AI...');

    try {
      const result = await analyzeText({
        text: pastedText,
        filename: 'pasted_lease_agreement.txt'
      });

      setProgressStep('Analysis complete! Redirecting to report...');
      setTimeout(() => {
        navigate('/report', { state: { agreement: result } });
      }, 500);
    } catch (err) {
      console.error("Text analysis error:", err);
      setErrorMessage(err.message || 'Analysis failed. Please try again.');
      setLoading(false);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setErrorMessage('');

    try {
      setProgressStep('Reading document and extracting text...');
      
      let rawText = '';
      if (file.name.endsWith('.txt')) {
        rawText = await file.text();
      }

      setProgressStep('Running 7-point legal risk analysis with Gemini AI...');
      const analysisResult = await uploadAgreement(file, rawText);

      setProgressStep('Analysis complete! Redirecting to report...');
      setTimeout(() => {
        navigate('/report', { state: { agreement: analysisResult } });
      }, 500);

    } catch (err) {
      console.error("Upload error:", err);
      setErrorMessage(err.message || 'Failed to process agreement.');
      setLoading(false);
    }
  };

  const handleLoadSample = (sampleAgreement) => {
    setLoading(true);
    setProgressStep(`Loading ${sampleAgreement.title}...`);
    setTimeout(() => {
      navigate('/report', { state: { agreement: sampleAgreement } });
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini 3.8 Flash • 7-Category Legal Tenancy Review</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Analyze Your Rental Agreement
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto text-sm sm:text-base">
          Paste your lease text directly or upload a document to detect hidden clauses, deposit risks, unfair notice periods, and missing tenant protections.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'paste'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ClipboardPaste className="w-4 h-4" />
            <span>Paste Lease Text</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'upload'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload File (PDF/TXT)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('samples')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'samples'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>5 Curated Samples</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PASTE LEASE TEXT */}
      {activeTab === 'paste' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Quick Test Presets:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setPastedText(ZERO_RISK_LEASE_TEXT)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-medium hover:bg-emerald-100 transition-colors border border-emerald-200 dark:border-emerald-800"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Fill No-Risk Lease (Low Risk)</span>
              </button>
              <button
                type="button"
                onClick={() => setPastedText(PREDATORY_LEASE_TEXT)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-medium hover:bg-rose-100 transition-colors border border-rose-200 dark:border-rose-800"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Fill Predatory Lease (High Risk)</span>
              </button>
              <button
                type="button"
                onClick={() => setPastedText('')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-200 transition-colors"
                title="Clear text"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Lease Agreement Text
            </label>
            <textarea
              rows={12}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste the text of your rental contract, lease clauses, or tenancy agreement here..."
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed resize-y"
            />
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>{pastedText.length} characters</span>
              <span>Evaluates: Deposit, Rent Hike, Notice, Lock-in, Repairs, Eviction, Subletting</span>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Loading status */}
          {loading && (
            <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-3">
              <div className="flex items-center gap-3 text-blue-700 dark:text-blue-300 font-medium text-sm">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
                <span>{progressStep}</span>
              </div>
              <div className="w-full bg-blue-200/60 dark:bg-blue-900/50 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          )}

          {/* Action button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleAnalyzePastedText}
              disabled={!pastedText.trim() || loading}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-md ${
                pastedText.trim() && !loading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 hover:scale-105'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>Analyze Lease with Gemini</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: UPLOAD FILE */}
      {activeTab === 'upload' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !loading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 scale-[0.99]'
                : file
                ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
              onChange={handleFileChange}
              className="hidden"
              disabled={loading}
            />

            <div className="flex flex-col items-center justify-center space-y-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                file 
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
              }`}>
                {file ? (
                  <CheckCircle2 className="w-8 h-8" />
                ) : (
                  <UploadCloud className="w-8 h-8" />
                )}
              </div>

              {file ? (
                <div className="space-y-1">
                  <p className="text-base font-semibold text-slate-900 dark:text-white">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for Analysis
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="text-xs text-rose-600 hover:underline pt-2"
                  >
                    Change file
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                    Click to choose a file or drag and drop here
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Supported formats: PDF, TXT, PNG, JPG, WEBP (Max 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {loading && (
            <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-3">
              <div className="flex items-center gap-3 text-blue-700 dark:text-blue-300 font-medium text-sm">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
                <span>{progressStep}</span>
              </div>
              <div className="w-full bg-blue-200/60 dark:bg-blue-900/50 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleUploadAndAnalyze}
              disabled={!file || loading}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-md ${
                file && !loading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 hover:scale-105'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>Run Gemini Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Validated & isolated with cryptographic nonce delimiters</span>
            </span>
            <span className="hidden sm:inline">Server-side Gemini 3.8 Flash Engine</span>
          </div>
        </div>
      )}

      {/* TAB 3: 5 CURATED SAMPLES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Instant Benchmark Leases
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Click any card to inspect report</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FIVE_SAMPLE_AGREEMENTS.map((sample) => {
            const isHigh = sample.overall_risk === 'high';
            const isMed = sample.overall_risk === 'medium';

            return (
              <div
                key={sample.id}
                onClick={() => handleLoadSample(sample)}
                className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.01] flex flex-col justify-between ${
                  isHigh 
                    ? 'border-rose-200/80 dark:border-rose-950/60 hover:border-rose-400' 
                    : isMed
                    ? 'border-amber-200/80 dark:border-amber-950/60 hover:border-amber-400'
                    : 'border-emerald-200/80 dark:border-emerald-950/60 hover:border-emerald-400'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {sample.title}
                    </h3>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      isHigh
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : isMed
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {sample.overall_risk} Risk
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {sample.subtitle}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-medium">
                  <span>{sample.clauses.length} Clauses • {sample.missing_protections.length} Missing</span>
                  <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
