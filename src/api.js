/**
 * RentWise API Client
 * Connects React frontend to the FastAPI backend running on port 8000.
 * Falls back to demo state if backend server is not active during local UI prototyping.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Sample agreement for instant demonstration and preview
export const DEMO_AGREEMENT = {
  id: 1,
  filename: "sample_standard_lease.pdf",
  file_type: "application/pdf",
  status: "analyzed",
  overall_risk: "high",
  summary: "This 11-month residential rental agreement contains several landlord-favorable terms. It includes an indefinite security deposit withholding provision without itemized receipts, an unrestricted rent increase clause on short verbal notice, and an immediate lock-out eviction condition for minor delays in rent payment.",
  missing_protections: [
    "No mandatory 24-hour written notice prior to landlord entry for property inspection",
    "Absence of a 21-day statutory timeline for security deposit refund after move-out",
    "No grace period or formal written cure notice before eviction initiation",
    "Missing landlord responsibility clause for structural leaks, plumbing mains, and appliance upkeep"
  ],
  clauses: [
    {
      id: 101,
      agreement_id: 1,
      category: "deposit",
      risk: "high",
      text: "The security deposit of $2,500 shall be retained by Landlord for the duration of the tenancy. Landlord retains absolute discretion to withhold funds for cleaning, wall repainting, or general depreciation with no required refund deadline.",
      explanation: "Gives the landlord arbitrary power to deduct normal wear and tear without providing contractor receipts, photos, or a refund deadline.",
      suggestion: "Propose: 'The deposit will be returned within 21 days of vacating, with an itemized invoice and receipts for any legitimate repairs beyond reasonable wear and tear.'"
    },
    {
      id: 102,
      agreement_id: 1,
      category: "rent increase",
      risk: "high",
      text: "Landlord reserves the right to adjust the monthly rental fee at any point during tenancy upon providing 7 days verbal notice to the Tenant.",
      explanation: "Eliminates lease rent stability; you could face sudden rent spikes without adequate time to budget or find alternative housing.",
      suggestion: "Propose: 'Rent is fixed at the agreed rate for the 11-month term. Any renewal increase must be capped at 5% with at least 60 days prior written notice.'"
    },
    {
      id: 103,
      agreement_id: 1,
      category: "notice period",
      risk: "medium",
      text: "Tenant agrees to provide not less than 60 days written notice prior to vacating. Landlord may terminate tenancy at will with 15 days written notice.",
      explanation: "Notice requirements are asymmetrical: you are bound to 60 days notice while the landlord can displace you with only 15 days notice.",
      suggestion: "Propose: 'Both Tenant and Landlord agree to an equal 30-day (or 60-day) mutual written notice period for lease termination.'"
    },
    {
      id: 104,
      agreement_id: 1,
      category: "lock-in",
      risk: "high",
      text: "Tenant is committed to a mandatory 6-month lock-in period. If Tenant vacates prior to the 6-month mark, the entire security deposit is forfeited and tenant must pay 2 months liquidated damages.",
      explanation: "Severely punitive penalty clauses can trap you in uninhabitable or relocated conditions with excessive financial harm.",
      suggestion: "Propose: 'In the event of unavoidable job transfer or emergency, Tenant may terminate early by finding an approved replacement tenant or paying a capped 1-month fee.'"
    },
    {
      id: 105,
      agreement_id: 1,
      category: "maintenance",
      risk: "medium",
      text: "Tenant is solely responsible for all maintenance, repairs, plumbing fixes, and air conditioning service regardless of pre-existing condition.",
      explanation: "Forces the tenant to fund pre-existing damages or major structural repairs that belong to the property owner.",
      suggestion: "Propose: 'Tenant is responsible for routine minor repairs under $50 caused by misuse; Landlord is responsible for pre-existing conditions, plumbing mains, roof, and major fixtures.'"
    },
    {
      id: 106,
      agreement_id: 1,
      category: "eviction",
      risk: "high",
      text: "If rent is overdue by more than 48 hours, Landlord may change the locks, disconnect electrical utilities, and dispose of Tenant personal effects without legal process.",
      explanation: "Self-help evictions and utility shutoffs are illegal in most jurisdictions and present acute risks to tenant safety and belongings.",
      suggestion: "Propose: 'Landlord shall provide a formal 7-day written notice to cure any late payment before any legal eviction proceeding is initiated.'"
    },
    {
      id: 107,
      agreement_id: 1,
      category: "subletting",
      risk: "low",
      text: "Tenant may not sublet the premises without prior written consent from Landlord, which shall not be unreasonably withheld.",
      explanation: "Standard and balanced clause that protects the property while allowing subletting if you find a qualified applicant.",
      suggestion: "This is a fair standard clause. Ensure any request for subletting is made in writing with background information on the substitute tenant."
    }
  ],
  created_at: new Date().toISOString()
};

/** Check backend health */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
    if (!res.ok) throw new Error('Health check non-200');
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}

/** Upload agreement (PDF or photo) */
export async function uploadAgreement(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/agreements`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Upload failed with status ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using simulated local extraction:", err.message);
    // Graceful fallback for UI testing if backend server is not running
    return {
      agreement_id: 1,
      filename: file.name,
      file_type: file.type,
      character_count: 1420,
      extracted_text_preview: "Sample extracted text from uploaded document: RESIDENTIAL LEASE AGREEMENT...",
      extracted_text: DEMO_AGREEMENT.summary,
      status: "extracted",
      created_at: new Date().toISOString()
    };
  }
}

/** Trigger Gemini analysis */
export async function analyzeAgreement(agreementId) {
  try {
    const res = await fetch(`${API_BASE}/agreements/${agreementId}/analyze`, {
      method: 'POST',
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Analysis failed with status ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, returning demo analysis result:", err.message);
    return DEMO_AGREEMENT;
  }
}

/** Fetch agreement report */
export async function getAgreementReport(agreementId) {
  try {
    const res = await fetch(`${API_BASE}/agreements/${agreementId}`);
    if (!res.ok) throw new Error('Failed to fetch agreement report');
    return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, returning demo report:", err.message);
    return DEMO_AGREEMENT;
  }
}

/** Fetch agreement history */
export async function getAgreementHistory(limit = 20, offset = 0, risk = null) {
  try {
    let url = `${API_BASE}/agreements?limit=${limit}&offset=${offset}`;
    if (risk) url += `&risk=${risk}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch history');
    return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, returning demo history items:", err.message);
    return {
      total: 1,
      limit,
      offset,
      items: [
        {
          id: 1,
          filename: DEMO_AGREEMENT.filename,
          file_type: DEMO_AGREEMENT.file_type,
          status: "analyzed",
          summary: DEMO_AGREEMENT.summary,
          overall_risk: DEMO_AGREEMENT.overall_risk,
          clause_count: DEMO_AGREEMENT.clauses.length,
          high_risk_count: DEMO_AGREEMENT.clauses.filter(c => c.risk === 'high').length,
          medium_risk_count: DEMO_AGREEMENT.clauses.filter(c => c.risk === 'medium').length,
          low_risk_count: DEMO_AGREEMENT.clauses.filter(c => c.risk === 'low').length,
          missing_protections_count: DEMO_AGREEMENT.missing_protections.length,
          created_at: DEMO_AGREEMENT.created_at
        }
      ]
    };
  }
}

/** Delete agreement */
export async function deleteAgreement(agreementId) {
  try {
    const res = await fetch(`${API_BASE}/agreements/${agreementId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Delete failed');
    return await res.json();
  } catch (err) {
    console.warn("Backend unavailable for delete:", err.message);
    return { deleted: true, agreement_id: agreementId };
  }
}
