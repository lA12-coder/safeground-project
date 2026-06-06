import type { DirectoryProvider } from './types';

export const MOCK_PROVIDERS: DirectoryProvider[] = [
  {
    id: '1',
    name: 'Dr. Selamawit Bekele',
    category: 'clinical',
    providerType: 'psychiatrist',
    typeLabel: 'PSYCHIATRIST',
    badge: 'verified',
    city: 'Addis Ababa',
    languages: ['Amharic', 'English'],
    bio: 'Specializing in trauma-informed care for university students. Culturally grounded psychiatry with a focus on addiction recovery and anxiety.',
    price: '600 ETB / session',
    priceHighlight: 'amber',
    consultationFee: 660,
    mode: 'online',
    modeLabel: 'Online',
    proBono: false,
    online: true,
    inPerson: false,
    verified: true,
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=280&fit=crop',
    cta: 'book',
  },
  {
    id: '2',
    name: 'St. Mary Recovery',
    category: 'faith',
    providerType: 'religious_org',
    typeLabel: 'CHURCH-LED',
    badge: 'faith',
    city: 'Addis Ababa',
    languages: ['Amharic'],
    bio: 'A safe, spiritual space offering mentorship, prayer circles, and community support for students walking the path of recovery.',
    price: 'Free (Pro-bono)',
    priceHighlight: 'green',
    mode: 'in-person',
    modeLabel: 'In-person',
    proBono: true,
    online: false,
    inPerson: true,
    denomination: 'Orthodox',
    verified: true,
    imageUrl: 'https://images.unsplash.com/photo-1548625145-289c5c4c8b0c?w=400&h=280&fit=crop',
    cta: 'join',
  },
  {
    id: '3',
    name: 'Marcus Thorne',
    category: 'clinical',
    providerType: 'counselor',
    typeLabel: 'COUNSELOR',
    badge: 'verified',
    city: 'Addis Ababa',
    languages: ['English'],
    bio: 'Focusing on student anxiety and academic pressure. Evidence-based CBT with flexible hybrid sessions for diaspora and local students.',
    price: '470 ETB / session',
    priceHighlight: 'amber',
    consultationFee: 470,
    mode: 'hybrid',
    modeLabel: 'Hybrid',
    proBono: false,
    online: true,
    inPerson: true,
    verified: true,
    imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=280&fit=crop',
    cta: 'book',
  },
  {
    id: '4',
    name: 'Dr. Abeba Solomon',
    category: 'clinical',
    providerType: 'counselor',
    typeLabel: 'COUNSELOR',
    badge: 'verified',
    city: 'Dire Dawa',
    languages: ['Amharic', 'Oromifa'],
    bio: 'Mental health counselor with ten years supporting young adults through substance recovery and family reconciliation.',
    price: '410 ETB / session',
    priceHighlight: 'amber',
    consultationFee: 410,
    mode: 'in-person',
    modeLabel: 'In-person',
    proBono: false,
    online: false,
    inPerson: true,
    verified: true,
    imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=280&fit=crop',
    cta: 'book',
  },
  {
    id: '5',
    name: 'An-Nur Wellness Center',
    category: 'faith',
    providerType: 'religious_org',
    typeLabel: 'CHURCH-LED',
    badge: 'faith',
    city: 'Hawassa',
    languages: ['Amharic', 'English'],
    bio: 'Faith-based recovery programs integrating spiritual discipline, community accountability, and peer mentorship for students.',
    price: 'Free (Pro-bono)',
    priceHighlight: 'green',
    mode: 'in-person',
    modeLabel: 'In-person',
    proBono: true,
    online: false,
    inPerson: true,
    denomination: 'Muslim',
    verified: true,
    imageUrl: 'https://images.unsplash.com/photo-1564760055775-d506b02f8589?w=400&h=280&fit=crop',
    cta: 'join',
  },
  {
    id: '6',
    name: 'Pastor Daniel Mekonnen',
    orgName: 'Bahir Dar Evangelical Fellowship',
    category: 'faith',
    providerType: 'religious_individual',
    typeLabel: 'SPIRITUAL TEACHER',
    badge: 'verified',
    city: 'Bahir Dar',
    languages: ['Amharic', 'English'],
    bio: 'Protestant ministry leader offering one-on-one spiritual direction and group support for addiction and emotional healing.',
    price: '220 ETB / session',
    priceHighlight: 'amber',
    consultationFee: 220,
    mode: 'online',
    modeLabel: 'Online',
    proBono: false,
    online: true,
    inPerson: true,
    denomination: 'Protestant',
    verified: true,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=280&fit=crop',
    cta: 'book',
  },
  {
    id: '7',
    name: 'Sister Hanna Tadesse',
    category: 'clinical',
    providerType: 'counselor',
    typeLabel: 'COUNSELOR',
    badge: 'verified',
    city: 'Bahir Dar',
    languages: ['Amharic', 'Tigrinya'],
    bio: 'Integrates faith-sensitive counseling for students navigating recovery, grief, and academic stress in a confidential setting.',
    price: '495 ETB / session',
    priceHighlight: 'amber',
    consultationFee: 495,
    mode: 'hybrid',
    modeLabel: 'Hybrid',
    proBono: false,
    online: true,
    inPerson: true,
    verified: true,
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=280&fit=crop',
    cta: 'book',
  },
  {
    id: '10',
    name: 'Father Petros Haile',
    orgName: 'Holy Trinity Student Ministry',
    category: 'faith',
    providerType: 'religious_individual',
    typeLabel: 'SPIRITUAL TEACHER',
    badge: 'verified',
    city: 'Addis Ababa',
    languages: ['Amharic', 'English'],
    bio: 'Orthodox priest and spiritual director approved by Holy Trinity Student Ministry. One-on-one guidance for students in recovery.',
    price: '500 ETB / session',
    priceHighlight: 'amber',
    consultationFee: 500,
    mode: 'hybrid',
    modeLabel: 'Hybrid',
    proBono: false,
    online: true,
    inPerson: true,
    denomination: 'Orthodox',
    verified: true,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=280&fit=crop',
    cta: 'book',
  },
  {
    id: '11',
    name: 'Sheikh Ibrahim Mohammed',
    orgName: 'An-Nur Wellness Center',
    category: 'faith',
    providerType: 'religious_individual',
    typeLabel: 'SPIRITUAL TEACHER',
    badge: 'verified',
    city: 'Hawassa',
    languages: ['Amharic', 'English'],
    bio: 'Certified mentor at An-Nur Wellness Center. Faith-based counseling aligned with Islamic principles for young adults.',
    price: 'Free (Pro bono)',
    priceHighlight: 'green',
    mode: 'online',
    modeLabel: 'Online',
    proBono: true,
    online: true,
    inPerson: false,
    denomination: 'Muslim',
    verified: true,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=280&fit=crop',
    cta: 'book',
  },
  {
    id: '8',
    name: 'Holy Trinity Student Ministry',
    category: 'faith',
    providerType: 'religious_org',
    typeLabel: 'CHURCH-LED',
    badge: 'faith',
    city: 'Addis Ababa',
    languages: ['Amharic'],
    bio: 'Orthodox-led student fellowship providing liturgical grounding, confession support, and weekly recovery circles on campus.',
    price: 'Free (Pro-bono)',
    priceHighlight: 'green',
    mode: 'in-person',
    modeLabel: 'In-person',
    proBono: true,
    online: false,
    inPerson: true,
    denomination: 'Orthodox',
    verified: true,
    imageUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=400&h=280&fit=crop',
    cta: 'join',
  },
  {
    id: '9',
    name: 'Counselor Yohannes Bekele',
    category: 'clinical',
    providerType: 'counselor',
    typeLabel: 'COUNSELOR',
    badge: 'verified',
    city: 'Mekelle',
    languages: ['Tigrinya', 'Amharic'],
    bio: 'Addiction recovery specialist working with university health centers across the north. Sliding scale available.',
    price: 'Free (Pro-bono)',
    priceHighlight: 'green',
    mode: 'online',
    modeLabel: 'Online',
    proBono: true,
    online: true,
    inPerson: false,
    verified: true,
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=280&fit=crop',
    cta: 'book',
  },
];

export function filterProviders(
  providers: DirectoryProvider[],
  params: {
    type?: string | null;
    city?: string | null;
    language?: string | null;
    online?: boolean;
    inPerson?: boolean;
    proBono?: boolean;
    denomination?: string | null;
  }
): DirectoryProvider[] {
  let result = [...providers];

  if (params.type === 'faith') {
    result = result.filter((p) => p.category === 'faith');
  } else if (params.type === 'clinical' || !params.type) {
    result = result.filter((p) => p.category === 'clinical');
  }

  if (params.city?.trim()) {
    const q = params.city.trim().toLowerCase();
    result = result.filter((p) => p.city.toLowerCase().includes(q));
  }

  if (params.language && params.language !== 'any') {
    const langMap: Record<string, string> = {
      amharic: 'Amharic',
      english: 'English',
      oromifa: 'Oromifa',
      tigrinya: 'Tigrinya',
    };
    const lang = langMap[params.language.toLowerCase()] ?? params.language;
    result = result.filter((p) =>
      p.languages.some((l) => l.toLowerCase() === lang.toLowerCase())
    );
  }

  if (params.online && !params.inPerson) {
    result = result.filter((p) => p.online);
  } else if (params.inPerson && !params.online) {
    result = result.filter((p) => p.inPerson);
  }

  if (params.proBono) {
    result = result.filter((p) => p.proBono);
  }

  if (params.denomination && params.denomination !== 'all') {
    result = result.filter(
      (p) => p.denomination?.toLowerCase() === params.denomination?.toLowerCase()
    );
  }

  return result;
}
