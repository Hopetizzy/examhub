import React, { useState } from 'react';
import { TUTOR_PLANS, SCHOOL_PLANS } from '../constants';
import { Check, Loader2, CreditCard, ShieldCheck, Zap, Star, Trophy, Building2, AlertTriangle, Headset, Sparkles, GraduationCap, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { PaystackButton } from 'react-paystack';
import { tutorService } from '../services/TutorService';

interface TutorPlanSelectionProps {
  currentStudentCount: number;
  currentPlanId?: string;
  userEmail: string;
  userId: string;
  onSelectPlan: (planId: string) => void;
  onCancel: () => void;
}

export const TutorPlanSelection: React.FC<TutorPlanSelectionProps> = ({ currentStudentCount, currentPlanId, userEmail, userId, onSelectPlan, onCancel }) => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [planType, setPlanType] = useState<'TUTOR' | 'SCHOOL'>('TUTOR');

  // Paystack Config
  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";

  const handleSuccess = async (reference: any, plan: any) => {
    try {
      // Verify and Upgrade
      await tutorService.upgradeSubscription(userId, plan.id, plan.maxStudents);
      toast.success(`Successfully upgraded to ${plan.name}!`);
      onSelectPlan(plan.id);
    } catch (error) {
      toast.error("Payment successful but upgrade failed. Please contact support.");
      console.error(error);
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleClose = () => {
    setLoadingPlan(null);
    toast.info("Payment cancelled.");
  }

  const handleSelect = (id: string, isCustom?: boolean) => {
    if (isCustom) {
      toast.success("Redirecting to our Institutional Sales team for custom licensing...");
      return;
    }
    setLoadingPlan(id);
    // The actual payment trigger is handled by the PaystackButton component logic or manual trigger if needed.
    // However, react-paystack usually works best as a button. 
    // We will render the PaystackButton conditionally or simulate a click if possible, 
    // but standard practice is to make the "Select Plan" button THE Paystack button.
  };

  const getPlanIcon = (id: string) => {
    switch (id) {
      case 'plan_basic': return <Zap className="text-blue-500 fill-blue-500/20" size={24} />;
      case 'plan_pro': return <Star className="text-purple-500 fill-purple-500/20" size={24} />;
      case 'plan_expert': return <Trophy className="text-amber-500 fill-amber-500/20" size={24} />;
      case 'school_small': return <Building2 className="text-indigo-500 fill-indigo-500/20" size={24} />;
      case 'school_medium': return <Building2 className="text-indigo-600 fill-indigo-600/20" size={24} />;
      case 'school_large': return <Building2 className="text-violet-600 fill-violet-600/20" size={24} />;
      case 'school_institution': return <Headset className="text-emerald-500 fill-emerald-500/20" size={24} />;
      default: return <Zap className="text-blue-500" size={24} />;
    }
  };

  const getGradient = (id: string) => {
    switch (id) {
      case 'plan_expert': return 'bg-gradient-to-b from-amber-50 to-white border-amber-200';
      case 'school_small': return 'bg-gradient-to-b from-indigo-50 to-white border-indigo-200';
      case 'school_medium': return 'bg-gradient-to-b from-indigo-50 to-white border-indigo-300';
      case 'school_large': return 'bg-gradient-to-b from-violet-50 to-white border-violet-300';
      case 'school_institution': return 'bg-gradient-to-b from-emerald-50 to-white border-emerald-200';
      default: return 'bg-white border-slate-100';
    }
  }

  const activePlans = planType === 'TUTOR' ? TUTOR_PLANS : SCHOOL_PLANS;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-100/50 to-transparent -z-10"></div>
      <div className="absolute top-20 right-20 w-96 h-96 bg-purple-200/30 rounded-full blur-[100px] -z-10 animate-pulse"></div>

      <div className="max-w-7xl w-full space-y-10">
        <div className="text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
            <Sparkles size={14} className="text-amber-400" /> {planType === 'TUTOR' ? 'Professional Tiers' : 'Institutional Licensing'}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Scale Your <span className="text-blue-900 bg-clip-text bg-gradient-to-r from-blue-200 to-purple-600">Impact</span>
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto font-medium text-lg leading-relaxed">
            {planType === 'TUTOR'
              ? 'Choose a plan that fits your classroom size. Upgrade seamlessly as your student base grows.'
              : 'Complete solutions for schools and institutions. Manage entire campuses with ease.'}
          </p>

          {/* Toggle Switch */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setPlanType('TUTOR')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${planType === 'TUTOR' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
            >
              For Tutors
            </button>
            <button
              onClick={() => setPlanType('SCHOOL')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${planType === 'SCHOOL' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
            >
              For Schools
            </button>
          </div>

          {currentStudentCount > 0 && (
            <div className="inline-block px-5 py-2.5 bg-slate-800 text-white rounded-2xl text-sm font-bold shadow-xl shadow-slate-200/50">
              Active Dashboard: {currentStudentCount} Students
            </div>
          )}
        </div>

        <div className={`grid md:grid-cols-2 ${planType === 'TUTOR' ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-6 items-start justify-center`}>
          {activePlans.map(plan => {
            const isCurrent = plan.id === currentPlanId;
            const isDowngrade = !isCurrent && plan.maxStudents < currentStudentCount;
            const needsRemoval = currentStudentCount - plan.maxStudents;
            const isPopular = plan.id === 'plan_expert' || plan.id === 'school_medium';

            // Paystack Props
            const componentProps = {
              email: userEmail,
              amount: plan.price * 100, // Paystack expects kobo
              metadata: {
                name: userEmail, // or name
                phone: "",
                custom_fields: [{ display_name: "Plan ID", variable_name: "plan_id", value: plan.id }]
              },
              publicKey,
              text: "Select Plan",
              onSuccess: (reference: any) => handleSuccess(reference, plan),
              onClose: handleClose,
            };

            return (
              <div
                key={plan.id}
                className={`
                    relative rounded-[2rem] p-6 border-2 transition-all duration-300 flex flex-col group h-full
                    ${isCurrent ? 'ring-4 ring-blue-500/20 scale-[1.02] shadow-2xl shadow-blue-900/10 z-10 border-blue-500' : 'hover:scale-[1.02] hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-200 ' + getGradient(plan.id)}
                    ${isPopular && !isCurrent ? '-translate-y-4 shadow-xl border-amber-200 shadow-amber-100/50' : ''}
                `}
              >
                {isCurrent && (
                  <div className="absolute -top-4 inset-x-0 flex justify-center">
                    <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                      <ShieldCheck size={12} /> Current Plan
                    </div>
                  </div>
                )}

                {isPopular && !isCurrent && (
                  <div className="absolute -top-4 inset-x-0 flex justify-center">
                    <div className="bg-amber-400 text-amber-950 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                      <Star size={12} /> Best Value
                    </div>
                  </div>
                )}

                <div className="flex-1 space-y-6 pt-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-black text-slate-900 text-lg leading-tight">{plan.name}</h3>
                      <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Capacity</div>
                    </div>
                    <div className={`p-3 rounded-2xl transition-transform group-hover:rotate-6 ${isCurrent ? 'bg-blue-50' : 'bg-white shadow-sm border border-slate-100'}`}>
                      {getPlanIcon(plan.id)}
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      {plan.isCustom ? 'Custom' : `₦${(plan.price / 1).toLocaleString()}`}
                    </span>
                    {!plan.isCustom && <span className="text-slate-400 text-xs font-bold uppercase">/mo</span>}
                  </div>

                  <div className={`py-2 px-3 rounded-xl border flex items-start gap-2 ${plan.isCustom ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                    <div className={`mt-0.5 ${plan.isCustom ? 'text-emerald-500' : 'text-blue-500'}`}>
                      {plan.isCustom ? <Headset size={14} /> : <Zap size={14} />}
                    </div>
                    <div>
                      <span className={`text-[9px] font-black uppercase tracking-widest block mb-0.5 ${plan.isCustom ? 'text-emerald-600' : 'text-slate-500'}`}>Key Feature</span>
                      <span className={`text-xs font-bold leading-tight block ${plan.isCustom ? 'text-emerald-900' : 'text-slate-900'}`}>{plan.highlightFeature}</span>
                    </div>
                  </div>

                  <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-xs text-slate-700 font-bold">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      {plan.isCustom ? 'Unlimited Student Slots' : `${plan.maxStudents} Students Max`}
                    </li>
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3 text-xs text-slate-500 font-medium leading-relaxed">
                        <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 shrink-0">
                          <Check size={12} />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {isDowngrade ? (
                  <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-red-600 font-black text-[10px] uppercase tracking-widest">
                      <AlertTriangle size={14} /> Ineligible
                    </div>
                    <p className="text-[11px] text-red-800 font-medium leading-relaxed">
                      You manage <b>{currentStudentCount}</b> students. Remove <b>{needsRemoval}</b> student{needsRemoval > 1 ? 's' : ''} to downgrade.
                    </p>
                  </div>
                ) : (
                  <div className="mt-8 w-full">
                    {isCurrent ? (
                      <button
                        disabled
                        className="w-full py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 bg-slate-100 text-slate-400 border-2 border-transparent cursor-default"
                      >
                        Current Plan
                      </button>
                    ) : ['school_medium', 'school_large', 'school_institution'].includes(plan.id) ? (
                      <button
                        disabled
                        className="w-full py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed"
                      >
                        <Clock size={16} /> Coming Soon
                      </button>
                    ) : plan.isCustom ? (
                      <button
                        onClick={() => handleSelect(plan.id, true)}
                        className="w-full py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                      >
                        <Headset size={16} /> Contact Sales
                      </button>
                    ) : (
                      <PaystackButton
                        {...componentProps}
                        className={`w-full py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 border-2 bg-slate-900 text-white border-transparent hover:bg-slate-800 hover:shadow-slate-900/20`}
                      >
                        <CreditCard size={16} /> Select Plan
                      </PaystackButton>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center pb-8">
          <button onClick={onCancel} className="text-slate-400 font-bold text-sm hover:text-slate-800 transition flex items-center gap-2 mx-auto">
            Ignore Upgrade & Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
