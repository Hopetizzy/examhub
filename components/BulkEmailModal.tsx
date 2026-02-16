import React, { useState } from 'react';
import { X, Send, Mail, Users, CheckSquare, Square } from 'lucide-react';
import { TutorStudent } from '../types';
import { toast } from 'sonner';
import { tutorService } from '../services/TutorService';

interface BulkEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    students: TutorStudent[];
    userEmail: string;
    tutorId: string;
}

export const BulkEmailModal: React.FC<BulkEmailModalProps> = ({ isOpen, onClose, students, userEmail, tutorId }) => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(students.map(s => s.id)));
    const [sending, setSending] = useState(false);

    if (!isOpen) return null;

    const toggleStudent = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleAll = () => {
        if (selectedIds.size === students.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(students.map(s => s.id)));
    };

    const handleSend = async () => {
        if (selectedIds.size === 0) {
            toast.error("Please select at least one student.");
            return;
        }
        if (!subject.trim() || !message.trim()) {
            toast.error("Please fill in both subject and message.");
            return;
        }

        setSending(true);
        try {
            // Dynamically import to avoid circular dependencies if any, though TutorService is safe
            // const { tutorService } = await import('../services/TutorService');
            await tutorService.sendBulkEmail(tutorId, Array.from(selectedIds), subject, message);

            toast.success(`Message sent to ${selectedIds.size} students successfully!`);
            onClose();
            setSubject('');
            setMessage('');
        } catch (error) {
            console.error("Failed to send bulk email", error);
            toast.error("Failed to send message. Please try again.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                            <Mail size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Bulk Email</h2>
                            <p className="text-xs text-slate-500 font-medium">Send announcements to your students</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Recipients Selector */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Recipients</label>
                            <button
                                onClick={toggleAll}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                                {selectedIds.size === students.length ? <CheckSquare size={14} /> : <Square size={14} />}
                                {selectedIds.size === students.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto p-2 border border-slate-100 rounded-lg bg-slate-50">
                            {students.map(student => (
                                <label
                                    key={student.id}
                                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs font-medium transition select-none
                    ${selectedIds.has(student.id) ? 'bg-blue-100 text-blue-800' : 'hover:bg-slate-200 text-slate-600'}
                  `}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(student.id)}
                                        onChange={() => toggleStudent(student.id)}
                                        className="hidden"
                                    />
                                    {selectedIds.has(student.id) ? <CheckSquare size={14} className="shrink-0" /> : <Square size={14} className="shrink-0" />}
                                    <span className="truncate">{student.name}</span>
                                </label>
                            ))}
                        </div>
                        <div className="text-xs text-slate-400 text-right">
                            {selectedIds.size} recipient(s) selected
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Subject Line</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                placeholder="e.g., Important: Upcoming Mock Exam"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 placeholder:font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Message Body</label>
                            <textarea
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder="Write your message here..."
                                rows={6}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800 placeholder:text-slate-400 resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={sending}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sending ? 'Sending...' : (
                            <>
                                <Send size={18} /> Send Message
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
