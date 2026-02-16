import React, { useState } from 'react';
import { ExamSession, Question, Subject } from '../types';
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, Menu, HelpCircle, ArrowLeft } from 'lucide-react';

interface ExamReviewProps {
    session: ExamSession; // We need the full session (questions + answers)
    onBack: () => void;
}

export const ExamReview: React.FC<ExamReviewProps> = ({ session, onBack }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showSidebar, setShowSidebar] = useState(false);

    const currentQuestion = session.questions[currentIndex];
    // Calculate grouped questions for sidebar navigation (same as Engine)
    const groupedQuestions: Record<Subject, Question[]> = {} as any;
    // Initialize keys to preserve order if possible or just rely on loop
    session.questions.forEach(q => {
        if (!groupedQuestions[q.subject]) groupedQuestions[q.subject] = [];
        groupedQuestions[q.subject].push(q);
    });
    const subjects = Object.keys(groupedQuestions) as Subject[];

    const handleNext = () => {
        if (currentIndex < session.questions.length - 1) setCurrentIndex(prev => prev + 1);
    };

    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
    };

    // Helper to jump to specific question index
    const jumpToQuestion = (index: number) => {
        setCurrentIndex(index);
        setShowSidebar(false);
    };

    // Determine styling for options
    const getOptionStyle = (optionId: string) => {
        const isSelected = session.answers[currentQuestion.id] === optionId;
        const isCorrect = currentQuestion.correctOptionId === optionId;

        if (isCorrect) {
            return "bg-green-100 border-green-500 text-green-900 ring-1 ring-green-500";
        }
        if (isSelected && !isCorrect) {
            return "bg-red-100 border-red-500 text-red-900 ring-1 ring-red-500";
        }
        return "bg-white border-slate-200 text-slate-700 opacity-60"; // Dim others
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">

            {/* Sidebar for Navigation */}
            <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${showSidebar ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col`}>
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="font-black text-slate-800 uppercase tracking-widest text-sm">Review Mode</h2>
                        <p className="text-xs text-slate-500 font-medium mt-1">Reviewing {session.questions.length} Questions</p>
                    </div>
                    <button onClick={() => setShowSidebar(false)} className="md:hidden text-slate-400 hover:text-slate-600"><XCircle /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {subjects.map(subject => (
                        <div key={subject} className="mb-6">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">{subject}</h3>
                            <div className="grid grid-cols-5 gap-2">
                                {groupedQuestions[subject].map((q) => {
                                    // Find global index
                                    const globalIndex = session.questions.findIndex(glQ => glQ.id === q.id);
                                    const isAnswered = !!session.answers[q.id];
                                    const isCorrect = session.answers[q.id] === q.correctOptionId;
                                    const isCurrent = globalIndex === currentIndex;

                                    let bgClass = "bg-slate-100 text-slate-900 border-transparent";
                                    if (isAnswered) bgClass = isCorrect ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200";
                                    if (isCurrent) bgClass = "bg-slate-800 text-white ring-2 ring-slate-400 ring-offset-2";

                                    return (
                                        <button
                                            key={q.id}
                                            onClick={() => jumpToQuestion(globalIndex)}
                                            className={`h-9 w-9 rounded-lg text-xs font-bold flex items-center justify-center border transition-all ${bgClass}`}
                                        >
                                            {groupedQuestions[subject].indexOf(q) + 1}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50">
                    <button onClick={onBack} className="w-full flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-sm py-3 transition hover:bg-slate-200 rounded-xl">
                        <ArrowLeft size={16} /> Exit Review
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full relative">
                {/* Top Bar */}
                <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 shadow-sm z-20">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setShowSidebar(true)} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><Menu /></button>
                        <div>
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Subject</span>
                            <span className="text-sm font-bold text-slate-800">{currentQuestion.subject}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-6">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
                            {session.answers[currentQuestion.id] === currentQuestion.correctOptionId ? (
                                <>
                                    <CheckCircle size={16} className="text-green-500" />
                                    <span className="text-xs font-bold text-green-700 uppercase tracking-widest">Correct</span>
                                </>
                            ) : (
                                <>
                                    <XCircle size={16} className="text-red-500" />
                                    <span className="text-xs font-bold text-red-700 uppercase tracking-widest">Incorrect</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Question Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-slate-50">
                    <div className="max-w-3xl mx-auto pb-20">

                        {/* Question Card */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-10 mb-6">
                            <div className="flex justify-between items-start mb-6">
                                <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-xs font-black tracking-widest uppercase">Question {currentIndex + 1}</span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{currentQuestion.topic}</span>
                            </div>
                            <p className="text-lg md:text-xl font-medium text-slate-800 leading-relaxed mb-8">
                                {currentQuestion.text}
                            </p>

                            <div className="space-y-3">
                                {currentQuestion.options.map((opt) => (
                                    <div
                                        key={opt.id}
                                        className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${getOptionStyle(opt.id)}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 shrink-0 bg-white/50 border-current`}>
                                            {opt.id.toUpperCase()}
                                        </div>
                                        <span className="font-medium">{opt.text}</span>

                                        {/* Icons for clear feedback */}
                                        {opt.id === currentQuestion.correctOptionId && <CheckCircle className="ml-auto text-green-600" size={20} />}
                                        {session.answers[currentQuestion.id] === opt.id && opt.id !== currentQuestion.correctOptionId && <XCircle className="ml-auto text-red-500" size={20} />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Explanation Card */}
                        {currentQuestion.explanation && (
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 md:p-8 animate-fade-in-up">
                                <div className="flex items-center gap-2 mb-3">
                                    <HelpCircle className="text-blue-600" size={20} />
                                    <h4 className="font-black text-blue-900 uppercase tracking-widest text-sm">Explanation</h4>
                                </div>
                                <p className="text-blue-900/80 leading-relaxed font-medium">
                                    {currentQuestion.explanation}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Navigation */}
                <div className="h-20 bg-white border-t border-slate-200 flex items-center justify-between px-6 md:px-12 shrink-0 z-30">
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition"
                    >
                        <ChevronLeft size={20} /> Previous
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={currentIndex === session.questions.length - 1}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-lg shadow-slate-200 disabled:opacity-50 disabled:shadow-none transition"
                    >
                        Next <ChevronRight size={20} />
                    </button>
                </div>

            </div>
        </div>
    );
};
