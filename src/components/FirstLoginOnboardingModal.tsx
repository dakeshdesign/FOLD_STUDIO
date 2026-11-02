import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, Sparkles, Shield, Lock, ArrowRight } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { SUBSCRIPTION_CONFIG, PlanId } from '../config/subscriptionConfig';

export const FirstLoginOnboardingModal: React.FC = () => {
  const { showOnboardingModal, dismissOnboarding, openPaymentModal } = useSubscription();

  if (!showOnboardingModal) return null;

  const plans = SUBSCRIPTION_CONFIG.plans;

  const handleSelectPlan = (planId: PlanId) => {
    dismissOnboarding();
    if (planId !== 'free') {
      openPaymentModal(planId);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#111111]/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-5xl bg-[#f9f8f6] rounded-2xl shadow-2xl border border-[#e5e3dc] overflow-hidden my-8"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e3dc] bg-white/80">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e54000]" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#888888] font-semibold">
                WELCOME TO FOLD ANALYTICS
              </span>
            </div>
            <button
              onClick={dismissOnboarding}
              className="p-1.5 rounded-full text-[#888888] hover:text-[#111111] hover:bg-[#e5e3dc]/50 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 md:p-10 space-y-8">
            {/* Title & Subtitle */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#e54000]/10 text-[#e54000] font-mono text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>PREMIUM ONBOARDING</span>
              </span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#111111] leading-tight">
                Unlock the full power of your data.
              </h2>
              <p className="font-sans text-sm sm:text-base text-[#666666] leading-relaxed">
                Upgrade to access advanced dashboards, AI-powered insights, ML forecasting and professional reports.
              </p>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {/* FREE TRIAL */}
              <div className="flex flex-col justify-between p-6 bg-white border border-[#e5e3dc] rounded-xl hover:border-[#111111]/30 transition-all shadow-sm">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-display font-bold text-lg text-[#111111]">{plans.free.name}</h3>
                    <span className="font-mono text-[11px] text-[#888888] uppercase bg-[#f9f8f6] px-2 py-0.5 rounded">BASIC</span>
                  </div>
                  <div className="font-display text-3xl font-bold text-[#111111]">
                    ₹0 <span className="text-xs font-mono text-[#888888] font-normal">/ forever</span>
                  </div>
                  <p className="font-sans text-xs text-[#666666] min-h-[32px]">
                    {plans.free.tagline}
                  </p>
                  <hr className="border-[#e5e3dc]" />
                  <ul className="space-y-2.5 font-sans text-xs text-[#111111]">
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-[#888888] shrink-0 mt-0.5" />
                      <span>1 Dataset (CSV only)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-[#888888] shrink-0 mt-0.5" />
                      <span>50% Dashboard Preview</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-[#888888] shrink-0 mt-0.5" />
                      <span>Basic KPI Metrics & AI Summary</span>
                    </li>
                    <li className="flex items-start space-x-2 text-[#888888]">
                      <Lock className="w-3.5 h-3.5 text-[#888888] shrink-0 mt-0.5" />
                      <span>ML Revenue Forecasting</span>
                    </li>
                    <li className="flex items-start space-x-2 text-[#888888]">
                      <Lock className="w-3.5 h-3.5 text-[#888888] shrink-0 mt-0.5" />
                      <span>AI Chatbot History</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => handleSelectPlan('free')}
                  className="mt-6 w-full py-3 px-4 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider border border-[#e5e3dc] text-[#111111] hover:bg-[#111111] hover:text-white transition-colors text-center"
                >
                  Continue with Free Trial
                </button>
              </div>

              {/* PRO — HIGHLIGHTED */}
              <div className="relative flex flex-col justify-between p-6 bg-[#111111] text-white border-2 border-[#e54000] rounded-xl shadow-xl transform md:-translate-y-2">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#e54000] text-white font-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow">
                  ⭐ Pro — Recommended
                </div>
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-display font-bold text-xl text-white">{plans.pro.name}</h3>
                    <span className="font-mono text-[10px] text-[#e54000] uppercase bg-[#e54000]/20 px-2 py-0.5 rounded font-bold">
                      MOST POPULAR
                    </span>
                  </div>
                  <div className="font-display text-4xl font-bold text-white">
                    ₹{plans.pro.prices.monthly.toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-mono text-[#888888] font-normal">/ mo</span>
                  </div>
                  <p className="font-sans text-xs text-[#aaaaaa] min-h-[32px]">
                    {plans.pro.tagline}
                  </p>
                  <hr className="border-[#333333]" />
                  <ul className="space-y-2.5 font-sans text-xs text-[#dddddd]">
                    <li className="flex items-start space-x-2">
                      <Zap className="w-4 h-4 text-[#e54000] shrink-0 mt-0.5" />
                      <span className="font-medium text-white">Up to 3 Datasets & Files (CSV, Excel)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Zap className="w-4 h-4 text-[#e54000] shrink-0 mt-0.5" />
                      <span className="font-medium text-white">100% Full Dashboard Unlocked</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-[#e54000] shrink-0 mt-0.5" />
                      <span>1-Month ML Revenue Forecasting (XGBoost)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-[#e54000] shrink-0 mt-0.5" />
                      <span>Full AI Assistant & Chat History Unlocked</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-[#e54000] shrink-0 mt-0.5" />
                      <span>High-Resolution PDF Report Downloads</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => handleSelectPlan('pro')}
                  className="mt-6 w-full py-3.5 px-4 rounded-lg font-mono text-xs font-bold uppercase tracking-wider bg-[#e54000] text-white hover:bg-[#ff4d00] transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-orange-500/20"
                >
                  <span>Upgrade to Pro</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* ENTERPRISE */}
              <div className="flex flex-col justify-between p-6 bg-white border border-[#e5e3dc] rounded-xl hover:border-[#111111]/30 transition-all shadow-sm">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-display font-bold text-lg text-[#111111]">{plans.enterprise.name}</h3>
                    <span className="font-mono text-[11px] text-[#888888] uppercase bg-[#f9f8f6] px-2 py-0.5 rounded">CUSTOM</span>
                  </div>
                  <div className="font-display text-2xl font-bold text-[#111111] py-1">
                    Contact Sales
                  </div>
                  <p className="font-sans text-xs text-[#666666] min-h-[32px]">
                    {plans.enterprise.tagline}
                  </p>
                  <hr className="border-[#e5e3dc]" />
                  <ul className="space-y-2.5 font-sans text-xs text-[#111111]">
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-[#111111] shrink-0 mt-0.5" />
                      <span className="font-medium">Unlimited Datasets & File Uploads</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-[#111111] shrink-0 mt-0.5" />
                      <span>CSV, Excel, PDF tables & JSON</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-[#111111] shrink-0 mt-0.5" />
                      <span>Ensemble ML (XGBoost + LightGBM)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-[#111111] shrink-0 mt-0.5" />
                      <span>AI Executive Briefing & Custom Filters</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-[#111111] shrink-0 mt-0.5" />
                      <span>24/7 Enterprise Dedicated Support</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => handleSelectPlan('enterprise')}
                  className="mt-6 w-full py-3 px-4 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white transition-colors text-center"
                >
                  Contact Sales / Get Started
                </button>
              </div>
            </div>

            {/* Modal Bottom Footer */}
            <div className="text-center pt-2 border-t border-[#e5e3dc] flex flex-col sm:flex-row items-center justify-between text-xs text-[#888888] font-mono gap-2">
              <span className="flex items-center space-x-1">
                <Shield className="w-3.5 h-3.5 text-[#e54000]" />
                <span>Secure payment via Razorpay & PhonePe (UPI, Cards, Netbanking)</span>
              </span>
              <button
                onClick={dismissOnboarding}
                className="underline hover:text-[#111111] transition-colors"
              >
                Skip for now & explore Free Trial
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
