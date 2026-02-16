import React, { useState } from 'react';
import { PRICING } from '../constants';
import { ExamMode } from '../types';
import { CreditCard, CheckCircle, Lock, Loader2, AlertCircle } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  mode: ExamMode | null;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, mode, onClose, onPaymentSuccess }) => {
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'REVIEW' | 'PROCESSING' | 'SUCCESS'>('REVIEW');

  if (!isOpen || !mode) return null;

  const amount = mode === 'TIMED' ? PRICING.TIMED : PRICING.PRACTICE;

  const handlePay = () => {
    setProcessing(true);
    setStep('PROCESSING');

    // Simulate Payment Gateway Interaction
    setTimeout(() => {
      setStep('SUCCESS');
      setTimeout(() => {
        onPaymentSuccess();
        setStep('REVIEW');
        setProcessing(false);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="bg-slate-50 p-6 text-center border-b border-slate-100">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <CreditCard size={24} />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">Secure Payment</h3>
        </div>

        <div className="p-6">
          {step === 'REVIEW' && (
            <>
              <div className="flex justify-between items-center mb-6 text-sm">
                <span className="text-slate-500">Item</span>
                <span className="font-medium text-slate-900">{mode === 'TIMED' ? 'Timed Exam Mode' : 'Smart Practice Mode'}</span>
              </div>
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                <span className="text-slate-500">Total</span>
                <span className="text-2xl font-extrabold text-blue-600">₦{amount.toLocaleString()}</span>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex gap-3 text-amber-800 text-[11px] mb-4">
                <AlertCircle className="shrink-0 text-amber-600" size={16} />
                <span>
                  <strong>Warning:</strong> Refreshing the page during the exam will cause progress loss.
                </span>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handlePay}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg hover:shadow-green-600/20"
                >
                  <Lock size={16} /> Pay ₦{amount.toLocaleString()}
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3 text-slate-500 hover:text-slate-800 font-medium"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-6 flex justify-center gap-4 grayscale opacity-60">
                {/* Mock Logos */}
                <div className="h-6 w-16 bg-slate-200 rounded"></div>
                <div className="h-6 w-16 bg-slate-200 rounded"></div>
              </div>
            </>
          )}

          {step === 'PROCESSING' && (
            <div className="text-center py-8">
              <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
              <h4 className="font-bold text-slate-800">Processing Payment...</h4>
              <p className="text-slate-500 text-sm mt-2">Please do not close this window.</p>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle size={32} />
              </div>
              <h4 className="font-bold text-green-700 text-xl">Payment Successful!</h4>
              <p className="text-slate-500 text-sm mt-2">Redirecting to exam...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
