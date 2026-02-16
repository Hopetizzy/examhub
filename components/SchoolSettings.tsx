import React, { useState } from 'react';
import { Upload, Save, Building2, Palette, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export interface SchoolBranding {
    schoolName: string;
    primaryColor: string;
    logoUrl: string | null;
}

interface SchoolSettingsProps {
    currentBranding: SchoolBranding;
    onSave: (branding: SchoolBranding) => Promise<void>;
}

export const SchoolSettings: React.FC<SchoolSettingsProps> = ({ currentBranding, onSave }) => {
    const [branding, setBranding] = useState<SchoolBranding>(currentBranding);
    const [isSaving, setIsSaving] = useState(false);
    const [previewLogo, setPreviewLogo] = useState<string | null>(currentBranding.logoUrl);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Create a fake local URL for preview
            const url = URL.createObjectURL(file);
            setPreviewLogo(url);
            setBranding({ ...branding, logoUrl: url });
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(branding);
            toast.success("School branding updated successfully!");
        } catch (error) {
            toast.error("Failed to update settings.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">School Settings</h2>
                        <p className="text-slate-500 font-medium">Customize your campus identity and reports.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">School Name</label>
                            <input
                                type="text"
                                value={branding.schoolName}
                                onChange={(e) => setBranding({ ...branding, schoolName: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                placeholder="e.g. Excellence High School"
                            />
                            <p className="text-xs text-slate-400 mt-2 font-medium">This name will appear on student dashboards and reports.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Primary Brand Color</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="color"
                                    value={branding.primaryColor}
                                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                                    className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-slate-100 shadow-sm p-1"
                                />
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={branding.primaryColor}
                                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 rounded-xl font-mono text-sm border border-slate-200 uppercase"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">School Logo</label>
                            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition cursor-pointer relative group bg-slate-50/50">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    onChange={handleLogoUpload}
                                />
                                {previewLogo ? (
                                    <div className="relative w-32 h-32 mb-4">
                                        <img src={previewLogo} alt="Logo" className="w-full h-full object-contain" />
                                        <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white font-bold text-xs">
                                            Change Logo
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-300 mb-4 group-hover:scale-110 transition">
                                        <ImageIcon size={32} />
                                    </div>
                                )}
                                <p className="font-bold text-slate-700">Click to upload logo</p>
                                <p className="text-xs text-slate-400 mt-1 font-medium">PNG, JPG up to 2MB</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-8 py-4 bg-indigo-900 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Preview Section */}
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -mr-20 -mt-20"></div>

                <h3 className="font-black text-lg mb-6 relative z-10 flex items-center gap-2">
                    <Palette size={18} /> Live Header Preview
                </h3>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm overflow-hidden">
                            {previewLogo ? (
                                <img src={previewLogo} alt="Logo" className="w-8 h-8 object-contain" />
                            ) : (
                                <Building2 className="text-slate-300" size={24} />
                            )}
                        </div>
                        <div>
                            <div className="font-black text-xl text-white tracking-tight">{branding.schoolName || "School Name"}</div>
                            <div className="text-[10px] uppercase tracking-widest opacity-70 font-bold">Administrator Portal</div>
                        </div>
                    </div>
                    <div
                        className="px-4 py-2 rounded-lg font-bold text-xs text-white shadow-lg"
                        style={{ backgroundColor: branding.primaryColor }}
                    >
                        Primary Action
                    </div>
                </div>
            </div>
        </div>
    );
};
