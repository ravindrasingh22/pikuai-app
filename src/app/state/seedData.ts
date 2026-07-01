import { AppState } from './types';

export const initialState: AppState = {
  parent: {
    email: 'parent@example.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    pin: ''
  },
  auth: {},
  kids: [
    { id: 'ravin', name: 'Ravin', age: 9, gender: 'Boy', pin: '1234', avatar: 'ravin', streak: 4, dailyMinutes: 82, alerts: 1, topics: ['Science', 'Animals', 'Health'], weeklyMinutes: [20, 35, 18, 45, 30, 42, 50] },
    { id: 'maya', name: 'Maya', age: 7, gender: 'Girl', pin: '2222', avatar: 'maya', streak: 2, dailyMinutes: 36, alerts: 0, topics: ['Art', 'Stories', 'Space'], weeklyMinutes: [10, 15, 20, 12, 28, 30, 22] }
  ],
  activeKidId: 'ravin',
  chats: [
    {
      id: 'sky', kidId: 'ravin', title: 'Why is the sky blue?', preview: 'Why is the sky blue?', tag: 'Science', date: 'May 23, 2026', pinned: true, paused: false,
      messages: [
        { id: 'm1', role: 'kid', text: 'Why is the sky blue?', time: '10:00' },
        { id: 'm2', role: 'ai', text: 'The sky looks blue because tiny air particles scatter blue light from the sun more than other colors.', time: '10:01' }
      ]
    },
    {
      id: 'water', kidId: 'ravin', title: 'Why drink water?', preview: 'Why do we need to drink water?', tag: 'Health', date: 'May 22, 2026', pinned: true, paused: false,
      messages: [
        { id: 'm3', role: 'kid', text: 'Why do we need to drink water?', time: '13:18' },
        { id: 'm4', role: 'ai', text: 'Water helps your body think, move, stay cool, and carry nutrients.', time: '13:20' }
      ]
    },
    {
      id: 'plants', kidId: 'maya', title: 'How do plants grow?', preview: 'How do plants grow?', tag: 'Nature', date: 'May 21, 2026', pinned: false, paused: false,
      messages: [
        { id: 'm5', role: 'kid', text: 'How do plants grow?', time: '11:00' },
        { id: 'm6', role: 'ai', text: 'Plants grow when they get sunlight, water, air, and nutrients from the soil.', time: '11:02' }
      ]
    }
  ],
  kidOnboardingCompleted: {},
  subscription: { planId: 'monthly', status: 'Active', validUntil: '6 Jul 2026', tokensLeft: 1200, daysLeft: 12 },
  selectedAvatar: 'ravin'
};
