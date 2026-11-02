import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Zap, Download, X
} from 'lucide-react';
import { useSubscription, TransactionRecord } from '../context/SubscriptionContext';
import { SUBSCRIPTION_CONFIG } from '../config/subscriptionConfig';
import { getUsageDisplay } from '../services/entitlements';

export const ProfilePage: React.FC = () => {
  const { user, transactions, setActiveView } = useSubscription();
  const [selectedReceipt, setSelectedReceipt] = useState<TransactionRecord | null>(null);
  const [showManageModal, setShowManageModal] = useState<boolean>(false);

  const planConfig = SUBSCRIPTION_CONFIG.plans[user.plan];

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'active':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
      case 'failed':
        return 'bg-red-500/10 text-red-600 border-red-500/30';
      case 'pending':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      default:
        return 'bg-[#e5e3dc] text-[#111111] border-[#e5e3dc]';
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f8f6] text-[#111111] pt-28 pb-20 px-4 sm:px-6 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Profile Header Card */}
        <div className="bg-white p-8 rounded-2xl border border-[#e5e3dc] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 rounded-full bg-[#111111] text-white flex items-center justify-center font-display font-bold text-2xl shadow-md">
              FS
            </div>
            <div className="space-y-1">
              <h1 className="font-display text-2xl font-bold text-[#111111]">Alex Rivers</h1>
              <p className="font-sans text-xs text-[#666666]">alex@foldstudio.com • Fold Studio Team</p>
              <div className="flex items-center space-x-2 pt-1">
                <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#f9f8f6] border border-[#e5e3dc] text-[#888888]">
                  ID: {user.payment_customer_id || 'cust_001'}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#111111] text-white">
                  {user.payment_provider && user.payment_provider !== 'none' ? `GATEWAY: ${user.payment_provider.toUpperCase()}` : 'FREE TIER'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveView('pricing')}
              className="px-5 py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-[#e54000] text-white hover:bg-[#ff4d00] transition-colors shadow-sm flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>Upgrade Plan</span>
            </button>
            <button
              onClick={() => setShowManageModal(true)}
              className="px-5 py-3 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider border border-[#e5e3dc] bg-white text-[#111111] hover:bg-[#111111] hover:text-white transition-colors"
            >
              Manage Subscription
            </button>
          </div>
        </div>

        {/* SECTION 5: YOUR PLAN & SUBSCRIPTION MANAGEMENT */}
        <div className="bg-white p-8 rounded-2xl border border-[#e5e3dc] shadow-sm space-y-8">
          {/* Plan Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#e5e3dc] pb-6 gap-4">
            <div>
              <span className="font-mono text-xs text-[#888888] uppercase tracking-widest block mb-1">
                CURRENT SUBSCRIPTION
              </span>
              <div className="flex items-center space-x-3">
                <h2 className="font-display text-3xl font-bold text-[#111111]">{planConfig.name}</h2>
                <span className={`font-mono text-xs font-bold uppercase px-3 py-1 rounded-full border ${getStatusBadgeColor(user.subscription_status)}`}>
                  {user.plan.toUpperCase()} — {user.subscription_status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveView('pricing')}
                className="font-mono text-xs font-semibold text-[#e54000] underline hover:text-[#111111] transition-colors"
              >
                View Plans →
              </button>
            </div>
          </div>

          {/* Subscription Meta Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-mono text-xs border-b border-[#e5e3dc] pb-8">
            <div className="space-y-1">
              <span className="text-[#888888] uppercase text-[10px]">BILLING CYCLE</span>
              <div className="font-bold text-[#111111] capitalize">{user.billing_cycle}</div>
            </div>

            <div className="space-y-1">
              <span className="text-[#888888] uppercase text-[10px]">START DATE</span>
              <div className="font-bold text-[#111111]">{user.subscription_start}</div>
            </div>

            <div className="space-y-1">
              <span className="text-[#888888] uppercase text-[10px]">NEXT RENEWAL DATE</span>
              <div className="font-bold text-[#e54000]">{user.next_billing_date}</div>
            </div>

            <div className="space-y-1">
              <span className="text-[#888888] uppercase text-[10px]">AMOUNT PAID</span>
              <div className="font-bold text-[#111111]">
                ₹{user.amount_paid ? user.amount_paid.toLocaleString('en-IN') : '0'}
              </div>
            </div>
          </div>

          {/* VISUAL PROGRESS INDICATORS FOR USAGE */}
          <div className="space-y-6">
            <h3 className="font-display font-bold text-lg text-[#111111]">Feature Usage & Limits</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Datasets Usage Progress */}
              <div className="bg-[#f9f8f6] p-5 rounded-xl border border-[#e5e3dc] space-y-3">
                <div className="flex justify-between items-center font-mono text-xs">
                  <span className="text-[#888888] uppercase font-semibold">DATASETS</span>
                  <span className="font-bold text-[#111111]">
                    {getUsageDisplay(user.usage.datasetsCount, planConfig.limits.maxDatasets)}
                  </span>
                </div>
                {planConfig.limits.maxDatasets < 9999 ? (
                  <div className="w-full h-2 bg-[#e5e3dc] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#111111] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (user.usage.datasetsCount / planConfig.limits.maxDatasets) * 100)}%` }}
                    />
                  </div>
                ) : (
                  <span className="font-mono text-xs text-emerald-600 font-bold block">Unlimited Enterprise Capacity</span>
                )}
              </div>

              {/* AI Usage Progress */}
              <div className="bg-[#f9f8f6] p-5 rounded-xl border border-[#e5e3dc] space-y-3">
                <div className="flex justify-between items-center font-mono text-xs">
                  <span className="text-[#888888] uppercase font-semibold">AI QUERIES</span>
                  <span className="font-bold text-[#111111]">
                    {getUsageDisplay(user.usage.aiQueriesCount, planConfig.limits.maxAiQueriesPerMonth)}
                  </span>
                </div>
                {planConfig.limits.maxAiQueriesPerMonth < 9999 ? (
                  <div className="w-full h-2 bg-[#e5e3dc] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#e54000] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (user.usage.aiQueriesCount / planConfig.limits.maxAiQueriesPerMonth) * 100)}%` }}
                    />
                  </div>
                ) : (
                  <span className="font-mono text-xs text-emerald-600 font-bold block">Unlimited AI Queries</span>
                )}
              </div>

              {/* PDF Reports Usage Progress */}
              <div className="bg-[#f9f8f6] p-5 rounded-xl border border-[#e5e3dc] space-y-3">
                <div className="flex justify-between items-center font-mono text-xs">
                  <span className="text-[#888888] uppercase font-semibold">PDF REPORTS</span>
                  <span className="font-bold text-[#111111]">
                    {getUsageDisplay(user.usage.pdfReportsCount, planConfig.limits.maxPdfReportsPerMonth)}
                  </span>
                </div>
                {planConfig.limits.maxPdfReportsPerMonth < 9999 ? (
                  <div className="w-full h-2 bg-[#e5e3dc] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#111111] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (user.usage.pdfReportsCount / Math.max(1, planConfig.limits.maxPdfReportsPerMonth)) * 100)}%` }}
                    />
                  </div>
                ) : (
                  <span className="font-mono text-xs text-emerald-600 font-bold block">Unlimited PDF Downloads</span>
                )}
              </div>

              {/* ML Forecasts Usage Progress */}
              <div className="bg-[#f9f8f6] p-5 rounded-xl border border-[#e5e3dc] space-y-3">
                <div className="flex justify-between items-center font-mono text-xs">
                  <span className="text-[#888888] uppercase font-semibold">ML FORECASTS</span>
                  <span className="font-bold text-[#111111]">
                    {getUsageDisplay(user.usage.forecastsCount, planConfig.limits.maxForecastsPerMonth)}
                  </span>
                </div>
                {planConfig.limits.maxForecastsPerMonth < 9999 ? (
                  <div className="w-full h-2 bg-[#e5e3dc] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#e54000] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (user.usage.forecastsCount / Math.max(1, planConfig.limits.maxForecastsPerMonth)) * 100)}%` }}
                    />
                  </div>
                ) : (
                  <span className="font-mono text-xs text-emerald-600 font-bold block">Unlimited Ensemble Forecasts</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 12: BILLING HISTORY */}
        <div className="bg-white p-8 rounded-2xl border border-[#e5e3dc] shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#e5e3dc] pb-4">
            <div>
              <h2 className="font-display text-xl font-bold text-[#111111]">Billing History</h2>
              <p className="font-sans text-xs text-[#666666]">Access transaction receipts and payment audit history.</p>
            </div>
            <span className="font-mono text-xs text-[#888888] uppercase">{transactions.length} TRANSACTIONS</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#e5e3dc] font-mono text-[#888888] uppercase">
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Plan</th>
                  <th className="py-3 px-4 font-semibold">Amount</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e3dc]">
                {transactions.map((txn, idx) => (
                  <tr key={idx} className="hover:bg-[#f9f8f6] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[#111111]">{txn.date}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#111111]">{txn.planName}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#111111]">
                      {txn.currency}{txn.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-mono text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadgeColor(txn.status)}`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(txn)}
                        className="font-mono text-xs text-[#e54000] hover:underline flex items-center justify-end space-x-1 ml-auto"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 13: SUBSCRIPTION MANAGEMENT MODAL */}
        <AnimatePresence>
          {showManageModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/70 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white rounded-2xl p-6 border border-[#e5e3dc] shadow-2xl space-y-6"
              >
                <div className="flex items-center justify-between border-b border-[#e5e3dc] pb-3">
                  <h3 className="font-display text-lg font-bold text-[#111111]">Manage Subscription</h3>
                  <button onClick={() => setShowManageModal(false)} className="text-[#888888] hover:text-[#111111]">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 font-sans text-xs">
                  <div className="p-4 bg-[#f9f8f6] rounded-xl border border-[#e5e3dc] space-y-1">
                    <span className="font-mono text-[10px] text-[#888888] uppercase">ACTIVE PLAN</span>
                    <div className="font-bold text-sm text-[#111111]">{planConfig.name} ({user.billing_cycle})</div>
                    <p className="text-[#666666]">Next renewal: {user.next_billing_date}</p>
                  </div>

                  <button
                    onClick={() => {
                      setShowManageModal(false);
                      setActiveView('pricing');
                    }}
                    className="w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase bg-[#e54000] text-white hover:bg-[#ff4d00] transition-colors text-center"
                  >
                    Change Plan / Upgrade
                  </button>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] leading-relaxed">
                    Note: Cancellation or plan modifications automatically update entitlement privileges at the end of the active billing period.
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* RECEIPT VIEW MODAL */}
        <AnimatePresence>
          {selectedReceipt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/70 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-white rounded-2xl p-8 border border-[#e5e3dc] shadow-2xl space-y-6"
              >
                <div className="flex justify-between items-center border-b border-[#e5e3dc] pb-4">
                  <div>
                    <span className="font-mono text-[10px] text-[#e54000] font-bold uppercase">OFFICIAL PAYMENT RECEIPT</span>
                    <h3 className="font-display text-xl font-bold text-[#111111]">Receipt #{selectedReceipt.id}</h3>
                  </div>
                  <button onClick={() => setSelectedReceipt(null)} className="text-[#888888] hover:text-[#111111]">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 font-mono text-xs">
                  <div className="flex justify-between py-1 border-b border-[#e5e3dc]">
                    <span className="text-[#888888]">DATE:</span>
                    <span className="font-bold text-[#111111]">{selectedReceipt.date}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#e5e3dc]">
                    <span className="text-[#888888]">PLAN:</span>
                    <span className="font-bold text-[#111111]">{selectedReceipt.planName}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#e5e3dc]">
                    <span className="text-[#888888]">PAYMENT PROVIDER:</span>
                    <span className="font-bold text-[#111111]">{selectedReceipt.paymentProvider}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#e5e3dc]">
                    <span className="text-[#888888]">STATUS:</span>
                    <span className="font-bold text-emerald-600">{selectedReceipt.status}</span>
                  </div>

                  <div className="flex justify-between py-2 font-display text-lg font-bold text-[#111111]">
                    <span>TOTAL PAID:</span>
                    <span className="text-[#e54000]">{selectedReceipt.currency}{selectedReceipt.amount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    alert('Receipt PDF file downloaded to local system.');
                    setSelectedReceipt(null);
                  }}
                  className="w-full py-3.5 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-[#111111] text-white hover:bg-[#e54000] transition-colors flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Tax Invoice (PDF)</span>
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
