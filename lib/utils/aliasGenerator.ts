const amharicAdjectives = [
  'Selam',
  'Biruk',
  'Tsega',
  'Fiker',
  'Tena',
  'Nitsuh',
  'Haile',
  'Abebe',
  'Genet',
  'Abenezer',
  'Chora',
];

const animals = [
  'Lion',
  'Eagle',
  'Crane',
  'Gazelle',
  'Wolf',
  'Falcon',
  'Cheetah',
  'Ibis',
  'Eland',
  'Jackal',
  'Otter',
  'Dove',
];

export function generateAlias(): string {
  const adjective = amharicAdjectives[Math.floor(Math.random() * amharicAdjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, '0');
  return `${adjective}-${animal}-${number}`;
}

export function getAliasComponents(alias: string) {
  const parts = alias.split('-');
  return {
    adjective: parts[0],
    animal: parts[1],
    number: parts[2],
  };
}
