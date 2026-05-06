import {
  buildRiskSummary,
  calculateRiskScore,
  riskGradeFromScore,
} from "@/lib/risk";

export async function POST(request: Request) {
  const body = await request.json();
  const score = calculateRiskScore(body);
  const grade = riskGradeFromScore(score);

  return Response.json({
    score,
    grade,
    summary: buildRiskSummary(score, grade, body.durationDays ?? 60),
  });
}
