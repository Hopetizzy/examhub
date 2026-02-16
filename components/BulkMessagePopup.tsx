import React from 'react';
import { Mail, X, CheckCircle } from 'lucide-react';
import { Notification } from '../types';

interface BulkMessagePopupProps {
    notification: Notification | null;
    onAcknowledge: () => void;
}

export const BulkMessagePopup: React.FC<BulkMessagePopupProps> = ({ notification, onAcknowledge }) => {
    if (!notification) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl transform transition-all scale-100 flex flex-col">
                <div className="p-6 bg-blue-600 text-white flex justify-between items-start">
                    <div className="flex gap-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <Mail size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black">New Announcement</h3>
                            <p className="text-blue-100 text-sm font-medium">Message from your Tutor</p>
                        </div>
                    </div>
                    <button
                        onClick={onAcknowledge}
                        className="p-2 hover:bg-white/20 rounded-full transition"
                    >
                        <X size={20} className="text-white" />
                    </button>
                </div>

                <div className="p-8">
                    <h4 className="text-lg font-bold text-slate-900 mb-3">{notification.title}</h4>
                    <div className="prose prose-slate prose-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {notification.message}
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={onAcknowledge}
                            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition flex items-center gap-2"
                        >
                            <CheckCircle size={18} />
                            Acknowledge & Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
