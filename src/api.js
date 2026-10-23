/**
 * RentWise API Client
 * Connects React frontend to the FastAPI backend running on port 8000.
 * Falls back to demo state if backend server is not active during local UI prototyping.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// 5 Curated Sample Agreements for Stage 5 Testing
export const FIVE_SAMPLE_AGREEMENTS = [
  {
    id: 1,
    title: "1. Predatory Landlord Lease",
    subtitle: "Severe landlord bias, arbitrary deposit forfeiture & 24h eviction",
    filename: "sample_1_predatory_landlord_lease.pdf",
    file_type: "application/pdf",
    status: "analyzed",
    overall_risk: "high",
    summary: "This agreement contains severe landlord-favoring clauses. It allows arbitrary withholding of the $3,000 security deposit without receipts, unilateral rent increases on 7 days verbal notice, an asymmetrical notice period (90 days for tenant, 3 days for landlord), and unlawful self-help lockouts without court proceedings.",
    missing_protections: [
      "No 24-hour advance written notice requirement before landlord entry",
      "Absence of statutory deadline for security deposit return",
      "No formal written cure period prior to eviction",
      "Landlord structural maintenance obligation missing"
    ],
    clauses: [
      {
        id: 101,
        agreement_id: 1,
        category: "deposit",
        risk: "high",
        text: "The Landlord retains absolute discretion to withhold any or all of the $3,000 security deposit for painting or normal wear, with no itemized statement or refund deadline.",
        explanation: "Allows the landlord to confiscate your security deposit without accounting for legitimate repair costs.",
        suggestion: "Propose: 'Deposit must be returned within 21 days with itemized receipts and photos for any deduction beyond reasonable wear.'"
      },
      {
        id: 102,
        agreement_id: 1,
        category: "rent increase",
        risk: "high",
        text: "Landlord reserves the unilateral right to increase rent by any percentage at any point during tenancy upon giving 7 days verbal notice.",
        explanation: "Verbal rent increases on 7 days notice leave you completely vulnerable to unexpected cost spikes.",
        suggestion: "Propose: 'Rent is fixed for the 12-month term; renewal increase capped at 4% with 60 days advance written notice.'"
      },
      {
        id: 103,
        agreement_id: 1,
        category: "notice period",
        risk: "high",
        text: "Tenant must give 90 days notice before vacating. Landlord may terminate tenancy at any time with 3 days written notice without cause.",
        explanation: "Extremely unfair asymmetrical notice window.",
        suggestion: "Propose: 'Mutual 30-day (or 60-day) equal written notice period for both parties.'"
      },
      {
        id: 104,
        agreement_id: 1,
        category: "eviction",
        risk: "high",
        text: "If rent is overdue by 24 hours, Landlord may change locks, shut off utilities, and dispose of possessions without court proceedings.",
        explanation: "Self-help lockouts and utility disconnections are unlawful and dangerous.",
        suggestion: "Propose: 'Landlord must provide a formal 7-day written notice to cure before initiating any formal legal eviction proceeding.'"
      }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: "2. Student Sublease Trap",
    subtitle: "Rigid 12-month lock-in, extreme guest bans & unannounced inspections",
    filename: "sample_2_student_sublease_trap.pdf",
    file_type: "application/pdf",
    status: "analyzed",
    overall_risk: "high",
    summary: "A student-targeted lease with punitive penalties. Includes a mandatory non-refundable $350 turnover fee, unconditional 12-month lock-in even if taking summer internships or graduating, $150 unannounced visitor fines, and unannounced inspections at any hour.",
    missing_protections: [
      "No 24-hour notice before landlord/maintenance room entry",
      "No release clause for university graduation or internship transfer",
      "Right to reasonable quiet enjoyment and reasonable guest policy"
    ],
    clauses: [
      {
        id: 201,
        agreement_id: 2,
        category: "lock-in",
        risk: "high",
        text: "The lease is strictly binding for 12 months. Tenant cannot break the lease for summer internships or graduation without paying the entire remaining annual rent upfront.",
        explanation: "Traps students into paying thousands of dollars for vacant months during summer internships or study abroad.",
        suggestion: "Propose: 'Tenant may terminate early or sublease during summer months with 30 days notice and finding a suitable replacement student.'"
      },
      {
        id: 202,
        agreement_id: 2,
        category: "subletting",
        risk: "medium",
        text: "Subletting is permitted only during summer term with Landlord approval and payment of an upfront $500 sublease administrative fee.",
        explanation: "The $500 fee is an unnecessary penalty designed to discourage legal subletting.",
        suggestion: "Propose: 'Subletting permitted with reasonable written consent; administrative fee capped at $50 for credit check.'"
      }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    title: "3. Standard City Apartment",
    subtitle: "Typical urban lease with standard market terms and moderate clauses",
    filename: "sample_3_standard_urban_apartment.pdf",
    file_type: "application/pdf",
    status: "analyzed",
    overall_risk: "medium",
    summary: "A fairly typical metropolitan apartment lease. It features standard 30-day deposit refund terms, a $50 late fee after a 5-day grace period, 24-hour notice for entry, and reasonable landlord structural maintenance with tenant covering minor wear under $75.",
    missing_protections: [
      "Rent increase cap upon renewal is not specified",
      "Escrow account protection for security deposit not mentioned"
    ],
    clauses: [
      {
        id: 301,
        agreement_id: 3,
        category: "deposit",
        risk: "low",
        text: "Landlord shall refund the $1,500 deposit within 30 days following surrender, less legitimate deductions for damages beyond reasonable wear.",
        explanation: "Standard market term. 30 days is acceptable in most jurisdictions.",
        suggestion: "Acceptable as is, or request 21 days with itemized receipts if required by municipal regulations."
      },
      {
        id: 302,
        agreement_id: 3,
        category: "maintenance",
        risk: "low",
        text: "Landlord maintains structural walls, foundation, and major heating systems. Tenant handles minor repairs under $75 per incident.",
        explanation: "Balanced split of duties: owner takes major building infrastructure while tenant manages minor fixtures.",
        suggestion: "Standard and fair term."
      }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    title: "4. Model Tenant-Protective Lease",
    subtitle: "Gold standard balanced contract with clear deadlines & habitability guarantees",
    filename: "sample_4_fair_tenant_protective_lease.pdf",
    file_type: "application/pdf",
    status: "analyzed",
    overall_risk: "low",
    summary: "This is a model, fair-housing compliant tenancy agreement. It protects the tenant with an interest-bearing deposit escrow, strict 21-day refund window with mandatory photo proof, CPI-capped rent hikes, guaranteed 24-hour entry notice, and a 10-day written cure notice before eviction.",
    missing_protections: [],
    clauses: [
      {
        id: 401,
        agreement_id: 4,
        category: "deposit",
        risk: "low",
        text: "Deposit placed in interest-bearing escrow. Landlord must return full deposit within 21 calendar days with photographic documentation and receipts for any deductions.",
        explanation: "Highly protective: guarantees transparency, proof, and strict timeline.",
        suggestion: "Excellent clause; standard to aim for in all leases."
      },
      {
        id: 402,
        agreement_id: 4,
        category: "rent increase",
        risk: "low",
        text: "Monthly rent fixed for 12 months. Any renewal increase is capped at local CPI (max 4%) with 60 days prior written notice.",
        explanation: "Protects tenant from sudden inflation and gives 2 full months to plan ahead.",
        suggestion: "Ideal tenant-friendly protection."
      }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    title: "5. 'As-Is' Commercial Trap",
    subtitle: "Predatory lease forcing tenant to pay building property taxes and structural repairs",
    filename: "sample_5_as_is_commercial_style_trap.pdf",
    file_type: "application/pdf",
    status: "analyzed",
    overall_risk: "high",
    summary: "An improper 'triple net' commercial-style lease applied to a residential home. Forces the tenant to waive habitability rights ('as-is' condition), pay the landlord's property tax and insurance hikes, and take on full financial liability for roof and plumbing replacements.",
    missing_protections: [
      "Complete absence of implied warranty of habitability",
      "No landlord responsibility for roof, plumbing, or heating machinery",
      "Missing quiet enjoyment and tenant indemnity protection"
    ],
    clauses: [
      {
        id: 501,
        agreement_id: 5,
        category: "maintenance",
        risk: "high",
        text: "Tenant accepts property strictly 'AS-IS', waiving all statutory warranties of habitability. Tenant must replace and maintain HVAC machinery and roofing at own cost.",
        explanation: "Illegal in residential tenancy: landlords are legally bound to provide a habitable home and cannot offload roof and HVAC replacements onto renters.",
        suggestion: "Crucial rejection: 'Strike this entire clause; Landlord must warrant habitability and maintain structural and mechanical systems.'"
      },
      {
        id: 502,
        agreement_id: 5,
        category: "rent increase",
        risk: "high",
        text: "Tenant agrees to pay a proportionate 15% share of any municipal property tax increases or insurance spikes incurred by the building.",
        explanation: "Shifts the landlord's investment tax risk onto the tenant.",
        suggestion: "Propose: 'Rent is all-inclusive; property taxes and building insurance remain the sole responsibility of the property owner.'"
      }
    ],
    created_at: new Date().toISOString()
  }
];

export const DEMO_AGREEMENT = FIVE_SAMPLE_AGREEMENTS[0];

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
    const found = FIVE_SAMPLE_AGREEMENTS.find(a => a.id === Number(agreementId));
    return found || DEMO_AGREEMENT;
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
    let items = FIVE_SAMPLE_AGREEMENTS.map(a => ({
      id: a.id,
      filename: a.filename,
      file_type: a.file_type,
      status: a.status,
      summary: a.summary,
      overall_risk: a.overall_risk,
      clause_count: a.clauses.length,
      high_risk_count: a.clauses.filter(c => c.risk === 'high').length,
      medium_risk_count: a.clauses.filter(c => c.risk === 'medium').length,
      low_risk_count: a.clauses.filter(c => c.risk === 'low').length,
      missing_protections_count: a.missing_protections.length,
      created_at: a.created_at
    }));

    if (risk) {
      items = items.filter(i => i.overall_risk === risk);
    }

    return {
      total: items.length,
      limit,
      offset,
      items
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
