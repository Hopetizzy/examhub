import React, { useState, useEffect } from 'react';
import { AuthService } from './services/AuthService';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { PaymentModal } from './components/PaymentModal';
import { ExamEngine } from './components/ExamEngine';
import { ExamAnalysisPage } from './components/ExamAnalysisPage';
import { ExamReview } from './components/ExamReview';
import { Dashboard } from './components/Dashboard';
import { TutorDashboard } from './components/TutorDashboard';
import { TutorPlanSelection } from './components/TutorPlanSelection';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminAccessPage } from './components/AdminAccessPage'; // Imported
import { tutorService } from './services/TutorService';
import { mockAuthService, mockExamService, mockTutorService } from './services/mockService';
import { ExamService } from './services/ExamService';
// import { GeminiService } from './services/GeminiService'; // Replaced by QuestionService
import { QuestionService } from './services/QuestionService';
import { JAMB_SYLLABUS_2025 } from './data/SyllabusData';
import { STANDARD_QUESTION_COUNTS, SUBJECTS_BY_EXAM, TUTOR_PLANS, ALL_PLANS } from './constants';
import { User, ExamMode, ExamSession, ExamResult, ExamConfig, UserRole, TutorStudent, Question, Subject } from './types';
import { Toaster, toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { supabase } from './services/supabase';

import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';

type AppView = 'LANDING' | 'DASHBOARD' | 'EXAM' | 'RESULT' | 'REVIEW' | 'TUTOR_PLAN_SELECTION' | 'TUTOR_DASHBOARD' | 'ADMIN_DASHBOARD' | 'ADMIN_ACCESS' | 'PRIVACY' | 'TERMS';

const App: React.FC = () => {
  // Synchronously check for session to avoid flash/race conditions
  const loadSavedSession = (): ExamSession | null => {
    try {
      // Try LocalStorage first
      let saved = localStorage.getItem('active_exam_session');
      // Fallback to SessionStorage
      if (!saved) saved = sessionStorage.getItem('active_exam_session');

      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.questions && parsed.questions.length > 0 && !parsed.isSubmitted) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to parse init session", e);
    }
    return null;
  };

  const initialSession = loadSavedSession();

  const [view, setView] = useState<AppView>(() => {
    // If we have a valid session or hash #exam, start in EXAM view (wait for auth/hydration if needed)
    // But safely, if we have a session object, we can show EXAM.
    return initialSession ? 'EXAM' : 'LANDING';
  });

  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<TutorStudent[]>([]);

  // Stored state for flows
  const [pendingMode, setPendingMode] = useState<ExamMode | null>(null);
  const [pendingConfig, setPendingConfig] = useState<ExamConfig | null>(null);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Exam State
  const [currentSession, setCurrentSession] = useState<ExamSession | null>(initialSession);
  const [currentResult, setCurrentResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Check for existing session
  useEffect(() => {
    // Skip auth check if in Admin Access mode (until they verify)
    if (view === 'ADMIN_ACCESS') return;

    const initAuth = async () => {
      setLoading(true);
      try {
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);

          // Check for active exam session first
          let savedSession = localStorage.getItem('active_exam_session');
          if (!savedSession) savedSession = sessionStorage.getItem('active_exam_session');

          // Check hash too
          const isExamHash = window.location.hash === '#exam';

          console.log("[App] Checked for session:", savedSession ? "Found" : "Not Found", "Hash:", window.location.hash);

          if (savedSession) {
            try {
              const parsed = JSON.parse(savedSession);
              // Simple validation
              if (parsed && parsed.questions && parsed.questions.length > 0) {
                console.log("[App] Session found. Ready to resume via Dashboard banner.");
                setCurrentSession(parsed);
                // setView('EXAM'); // DISABLED: User wants Dashboard + Banner on refresh
                // if (!isExamHash) window.location.hash = 'exam';
                // return; // Allow fall-through to Dashboard
              }
            } catch (err) {
              console.error("[App] Failed to parse saved session", err);
              // Do NOT automatically clear it on error, allow refresh retry
            }
          }

          // Clear hash if we failed to restore OR if we are intentionally going to Dashboard now
          if (isExamHash) window.location.hash = '';

          // Default routing
          if (view !== 'EXAM' && view !== 'RESULT' && view !== 'REVIEW' && view !== 'ADMIN_ACCESS') {
            if (currentUser.role === 'TUTOR') setView('TUTOR_DASHBOARD');
            else if (currentUser.role === 'ADMIN') setView('ADMIN_DASHBOARD');
            else setView('DASHBOARD');
          }
        }
      } catch (e) {
        console.error("Session restore failed", e);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [view]);

  // Sync tutor students when user changes
  useEffect(() => {
    if (user?.role === 'TUTOR') {
      const loadStudents = async () => {
        try {
          // Use the real service to get accurate count
          // If sub-admin (has tutorId), fetch students of the parent
          const effectiveId = user.tutorId || user.id;
          const list = await tutorService.getStudents(effectiveId);
          setStudents(list);
        } catch (e) {
          console.error("Failed to load students in App", e);
        }
      };
      loadStudents();
    }
  }, [user]);

  // Protect against accidental refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (view === 'EXAM') {
        e.preventDefault();
        e.returnValue = ''; // Chrome requires returnValue to be set
        return ''; // Legacy support
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [view]);

  // --- Handlers ---

  const handleLandingSignIn = () => {
    setPendingMode(null);
    setShowAuthModal(true);
  };

  /* handleSelectModeFromLanding Logic Updated to check questions availability */
  const handleSelectModeFromLanding = async (mode: ExamMode) => {
    // We need to know what subjects "JAMB" usually entails if not specified.
    // Landing page usually implies "JAMB" with default subjects or user will choose later?
    // Actually, in this flow, subjects are not chosen yet. They are chosen in the payment/setup or assumed defaults.
    // But wait, the previous logic just set pendingMode and opened Auth or Payment.
    // If the user hasn't chosen subjects, we can't check questions yet.
    // However, usually "Payment Modal" or "Plan Selection" might allow subject selection?
    // Looking at PaymentModal usage, does it allow subject selection? 
    // If I look at the components, PaymentModal is likely just for payment.
    // Dashboard -> Start Exam -> Config has subjects.
    // Landing -> Start Exam -> No subjects selected yet?
    // Let's assume for Landing flow, we might need to let them pass or check "General" availability?
    // Implementation Decision: For Landing Page flow, we might strictly check if ANY content exists for JAMB,
    // OR just let them proceed to dashboard where they configure it.
    // BUT, the prompt said "before payment". 
    // If Landing -> Auth -> Payment Modal, they pay before configuring? That seems flawed flow if so.
    // Let's look at `handleAuthSuccess`. If they came from Landing, it goes to PaymentModal?

    // Safety check: Checking if ANY questions exist for JAMB at all is a good baseline.
    const anyQuestions = await QuestionService.hasQuestions('JAMB', 'Use Default'); // 'Use Default' might fail if strictly matching subject name
    // Actually, we should check at least one subject.
    // Let's Pick 'English' as mandatory.

    const hasEnglish = await QuestionService.hasQuestions('JAMB', 'English');
    if (!hasEnglish) {
      toast.error("The question database is currently empty. Please contact admin.");
      return;
    }

    setPendingMode(mode);
    setPendingConfig({ examType: 'JAMB', mode, subjects: [], topics: [] });
    if (!user) {
      setShowAuthModal(true);
    } else {
      setShowPaymentModal(true);
    }
  };

  const handleAuthSuccess = async (user: User) => {
    setUser(user);
    setShowAuthModal(false);

    // Check pending mode
    if (user.role === 'TUTOR') {
      // If they have an active subscription (check expiry), go to dashboard
      // Otherwise, force plan selection
      if (user.subscription?.expiryDate && new Date(user.subscription.expiryDate) > new Date()) {
        setView('TUTOR_DASHBOARD');
      } else {
        setView('TUTOR_PLAN_SELECTION');
      }
    } else if (user.role === 'ADMIN') {
      setView('ADMIN_DASHBOARD');
    } else {
      if (pendingMode) {
        setShowPaymentModal(true);
      } else {
        setView('DASHBOARD');
      }
    }
  };

  const handleTutorSelectPlan = async (planId: string) => {
    if (!user) return;
    const updatedUser = await mockTutorService.subscribe(user.id, planId);
    setUser(updatedUser);
    setView('TUTOR_DASHBOARD');
  };

  const handleDashboardStartExam = async (config: ExamConfig) => {
    setLoading(true);
    // Check if questions exist for the selected subjects
    const subjectsToCheck = (config.subjects.length > 0 && config.subjects[0] !== 'Use Default')
      ? config.subjects
      : SUBJECTS_BY_EXAM[config.examType];

    console.log("[App] Validating subjects:", subjectsToCheck); // Debug log

    let allAvailable = true;
    for (const subj of subjectsToCheck) {
      const has = await QuestionService.hasQuestions(config.examType, subj);
      if (!has) {
        allAvailable = false;
        console.warn(`[App] Validation failed for ${subj}`); // Debug log
        toast.error(`No questions available for ${subj} in ${config.examType}. Cannot proceed.`);
        break;
      }
    }

    setLoading(false);

    if (allAvailable) {
      console.log("[App] All subjects validated.", config.bypassPayment ? "Bypassing payment modal." : "Proceeding to payment.");

      setPendingConfig(config);
      setPendingMode(config.mode);

      if (config.bypassPayment) {
        // Direct jump to "success" logic which starts the exam
        // PASS CONFIG EXPLICITLY to avoid React state race condition
        handlePaymentSuccess(config);
      } else {
        setShowPaymentModal(true);
      }
    }
  };

  // --- Unified Exam Start Logic ---

  const startExamSession = async (configToUse: ExamConfig) => {
    setLoading(true);
    try {
      // Fetch Questions from Database
      let questions: Question[] = [];
      // Map 'Use Default' or empty to actual subjects for the exam type
      const subjects = (configToUse.subjects.length > 0 && configToUse.subjects[0] !== 'Use Default')
        ? configToUse.subjects
        : SUBJECTS_BY_EXAM[configToUse.examType];

      console.log(`[App] Starting Exam Session. Config:`, configToUse);
      console.log(`[App] Fetching questions for subjects:`, subjects);

      if (subjects && subjects.length > 0) {
        // Parallel Fetch for all subjects
        const promises = subjects.map(async (subj) => {
          const subjectKey = subj as Subject;
          const targetCount = STANDARD_QUESTION_COUNTS[subjectKey] || STANDARD_QUESTION_COUNTS['default'];

          try {
            // Fetch ALL questions for this subject in one go to ensure uniqueness and shuffling
            // We pass 'count: targetCount' to getting strictly the amount needed
            const subjectQuestions = await QuestionService.getQuestions(
              subjectKey,
              '', // General/All topics
              targetCount,
              configToUse.examType
            );
            return subjectQuestions;
          } catch (err) {
            console.warn(`Failed to fetch questions for ${subj}`, err);
            return [] as Question[];
          }
        });

        const results = await Promise.all(promises);

        // Flatten results into the main questions array
        // Order: Subject 1 Questions, then Subject 2 Questions... (Preserves grouping)
        results.forEach(batch => {
          questions.push(...batch);
        });
      }

      if (questions.length > 0) {
        // Create session with fetched questions
        const session: ExamSession = {
          id: `EXAM-${Date.now()}`,
          examType: configToUse.examType,
          mode: configToUse.mode,
          config: configToUse,
          startTime: Date.now(),
          durationMinutes: configToUse.mode === 'TIMED' ? 45 : 0, // 45 mins for AI exam
          questions: questions, // Kept sequential by subject (shuffled within subjects)
          answers: {},
          isSubmitted: false,
        };

        setCurrentSession(session);
        setCurrentResult(null); // Clear previous result if any

        try {
          const json = JSON.stringify(session);
          localStorage.setItem('active_exam_session', json);
          sessionStorage.setItem('active_exam_session', json); // Redundant backup
        } catch (e) {
          console.error("Failed to save session to storage", e);
          toast.error("Warning: Session could not be saved to local storage. Refreshing may lose progress.");
        }

        window.location.hash = 'exam'; // Set Hash
        setView('EXAM');
      } else {
        toast.error("No questions found for this selection in the database.");
      }

    } catch (e) {
      console.error("Failed to start exam", e);
      toast.error("An error occurred while starting the exam.");
    }
    setLoading(false);
  };

  const handlePaymentSuccess = async (explicitConfig?: ExamConfig) => {
    setShowPaymentModal(false);

    // Prefer explicit config (from fresh validation bypass) -> then pending (from modal flow) -> then default
    const configToUse: ExamConfig = explicitConfig || pendingConfig || {
      examType: 'JAMB',
      mode: pendingMode || 'PRACTICE',
      subjects: [],
      topics: []
    };

    await startExamSession(configToUse);
  };

  const handleExamSubmit = async (answers: Record<string, string>) => {
    if (!currentSession) return;

    setLoading(true);
    const sessionWithAnswers = { ...currentSession, answers, isSubmitted: true };

    // Keep this session state for Review capability!
    setCurrentSession(sessionWithAnswers);

    const result = await ExamService.saveExamResult(sessionWithAnswers);
    localStorage.removeItem('active_exam_session');
    sessionStorage.removeItem('active_exam_session');
    window.location.hash = ''; // Clear Hash

    // Check if this was an assignment and mark as complete
    if (currentSession.config?.assignmentId) {
      try {
        const { assignmentService } = await import('./services/AssignmentService');
        await assignmentService.completeAssignment(currentSession.config.assignmentId, result);
        toast.success("Assignment submitted successfully!");

        // Refresh assignments list in dashboard (will happen naturally on re-mount/fetch)
      } catch (err) {
        console.error("Failed to complete assignment", err);
        toast.error("Assignment submitted, but status update failed.");
      }
    }

    setCurrentResult(result);
    setView('RESULT');
    setLoading(false);
  };

  // New handler for Dashboard History
  const handleViewResult = async (examId: string) => {
    setLoading(true);
    try {
      console.log(`[App] Fetching result for ID: ${examId}`);
      const res = await ExamService.getResultById(examId);
      if (res) {
        setCurrentResult(res);
        // Load session data if available for review
        if (res.sessionData) {
          console.log("[App] Session data found for result, enabling review.");
          setCurrentSession(res.sessionData);
        } else {
          setCurrentSession(null); // No review for old exams
        }
        setView('RESULT');
      } else {
        console.error(`[App] Result not found for ID: ${examId}`);
        toast.error(`Exam result not found. (ID: ${examId})`);
      }
    } catch (e: any) {
      console.error("Failed to load result", e);
      toast.error(`Error loading result: ${e.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAnswers = () => {
    if (currentSession && view === 'RESULT') {
      setView('REVIEW');
    } else {
      toast.error("Review details are no longer available.");
    }
  };

  const handleRetake = async () => {
    if (currentSession) {
      // Dynamic Retake: Fetch NEW questions using the SAME config
      // This ensures we get a fresh set from the DB (randomized)
      await startExamSession(currentSession.config);
    } else {
      setView('DASHBOARD');
    }
  };

  const handleHome = () => {
    if (user) {
      if (user.role === 'TUTOR') setView('TUTOR_DASHBOARD');
      else if (user.role === 'ADMIN') setView('ADMIN_DASHBOARD');
      else setView('DASHBOARD');

      // setView(user.role === 'TUTOR' ? 'TUTOR_DASHBOARD' : 'DASHBOARD');
    } else {
      setView('LANDING');
    }
    // Clear session storage if quitting
    localStorage.removeItem('active_exam_session');
    sessionStorage.removeItem('active_exam_session');
    window.location.hash = ''; // Clear Hash

    setCurrentSession(null);
    setCurrentResult(null);
    setPendingMode(null);
    setPendingConfig(null);
  };

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
    } catch (error) {
      console.error("Logout error", error);
    }

    // Clear all storage to ensure no persistence
    localStorage.clear();
    sessionStorage.clear();

    setUser(null);
    setView('LANDING');
    setPendingMode(null);
    setPendingConfig(null);
    setStudents([]);
    setCurrentSession(null);

    // Remove query param
    window.history.replaceState(null, '', window.location.pathname);
  };

  const handleAdminAccessSuccess = () => {
    // Grant temp access (in real app, use auth token or specific role persistence)
    setView('ADMIN_DASHBOARD');
  };

  // --- Render ---

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-slate-500 font-medium">Please wait...</p>
      </div>
    );
  }

  return (
    <div className="font-sans text-slate-900">
      {view === 'ADMIN_ACCESS' && (
        <AdminAccessPage
          onSuccess={handleAdminAccessSuccess}
          onCancel={() => {
            window.history.replaceState(null, '', window.location.pathname);
            setView('LANDING');
          }}
        />
      )}

      {view === 'LANDING' && (
        <LandingPage
          onSelectMode={handleSelectModeFromLanding}
          onSignIn={handleLandingSignIn}
          onViewPrivacy={() => setView('PRIVACY')}
          onViewTerms={() => setView('TERMS')}
        />
      )}

      {view === 'TUTOR_PLAN_SELECTION' && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50">
          <TutorPlanSelection
            currentStudentCount={students.length}
            currentPlanId={user?.subscription?.planId}
            userEmail={user?.email || ''}
            userId={user?.id || ''}
            onSelectPlan={async (planId) => {
              const { data } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
              if (data) {
                // Determine Plan Config
                const planConfig = ALL_PLANS.find(p => p.id === data.subscription_plan_id) || TUTOR_PLANS[0];

                setUser({
                  ...user!,
                  subscription: {
                    planId: data.subscription_plan_id,
                    maxStudents: data.max_students,
                    expiryDate: data.subscription_expiry
                  }
                });
              }
              setView('TUTOR_DASHBOARD');
            }}
            onCancel={() => setView('TUTOR_DASHBOARD')}
          />
        </div>
      )}

      {view === 'TUTOR_DASHBOARD' && user && (
        <TutorDashboard
          user={user}
          onLogout={handleLogout}
          onSwitchPlan={() => setView('TUTOR_PLAN_SELECTION')}
        />
      )}

      {(view === 'ADMIN_DASHBOARD' && (user?.role === 'ADMIN' || view === 'ADMIN_DASHBOARD')) && ( // Allow view override for secret access
        <AdminDashboard onLogout={handleLogout} />
      )}

      {view === 'DASHBOARD' && user && (
        <Dashboard
          user={user}
          onStartExam={handleDashboardStartExam}
          onLogout={handleLogout}
          onViewResult={handleViewResult}
          onResumeSession={() => {
            // Logic to force resume if Dashboard finds a session but App missed it
            const saved = localStorage.getItem('active_exam_session');
            if (saved) {
              try {
                const parsed = JSON.parse(saved);
                setCurrentSession(parsed);
                window.location.hash = 'exam';
                setView('EXAM');
              } catch (e) { toast.error("Could not resume session"); }
            }
          }}
        />
      )}

      {view === 'EXAM' && currentSession && (
        <ExamEngine session={currentSession} onSubmit={handleExamSubmit} />
      )}

      {view === 'RESULT' && currentResult && (
        <ExamAnalysisPage
          result={currentResult}
          onRetake={handleRetake}
          onHome={handleHome}
          onReview={handleReviewAnswers}
        />
      )}

      {view === 'REVIEW' && currentSession && (
        <ExamReview
          session={currentSession}
          onBack={() => setView('RESULT')}
        />
      )}

      {view === 'PRIVACY' && (
        <PrivacyPolicy onBack={() => setView(user ? (user.role === 'TUTOR' ? 'TUTOR_DASHBOARD' : 'DASHBOARD') : 'LANDING')} />
      )}

      {view === 'TERMS' && (
        <TermsOfService onBack={() => setView(user ? (user.role === 'TUTOR' ? 'TUTOR_DASHBOARD' : 'DASHBOARD') : 'LANDING')} />
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        onViewPrivacy={() => { setShowAuthModal(false); setView('PRIVACY'); }}
        onViewTerms={() => { setShowAuthModal(false); setView('TERMS'); }}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        mode={pendingMode}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
      <Toaster />
    </div>
  );
};

export default App;
