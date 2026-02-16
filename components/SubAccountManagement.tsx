import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Mail, Shield, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { tutorService } from '../services/TutorService';
import { AuthService } from '../services/AuthService';

interface SubAccount {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'VIEWER';
    status: 'ACTIVE' | 'PENDING';
    lastActive?: string;
}

export const SubAccountManagement: React.FC = () => {
    const [accounts, setAccounts] = useState<SubAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newAccount, setNewAccount] = useState({ name: '', email: '', role: 'ADMIN' as const });
    const [submitting, setSubmitting] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string>('');

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        try {
            const user = await AuthService.getCurrentUser();
            if (!user) return;
            setCurrentUserId(user.id);

            const subAdmins = await tutorService.getSubAdmins(user.id);
            setAccounts(subAdmins);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load team");
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAccount.name || !newAccount.email) {
            toast.error("Please fill in all fields");
            return;
        }

        if (accounts.length >= 2) {
            toast.error("Limit Reached: You can only add up to 2 sub-admin accounts on the Small Campus plan.");
            return;
        }

        setSubmitting(true);
        try {
            await tutorService.inviteSubAdmin(currentUserId, newAccount);
            toast.success(`Invitation sent to ${newAccount.email}`);

            const names = newAccount.name.split(' ');
            const surname = names.pop() || 'Admin';
            toast.message("Account Credentials Generated", {
                description: `Email: ${newAccount.email}\nPassword: ${surname.toUpperCase()}`,
                duration: 10000,
            });

            setNewAccount({ name: '', email: '', role: 'ADMIN' });
            setShowAddModal(false);
            loadAccounts(); // Reload list
        } catch (error) {
            toast.error("Failed to invite member. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemove = async (id: string) => {
        if (confirm('Are you sure you want to remove this account? Access will be revoked immediately.')) {
            // Need a remove service, simpler for now to just toast
            toast.info("Account removal requires database access. Contact support to revoke permissions.");
        }
    };

    if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900">Team Management</h2>
                    <p className="text-slate-500 font-medium">Manage access for your school administrators. (Limit: 2)</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    disabled={accounts.length >= 2}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition shadow-lg ${accounts.length >= 2 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                >
                    <Plus size={18} /> Add Member
                </button>
            </div>

            {accounts.length === 0 ? (
                <div className="bg-slate-50 rounded-3xl p-10 text-center border border-dashed border-slate-300">
                    <Users size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-700">No Team Members</h3>
                    <p className="text-slate-500 text-sm">Invite your Vice Principal or Head Teacher to help manage the account.</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {accounts.map(account => (
                                    <tr key={account.id} className="group hover:bg-slate-50 transition">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                                    {account.name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{account.name}</div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-1"><Mail size={10} /> {account.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wide border ${account.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                                                }`}>
                                                <Shield size={12} /> {account.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wide ${account.status === 'ACTIVE' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'
                                                }`}>
                                                {account.status === 'ACTIVE' ? <CheckCircle size={12} /> : <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                                                {account.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button
                                                onClick={() => handleRemove(account.id)}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Member Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-6">
                        <h3 className="text-xl font-black text-slate-900">Invite Team Member</h3>
                        <p className="text-sm text-slate-500 mb-4">Credentials (Email + Surname as password) will be generated for them.</p>

                        <form onSubmit={handleInvite} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newAccount.name}
                                    onChange={e => setNewAccount({ ...newAccount, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900"
                                    placeholder="e.g. Jane Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={newAccount.email}
                                    onChange={e => setNewAccount({ ...newAccount, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900"
                                    placeholder="e.g. jane@school.edu"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Role</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setNewAccount({ ...newAccount, role: 'ADMIN' })}
                                        className={`p-3 rounded-xl border-2 text-sm font-bold transition flex flex-col items-center gap-2 ${newAccount.role === 'ADMIN' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-100 text-slate-400'}`}
                                    >
                                        <Shield size={20} /> Admin
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewAccount({ ...newAccount, role: 'VIEWER' })}
                                        className={`p-3 rounded-xl border-2 text-sm font-bold transition flex flex-col items-center gap-2 ${newAccount.role === 'VIEWER' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400'}`}
                                    >
                                        <Users size={20} /> Viewer
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold hover:bg-slate-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition shadow-lg flex justify-center items-center gap-2"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={18} /> : "Send Invite"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
