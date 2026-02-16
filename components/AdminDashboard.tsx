
import React, { useState, useEffect } from 'react';
import { QuestionService } from '../services/QuestionService';
import { Question, Subject, Profile, Tutorial } from '../types';
import { TutorialService } from '../services/TutorialService';
import { AdminService } from '../services/AdminService';
import { SyllabusService, SyllabusTopic } from '../services/SyllabusService';
import Papa from 'papaparse';
import {
    Trash2, Upload, FileUp, Loader2, RefreshCcw, Search, Video, Plus, ExternalLink,
    PlayCircle, BookOpen, Users, LayoutDashboard, Crown, LogOut, ShieldCheck,
    FileText, CheckCircle, AlertCircle, TrendingUp, DollarSign, Edit, Save, X, ChevronDown, ChevronUp, GraduationCap, BarChart3, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface AdminDashboardProps {
    onLogout: () => void;
}

type Tab = 'DASHBOARD' | 'USERS' | 'TUTORS' | 'QUESTIONS' | 'TUTORIALS' | 'SYLLABUS' | 'ANALYTICS';

interface TutorAnalytics extends Profile {
    studentCount: number;
    avgReadiness: number;
    plan: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState<Tab>('DASHBOARD');

    // Stats & Analytics
    const [stats, setStats] = useState({ totalUsers: 0, totalExams: 0, totalRevenue: 0, recentUsers: [] as any[] });
    const [loadingStats, setLoadingStats] = useState(false);
    const [growthData, setGrowthData] = useState<any[]>([]);
    const [examData, setExamData] = useState<any[]>([]);

    // Users
    const [users, setUsers] = useState<Profile[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [userSearch, setUserSearch] = useState('');

    // Tutors
    const [tutors, setTutors] = useState<TutorAnalytics[]>([]);
    const [loadingTutors, setLoadingTutors] = useState(false);

    // Questions
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [questionPage, setQuestionPage] = useState(0);
    const [subjectFilter, setSubjectFilter] = useState<string>('');
    const [examTypeFilter, setExamTypeFilter] = useState<string>('');
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

    // Tutorials
    const [tutorials, setTutorials] = useState<Tutorial[]>([]);
    const [loadingTutorials, setLoadingTutorials] = useState(false);
    const [showTutorialModal, setShowTutorialModal] = useState(false);
    const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null);
    const [newTutorial, setNewTutorial] = useState<{ title: string; video_url: string; description: string; target_role: 'ALL' | 'STUDENT' | 'TUTOR' }>({
        title: '', video_url: '', description: '', target_role: 'ALL'
    });

    // Syllabus
    const [syllabus, setSyllabus] = useState<SyllabusTopic[]>([]);
    const [loadingSyllabus, setLoadingSyllabus] = useState(false);
    const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
    const [showSyllabusModal, setShowSyllabusModal] = useState(false);
    const [newSyllabusTopic, setNewSyllabusTopic] = useState<Partial<SyllabusTopic>>({});

    useEffect(() => {
        if (activeTab === 'DASHBOARD') { loadStats(); loadAnalytics(); }
        if (activeTab === 'USERS') loadUsers();
        if (activeTab === 'TUTORS') loadTutors();
        if (activeTab === 'QUESTIONS') loadQuestions();
        if (activeTab === 'TUTORIALS') loadTutorials();
        if (activeTab === 'SYLLABUS') loadSyllabus();
    }, [activeTab, questionPage, subjectFilter, examTypeFilter]);

    // Loaders
    const loadStats = async () => {
        setLoadingStats(true);
        try { const data = await AdminService.getSystemStats(); setStats(data); }
        catch (e) { toast.error("Failed stats"); } finally { setLoadingStats(false); }
    };

    const loadAnalytics = async () => {
        try {
            const { growthData, examData } = await AdminService.getAnalyticsData();
            setGrowthData(growthData);
            setExamData(examData);
        } catch (e: any) { console.error("Analytics Error", e); }
    };

    const loadUsers = async () => {
        setLoadingUsers(true);
        try { const data = await AdminService.getAllUsers(); setUsers(data); }
        catch (e) { toast.error("Failed users"); } finally { setLoadingUsers(false); }
    };

    const loadTutors = async () => {
        setLoadingTutors(true);
        try { const data = await AdminService.getTutorAnalytics(); setTutors(data as unknown as TutorAnalytics[]); }
        catch (e) { toast.error("Failed tutors"); } finally { setLoadingTutors(false); }
    };

    const loadQuestions = async () => {
        setLoadingQuestions(true);
        try {
            const { questions: data, total } = await QuestionService.getAllQuestions(
                questionPage,
                20,
                subjectFilter || undefined,
                examTypeFilter || undefined
            );
            setQuestions(data); setTotalQuestions(total || 0);
        } catch (e) { toast.error("Failed questions"); } finally { setLoadingQuestions(false); }
    };

    const loadTutorials = async () => {
        setLoadingTutorials(true);
        try { const data = await TutorialService.getAllTutorialsForAdmin(); setTutorials(data); }
        catch (e) { toast.error("Failed tutorials"); } finally { setLoadingTutorials(false); }
    };

    const loadSyllabus = async () => {
        setLoadingSyllabus(true);
        try { const data = await SyllabusService.getAllTopics(); setSyllabus(data); }
        catch (e) { toast.error("Failed syllabus"); } finally { setLoadingSyllabus(false); }
    };

    // Actions
    const handleToggleFreeAccess = async (userId: string, currentStatus: boolean) => {
        try { await AdminService.toggleFreeAccess(userId, !currentStatus); toast.success("Access updated"); loadUsers(); }
        catch (e) { toast.error("Failed"); }
    };

    const handleSaveQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingQuestion) return;
        try {
            await QuestionService.updateQuestion(editingQuestion.id, editingQuestion);
            toast.success("Question updated");
            setEditingQuestion(null);
            loadQuestions();
        } catch (e) { toast.error("Update failed"); }
    };

    const handleDeleteQuestion = async (id: string) => {
        if (!confirm("Are you sure you want to delete this question?")) return;
        try {
            await QuestionService.deleteQuestion(id);
            toast.success("Question deleted");
            loadQuestions();
        } catch (e) {
            toast.error("Failed to delete question");
        }
    };

    const handleSaveTutorial = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingTutorial) {
                // Use newTutorial state which contains the form edits
                await TutorialService.updateTutorial(editingTutorial.id, newTutorial);
                toast.success("Tutorial updated");
            } else {
                await TutorialService.createTutorial({ ...newTutorial, is_active: true, order: tutorials.length + 1 });
                toast.success("Tutorial created");
            }
            setShowTutorialModal(false);
            setEditingTutorial(null);
            setNewTutorial({ title: '', video_url: '', description: '', target_role: 'ALL' });
            loadTutorials();
        } catch (e) { toast.error("Operation failed"); }
    };

    const handleSaveSyllabus = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (newSyllabusTopic.id) {
                await SyllabusService.updateTopic(newSyllabusTopic.id, newSyllabusTopic);
                toast.success("Topic updated");
            } else {
                if (!newSyllabusTopic.subject || !newSyllabusTopic.topic) return toast.error("Subject and Topic required");
                await SyllabusService.createTopic(newSyllabusTopic as any);
                toast.success("Topic created");
            }
            setShowSyllabusModal(false);
            setNewSyllabusTopic({});
            loadSyllabus();
        } catch (e) { toast.error("Operation failed"); }
    };

    const handleDeleteSyllabus = async (id: string) => {
        if (!confirm("Delete this topic?")) return;
        try { await SyllabusService.deleteTopic(id); toast.success("Deleted"); loadSyllabus(); } catch (e) { toast.error("Failed"); }
    };



    // CSV Template
    const handleDownloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8," +
            "examType,subject,topic,subTopic,text,optionA,optionB,optionC,optionD,correctOption,explanation,difficulty\n" +
            "JAMB,Mathematics,Algebra,Polynomials,Solve 2x+4=10,2,3,4,5,B,Subtract 4 then divide by 2,EASY";

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "question_template.csv");
        document.body.appendChild(link);
        link.click();
    };

    // CSV Upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results: any) => {
                try {
                    const parsedQuestions: any[] = results.data.map((row: any) => ({
                        examType: row.examType?.trim(),
                        subject: row.subject?.trim(),
                        topic: row.topic?.trim(),
                        syllabusTopic: row.subTopic?.trim() || row.topic?.trim(),
                        difficulty: row.difficulty?.toUpperCase() || 'MEDIUM',
                        text: row.text?.trim() || row['content(text)']?.trim(),
                        options: [
                            { id: 'A', text: row.optionA },
                            { id: 'B', text: row.optionB },
                            { id: 'C', text: row.optionC },
                            { id: 'D', text: row.optionD }
                        ],
                        correctOptionId: (row.correctOption || row['correctOption(A/B/C/D)'])?.trim().toUpperCase(),
                        explanation: row.explanation?.trim()
                    }));

                    const valid = parsedQuestions.filter(q => q.text && q.subject && q.examType);

                    if (valid.length === 0) {
                        toast.error("No valid questions found in CSV");
                        return;
                    }

                    const res = await QuestionService.bulkUploadQuestions(valid);
                    if (res?.success) {
                        toast.success(`Successfully imported ${res.count} questions!`);
                        loadQuestions();
                    } else {
                        console.error("Upload failed", res?.error);
                        toast.error(`Import failed: ${res?.error?.message || res?.error?.details || "Unknown error"}`);
                    }
                } catch (err: any) {
                    console.error(err);
                    toast.error(`CSV Parse Error: ${err.message}`);
                }
            },
            error: (err) => {
                toast.error(`CSV Error: ${err.message}`);
            }
        });
    };




    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
                <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-900/50"><ShieldCheck size={24} /></div>
                    <div><h1 className="font-black text-lg tracking-tight">Admin Portal</h1><p className="text-xs text-slate-400 font-medium">System Control</p></div>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <SidebarItem icon={<LayoutDashboard size={20} />} label="To Dashboard" active={activeTab === 'DASHBOARD'} onClick={() => setActiveTab('DASHBOARD')} />
                    <SidebarItem icon={<BarChart3 size={20} />} label="Analytics" active={activeTab === 'ANALYTICS'} onClick={() => setActiveTab('ANALYTICS')} />
                    <div className="pt-4 pb-2 pl-4 text-xs font-black text-slate-500 uppercase tracking-widest">Management</div>
                    <SidebarItem icon={<Users size={20} />} label="All Users" active={activeTab === 'USERS'} onClick={() => setActiveTab('USERS')} />
                    <SidebarItem icon={<GraduationCap size={20} />} label="Tutors & Plans" active={activeTab === 'TUTORS'} onClick={() => setActiveTab('TUTORS')} />
                    <div className="pt-4 pb-2 pl-4 text-xs font-black text-slate-500 uppercase tracking-widest">Content</div>
                    <SidebarItem icon={<BookOpen size={20} />} label="Question Bank" active={activeTab === 'QUESTIONS'} onClick={() => setActiveTab('QUESTIONS')} />
                    <SidebarItem icon={<Video size={20} />} label="Video Tutorials" active={activeTab === 'TUTORIALS'} onClick={() => setActiveTab('TUTORIALS')} />
                    <SidebarItem icon={<FileText size={20} />} label="Syllabus Manager" active={activeTab === 'SYLLABUS'} onClick={() => setActiveTab('SYLLABUS')} />
                </nav>
                <div className="p-4 border-t border-slate-800"><button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition font-medium"><LogOut size={20} /><span>Log Out</span></button></div>
            </aside>

            <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
                {activeTab === 'DASHBOARD' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="flex justify-between items-center">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Overview</h2>
                            <p className="text-slate-500 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard title="Total Users" value={stats.totalUsers} icon={<Users />} color="blue" loading={loadingStats} />
                            <StatCard title="Exams Taken" value={stats.totalExams} icon={<FileText />} color="purple" loading={loadingStats} />
                            <StatCard title="Revenue" value={`₦${stats.totalRevenue.toLocaleString()}`} icon={<DollarSign />} color="green" loading={loadingStats} />
                        </div>

                        {/* Middle Row: Charts & Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Chart Column (Takes 2/3) */}
                            <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><TrendingUp size={18} className="text-blue-600" /> Growth Trend</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={growthData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip /><Line type="monotone" dataKey="users" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} /></LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Recent Activity Column (Takes 1/3) */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><Clock size={18} className="text-purple-600" /> Recent Signups</h3>
                                <div className="space-y-4">
                                    {stats.recentUsers && stats.recentUsers.map((u: any, i) => (
                                        <div key={i} className="flex items-center gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                                {u.full_name?.charAt(0) || 'U'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate">{u.full_name || 'User'}</p>
                                                <p className="text-xs text-slate-500 truncate">{u.email}</p>
                                            </div>
                                            <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{u.role || 'STUDENT'}</div>
                                        </div>
                                    ))}
                                    {(!stats.recentUsers || stats.recentUsers.length === 0) && <p className="text-sm text-slate-400 italic">No recent activity</p>}
                                </div>
                                <button onClick={() => setActiveTab('USERS')} className="w-full mt-6 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition">View All Users</button>
                            </div>
                        </div>

                        {/* Recent Exams Bar Chart (Full Width) */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-6">Weekly Exam Activity</h3>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={examData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: '#f1f5f9' }} /><Bar dataKey="exams" fill="#7c3aed" radius={[4, 4, 0, 0]} barSize={40} /></BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'ANALYTICS' && (
                    <div className="space-y-8 animate-fade-in">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Analytics</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                <h3 className="font-bold text-slate-900 mb-6">User Growth</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={growthData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Line type="monotone" dataKey="users" stroke="#2563eb" strokeWidth={3} /></LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                <h3 className="font-bold text-slate-900 mb-6">Weekly Exams</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={examData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="exams" fill="#7c3aed" radius={[8, 8, 0, 0]} /></BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'USERS' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black text-slate-900">User Management</h2>
                            <SearchInput value={userSearch} onChange={setUserSearch} />
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold">
                                    <tr><th className="px-6 py-4">User</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Free Access</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {users.filter(u => u.full_name?.toLowerCase().includes(userSearch.toLowerCase())).map(user => (
                                        <tr key={user.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4"><div>{user.full_name}</div><div className="text-xs text-slate-500">{user.email}</div></td>
                                            <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold">{user.role}</span></td>
                                            <td className="px-6 py-4">
                                                <button onClick={() => handleToggleFreeAccess(user.id, !!user.has_free_access)} className={`px-3 py-1 text-xs font-bold rounded border ${user.has_free_access ? 'bg-green-100 text-green-700' : 'bg-slate-50 text-slate-500'}`}>
                                                    {user.has_free_access ? 'Active' : 'Grant'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'TUTORS' && (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-black text-slate-900">Tutor Performance</h2>
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold">
                                    <tr><th className="px-6 py-4">Tutor</th><th className="px-6 py-4">Plan</th><th className="px-6 py-4">Students</th><th className="px-6 py-4">Avg Readiness</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {tutors.map(tutor => (
                                        <tr key={tutor.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4"><div>{tutor.full_name}</div><div className="text-xs text-slate-500">{tutor.email}</div></td>
                                            <td className="px-6 py-4"><span className="text-purple-600 font-bold">{tutor.plan || 'Free'}</span></td>
                                            <td className="px-6 py-4 font-bold">{tutor.studentCount}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-green-500" style={{ width: `${tutor.avgReadiness}%` }}></div></div>
                                                    <span className="font-bold text-xs">{tutor.avgReadiness}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'QUESTIONS' && (
                    <div className="space-y-6">
                        <div className="flex flex-col gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-black text-slate-900">Question Bank</h2>
                                <div className="flex gap-3">
                                    <button onClick={handleDownloadTemplate} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition">
                                        <FileUp size={16} /> Template
                                    </button>
                                    <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition cursor-pointer shadow-lg shadow-blue-200">
                                        <Upload size={16} /> Bulk Upload
                                        <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                                    </label>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-50">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Filters:</p>
                                    <select value={examTypeFilter} onChange={(e) => setExamTypeFilter(e.target.value)} className="p-2 border border-slate-200 rounded-lg text-sm font-medium bg-slate-50 hover:bg-white transition">
                                        <option value="">All Exams</option>
                                        <option value="JAMB">JAMB</option>
                                        <option value="WAEC">WAEC</option>
                                    </select>
                                    <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="p-2 border border-slate-200 rounded-lg text-sm font-medium bg-slate-50 hover:bg-white transition">
                                        <option value="">All Subjects</option>
                                        <option value="Mathematics">Mathematics</option>
                                        <option value="English">English</option>
                                        <option value="Physics">Physics</option>
                                        <option value="Chemistry">Chemistry</option>
                                        <option value="Biology">Biology</option>
                                        <option value="Economics">Economics</option>
                                        <option value="Government">Government</option>
                                        <option value="Civic Education">Civic Education</option>
                                        <option value="Literature-in-English">Literature</option>
                                    </select>
                                </div>
                                <div className="ml-auto">
                                    <p className="text-sm font-bold text-slate-600">Total: <span className="text-blue-600 text-lg">{totalQuestions}</span></p>
                                </div>
                            </div>
                        </div>
                        {editingQuestion ? (
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                                <h3 className="font-bold mb-4">Edit Question</h3>
                                <form onSubmit={handleSaveQuestion} className="space-y-4">
                                    <textarea className="w-full p-3 border rounded-xl" value={editingQuestion.text} onChange={e => setEditingQuestion({ ...editingQuestion, text: e.target.value })} rows={3} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input className="p-3 border rounded-xl" value={editingQuestion.subject} onChange={e => setEditingQuestion({ ...editingQuestion, subject: e.target.value as any })} placeholder="Subject" />
                                        <input className="p-3 border rounded-xl" value={editingQuestion.topic} onChange={e => setEditingQuestion({ ...editingQuestion, topic: e.target.value })} placeholder="Topic" />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button type="button" onClick={() => setEditingQuestion(null)} className="px-4 py-2 text-slate-500">Cancel</button>
                                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save Changes</button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold">
                                        <tr><th className="px-6 py-3">Question</th><th className="px-6 py-3 text-right">Actions</th></tr>
                                    </thead>
                                    <tbody>
                                        {questions.map(q => (
                                            <tr key={q.id} className="border-t border-slate-100">
                                                <td className="px-6 py-4"><p className="line-clamp-2 font-medium">{q.text}</p></td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => setEditingQuestion(q)} className="p-2 text-blue-500 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                                                    <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 text-red-500 hover:bg-red-50 rounded ml-2"><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'TUTORIALS' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black text-slate-900">Video Tutorials</h2>
                            <button onClick={() => { setNewTutorial({ title: '', video_url: '', description: '', target_role: 'ALL' }); setEditingTutorial(null); setShowTutorialModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition"><Plus size={16} /> Add Video</button>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold">
                                    <tr><th className="px-6 py-4">Title</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {tutorials.map(tut => (
                                        <tr key={tut.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{tut.title}</div>
                                                <a href={tut.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1"><ExternalLink size={10} /> {tut.url}</a>
                                            </td>
                                            <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold">{tut.target_role || 'ALL'}</span></td>
                                            <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold ${tut.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{tut.is_active ? 'Active' : 'Inactive'}</span></td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                <button onClick={() => { setEditingTutorial(tut); setNewTutorial({ ...tut } as any); setShowTutorialModal(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                                                <button onClick={async () => { if (confirm('Delete?')) { await TutorialService.deleteTutorial(tut.id); loadTutorials(); } }} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {tutorials.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">No tutorials found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'SYLLABUS' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black">Syllabus Manager</h2>
                            <button onClick={() => { setNewSyllabusTopic({}); setShowSyllabusModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><Plus size={16} /> Add Topic</button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {syllabus.map(topic => (
                                <div key={topic.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}>
                                        <div>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{topic.subject}</span>
                                            <h3 className="font-bold text-slate-900">{topic.topic}</h3>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={(e) => { e.stopPropagation(); setNewSyllabusTopic(topic); setShowSyllabusModal(true); }} className="p-2 text-slate-400 hover:text-blue-600"><Edit size={16} /></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteSyllabus(topic.id); }} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                                            {expandedTopic === topic.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </div>
                                    {expandedTopic === topic.id && (
                                        <div className="mt-4 pt-4 border-t border-slate-100 pl-4 border-l-2 border-blue-500">
                                            <p className="font-bold text-sm text-slate-700 mb-2">{topic.sub_topic}</p>
                                            <ul className="list-disc pl-5 text-sm text-slate-500 space-y-1">
                                                {(topic.objectives || []).map((obj, i) => <li key={i}>{obj}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Syllabus Modal */}
            {showSyllabusModal && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-xl">{newSyllabusTopic.id ? 'Edit Topic' : 'New Topic'}</h3>
                            <button onClick={() => setShowSyllabusModal(false)}><X className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleSaveSyllabus} className="space-y-4">
                            <select className="w-full p-3 border rounded-xl" value={newSyllabusTopic.subject || ''} onChange={e => setNewSyllabusTopic({ ...newSyllabusTopic, subject: e.target.value as any })}>
                                <option value="">Select Subject</option>
                                <option value="Mathematics">Mathematics</option>
                                <option value="English">English</option>
                                <option value="Physics">Physics</option>
                                <option value="Chemistry">Chemistry</option>
                                <option value="Biology">Biology</option>
                            </select>
                            <input className="w-full p-3 border rounded-xl" placeholder="Main Topic" value={newSyllabusTopic.topic || ''} onChange={e => setNewSyllabusTopic({ ...newSyllabusTopic, topic: e.target.value })} />
                            <input className="w-full p-3 border rounded-xl" placeholder="Sub Topic" value={newSyllabusTopic.sub_topic || ''} onChange={e => setNewSyllabusTopic({ ...newSyllabusTopic, sub_topic: e.target.value })} />
                            <textarea className="w-full p-3 border rounded-xl" placeholder="Objectives (comma separated)" rows={3}
                                value={(newSyllabusTopic.objectives || []).join(', ')}
                                onChange={e => setNewSyllabusTopic({ ...newSyllabusTopic, objectives: e.target.value.split(',').map(s => s.trim()) })}
                            />
                            <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200">Save Topic</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Tutorial Modal */}
            {showTutorialModal && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-xl">{editingTutorial ? 'Edit Tutorial' : 'New Video'}</h3>
                            <button onClick={() => setShowTutorialModal(false)}><X className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleSaveTutorial} className="space-y-4">
                            <input className="w-full p-3 border rounded-xl" placeholder="Video Title" value={newTutorial.title} onChange={e => setNewTutorial({ ...newTutorial, title: e.target.value })} required />
                            <input className="w-full p-3 border rounded-xl" placeholder="YouTube URL" value={newTutorial.video_url} onChange={e => setNewTutorial({ ...newTutorial, video_url: e.target.value })} required />
                            <select className="w-full p-3 border rounded-xl" value={newTutorial.target_role} onChange={e => setNewTutorial({ ...newTutorial, target_role: e.target.value as any })}>
                                <option value="ALL">All Users</option>
                                <option value="STUDENT">Students Only</option>
                                <option value="TUTOR">Tutors Only</option>
                            </select>
                            <textarea className="w-full p-3 border rounded-xl" placeholder="Description" rows={3} value={newTutorial.description} onChange={e => setNewTutorial({ ...newTutorial, description: e.target.value })} />
                            <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200">Save Video</button>
                        </form>
                    </div>
                </div>
            )}
        </div>

    );
};

// Helpers
const SidebarItem = ({ icon, label, active, onClick }: any) => (
    <button onClick={onClick} className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl transition font-bold text-sm ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
        {icon}<span>{label}</span>
    </button>
);

const StatCard = ({ title, value, icon, color, loading }: any) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-4 rounded-2xl bg-${color}-50 text-${color}-600`}>{icon}</div>
            {loading && <Loader2 className="animate-spin text-slate-300" size={16} />}
        </div>
        <div className="text-3xl font-black text-slate-900 tracking-tight mb-1">{value}</div>
        <div className="text-slate-500 font-bold text-xs uppercase tracking-widest">{title}</div>
    </div>
);

const SearchInput = ({ value, onChange }: any) => (
    <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
);
