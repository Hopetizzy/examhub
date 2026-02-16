import React, { useState } from 'react';
import { Shield, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AuthService } from '../services/AuthService';

interface AdminAccessPageProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export const AdminAccessPage: React.FC<AdminAccessPageProps> = ({ onSuccess, onCancel }) => {
    const [key, setKey] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate verification delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Hardcoded secret key for prototype (Should be env var in production)
        const SECRET_KEY = import.meta.env.VITE_ADMIN_SECRET_KEY || 'master-admin-2025';

        if (key === SECRET_KEY) {
            toast.success("Access Granted");
            onSuccess();
        } else {
            toast.error("Invalid Access Key");
            setKey('');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 w-full max-w-md p-8 rounded-3xl shadow-2xl border border-slate-700 animate-fade-in">
                <div className="flex flex-col items-center text-center space-y-4 mb-8">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 mb-2">
                        <Shield size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">System Administration</h1>
                    <p className="text-slate-400 text-sm">Restricted access area. Please verify your identity.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Secret Key</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="password"
                                autoFocus
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-600 text-white rounded-xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium transition-all"
                                placeholder="Enter access key..."
                            />
                        </div>
                    </div>

                    <div className="pt-4 space-y-3">
                        <button
                            type="submit"
                            disabled={loading || !key}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Verify Access <ArrowRight size={18} /></>}
                        </button>

                        <button
                            type="button"
                            onClick={onCancel}
                            className="w-full text-slate-500 hover:text-slate-400 font-medium text-sm py-2 transition-colors"
                        >
                            Return to Website
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
