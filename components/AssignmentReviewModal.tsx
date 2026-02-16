import React from 'react';
import { ExamResult, Question } from '../types';
import { CheckCircle, XCircle, Clock, Target, AlertTriangle } from 'lucide-react';

interface AssignmentReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    result: ExamResult;
}

export const AssignmentReviewModal: React.FC<AssignmentReviewModalProps> = ({ isOpen, onClose, result }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Assignment Analysis</h2>
                        <p className="text-slate-500 text-sm font-medium">Detailed breakdown of performance</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition text-slate-400 hover:text-slate-600"
                    >
                        <XCircle size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Top Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                            <div className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-1">Score</div>
                            <div className="text-3xl font-black text-blue-900">{result.score}%</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                            <div className="text-green-600 text-xs font-bold uppercase tracking-widest mb-1">Accuracy</div>
                            <div className="text-3xl font-black text-green-900">{result.accuracy}%</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                            <div className="text-purple-600 text-xs font-bold uppercase tracking-widest mb-1">Time Spent</div>
                            <div className="text-3xl font-black text-purple-900">{Math.round(result.timeSpentSeconds / 60)}m</div>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                            <div className="text-amber-600 text-xs font-bold uppercase tracking-widest mb-1">Questions</div>
                            <div className="text-3xl font-black text-amber-900">{result.totalQuestions}</div>
                        </div>
                    </div>

                    {/* Weak Areas */}
                    {(result.weakAreas || []).length > 0 && (
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
                            <h3 className="flex items-center gap-2 font-bold text-red-900 mb-3">
                                <AlertTriangle size={20} />
                                Areas for Improvement
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {(result.weakAreas || []).map(area => (
                                    <span key={area} className="px-3 py-1 bg-white text-red-700 text-xs font-bold rounded-lg border border-red-100 shadow-sm">
                                        {area}
                                    </span>
                                ))}
                            </div>
                            <p className="mt-4 text-sm text-red-800 italic">
                                "{result.recommendation || 'Focus on practicing these weak areas.'}"
                            </p>
                        </div>
                    )}

                    {/* Topic Breakdown */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Target size={20} className="text-blue-600" />
                            Topic Performance
                        </h3>
                        {(!result.topicBreakdown || result.topicBreakdown.length === 0) ? (
                            <p className="text-slate-500 italic text-sm">No detailed topic breakdown available for this assignment.</p>
                        ) : (
                            <div className="space-y-3">
                                {result.topicBreakdown.map(topic => (
                                    <div key={topic.topic} className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-bold text-slate-700">{topic.topic}</span>
                                                <span className="font-medium text-slate-500">{topic.correct}/{topic.total} Correct</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${(topic.correct / (topic.total || 1)) > 0.7 ? 'bg-green-500' :
                                                        (topic.correct / (topic.total || 1)) > 0.4 ? 'bg-amber-400' : 'bg-red-500'
                                                        }`}
                                                    style={{ width: `${(topic.correct / (topic.total || 1)) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="font-black text-sm w-12 text-right">
                                            {Math.round((topic.correct / (topic.total || 1)) * 100)}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};
