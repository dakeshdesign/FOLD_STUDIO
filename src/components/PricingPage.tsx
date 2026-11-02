import React, { useState } from 'react';
import { Check, Sparkles, Zap, Lock, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { SUBSCRIPTION_CONFIG } from '../config/subscriptionConfig';

export const PricingPage: React.FC = () => {
  const { user, billingCycle, setBillingCycle, openPaymentModal, setActiveView } = useSubscription();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const plans = SUBSCRIPTION_CONFIG.plans;
  const isYearly = billingCycle === 'yearly';

  const faqs = [
    {
      q: 'Can I change my subscription plan at any time?',
      a: 'Yes, you can upgrade, downgrade, or switch between monthly and yearly billing cycles at any time from your Profile page.'
    },
    {
      q: 'What payment methods are supported in India?',
      a: 'We support all major Indian payment options via Razorpay and PhonePe, including UPI (GPay, PhonePe, Paytm, BHIM), Credit Cards, Debit Cards, Net Banking across 50+ banks, and Wallets.'
    },
    {
      q: 'How does ML Revenue Forecasting work?',
      a: 'Pro includes 1-month XGBoost gradient boosting models trained on your historical transaction data. Enterprise unlocks Ensemble ML combining XGBoost and LightGBM for complex multi-store demand prediction.'
    },
    {
      q: 'Is my data secure?',
      a: 'Absolutely. All dataset uploads are encrypted at rest and in transit. Payment security is handled through PCI-DSS Level 1 compliant gateways (Razorpay & PhonePe). We never store raw secret keys in client code.'
    },
    {
      q: 'What happens if I hit my dataset upload limit on Pro?',
      a: 'Pro includes 3 dataset uploads. If you require unlimited dataset slots and white-label export capabilities, you can upgrade to Enterprise with a single click.'
    }
  ];

  const comparisonMatrix = [
    { feature: 'Datasets Limit', free: '1 Dataset', pro: 'Up to 3 Datasets', enterprise: 'Unlimited' },
    { feature: 'Dataset Files', free: '1 File (CSV only)', pro: '3 Files (CSV, Excel)', enterprise: 'Unlimited (CSV, Excel, PDF, JSON)' },
    { feature: 'Dashboard Access', free: '50% Preview', pro: '100% Full Unlocked', enterprise: 'Advanced Custom Filters' },
    { feature: 'KPI Metrics & P&L Table', free: 'Basic Overview', pro: 'Full KPI Metrics & P&L', enterprise: 'Multi-Store Advanced Analytics' },
    { feature: 'ML Revenue Forecasting', free: 'Locked 🔒', pro: '1-Month XGBoost', enterprise: 'Ensemble XGBoost + LightGBM' },
    { feature: 'AI Business Summary Report', free: 'Preview Only', pro: 'Fully Generated', enterprise: 'AI Executive Briefing' },
    { feature: 'Interactive AI Assistant', free: 'Locked 🔒', pro: 'Unlocked with History', enterprise: 'Advanced AI Assistant' },
    { feature: 'High-Res PDF Downloads', free: 'Locked 🔒', pro: 'Unlocked', enterprise: 'Custom White-Label' },
    { feature: 'Customer Support', free: 'Standard Support', pro: 'Priority Support', enterprise: '24/7 Dedicated Support' },
  ];

  return (
    <div className="min-h-screen bg-[#f9f8f6] text-[#111111] pt-28 pb-20 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#111111] text-white font-mono text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#e54000]" />
            <span>TRANSPARENT SAAS PRICING</span>
          </span>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#111111]">
            Plans & Pricing
          </h1>

          <p className="font-sans text-base sm:text-lg text-[#666666] leading-relaxed">
            Choose the subscription tier that scales with your data requirements. Unlock advanced ML models, AI assistants, and enterprise PDF exports.
          </p>

          {/* Billing Period Toggle */}
          <div className="pt-6 flex justify-center items-center">
            <div className="relative inline-flex items-center p-1.5 bg-[#e5e3dc]/60 rounded-full border border-[#e5e3dc]">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`relative px-5 py-2 rounded-full font-mono text-xs font-semibold transition-all duration-300 ${
                  !isYearly ? 'bg-[#111111] text-white shadow' : 'text-[#666666] hover:text-[#111111]'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`relative px-5 py-2 rounded-full font-mono text-xs font-semibold transition-all duration-300 flex items-center space-x-1.5 ${
                  isYearly ? 'bg-[#111111] text-white shadow' : 'text-[#666666] hover:text-[#111111]'
                }`}
              >
                <span>Yearly</span>
                <span className="bg-[#e54000] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  {SUBSCRIPTION_CONFIG.yearlyDiscountNotice}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* FREE TRIAL */}
          <div className="flex flex-col justify-between bg-white p-8 rounded-2xl border border-[#e5e3dc] shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold text-[#111111]">{plans.free.name}</h3>
                  <p className="font-sans text-xs text-[#888888] mt-1">{plans.free.tagline}</p>
                </div>
                {user.plan === 'free' && (
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider bg-[#111111] text-white px-2.5 py-1 rounded-full">
                    CURRENT PLAN
                  </span>
                )}
              </div>

              <div className="font-display text-4xl font-bold text-[#111111]">
                ₹0 <span className="font-mono text-xs text-[#888888] font-normal">/ forever</span>
              </div>

              <hr className="border-[#e5e3dc]" />

              <ul className="space-y-3 font-sans text-xs text-[#111111]">
                {plans.free.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5">
                    {feat.included ? (
                      <Check className="w-4 h-4 text-[#888888] shrink-0 mt-0.5" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-[#888888] shrink-0 mt-0.5" />
                    )}
                    <span className={feat.included ? '' : 'text-[#888888]'}>{feat.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              {user.plan === 'free' ? (
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="w-full py-3.5 px-4 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider bg-[#f9f8f6] border border-[#e5e3dc] text-[#111111] hover:bg-[#111111] hover:text-white transition-colors text-center"
                >
                  Go to Dashboard
                </button>
              ) : (
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="w-full py-3.5 px-4 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider border border-[#e5e3dc] text-[#111111] hover:bg-[#111111] hover:text-white transition-colors text-center"
                >
                  Downgrade to Free
                </button>
              )}
            </div>
          </div>

          {/* PRO (HIGHLIGHTED) */}
          <div className="relative flex flex-col justify-between bg-[#111111] text-white p-8 rounded-2xl border-2 border-[#e54000] shadow-2xl transform md:-translate-y-3">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#e54000] text-white font-mono text-[11px] font-bold uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">
              ⭐ Pro — Most Popular
            </div>

            <div className="space-y-6 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-2xl font-bold text-white">{plans.pro.name}</h3>
                  <p className="font-sans text-xs text-[#aaaaaa] mt-1">{plans.pro.tagline}</p>
                </div>
                {user.plan === 'pro' && (
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider bg-[#e54000] text-white px-2.5 py-1 rounded-full">
                    CURRENT PLAN
                  </span>
                )}
              </div>

              <div>
                <div className="font-display text-5xl font-bold text-white">
                  ₹{isYearly ? (plans.pro.prices.yearly / 12).toFixed(0) : plans.pro.prices.monthly.toLocaleString('en-IN')}{' '}
                  <span className="font-mono text-xs text-[#aaaaaa] font-normal">/ month</span>
                </div>
                {isYearly && (
                  <p className="font-mono text-[11px] text-[#e54000] mt-1">
                    Billed annually (₹{plans.pro.prices.yearly.toLocaleString('en-IN')} / yr)
                  </p>
                )}
              </div>

              <hr className="border-[#333333]" />

              <ul className="space-y-3 font-sans text-xs text-[#dddddd]">
                {plans.pro.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5">
                    <Zap className="w-4 h-4 text-[#e54000] shrink-0 mt-0.5" />
                    <span className={feat.isHighlight ? 'font-semibold text-white' : ''}>{feat.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              {user.plan === 'pro' ? (
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="w-full py-4 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-white text-[#111111] hover:bg-[#e54000] hover:text-white transition-colors text-center"
                >
                  Active Plan — Go to Dashboard
                </button>
              ) : (
                <button
                  onClick={() => openPaymentModal('pro')}
                  className="w-full py-4 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-[#e54000] text-white hover:bg-[#ff4d00] transition-all flex items-center justify-center space-x-2 shadow-lg shadow-orange-600/30"
                >
                  <span>Upgrade to Pro</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* ENTERPRISE */}
          <div className="flex flex-col justify-between bg-white p-8 rounded-2xl border border-[#e5e3dc] shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold text-[#111111]">{plans.enterprise.name}</h3>
                  <p className="font-sans text-xs text-[#888888] mt-1">{plans.enterprise.tagline}</p>
                </div>
                {user.plan === 'enterprise' && (
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider bg-[#111111] text-white px-2.5 py-1 rounded-full">
                    CURRENT PLAN
                  </span>
                )}
              </div>

              <div className="font-display text-3xl font-bold text-[#111111] py-1">
                Contact Sales
              </div>

              <hr className="border-[#e5e3dc]" />

              <ul className="space-y-3 font-sans text-xs text-[#111111]">
                {plans.enterprise.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5">
                    <Check className="w-4 h-4 text-[#111111] shrink-0 mt-0.5" />
                    <span className={feat.isHighlight ? 'font-semibold text-[#111111]' : ''}>{feat.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              {user.plan === 'enterprise' ? (
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="w-full py-3.5 px-4 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider bg-[#111111] text-white hover:bg-[#e54000] transition-colors text-center"
                >
                  Active Plan — Go to Dashboard
                </button>
              ) : (
                <button
                  onClick={() => openPaymentModal('enterprise')}
                  className="w-full py-3.5 px-4 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white transition-colors text-center"
                >
                  Contact Sales / Get Started
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Feature Comparison Matrix */}
        <div className="bg-white rounded-2xl border border-[#e5e3dc] p-6 sm:p-8 space-y-6 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e5e3dc] pb-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#111111]">Detailed Feature Comparison</h2>
              <p className="font-sans text-xs text-[#666666]">Compare limits, permissions, and ML forecasting capabilities across tiers.</p>
            </div>
            <span className="font-mono text-xs text-[#e54000] uppercase font-semibold">ALL PLANS INCLUDE SECURE ENCRYPTION</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e5e3dc] font-mono text-xs uppercase text-[#888888]">
                  <th className="py-3 px-4 font-semibold">Feature & Capability</th>
                  <th className="py-3 px-4 font-semibold text-center">Free Trial</th>
                  <th className="py-3 px-4 font-semibold text-center text-[#e54000]">Pro ⭐</th>
                  <th className="py-3 px-4 font-semibold text-center">Enterprise 🏢</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e3dc] font-sans text-xs text-[#111111]">
                {comparisonMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#f9f8f6] transition-colors">
                    <td className="py-3.5 px-4 font-medium text-[#111111]">{row.feature}</td>
                    <td className="py-3.5 px-4 text-center text-[#666666]">{row.free}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-[#111111] bg-[#f9f8f6]/50">{row.pro}</td>
                    <td className="py-3.5 px-4 text-center font-medium text-[#111111]">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Methods Supported Badge */}
        <div className="bg-[#111111] text-white rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="font-mono text-xs text-[#e54000] font-semibold uppercase tracking-widest">
              INDIAN PAYMENT SYSTEM READY
            </span>
            <h3 className="font-display text-2xl font-bold">Supported Gateways & Methods</h3>
            <p className="font-sans text-xs text-[#aaaaaa] max-w-xl">
              Pay securely via Razorpay & PhonePe. Instant subscription activation with zero manual delays.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-white">
            <span className="px-3 py-1.5 bg-[#222222] border border-[#333333] rounded-lg">GPay / PhonePe UPI</span>
            <span className="px-3 py-1.5 bg-[#222222] border border-[#333333] rounded-lg">Credit / Debit Cards</span>
            <span className="px-3 py-1.5 bg-[#222222] border border-[#333333] rounded-lg">Net Banking (50+ Banks)</span>
            <span className="px-3 py-1.5 bg-[#e54000] text-white font-bold rounded-lg">Razorpay & PhonePe Official</span>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="font-display text-3xl font-bold text-[#111111]">Frequently Asked Questions</h2>
            <p className="font-sans text-xs text-[#666666]">Everything you need to know about Fold Analytics subscriptions.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border border-[#e5e3dc] rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left font-display font-semibold text-sm text-[#111111] hover:bg-[#f9f8f6] transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp className="w-4 h-4 text-[#888888]" /> : <ChevronDown className="w-4 h-4 text-[#888888]" />}
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 font-sans text-xs text-[#666666] leading-relaxed border-t border-[#e5e3dc]/50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
