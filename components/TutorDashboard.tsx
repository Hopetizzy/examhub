
import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { toast } from 'sonner';
import { User, TutorStudent, TutorSubscriptionPlan, ExamConfig, ExamType, ExamMode } from '../types';
import { tutorService } from '../services/TutorService';
import { EXCEL_TEMPLATE_DATA, TUTOR_PLANS, ALL_PLANS, SUBJECTS_BY_EXAM, EXAM_TYPES } from '../constants';
import { AssignmentReviewModal } from './AssignmentReviewModal';
import { StudentAnalysisModal } from './StudentAnalysisModal';
import { PerformanceForecastWidget } from './PerformanceForecastWidget';
import { BulkEmailModal } from './BulkEmailModal';
import { Assignment, ExamResult } from '../types';
import { SchoolSettings } from './SchoolSettings';
import { SchoolReports } from './SchoolReports';
import { SubAccountManagement } from './SubAccountManagement';
import { TutorialsModal } from './TutorialsModal';

import {
  Users, Plus, Download, Upload, Eye, Search, LogOut, GraduationCap,
  TrendingUp, AlertCircle, CheckCircle, MoreHorizontal, Mail, Filter,
  FileSpreadsheet, Loader2, X, ChevronRight, BarChart2, Clock, Target,
  MessageSquare, BookOpen, User as UserIcon, Info, CreditCard, Shield, Zap, Star, Trophy, Building2, AlertTriangle, Headset,
  Trash2, Send, History, Bell, Check, ShieldCheck,
  Video
} from 'lucide-react';

interface TutorDashboardProps {
  user: User;
  onLogout: () => void;
  onSwitchPlan: () => void;
}

export const TutorDashboard: React.FC<TutorDashboardProps> = ({ user, onLogout, onSwitchPlan }) => {
  const [students, setStudents] = useState<TutorStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'STUDENTS' | 'PLANS' | 'ASSIGNMENTS' | 'SETTINGS' | 'REPORTS' | 'TEAM'>('STUDENTS');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<TutorStudent | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<TutorStudent | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [newStudent, setNewStudent] = useState({ name: '', email: '' });
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 1024) { // Warning for tablets and phones
        setShowMobileWarning(true);
      }
    };
    checkMobile(); // Check on mount
  }, []);

  // Assignment State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignType, setAssignType] = useState<'SINGLE' | 'BULK'>('SINGLE');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(0);
  const [assignConfig, setAssignConfig] = useState<ExamConfig>({
    examType: 'JAMB',
    mode: 'PRACTICE',
    subjects: [],
    topics: []
  });
  const [isAssigning, setIsAssigning] = useState(false);
  const [studentAssignments, setStudentAssignments] = useState<import('../types').Assignment[]>([]);
  const [tutorAssignments, setTutorAssignments] = useState<import('../types').Assignment[]>([]);

  // Notifications State
  const [notifications, setNotifications] = useState<import('../types').Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false);
  const [showTutorialsModal, setShowTutorialsModal] = useState(false); // New
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);

  // School Features
  const [schoolBranding, setSchoolBranding] = useState<import('../types').SchoolBranding>({
    schoolName: 'Tutor Command',
    primaryColor: '#4f46e5', // Indigo-600
    logoUrl: null
  });

  const isMasterTutor = ['plan_expert', 'school_small', 'school_medium', 'school_large', 'school_institution'].includes(user.subscription?.planId || '');
  const isAdvancedTutor = ['plan_pro', 'plan_expert', 'school_small', 'school_medium', 'school_large', 'school_institution'].includes(user.subscription?.planId || '');
  const isSchoolAdmin = ['school_small', 'school_medium', 'school_large', 'school_institution'].includes(user.subscription?.planId || '');

  // For sub-admins, data should be fetched using the parent tutor ID
  const effectiveUserId = user.tutorId || user.id;

  useEffect(() => {
    // Load Notifications
    import('../services/NotificationService').then(m => {
      m.notificationService.getNotifications(effectiveUserId).then(setNotifications);
    });
    // Poll for new notifications every 30s
    const interval = setInterval(() => {
      import('../services/NotificationService').then(m => {
        m.notificationService.getNotifications(effectiveUserId).then(setNotifications);
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [effectiveUserId]);

  useEffect(() => {
    // Load Tutor Assignments
    import('../services/AssignmentService').then(m => {
      m.assignmentService.getTutorAssignments(effectiveUserId).then(setTutorAssignments);
    });

    if (selectedStudent) {
      import('../services/AssignmentService').then(m => {
        m.assignmentService.getAssignmentsForStudent(selectedStudent.id).then(setStudentAssignments);
      });
    } else {
      setStudentAssignments([]);
    }
  }, [selectedStudent]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const list = await tutorService.getStudents(effectiveUserId);
        setStudents(list);
      } catch (err) {
        console.error("Failed to load students", err);
      }
      setLoading(false);
    };
    fetchStudents();
  }, [effectiveUserId]);

  const maxStudents = user.subscription?.maxStudents || 0;
  const isLimitReached = students.length >= maxStudents;

  const handleDownloadTemplate = () => {
    const blob = new Blob([EXCEL_TEMPLATE_DATA], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Student_Bulk_Registration_Template.csv';
    a.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      setUploadError(null);
    }
  };

  const handleBulkUpload = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLimitReached) {
      toast.error("You have reached your student limit. Upgrade your plan to add more students.");
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    const fileInput = document.getElementById('csvInput') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file) {
      const err = "Please select a CSV file first.";
      setUploadError(err);
      setIsUploading(false);
      toast.error(err);
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true, // Auto skip empty lines
      complete: async (results) => {
        try {
          // Map CSV columns to expected structure
          const parsedStudents = results.data
            .map((row: any) => ({
              surname: row.Surname || row.surname,
              full_name: `${row.FirstName || row.firstname || ''} ${row.Surname || row.surname || ''}`.trim(),
              email: row.Email || row.email
            }))
            .filter((s) => s.email && s.surname);

          if (parsedStudents.length === 0) {
            throw new Error("No valid students found. Ensure CSV has 'Surname', 'FirstName', and 'Email' columns.");
          }

          // console.log("Parsed Students:", parsedStudents);

          const remainingSlots = maxStudents - students.length;
          if (parsedStudents.length > remainingSlots) {
            throw new Error(`File contains ${parsedStudents.length} students, but you only have ${remainingSlots} slots remaining.`);
          }

          // Call Registration Service
          const response = await tutorService.bulkRegister(user.id, parsedStudents);
          // console.log("Bulk Register Response:", response);

          // Check for any failures in the response
          const failures = response.filter((r: any) => r.status !== 'success');
          const successes = response.filter((r: any) => r.status === 'success');

          if (failures.length > 0) {
            console.error("Some registrations failed:", failures);
            // Construct a detailed error message
            const errorMsg = `Registered ${successes.length} students, but ${failures.length} failed.`;
            toast.warning(errorMsg, {
              description: failures.map((f: any) => `${f.email}: ${f.reason}`).join(', '),
              duration: 8000
            });
          } else {
            toast.success(`Successfully registered ${successes.length} students!`);
          }

          // Refresh list
          const updatedList = await tutorService.getStudents(user.id);
          setStudents(updatedList);

          setShowUploadModal(false);
          setIsUploading(false);
          setSelectedFileName(null); // Reset file name

        } catch (err: any) {
          console.error("Bulk upload error:", err);
          setUploadError(err.message || "Failed to parse file.");
          setIsUploading(false);
          toast.error(err.message || "Bulk upload failed.");
        }
      },
      error: (error) => {
        console.error("CSV Parse Error:", error);
        setUploadError("CSV Parsing Error: " + error.message);
        setIsUploading(false);
        toast.error("CSV Parsing Error: " + error.message);
      }
    });
  };

  const handleAddSingle = async () => {
    if (!newStudent.name || !newStudent.email) return;
    if (isLimitReached) {
      toast.error('Student limit reached.');
      return;
    }

    setLoading(true);
    try {
      await tutorService.registerStudent(user.id, newStudent);
      // Refresh
      const list = await tutorService.getStudents(user.id);
      setStudents(list);
      setNewStudent({ name: '', email: '' });
      toast.success('Student registered successfully.');
      setShowAddModal(false); // Close modal
    } catch (e: any) {
      console.error("Add single failed", e);
      toast.error(`Failed to register student: ${e.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (student: TutorStudent) => {
    if (!isAdvancedTutor) {
      toast.error("This feature is available on the Advanced Tutor plan.");
      return;
    }
    setSendingReminder(student.id);
    try {
      await tutorService.sendPerformanceReminder(user.id, student.id);
      toast.success(`Performance reminder sent to ${student.name}`);
    } catch (e) {
      toast.error("Failed to send reminder.");
    } finally {
      setSendingReminder(null);
    }
  };

  const handleAssignWork = async () => {
    setIsAssigning(true);
    const targetIds = assignType === 'SINGLE' && selectedStudent
      ? [selectedStudent.id]
      : students.map(s => s.id);

    // Ensure config has reasonable defaults if empty
    const finalConfig = { ...assignConfig };
    if (finalConfig.subjects.length === 0 && SUBJECTS_BY_EXAM[finalConfig.examType].length > 0) {
      finalConfig.subjects = [SUBJECTS_BY_EXAM[finalConfig.examType][0]];
    }

    const options = {
      deadline: deadlineDate ? new Date(deadlineDate).toISOString() : undefined,
      durationMinutes: durationMinutes > 0 ? durationMinutes : undefined
    };

    await tutorService.assignWork(user.id, targetIds, finalConfig, options);

    setIsAssigning(false);
    setShowAssignModal(false);
    // Reset config
    setAssignConfig({
      examType: 'JAMB',
      mode: 'PRACTICE',
      subjects: [],
      topics: []
    });
    setDeadlineDate('');
    setDurationMinutes(0);
    toast.success(`Successfully assigned work to ${targetIds.length} student(s).`);
  };

  const handleDeleteStudent = () => {
    if (!studentToDelete) return;
    setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
    setStudentToDelete(null);
  };

  const handleExportData = async () => {
    try {
      const data = await tutorService.exportStudentData(user.id);
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Student_Export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      toast.success("Data export successful");
    } catch (e) {
      console.error(e);
      toast.error("Failed to export data");
    }
  };

  const stats = {
    total: students.length,
    averageReadiness: students.length > 0 ? Math.round(students.reduce((a, b) => a + b.readinessScore, 0) / students.length) : 0,
    examReady: students.filter(s => s.readinessScore >= 80).length,
    needsSupport: students.filter(s => s.readinessScore < 50).length
  };

  const currentPlan = ALL_PLANS.find(p => p.id === user.subscription?.planId);

  const getPlanIcon = (id: string) => {
    switch (id) {
      case 'plan_basic': return <Zap className="text-blue-500" size={24} />;
      case 'plan_pro': return <Star className="text-purple-500" size={24} />;
      case 'plan_expert': return <Trophy className="text-amber-500" size={24} />;
      case 'plan_school': return <Building2 className="text-indigo-500" size={24} />;
      case 'plan_enterprise': return <Headset className="text-emerald-500" size={24} />;
      default: return <Zap className="text-blue-500" size={24} />;
    }
  };

  // Logic for generating the Word Cloud data
  const weakTopicCloud = useMemo(() => {
    if (!selectedStudent) return [];

    const counts: Record<string, number> = {};
    selectedStudent.weakTopics.forEach(topic => {
      counts[topic] = (counts[topic] || 0) + 1;
    });

    const entries = Object.entries(counts).map(([topic, count]) => ({
      topic,
      count
    }));

    const maxCount = Math.max(...entries.map(e => e.count), 1);

    return entries.map(entry => {
      const weight = entry.count / maxCount; // 0 to 1

      // Calculate Font Size (0.75rem to 1.75rem)
      const fontSize = 0.75 + (weight * 1);

      // Calculate Colors
      let bgColor = 'bg-red-50';
      let textColor = 'text-red-600';
      let borderColor = 'border-red-100';

      if (weight > 0.8) {
        bgColor = 'bg-red-800';
        textColor = 'text-white';
        borderColor = 'border-red-900';
      } else if (weight > 0.5) {
        bgColor = 'bg-red-600';
        textColor = 'text-white';
        borderColor = 'border-red-700';
      } else if (weight > 0.2) {
        bgColor = 'bg-red-100';
        textColor = 'text-red-700';
        borderColor = 'border-red-200';
      }

      return {
        ...entry,
        fontSize: `${fontSize}rem`,
        bgColor,
        textColor,
        borderColor
      };
    }).sort(() => Math.random() - 0.5); // Randomize order for a "cloud" look
  }, [selectedStudent]);

  if (loading && students.length === 0) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 py-4 sticky top-0 z-30 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm text-slate-600 border border-slate-200 overflow-hidden bg-white">
            {isSchoolAdmin && schoolBranding.logoUrl ? (
              <img src={schoolBranding.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              getPlanIcon(user.subscription?.planId || 'plan_basic')
            )}
          </div>
          <div>
            <span className="font-black text-xl text-slate-900 block tracking-tight leading-none">
              {isSchoolAdmin ? schoolBranding.schoolName : 'Tutor Command'}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Plan:</span>
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border 
                ${isMasterTutor ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                {currentPlan?.name || 'Free'}
              </span>
              {isMasterTutor && (
                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg uppercase tracking-widest">
                  <ShieldCheck size={10} /> Priority Support
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-8">
          {isMasterTutor && (
            <button
              onClick={() => {
                const message = encodeURIComponent(`Hello, I am a Master Tutor (${user.email}) and I need priority assistance.`);
                window.open(`https://wa.me/2348143018764?text=${message}`, '_blank');
              }}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition shadow-lg shadow-slate-200"
            >
              <Headset size={16} /> Get Help
            </button>
          )}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button
              onClick={() => setShowTutorialsModal(true)}
              className="hidden md:flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition text-sm font-bold"
            >
              <Video size={18} /> Tutorials
            </button>

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative"
              >
                <Bell size={22} />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
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
          </div>

          <div className="text-right hidden sm:block">
            <div className="font-bold text-sm text-slate-900">{user.name}</div>
            <div className="text-xs text-slate-400 font-medium flex items-center justify-end gap-1.5 mt-0.5">
              <div className={`w-2 h-2 rounded-full ${isLimitReached ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
              {students.length} / {maxStudents} Slots Active
            </div>
          </div>
          <button onClick={onLogout} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all hover:rotate-90 duration-300">
            <LogOut size={22} />
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto w-full px-8 py-10 space-y-10">

        {/* Navigation Tabs */}
        <div className="flex gap-2 p-1.5 bg-slate-200/50 backdrop-blur-sm rounded-2xl w-full md:w-fit shadow-inner border border-slate-200/50 overflow-x-auto whitespace-nowrap custom-scrollbar">
          <button
            onClick={() => setActiveTab('STUDENTS')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all duration-300 shrink-0 ${activeTab === 'STUDENTS' ? 'bg-white text-blue-600 shadow-md scale-105' : 'text-slate-500 hover:bg-slate-300/50 hover:text-slate-700'}`}
          >
            <Users size={18} /> Students
          </button>
          <button
            onClick={() => setActiveTab('ASSIGNMENTS')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all duration-300 shrink-0 ${activeTab === 'ASSIGNMENTS' ? 'bg-white text-blue-600 shadow-md scale-105' : 'text-slate-500 hover:bg-slate-300/50 hover:text-slate-700'}`}
          >
            <BookOpen size={18} /> Assignments
          </button>
          <button
            onClick={() => setActiveTab('PLANS')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all duration-300 shrink-0 ${activeTab === 'PLANS' ? 'bg-white text-blue-600 shadow-md scale-105' : 'text-slate-500 hover:bg-slate-300/50 hover:text-slate-700'}`}
          >
            <CreditCard size={18} /> Subscription
          </button>
          {isSchoolAdmin && (
            <button
              onClick={() => setActiveTab('SETTINGS')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all duration-300 shrink-0 ${activeTab === 'SETTINGS' ? 'bg-white text-blue-600 shadow-md scale-105' : 'text-slate-500 hover:bg-slate-300/50 hover:text-slate-700'}`}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                Admin Settings
              </div>
            </button>
          )}
          {isSchoolAdmin && (
            <button
              onClick={() => setActiveTab('REPORTS')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all duration-300 shrink-0 ${activeTab === 'REPORTS' ? 'bg-white text-blue-600 shadow-md scale-105' : 'text-slate-500 hover:bg-slate-300/50 hover:text-slate-700'}`}
            >
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={16} /> Reports
              </div>
            </button>
          )}
          {isSchoolAdmin && (
            <button
              disabled
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm text-slate-400 bg-slate-100 cursor-not-allowed border-2 border-slate-200 shrink-0"
            >
              <div className="flex items-center gap-2">
                <Users size={16} /> Team
                <span className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-wide">Coming Soon</span>
              </div>
            </button>
          )}
        </div>

        {activeTab === 'SETTINGS' && (
          <SchoolSettings
            currentBranding={schoolBranding}
            onSave={async (newBranding) => {
              // Simulate API call
              await new Promise(r => setTimeout(r, 1000));
              setSchoolBranding(newBranding);
            }}
          />
        )}

        {activeTab === 'REPORTS' && (
          <SchoolReports
            students={students}
            branding={schoolBranding}
          />
        )}

        {activeTab === 'TEAM' && <SubAccountManagement />}

        {activeTab === 'STUDENTS' && (
          <div className="space-y-10 animate-fade-in">
            {/* Tutor Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Students', val: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                { label: 'Class Readiness', val: `${stats.averageReadiness}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                { label: 'Exam Ready', val: stats.examReady, icon: Trophy, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
                { label: 'Support Needed', val: stats.needsSupport, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' }
              ].map((s, i) => (
                <div key={i} className={`bg-white p-6 rounded-[2rem] border ${s.border} shadow-sm flex items-center gap-5 transition-transform hover:scale-[1.03] hover:shadow-lg cursor-default group`}>
                  <div className={`w-14 h-14 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
                    <s.icon size={26} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</div>
                    <div className="text-3xl font-black text-slate-900 tracking-tight">{s.val}</div>
                  </div>
                </div>
              ))}
            </div>

            {isMasterTutor && (
              <div className="animate-fade-in">
                <PerformanceForecastWidget students={students} />
              </div>
            )}

            {/* Student Management Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Student Roster</h2>
                <p className="text-slate-500 font-medium">Click on any student to view detailed diagnostic analysis.</p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={handleDownloadTemplate}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm text-sm"
                >
                  <Download size={18} /> Template
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black transition shadow-xl text-sm ${isLimitReached ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'}`}
                >
                  <Plus size={18} /> {isLimitReached ? 'Plan Limit Reached' : 'New Student'}
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 flex flex-col xl:flex-row items-stretch xl:items-center gap-4 shadow-sm">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-3.5 text-slate-300" size={18} />
                <input
                  type="text"
                  placeholder="Search by name, email or readiness status..."
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none border border-slate-100 font-medium"
                />
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto shrink-0">
                <div className="h-10 w-px bg-slate-100 hidden xl:block"></div>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className={`flex items-center justify-center gap-2 px-5 py-3.5 border rounded-2xl font-black text-xs uppercase tracking-widest transition w-full sm:w-auto shadow-sm ${isLimitReached ? 'bg-slate-50 text-slate-300 border-slate-100' : 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100'}`}
                >
                  <Upload size={18} /> Bulk Excel Registration
                </button>
                {isSchoolAdmin && (
                  <button
                    onClick={handleExportData}
                    className="flex items-center justify-center gap-2 px-5 py-3.5 border rounded-2xl font-black text-xs uppercase tracking-widest transition w-full sm:w-auto shadow-sm bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                  >
                    <Download size={18} /> Export Data
                  </button>
                )}
                {isAdvancedTutor && (
                  <button
                    onClick={() => setShowBulkEmailModal(true)}
                    className="flex items-center justify-center gap-2 px-5 py-3.5 border rounded-2xl font-black text-xs uppercase tracking-widest transition w-full sm:w-auto shadow-sm bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100"
                  >
                    <Mail size={18} /> Bulk Email
                  </button>
                )}
                <button
                  onClick={() => { setAssignType('BULK'); setShowAssignModal(true); }}
                  className={`hidden md:flex items-center justify-center gap-2 px-5 py-3.5 border rounded-2xl font-black text-xs uppercase tracking-widest transition shadow-sm bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100 w-full sm:w-auto`}
                >
                  <Send size={18} /> Assign to All
                </button>
              </div>
            </div>

            {/* Student Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Info</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Readiness</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Attempts</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map(student => (
                      <tr
                        key={student.id}
                        className="group hover:bg-blue-50/40 transition-colors"
                      >
                        <td className="px-6 py-5 cursor-pointer" onClick={() => setSelectedStudent(student)}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-black group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{student.name}</div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1 font-bold uppercase"><Mail size={10} /> {student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ${student.readinessScore >= 80 ? 'bg-green-500' : student.readinessScore >= 50 ? 'bg-blue-500' : 'bg-red-500'}`}
                                style={{ width: `${student.readinessScore}%` }}
                              />
                            </div>
                            <span className="text-sm font-black text-slate-800">{Math.round(student.readinessScore)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="inline-block px-2.5 py-1 bg-white border border-slate-100 rounded-lg text-xs font-black text-slate-600 group-hover:border-blue-200">
                            {student.totalExams}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); }}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            {isMasterTutor && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleSendReminder(student); }}
                                disabled={sendingReminder === student.id}
                                className={`p-2 rounded-xl transition ${sendingReminder === student.id ? 'opacity-50 cursor-wait' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'}`}
                                title="Send Performance Reminder"
                              >
                                {sendingReminder === student.id ? <Loader2 size={18} className="animate-spin" /> : <Bell size={18} />}
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); setStudentToDelete(student); }}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                              title="Delete Student"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {students.length === 0 && (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center">
                    <Users size={32} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">No students yet</h4>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto">Upload an Excel file or add students manually to start monitoring their progress.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ASSIGNMENTS' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Assignment History</h2>
                <p className="text-slate-500 font-medium">Track who has completed their assigned tasks.</p>
              </div>
              <button
                onClick={() => { setAssignType('BULK'); setShowAssignModal(true); }}
                className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Send size={18} /> New Bulk Assignment
              </button>
            </div>

            {/* Assignments Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
              {/* Note: In a real app we would have a separate 'loading' state for this tab or fetch on mount */}
              {tutorAssignments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 gap-6 text-center">
                  <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center">
                    <BookOpen size={40} />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-bold text-lg">No Assignments Sent Yet</h3>
                    <p className="text-slate-500 font-medium mt-1 max-w-xs mx-auto">Start by assigning tasks to your students to track their progress.</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Sent</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Task Info</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tutorAssignments.map(assign => (
                        <tr key={assign.id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                            {new Date(assign.assignedDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">{assign.studentName}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-700 text-xs">{assign.config.examType} - {assign.config.mode}</span>
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider">{assign.config.subjects.length > 0 ? assign.config.subjects[0] : 'Mixed'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${assign.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                              {assign.status === 'COMPLETED' ? <CheckCircle size={12} /> : <Clock size={12} />}
                              {assign.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {assign.status === 'COMPLETED' ? (
                              <div className="flex flex-col items-end gap-1">
                                <span className={`font-black text-lg ${(assign.score || 0) >= 70 ? 'text-green-600' : (assign.score || 0) >= 50 ? 'text-amber-500' : 'text-red-500'
                                  }`}>
                                  {Math.round(assign.score || 0)}%
                                </span>
                                {assign.resultSnapshot && (
                                  <button
                                    onClick={() => {
                                      setSelectedResult(assign.resultSnapshot || null);
                                      setShowAnalysisModal(true);
                                    }}
                                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition"
                                  >
                                    <Eye size={12} /> View Analysis
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'PLANS' && (
          <div className="space-y-12 animate-fade-in">
            {/* Subscription Hero Card */}
            <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -mr-48 -mt-48"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -ml-32 -mb-32"></div>

              <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                    <Shield size={14} /> Current Subscription
                  </div>
                  <div>
                    <h2 className="text-5xl font-black tracking-tight">{currentPlan?.name}</h2>
                    <p className="text-slate-400 font-bold mt-2 text-lg">Managing {maxStudents} students monthly</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Billing Amount</div>
                      <div className="text-xl font-black">{currentPlan?.isCustom ? 'Contracted' : `₦${currentPlan?.price ? (currentPlan.price / 100).toLocaleString() : '0'}`}</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Renewal Date</div>
                      <div className="text-xl font-black">
                        {user.subscription?.expiryDate ? new Date(user.subscription.expiryDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Feature Checklist for Current Plan */}
                  <div className="pt-4">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Active Features</div>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                      {currentPlan?.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-300">
                          <div className="w-4 h-4 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                            <Check size={8} />
                          </div>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-lg">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="font-black text-sm uppercase tracking-widest text-slate-300">Student Capacity</h4>
                    <span className="text-blue-400 font-black">{Math.round((students.length / (maxStudents || 1)) * 100)}% Used</span>
                  </div>
                  <div className="w-full bg-white/10 h-4 rounded-full overflow-hidden mb-6">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                      style={{ width: `${(students.length / (maxStudents || 1)) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">
                    You are currently using <b>{students.length}</b> out of <b>{maxStudents}</b> slots. {isLimitReached ? 'You have reached your limit. Upgrade to add more students.' : 'Scale your business by upgrading your capacity and tools.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Other Plans Grid Trigger */}
            <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 text-center space-y-6">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Need More Slots?</h3>
              <p className="text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
                View all available professional plans and institutional licenses to increase your management capacity.
              </p>
              <button
                onClick={onSwitchPlan}
                className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black hover:bg-slate-800 transition shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 mx-auto"
              >
                <TrendingUp size={20} /> Manage My Subscription
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Confirmation Modal for Student Deletion */}
      {
        studentToDelete && (
          <div className="fixed inset-0 bg-slate-900/60 z-[120] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-in">
              <div className="p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Remove Student?</h3>
                  <p className="text-slate-500 mt-2 text-sm font-medium">
                    Are you sure you want to delete <b className="text-slate-900">{studentToDelete.name}</b>? This action cannot be undone and all their data will be lost.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStudentToDelete(null)}
                    className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteStudent}
                    className="flex-1 py-3.5 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition shadow-lg shadow-red-100"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Manual Registration Modal */}
      {
        showAddModal && (
          <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-slate-900 text-lg tracking-tight">Manual Registration</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-6">
                {isLimitReached ? (
                  <div className="p-6 bg-red-50 border border-red-100 rounded-3xl space-y-4 text-center">
                    <AlertTriangle className="text-red-500 mx-auto" size={32} />
                    <div>
                      <h4 className="font-black text-red-900 uppercase text-xs tracking-widest">Plan Capacity Reached</h4>
                      <p className="text-sm text-red-700 mt-1 font-medium">You cannot add more students on your current <b>{currentPlan?.name}</b> plan.</p>
                    </div>
                    <button
                      onClick={() => { setShowAddModal(false); setActiveTab('PLANS'); }}
                      className="w-full py-3 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition"
                    >
                      Upgrade Now
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Student Full Name</label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-3.5 text-slate-300" size={18} />
                        <input
                          type="text"
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                          placeholder="e.g. Ebuka Chidi"
                          value={newStudent.name}
                          onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-3.5 text-slate-300" size={18} />
                        <input
                          type="email"
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                          placeholder="student@example.com"
                          value={newStudent.email}
                          onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                      <span>Slots Remaining</span>
                      <span className="text-blue-600">{maxStudents - students.length} Slots</span>
                    </div>
                    <button
                      onClick={handleAddSingle}
                      disabled={loading || !newStudent.name || !newStudent.email}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-slate-800 transition disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Register Student'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      }

      {/* Bulk Upload Modal */}
      {
        showUploadModal && (
          <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center"><FileSpreadsheet size={18} /></div>
                  <h3 className="font-black text-slate-900 text-lg tracking-tight">Bulk Registration</h3>
                </div>
                <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition"><X size={20} /></button>
              </div>
              <form onSubmit={handleBulkUpload} className="p-8 space-y-6">
                {isLimitReached ? (
                  <div className="p-6 bg-red-50 border border-red-100 rounded-3xl space-y-4 text-center">
                    <AlertTriangle className="text-red-500 mx-auto" size={32} />
                    <div>
                      <h4 className="font-black text-red-900 uppercase text-xs tracking-widest">Plan Capacity Reached</h4>
                      <p className="text-sm text-red-700 mt-1 font-medium">You cannot register a batch of students as you have used all your <b>{maxStudents}</b> slots.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setShowUploadModal(false); setActiveTab('PLANS'); }}
                      className="w-full py-3 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition"
                    >
                      Manage Subscription
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const files = e.dataTransfer.files;
                        if (files && files[0]) {
                          const fileInput = document.getElementById('csvInput') as HTMLInputElement;
                          if (fileInput) {
                            const dataTransfer = new DataTransfer();
                            dataTransfer.items.add(files[0]);
                            fileInput.files = dataTransfer.files;
                            setSelectedFileName(files[0].name);
                            toast.success(`File attached: ${files[0].name}`);
                          }
                        }
                      }}
                      onClick={() => document.getElementById('csvInput')?.click()}
                      className={`p-12 border-2 border-dashed rounded-3xl flex flex-col items-center text-center gap-4 transition-all cursor-pointer group animate-fade-in ${selectedFileName ? 'border-green-500 bg-green-50/30' : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/50'}`}
                    >
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors shadow-sm ${selectedFileName ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                        {selectedFileName ? <CheckCircle size={32} strokeWidth={2.5} /> : <Upload size={32} strokeWidth={2.5} />}
                      </div>
                      <div className="space-y-1">
                        <p className="font-black text-slate-800 text-lg">{selectedFileName ? 'File Attached Successfully' : 'Click to Upload or Drag File Here'}</p>
                        {selectedFileName ? (
                          <p className="text-sm text-green-700 font-bold bg-green-100 px-3 py-1 rounded-full inline-block mt-2">{selectedFileName}</p>
                        ) : (
                          <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-[200px] mx-auto">Supported Format: CSV or Excel. <br /> Max Size: 5MB</p>
                        )}
                        {!selectedFileName && <p className="text-xs text-blue-600 font-bold mt-2 py-1 px-3 bg-blue-50 rounded-lg inline-block">Slots Available: {maxStudents - students.length}</p>}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        id="csvInput"
                        accept=".csv"
                        onChange={(e) => {
                          const fileName = e.target.files?.[0]?.name;
                          if (fileName) {
                            setSelectedFileName(fileName);
                            toast.success(`File attached: ${fileName}`);
                          }
                        }}
                      />
                    </div>

                    {uploadError && (
                      <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-700 text-[11px] font-bold leading-relaxed">
                        <AlertCircle size={16} className="shrink-0" />
                        {uploadError}
                      </div>
                    )}

                    <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 border border-blue-100">
                      <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                        Each student registered via bulk upload will receive their login credentials at the provided email address automatically.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isUploading}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-slate-800 transition flex items-center justify-center gap-2"
                    >
                      {isUploading ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle size={18} /> Process Batch</>}
                    </button>
                  </>
                )}
              </form>
            </div>
          </div>
        )
      }

      {/* Student Detail Drill-down Modal */}
      {
        selectedStudent && (
          <div className="fixed inset-0 bg-slate-900/80 z-[110] flex items-center justify-end animate-fade-in">
            <div className="bg-white h-full w-full max-w-3xl shadow-2xl flex flex-col animate-slide-right overflow-hidden border-l border-slate-200">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-100">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedStudent.name}</h2>
                    <p className="text-slate-400 font-bold flex items-center gap-1 uppercase text-xs tracking-widest"><Mail size={12} /> {selectedStudent.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <Target className="text-blue-500 mb-3" size={20} />
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery</div>
                    <div className="text-2xl font-black text-slate-900">{selectedStudent.readinessScore}%</div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <Clock className="text-orange-500 mb-3" size={20} />
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attempts</div>
                    <div className="text-2xl font-black text-slate-900">{selectedStudent.totalExams}</div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <TrendingUp className="text-green-500 mb-3" size={20} />
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth</div>
                    <div className="text-2xl font-black text-slate-900">+12%</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart2 className="text-red-500" size={20} />
                    <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Critical Weakness Word Cloud</h3>
                  </div>
                  <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl min-h-[200px] flex flex-wrap items-center justify-center gap-4">
                    {weakTopicCloud.length > 0 ? weakTopicCloud.map((item, i) => (
                      <div
                        key={i}
                        style={{ fontSize: item.fontSize }}
                        className={`px-4 py-2 rounded-2xl font-black border transition-all hover:scale-110 cursor-help shadow-sm ${item.bgColor} ${item.textColor} ${item.borderColor}`}
                        title={`Failed ${item.count} times`}
                      >
                        {item.topic}
                      </div>
                    )) : (
                      <div className="flex flex-col items-center gap-3 text-slate-300">
                        <Info size={32} />
                        <p className="italic text-sm font-medium">No performance data yet</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="text-indigo-500" size={20} />
                    <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Personalized Recommendations</h3>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-sm">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0"><Target size={20} /></div>
                      <div>
                        <h4 className="font-bold text-slate-900">Focus on Fundamental Concepts</h4>
                        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                          {selectedStudent.name} is struggling with {selectedStudent.weakTopics[0] || 'core concepts'}. We suggest assigning the specific topic simulation for this area.
                        </p>
                      </div>
                    </div>
                    <div className="h-px bg-slate-100"></div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0"><Clock size={20} /></div>
                      <div>
                        <h4 className="font-bold text-slate-900">Improve Time Management</h4>
                        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                          Average time per question is slightly above 60s. Recommend timed practice sessions to build speed without sacrificing accuracy.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <History className="text-blue-500" size={20} />
                    <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Assignment History</h3>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    {studentAssignments.length > 0 ? (
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                            <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                            <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {studentAssignments.map(assign => (
                            <tr key={assign.id} className="hover:bg-slate-50 transition">
                              <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                {new Date(assign.assignedDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm font-bold text-slate-800">{assign.config.examType}</span>
                                <span className="text-xs text-slate-400 block">{assign.config.mode}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${assign.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                  }`}>
                                  {assign.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                {assign.status === 'COMPLETED' ? (
                                  <div className="flex flex-col items-end gap-1">
                                    <span className="font-black text-slate-900 text-lg">{assign.score}%</span>
                                    {assign.resultSnapshot && (
                                      <button
                                        onClick={() => {
                                          if (assign.resultSnapshot) {
                                            setSelectedResult(assign.resultSnapshot);
                                            setShowAnalysisModal(true);
                                          }
                                        }}
                                        className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md"
                                      >
                                        <Eye size={10} /> View Analysis
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-slate-300 font-medium">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-8 text-center text-slate-400 italic text-sm">
                        No assignments recorded yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 grid grid-cols-2 gap-4">
                  <button
                    onClick={() => { setAssignType('SINGLE'); setShowAssignModal(true); }}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:bg-blue-700 transition flex items-center justify-center gap-3 group"
                  >
                    <Send size={20} className="group-hover:translate-x-1 transition-transform" /> Assign Work
                  </button>
                  <button
                    onClick={() => setShowHistoryModal(true)}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-slate-800 transition flex items-center justify-center gap-3 group"
                  >
                    <History size={20} className="group-hover:rotate-12 transition-transform" /> View Full History
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-[130] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 text-lg tracking-tight">
                {assignType === 'SINGLE' ? `Assign to ${selectedStudent?.name}` : 'Bulk Class Assignment'}
              </h3>
              <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target Exam Board</label>
                <div className="flex gap-2">
                  {EXAM_TYPES.map(type => (
                    <button
                      key={type}
                      onClick={() => setAssignConfig({ ...assignConfig, examType: type, subjects: [] })}
                      className={`flex-1 py-3 rounded-xl font-bold border-2 transition ${assignConfig.examType === type ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Deadline (Optional)</label>
                    <input
                      type="datetime-local"
                      value={deadlineDate}
                      onChange={e => setDeadlineDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Timer (Minutes)</label>
                    <input
                      type="number"
                      placeholder="Unlimited"
                      value={durationMinutes || ''}
                      onChange={e => setDurationMinutes(parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Select Subjects to Include</label>
                  <select
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    value={assignConfig.subjects[0] || ''}
                    onChange={(e) => setAssignConfig({ ...assignConfig, subjects: [e.target.value] })}
                  >
                    <option value="">-- Choose Subject --</option>
                    {SUBJECTS_BY_EXAM[assignConfig.examType].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mode</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAssignConfig({ ...assignConfig, mode: 'PRACTICE' })}
                      className={`flex-1 py-3 rounded-xl font-bold border-2 transition ${assignConfig.mode === 'PRACTICE' ? 'border-green-500 bg-green-50 text-green-600' : 'border-slate-100 text-slate-400'}`}
                    >
                      Smart Practice
                    </button>
                    <button
                      onClick={() => setAssignConfig({ ...assignConfig, mode: 'TIMED' })}
                      className={`flex-1 py-3 rounded-xl font-bold border-2 transition ${assignConfig.mode === 'TIMED' ? 'border-red-500 bg-red-50 text-red-600' : 'border-slate-100 text-slate-400'}`}
                    >
                      Timed Exam
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAssignWork}
                  disabled={assignConfig.subjects.length === 0 || isAssigning}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-slate-800 transition disabled:opacity-50 mt-4 flex justify-center items-center gap-2"
                >
                  {isAssigning ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Send Assignment</>}
                </button>

                {assignType === 'BULK' && (
                  <p className="text-center text-xs text-slate-400 font-medium">
                    This will be sent to <b>{students.length}</b> active students.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}



      {selectedStudent && (
        <StudentAnalysisModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          student={selectedStudent}
        />
      )}

      {selectedResult && (
        <AssignmentReviewModal
          isOpen={showAnalysisModal}
          onClose={() => setShowAnalysisModal(false)}
          result={selectedResult}
        />
      )}

      <BulkEmailModal
        isOpen={showBulkEmailModal}
        onClose={() => setShowBulkEmailModal(false)}
        students={students}
        userEmail={user.email}
        tutorId={effectiveUserId}
      />

      <TutorialsModal
        isOpen={showTutorialsModal}
        onClose={() => setShowTutorialsModal(false)}
        userRole="TUTOR"
      />

      {/* Mobile Warning Modal */}
      {showMobileWarning && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] p-6 max-w-[90vw] w-full text-center shadow-2xl border-4 border-yellow-400 animate-bounce-in">
            <div className="w-14 h-14 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">Desktop Recommended</h3>
            <p className="text-slate-600 mb-6 text-xs sm:text-sm leading-relaxed max-w-[260px] mx-auto">
              The Tutor Dashboard is optimized for larger screens. For the best experience, please use a <b>Desktop/Laptop</b> or switch your mobile browser to <b>Desktop Mode</b>.
            </p>
            <button
              onClick={() => setShowMobileWarning(false)}
              className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg text-sm"
            >
              I Understand, Continue
            </button>
          </div>
        </div>
      )}
    </div >
  );
};
