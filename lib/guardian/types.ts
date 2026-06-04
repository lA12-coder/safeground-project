export type GuardianRelationship =
  | 'Parent'
  | 'Sibling'
  | 'Spouse'
  | 'Mentor'
  | 'Trusted Friend';

export type MonitoringLevel = 'Alert Only' | 'Weekly Summary' | 'Full View';

export type GuardianLink = {
  id: string;
  alias: string;
  relationship: GuardianRelationship;
  monitoringLevel: MonitoringLevel;
  notifyPanic: boolean;
  notifyRelapse: boolean;
  notifyStreakBreak: boolean;
  token: string;
  createdAt: string;
  revokedAt?: string | null;
};

export type CreateGuardianPayload = {
  alias: string;
  relationship: GuardianRelationship;
  monitoringLevel: MonitoringLevel;
  notifyPanic?: boolean;
  notifyRelapse?: boolean;
  notifyStreakBreak?: boolean;
};
