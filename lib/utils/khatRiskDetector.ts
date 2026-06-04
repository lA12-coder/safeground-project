export interface KhatRiskIndicators {
  frequencyScore: number;
  socialImpactScore: number;
  healthConcernScore: number;
  overallRiskLevel: 'low' | 'moderate' | 'high';
}

export function assessKhatRisk(userProfile: {
  frequencyPerWeek: number;
  affectsStudies: boolean;
  affectsSleep: boolean;
  affectsRelationships: boolean;
  healthConcerns: string[];
}): KhatRiskIndicators {
  let frequencyScore = 0;
  let socialImpactScore = 0;
  let healthConcernScore = 0;

  // Frequency scoring (0-40)
  if (userProfile.frequencyPerWeek >= 5) frequencyScore = 40;
  else if (userProfile.frequencyPerWeek >= 3) frequencyScore = 25;
  else if (userProfile.frequencyPerWeek >= 1) frequencyScore = 10;

  // Social impact scoring (0-40)
  let impacts = 0;
  if (userProfile.affectsStudies) impacts++;
  if (userProfile.affectsSleep) impacts++;
  if (userProfile.affectsRelationships) impacts++;
  socialImpactScore = impacts * 13;

  // Health concern scoring (0-20)
  healthConcernScore = Math.min(userProfile.healthConcerns.length * 5, 20);

  const totalScore = frequencyScore + socialImpactScore + healthConcernScore;
  let overallRiskLevel: 'low' | 'moderate' | 'high' = 'low';

  if (totalScore >= 60) overallRiskLevel = 'high';
  else if (totalScore >= 35) overallRiskLevel = 'moderate';

  return {
    frequencyScore,
    socialImpactScore,
    healthConcernScore,
    overallRiskLevel,
  };
}

export function getKhatRiskRecommendations(riskLevel: 'low' | 'moderate' | 'high'): string[] {
  const recommendations = {
    low: [
      'Continue monitoring your usage patterns',
      'Maintain your current healthy habits',
      'Stay connected with support systems',
    ],
    moderate: [
      'Consider setting usage limits',
      'Speak with a counselor about your habits',
      'Develop alternative coping strategies',
      'Track your usage more closely',
    ],
    high: [
      'Seek immediate professional help',
      'Contact a mental health professional',
      'Join a support group',
      'Consider medical consultation',
      'Reach out to trusted mentors or guardians',
    ],
  };

  return recommendations[riskLevel];
}
