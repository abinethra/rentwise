"""
Five Curated Sample Rental Agreements for RentWise Evaluation Suite.

Covers diverse real-world rental scenarios:
1. SAMPLE_1_PREDATORY: Severe landlord bias, arbitrary deposit deductions, 24h lockout eviction.
2. SAMPLE_2_STUDENT_TRAP: Strict 12-month lock-in, severe guest prohibitions, unannounced inspections.
3. SAMPLE_3_URBAN_STANDARD: Typical city apartment lease with moderate standard market terms.
4. SAMPLE_4_BALANCED_MODEL: Model tenant-protective agreement with fair notice and clear timelines.
5. SAMPLE_5_COMMERCIAL_TRAP: "As-is" clause shifting structural repairs & property taxes onto tenant.
"""

SAMPLE_AGREEMENTS = [
    {
        "id": "sample_1_predatory",
        "title": "Predatory Landlord Lease (High Risk)",
        "expected_risk": "high",
        "filename": "sample_1_predatory_landlord_lease.txt",
        "text": """
RESIDENTIAL LEASE AGREEMENT (PREDATORY TERMS)

1. SECURITY DEPOSIT & FORFEITURE:
Tenant shall deposit $3,000 upon execution. The Landlord retains absolute discretion to withhold
any or all of the security deposit for painting, normal cleaning, or perceived depreciation upon
surrender. No itemized statements or refund deadlines are provided.

2. RENT AND UNRESTRICTED INCREASES:
Monthly rent is $2,200. Landlord reserves the unilateral right to increase rent by any percentage
at any point during the tenancy upon giving 7 days verbal notice.

3. ASYMMETRICAL NOTICE PERIOD:
Tenant must give at least 90 days prior written notice before moving out. Landlord reserves the
right to terminate this tenancy at any time with 3 days written notice without cause.

4. LOCK-IN PERIOD & PENALTIES:
The lease is locked for a non-negotiable term of 12 months. Any early move-out triggers immediate
forfeiture of the entire deposit plus liquidated damages equal to 4 months of rent.

5. MAINTENANCE SHIFT:
Tenant is exclusively responsible for all maintenance, repairs, water heater replacement, plumbing
blockages, and roof/window water leaks regardless of age or pre-existing conditions.

6. SUMMARY EVICTION & SELF-HELP LOCKOUT:
If rent is delinquent by more than 24 hours, Landlord is authorized to immediately change locks,
shut off electrical and water utilities, and dispose of Tenant possessions without court proceedings.

7. GUESTS & SUBLETTING:
Subletting is strictly prohibited. No guest may stay past 9:00 PM; overnight visitors will incur
a $150 per night unauthorized occupancy fee.
"""
    },
    {
        "id": "sample_2_student_trap",
        "title": "Student Campus Sublease Trap (High/Medium Risk)",
        "expected_risk": "high",
        "filename": "sample_2_student_sublease_trap.txt",
        "text": """
COLLEGE HOUSING LEASE AGREEMENT

1. DEPOSIT & ADMIN FEES:
Security deposit of $1,800. A non-refundable $350 "Move-Out Turnover Administrative Fee" will be
automatically deducted from the deposit regardless of unit cleanliness. Remaining funds will be
returned within 60 days of graduation ceremonies.

2. LOCK-IN & SEMESTER RESTRICTIONS:
The agreement is binding for 12 months. Tenant cannot break the lease for summer internships,
graduation, or campus withdrawal without paying the entire remaining annual rent upfront.

3. LANDLORD ENTRY & SURVEILLANCE:
Landlord and maintenance staff may enter the apartment at any hour without prior notice for
random safety checks and cleanliness inspections.

4. GUEST RESTRICTIONS:
Tenant may host a maximum of one guest for no more than 2 nights per calendar month. Overnight
guests must register with building management 48 hours in advance and pay a $25 processing fee.

5. MAINTENANCE & APPLIANCES:
Repairs to refrigerator, microwave, and air conditioning must be funded 50% by the Tenant,
regardless of standard wear and tear.

6. SUBLETTING:
Subletting is permitted only during summer term with Landlord approval and payment of a $500
sublease registration fee.
"""
    },
    {
        "id": "sample_3_urban_standard",
        "title": "Standard City Apartment Lease (Medium Risk)",
        "expected_risk": "medium",
        "filename": "sample_3_standard_urban_apartment.txt",
        "text": """
APARTMENT LEASE AGREEMENT (METRO REALTY)

1. SECURITY DEPOSIT:
Tenant deposits $1,500 as security. Landlord shall refund the deposit within 30 days following
complete surrender of the premises, less legitimate deductions for damages beyond reasonable wear.

2. RENT AND PAYMENT:
Rent is $1,500 payable on the first day of each calendar month. A late fee of $50 is applied
after a 5-day grace period.

3. NOTICE PERIOD:
Either party may terminate this agreement upon expiration of the initial term by providing at
least 60 days written notice to the other party.

4. MAINTENANCE OBLIGATIONS:
Landlord shall maintain the structural walls, foundation, and major heating systems. Tenant
agrees to handle minor routine maintenance and repairs costing under $75 per incident.

5. LANDLORD ENTRY:
Landlord may enter the premises for repairs, pest control, or showing to prospective buyers
between 9 AM and 6 PM after giving at least 24 hours advance notice.

6. PETS & SUBLETTING:
Subletting requires prior written consent from the Landlord, which shall not be unreasonably
withheld. Domestic pets require an additional refundable deposit of $300.

7. TERMINATION & CURE:
In the event of non-payment of rent, Landlord shall provide 14 days written notice to cure before
commencing formal eviction proceedings under municipal housing law.
"""
    },
    {
        "id": "sample_4_balanced_model",
        "title": "Model Tenant-Protective Lease (Low Risk / Fair)",
        "expected_risk": "low",
        "filename": "sample_4_fair_tenant_protective_lease.txt",
        "text": """
STANDARD RESIDENTIAL TENANCY AGREEMENT (FAIR HOUSING COMPLIANT)

1. SECURITY DEPOSIT SAFEGUARD:
Tenant shall provide a security deposit equivalent to one month rent ($1,600). The deposit shall
be placed in an interest-bearing escrow account. Landlord shall return the full deposit within
21 calendar days of move-out accompanied by photographic documentation and itemized receipts for
any legitimate repair costs.

2. FIXED RENT & CAPPED ADJUSTMENTS:
Monthly rent is fixed at $1,600 for the 12-month lease term. Any subsequent rent increase upon
renewal is capped at local CPI index (maximum 4%) and requires at least 60 days prior written notice.

3. MUTUAL BALANCED NOTICE:
Both Tenant and Landlord agree to a mutual 30-day written notice requirement for lease non-renewal
or termination following the expiration of the initial term.

4. EARLY TERMINATION RELIEF:
In the event of tenant job relocation exceeding 50 miles or medical emergency, Tenant may terminate
this lease early by providing 30 days written notice and a replacement tenant or a capped 1-month fee.

5. REPAIRS & HABITABILITY GUARANTEE:
Landlord guarantees quiet enjoyment and full compliance with housing habitability standards.
Landlord is responsible for all electrical, plumbing, roof, heating, and major appliances.
Tenant is responsible only for intentional damages and minor repairs under $25.

6. ENTRY NOTICE & PRIVACY:
Landlord must provide a minimum of 24 hours advance written notice prior to entering the premises,
except in verified immediate emergencies.

7. DUE PROCESS & EVICTION CURE:
Landlord will provide a formal 10-day written cure notice for late rent before any formal legal
proceedings may commence.
"""
    },
    {
        "id": "sample_5_commercial_trap",
        "title": "\"As-Is\" Commercial-Style Trap (High Risk)",
        "expected_risk": "high",
        "filename": "sample_5_as_is_commercial_style_trap.txt",
        "text": """
INDIVIDUAL RESIDENCE LEASE AGREEMENT (NET LEASE COVENANT)

1. AS-IS WAIVER OF HABITABILITY:
Tenant acknowledges having inspected the premises and accepts the property strictly "AS-IS",
waiving all statutory warranties of habitability and fitness for human occupation.

2. TAX & OPERATING EXPENSE SHIFT:
In addition to base rent of $2,100, Tenant agrees to pay a proportionate 15% share of any municipal
property tax increases, building insurance spikes, and sewer assessments incurred by the property.

3. INDEMNIFICATION & LIABILITY:
Tenant agrees to indemnify, defend, and hold harmless Landlord from all claims, injuries, slips,
falls, or property destruction occurring on the premises, regardless of Landlord negligence.

4. REPAIR OBLIGATION:
Tenant shall at its own cost replace and maintain all HVAC machinery, roofing membranes, and
plumbing fixtures.

5. TERMINATION AT WILL:
Landlord may terminate this lease without penalty upon 10 days notice if Landlord decides to
renovate or sell the property, without relocation assistance for Tenant.
"""
    }
]
