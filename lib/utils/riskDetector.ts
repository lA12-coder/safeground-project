export interface RiskIndicators {
  overallRiskLevel: 'low' | 'moderate' | 'high';
  factors: RiskFactor[];
  score: number;
}

export interface RiskFactor {
  category: RiskCategory;
  severity: 'low' | 'moderate' | 'high';
  score: number;
  label: string;
}

export type RiskCategory =
  | 'substance_use'
  | 'compulsive_behavior'
  | 'digital_wellbeing'
  | 'emotional_state'
  | 'social_isolation';

export function assessRisk(
  inputs: {
    substanceUseFrequency?: number;
    compulsiveUrgeIntensity?: number;
    screenTimeHours?: number;
    moodScore?: number;
    stressLevel?: number;
    hoursSinceLastEpisode?: number;
    socialIsolationScore?: number;
    triggerCount?: number;
  }
): RiskIndicators {
  const factors: RiskFactor[] = [];
  let totalScore = 0;

  if (inputs.substanceUseFrequency != null) {
    let score = 0;
    if (inputs.substanceUseFrequency >= 5) score = 35;
    else if (inputs.substanceUseFrequency >= 3) score = 20;
    else if (inputs.substanceUseFrequency >= 1) score = 10;
    const severity = score >= 30 ? 'high' : score >= 15 ? 'moderate' : 'low';
    factors.push({ category: 'substance_use', severity, score, label: 'Substance use frequency' });
    totalScore += score;
  }

  if (inputs.compulsiveUrgeIntensity != null) {
    const score = (inputs.compulsiveUrgeIntensity / 10) * 30;
    const severity = score >= 20 ? 'high' : score >= 10 ? 'moderate' : 'low';
    factors.push({ category: 'compulsive_behavior', severity, score: Math.round(score), label: 'Compulsive urge intensity' });
    totalScore += score;
  }

  if (inputs.screenTimeHours != null) {
    let score = 0;
    if (inputs.screenTimeHours > 10) score = 25;
    else if (inputs.screenTimeHours > 6) score = 15;
    else if (inputs.screenTimeHours > 3) score = 8;
    const severity = score >= 20 ? 'high' : score >= 10 ? 'moderate' : 'low';
    factors.push({ category: 'digital_wellbeing', severity, score, label: 'Excessive screen time' });
    totalScore += score;
  }

  if (inputs.moodScore != null) {
    const inverted = 10 - inputs.moodScore;
    const score = (inverted / 10) * 20;
    const severity = score >= 14 ? 'high' : score >= 8 ? 'moderate' : 'low';
    factors.push({ category: 'emotional_state', severity, score: Math.round(score), label: 'Low mood indicator' });
    totalScore += score;
  }

  if (inputs.stressLevel != null && inputs.stressLevel > 7) {
    const score = ((inputs.stressLevel - 7) / 3) * 20;
    factors.push({ category: 'emotional_state', severity: score >= 14 ? 'high' : 'moderate', score: Math.round(score), label: 'Elevated stress level' });
    totalScore += score;
  }

  if (inputs.hoursSinceLastEpisode != null && inputs.hoursSinceLastEpisode < 12) {
    const score = ((12 - inputs.hoursSinceLastEpisode) / 12) * 25;
    factors.push({ category: 'compulsive_behavior', severity: score >= 16 ? 'high' : 'moderate', score: Math.round(score), label: 'Recent episode (risk window)' });
    totalScore += score;
  }

  if (inputs.socialIsolationScore != null) {
    const score = (inputs.socialIsolationScore / 10) * 15;
    const severity = score >= 10 ? 'high' : score >= 5 ? 'moderate' : 'low';
    factors.push({ category: 'social_isolation', severity, score: Math.round(score), label: 'Social isolation' });
    totalScore += score;
  }

  if (inputs.triggerCount != null) {
    const score = Math.min(inputs.triggerCount * 5, 20);
    if (score > 0) {
      factors.push({ category: 'emotional_state', severity: score >= 14 ? 'high' : score >= 8 ? 'moderate' : 'low', score, label: 'Multiple triggers active' });
      totalScore += score;
    }
  }

  totalScore = Math.min(Math.round(totalScore), 100);
  let overallRiskLevel: 'low' | 'moderate' | 'high' = 'low';
  if (totalScore >= 60) overallRiskLevel = 'high';
  else if (totalScore >= 30) overallRiskLevel = 'moderate';

  return { overallRiskLevel, factors, score: totalScore };
}

export function getRiskRecommendations(riskLevel: 'low' | 'moderate' | 'high'): string[] {
  const recommendations: Record<string, string[]> = {
    low: [
      'Continue monitoring your patterns and triggers',
      'Maintain your current healthy habits and routines',
      'Stay connected with your support system',
      'Celebrate your progress — you are doing well',
    ],
    moderate: [
      'Consider setting boundaries around screen time and usage',
      'Speak with a counselor or trusted person about your patterns',
      'Develop alternative coping strategies (exercise, meditation, hobbies)',
      'Track your triggers more closely to identify patterns',
      'Use the Panic Button if urges become overwhelming',
    ],
    high: [
      'Seek immediate professional help if needed',
      'Contact a mental health professional or counselor',
      'Use the Panic Button for immediate coping strategies',
      'Reach out to your guardian or trusted support person',
      'Join a support group or community room for peer support',
      'Avoid high-risk situations and environments',
    ],
  };
  return recommendations[riskLevel];
}

export function getHighRiskTriggerDescription(factors: RiskFactor[]): string {
  const highFactors = factors.filter(f => f.severity === 'high').map(f => f.label);
  if (highFactors.length === 0) return '';
  if (highFactors.length === 1) return highFactors[0];
  return highFactors.slice(0, -1).join(', ') + ' and ' + highFactors[highFactors.length - 1];
}
