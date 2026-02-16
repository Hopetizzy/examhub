import React from 'react';
import { ArrowLeft, FileText, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';

interface TermsOfServiceProps {
    onBack: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 animate-fade-in">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-2 font-black text-xl tracking-tight">
                            <FileText className="text-blue-600" size={24} />
                            <span>Terms of Service</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-12">
                <div className="prose prose-slate prose-lg max-w-none">
                    <p className="lead text-xl text-slate-600 font-medium mb-8">
                        Welcome to Exam Hub! By accessing our website, you agree to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
                    </p>

                    <div className="space-y-12">
                        <section>
                            <h2 className="flex items-center gap-2 text-2xl font-black text-slate-900 mb-4">
                                <CheckCircle className="text-blue-500" size={24} />
                                1. Use License
                            </h2>
                            <p>Permission is granted to temporarily use the materials (information or software) on Exam Hub's website for personal, non-commercial transitory viewing only.</p>
                            <p className="mt-4">This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-600">
                                <li>Modify or copy the materials;</li>
                                <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                                <li>Attempt to decompile or reverse engineer any software contained on Exam Hub's website;</li>
                                <li>Remove any copyright or other proprietary notations from the materials; or</li>
                                <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="flex items-center gap-2 text-2xl font-black text-slate-900 mb-4">
                                <AlertTriangle className="text-blue-500" size={24} />
                                2. Disclaimer
                            </h2>
                            <p>
                                The materials on Exam Hub's website are provided on an 'as is' basis. Exam Hub makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                            </p>
                            <p className="mt-4">
                                Further, Exam Hub does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
                            </p>
                        </section>

                        <section>
                            <h2 className="flex items-center gap-2 text-2xl font-black text-slate-900 mb-4">
                                <HelpCircle className="text-blue-500" size={24} />
                                3. Limitations of Liability
                            </h2>
                            <p>
                                In no event shall Exam Hub or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Exam Hub's website, even if Exam Hub or a Exam Hub authorized representative has been notified orally or in writing of the possibility of such damage.
                            </p>
                        </section>
                    </div>

                    <div className="mt-12 p-6 bg-slate-100 rounded-2xl border border-slate-200 text-sm text-slate-600">
                        <p className="font-bold mb-2">Governing Law</p>
                        <p>These terms and conditions are governed by and construed in accordance with the laws of Nigeria and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.</p>
                    </div>

                    <p className="text-xs text-slate-400 mt-8 text-center">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
};
