import { ExamResult, User, ExamSession, Question, ExamMode, DashboardData, ExamHistoryItem, ExamConfig, ReadinessScore, TutorStudent, TutorSubscriptionPlan, UserRole } from '../types';
import { MOCK_QUESTIONS, PRICING, TUTOR_PLANS } from '../constants';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let mockHistory: ExamHistoryItem[] = [
  {
    id: 'attempt-1',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    examType: 'JAMB',
    mode: 'TIMED',
    score: 15,
    total: 40,
    accuracy: 37.5,
    subjects: ['Mathematics', 'English'],
    weakAreas: ['Geometry', 'Oral English']
  }
];

let mockTutorStudents: TutorStudent[] = [
  {
    id: 's1',
    name: 'Alice Johnson',
    email: 'alice@test.com',
    readinessScore: 78,
    totalExams: 12,
    lastActive: '2023-10-25',
    weakTopics: [
      'Calculus', 'Calculus', 'Calculus', 'Phonetics', 'Phonetics',
      'Algebra', 'Integration', 'Trigonometry', 'Calculus', 'Matrices'
    ]
  },
  {
    id: 's2',
    name: 'Bob Smith',
    email: 'bob@test.com',
    readinessScore: 45,
    totalExams: 5,
    lastActive: '2023-10-24',
    weakTopics: [
      'Algebra', 'Algebra', 'Waves', 'Motion', 'Electricity',
      'Waves', 'Algebra', 'Motion', 'Heat', 'Optics'
    ]
  },
];

let mockAssignments: import('../types').Assignment[] = [];

const calculateReadiness = (history: ExamHistoryItem[]): ReadinessScore => {
  if (history.length === 0) {
    return {
      total: 0,
      label: 'Not Ready',
      breakdown: { accuracy: 0, mastery: 0, speed: 0, consistency: 0 }
    };
  }

  const accuracy = history.reduce((acc, curr) => acc + curr.accuracy, 0) / history.length;
  const mastery = Math.min(100, (history.length * 15));
  const speed = 75;
  const consistency = history.length > 2 ? 80 : 40;

  const total = (accuracy * 0.4) + (mastery * 0.3) + (speed * 0.2) + (consistency * 0.1);

  let label: ReadinessScore['label'] = 'Not Ready';
  if (total >= 80) label = 'Exam Ready';
  else if (total >= 60) label = 'Almost Ready';
  else if (total >= 40) label = 'Fair';

  return {
    total: Math.round(total),
    label,
    breakdown: {
      accuracy: Math.round(accuracy),
      mastery: Math.round(mastery),
      speed,
      consistency
    }
  };
};

export const mockAuthService = {
  login: async (email: string): Promise<User> => {
    await delay(500);
    return { id: 'user_123', name: 'Daniel Adebayo', email, balance: 5000, role: 'STUDENT' };
  },
  register: async (name: string, email: string, role: UserRole = 'STUDENT'): Promise<User> => {
    await delay(500);
    return { id: `user_${Date.now()}`, name, email, balance: 5000, role };
  }
};

export const mockTutorService = {
  subscribe: async (userId: string, planId: string): Promise<User> => {
    await delay(1000);
    const plan = TUTOR_PLANS.find(p => p.id === planId);
    return {
      id: userId,
      name: 'Tutor User',
      email: 'tutor@test.com',
      balance: 5000,
      role: 'TUTOR',
      subscription: {
        planId: planId,
        maxStudents: plan?.maxStudents || 5,
        expiryDate: new Date(Date.now() + 86400000 * 30).toISOString()
      }
    };
  },
  getStudents: async (tutorId: string): Promise<TutorStudent[]> => {
    await delay(600);
    return mockTutorStudents;
  },
  registerStudent: async (tutorId: string, studentData: { name: string, email: string }): Promise<TutorStudent> => {
    await delay(800);
    const newStudent: TutorStudent = {
      id: `s-${Date.now()}`,
      ...studentData,
      readinessScore: 0,
      totalExams: 0,
      lastActive: 'Never',
      weakTopics: []
    };
    mockTutorStudents.push(newStudent);
    return newStudent;
  },
  assignWork: async (tutorId: string, studentIds: string[], config: ExamConfig): Promise<void> => {
    await delay(800);
    studentIds.forEach(studentId => {
      mockAssignments.push({
        id: `asn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        studentId,
        tutorId,
        config,
        assignedDate: new Date().toISOString(),
        status: 'PENDING'
      });
    });
  }
};

export const mockExamService = {
  getDashboardData: async (userId: string): Promise<DashboardData> => {
    await delay(400);
    const readinessScore = calculateReadiness(mockHistory);

    const failureMap: Record<string, number> = {};
    mockHistory.forEach(exam => {
      exam.weakAreas.forEach(topic => {
        failureMap[topic] = (failureMap[topic] || 0) + 1;
      });
    });

    const weakTopicAnalysis = Object.entries(failureMap)
      .map(([topic, count]) => ({ topic, failureCount: count }))
      .sort((a, b) => b.failureCount - a.failureCount);

    return {
      stats: {
        totalExams: mockHistory.length,
        averageScore: mockHistory.length > 0 ? mockHistory.reduce((a, b) => a + b.accuracy, 0) / mockHistory.length : 0,
        bestScore: mockHistory.length > 0 ? Math.max(...mockHistory.map(h => h.accuracy)) : 0,
        timeSpentMinutes: mockHistory.length * 45,
        readinessScore
      },
      recentActivity: [...mockHistory].reverse(),
      weakTopicAnalysis
    };
  },

  startExam: async (config: ExamConfig): Promise<ExamSession> => {
    await delay(800);
    let filtered = MOCK_QUESTIONS.filter(q => q.examType === config.examType);

    if (config.subjects.length > 0) {
      filtered = filtered.filter(q => config.subjects.includes(q.subject));
    }

    if (filtered.length === 0) filtered = MOCK_QUESTIONS.slice(0, 5);

    return {
      id: `EXAM-${Date.now()}`,
      examType: config.examType,
      mode: config.mode,
      config,
      startTime: Date.now(),
      durationMinutes: config.mode === 'TIMED' ? 2 : 20,
      questions: filtered.sort(() => Math.random() - 0.5),
      answers: {},
      isSubmitted: false,
    };
  },

  submitExam: async (session: ExamSession): Promise<ExamResult> => {
    await delay(1000);
    let correct = 0;
    session.questions.forEach(q => {
      if (session.answers[q.id] === q.correctOptionId) correct++;
    });

    const accuracy = (correct / session.questions.length) * 100;

    const newHistoryItem: ExamHistoryItem = {
      id: session.id,
      date: new Date().toISOString(),
      examType: session.examType,
      mode: session.mode,
      score: correct,
      total: session.questions.length,
      accuracy,
      subjects: Array.from(new Set(session.questions.map(q => q.subject))),
      weakAreas: []
    };
    mockHistory.push(newHistoryItem);

    return {
      id: session.id,
      date: new Date().toISOString(),
      examType: session.examType,
      mode: session.mode,
      score: correct,
      totalQuestions: session.questions.length,
      accuracy,
      timeSpentSeconds: (Date.now() - session.startTime) / 1000,
      readinessContribution: calculateReadiness(mockHistory),
      topicBreakdown: [],
      weakAreas: [],
      recommendation: accuracy > 70 ? "Excellent!" : "Keep practicing."
    };
  },
  getAssignments: async (studentId: string): Promise<import('../types').Assignment[]> => {
    await delay(500);
    return mockAssignments.filter(a => a.studentId === studentId && a.status === 'PENDING').reverse();
  }
};