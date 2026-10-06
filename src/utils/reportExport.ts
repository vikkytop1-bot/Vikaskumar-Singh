import { AnalysisRecord } from '../types/analysis';
import { AppSettings } from './storage';

export function generateMarkdownReport(record: AnalysisRecord, settings?: AppSettings): string {
  const res = record.result;
  const company = settings?.companyName || 'Engineering Consulting Services';
  const engineer = settings?.engineerName || 'Qualified Engineering Consultant';

  return `# ENGINEERING CLIENT REQUIREMENT ANALYSIS REPORT
**Project ID:** ${record.id}
**Project Title:** ${res.projectSummary.title || record.projectName}
**Client:** ${record.clientName || 'Valued Client'}
**Category:** ${res.projectSummary.category || record.category}
**Date:** ${new Date(record.createdAt).toLocaleDateString()}
**Engineering Assessment By:** ${engineer} (${company})

---

## 1. PROJECT SUMMARY
- **Industry / Application:** ${res.projectSummary.industry}
- **Client Objective:** ${res.projectSummary.clientObjective}
- **Overall Requirement Summary:** ${res.projectSummary.overallSummary}

---

## 2. REQUIREMENT COMPLETENESS
**Overall Completeness:** ${res.completeness.overallPercentage}% (${res.completeness.ratingLabel})

### Category Breakdown:
- Technical Specifications: ${res.completeness.categories.technical}%
- Electrical System: ${res.completeness.categories.electrical}%
- Mechanical Requirements: ${res.completeness.categories.mechanical}%
- Control & Automation: ${res.completeness.categories.controlAutomation}%
- Installation & Site Conditions: ${res.completeness.categories.installation}%
- Commercial Constraints: ${res.completeness.categories.commercial}%
- Project Timeline: ${res.completeness.categories.timeline}%

---

## 3. CLIENT-PROVIDED CONFIRMED REQUIREMENTS
${res.confirmedRequirements.electrical.length > 0 ? `### Electrical:\n${res.confirmedRequirements.electrical.map((i) => `- ${i}`).join('\n')}\n` : ''}
${res.confirmedRequirements.electronics.length > 0 ? `### Electronics:\n${res.confirmedRequirements.electronics.map((i) => `- ${i}`).join('\n')}\n` : ''}
${res.confirmedRequirements.mechanical.length > 0 ? `### Mechanical:\n${res.confirmedRequirements.mechanical.map((i) => `- ${i}`).join('\n')}\n` : ''}
${res.confirmedRequirements.softwareControl.length > 0 ? `### Software / Control:\n${res.confirmedRequirements.softwareControl.map((i) => `- ${i}`).join('\n')}\n` : ''}
${res.confirmedRequirements.installation.length > 0 ? `### Installation:\n${res.confirmedRequirements.installation.map((i) => `- ${i}`).join('\n')}\n` : ''}
${res.confirmedRequirements.commercial.length > 0 ? `### Commercial:\n${res.confirmedRequirements.commercial.map((i) => `- ${i}`).join('\n')}\n` : ''}
${res.confirmedRequirements.timeline.length > 0 ? `### Timeline:\n${res.confirmedRequirements.timeline.map((i) => `- ${i}`).join('\n')}\n` : ''}

---

## 4. MISSING INFORMATION (FOR QUOTATION / SIZING)
${res.missingInformation.length === 0 ? '_No critical missing information detected._' : res.missingInformation.map((m, idx) => `${idx + 1}. **[${m.priority} PRIORITY]** ${m.item}\n   *Engineering Impact:* ${m.whyItMatters}`).join('\n\n')}

---

## 5. CLIENT FOLLOW-UP QUESTIONS
${res.clientQuestions.length === 0 ? '_No immediate follow-up questions._' : res.clientQuestions.map((q, idx) => `${idx + 1}. ${q.question} *(Reason: ${q.rationale || q.category || 'Clarification required'})*`).join('\n')}

---

## 6. PRELIMINARY SCOPE OF WORK
${res.scopeOfWork.length === 0 ? '_Scope pending requirement clarification._' : res.scopeOfWork.map((s) => `- **[${s.category}]** ${s.description} — *Status: ${s.status}*`).join('\n')}

---

## 7. PRELIMINARY BILL OF QUANTITIES (BOQ)
| Item | Description | Specification | Quantity | Basis | Confidence |
| --- | --- | --- | --- | --- | --- |
${res.preliminaryBOQ.map((b) => `| ${b.item} | ${b.description} | ${b.specification} | ${b.quantity} | ${b.basis} | ${b.confidence} |`).join('\n')}

---

## 8. ENGINEERING RISKS
${res.risks.length === 0 ? '_No major technical risks flagged._' : res.risks.map((r) => `- **[${r.level} RISK]** ${r.risk}\n  - *Impact:* ${r.whyItMatters}\n  - *Recommended Mitigation:* ${r.mitigation}`).join('\n')}

---

## 9. REQUIREMENT CONFLICTS
${res.conflicts.length === 0 ? '_No technical contradictions identified in the input data._' : res.conflicts.map((c) => `- **CONFLICT:** ${c.conflict}\n  - *Why it is a problem:* ${c.whyProblem}\n  - *Required Resolution:* ${c.requiredResolution}`).join('\n')}

---

## 10. ENGINEERING ASSUMPTIONS
${res.assumptions.length === 0 ? '_No working assumptions recorded._' : res.assumptions.map((a) => `- **Assumption:** ${a.assumption}\n  - *Engineering Basis:* ${a.basis}\n  - *Risk if Wrong:* ${a.riskIfWrong}`).join('\n')}

---

## 11. PRELIMINARY FEASIBILITY
**Status:** ${res.feasibility.status}
**Summary:** ${res.feasibility.summary}
**Review Notes:** ${res.feasibility.engineeringReviewNotes}

---

## 12. RECOMMENDED NEXT ACTION
**${res.recommendedNextAction}**

---
*SAFETY & COMPLIANCE DISCLAIMER: This document is an initial engineering requirement assessment produced by an engineering requirement assistant. It does not constitute a certified final engineering design, electrical safety certificate, or legal standard compliance guarantee. Physical installation, equipment sizing, and live electrical commissioning must be performed and verified by a licensed, certified engineer.*
`;
}

export function generateClientQuestionsEmail(record: AnalysisRecord, settings?: AppSettings): { subject: string; body: string } {
  const res = record.result;
  const client = record.clientName ? record.clientName : 'Client';
  const project = res.projectSummary.title || record.projectName || 'Your Engineering Project';
  const signature = settings?.emailSignature || `Kind regards,\n${settings?.engineerName || 'Engineering Team'}\n${settings?.companyName || 'Engineering Consulting'}`;

  const questionsFormatted = res.clientQuestions
    .map((q, idx) => `${idx + 1}. ${q.question}`)
    .join('\n\n');

  const subject = `Additional Technical Information Required: ${project}`;

  const body = `Subject: ${subject}

Dear ${client},

Thank you for sharing the project requirements for "${project}".

We are currently reviewing the technical specifications to prepare an accurate engineering proposal and quotation. To ensure our design meets your operational needs and complies with all safety codes, could you please confirm the following technical details:

${questionsFormatted}

Once you are able to clarify these points, we will finalize the detailed scope of work, preliminary bill of materials, and quotation.

Please let us know if you would like to schedule a brief technical call to review these items together.

Thank you.

${signature}
`;

  return { subject, body };
}

export function generateScopeDocument(record: AnalysisRecord): string {
  const res = record.result;
  return `# PRELIMINARY SCOPE OF WORK
**Project:** ${res.projectSummary.title || record.projectName}
**Client:** ${record.clientName || 'Client'}
**Status:** ${record.status}

${res.scopeOfWork
  .map(
    (s, idx) => `### ${idx + 1}. ${s.category} [${s.status}]
${s.description}
`
  )
  .join('\n')}

---
*Note: Scope items marked as "OPTIONAL / NEEDS CONFIRMATION" will be finalized upon receipt of client feedback.*
`;
}

export function generateBOQCSV(record: AnalysisRecord): string {
  const headers = ['Item', 'Description', 'Specification', 'Quantity', 'Basis', 'Confidence'];
  const rows = record.result.preliminaryBOQ.map((b) => [
    `"${b.item.replace(/"/g, '""')}"`,
    `"${b.description.replace(/"/g, '""')}"`,
    `"${b.specification.replace(/"/g, '""')}"`,
    `"${b.quantity.replace(/"/g, '""')}"`,
    `"${b.basis.replace(/"/g, '""')}"`,
    `"${b.confidence.replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
