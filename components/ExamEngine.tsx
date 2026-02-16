import React, { useState, useEffect, useMemo } from 'react';
import { ExamSession } from '../types';
import { Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight, Menu, HelpCircle, Send, Calculator as CalcIcon, X, Delete } from 'lucide-react';
import { toast } from 'sonner';

interface ExamEngineProps {
  session: ExamSession;
  onSubmit: (answers: Record<string, string>) => void;
}



const Calculator: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handlePress = (val: string) => {
    if (val === 'C') {
      setDisplay('0');
      setEquation('');
    } else if (val === '=') {
      try {
        // Safe evaluation
        // eslint-disable-next-line no-new-func
        const safeEval = new Function('return ' + equation + display);
        // Ensure only numbers and operators are in the string before executing (extra safety)
        if (!/^[\d.+\-*/\s()]+$/.test(equation + display)) {
          setDisplay('Error');
          return;
        }
        const result = safeEval();
        setDisplay(String(result).slice(0, 10));
        setEquation('');
      } catch (e) {
        setDisplay('Error');
      }
    } else if (['+', '-', '*', '/'].includes(val)) {
      setEquation(display + ' ' + val + ' ');
      setDisplay('0');
    } else {
      setDisplay(display === '0' ? val : display + val);
    }
  };

  const buttons = [
    'C', '(', ')', '/',
    '7', '8', '9', '*',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    '0', '.', '=', ''
  ];

  return (
    <div className="absolute bottom-20 right-4 md:right-10 w-64 bg-slate-900 p-4 rounded-3xl shadow-2xl z-50 animate-slide-up border border-slate-700">
      <div className="flex justify-between items-center mb-4 text-slate-400">
        <span className="text-xs font-black uppercase tracking-widest">Calculator</span>
        <button onClick={onClose}><X size={16} /></button>
      </div>
      <div className="bg-slate-800 p-3 rounded-xl mb-4 text-right">
        <div className="text-xs text-slate-500 h-4">{equation}</div>
        <div className="text-2xl font-mono text-white tracking-widest">{display}</div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {buttons.map((btn, i) => btn === '' ? <div key={i} /> : (
          <button
            key={i}
            onClick={() => handlePress(btn)}
            className={`h-10 rounded-lg font-bold transition active:scale-95 ${['C', '='].includes(btn) ? 'bg-blue-600 text-white' : ['+', '-', '*', '/'].includes(btn) ? 'bg-slate-700 text-blue-400' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};

export const ExamEngine: React.FC<ExamEngineProps> = ({ session, onSubmit }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Timer State - robust implementation
  const isPractice = session.durationMinutes === 0;

  // Calculate initial time state based on actual start time to prevent drift/refresh resets
  const getInitialTime = () => {
    if (isPractice) {
      const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
      return elapsed;
    } else {
      const totalDurationSec = session.durationMinutes * 60;
      const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
      return Math.max(0, totalDurationSec - elapsed);
    }
  };

  const [timeState, setTimeState] = useState(getInitialTime());

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [checkedAnswers, setCheckedAnswers] = useState<Record<string, boolean>>({});

  const subjects = useMemo(() => Array.from(new Set(session.questions.map(q => q.subject))), [session]);

  const currentQuestion = session.questions[currentQuestionIndex];
  const activeSubject = currentQuestion.subject;

  useEffect(() => {
    // Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'n' || e.key === 'ArrowRight') handleNext();
      if (e.key === 'p' || e.key === 'ArrowLeft') handlePrev();
      if (['a', 'b', 'c', 'd'].includes(e.key.toLowerCase())) handleSelectOption(e.key.toLowerCase());
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestionIndex]);

  // Persistence: Load progress on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(`exam_progress_${session.id}`);
    if (savedProgress) {
      try {
        const { answers: savedAnswers, index: savedIndex } = JSON.parse(savedProgress);
        if (savedAnswers) setAnswers(savedAnswers);
        if (typeof savedIndex === 'number') setCurrentQuestionIndex(savedIndex);
      } catch (e) {
        console.error("Failed to restore progress", e);
      }
    }
  }, [session.id]);

  // Persistence: Save progress on change
  useEffect(() => {
    if (Object.keys(answers).length > 0 || currentQuestionIndex > 0) {
      localStorage.setItem(`exam_progress_${session.id}`, JSON.stringify({
        answers,
        index: currentQuestionIndex
      }));
    }
  }, [answers, currentQuestionIndex, session.id]);

  // Ref to track answers for timer submission without re-triggering effect
  const answersRef = React.useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    const timer = setInterval(() => {
      // Recalculate based on timestamps to avoid drift
      const now = Date.now();
      const elapsed = Math.floor((now - session.startTime) / 1000);

      if (isPractice) {
        setTimeState(elapsed);
      } else {
        const totalDurationSec = session.durationMinutes * 60;
        const remaining = totalDurationSec - elapsed;

        if (remaining <= 0) {
          setTimeState(0);
          clearInterval(timer);
          // Only auto-submit if not already submitted to avoid double submission loops
          if (!session.isSubmitted) {
            // Ensure we submit with latest answers from Ref
            onSubmit(answersRef.current);
          }
        } else {
          setTimeState(remaining);
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isPractice, session.startTime, session.durationMinutes, session.isSubmitted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const jumpToSubject = (subject: string) => {
    const idx = session.questions.findIndex(q => q.subject === subject);
    if (idx !== -1) setCurrentQuestionIndex(idx);
  };

  const handleSelectOption = (optionId: string) => {
    if (session.mode === 'PRACTICE' && checkedAnswers[currentQuestion.id]) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));
  };

  const handlePracticeCheck = () => {
    setCheckedAnswers(prev => ({ ...prev, [currentQuestion.id]: true }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < session.questions.length - 1) setCurrentQuestionIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1);
  };

  const handleSubmit = () => {
    toast.custom((t) => (
      <div className="bg-white p-6 rounded-2xl shadow-2xl border border-slate-100 w-full max-w-sm animate-scale-in">
        <div className="flex items-start gap-4 mb-4">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl shrink-0">
            <HelpCircle size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Finish Exam?</h3>
            <p className="text-slate-500 text-sm mt-1 leading-relaxed">
              Are you sure you want to submit? You have answered <strong className="text-slate-800">{Object.keys(answersRef.current).length}</strong> out of <strong className="text-slate-800">{session.questions.length}</strong> questions.
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => toast.dismiss(t)}
            className="px-4 py-2.5 text-slate-500 font-bold hover:bg-slate-50 hover:text-slate-700 rounded-xl text-xs uppercase tracking-wider transition"
          >
            Review
          </button>
          <button
            onClick={() => {
              toast.dismiss(t);
              localStorage.removeItem(`exam_progress_${session.id}`);
              onSubmit(answersRef.current);
            }}
            className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-slate-800 transition shadow-xl shadow-slate-200"
          >
            Submit Now
          </button>
        </div>
      </div>
    ), { duration: Infinity, position: 'top-center' });
  };

  const getOptionStyle = (optionId: string) => {
    const isSelected = answers[currentQuestion.id] === optionId;
    if (session.mode === 'PRACTICE' && checkedAnswers[currentQuestion.id]) {
      const isCorrect = optionId === currentQuestion.correctOptionId;
      if (isCorrect) return 'ring-2 ring-green-500 bg-green-50 border-green-200 text-green-900 shadow-sm';
      if (isSelected && !isCorrect) return 'ring-2 ring-red-500 bg-red-50 border-red-200 text-red-900 shadow-sm';
      return 'opacity-50 border-slate-200 text-slate-400 grayscale-[0.5]';
    }
    if (isSelected) return 'ring-2 ring-blue-600 bg-blue-600 text-white border-blue-600 shadow-lg scale-[1.02]';
    return 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300';
  };

  const progressPercentage = ((currentQuestionIndex + 1) / session.questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans selection:bg-blue-100 relative overflow-hidden">

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 bg-white w-72 shadow-2xl z-50 transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1)
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:w-80 md:shadow-none border-r border-slate-200 flex flex-col
      `}>
        <div className="p-6 flex-1 flex flex-col min-h-0">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <CheckCircle size={18} />
              </div>
              <h2 className="font-bold text-slate-800 tracking-tight">Exam Navigator</h2>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
              <ChevronLeft size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3 font-mono text-2xl font-black text-slate-800 mb-8 bg-slate-50 p-5 rounded-2xl justify-center shadow-inner border border-slate-100">
            <Clock className={!isPractice && timeState < 60 ? 'text-red-500 animate-pulse' : 'text-blue-500'} size={24} />
            <span className={!isPractice && timeState < 60 ? 'text-red-500' : ''}>{formatTime(timeState)}</span>
          </div>

          {/* Subject Filter Logic could go here, but let's keep simple grid */}

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Question Palette</h3>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {Object.keys(answers).length} / {session.questions.length}
              </span>
            </div>

            {subjects.map(subj => (
              <div key={subj} className="mb-6">
                <h4 className="text-[10px] font-black text-slate-500 uppercase mb-2 sticky top-0 bg-white py-1">{subj}</h4>
                <div className="grid grid-cols-4 gap-2.5">
                  {session.questions.map((q, idx) => {
                    if (q.subject !== subj) return null;
                    const isAnswered = !!answers[q.id];
                    const isCurrent = idx === currentQuestionIndex;

                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          setCurrentQuestionIndex(idx);
                          setSidebarOpen(false);
                        }}
                        className={`
                                  h-11 w-full rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center relative group
                                  ${isCurrent ? 'ring-2 ring-offset-2 ring-blue-600 bg-blue-600 text-white shadow-md z-10' : ''}
                                  ${!isCurrent && isAnswered ? 'bg-blue-50 text-blue-600 border border-blue-100' : ''}
                                  ${!isCurrent && !isAnswered ? 'bg-white border border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50' : ''}
                                `}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <button
              onClick={handleSubmit}
              className="w-full bg-slate-900 text-white hover:bg-slate-800 py-4 rounded-2xl font-black transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 group"
            >
              <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Finish Exam
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Floating Calculator */}
        {showCalculator && <Calculator onClose={() => setShowCalculator(false)} />}

        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition">
              <Menu size={22} />
            </button>
            <div className="hidden lg:flex items-center gap-2">
              {subjects.map(s => (
                <button
                  key={s}
                  onClick={() => jumpToSubject(s)}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeSubject === s ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="lg:hidden">
              <h1 className="font-black text-slate-900 text-sm uppercase tracking-tight truncate max-w-[150px]">{activeSubject}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className={`p-2 rounded-xl transition-all ${showCalculator ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              title="Calculator"
            >
              <CalcIcon size={20} />
            </button>
            <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Question</div>
              <div className="text-sm font-black text-slate-800 leading-none">{currentQuestionIndex + 1} of {session.questions.length}</div>
            </div>
          </div>
        </header>

        {/* Question Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:p-12 custom-scrollbar bg-slate-50/50">
          <div className="max-w-4xl mx-auto">
            <div className="w-full bg-slate-200 h-1.5 rounded-full mb-8 md:mb-12 overflow-hidden hidden md:block">
              <div className="bg-blue-600 h-full rounded-full transition-all duration-700" style={{ width: `${progressPercentage}%` }}></div>
            </div>

            <div key={currentQuestionIndex} className="animate-fade-in-up">
              <div className="mb-6 md:mb-10 flex items-center gap-3">
                <span className="inline-block px-3 py-1 bg-white border border-slate-200 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                  {currentQuestion.subject}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                <span className="text-xs font-bold text-slate-400 truncate max-w-[200px]">Topic: {currentQuestion.topic}</span>
              </div>

              <h2 className="text-xl md:text-3xl font-bold text-slate-900 mb-8 md:mb-10 leading-snug">
                {currentQuestion.text}
              </h2>

              <div className="grid gap-3 md:gap-4 mb-10">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    className={`
                                  w-full p-4 md:p-5 text-left border rounded-2xl transition-all duration-300 flex items-center justify-between group 
                                  active:scale-[0.98] ${getOptionStyle(option.id)}
                                `}
                  >
                    <span className="font-bold flex items-center gap-3 md:gap-4">
                      <span className={`
                                        w-8 h-8 rounded-xl border flex items-center justify-center text-xs font-black transition-all duration-300 shrink-0
                                        ${answers[currentQuestion.id] === option.id ? 'bg-white/20 border-white/40 text-white' : 'bg-slate-50 border-slate-200 text-slate-400 group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-600'}
                                    `}>
                        {option.id.toUpperCase()}
                      </span>
                      <span className="text-base md:text-lg">{option.text}</span>
                    </span>

                    {session.mode === 'PRACTICE' && checkedAnswers[currentQuestion.id] && (
                      <div className="animate-scale-in shrink-0 ml-2">
                        {option.id === currentQuestion.correctOptionId ? (
                          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-200"><CheckCircle size={20} /></div>
                        ) : answers[currentQuestion.id] === option.id ? (
                          <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-200"><XCircle size={20} /></div>
                        ) : null}
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {session.mode === 'PRACTICE' && (
                <div className="mb-12 min-h-[120px]">
                  {!checkedAnswers[currentQuestion.id] ? (
                    <button
                      onClick={handlePracticeCheck}
                      disabled={!answers[currentQuestion.id]}
                      className="bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed text-white px-10 py-4 rounded-2xl font-black text-sm tracking-wide transition-all shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 w-full md:w-auto"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <div className="animate-slide-down bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl shadow-slate-100 relative overflow-hidden">
                      <div className="bg-slate-50 p-6 rounded-2xl text-slate-700 leading-relaxed font-medium text-lg italic border border-slate-100">
                        {currentQuestion.explanation}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 p-4 md:px-12 md:py-6 relative z-30">
          <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
            <button
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-6 py-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 font-black rounded-xl disabled:opacity-10 transition-all text-xs uppercase tracking-widest"
            >
              <ChevronLeft size={18} /> <span className="hidden md:inline">Previous</span>
            </button>

            <div className="flex gap-4 w-full md:w-auto justify-end">
              {currentQuestionIndex === session.questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 md:px-10 py-3 md:py-4 rounded-2xl font-black shadow-xl shadow-red-200 transition transform hover:scale-105 active:scale-95 uppercase tracking-widest text-xs md:text-sm grow md:grow-0"
                >
                  Submit
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8 md:px-10 py-3 md:py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition transform hover:scale-105 active:scale-95 uppercase tracking-widest text-xs md:text-sm grow md:grow-0"
                >
                  Next <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};