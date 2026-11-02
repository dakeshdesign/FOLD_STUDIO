import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { triggerConfetti } from '../utils/confetti';

export const PaymentSuccessModal: React.FC = () => {
  const { showSuccessModal, setShowSuccessModal, lastTransaction, user, setActiveView } = useSubscription();

  useEffect(() => {
    if (showSuccessModal) {
      triggerConfetti();
    }
  }, [showSuccessModal]);

  if (!showSuccessModal) return null;

  const txn = lastTransaction || {
    id: `txn_rzp_${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    planName: user.plan === 'pro' ? 'Pro' : 'Enterprise',
    amount: user.amount_paid || 1499,
    currency: '₹',
    billingCycle: user.billing_cycle,
    status: 'Paid',
    paymentProvider: user.payment_provider || 'Razorpay',
    receiptUrl: '#',
  };

  const handleGoToDashboard = () => {
    setShowSuccessModal(false);
    setActiveView('dashboard');
  };

  const handleViewSubscription = () => {
    setShowSuccessModal(false);
    setActiveView('profile');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#111111]/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-[#f9f8f6] rounded-2xl shadow-2xl border border-[#e5e3dc] overflow-hidden my-8 p-8 text-center space-y-6"
        >
          {/* Badge Icon */}
          <div className="w-16 h-16 rounded-full bg-[#e54000] text-white flex items-center justify-center mx-auto shadow-lg shadow-orange-500/30">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 font-mono text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>PAYMENT SERVER VERIFIED</span>
            </span>

            <h2 className="font-display text-3xl font-bold text-[#111111]">
              🎉 Welcome to {txn.planName}
            </h2>

            <p className="font-sans text-sm text-[#666666]">
              Your subscription is now active. All premium features, ML forecasting models, and PDF exports are unlocked.
            </p>
          </div>

          {/* Transaction Summary Card */}
          <div className="p-6 bg-white rounded-xl border border-[#e5e3dc] font-mono text-xs text-left space-y-3 shadow-sm">
            <div className="flex justify-between py-1 border-b border-[#e5e3dc]">
              <span className="text-[#888888]">PLAN:</span>
              <span className="font-bold text-[#111111]">{txn.planName}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#e5e3dc]">
              <span className="text-[#888888]">AMOUNT PAID:</span>
              <span className="font-bold text-[#e54000]">₹{txn.amount.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#e5e3dc]">
              <span className="text-[#888888]">BILLING PERIOD:</span>
              <span className="font-bold text-[#111111] uppercase">{txn.billingCycle}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#e5e3dc]">
              <span className="text-[#888888]">TRANSACTION ID:</span>
              <span className="font-bold text-[#111111]">{txn.id}</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-[#888888]">NEXT RENEWAL DATE:</span>
              <span className="font-bold text-[#111111]">{user.next_billing_date}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleGoToDashboard}
              className="w-full py-4 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-[#111111] text-white hover:bg-[#e54000] transition-colors flex items-center justify-center space-x-2 shadow-lg"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleViewSubscription}
              className="w-full py-3 px-4 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider border border-[#e5e3dc] bg-white text-[#111111] hover:bg-[#111111] hover:text-white transition-colors"
            >
              View Subscription Details
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
