import React, { useState, useEffect } from 'react';
import { User, DashboardData, ExamMode, ExamConfig, ExamType, Assignment, Subject, ExamResult, ExamSession } from '../types';
import { useExamSession } from '../hooks/useExamSession';
import { mockExamService } from '../services/mockService';
import { GeminiService } from '../services/GeminiService';
import { paymentService } from '../services/PaymentService';
import { usePaystackPayment } from 'react-paystack';
import { toast } from 'sonner';
import { SUBJECTS_BY_EXAM, PRICING, EXAM_TYPES, TEXTBOOKS } from '../constants';
import { AssignmentReviewModal } from './AssignmentReviewModal';
import { SyllabusService, SyllabusTopic } from '../services/SyllabusService';

import {
    Clock, CheckCircle, Play, History,
    Loader2, LogOut, AlertCircle, Cloud,
    Book, Info, GraduationCap, ChevronRight, Sparkles, Layers, FileText, X, Mail,
    BookOpen, Calculator, Calendar,
    LayoutDashboard, Menu, PieChart, Settings,
    User as UserIcon, Zap, Bell, Target, Award, Brain, Video
} from 'lucide-react';
import { TutorialsModal } from './TutorialsModal';
import { BulkMessagePopup } from './BulkMessagePopup';

import { ExamService } from '../services/ExamService';
import { assignmentService } from '../services/AssignmentService';
import { QuestionService } from '../services/QuestionService';
import { ExamEngine } from './ExamEngine';

interface DashboardProps {
    user: User;
    onLogout: () => void;
    onStartExam?: (config: ExamConfig) => void; // Explicitly add this if missing in type definition, though likely inferred
    onResumeSession?: () => void;
    onViewResult: (examId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onResumeSession, onStartExam, onViewResult }) => {
    const [activeTab, setActiveTab] = useState<'PRACTICE' | 'SYLLABUS' | 'ASSIGNMENTS'>('PRACTICE');
    const [showExamModal, setShowExamModal] = useState(false);
    const [hasResumableSession, setHasResumableSession] = useState(false); // New state
    const [showTutorialsModal, setShowTutorialsModal] = useState(false); // New State

    useEffect(() => {
        // Check for resumable session on mount
        const saved = localStorage.getItem('active_exam_session');
        if (saved && onResumeSession) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed && !parsed.isSubmitted) {
                    setHasResumableSession(true);
                }
            } catch (e) {
                // Ignore invalid
            }
        }
    }, [onResumeSession]);
    const [selectedExamType, setSelectedExamType] = useState<ExamType>('JAMB');
    const [selectedMode, setSelectedMode] = useState<ExamMode>('PRACTICE');
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [isAllSubjects, setIsAllSubjects] = useState(false);

    // Data State
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [history, setHistory] = useState<Assignment[]>([]);

    // Syllabus State
    const [syllabusSubject, setSyllabusSubject] = useState<Subject>('Mathematics');
    const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
    const [dynamicSyllabus, setDynamicSyllabus] = useState<any[]>([]); // Grouped structure
    const [loadingSyllabus, setLoadingSyllabus] = useState(false);

    useEffect(() => {
        const fetchSyllabus = async () => {
            if (activeTab === 'SYLLABUS') {
                setLoadingSyllabus(true);
                try {
                    const topics = await SyllabusService.getAllTopics(syllabusSubject);

                    // Group by Topic
                    // DB: { topic: 'Algebra', sub_topic: 'Polynomials' }
                    // UI Expects: { name: 'Algebra', subtopics: ['Polynomials', ...] }
                    const grouped: any[] = [];
                    const map = new Map<string, string[]>();

                    topics.forEach(t => {
                        if (!map.has(t.topic)) map.set(t.topic, []);
                        if (t.sub_topic) map.get(t.topic)?.push(t.sub_topic);
                    });

                    map.forEach((subs, name) => {
                        grouped.push({ name, subtopics: subs });
                    });

                    setDynamicSyllabus(grouped);
                } catch (e) {
                    toast.error("Failed to load syllabus");
                } finally {
                    setLoadingSyllabus(false);
                }
            }
        };
        fetchSyllabus();
    }, [activeTab, syllabusSubject]);

    // Notifications Link
    const [notifications, setNotifications] = useState<import('../types').Notification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);

    // Bulk Message Popup State
    const [bulkMessage, setBulkMessage] = useState<import('../types').Notification | null>(null);

    useEffect(() => {
        // Load Notifications
        const loadNotifications = async () => {
            const m = await import('../services/NotificationService');
            const notifs = await m.notificationService.getNotifications(user.id);
            setNotifications(notifs);

            // Check for unread bulk message popup
            const popupMsg = notifs.find(n => !n.isRead && n.metadata?.isPopup);
            if (popupMsg) {
                setBulkMessage(popupMsg);
            }
        };

        loadNotifications();

        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, [user.id]);

    // Sidebar Analysis
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);
    const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);

    // Load Data Helper
    const refreshDashboard = async () => {
        const dashboardData = await ExamService.getDashboardData(user.id);
        setData(dashboardData);
    };

    const refreshAssignments = async () => {
        const userAssignments = await assignmentService.getStudentAssignments(user.id);
        setAssignments(userAssignments);
    };

    // Initial Data Load
    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([refreshDashboard(), refreshAssignments()]);
                const myHistory = await assignmentService.getAssignmentsForStudent(user.id);
                setHistory(myHistory);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
                toast.error("Failed to load latest data. Please refresh.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user.id]);

    // Exam Session Hook - Only used for history/results now, not active exams?
    // Actually, useExamSession exposes submitExam, which we don't need if App handles it.
    // We keep it for 'lastResult' or other minor utilities if needed, but we don't start exams here.
    const {
        // isExamActive, // Unused
        // currentSession, // Unused
        // startExam, // Unused
        // submitExam // Unused
    } = useExamSession({
        userId: user.id,
        onAssignmentComplete: refreshAssignments,
        onExamComplete: refreshDashboard
    });

    const handleStartExam = async (config?: ExamConfig) => {
        const finalConfig: ExamConfig = config || {
            examType: selectedExamType,
            mode: selectedMode,
            subjects: selectedSubjects,
            topics: []
        };

        // DELEGATE TO APP:
        if (onStartExam) {
            onStartExam(finalConfig);
            setShowExamModal(false);
        } else {
            toast.error("Unable to start exam: System Error (Missing Handler)");
        }
    };

    // const handleSubmitExam = submitExam; // DEPRECATED

    const handleToggleExamType = (type: ExamType) => {
        setSelectedExamType(type);
        setSelectedSubjects([]);
        setIsAllSubjects(false);
    };

    // Payment State
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [pricing, setPricing] = useState({ PRACTICE: 500, TIMED: 1000 });

    useEffect(() => {
        const loadPricing = async () => {
            const prices = await paymentService.getPricing();
            setPricing(prices);
        };
        loadPricing();
    }, []);

    const config = {
        reference: (new Date()).getTime().toString(),
        email: user.email,
        amount: (selectedMode === 'TIMED' ? pricing.TIMED : pricing.PRACTICE) * 100, // Paystack expects kobo
        publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
    };

    // We cannot use the hook directly in the callback, so we initialize it here
    // However, the hook requires config to be passed initially. 
    // A better approach for dynamic config is to use the direct function call or init with default and update? 
    // react-paystack hook 'initializePayment' can take a callback/onSuccess. 
    // But config is strictly used during initialization in some versions, but usually re-renders update it.
    // Let's rely on the re-render updating the config passed to the hook.
    const initializePayment = usePaystackPayment(config);

    const onPaymentSuccess = async (reference: any) => {
        setIsProcessingPayment(true);
        try {
            await paymentService.recordPayment(user.id, reference.reference, config.amount / 100);
            setIsProcessingPayment(false);

            // Start Exam Immediately (Bypassing Mock Modal)
            handleStartExam({
                examType: selectedExamType,
                mode: selectedMode,
                subjects: isAllSubjects ? [] : selectedSubjects,
                topics: [],
                bypassPayment: true // FLAGGED TO SKIP MOCK
            });

        } catch (error) {
            console.error("Payment recording failed", error);
            // Fallback: Allow user to proceed even if DB recording fails (Paystack has the record)
            toast.warning("Payment verified! (Note: Receipt could not be saved to account history due to a network/permission issue)");

            setIsProcessingPayment(false);

            // Start Exam (Fallback)
            handleStartExam({
                examType: selectedExamType,
                mode: selectedMode,
                subjects: isAllSubjects ? [] : selectedSubjects,
                topics: [],
                bypassPayment: true // FLAGGED TO SKIP MOCK
            });
        }
    };

    const handleStart = async () => {
        if (selectedSubjects.length === 0 && !isAllSubjects) return;

        setLoading(true);

        // 1. Validation: Ensure we actually have questions for the selected subjects
        const subjectsToCheck = isAllSubjects ? SUBJECTS_BY_EXAM[selectedExamType] : selectedSubjects;

        let allAvailable = true;
        for (const subj of subjectsToCheck) {
            const has = await QuestionService.hasQuestions(selectedExamType, subj);
            if (!has) {
                allAvailable = false;
                toast.error(`No questions available for ${subj}. Please deselect it or contact admin.`);
                break;
            }
        }

        if (!allAvailable) {
            setLoading(false);
            return; // Abort completely
        }

        // 2. Check Eligibility (Payment)
        const check = await paymentService.checkEligibility(user.id);
        setLoading(false);

        if (check.eligible) {
            handleStartExam({
                examType: selectedExamType,
                mode: selectedMode,
                subjects: isAllSubjects ? [] : selectedSubjects,
                topics: [],
                bypassPayment: true // Eligible users also bypass payment modal
            });
        } else {
            // Trigger Paystack
            initializePayment({ onSuccess: onPaymentSuccess, onClose: () => toast.info("Payment cancelled.") });
        }
    };

    const getStudyGuide = (topicName: string, subtopics: string[]) => {
        return (
            <div className="prose prose-sm prose-blue text-slate-700 leading-relaxed">
                <p>
                    <strong>Key Concepts:</strong> This topic, <em>{topicName}</em>, is fundamental to mastering {syllabusSubject}.
                    It specifically covers {subtopics.slice(0, 3).join(', ')}, which frequently appear in JAMB/WAEC exams.
                </p>
                <p>
                    <strong>Study Strategy:</strong> Focus on understanding the core definitions and resolving practice questions related to {subtopics[0]}.
                    We recommend reading the corresponding chapter in your recommended textbook and taking
                    at least 2 practice sessions on this specific topic.
                </p>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
                    <p className="font-bold text-yellow-700 text-xs uppercase tracking-wider mb-1">Research Prompt</p>
                    <p className="text-sm text-yellow-800 italic">
                        "What are the most common application scenarios for {topicName} in real-world problems?"
                    </p>
                </div>
            </div>
        );
    };

    // REMOVED LOCAL EXAM RENDER BLOCK - App.tsx handles Rendering View='EXAM'



    // REMOVED LOCAL EXAM RENDER BLOCK - App.tsx handles Rendering View='EXAM'


    const activeSyllabusData = dynamicSyllabus;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col overflow-x-hidden">
            <nav className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 sticky top-0 z-30 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                        <GraduationCap className="text-white" size={20} />
                    </div>
                    <span className="font-bold text-xl text-slate-800 tracking-tight">Exam Hub</span>
                </div>
                <div className="flex items-center gap-4">
                    {/* Notification Bell */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all relative"
                        >
                            <div className="relative">
                                <History size={20} className="hidden" /> {/* Placeholder to keep imports valid if needed */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                            </div>
                            {notifications.filter(n => !n.isRead).length > 0 && (
                                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-[100] animate-fade-in">
                                <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                    <h4 className="font-bold text-slate-900 text-sm">Notifications</h4>
                                    <button
                                        onClick={() => {
                                            import('../services/NotificationService').then(m => {
                                                m.notificationService.markAllAsRead(user.id);
                                                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                                            });
                                        }}
                                        className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-wide"
                                    >
                                        Mark all read
                                    </button>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-slate-400 text-sm italic">
                                            No notifications
                                        </div>
                                    ) : (
                                        notifications.map(n => (
                                            <div key={n.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition ${!n.isRead ? 'bg-blue-50/30' : ''}`}>
                                                <div className="flex gap-3">
                                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!n.isRead ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                                                    <div>
                                                        <h5 className="font-bold text-slate-800 text-sm leading-tight mb-1">{n.title}</h5>
                                                        <p className="text-xs text-slate-500 leading-relaxed">{n.message}</p>
                                                        <span className="text-[10px] text-slate-400 mt-2 block font-medium">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setShowTutorialsModal(true)}
                        className="hidden md:flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition text-sm font-bold"
                    >
                        <Video size={18} /> Tutorials
                    </button>
                    <div className="hidden sm:block text-right">
                        <div className="font-bold text-sm text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-400 font-medium">Student Account</div>
                    </div>
                    <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all hover:rotate-90 duration-300">
                        <LogOut size={20} />
                    </button>
                </div>
            </nav>

            {/* Resume Banner */}
            {hasResumableSession && (
                <div className="bg-orange-600 text-white px-6 py-3 flex items-center justify-between sticky top-[73px] z-20 shadow-lg animate-slide-down">
                    <div className="flex items-center gap-2 font-bold text-sm">
                        <AlertCircle size={20} className="animate-pulse" />
                        <span>You have an active exam session in progress.</span>
                    </div>
                    <button
                        onClick={onResumeSession}
                        className="bg-white text-orange-600 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide hover:bg-orange-50 transition shadow-sm"
                    >
                        Resume Exam
                    </button>
                </div>
            )}

            <div className="max-w-7xl mx-auto w-full px-4 md:px-6 py-8 grid lg:grid-cols-4 gap-8">
                {/* Main Section */}
                <div className="lg:col-span-3 space-y-8 min-w-0">
                    {/* Tabs */}
                    <div className="flex gap-2 p-1 bg-slate-200 rounded-xl w-fit">
                        <button
                            onClick={() => setActiveTab('PRACTICE')}
                            className={`px-6 py-2 rounded-lg font-bold text-sm transition ${activeTab === 'PRACTICE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-300'}`}
                        >
                            Practice Zone
                        </button>
                        <button
                            onClick={() => setActiveTab('SYLLABUS')}
                            className={`px-6 py-2 rounded-lg font-bold text-sm transition ${activeTab === 'SYLLABUS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-300'}`}
                        >
                            Syllabus Hub
                        </button>
                        {(user.tutorId || user.role === 'STUDENT') && (
                            <button
                                onClick={() => setActiveTab('ASSIGNMENTS')}
                                className={`px-6 py-2 rounded-lg font-bold text-sm transition ${activeTab === 'ASSIGNMENTS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-300'}`}
                            >
                                Assignments
                            </button>
                        )}
                    </div>

                    {activeTab === 'PRACTICE' ? (
                        <div className="space-y-8 animate-fade-in">
                            {/* Readiness Overview */}
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col md:flex-row items-center gap-8 shadow-sm transition hover:shadow-md">
                                <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * (data?.stats?.readinessScore?.total || 0)) / 100} className="text-blue-600 transition-all duration-1000" strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute flex flex-col items-center">
                                        <span className="text-2xl font-black text-slate-900">{Math.round(data?.stats?.readinessScore?.total ?? 0)}%</span>
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Ready</span>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <h3 className="text-xl font-bold text-slate-900">Overall Status: <span className="text-blue-600">{data?.stats?.readinessScore?.label ?? 'Calculating...'}</span></h3>
                                    <p className="text-slate-500 text-sm">Based on your last {data?.stats?.totalExams ?? 0} attempts. Your average accuracy is {Math.round(data?.stats?.readinessScore?.breakdown?.accuracy ?? 0)}%.</p>
                                    <div className="flex flex-wrap gap-4 pt-2">
                                        {Object.entries(data?.stats?.readinessScore?.breakdown || {}).map(([k, v]) => (
                                            <div key={k} className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                <span className="text-xs font-bold text-slate-600 capitalize">{k}: {Math.round(v as number)}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* New Session Config */}
                            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                                <div className="p-6 border-b border-slate-100 flex items-center gap-2 font-bold text-slate-900 bg-slate-50/50">
                                    <Play size={18} className="text-blue-600 fill-current" /> Start New Session
                                </div>
                                <div className="p-8 space-y-8">
                                    {/* Exam Type Selector */}
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">1. Select Exam Board</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {EXAM_TYPES.map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => handleToggleExamType(type)}
                                                    className={`py-3 rounded-xl font-bold border-2 transition ${selectedExamType === type ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Mode & Subjects */}
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">2. Select Mode</label>
                                            <div className="space-y-3">
                                                <button onClick={() => setSelectedMode('PRACTICE')} className={`w-full p-4 rounded-xl border-2 text-left flex justify-between items-center transition ${selectedMode === 'PRACTICE' ? 'border-green-500 bg-green-50 shadow-sm' : 'border-slate-100 hover:border-slate-200'}`}>
                                                    <div>
                                                        <div className="font-bold text-slate-900">Smart Practice</div>
                                                        <div className="text-xs text-slate-500">Instant feedback & explanations</div>
                                                    </div>
                                                    <CheckCircle className={selectedMode === 'PRACTICE' ? 'text-green-500' : 'text-slate-200'} />
                                                </button>
                                                <button onClick={() => setSelectedMode('TIMED')} className={`w-full p-4 rounded-xl border-2 text-left flex justify-between items-center transition ${selectedMode === 'TIMED' ? 'border-red-500 bg-red-50 shadow-sm' : 'border-slate-100 hover:border-slate-200'}`}>
                                                    <div>
                                                        <div className="font-bold text-slate-900">Timed Simulation</div>
                                                        <div className="text-xs text-slate-500">Strict JAMB/WAEC environment</div>
                                                    </div>
                                                    <Clock className={selectedMode === 'TIMED' ? 'text-red-500' : 'text-slate-200'} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">3. Pick Subjects</label>
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => setIsAllSubjects(!isAllSubjects)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${isAllSubjects ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                                >
                                                    All Subjects
                                                </button>
                                                {!isAllSubjects && SUBJECTS_BY_EXAM[selectedExamType].map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => setSelectedSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${selectedSubjects.includes(s) ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-800 text-xs mb-4">
                                        <AlertCircle className="shrink-0 text-amber-600" size={16} />
                                        <span>
                                            <strong>Warning:</strong> Once the exam starts, <u>do not refresh or reload page</u>.
                                            Due to browser security policies, your progress may be lost if you leave the exam page.
                                        </span>
                                    </div>

                                    <button
                                        onClick={handleStart}
                                        disabled={!isAllSubjects && selectedSubjects.length === 0}
                                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition transform hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        START {selectedExamType} EXAM
                                        {/* Pricing only for individual users */}
                                        {!user.tutorId && ` • ₦${selectedMode === 'TIMED' ? pricing.TIMED.toLocaleString() : pricing.PRACTICE.toLocaleString()}`}
                                    </button>
                                </div>
                            </div>
                        </div>

                    ) : activeTab === 'ASSIGNMENTS' ? (
                        <div className="space-y-8 animate-fade-in">
                            <div className="bg-white rounded-3xl p-8 border border-slate-200">
                                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <FileText className="text-blue-600" /> My Assignments
                                </h2>

                                <div className="space-y-8">
                                    {/* Active Assignments */}
                                    <div>
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Pending Tasks</h3>
                                        <div className="grid gap-4">
                                            {assignments.length > 0 ? assignments.map(assign => (
                                                <div key={assign.id} className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-black text-slate-900 text-lg">{assign.config.examType}</span>
                                                            <span className="px-2 py-0.5 bg-blue-200 text-blue-700 rounded text-[10px] font-bold uppercase">{assign.config.mode}</span>
                                                        </div>
                                                        <div className="text-sm text-slate-500 font-medium">
                                                            {assign.config.subjects.join(', ') || 'All Subjects'}
                                                        </div>
                                                        <div className="text-xs text-slate-400 mt-2 flex items-center gap-4">
                                                            <span className="flex items-center gap-1"><Clock size={12} /> Assigned: {new Date(assign.assignedDate).toLocaleDateString()}</span>
                                                            {assign.deadline && <span className="flex items-center gap-1 text-red-400 font-bold"><AlertCircle size={12} /> Due: {new Date(assign.deadline).toLocaleDateString()}</span>}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleStartExam({ ...assign.config, assignmentId: assign.id, bypassPayment: true })}
                                                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition"
                                                    >
                                                        Start Assignment
                                                    </button>
                                                </div>
                                            )) : (
                                                <div className="text-center py-8 text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                                    No pending practice assigned.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* History */}
                                    <div>
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Completed History</h3>
                                        <div className="overflow-hidden rounded-2xl border border-slate-200">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-50 border-b border-slate-100">
                                                    <tr>
                                                        <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                                                        <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Exam</th>
                                                        <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Score</th>
                                                        <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {history.filter(h => h.status === 'COMPLETED').map(h => (
                                                        <tr key={h.id} className="hover:bg-slate-50 transition">
                                                            <td className="px-6 py-4 text-sm text-slate-600 font-medium">{new Date(h.assignedDate).toLocaleDateString()}</td>
                                                            <td className="px-6 py-4">
                                                                <span className="font-bold text-slate-800">{h.config.examType}</span>
                                                                <span className="text-xs text-slate-400 block">{h.config.subjects.join(', ')}</span>
                                                            </td>
                                                            <td className="px-6 py-4 font-black text-slate-900">{h.score}%</td>
                                                            <td className="px-6 py-4 text-right">
                                                                {h.resultSnapshot ? (
                                                                    <button
                                                                        onClick={() => onViewResult(h.resultSnapshot!.id)}
                                                                        className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
                                                                    >
                                                                        View Analysis
                                                                    </button>
                                                                ) : '-'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {history.filter(h => h.status === 'COMPLETED').length === 0 && (
                                                        <tr>
                                                            <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic text-sm">No completed assignments yet.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl border border-slate-200 min-h-[600px] flex flex-col md:flex-row animate-fade-in shadow-sm overflow-hidden bg-white w-full max-w-full">
                            {/* Left Rail: Subjects */}
                            <div className="w-full md:w-48 border-b md:border-b-0 md:border-r border-slate-100 p-2 md:p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible bg-slate-50/50 shrink-0 z-10 backdrop-blur-sm">
                                <h4 className="hidden md:block text-[10px] font-black text-slate-400 uppercase mb-4 pl-2 tracking-widest">Subjects</h4>
                                {SUBJECTS_BY_EXAM['JAMB'].map((s: string) => (
                                    <button
                                        key={s}
                                        onClick={() => setSyllabusSubject(s as Subject)}
                                        className={`shrink-0 whitespace-nowrap md:whitespace-normal md:w-full text-left px-3 py-1.5 md:p-3 rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-all ${syllabusSubject === s ? 'bg-blue-600 text-white md:bg-blue-100 md:text-blue-700 shadow-md md:shadow-sm' : 'text-slate-500 hover:bg-slate-100 bg-white md:bg-transparent border md:border-0 border-slate-200'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>

                            {/* Content: Topics & Details */}
                            <div className="flex-1 min-w-0 overflow-x-auto p-3 md:p-8 space-y-6 md:space-y-8 md:overflow-y-auto md:max-h-[1000px] custom-scrollbar">
                                <div className="flex justify-between items-end border-b border-slate-100 pb-4 md:pb-6">
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{syllabusSubject} Syllabus</h2>
                                        <p className="text-slate-400 font-medium text-xs md:text-base">Official {new Date().getFullYear()} Curriculum</p>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-bold">
                                        <Book size={16} /> {loadingSyllabus ? <Loader2 className="animate-spin" size={14} /> : activeSyllabusData?.length || 0} Modules
                                    </div>
                                </div>

                                {/* Topics List */}
                                <div className="space-y-3 md:space-y-4">
                                    {activeSyllabusData?.map((topic: any, i: number) => (
                                        <div key={i} className="border border-slate-100 rounded-xl md:rounded-2xl overflow-hidden transition-all hover:border-slate-300">
                                            <button
                                                onClick={() => {
                                                    setExpandedTopic(expandedTopic === topic.name ? null : topic.name);
                                                    // setAiExplanation(null); // Removed
                                                }}
                                                className="w-full flex justify-between items-center p-4 md:p-5 text-left bg-slate-50/50 hover:bg-slate-100 transition"
                                            >
                                                <div className="flex items-center gap-3 md:gap-4">
                                                    <span className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center bg-white rounded-md md:rounded-lg text-slate-400 font-black text-[10px] md:text-xs border border-slate-200 shadow-sm shrink-0">{i + 1}</span>
                                                    <span className="font-bold text-sm md:text-base text-slate-800 line-clamp-2">{topic.name}</span>
                                                </div>
                                                <ChevronRight className={`transition-transform duration-300 shrink-0 ${expandedTopic === topic.name ? 'rotate-90 text-blue-600' : 'text-slate-300'}`} size={18} />
                                            </button>

                                            {expandedTopic === topic.name && (
                                                <div className="p-6 bg-white space-y-6 animate-slide-down">
                                                    <div className="space-y-4">
                                                        <div>
                                                            <h5 className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase mb-3"><Layers size={14} /> Sub-topics</h5>
                                                            <div className="flex flex-wrap gap-2">
                                                                {topic.subtopics?.map((st: string, idx: number) => (
                                                                    <span key={idx} className="bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg text-sm text-slate-600 font-medium">
                                                                        {st}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                                                            <div className="flex justify-between items-start mb-4">
                                                                <h5 className="flex items-center gap-2 text-sm font-black text-blue-700 uppercase"><Sparkles size={16} /> Study Guide</h5>
                                                            </div>

                                                            <div className="animate-fade-in">
                                                                {getStudyGuide(topic.name, topic.subtopics)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Textbooks */}
                                <div className="pt-8 border-t border-slate-100">
                                    <h4 className="text-sm font-black text-slate-400 uppercase mb-4 tracking-widest">Recommended Texts</h4>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {TEXTBOOKS[syllabusSubject]?.map((book, i) => (
                                            <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition">
                                                <div className="font-bold text-slate-800">{book.title}</div>
                                                <div className="text-xs text-slate-400 mb-2">By {book.author}</div>
                                                <p className="text-[11px] text-slate-500 italic leading-relaxed">"{book.reason}"</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar: History & Analysis */}
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                            <History size={18} className="text-slate-400" /> Recent Attempts
                        </h3>
                        <div className="space-y-3">
                            {data?.recentActivity?.slice(0, 5).map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => onViewResult(item.id)}
                                    className="w-full text-left p-3 border border-slate-50 rounded-xl hover:bg-blue-50 hover:border-blue-100 transition cursor-pointer group"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest ${item.examType === 'JAMB' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                            {item.examType}
                                        </span>
                                        <span className="text-sm font-black text-slate-800 flex items-center gap-1">
                                            {Math.round(item.accuracy)}%
                                            <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-1 truncate font-medium group-hover:text-slate-600 transition-colors">
                                        {item.subjects.join(', ')}
                                    </div>
                                </button>
                            )) || <p className="text-xs text-slate-400 text-center py-4">No recent activity</p>}
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <h3 className="font-black mb-4 flex items-center gap-2 relative z-10">
                            <Cloud size={18} className="text-blue-400" /> Weak Topics Cloud
                        </h3>
                        <div className="flex flex-wrap gap-2 relative z-10">
                            {data?.weakTopicAnalysis?.length ? data.weakTopicAnalysis.map((item, idx) => (
                                <span key={idx} className="bg-white/10 px-2 py-1 rounded-lg text-xs font-medium hover:bg-white/20 transition cursor-help border border-white/5">
                                    {item.topic}
                                </span>
                            )) : <p className="text-xs text-white/40 italic">Take more exams to reveal weak areas</p>}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-6 relative z-10">AI analysis identifies these as priority focus for your next smart practice session.</p>
                    </div>
                </div>
            </div>

            <AssignmentReviewModal
                isOpen={showAnalysisModal}
                onClose={() => setShowAnalysisModal(false)}
                result={selectedResult!}
            />
            <BulkMessagePopup
                notification={bulkMessage}
                onAcknowledge={async () => {
                    if (!bulkMessage) return;
                    const msgId = bulkMessage.id;
                    setBulkMessage(null);
                    try {
                        const m = await import('../services/NotificationService');
                        await m.notificationService.markAsRead(msgId);
                        setNotifications(prev => prev.map(n => n.id === msgId ? { ...n, isRead: true } : n));
                    } catch (e) {
                        console.error("Failed to mark bulk message as read", e);
                    }
                }}
            />

            <TutorialsModal
                isOpen={showTutorialsModal}
                onClose={() => setShowTutorialsModal(false)}
                userRole="STUDENT"
            />
        </div>
    );
};