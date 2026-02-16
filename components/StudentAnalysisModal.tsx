import React, { useEffect, useState } from 'react';
import { TutorStudent, ExamHistoryItem, ExamResult } from '../types';
import { ExamService } from '../services/ExamService';
import { X, Loader2, Calendar, TrendingUp, AlertCircle, Clock, CheckCircle, ChevronRight, BarChart2 } from 'lucide-react';
import { ExamAnalysisPage } from './ExamAnalysisPage';

interface StudentAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: TutorStudent;
}

export const StudentAnalysisModal: React.FC<StudentAnalysisModalProps> = ({ isOpen, onClose, student }) => {
    const [history, setHistory] = useState<ExamHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
    const [fullResult, setFullResult] = useState<ExamResult | null>(null);
    const [loadingResult, setLoadingResult] = useState(false);

    useEffect(() => {
        if (isOpen && student) {
            loadHistory();
        } else {
            setHistory([]);
            setSelectedExamId(null);
            setFullResult(null);
        }
    }, [isOpen, student]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const data = await ExamService.getDashboardData(student.id);
            setHistory(data.recentActivity);
        } catch (error) {
            console.error("Failed to load student history", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewExam = async (examId: string) => {
        setSelectedExamId(examId);
        setLoadingResult(true);
        try {
            const result = await ExamService.getResultById(examId);
            setFullResult(result);
        } catch (error) {
            console.error("Failed to load full result", error);
        } finally {
            setLoadingResult(false);
        }
    };

    if (!isOpen) return null;

    // If a specific exam is selected, show detail view (reusing ExamAnalysisPage logic lightly or custom)
    if (selectedExamId && fullResult) {
        return (
            <div className="fixed inset-0 z-[150] bg-slate-50 overflow-y-auto animate-fade-in">
                {/* Close/Back Header */}
                <div className="p-4 bg-white border-b sticky top-0 z-40 flex justify-between items-center shadow-sm">
                    <button onClick={() => { setSelectedExamId(null); setFullResult(null); }} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition">
                        <ChevronRight className="rotate-180" size={20} /> Back to History
                    </button>
                    <span className="font-black text-slate-900">{student.name}'s Exam Report</span>
                </div>
                <div className="p-4 md:p-8">
                    <ExamAnalysisPage
                        result={fullResult}
                        onHome={() => { setSelectedExamId(null); setFullResult(null); }}
                        onRetake={() => { }} // Disabled for tutor view
                        onReview={() => { }} // Could implement review if answers stored
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner">
                            {student.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">{student.name}</h2>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                <TrendingUp size={12} /> Performance History
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-slate-100 rounded-full transition text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <Loader2 className="animate-spin text-blue-600" size={40} />
                            <p className="text-slate-400 font-bold text-sm">Loading academic records...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                                <Calendar size={32} />
                            </div>
                            <div>
                                <h3 className="text-slate-900 font-bold">No Exams Taken Yet</h3>
                                <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">This student hasn't completed any practice exams or assignments.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Exams</div>
                                    <div className="text-3xl font-black text-slate-900">{history.length}</div>
                                </div>
                                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg. Score</div>
                                    <div className="text-3xl font-black text-blue-600">
                                        {Math.round(history.reduce((a, b) => a + b.accuracy, 0) / history.length)}%
                                    </div>
                                </div>
                                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Weakest Topic</div>
                                    <div className="text-lg font-black text-red-500 truncate">
                                        {student.weakTopics[0] || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-4 pl-1">Detailed Log</h3>

                            <div className="space-y-3">
                                {history.map((exam) => (
                                    <div key={exam.id} onClick={() => handleViewExam(exam.id)} className="group bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition cursor-pointer flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${exam.accuracy >= 70 ? 'bg-green-100 text-green-700' :
                                                    exam.accuracy >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {Math.round(exam.accuracy)}%
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-slate-900">{exam.examType} {exam.mode}</h4>
                                                    <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase">{new Date(exam.date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-3">
                                                    <span className="flex items-center gap-1"><Clock size={12} /> {Math.ceil(exam.total * 1.5)}m</span>
                                                    <span className="flex items-center gap-1"><CheckCircle size={12} /> {exam.total} Questions</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-slate-300 group-hover:text-blue-500 transition">
                                            {loadingResult && selectedExamId === exam.id ? <Loader2 className="animate-spin" size={24} /> : <ChevronRight size={24} />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
