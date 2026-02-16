import React from 'react';
import { ExamResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle, AlertTriangle, RefreshCcw, Home, Clock, Target, TrendingUp } from 'lucide-react';

interface ResultViewProps {
  result: ExamResult;
  onHome: () => void;
  onRetake: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ result, onHome, onRetake }) => {
  const isPass = result.accuracy >= 50;
  const readiness = result.readinessContribution;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Readiness Summary Header */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
          <div className={`p-10 text-center ${isPass ? 'bg-slate-900' : 'bg-red-900'} text-white relative overflow-hidden`}>
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500 rounded-full translate-x-1/3 translate-y-1/3"></div>
            </div>

            <div className="relative z-10">
                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">
                    {result.examType} • {result.mode}
                </span>
                <h1 className="text-7xl font-black mb-2">{Math.round(result.accuracy)}%</h1>
                <p className="text-xl font-bold opacity-80 mb-8">
                    Exam Readiness Status: <span className="text-blue-400">{readiness.label}</span>
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                    {[
                        { label: 'Score', val: `${result.score}/${result.totalQuestions}`, icon: Target },
                        { label: 'Time', val: `${Math.floor(result.timeSpentSeconds / 60)}m`, icon: Clock },
                        { label: 'Speed', val: `${readiness.breakdown.speed}%`, icon: TrendingUp },
                        { label: 'Mastery', val: `${readiness.breakdown.mastery}%`, icon: CheckCircle },
                    ].map((s, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 p-3 rounded-2xl">
                            <div className="flex items-center justify-center gap-2 mb-1 opacity-60">
                                <s.icon size={12}/> <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                            </div>
                            <div className="text-lg font-black">{s.val}</div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
          
          <div className="p-10">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <TrendingUp size={20} />
                </div>
                <div>
                    <h3 className="font-black text-slate-900">Performance Recommendation</h3>
                    <p className="text-xs text-slate-400 uppercase font-bold">Generated for your current level</p>
                </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed font-medium">
                {result.recommendation}
            </div>
        </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={onHome} className="flex-1 py-5 bg-white text-slate-900 font-black rounded-2xl border-2 border-slate-100 hover:bg-slate-50 transition flex items-center justify-center gap-2 shadow-sm">
                <Home size={20} /> Back to Dashboard
            </button>
            <button onClick={onRetake} className="flex-1 py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition flex items-center justify-center gap-2">
                <RefreshCcw size={20} /> Practice Similar Questions
            </button>
        </div>

      </div>
    </div>
  );
};
