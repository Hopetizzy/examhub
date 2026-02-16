export type ExamMode = 'TIMED' | 'PRACTICE';
export type ExamType = 'JAMB' | 'WAEC';
export type UserRole = 'STUDENT' | 'TUTOR' | 'INDIVIDUAL' | 'ADMIN';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  surname: string;
  role: 'student' | 'tutor' | 'individual' | 'admin';
  is_tutor_registered: boolean;
  tutor_id?: string;
  has_free_access?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  role: UserRole;
  subscription?: TutorSubscription;
  tutorId?: string; // Linked tutor for students
}

export interface TutorSubscription {
  planId: string;
  maxStudents: number;
  expiryDate: string;
}

export interface TutorSubscriptionPlan {
  id: string;
  name: string;
  price: number;
  maxStudents: number;
}

export interface TutorStudent {
  id: string;
  name: string;
  email: string;
  readinessScore: number;
  totalExams: number;
  lastActive: string;
  weakTopics: string[];
}

export interface Textbook {
  title: string;
  author: string;
  reason: string;
}

export interface TopicDetail {
  name: string;
  objectives: string[];
  explanations: string[];
  commonMistakes: string[];
}

export type Subject = 'Mathematics' | 'English' | 'Physics' | 'Chemistry' | 'Biology' | 'Government' | 'Economics' | 'Civic Education';

export interface Option {
  id: string;
  text: string;
  options?: any;
}

export interface Question {
  id: string;
  examType: ExamType;
  subject: Subject;
  topic: string;
  text: string;
  options: Option[];
  correctOptionId: string;
  explanation?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  syllabusTopic?: string; // Added to link back to syllabus
}

export interface ExamConfig {
  examType: ExamType;
  mode: ExamMode;
  subjects: string[];
  topics: string[];
  assignmentId?: string; // Track if this exam is an assignment
  bypassPayment?: boolean; // Skip payment modal if already paid (e.g. via Paystack in Dashboard)
}

export interface ExamSession {
  id: string;
  examType: ExamType;
  mode: ExamMode;
  config?: ExamConfig;
  startTime: number;
  durationMinutes: number;
  questions: Question[];
  answers: Record<string, string>;
  isSubmitted: boolean;
  score?: number;
}

export interface ReadinessScore {
  total: number; // 0-100
  label: 'Not Ready' | 'Fair' | 'Almost Ready' | 'Exam Ready';
  breakdown: {
    accuracy: number;
    mastery: number;
    speed: number;
    consistency: number;
  };
}

export interface ExamHistoryItem {
  id: string;
  date: string;
  examType: ExamType;
  mode: ExamMode;
  score: number;
  total: number;
  accuracy: number;
  subjects: string[];
  weakAreas: string[];
}

export interface DashboardData {
  stats: {
    totalExams: number;
    averageScore: number;
    bestScore: number;
    timeSpentMinutes: number;
    readinessScore: ReadinessScore;
  };
  recentActivity: ExamHistoryItem[];
  weakTopicAnalysis: { topic: string; failureCount: number }[];
}

export interface ExamResult {
  id: string;
  date: string;
  examType: ExamType;
  mode: ExamMode;
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeSpentSeconds: number;
  readinessContribution: ReadinessScore;
  topicBreakdown: { topic: string; correct: number; total: number }[];
  weakAreas: string[];
  recommendation: string;
  sessionData?: ExamSession; // Optional: Full session data for review (questions, answers)
}

export interface Assignment {
  id: string;
  studentId: string;
  tutorId: string;
  config: ExamConfig;
  assignedDate: string;
  status: 'PENDING' | 'COMPLETED';
  score?: number;

  // New fields
  deadline?: string;
  durationMinutes?: number;
  resultSnapshot?: ExamResult;
  studentName?: string; // Optional for tutor view
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  createdAt: string;
  link?: string; // Optional link to navigate to (e.g., to an assignment)
  metadata?: { isPopup?: boolean }; // For bulk message popups
}

export interface SchoolBranding {
  schoolName: string;
  primaryColor: string;
  logoUrl: string | null;
}

export interface Tutorial {
  id: string;
  title: string;
  url: string; // YouTube URL
  subject: Subject;
  topic?: string;
  description: string;
  is_active: boolean;
  created_at?: string;
}
