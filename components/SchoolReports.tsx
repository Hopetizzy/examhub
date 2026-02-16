import React, { useState } from 'react';
import { FileText, Download, Printer, Search, Building2 } from 'lucide-react';
import { TutorStudent, SchoolBranding } from '../types';

interface SchoolReportsProps {
    students: TutorStudent[];
    branding: SchoolBranding;
}

export const SchoolReports: React.FC<SchoolReportsProps> = ({ students, branding }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<TutorStudent | null>(null);

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between no-print">
                <div>
                    <h2 className="text-2xl font-black text-slate-900">Academic Reports</h2>
                    <p className="text-slate-500 font-medium">Generate and print branded performance reports.</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex gap-8 items-start">

                {/* Sidebar: Student List (Hidden when printing) */}
                <div className="w-1/3 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px] no-print">
                    <div className="p-4 border-b border-slate-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-slate-300" size={16} />
                            <input
                                type="text"
                                placeholder="Find student..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {filteredStudents.map(student => (
                            <button
                                key={student.id}
                                onClick={() => setSelectedStudent(student)}
                                className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition ${selectedStudent?.id === student.id ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' : 'hover:bg-slate-50 text-slate-600'}`}
                            >
                                <div>
                                    <div className="font-bold text-sm">{student.name}</div>
                                    <div className="text-[10px] opacity-70 font-medium tracking-wide">{student.email}</div>
                                </div>
                                {student.readinessScore >= 70 ? (
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">A</span>
                                ) : (
                                    <span className="text-[10px] font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded">B</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Report Preview Area */}
                <div className="flex-1 bg-slate-500/10 rounded-3xl p-8 flex justify-center items-start min-h-[600px] overflow-y-auto no-print-bg">
                    {selectedStudent ? (
                        <div id="school-report-container" className="bg-white width-[210mm] min-h-[297mm] p-12 shadow-2xl relative print-sheet animate-fade-in text-slate-900">
                            {/* Branded Header */}
                            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-6 mb-8">
                                <div className="flex items-center gap-4">
                                    {branding.logoUrl ? (
                                        <img src={branding.logoUrl} alt="Logo" className="h-16 w-auto object-contain" />
                                    ) : (
                                        <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                            <Building2 size={32} />
                                        </div>
                                    )}
                                    <div>
                                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">{branding.schoolName || "School Name"}</h1>
                                        <p className="text-sm font-bold text-slate-500 tracking-widest uppercase mt-1">Official Academic Report</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Date</div>
                                    <div className="font-bold">{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                </div>
                            </div>

                            {/* Student Details */}
                            <div className="bg-slate-50 rounded-xl p-6 mb-8 flex justify-between items-center border border-slate-100 print-bg-slate-50">
                                <div>
                                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Student Name</div>
                                    <div className="text-xl font-black">{selectedStudent.name}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Student ID</div>
                                    <div className="font-mono font-bold text-slate-600">STD-{selectedStudent.id.substring(0, 6).toUpperCase()}</div>
                                </div>
                            </div>

                            {/* Performance Summary */}
                            <div className="mb-8">
                                <h3 className="text-lg font-black uppercase tracking-tight border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                                    <FileText size={20} /> Performance Summary
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 rounded-xl border border-slate-200 text-center">
                                        <div className="text-3xl font-black text-indigo-600">{selectedStudent.readinessScore}%</div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Readiness Score</div>
                                    </div>
                                    <div className="p-4 rounded-xl border border-slate-200 text-center">
                                        <div className="text-3xl font-black text-slate-900">{selectedStudent.totalExams}</div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Exams Taken</div>
                                    </div>
                                    <div className="p-4 rounded-xl border border-slate-200 text-center">
                                        <div className="text-3xl font-black text-green-600">A</div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Projected Grade</div>
                                    </div>
                                </div>
                            </div>

                            {/* Weak Areas */}
                            <div className="mb-12">
                                <h3 className="text-lg font-black uppercase tracking-tight border-b border-slate-200 pb-2 mb-4">Areas for Improvement</h3>
                                {selectedStudent.weakTopics.length > 0 ? (
                                    <ul className="grid grid-cols-2 gap-3">
                                        {selectedStudent.weakTopics.map((topic, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                                {topic}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-slate-500 italic">No significant weak areas detected. Outstanding performance.</p>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="absolute bottom-12 left-12 right-12 border-t border-slate-200 pt-6 flex justify-between items-end">
                                <div>
                                    <div className="h-10 w-40 border-b border-slate-900 mb-2"></div>
                                    <div className="text-xs font-bold text-slate-900 uppercase">Principal's Signature</div>
                                </div>
                                <div className="text-[10px] font-mono text-slate-400">
                                    Generated by Tutor Command • {new Date().toISOString()}
                                </div>
                            </div>

                            {/* Floating Print Button */}
                            <button
                                onClick={handlePrint}
                                className="absolute -top-4 -right-4 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition no-print z-50"
                                title="Print Report"
                            >
                                <Printer size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <FileText size={48} className="mb-4 opacity-50" />
                            <p className="font-bold">Select a student to view report</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @media print {
                    body {
                        visibility: hidden;
                        background: white;
                    }
                    /* Hide all dashboard elements by default when printing */
                    nav, .dashboard-layout, button {
                        display: none !important;
                    }
                    
                    /* Only show the report container */
                    #school-report-container {
                        visibility: visible;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        margin: 0;
                        padding: 0;
                        display: block !important;
                        background: white;
                        z-index: 9999;
                    }
                    #school-report-container * {
                        visibility: visible;
                    }
                    
                    .no-print { display: none !important; }
                    .print-bg-slate-50 { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `}</style>
        </div>
    );
};
