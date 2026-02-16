import React from 'react';
import { TrendingUp, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { TutorStudent } from '../types';

interface PerformanceForecastWidgetProps {
    students: TutorStudent[];
}

export const PerformanceForecastWidget: React.FC<PerformanceForecastWidgetProps> = ({ students }) => {
    // Mock AI Logic: Calculate probabilities based on readiness score
    const analysis = {
        highProbability: students.filter(s => s.readinessScore >= 75).length,
        borderline: students.filter(s => s.readinessScore >= 50 && s.readinessScore < 75).length,
        atRisk: students.filter(s => s.readinessScore < 50).length,
        predictedPassRate: students.length > 0
            ? Math.round((students.filter(s => s.readinessScore >= 60).length / students.length) * 100)
            : 0
    };

    return (
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
            {/* Background Decor - Made subtler */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/10 rounded-full blur-[60px] -ml-16 -mb-16"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30 shadow-inner">
                        <TrendingUp size={24} className="text-indigo-300" />
                    </div>
                    <div>
                        <h3 className="font-black text-xl tracking-tight text-white">Performance Forecast</h3>
                        <p className="text-slate-300 text-sm font-medium">AI-driven pass probability analysis</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8 items-center">
                    <div>
                        <div className="text-5xl font-black tracking-tighter text-white drop-shadow-xl">
                            {analysis.predictedPassRate}<span className="text-3xl text-indigo-300">%</span>
                        </div>
                        <div className="text-xs font-black text-indigo-200 uppercase tracking-widest mt-2">
                            Projected Pass Rate
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-emerald-300 font-bold">
                                <CheckCircle size={16} className="text-emerald-400" /> Likely to Pass
                            </span>
                            <span className="font-black text-white text-lg">{analysis.highProbability}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-amber-300 font-bold">
                                <AlertCircle size={16} className="text-amber-400" /> Borderline
                            </span>
                            <span className="font-black text-white text-lg">{analysis.borderline}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-red-300 font-bold">
                                <AlertCircle size={16} className="text-red-400" /> At Risk
                            </span>
                            <span className="font-black text-white text-lg">{analysis.atRisk}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 backdrop-blur-md">
                    <div className="flex items-start gap-4">
                        <div className="shrink-0 p-2 bg-amber-500/10 rounded-full text-amber-300 mt-0.5">
                            <Users size={18} />
                        </div>
                        <p className="text-sm text-slate-100 leading-relaxed font-medium">
                            <span className="text-white font-bold block mb-1">AI Insight</span>
                            {analysis.atRisk > 0
                                ? `${analysis.atRisk} students are showing early signs of struggle. Consider scheduling a remedial session for topics: Algebra, Mechanics.`
                                : "Your class is tracking well! Consider increasing difficulty for top performers to maintain engagement."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
