export type ProviderCategory = 'clinical' | 'faith';

export type ClinicalType = 'psychiatrist' | 'counselor';

export type FaithType = 'religious_org' | 'religious_individual';

export type ProviderType = ClinicalType | FaithType;

export type Denomination = 'Orthodox' | 'Protestant' | 'Muslim';

export type SessionMode = 'online' | 'in-person' | 'hybrid';

export type DirectoryProvider = {
  id: string;
  name: string;
  orgName?: string;
  category: ProviderCategory;
  providerType: ProviderType;
  typeLabel: string;
  badge: 'verified' | 'faith';
  city: string;
  languages: string[];
  bio: string;
  price: string;
  priceHighlight: 'amber' | 'green';
  consultationFee?: number | null;
  mode: SessionMode;
  modeLabel: string;
  proBono: boolean;
  online: boolean;
  inPerson: boolean;
  denomination?: Denomination;
  verified: boolean;
  imageUrl: string;
  cta: 'book' | 'join';
};

export type DirectoryFilters = {
  type?: string;
  city?: string;
  language?: string;
  online?: string;
  inPerson?: string;
  proBono?: string;
  denomination?: string;
  page?: string;
  limit?: string;
};

export type BookingRequest = {
  providerId: string;
  providerName: string;
  date: string;
  time: string;
  notes?: string;
  sessionType: 'online' | 'in-person';
  amountEtb?: number;
  proBono?: boolean;
  bookingType?: 'spiritual' | 'clinical';
};
