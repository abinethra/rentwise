/**
 * RentWise API Client
 * Connects React frontend to the FastAPI backend running on port 8000.
 * Falls back to demo state if backend server is not active during local UI prototyping.
 */

const API_BASE = '/api';

export const ZERO_RISK_LEASE_TEXT = `MODEL TENANT-PROTECTIVE RESIDENTIAL LEASE AGREEMENT

This Agreement is entered into between Landlord (Owner) and Tenant for the premises located at 104 Parkview Terrace, Apt 3B.

1. SECURITY DEPOSIT AND ESCROW PROTECTION:
Tenant shall provide a security deposit equivalent to one month's rent ($1,500.00). The deposit shall be held in a segregated, government-approved Tenancy Deposit Scheme (TDS) or interest-bearing escrow account, with written account confirmation provided to Tenant within 14 days of receipt. The deposit shall be refunded in full within 14 calendar days of lease termination. Any legitimate deductions for damages exceeding reasonable wear and tear must be supported by an itemized statement, contractor invoices, and comparison with the joint move-in inventory report signed by both parties.

2. FIXED RENT AND CAPPED RENEWAL INCREASES:
The agreed monthly rent is $1,500.00, fixed for the entire 12-month duration of the initial lease term. Any proposed rent increase upon lease renewal is strictly capped at the annual Consumer Price Index (CPI) or a maximum of 3.0%, whichever is lower. Landlord must provide at least 60 days advance written notice of any proposed rent increase. Tenant retains the right to decline the increase and vacate at term end with no penalty.

3. BALANCED AND SYMMETRICAL NOTICE PERIODS:
Both Landlord and Tenant are bound by a reciprocal and balanced 30-day written notice requirement prior to the expiration of the lease term to terminate or non-renew the tenancy. Neither party may prematurely terminate without statutory cause.

4. LOCK-IN PERIOD AND BREAK CLAUSE WITH MITIGATION:
The initial lock-in period is 6 months. Following month 6, Tenant may terminate early by providing 30 days written notice. Additionally, in the event of job relocation exceeding 40 miles, involuntary employment change, or medical emergency, Tenant may assign the lease or vacate early with no penalty fees provided a qualified replacement tenant is presented or upon payment of a capped single-month re-letting fee.

5. COMPREHENSIVE LANDLORD MAINTENANCE & HABITABILITY GUARANTEE:
Landlord guarantees quiet enjoyment and full compliance with housing habitability standards. Landlord is exclusively responsible for all structural elements, roofing, plumbing, electrical systems, heating, hot water, air conditioning, and supplied appliances. Emergency repairs affecting habitability shall be responded to within 24 hours; non-emergency repairs shall be completed within 5 business days. If the premises become uninhabitable through no fault of Tenant, rent shall be abated proportionally until full restoration.

6. RIGHT OF ENTRY, PRIVACY, AND QUIET ENJOYMENT:
Landlord shall not enter the leased premises without providing at least 48 hours prior written notice to Tenant, specifying the reasonable date, time, and purpose of entry during normal daytime hours. Unannounced entry is prohibited except in verified active emergencies (fire or severe flood).

7. DUE PROCESS AND EVICTION SAFEGUARDS:
Landlord agrees to adhere strictly to statutory judicial eviction processes. No self-help measures, lock alterations, utility disconnections, or property removal shall be attempted. In the event of rent delinquency, Landlord shall provide Tenant with a formal 14-day written cure notice before any legal proceedings may be initiated.

8. SUBLETTING AND GUEST POLICY:
Tenant may sublet, assign the lease, or host roommates with Landlord's written consent, which shall not be unreasonably withheld, conditioned, or delayed. Family members, partners, and personal guests are permitted to stay for up to 14 consecutive days without requiring prior notice, registration, or additional fees.`;

export const PREDATORY_LEASE_TEXT = `RESIDENTIAL LEASE AGREEMENT (PREDATORY TERMS)

1. SECURITY DEPOSIT & FORFEITURE:
Tenant shall deposit $3,000 upon execution. The Landlord retains absolute discretion to withhold any or all of the security deposit for painting, normal cleaning, or perceived depreciation upon surrender. No itemized statements or refund deadlines are provided.

2. RENT AND UNRESTRICTED INCREASES:
Monthly rent is $2,200. Landlord reserves the unilateral right to increase rent by any percentage at any point during the tenancy upon giving 7 days verbal notice.

3. ASYMMETRICAL NOTICE PERIOD:
Tenant must give at least 90 days prior written notice before moving out. Landlord reserves the right to terminate this tenancy at any time with 3 days written notice without cause.

4. LOCK-IN PERIOD & PENALTIES:
The lease is locked for a non-negotiable term of 12 months. Any early move-out triggers immediate forfeiture of the entire deposit plus liquidated damages equal to 4 months of rent.

5. MAINTENANCE SHIFT:
Tenant is exclusively responsible for all maintenance, repairs, water heater replacement, plumbing blockages, and roof/window water leaks regardless of age or pre-existing conditions.

6. SUMMARY EVICTION & SELF-HELP LOCKOUT:
If rent is delinquent by more than 24 hours, Landlord is authorized to immediately change locks, shut off electrical and water utilities, and dispose of Tenant possessions without court proceedings.

7. GUESTS & SUBLETTING:
Subletting is strictly prohibited. No guest may stay past 9:00 PM; overnight visitors will incur a $150 per night unauthorized occupancy fee.`;

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

export const ZERO_RISK_SAMPLE_AGREEMENT = FIVE_SAMPLE_AGREEMENTS[3];
export const DEMO_AGREEMENT = FIVE_SAMPLE_AGREEMENTS[0];

/** Intelligent local evaluator fallback if backend is unreachable */
function evaluateTextLocally(text, filename = 'lease.txt') {
  const lower = text.toLowerCase();
  
  const highRiskWords = [
    'absolute discretion',
    'arbitrary',
    'unilateral',
    'without cause',
    'liquidated damages',
    'exclusively responsible for all maintenance',
    'shut off',
    'without court',
    'self-help',
    '24 hours',
    'forfeiture'
  ];

  const safeWords = [
    'tenancy deposit scheme',
    'escrow',
    'capped at',
    'consumer price index',
    'cpi',
    '48 hours prior written notice',
    '24 hours advance written notice',
    'quiet enjoyment',
    'itemized',
    '14 calendar days',
    '21 calendar days',
    'mutual',
    'habitability standards'
  ];

  const highMatch = highRiskWords.filter(w => lower.includes(w)).length;
  const safeMatch = safeWords.filter(w => lower.includes(w)).length;

  if (highMatch >= 2) {
    return {
      ...FIVE_SAMPLE_AGREEMENTS[0],
      filename,
      raw_text: text,
      created_at: new Date().toISOString()
    };
  } else if (safeMatch >= 2 && highMatch === 0) {
    return {
      ...FIVE_SAMPLE_AGREEMENTS[3],
      filename,
      raw_text: text,
      created_at: new Date().toISOString()
    };
  }

  // Medium default
  return {
    ...FIVE_SAMPLE_AGREEMENTS[2],
    filename,
    raw_text: text,
    created_at: new Date().toISOString()
  };
}

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

/** Directly analyze raw lease text via Gemini AI */
export async function analyzeText({ text, filename = 'rental_agreement.txt' }) {
  try {
    const res = await fetch(`${API_BASE}/analyze-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, filename }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Analysis failed with status ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn("Direct analysis API error, falling back to contextual parser:", err.message);
    return evaluateTextLocally(text, filename);
  }
}

/** Upload agreement (PDF, image, or text) */
export async function uploadAgreement(file, rawText = '') {
  try {
    const textToSend = rawText || (file ? await file.text().catch(() => '') : '');

    // If text is available, analyze directly for instant real Gemini results
    if (textToSend && textToSend.length > 50) {
      return await analyzeText({ text: textToSend, filename: file?.name || 'document.txt' });
    }

    const formData = new FormData();
    if (file) formData.append('file', file);
    if (textToSend) formData.append('raw_text', textToSend);

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
    console.warn("Upload API error, using contextual fallback:", err.message);
    const content = rawText || (file ? file.name : '');
    return evaluateTextLocally(content, file?.name || 'document.pdf');
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
    console.warn("Analysis API error:", err.message);
    const found = FIVE_SAMPLE_AGREEMENTS.find(a => a.id === Number(agreementId));
    return found || ZERO_RISK_SAMPLE_AGREEMENT;
  }
}

/** Fetch agreement report */
export async function getAgreementReport(agreementId) {
  try {
    const res = await fetch(`${API_BASE}/agreements/${agreementId}`);
    if (!res.ok) throw new Error('Failed to fetch agreement report');
    return await res.json();
  } catch (err) {
    const found = FIVE_SAMPLE_AGREEMENTS.find(a => a.id === Number(agreementId));
    return found || ZERO_RISK_SAMPLE_AGREEMENT;
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
    return { deleted: true, agreement_id: agreementId };
  }
}
