export interface OpportunityScoreInput {
  position: number;
  impressions: number;
}

export const OPPORTUNITY_POSITION_MIN = 8;
export const OPPORTUNITY_POSITION_MAX = 50;
export const OPPORTUNITY_IMPRESSIONS_MIN = 1;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function calculateTrafficUpside(input: OpportunityScoreInput): number {
  return input.impressions * (1 / input.position);
}

export function calculateRankingProbability(input: OpportunityScoreInput): number {
  const range = OPPORTUNITY_POSITION_MAX - OPPORTUNITY_POSITION_MIN;
  return 1 - (input.position - OPPORTUNITY_POSITION_MIN) / range;
}

export function calculateDataConfidence(input: OpportunityScoreInput): number {
  const value = Math.log(input.impressions + 1) / Math.log(501);
  return clamp(value, 0.2, 1);
}

export function calculateOpportunityScore(input: OpportunityScoreInput): number {
  return (
    calculateTrafficUpside(input) *
    calculateRankingProbability(input) *
    calculateDataConfidence(input)
  );
}
