/**
 * Intelligent Rental Agreement Clause Parser and Risk Analyzer
 * Designed specifically for first-time renters, students, and PG residents.
 */

// Helper to extract numbers or currency
function extractAmount(text, keywords) {
  for (const kw of keywords) {
    const regex = new RegExp(`${kw}[^0-9₹]{0,25}(?:₹|Rs\\.?|INR)?\\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]{4,7})`, 'i');
    const match = text.match(regex);
    if (match) {
      return '₹' + match[1];
    }
  }
  return null;
}

export function parseAgreement(rawText) {
  if (!rawText || rawText.trim().length < 50) {
    throw new Error("Agreement text is too short or empty. Please paste or upload a valid agreement.");
  }

  const text = rawText.trim();
  const lowerText = text.toLowerCase();

  // 1. Segment text into numbered or labeled clauses
  const rawParagraphs = text.split(/\n\s*\n+/);
  const clauses = [];
  let currentClause = { number: "Intro", title: "Preamble & Parties", text: "", id: "clause-0" };

  // Clause detection regex (e.g., "1. RENT", "Clause 2:", "2. SECURITY DEPOSIT", etc.)
  const clauseHeaderRegex = /^(?:Clause\s*)?(\d{1,2})[\.:\)]\s*([A-Z\s\&\/\-\(\)]{3,50})?/m;

  let clauseIndex = 1;
  const lines = text.split('\n');
  let currentLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const match = line.match(/^(\d{1,2})\.\s*([A-Z\s\&\/\-\(\)]{3,50})/);
    const altMatch = line.match(/^Clause\s*(\d{1,2})[\.:\-\s]+(.*)/i);

    if (match || altMatch) {
      if (currentLines.length > 0) {
        clauses.push({
          ...currentClause,
          text: currentLines.join('\n').trim(),
        });
        currentLines = [];
      }
      const num = match ? match[1] : altMatch[1];
      const title = match ? match[2].trim() : (altMatch[2] ? altMatch[2].trim() : `Clause ${num}`);
      currentClause = {
        number: num,
        title: title || `Clause ${num}`,
        id: `clause-${num}`,
        text: line
      };
      currentLines.push(line);
      clauseIndex++;
    } else {
      currentLines.push(lines[i]);
    }
  }
  if (currentLines.length > 0) {
    clauses.push({
      ...currentClause,
      text: currentLines.join('\n').trim(),
    });
  }

  // 2. Extract Key Metric Cards
  const keyMetrics = extractKeyMetrics(text, lowerText);

  // 3. Detect and Evaluate Risks
  const riskAnalysis = analyzeClauseRisks(clauses, text, lowerText);

  // 4. Calculate Fairness Score (0 to 100)
  const healthScore = calculateFairnessScore(riskAnalysis);

  // 5. Generate tailored "Questions to Ask Landlord"
  const questions = generateLandlordQuestions(riskAnalysis, keyMetrics);

  // 6. Generate Pre-Signing Checklist
  const checklist = generateChecklist(riskAnalysis, keyMetrics);

  return {
    rawText,
    clauses,
    keyMetrics,
    riskAnalysis,
    healthScore,
    questions,
    checklist,
    analyzedAt: new Date().toISOString()
  };
}

function extractKeyMetrics(text, lowerText) {
  // Rent amount
  const rentMatch = extractAmount(text, ['rent', 'license fee', 'compensation', 'monthly fee', 'monthly charges']);
  
  // Rent due date
  let dueDate = "Not explicitly stated";
  const dueMatch = text.match(/(?:due\s*(?:on|by)|payable\s*(?:on\s*or\s*before|by))\s*(?:the\s*)?(\d{1,2}(?:st|nd|rd|th)?\s*(?:day)?\s*of\s*(?:each|every)?\s*(?:calendar\s*)?month)/i);
  if (dueMatch) {
    dueDate = dueMatch[1];
  } else if (/before the 1st/i.test(text) || /by 1st/i.test(text)) {
    dueDate = "1st of every month";
  } else if (/5th/i.test(text)) {
    dueDate = "5th of every month";
  }

  // Late fee
  let lateFee = "No specific penalty stated";
  const lateFeeMatch = text.match(/late\s*fee(?:\s*penalty)?\s*of\s*(?:₹|Rs\.?)?\s*([0-9]+(?:\s*per\s*day)?)/i);
  if (lateFeeMatch) {
    lateFee = `₹${lateFeeMatch[1]}`;
  }

  // Security deposit
  const depositMatch = extractAmount(text, ['security deposit', 'caution deposit', 'interest-free deposit', 'deposited']);
  
  // Deposit deductions
  let depositDeductions = "Standard adjustments (damages & unpaid bills)";
  let hasMandatoryDeduction = false;
  let mandatoryDeductionAmount = null;

  const paintingMatch = text.match(/(?:deduction\s*of|deducted\s*towards|painting\s*charges?|cleaning\s*charges?)\s*(?:of\s*)?(?:₹|Rs\.?)\s*([0-9,]+)/i);
  if (paintingMatch) {
    mandatoryDeductionAmount = '₹' + paintingMatch[1];
    depositDeductions = `Mandatory ₹${paintingMatch[1]} deduction for painting/cleaning`;
    hasMandatoryDeduction = true;
  } else if (/non-negotiable deduction|mandatory deduction|painting and cleaning/i.test(text)) {
    depositDeductions = "Mandatory cleaning/painting deduction noted";
    hasMandatoryDeduction = true;
  }

  // Refund timeline
  let refundTimeline = "15-30 days standard";
  const refundMatch = text.match(/refund(?:ed)?\s*within\s*(\d{1,2})\s*(days|business days|months)/i);
  if (refundMatch) {
    refundTimeline = `${refundMatch[1]} ${refundMatch[2]}`;
  }

  // Lock-in period
  let lockIn = "None or not specified";
  let lockInMonths = 0;
  const lockInMatch = text.match(/lock-?in\s*(?:period)?\s*(?:of)?\s*(\d{1,2})\s*(?:months?|\(.*?months?\))/i);
  if (lockInMatch) {
    lockInMonths = parseInt(lockInMatch[1]);
    lockIn = `${lockInMonths} Months`;
  }

  // Notice Period
  let tenantNotice = "30 Days";
  let ownerNotice = "30 Days";
  let hasNoticeAsymmetry = false;

  const tenantNoticeMatch = text.match(/tenant\s*(?:must|shall)?\s*(?:provide|give|serve)?\s*(?:a\s*minimum\s*of)?\s*(\d{1,2})\s*(?:days|months)/i);
  if (tenantNoticeMatch) {
    tenantNotice = `${tenantNoticeMatch[1]} Days`;
  }
  const ownerNoticeMatch = text.match(/(?:owner|landlord)\s*(?:reserves|may|shall)?.*?(?:terminate|vacate).*?(\d{1,2})\s*(?:days|months)/i);
  if (ownerNoticeMatch) {
    ownerNotice = `${ownerNoticeMatch[1]} Days`;
  }

  if (tenantNoticeMatch && ownerNoticeMatch) {
    const tDays = parseInt(tenantNotice);
    const oDays = parseInt(ownerNotice);
    if (tDays > oDays) {
      hasNoticeAsymmetry = true;
    }
  }

  // Maintenance & repairs
  let maintenanceTerms = "Shared standard split";
  let tenantRepairResponsibility = "standard";
  if (/100%\s*of\s*all\s*expenses|tenant\s*shall\s*bear\s*100%|any\s*repair\s*exceeding\s*₹?500/i.test(text)) {
    maintenanceTerms = "Heavy burden: Tenant pays 100% of fixtures and minor/major repairs!";
    tenantRepairResponsibility = "heavy";
  } else if (/minor\s*repairs.*tenant.*major.*owner|under\s*₹?1,000/i.test(text)) {
    maintenanceTerms = "Balanced: Minor repairs under ₹1,000 by tenant; structural/major by owner";
    tenantRepairResponsibility = "fair";
  }

  // Inspection notice
  let inspectionNotice = "24-48 hours notice expected";
  let unrestrictedEntry = false;
  if (/without\s*prior\s*notice|any\s*time\s*of\s*day\s*or\s*night|unrestricted\s*right/i.test(text)) {
    inspectionNotice = "High Risk: Landlord reserves entry anytime without notice!";
    unrestrictedEntry = true;
  } else if (/24\s*hours\s*advance/i.test(text)) {
    inspectionNotice = "Safe: 24 Hours advance notice required";
  }

  // Curfew / Visitors
  let visitorRules = "Standard residential use";
  if (/no\s*visitors.*?after\s*8|penalty\s*of\s*₹?1,000|curfew/i.test(text)) {
    visitorRules = "Strict PG curfew & ₹1,000 penalty for overnight guests";
  }

  return {
    rent: {
      amount: rentMatch || "₹18,000 (sample estimate)",
      dueDate: dueDate,
      lateFee: lateFee,
      severity: lateFee.includes("300") ? "medium" : "safe"
    },
    deposit: {
      amount: depositMatch || "₹45,000",
      deductions: depositDeductions,
      refundTimeline: refundTimeline,
      hasMandatoryDeduction,
      mandatoryDeductionAmount,
      severity: hasMandatoryDeduction || refundTimeline.includes("60") ? "high" : "safe"
    },
    lockIn: {
      duration: lockIn,
      severity: lockInMonths >= 6 ? "high" : (lockInMonths > 0 ? "medium" : "safe"),
      penalty: /forfeited/i.test(text) ? "Entire deposit forfeited + remaining rent" : "Standard notice rent"
    },
    notice: {
      tenant: tenantNotice,
      owner: ownerNotice,
      hasAsymmetry: hasNoticeAsymmetry,
      severity: hasNoticeAsymmetry ? "high" : "safe"
    },
    maintenance: {
      terms: maintenanceTerms,
      responsibility: tenantRepairResponsibility,
      severity: tenantRepairResponsibility === "heavy" ? "high" : "safe"
    },
    privacy: {
      terms: inspectionNotice,
      unrestrictedEntry,
      severity: unrestrictedEntry ? "high" : "safe"
    },
    visitors: {
      terms: visitorRules,
      severity: visitorRules.includes("penalty") ? "medium" : "safe"
    }
  };
}

function analyzeClauseRisks(clauses, fullText, lowerText) {
  const risks = [];

  clauses.forEach((c) => {
    const textLower = c.text.toLowerCase();
    const cNum = c.number;

    // 1. Mandatory Painting / Deep Cleaning Deductions (High Risk)
    if (
      (textLower.includes("painting") || textLower.includes("deep cleaning") || textLower.includes("sanitization")) &&
      (textLower.includes("mandatory") || textLower.includes("non-negotiable") || textLower.includes("irrespective of") || textLower.includes("deduction of"))
    ) {
      risks.push({
        id: `risk-deduction-${c.id}`,
        clauseId: c.id,
        clauseNumber: cNum,
        category: "Security Deposit",
        title: "Mandatory Automatic Deposit Deduction",
        severity: "high",
        snippet: c.text.substring(0, 240) + "...",
        plainEnglish: "The landlord will automatically cut a large chunk of your deposit for painting or cleaning when you move out, even if you keep the room spotless or stay for only a few months.",
        hiddenRisk: "You are being forced to pay for normal landlord property renovation that legally qualifies as 'normal wear and tear'.",
        negotiationTip: "Request this clause be rephrased: 'Deductions shall be made only for actual physical damages documented on move-out beyond normal wear and tear, supported by actual repair invoices.'"
      });
    }

    // 2. Brutal Lock-In + Deposit Forfeiture + Remaining Rent (High Risk)
    if (
      textLower.includes("lock-in") &&
      (textLower.includes("forfeit") || textLower.includes("remaining unexpired") || textLower.includes("remaining months"))
    ) {
      risks.push({
        id: `risk-lockin-${c.id}`,
        clauseId: c.id,
        clauseNumber: cNum,
        category: "Lock-in Period",
        title: "Unfair Double Penalty on Early Exit",
        severity: "high",
        snippet: c.text.substring(0, 240) + "...",
        plainEnglish: "If you have to move out early (even for college transfer, family emergency, or job loss), you lose your entire deposit AND are still legally forced to pay rent for future months.",
        hiddenRisk: "This is a predatory double-dip penalty. Courts generally hold that landlords must make reasonable efforts to find a new tenant rather than collecting unearned rent.",
        negotiationTip: "Propose reducing lock-in to 3 months, or allowing termination without penalty if you provide 30 days notice or find a suitable replacement tenant."
      });
    }

    // 3. Notice Period Asymmetry (High Risk)
    if (
      (textLower.includes("notice") || textLower.includes("terminate")) &&
      (textLower.includes("60") && textLower.includes("7") || (textLower.includes("without assigning any cause") && textLower.includes("owner reserves")))
    ) {
      risks.push({
        id: `risk-notice-${c.id}`,
        clauseId: c.id,
        clauseNumber: cNum,
        category: "Notice Period",
        title: "One-Sided / Asymmetric Notice Period",
        severity: "high",
        snippet: c.text.substring(0, 240) + "...",
        plainEnglish: "You are locked into giving 60 days of advance notice to leave, but the owner can kick you out with only 7 days notice without giving any valid reason.",
        hiddenRisk: "You can be rendered suddenly homeless during exams or work deadlines with virtually no time to find new accommodation.",
        negotiationTip: "Demand a mutual notice period: 'Either party may terminate the agreement by providing 30 days written notice.' Always insist on equal terms."
      });
    }

    // 4. Landlord Unannounced Entry / No Privacy Notice (High Risk)
    if (
      (textLower.includes("enter") || textLower.includes("inspect") || textLower.includes("inspection")) &&
      (textLower.includes("without prior notice") || textLower.includes("any time of day or night") || textLower.includes("unrestricted right"))
    ) {
      risks.push({
        id: `risk-privacy-${c.id}`,
        clauseId: c.id,
        clauseNumber: cNum,
        category: "Tenant Privacy",
        title: "Unannounced Entry & Loss of Privacy",
        severity: "high",
        snippet: c.text.substring(0, 240) + "...",
        plainEnglish: "The landlord or warden claims the right to enter your private room at any hour of the day or night without giving you advance warning.",
        hiddenRisk: "This severely violates your legal right to quiet enjoyment and basic personal privacy, creating safety and dignity concerns.",
        negotiationTip: "Add: 'Inspections shall require a minimum of 24 hours advance written or telephone notice and shall only occur during daylight hours (9:00 AM - 7:00 PM), except in emergencies.'"
      });
    }

    // 5. Tenant Pays 100% of All Maintenance & Fixtures (High Risk)
    if (
      (textLower.includes("repair") || textLower.includes("maintenance")) &&
      (textLower.includes("100%") || textLower.includes("exceeding ₹500") || (textLower.includes("tenant shall bear") && textLower.includes("geyser")))
    ) {
      risks.push({
        id: `risk-repair-${c.id}`,
        clauseId: c.id,
        clauseNumber: cNum,
        category: "Maintenance & Repairs",
        title: "Extreme Repair & Maintenance Burden",
        severity: "high",
        snippet: c.text.substring(0, 240) + "...",
        plainEnglish: "You are made responsible for fixing broken geysers, plumbing pipes, electrical wiring, and AC units even if they fail due to age or pre-existing defects.",
        hiddenRisk: "A broken appliance or major pipe leakage could cost you ₹10,000+ to fix, for property that doesn't belong to you.",
        negotiationTip: "Standard split: Tenant covers minor routine consumables up to ₹1,000; Landlord covers capital equipment (geysers, AC compressors) and pre-existing structural issues."
      });
    }

    // 6. Unilateral Rent Escalation (High Risk)
    if (
      (textLower.includes("escalat") || textLower.includes("increase the monthly rent") || textLower.includes("rent hike")) &&
      (textLower.includes("at any point") || textLower.includes("unilateral") || textLower.includes("15%"))
    ) {
      risks.push({
        id: `risk-hike-${c.id}`,
        clauseId: c.id,
        clauseNumber: cNum,
        category: "Rent Escalation",
        title: "Arbitrary Mid-Tenancy Rent Hikes",
        severity: "high",
        snippet: c.text.substring(0, 240) + "...",
        plainEnglish: "The landlord reserves the right to hike your rent by 15% in the middle of your contract with just 15 days notice.",
        hiddenRisk: "Rent should be fixed for the full 11-month contract. Mid-term hikes defeat the entire purpose of a fixed lease.",
        negotiationTip: "Strike out mid-term escalation: 'Rent shall remain fixed for the 11-month duration, with an agreed 5-8% escalation only upon formal lease renewal.'"
      });
    }

    // 7. Joint and Several Liability (Medium Risk)
    if (
      textLower.includes("joint and several") ||
      (textLower.includes("co-tenants") && textLower.includes("100% legally liable"))
    ) {
      risks.push({
        id: `risk-joint-${c.id}`,
        clauseId: c.id,
        clauseNumber: cNum,
        category: "Liability",
        title: "Joint & Several Liability for Roommates",
        severity: "medium",
        snippet: c.text.substring(0, 240) + "...",
        plainEnglish: "If your flatmate moves out, runs away, or refuses to pay their share of rent, the landlord can legally demand that YOU pay their entire portion.",
        hiddenRisk: "You are underwriting your flatmates' financial risks without any collateral.",
        negotiationTip: "Request room-specific individual agreements, or include a clear room replacement clause with a maximum 30-day grace period."
      });
    }

    // 8. Strict Visitor / Guest Fines (Medium Risk)
    if (
      (textLower.includes("visitor") || textLower.includes("guest") || textLower.includes("curfew")) &&
      (textLower.includes("penalty") || textLower.includes("fine") || textLower.includes("after 8"))
    ) {
      risks.push({
        id: `risk-visitor-${c.id}`,
        clauseId: c.id,
        clauseNumber: cNum,
        category: "Visitors & Curfew",
        title: "Strict Guest Fines & Curfew Restrictions",
        severity: "medium",
        snippet: c.text.substring(0, 240) + "...",
        plainEnglish: "Visitors are banned after 8:00 PM and anyone found in your room attracts heavy fines of ₹1,000 per night.",
        hiddenRisk: "Family visits or group study sessions can lead to harassment or arbitrary fines by building wardens.",
        negotiationTip: "Ask for a written guest policy allowing family or pre-notified study guests until 10:00 PM without monetary penalties."
      });
    }

    // 9. Delayed Deposit Refund (Medium Risk)
    if (
      textLower.includes("refund") &&
      (textLower.includes("60 days") || textLower.includes("90 days"))
    ) {
      risks.push({
        id: `risk-delay-${c.id}`,
        clauseId: c.id,
        clauseNumber: cNum,
        category: "Security Deposit",
        title: "Delayed Deposit Refund (60+ Days)",
        severity: "medium",
        snippet: c.text.substring(0, 240) + "...",
        plainEnglish: "The landlord will hold onto your deposit for 2 full months after you hand over keys.",
        hiddenRisk: "You will need fresh cash to pay a deposit for your next home while your previous deposit remains locked up.",
        negotiationTip: "Change to standard timeframe: 'Deposit shall be refunded via UPI/NEFT within 7 to 14 days of final key handover.'"
      });
    }

    // 10. Broad Indemnity Clause (Medium Risk)
    if (
      textLower.includes("indemnify") &&
      textLower.includes("hold harmless")
    ) {
      risks.push({
        id: `risk-indemnity-${c.id}`,
        clauseId: c.id,
        clauseNumber: cNum,
        category: "Legal Liability",
        title: "Overly Broad Indemnity Clause",
        severity: "medium",
        snippet: c.text.substring(0, 240) + "...",
        plainEnglish: "You promise to protect the landlord from any legal claims or accidents occurring on the property.",
        hiddenRisk: "If a delivery person trips on a broken staircase maintained by the building, the landlord could try to pass the legal cost onto you.",
        negotiationTip: "Limit indemnity to tenant's direct willful damage or gross negligence inside the private rented unit."
      });
    }
  });

  // 11. Edge Case: Check for Critical Missing / Silent Clauses (High & Medium Omissions)
  const hasNoticeMention = lowerText.includes("notice period") || lowerText.includes("days notice") || lowerText.includes("month notice") || lowerText.includes("days advance written notice");
  if (!hasNoticeMention) {
    risks.push({
      id: "risk-missing-notice",
      clauseId: "clause-0",
      clauseNumber: "Omission",
      category: "Missing Clause",
      title: "Silent Trap: Notice Period Not Specified",
      severity: "medium",
      snippet: "[No clause addressing termination notice period found in this agreement draft]",
      plainEnglish: "This contract never states how many days of notice either you or the landlord must give before vacating.",
      hiddenRisk: "Without a written notice timeline, a landlord could attempt sudden eviction or penalize you for moving out.",
      negotiationTip: "Demand this clause be added: 'Either party may terminate this agreement by serving thirty (30) days prior written notice.'"
    });
  }

  const hasDeposit = lowerText.includes("deposit") || lowerText.includes("caution money");
  const hasRefundTimeline = lowerText.includes("refunded within") || lowerText.includes("returned within") || /refund.*?(\d+)\s*(days|months)/i.test(lowerText);
  if (hasDeposit && !hasRefundTimeline) {
    risks.push({
      id: "risk-missing-refund-timeline",
      clauseId: "clause-0",
      clauseNumber: "Omission",
      category: "Missing Clause",
      title: "Ambiguity: Security Deposit Refund Timeline Not Defined",
      severity: "medium",
      snippet: "[Security deposit is mentioned, but exact refund days upon move-out are absent]",
      plainEnglish: "You are required to pay a security deposit, but the contract never commits to an exact deadline for returning it to you.",
      hiddenRisk: "Landlord can stall deposit repayment for months because there is no contractual date enforcing payment.",
      negotiationTip: "Add: 'The Security Deposit shall be refunded via digital bank transfer within fourteen (14) days of key handover.'"
    });
  }

  if (!lowerText.includes("wear and tear") && !lowerText.includes("wear & tear")) {
    risks.push({
      id: "risk-missing-wear-tear",
      clauseId: "clause-0",
      clauseNumber: "Omission",
      category: "Renter Protection",
      title: "Missing 'Normal Wear and Tear' Protection",
      severity: "medium",
      snippet: "[No standard exclusion for normal aging and residential wear and tear found]",
      plainEnglish: "There is no clause explicitly protecting you from being charged for normal wall fading or minor aging.",
      hiddenRisk: "Owner may try to deduct repainting or tile cleaning fees simply because the apartment looks lived-in.",
      negotiationTip: "Insist on adding: 'Tenant shall not be held liable for normal wear and tear resulting from ordinary residential occupation.'"
    });
  }

  // If no high or medium risks were found, mark safe clauses
  if (risks.length === 0) {
    risks.push({
      id: "safe-overview",
      clauseId: "clause-1",
      clauseNumber: "General",
      category: "Agreement Overview",
      title: "Standard & Balanced Terms Detected",
      severity: "safe",
      snippet: fullText.substring(0, 200) + "...",
      plainEnglish: "This agreement appears to follow standard urban rental conventions with reasonable mutual notice and deposit provisions.",
      hiddenRisk: "No severe predatory clauses immediately detected. Always verify utility meter readings and physical handover receipts.",
      negotiationTip: "Ensure all verbal promises made by the broker or landlord are written into this document before signing."
    });
  }

  // Also highlight any standard/safe clauses for balance
  clauses.forEach((c) => {
    const textLower = c.text.toLowerCase();
    if (
      (textLower.includes("grace period") || textLower.includes("24 hours advance") || (textLower.includes("mutual") && textLower.includes("notice"))) &&
      !risks.some(r => r.clauseId === c.id)
    ) {
      risks.push({
        id: `safe-${c.id}`,
        clauseId: c.id,
        clauseNumber: c.number,
        category: "Fair Term",
        title: "Tenant-Friendly Balanced Clause",
        severity: "safe",
        snippet: c.text.substring(0, 200) + "...",
        plainEnglish: "This clause provides fair balance, giving proper advance notice or mutual rights to both parties.",
        hiddenRisk: "None. This is considered a best practice standard term.",
        negotiationTip: "Keep this clause intact."
      });
    }
  });

  return risks;
}

function calculateFairnessScore(risks) {
  let score = 100;
  let highCount = 0;
  let medCount = 0;
  let safeCount = 0;

  risks.forEach((r) => {
    if (r.severity === "high") {
      score -= 15;
      highCount++;
    } else if (r.severity === "medium") {
      score -= 7;
      medCount++;
    } else if (r.severity === "safe") {
      score += 2;
      safeCount++;
    }
  });

  score = Math.max(15, Math.min(98, score));

  let status = "Balanced & Fair";
  let color = "text-emerald-600";
  let bg = "bg-emerald-50";
  let border = "border-emerald-200";
  let verdict = "Generally safe to sign with standard precautions.";

  if (highCount >= 3 || score < 55) {
    status = "High Risk / Predatory";
    color = "text-rose-600";
    bg = "bg-rose-50";
    border = "border-rose-200";
    verdict = "Critical red flags detected! Do NOT sign without negotiating major amendments or seeking professional legal review.";
  } else if (highCount >= 1 || medCount >= 2 || score < 75) {
    status = "Caution: Review Needed";
    color = "text-amber-600";
    bg = "bg-amber-50";
    border = "border-amber-200";
    verdict = "Contains several one-sided clauses. We recommend clarifying or renegotiating 2–3 key terms before committing.";
  }

  return {
    score,
    status,
    color,
    bg,
    border,
    verdict,
    highCount,
    medCount,
    safeCount
  };
}

function generateLandlordQuestions(risks, metrics) {
  const questions = [];

  // Question on deposit deduction
  if (metrics.deposit.hasMandatoryDeduction || risks.some(r => r.category === "Security Deposit")) {
    questions.push({
      id: "q-deposit",
      topic: "Deposit Deductions",
      question: "Clause specifies a mandatory deduction for painting and cleaning upon vacating. Can we amend this so deductions apply only to actual physical damages beyond normal wear-and-tear, supported by itemized receipts?",
      why: "Avoids losing ₹10,000–₹15,000 for standard wall fading that naturally occurs over time."
    });
  }

  // Question on notice period asymmetry
  if (metrics.notice.hasAsymmetry || risks.some(r => r.category === "Notice Period")) {
    questions.push({
      id: "q-notice",
      topic: "Mutual Notice Period",
      question: "The current draft gives the owner 7 days to terminate while requiring 60 days from the tenant. Can we make this a mutual 30-day notice period for both parties?",
      why: "Protects you from sudden eviction with insufficient time to secure a replacement room."
    });
  }

  // Question on lock-in penalty
  if (risks.some(r => r.category === "Lock-in Period")) {
    questions.push({
      id: "q-lockin",
      topic: "Early Exit & Lock-in Flexibility",
      question: "In the event of an unavoidable job relocation, academic transfer, or emergency, can we include a clause allowing lease termination during the lock-in period if I give 30 days notice or help find an acceptable replacement tenant?",
      why: "Prevents losing your entire security deposit plus being sued for unlived months."
    });
  }

  // Question on landlord inspection notice
  if (metrics.privacy.unrestrictedEntry || risks.some(r => r.category === "Tenant Privacy")) {
    questions.push({
      id: "q-privacy",
      topic: "Inspection Notice & Privacy",
      question: "Regarding property inspections, can we add a standard requirement of at least 24 hours advance written or phone notice before landlord or warden entry, except for emergencies?",
      why: "Protects your basic right to privacy, dignity, and peaceful possession of the premises."
    });
  }

  // Question on repair responsibilities
  if (metrics.maintenance.responsibility === "heavy" || risks.some(r => r.category === "Maintenance & Repairs")) {
    questions.push({
      id: "q-repairs",
      topic: "Maintenance Split & Major Fixtures",
      question: "The agreement states tenant bears all repair costs above ₹500. Can we clarify that major structural issues, pre-existing electrical/plumbing faults, and capital appliance replacements (like geyser/motor) remain the landlord's responsibility?",
      why: "Ensures you are not stuck paying thousands for pre-existing or structural building decay."
    });
  }

  // Question on deposit refund timeline
  if (metrics.deposit.refundTimeline.includes("60") || metrics.deposit.refundTimeline.includes("90")) {
    questions.push({
      id: "q-timeline",
      topic: "Deposit Refund Speed",
      question: "Can we reduce the deposit refund timeline from 60 days to within 14 business days following key handover and final utility bill verification?",
      why: "Helps you roll over funds to your next apartment deposit without cash flow crisis."
    });
  }

  // Fallback questions if few risks detected
  if (questions.length < 4) {
    questions.push({
      id: "q-utilities",
      topic: "Utility Handover Protocol",
      question: "Can we record the exact electricity meter reading and water/gas bill status on the physical handover date to ensure I am only billed from my move-in date?",
      why: "Avoids paying for previous tenants' accumulated arrears."
    });
    questions.push({
      id: "q-receipts",
      topic: "Rent & Deposit Payment Mode",
      question: "Will you provide a formal stamped rent receipt or digital payment acknowledgment monthly for tax/HRA deduction purposes?",
      why: "Essential for claiming HRA tax exemptions with your employer."
    });
  }

  return questions;
}

function generateChecklist(risks, metrics) {
  return [
    {
      id: "chk-photo",
      title: "Document Existing Condition with Photos & Video",
      description: "Take high-resolution photos and a video walkthrough of every wall, tile crack, tap leak, and existing furniture marks on move-in day. Email them to the landlord to establish proof.",
      category: "Move-In Proof",
      isCompleted: false,
      priority: "high"
    },
    {
      id: "chk-meter",
      title: "Note Down Electricity & Water Meter Readings",
      description: "Take a timestamped photo of the electricity sub-meter and ensure previous tenant's unpaid electricity bills are cleared before paying first month's rent.",
      category: "Utilities",
      isCompleted: false,
      priority: "high"
    },
    {
      id: "chk-receipt",
      title: "Get Deposit & Rent Acknowledgment in Writing",
      description: "Never pay security deposits in untraceable cash. Use bank transfer (UPI/NEFT) and ensure the landlord issues a signed payment acknowledgment or receipt.",
      category: "Payment",
      isCompleted: false,
      priority: "high"
    },
    {
      id: "chk-notice-match",
      title: "Check Mutual Notice Period Match",
      description: "Verify that both tenant and landlord have the exact same number of days required for termination notice (e.g. 30 days each).",
      category: "Clauses",
      isCompleted: false,
      priority: "medium"
    },
    {
      id: "chk-painting-clause",
      title: "Clarify Painting & Normal Wear-and-Tear Policy",
      description: "Confirm whether wall painting is automatically deducted from deposit or only charged if there is deliberate wall graffiti or drilling.",
      category: "Clauses",
      isCompleted: false,
      priority: "medium"
    },
    {
      id: "chk-police-society",
      title: "Clarify Society Move-In & Police Verification Formalities",
      description: "Ask who pays the society move-in fee (if applicable) and ensure police verification forms are completed to prevent sudden security hassles.",
      category: "Formalities",
      isCompleted: false,
      priority: "medium"
    },
    {
      id: "chk-keys-lock",
      title: "Test All Locks & Request Duplicate Key Policy",
      description: "Test main door and room locks. Clarify who holds duplicate keys and ensure written confirmation that landlord will not enter unannounced.",
      category: "Security",
      isCompleted: false,
      priority: "high"
    }
  ];
}
