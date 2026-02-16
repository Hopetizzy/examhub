import { Question, ExamType, TopicDetail, Textbook, TutorSubscriptionPlan } from './types';

export const PRICING = {
  TIMED: 500,
  PRACTICE: 1000,
};

export interface EnhancedTutorPlan extends TutorSubscriptionPlan {
  features: string[];
  highlightFeature: string;
  isCustom?: boolean;
}

export const TUTOR_PLANS: EnhancedTutorPlan[] = [
  {
    id: 'plan_basic',
    name: 'Starter Tutor',
    price: 5000,
    maxStudents: 5,
    highlightFeature: 'Core Analytics',
    features: ['Student Progress Tracking', 'Weak Topic Identification', 'Manual Student Entry']
  },
  {
    id: 'plan_pro',
    name: 'Advanced Tutor',
    price: 10000,
    maxStudents: 10,
    highlightFeature: 'Bulk Messaging',
    features: ['Everything in Starter', 'Bulk Email Notifications', 'Excel Template Upload', 'Performance Reminders']
  },
  {
    id: 'plan_expert',
    name: 'Master Tutor',
    price: 20000,
    maxStudents: 25,
    highlightFeature: 'AI Performance Forecast',
    features: ['Everything in Advanced', 'Predictive Score Modeling', 'Topic Drill-down Analysis', 'Priority Support']
  }
];

export const SCHOOL_PLANS: EnhancedTutorPlan[] = [
  {
    id: 'school_small',
    name: 'Small Campus',
    price: 50000,
    maxStudents: 100,
    highlightFeature: 'Custom Branding',
    features: ['Everything in Master Tutor', 'White-label School Reports', '2 Admin Sub-accounts', 'Full Data Export (JSON/PDF)']
  },
  {
    id: 'school_medium',
    name: 'Medium Campus',
    price: 120000,
    maxStudents: 500,
    highlightFeature: 'API Access',
    features: ['Everything in Small Campus', '5 Admin Sub-accounts', 'LMS Integration Support', 'Dedicated Account Manager']
  },
  {
    id: 'school_large',
    name: 'Large Campus',
    price: 200000,
    maxStudents: 1000,
    highlightFeature: 'On-premise Options',
    features: ['Everything in Medium Campus', 'Unlimited Admin Accounts', 'Custom Domain Mapping', 'Priority On-site Training']
  },
  {
    id: 'school_institution',
    name: 'Institution',
    price: 0,
    maxStudents: 9999,
    highlightFeature: 'Unlimited Capacity',
    isCustom: true,
    features: ['Unlimited Student Slots', 'Custom Feature Development', 'SLA & Uptime Guarantee', '24/7 Dedicated Support']
  }
];

export const ALL_PLANS = [...TUTOR_PLANS, ...SCHOOL_PLANS];

export const EXCEL_TEMPLATE_DATA = "Surname,FirstName,Email,Subject1,Subject2,Subject3,Subject4\nDoe,John,john@test.com,English,Maths,Physics,Chemistry";

export const EXAM_TYPES: ExamType[] = ['JAMB', 'WAEC'];

export const STANDARD_QUESTION_COUNTS: Record<string, number> = {
  'English': 40,
  'default': 40
};

export const SUBJECTS_BY_EXAM: Record<ExamType, string[]> = {
  JAMB: ['English', 'Mathematics', 'Physics', 'Biology', 'Chemistry', 'Economics'],
  WAEC: ['English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Civic Education']
};

export const SYLLABUS_DATA: Record<string, TopicDetail[]> = {
  'English': [
    {
      name: 'Lexis and Structure',
      objectives: ['Identify synonyms and antonyms', 'Master concord rules'],
      explanations: [
        'Concord refers to agreement between subject and verb.',
        'Singular subjects take singular verbs.',
        'Plural subjects take plural verbs.'
      ],
      commonMistakes: ['Confusing collective nouns with plural subjects', 'Misusing "as well as"']
    },
    {
      name: 'Oral English',
      objectives: ['Master vowel and consonant sounds', 'Identify stress patterns'],
      explanations: ['Focus on phonemic transcription.', 'Stress often falls on the first syllable of nouns.'],
      commonMistakes: ['Rhyming words by spelling rather than sound']
    }
  ],
  'Mathematics': [
    {
      name: 'Algebra',
      objectives: ['Solve linear and quadratic equations', 'Master factorisation'],
      explanations: ['Balance equations by performing identical operations on both sides.', 'Use the quadratic formula for non-factorable equations.'],
      commonMistakes: ['Sign errors when moving terms across the equality sign']
    }
  ]
};

export const TEXTBOOKS: Record<string, Textbook[]> = {
  'English': [
    { title: 'Invisible Teacher', author: 'Dele Ashade', reason: 'Excellent breakdown of lexis and structure.' },
    { title: 'Oral English for Schools', author: 'A. Adetola', reason: 'Comprehensive guide to phonetics.' }
  ],
  'Mathematics': [
    { title: 'New General Mathematics', author: 'Channon et al.', reason: 'The gold standard for West African curriculum.' }
  ]
};

export const TOPICS: Record<string, string[]> = {
  'English': ['Lexis and Structure', 'Oral English', 'Comprehension'],
  'Mathematics': ['Algebra', 'Geometry', 'Calculus', 'Statistics'],
  'Physics': ['Motion', 'Waves', 'Electricity', 'Heat'],
  'Biology': ['Cell Biology', 'Genetics', 'Ecology'],
  'Chemistry': ['Atomic Structure', 'Organic Chemistry', 'Stoichiometry'],
  'Economics': ['Supply and Demand', 'Market Structures'],
  'Civic Education': ['Human Rights', 'Democracy'],
  'Further Maths': ['Calculus', 'Matrices']
};

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q1',
    examType: 'JAMB',
    subject: 'English',
    topic: 'Lexis and Structure',
    text: 'Choose the option that best completes the gap: The manager, as well as his assistants, ______ present at the meeting.',
    options: [
      { id: 'a', text: 'were' },
      { id: 'b', text: 'are' },
      { id: 'c', text: 'was' },
      { id: 'd', text: 'have been' },
    ],
    correctOptionId: 'c',
    explanation: 'When "as well as" links two subjects, the verb agrees with the first subject ("The manager" - singular).',
    difficulty: 'MEDIUM',
  },
  {
    id: 'q2',
    examType: 'JAMB',
    subject: 'Mathematics',
    topic: 'Algebra',
    text: 'Solve for x: 2(3x - 5) = 4x + 6',
    options: [
      { id: 'a', text: 'x = 4' },
      { id: 'b', text: 'x = 8' },
      { id: 'c', text: 'x = 5' },
      { id: 'd', text: 'x = 2' },
    ],
    correctOptionId: 'b',
    explanation: '6x - 10 = 4x + 6 -> 2x = 16 -> x = 8.',
    difficulty: 'EASY',
  },
  {
    id: 'q3',
    examType: 'WAEC',
    subject: 'Physics',
    topic: 'Motion',
    text: 'A car travels at a constant velocity of 20m/s for 10 seconds. Calculate the distance covered.',
    options: [
      { id: 'a', text: '200m' },
      { id: 'b', text: '2m' },
      { id: 'c', text: '100m' },
      { id: 'd', text: '20m' },
    ],
    correctOptionId: 'a',
    explanation: 'Distance = Velocity × Time = 20 × 10 = 200m.',
    difficulty: 'EASY',
  }
];
