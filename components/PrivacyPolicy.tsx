import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';

interface PrivacyPolicyProps {
    onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
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
                            <Shield className="text-blue-600" size={24} />
                            <span>Privacy Policy</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-12">
                <div className="prose prose-slate prose-lg max-w-none">
                    <p className="lead text-xl text-slate-600 font-medium mb-8">
                        Your privacy is critically important to us. At Exam Hub, we have a few fundamental principles:
                    </p>

                    <div className="space-y-12">
                        <section>
                            <h2 className="flex items-center gap-2 text-2xl font-black text-slate-900 mb-4">
                                <Eye className="text-blue-500" size={24} />
                                1. Information We Collect
                            </h2>
                            <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-600">
                                <li><strong>Account Data:</strong> When you sign up, we collect your email address and name to create your account and personalize your experience.</li>
                                <li><strong>Performance Data:</strong> We track your exam scores, time spent, and weak topics to generate AI-driven study recommendations.</li>
                                <li><strong>Payment Information:</strong> We do not store your credit card details. All payments are processed securely via Paystack.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="flex items-center gap-2 text-2xl font-black text-slate-900 mb-4">
                                <Lock className="text-blue-500" size={24} />
                                2. How We Use Your Data
                            </h2>
                            <p>We use your data to:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-600">
                                <li>Provide, operate, and maintain our website.</li>
                                <li>Improve, personalize, and expand our website.</li>
                                <li>Understand and analyze how you use our website.</li>
                                <li>Develop new products, services, features, and functionality.</li>
                                <li>Send you emails mainly for account updates, educational tips, and service announcements.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="flex items-center gap-2 text-2xl font-black text-slate-900 mb-4">
                                <FileText className="text-blue-500" size={24} />
                                3. Data Retention & Security
                            </h2>
                            <p>
                                We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use, or modification.
                            </p>
                            <p className="mt-4">
                                We do not share any personally identifying information publicly or with third-parties, except when required to by law.
                            </p>
                        </section>
                    </div>

                    <div className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-100 text-sm text-blue-800">
                        <p className="font-bold mb-2">Contact Us</p>
                        <p>If you have any questions about our Privacy Policy, please contact us at support@examhub.ng.</p>
                    </div>

                    <p className="text-xs text-slate-400 mt-8 text-center">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
};
