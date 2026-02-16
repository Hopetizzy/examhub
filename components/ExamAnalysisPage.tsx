import React, { useEffect, useState } from 'react';
import { ExamResult } from '../types';
import { GeminiService } from '../services/GeminiService';
import { CheckCircle, XCircle, ChevronLeft, Award, TrendingUp, AlertCircle, BarChart2, Star, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface ExamAnalysisPageProps {
    result: ExamResult;
    onHome: () => void;
    onRetake: () => void;
    onReview?: () => void;
}

export const ExamAnalysisPage: React.FC<ExamAnalysisPageProps> = ({ result, onHome, onRetake, onReview }) => {
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [loadingAI, setLoadingAI] = useState(true);

    useEffect(() => {
        const fetchAI = async () => {
            try {
                const analysis = await GeminiService.generatePerformanceAnalysis(result);
                setAiAnalysis(analysis);
            } catch (e) {
                console.error("Failed to generate AI analysis", e);
                setAiAnalysis("Analysis unavailable due to network error.");
            } finally {
                setLoadingAI(false);
            }
        };
        fetchAI();
    }, [result]);

    const scoreColor = result.accuracy >= 70 ? 'text-green-600' : result.accuracy >= 50 ? 'text-orange-500' : 'text-red-500';
    const scoreBg = result.accuracy >= 70 ? 'bg-green-100' : result.accuracy >= 50 ? 'bg-orange-100' : 'bg-red-100';
    const scoreRing = result.accuracy >= 70 ? 'ring-green-500' : result.accuracy >= 50 ? 'ring-orange-500' : 'ring-red-500';

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-6 md:p-12">
            <div className="max-w-4xl mx-auto animate-fade-in-up">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button onClick={onHome} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition">
                        <ChevronLeft size={20} /> Dashboard
                    </button>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Exam Report ID: #{result.id.slice(-6)}</span>
                </div>

                {/* Hero Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200 overflow-hidden mb-8 border border-slate-100">
                    <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">

                        {/* Score Circle */}
                        <div className="relative shrink-0">
                            <div className={`w-48 h-48 rounded-full flex flex-col items-center justify-center border-8 ${scoreBg} ${scoreColor} ${scoreRing} ring-opacity-20 shadow-inner`}>
                                <span className="text-5xl font-black tracking-tighter">{Math.round(result.accuracy)}%</span>
                                <span className="text-sm font-bold uppercase tracking-widest mt-1 opacity-80">Accuracy</span>
                            </div>
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                                {result.accuracy >= 70 ? 'Excellent' : result.accuracy >= 50 ? 'Average' : 'Needs Work'}
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="flex-1 w-full">
                            <h1 className="text-3xl font-black text-slate-900 mb-2">Performance Summary</h1>
                            <p className="text-slate-600 mb-8 font-medium">You completed the <span className="text-blue-600 font-bold">{result.examType} {result.mode}</span> exam.</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                                        <CheckCircle size={16} /> <span className="text-[10px] uppercase font-black tracking-widest">Questions</span>
                                    </div>
                                    <div className="text-xl font-black text-slate-800">{result.totalQuestions} <span className="text-xs font-medium text-slate-400">Total</span></div>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                                        <Clock size={16} /> <span className="text-[10px] uppercase font-black tracking-widest">Time Spent</span>
                                    </div>
                                    <div className="text-xl font-black text-slate-800">{Math.floor(result.timeSpentSeconds / 60)} <span className="text-xs font-medium text-slate-400">min</span></div>
                                </div>
                                {/* Add more stats if needed */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Analysis Section */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="md:col-span-2 bg-blue-50/50 rounded-3xl p-8 border border-blue-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-blue-100 opacity-20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                    <Sparkles size={20} />
                                </div>
                                <h3 className="font-black uppercase tracking-widest text-sm text-blue-900">AI Tutor Insights</h3>
                            </div>
                            <div className="text-lg leading-relaxed font-medium text-slate-800">
                                {loadingAI ? (
                                    <div className="animate-pulse space-y-3 opacity-60">
                                        <div className="h-4 bg-slate-300 rounded w-3/4"></div>
                                        <div className="h-4 bg-slate-300 rounded w-full"></div>
                                        <div className="h-4 bg-slate-300 rounded w-5/6"></div>
                                    </div>
                                ) : (
                                    <p className="markdown-prose">{aiAnalysis}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col">
                        <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-green-500" /> Next Steps</h3>
                        <ul className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                            <li className="text-sm text-slate-700 flex gap-3">
                                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">1</span>
                                Review your {result.weakAreas.length > 0 ? 'weak topics' : 'mistakes'} below.
                            </li>
                            <li className="text-sm text-slate-700 flex gap-3">
                                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">2</span>
                                Take a practice quiz on {result.weakAreas[0] || "General Revision"}.
                            </li>
                        </ul>
                        <button onClick={onHome} className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition shadow-lg shadow-slate-200">
                            Return Home
                        </button>

                        {onReview && (
                            <button onClick={onReview} className="mt-2 w-full bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-600 font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition">
                                Review Answers
                            </button>
                        )}
                    </div>
                </div>

                {/* Topic Breakdown */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                    <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2"><BarChart2 size={20} className="text-slate-400" /> Topic Breakdown</h3>
                    <div className="space-y-6">
                        {result.topicBreakdown.map((topic, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between mb-2">
                                    <span className="font-bold text-slate-700 text-sm">{topic.topic}</span>
                                    <span className="font-bold text-slate-900 text-sm">{topic.correct}/{topic.total}</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${(topic.correct / topic.total) >= 0.7 ? 'bg-green-500' : (topic.correct / topic.total) >= 0.4 ? 'bg-orange-400' : 'bg-red-500'
                                            }`}
                                        style={{ width: `${(topic.correct / topic.total) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                        {result.topicBreakdown.length === 0 && <p className="text-slate-400 italic">No detailed topic data available.</p>}
                    </div>
                </div>

            </div>
        </div>
    );
};

// Helper components for icons to restart functionality if imports fail
// We assume Lucide imports work as they are standard in this project.
// If Sparkles/Clock are missing from imports in this file, we add them:
import { Sparkles, Clock } from 'lucide-react';
