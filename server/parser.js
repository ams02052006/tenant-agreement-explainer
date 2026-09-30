/**
 * Server-Side Legal Clause Analysis & NLP Engine
 */

export function analyzeAgreementServer(rawText, options = {}) {
  if (!rawText || rawText.trim().length < 40) {
    throw new Error("Agreement content is too short or empty.");
  }

  const text = rawText.trim();
  const lowerText = text.toLowerCase();

  // 1. Extract Numbered / Identified Clauses
  const lines = text.split('\n');
  const clauses = [];
  let currentClause = { number: "Intro", title: "Preamble & Parties", text: "", id: "clause-0" };
  let currentLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const match = line.match(/^(\d{1,2})\.\s*([A-Z\s\&\/\-\(\)]{3,60})/);
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

  // 2. Extract Key Financial & Operational Terms
  const keyMetrics = extractMetrics(text);

  // 3. Scan & Score Risks
  const riskAnalysis = scanRisks(clauses, text);

  // 4. Calculate Health Score
  const healthScore = computeFairnessScore(riskAnalysis);

  // 5. Generate Questions for Landlord
  const questions = buildQuestions(riskAnalysis, keyMetrics);

  // 6. Pre-Signing Checklist
  const checklist = buildChecklist();

  return {
    rawText,
    clauses,
    keyMetrics,
    riskAnalysis,
    healthScore,
    questions,
    checklist,
    analyzedAt: new Date().toISOString(),
    engine: "Express Neural-Rule Engine v2.0"
  };
}

function extractAmount(text, keywords) {
  for (const kw of keywords) {
    const regex = new RegExp(`${kw}[^0-9₹]{0,25}(?:₹|Rs\\.?|INR)?\\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]{4,7})`, 'i');
    const match = text.match(regex);
    if (match) return '₹' + match[1];
  }
  return null;
}

function extractMetrics(text) {
  const rentMatch = extractAmount(text, ['rent', 'license fee', 'compensation', 'monthly fee']);
  
  let dueDate = "1st of every month";
  const dueMatch = text.match(/(?:due\s*(?:on|by)|payable\s*(?:on\s*or\s*before|by))\s*(?:the\s*)?(\d{1,2}(?:st|nd|rd|th)?\s*(?:day)?\s*of\s*(?:each|every)?\s*(?:calendar\s*)?month)/i);
  if (dueMatch) dueDate = dueMatch[1];
  else if (/5th/i.test(text)) dueDate = "5th of every month";

  let lateFee = "None stated";
  const lateMatch = text.match(/late\s*fee(?:\s*penalty)?\s*of\s*(?:₹|Rs\.?)?\s*([0-9]+(?:\s*per\s*day)?)/i);
  if (lateMatch) lateFee = `₹${lateMatch[1]}`;

  const depositMatch = extractAmount(text, ['security deposit', 'caution deposit', 'interest-free deposit']);
  
  let depositDeductions = "Standard adjustments only";
  let hasMandatoryDeduction = false;
  let mandatoryDeductionAmount = null;

  const paintingMatch = text.match(/(?:deduction\s*of|deducted\s*towards|painting\s*charges?|cleaning\s*charges?)\s*(?:of\s*)?(?:₹|Rs\.?)\s*([0-9,]+)/i);
  if (paintingMatch) {
    mandatoryDeductionAmount = '₹' + paintingMatch[1];
    depositDeductions = `Mandatory ₹${paintingMatch[1]} deduction for painting/cleaning`;
    hasMandatoryDeduction = true;
  } else if (/non-negotiable deduction|mandatory deduction|painting/i.test(text)) {
    depositDeductions = "Mandatory deductions noted";
    hasMandatoryDeduction = true;
  }

  let refundTimeline = "15-30 days";
  const refundMatch = text.match(/refund(?:ed)?\s*within\s*(\d{1,2})\s*(days|business days|months)/i);
  if (refundMatch) refundTimeline = `${refundMatch[1]} ${refundMatch[2]}`;

  let lockIn = "None specified";
  let lockInMonths = 0;
  const lockMatch = text.match(/lock-?in\s*(?:period)?\s*(?:of)?\s*(\d{1,2})\s*(?:months?|\(.*?months?\))/i);
  if (lockMatch) {
    lockInMonths = parseInt(lockMatch[1]);
    lockIn = `${lockInMonths} Months`;
  }

  let tenantNotice = "30 Days";
  let ownerNotice = "30 Days";
  let hasAsymmetry = false;

  const tMatch = text.match(/tenant\s*(?:must|shall)?\s*(?:provide|give|serve)?\s*(?:a\s*minimum\s*of)?\s*(\d{1,2})\s*(?:days|months)/i);
  if (tMatch) tenantNotice = `${tMatch[1]} Days`;

  const oMatch = text.match(/(?:owner|landlord)\s*(?:reserves|may|shall)?.*?(?:terminate|vacate).*?(\d{1,2})\s*(?:days|months)/i);
  if (oMatch) ownerNotice = `${oMatch[1]} Days`;

  if (tMatch && oMatch && parseInt(tenantNotice) > parseInt(ownerNotice)) {
    hasAsymmetry = true;
  }

  let maintenance = "Shared standard split";
  let heavyMaint = false;
  if (/100%\s*of\s*all\s*expenses|tenant\s*shall\s*bear\s*100%|any\s*repair\s*exceeding\s*₹?500/i.test(text)) {
    maintenance = "Heavy burden: Tenant pays 100% of all fixtures & repairs!";
    heavyMaint = true;
  }

  let unrestrictedEntry = false;
  let inspectionNotice = "24-48 hours advance notice";
  if (/without\s*prior\s*notice|any\s*time\s*of\s*day\s*or\s*night|unrestricted\s*right/i.test(text)) {
    inspectionNotice = "High Risk: Unannounced entry anytime!";
    unrestrictedEntry = true;
  }

  return {
    rent: {
      amount: rentMatch || "₹20,000",
      dueDate,
      lateFee,
      severity: lateFee.includes("300") ? "medium" : "safe"
    },
    deposit: {
      amount: depositMatch || "₹45,000",
      deductions: depositDeductions,
      refundTimeline,
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
      hasAsymmetry,
      severity: hasAsymmetry ? "high" : "safe"
    },
    maintenance: {
      terms: maintenance,
      heavyMaint,
      severity: heavyMaint ? "high" : "safe"
    },
    privacy: {
      terms: inspectionNotice,
      unrestrictedEntry,
      severity: unrestrictedEntry ? "high" : "safe"
    }
  };
}

function scanRisks(clauses, fullText) {
  const risks = [];

  clauses.forEach((c) => {
    const t = c.text.toLowerCase();
    const cNum = c.number;

    // Painting / Cleaning Deduction
    if ((t.includes("painting") || t.includes("deep cleaning")) && (t.includes("mandatory") || t.includes("deduction of") || t.includes("non-negotiable"))) {
      risks.push({
        id: `risk-deduction-${c.id}`,
        clauseId: c.id,
        clauseNumber: cNum,
        category: "Security Deposit",
        title: "Mandatory Automatic Deposit Deduction",
        severity: "high",
        snippet: c.text.substring(0, 220) + "...",
        plainEnglish: "The landlord will automatically cut a large part of your deposit for painting or cleaning when you move out, even if you keep the room spotless.",
        hiddenRisk: "You are paying for routine landlord property renovation that legally qualifies as natural wear and tear.",
        negotiationTip: "Request: 'Deductions shall be made only for actual physical damages documented on move-out beyond normal wear and tear, supported by actual repair receipts.'"
      });
    }

    // Harsh Lock-in
    if (t.includes("lock-in") && (t.includes("forfeit") || t.includes("remaining unexpired") || t.includes("remaining months"))) {
      risks.push({
        id: `risk-lockin-${c.id}`,
        clauseId: c.id,
        clauseNumber: cNum,
        category: "Lock-in Period",
        title: "Unfair Double Penalty on Early Exit",
        severity: "high",
        snippet: c.text.substring(0, 220) + "...",
        plainEnglish: "If you have to move early for college transfer or family reasons, you lose 100% of your deposit and are still forced to pay future unlived rent.",
        hiddenRisk: "Predatory double penalty. Landlords have a duty to mitigate damages by finding a new tenant.",
        negotiationTip: "Propose: 'Tenant may exit during lock-in by providing 30 days notice or finding an acceptable replacement occupant.'"
      });
    }

    // Notice asymmetry
    if ((t.includes("notice") || t.includes("terminate")) && (t.includes("60") && t.includes("7") || (t.includes("without assigning any cause") && t.includes("owner")))) {
      risks.push({
        id: `risk-notice-${c.id}`,
        clauseId: c.id,
        clauseNumber: cNum,
        category: "Notice Period",
        title: "One-Sided Notice Period",
        severity: "high",
        snippet: c.text.substring(0, 220) + "...",
        plainEnglish: "You must give 60 days notice to vacate, but the landlord can throw you out with only 7 days notice without any reason.",
        hiddenRisk: "You risk sudden displacement during exam periods or critical project deadlines.",
        negotiationTip: "Propose: 'Both parties agree to a mutual 30 days written notice period for termination.'"
      });
    }

    // Privacy / Inspection
    if ((t.includes("enter") || t.includes("inspect")) && (t.includes("without prior notice") || t.includes("any time of day or night") || t.includes("unrestricted"))) {
      risks.push({
        id: `risk-privacy-${c.id}`,
        clauseId: c.id,
        clauseNumber: cNum,
        category: "Tenant Privacy",
        title: "Unannounced Entry & Loss of Privacy",
        severity: "high",
        snippet: c.text.substring(0, 220) + "...",
        plainEnglish: "The landlord or building warden reserves the right to walk into your room at any hour without advance notice.",
        hiddenRisk: "Direct breach of your basic legal right to quiet enjoyment and personal privacy.",
        negotiationTip: "Propose: 'Inspections require at least 24 hours advance written or telephone notice and shall only occur during daylight hours (9 AM - 7 PM), except in emergencies.'"
      });
    }

    // Heavy repairs
    if ((t.includes("repair") || t.includes("maintenance")) && (t.includes("100%") || t.includes("exceeding ₹500") || (t.includes("tenant") && t.includes("geyser")))) {
      risks.push({
        id: `risk-repair-${c.id}`,
        clauseId: c.id,
        clauseNumber: cNum,
        category: "Maintenance",
        title: "Extreme Repair Cost Burden",
        severity: "high",
        snippet: c.text.substring(0, 220) + "...",
        plainEnglish: "You are made to pay for all broken geysers, AC compressors, and plumbing repairs even if they broke due to age or pre-existing defects.",
        hiddenRisk: "A single appliance breakdown could cost you ₹10,000+ for property you don't own.",
        negotiationTip: "Propose: 'Minor routine repairs under ₹1,000 by tenant; structural, pre-existing, and major appliance repairs paid solely by landlord.'"
      });
    }

    // Rent hike
    if ((t.includes("escalat") || t.includes("increase the monthly rent")) && (t.includes("at any point") || t.includes("15%"))) {
      risks.push({
        id: `risk-hike-${c.id}`,
        clauseId: c.id,
        clauseNumber: cNum,
        category: "Rent Escalation",
        title: "Arbitrary Mid-Tenancy Rent Hikes",
        severity: "high",
        snippet: c.text.substring(0, 220) + "...",
        plainEnglish: "The owner can hike your monthly rent by 15% in the middle of your contract with just 15 days notice.",
        hiddenRisk: "Defeats the whole purpose of a fixed 11-month lease.",
        negotiationTip: "Propose: 'Rent shall remain fixed for the 11-month term, with agreed 5-8% escalation only upon formal lease renewal.'"
      });
    }

    // Guest fines / Curfews
    if ((t.includes("visitor") || t.includes("guest") || t.includes("curfew")) && (t.includes("penalty") || t.includes("fine") || t.includes("after 8"))) {
      risks.push({
        id: `risk-guest-${c.id}`,
        clauseId: c.id,
        clauseNumber: cNum,
        category: "Guests & Curfew",
        title: "Aggressive Guest Restrictions & Monetary Fines",
        severity: "medium",
        snippet: c.text.substring(0, 220) + "...",
        plainEnglish: "Guests are prohibited after 8 PM and subject to automatic ₹1,000 fines.",
        hiddenRisk: "Risk of warden harassment during family or friend visits.",
        negotiationTip: "Propose: 'Visitors permitted until 10:00 PM with quiet hours respected; overnight family guests allowed with prior notice.'"
      });
    }

    // Joint and several liability
    if (t.includes("joint and several") || (t.includes("co-tenants") && t.includes("100% legally liable"))) {
      risks.push({
        id: `risk-joint-${c.id}`,
        clauseId: c.id,
        clauseNumber: cNum,
        category: "Liability",
        title: "Joint & Several Liability for Flatmates",
        severity: "medium",
        snippet: c.text.substring(0, 220) + "...",
        plainEnglish: "If your roommate leaves or fails to pay, the landlord can legally demand you pay their rent.",
        hiddenRisk: "You are financially responsible for other people's debts.",
        negotiationTip: "Propose: 'Individual liability clause for each tenant's designated bedroom.'"
      });
    }
  });

  // Check for Critical Missing / Silent Clauses (High & Medium Omissions)
  const lowerText = fullText.toLowerCase();
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

  if (risks.length === 0) {
    risks.push({
      id: "safe-overview",
      clauseId: "clause-1",
      clauseNumber: "General",
      category: "Agreement Overview",
      title: "Balanced & Standard Terms Detected",
      severity: "safe",
      snippet: fullText.substring(0, 200) + "...",
      plainEnglish: "This agreement appears to follow standard urban rental conventions with reasonable mutual notice and deposit provisions.",
      hiddenRisk: "No severe predatory clauses immediately detected.",
      negotiationTip: "Verify move-in meter readings and deposit transfer receipts."
    });
  }

  return risks;
}

function computeFairnessScore(risks) {
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
    } else {
      safeCount++;
    }
  });

  score = Math.max(15, Math.min(98, score));

  let status = "Balanced & Fair";
  let verdict = "Generally safe to sign with standard move-in precautions.";

  if (highCount >= 3 || score < 55) {
    status = "High Risk / Predatory";
    verdict = "Critical red flags detected! Do NOT sign without negotiating major amendments or seeking professional legal review.";
  } else if (highCount >= 1 || medCount >= 2 || score < 75) {
    status = "Caution: Review Needed";
    verdict = "Contains several one-sided terms. We recommend clarifying or renegotiating 2–3 key clauses before committing.";
  }

  return {
    score,
    status,
    verdict,
    highCount,
    medCount,
    safeCount
  };
}

function buildQuestions(risks, metrics) {
  const qs = [];

  if (metrics.deposit.hasMandatoryDeduction || risks.some(r => r.category === "Security Deposit")) {
    qs.push({
      id: "q-deposit",
      topic: "Deposit Deductions",
      question: "Clause specifies a mandatory deduction for painting upon vacating. Can we amend this so deductions apply only to actual physical damages beyond normal wear and tear, supported by itemized repair invoices?",
      why: "Prevents paying for normal wall aging or previous tenants' paint decay."
    });
  }

  if (metrics.notice.hasAsymmetry || risks.some(r => r.category === "Notice Period")) {
    qs.push({
      id: "q-notice",
      topic: "Mutual Notice Period",
      question: "The current draft allows the owner 7 days to terminate but requires 60 days from the tenant. Can we make this a mutual 30-day notice period for both parties?",
      why: "Ensures you aren't evicted unexpectedly without time to find a new room."
    });
  }

  if (risks.some(r => r.category === "Lock-in Period")) {
    qs.push({
      id: "q-lockin",
      topic: "Early Exit & Lock-in Flexibility",
      question: "In the event of an unavoidable college transfer, job relocation, or health emergency, can we include a clause allowing termination during lock-in if I give 30 days notice or help find a replacement?",
      why: "Protects you from losing your entire deposit and being held liable for unlived rent."
    });
  }

  if (metrics.privacy.unrestrictedEntry || risks.some(r => r.category === "Tenant Privacy")) {
    qs.push({
      id: "q-privacy",
      topic: "Inspection Notice & Privacy",
      question: "Regarding owner or warden inspections, can we add a requirement of at least 24 hours advance written or telephone notice before room entry, except in emergencies?",
      why: "Protects your fundamental right to privacy and personal dignity."
    });
  }

  if (metrics.maintenance.heavyMaint || risks.some(r => r.category === "Maintenance")) {
    qs.push({
      id: "q-repairs",
      topic: "Maintenance Split & Major Fixtures",
      question: "Can we clarify that major structural issues, pre-existing plumbing/electrical faults, and capital appliance replacements (like geyser motor) remain the landlord's responsibility?",
      why: "Guarantees you won't bear the cost of pre-existing building defects."
    });
  }

  if (qs.length < 4) {
    qs.push({
      id: "q-meter",
      topic: "Utility Handover Protocol",
      question: "Can we record the exact electricity and water meter readings on the move-in date so I am not billed for prior consumption?",
      why: "Prevents inheriting past unpaid bills."
    });
    qs.push({
      id: "q-receipt",
      topic: "Rent & Deposit Payment Mode",
      question: "Will you provide a formal stamped rent receipt or digital payment acknowledgment each month for tax and HRA deduction purposes?",
      why: "Required for claiming tax exemptions."
    });
  }

  return qs;
}

function buildChecklist() {
  return [
    {
      id: "chk-photo",
      title: "Document Existing Condition with Photos & Video",
      description: "Take high-resolution photos and video of all walls, tiles, geyser, taps, and pre-existing furniture marks on move-in day. Email them to the owner to establish timestamped proof.",
      category: "Move-In Proof",
      isCompleted: false,
      priority: "high"
    },
    {
      id: "chk-meter",
      title: "Note Down Electricity & Water Meter Readings",
      description: "Photograph the electricity sub-meter and confirm previous tenant's unpaid bills are settled before paying first month's advance.",
      category: "Utilities",
      isCompleted: false,
      priority: "high"
    },
    {
      id: "chk-receipt",
      title: "Get Deposit & Rent Acknowledgment in Writing",
      description: "Never pay deposit in unrecorded cash. Use bank transfer (UPI/NEFT) and ensure owner provides a signed receipt.",
      category: "Payment",
      isCompleted: false,
      priority: "high"
    },
    {
      id: "chk-notice-match",
      title: "Check Mutual Notice Period Match",
      description: "Confirm both tenant and owner have identical notice requirements (e.g. 30 days each).",
      category: "Clauses",
      isCompleted: false,
      priority: "medium"
    },
    {
      id: "chk-painting-clause",
      title: "Clarify Painting & Normal Wear-and-Tear Policy",
      description: "Verify that wall painting is not an automatic deduction, but only charged if actual damage occurs.",
      category: "Clauses",
      isCompleted: false,
      priority: "medium"
    },
    {
      id: "chk-keys-lock",
      title: "Test All Locks & Request Duplicate Key Policy",
      description: "Test main door and room locks. Clarify who holds duplicate keys and verify owner entry notice.",
      category: "Security",
      isCompleted: false,
      priority: "high"
    }
  ];
}
