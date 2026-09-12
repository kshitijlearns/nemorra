export const samplePassage = 'Plants need sunlight, water, and carbon dioxide to grow. They use these ingredients to make their own food through a process called photosynthesis. During photosynthesis, plants absorb sunlight through their leaves and take in carbon dioxide from the air. They also absorb water through their roots and use all three ingredients to produce energy for growth. As a result, plants release oxygen into the air, which is essential for humans and many other living things.';
export type Recording = { id: string; title: string; score: number; concepts: number; date: string; pinned?: boolean };
export const initialRecordings: Recording[] = [
  { id: 'photosynthesis', title: 'Photosynthesis', score: 91, concepts: 8, date: 'Yesterday' },
  { id: 'constitution', title: 'The Indian Constitution', score: 84, concepts: 12, date: '2 days ago' },
  { id: 'water-cycle', title: 'The Water Cycle', score: 96, concepts: 6, date: 'Last week' },
];
export const concepts = ['Sunlight as energy', 'Water from the roots', 'Carbon dioxide from the air', 'Leaves absorb sunlight', 'Making food', 'Energy for growth', 'Releasing oxygen', 'Supporting living things', 'The role of chlorophyll'];
export const demoProfile = { name: 'Alex Morgan', email: 'alex@example.com', plan: 'Nemorra Pro', sessions: 18, limit: 30 };
