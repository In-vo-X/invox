export type RiskInput = {
  debtorReputationScore: number;
  documentCompletenessScore: number;
  durationScore: number;
  amountScore: number;
  repaymentHistoryScore: number;
};

export function calculateRiskScore(input: RiskInput) {
  return (
    input.debtorReputationScore +
    input.documentCompletenessScore +
    input.durationScore +
    input.amountScore +
    input.repaymentHistoryScore
  );
}

export function riskGradeFromScore(score: number) {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 50) return "C";
  return "D";
}

export function buildRiskSummary(
  score: number,
  grade: string,
  durationDays: number,
) {
  return `This invoice cashflow is scored ${score}/100 and graded ${grade}. The current demo underwriting assumes standard documentation quality, verified delivery, and a ${durationDays}-day repayment window with concentration risk centered on payment delay.`;
}
