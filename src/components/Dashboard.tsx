import React, { useState } from 'react';
import {
  Lock, Zap, Download, Sparkles, TrendingUp, BarChart3, Database,
  Bot
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import {
  canCreateDataset, canUploadFormat, isDashboardFullyUnlocked,
  canAccessMLForecasting, canAccessAIChatHistory, canDownloadPDFReports
} from '../services/entitlements';

export const Dashboard: React.FC = () => {
  const { user, openPaymentModal, updateUsageCount } = useSubscription();
  const [activeTab, setActiveTab] = useState<'overview' | 'forecasting' | 'ai_assistant' | 'datasets'>('overview');
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: 'Hello! I am your Fold AI Data Assistant. Ask me anything about your revenue metrics, inventory turnover, or ML forecasts.',
      time: '10:00 AM'
    },
    {
      sender: 'user',
      text: 'What is our projected revenue trend for next month?',
      time: '10:01 AM'
    },
    {
      sender: 'ai',
      text: 'Based on historical sales velocity and XGBoost forecasting, projected revenue is expected to grow by 14.8% to ₹8,42,000 next month.',
      time: '10:01 AM'
    }
  ]);
  const [selectedFormat, setSelectedFormat] = useState<string>('CSV');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const isFullUnlocked = isDashboardFullyUnlocked(user.plan);
  const mlAccess = canAccessMLForecasting(user.plan);
  const chatHistoryAllowed = canAccessAIChatHistory(user.plan);
  const pdfAllowed = canDownloadPDFReports(user.plan);

  const handleDatasetUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const canUpload = canUploadFormat(user, selectedFormat);
    const datasetLimit = canCreateDataset(user);

    if (!datasetLimit.allowed) {
      alert(`Dataset limit reached for ${user.plan.toUpperCase()} plan. Please upgrade to add more datasets.`);
      openPaymentModal('pro');
      return;
    }

    if (!canUpload.allowed) {
      alert(`The ${selectedFormat} file format is not supported on your ${user.plan.toUpperCase()} plan. Upgrade to unlock ${canUpload.supportedFormats.join(', ')}.`);
      openPaymentModal('pro');
      return;
    }

    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      updateUsageCount('datasets', 1);
      setUploadSuccess(`Successfully ingested dataset in ${selectedFormat} format!`);
      setTimeout(() => setUploadSuccess(null), 4000);
    }, 1200);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userText = chatMessage;
    setChatMessage('');
    setChatHistory((prev) => [...prev, { sender: 'user', text: userText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    updateUsageCount('ai', 1);

    setTimeout(() => {
      let aiResponse = `Analyzing dataset... Insight for "${userText}": Revenue conversion velocity increased 8.2% across top performing SKUs.`;
      if (user.plan === 'enterprise') {
        aiResponse = `[Enterprise AI Briefing]: Direct correlation found between marketing expenditure and top-tier conversions. Recommended re-allocation: +12% to direct channels.`;
      }
      setChatHistory((prev) => [...prev, { sender: 'ai', text: aiResponse, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1000);
  };

  const handleDownloadPDF = () => {
    if (!pdfAllowed) {
      openPaymentModal('pro');
      return;
    }
    updateUsageCount('reports', 1);
    alert('Generating High-Resolution Executive PDF Report... Download started.');
  };

  return (
    <div className="min-h-screen bg-[#f9f8f6] text-[#111111] pt-28 pb-20 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Banner & User Subscription Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#e5e3dc] shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e54000]" />
              <h1 className="font-display text-2xl font-bold text-[#111111]">Analytics & Intelligence Dashboard</h1>
              <span className="font-mono text-xs uppercase px-3 py-0.5 rounded-full bg-[#111111] text-white font-semibold">
                {user.plan.toUpperCase()} PLAN ACTIVE
              </span>
            </div>
            <p className="font-sans text-xs text-[#666666]">
              Real-time transaction analysis, Machine Learning forecasting, and AI executive summary.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {!isFullUnlocked && (
              <button
                onClick={() => openPaymentModal('pro')}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-[#e54000] text-white hover:bg-[#ff4d00] transition-colors shadow-sm"
              >
                <Zap className="w-4 h-4" />
                <span>Unlock 100% Pro Dashboard</span>
              </button>
            )}

            <button
              onClick={handleDownloadPDF}
              className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider border transition-colors ${
                pdfAllowed
                  ? 'border-[#111111] bg-[#111111] text-white hover:bg-[#e54000]'
                  : 'border-[#e5e3dc] text-[#888888] bg-[#f9f8f6]'
              }`}
            >
              {!pdfAllowed && <Lock className="w-3.5 h-3.5 text-[#e54000]" />}
              <Download className="w-4 h-4" />
              <span>Download PDF Report</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#e5e3dc] space-x-6 font-mono text-xs overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-2 font-semibold uppercase tracking-wider border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'overview'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#888888] hover:text-[#111111]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Overview & KPIs</span>
          </button>

          <button
            onClick={() => setActiveTab('forecasting')}
            className={`py-3 px-2 font-semibold uppercase tracking-wider border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'forecasting'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#888888] hover:text-[#111111]'
            }`}
          >
            {!mlAccess.allowed && <Lock className="w-3.5 h-3.5 text-[#e54000]" />}
            <TrendingUp className="w-4 h-4" />
            <span>ML Revenue Forecasting</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_assistant')}
            className={`py-3 px-2 font-semibold uppercase tracking-wider border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'ai_assistant'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#888888] hover:text-[#111111]'
            }`}
          >
            {!chatHistoryAllowed && <Lock className="w-3.5 h-3.5 text-[#e54000]" />}
            <Bot className="w-4 h-4" />
            <span>AI Data Assistant</span>
          </button>

          <button
            onClick={() => setActiveTab('datasets')}
            className={`py-3 px-2 font-semibold uppercase tracking-wider border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'datasets'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#888888] hover:text-[#111111]'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Datasets ({user.usage.datasetsCount} / {user.plan === 'enterprise' ? '∞' : user.plan === 'pro' ? 3 : 1})</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & KPIS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Top KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-[#e5e3dc] space-y-2">
                <span className="font-mono text-[11px] text-[#888888] uppercase tracking-wider">MONTHLY REVENUE</span>
                <div className="font-display text-3xl font-bold text-[#111111]">₹7,34,500</div>
                <span className="inline-flex items-center text-xs font-mono text-emerald-600">
                  ↑ +12.4% vs last month
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#e5e3dc] space-y-2">
                <span className="font-mono text-[11px] text-[#888888] uppercase tracking-wider">TOTAL TRANSACTIONS</span>
                <div className="font-display text-3xl font-bold text-[#111111]">1,482</div>
                <span className="inline-flex items-center text-xs font-mono text-emerald-600">
                  ↑ +8.1% vs last month
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#e5e3dc] space-y-2">
                <span className="font-mono text-[11px] text-[#888888] uppercase tracking-wider">GROSS PROFIT MARGIN</span>
                <div className="font-display text-3xl font-bold text-[#111111]">42.8%</div>
                <span className="inline-flex items-center text-xs font-mono text-emerald-600">
                  ↑ +3.2% vs target
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#e5e3dc] space-y-2">
                <span className="font-mono text-[11px] text-[#888888] uppercase tracking-wider font-semibold">
                  AI SUMMARY STATUS
                </span>
                <div className="font-sans text-xs text-[#111111] font-medium leading-tight">
                  {user.plan === 'free' ? 'AI Summary Preview Active' : 'Full AI Business Summary Generated'}
                </div>
                <span className="font-mono text-[10px] text-[#e54000] uppercase font-bold block">
                  UPDATED 5 MINS AGO
                </span>
              </div>
            </div>

            {/* AI Summary Section */}
            <div className="bg-white p-6 rounded-2xl border border-[#e5e3dc] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-[#e54000]" />
                  <h2 className="font-display text-lg font-bold text-[#111111]">AI Executive Business Summary</h2>
                </div>
                {user.plan === 'free' && (
                  <span className="font-mono text-[10px] text-[#e54000] uppercase font-bold bg-[#e54000]/10 px-2.5 py-1 rounded">
                    🔒 PREVIEW MODE (50% UNLOCKED)
                  </span>
                )}
              </div>
              <p className="font-sans text-xs sm:text-sm text-[#444444] leading-relaxed">
                Sales channel efficiency increased by 14.8% following Q3 inventory rebalancing. Key revenue growth driven by direct digital orders. Customer acquisition cost (CAC) dropped to ₹320 per order.
              </p>
            </div>

            {/* 50% vs 100% DASHBOARD SECTION */}
            <div className="relative space-y-6">
              {!isFullUnlocked && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm p-6 text-center border-2 border-dashed border-[#e54000] rounded-2xl">
                  <div className="max-w-md space-y-4 bg-white p-8 rounded-xl shadow-2xl border border-[#e5e3dc]">
                    <div className="w-12 h-12 rounded-full bg-[#e54000]/10 text-[#e54000] flex items-center justify-center mx-auto">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-display text-xl font-bold text-[#111111]">🔒 Pro Feature Locked</h3>
                      <p className="font-sans text-xs text-[#666666]">
                        Advanced Profit & Loss breakdown, Product Inventory turnover, and 1-month ML Revenue Forecasting are available with Pro.
                      </p>
                    </div>
                    <button
                      onClick={() => openPaymentModal('pro')}
                      className="w-full py-3.5 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-[#e54000] text-white hover:bg-[#ff4d00] transition-colors shadow-lg shadow-orange-500/20"
                    >
                      Upgrade to Pro
                    </button>
                  </div>
                </div>
              )}

              {/* Profit & Loss Table */}
              <div className={`bg-white p-6 rounded-2xl border border-[#e5e3dc] space-y-4 ${!isFullUnlocked ? 'blur-sm select-none' : ''}`}>
                <div className="flex items-center justify-between border-b border-[#e5e3dc] pb-4">
                  <h2 className="font-display text-lg font-bold text-[#111111]">Profit & Loss Statement Breakdown</h2>
                  <span className="font-mono text-xs text-[#888888]">Q3 2026 AUDITED DATA</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs">
                    <thead>
                      <tr className="border-b border-[#e5e3dc] font-mono text-[#888888] uppercase">
                        <th className="py-2.5 px-3 font-semibold">Category</th>
                        <th className="py-2.5 px-3 font-semibold">Jul 2026</th>
                        <th className="py-2.5 px-3 font-semibold">Aug 2026</th>
                        <th className="py-2.5 px-3 font-semibold">Sep 2026</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Variance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e3dc]">
                      <tr>
                        <td className="py-3 px-3 font-semibold text-[#111111]">Gross Sales Revenue</td>
                        <td className="py-3 px-3">₹6,50,000</td>
                        <td className="py-3 px-3">₹6,90,000</td>
                        <td className="py-3 px-3 font-semibold text-[#111111]">₹7,34,500</td>
                        <td className="py-3 px-3 text-right text-emerald-600 font-mono">+6.4%</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 text-[#666666]">Cost of Goods Sold (COGS)</td>
                        <td className="py-3 px-3 text-[#666666]">₹3,70,000</td>
                        <td className="py-3 px-3 text-[#666666]">₹3,95,000</td>
                        <td className="py-3 px-3 text-[#666666]">₹4,20,000</td>
                        <td className="py-3 px-3 text-right text-[#888888] font-mono">+6.3%</td>
                      </tr>
                      <tr className="bg-[#f9f8f6]">
                        <td className="py-3 px-3 font-bold text-[#111111]">Net Profit Margin</td>
                        <td className="py-3 px-3 font-bold text-[#111111]">₹2,80,000</td>
                        <td className="py-3 px-3 font-bold text-[#111111]">₹2,95,000</td>
                        <td className="py-3 px-3 font-bold text-[#e54000]">₹3,14,500</td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-600 font-mono">+6.6%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ML REVENUE FORECASTING */}
        {activeTab === 'forecasting' && (
          <div className="space-y-6">
            {!mlAccess.allowed ? (
              <div className="bg-white p-10 rounded-2xl border-2 border-dashed border-[#e54000] text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#e54000]/10 text-[#e54000] flex items-center justify-center mx-auto">
                  <Lock className="w-7 h-7" />
                </div>
                <div className="space-y-2 max-w-lg mx-auto">
                  <h2 className="font-display text-2xl font-bold text-[#111111]">🔒 Advanced ML Revenue Forecasting</h2>
                  <p className="font-sans text-xs sm:text-sm text-[#666666]">
                    XGBoost and LightGBM machine learning models predict future revenue trends with 94.2% historical precision. Upgrade to Pro to unlock 1-month forecasts.
                  </p>
                </div>
                <button
                  onClick={() => openPaymentModal('pro')}
                  className="py-3.5 px-6 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-[#e54000] text-white hover:bg-[#ff4d00] transition-colors"
                >
                  Upgrade to Pro
                </button>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-[#e5e3dc] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e3dc] pb-4">
                  <div>
                    <span className="font-mono text-xs text-[#e54000] font-bold uppercase">MODEL ACTIVE: {mlAccess.modelType}</span>
                    <h2 className="font-display text-2xl font-bold text-[#111111]">1-Month Revenue Projection</h2>
                  </div>
                  <span className="font-mono text-xs bg-[#f9f8f6] text-[#111111] px-3 py-1.5 rounded-lg border border-[#e5e3dc]">
                    CONFIDENCE SCORE: 94.2%
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
                  <div className="bg-[#f9f8f6] p-5 rounded-xl border border-[#e5e3dc]">
                    <span className="text-[11px] text-[#888888] uppercase">PROJECTED OCT REVENUE</span>
                    <div className="text-3xl font-bold text-[#111111] mt-1">₹8,42,000</div>
                    <span className="text-xs text-emerald-600">↑ +14.6% growth</span>
                  </div>

                  <div className="bg-[#f9f8f6] p-5 rounded-xl border border-[#e5e3dc]">
                    <span className="text-[11px] text-[#888888] uppercase">SKU VELOCITY ACCELERATION</span>
                    <div className="text-3xl font-bold text-[#111111] mt-1">3.4x</div>
                    <span className="text-xs text-emerald-600">High turnover expected</span>
                  </div>

                  <div className="bg-[#f9f8f6] p-5 rounded-xl border border-[#e5e3dc]">
                    <span className="text-[11px] text-[#888888] uppercase font-semibold">MODEL ALGORITHM</span>
                    <div className="text-2xl font-bold text-[#e54000] mt-1">
                      {user.plan === 'enterprise' ? 'Ensemble (XGBoost + LightGBM)' : 'Gradient Boosted XGBoost'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AI DATA ASSISTANT */}
        {activeTab === 'ai_assistant' && (
          <div className="bg-white rounded-2xl border border-[#e5e3dc] overflow-hidden flex flex-col h-[550px]">
            <div className="p-4 border-b border-[#e5e3dc] bg-[#f9f8f6] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-[#e54000]" />
                <span className="font-display font-bold text-sm text-[#111111]">Interactive AI Data Assistant</span>
              </div>
              {!chatHistoryAllowed ? (
                <span className="font-mono text-[10px] text-[#e54000] bg-[#e54000]/10 px-2 py-0.5 rounded font-bold">
                  🔒 CHAT HISTORY LOCKED (FREE TRIAL)
                </span>
              ) : (
                <span className="font-mono text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                  ✓ CHAT HISTORY UNLOCKED
                </span>
              )}
            </div>

            {/* Chat Output Window */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 font-sans text-xs">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-lg p-4 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-[#111111] text-white rounded-br-none'
                        : 'bg-[#f9f8f6] text-[#111111] border border-[#e5e3dc] rounded-bl-none'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                    <span className="font-mono text-[9px] opacity-60 block text-right mt-1">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendChatMessage} className="p-4 border-t border-[#e5e3dc] bg-white flex items-center gap-3">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask Fold AI about your revenue, inventory, or forecasting..."
                className="flex-1 px-4 py-3 bg-[#f9f8f6] border border-[#e5e3dc] rounded-xl font-sans text-xs focus:outline-none focus:border-[#111111]"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-[#111111] text-white font-mono text-xs font-bold uppercase hover:bg-[#e54000] transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: DATASETS MANAGEMENT */}
        {activeTab === 'datasets' && (
          <div className="bg-white p-8 rounded-2xl border border-[#e5e3dc] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e3dc] pb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-[#111111]">Dataset Ingestion & Management</h2>
                <p className="font-sans text-xs text-[#666666]">
                  Upload CSV, Excel, PDF tables or JSON depending on your active plan permissions.
                </p>
              </div>
              <div className="font-mono text-xs bg-[#f9f8f6] px-3 py-1.5 rounded-lg border border-[#e5e3dc]">
                ALLOWED FORMATS: <span className="font-bold text-[#e54000]">{canUploadFormat(user, 'CSV').supportedFormats.join(', ')}</span>
              </div>
            </div>

            {uploadSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-sans text-xs flex items-center space-x-2">
                <span>{uploadSuccess}</span>
              </div>
            )}

            <form onSubmit={handleDatasetUpload} className="space-y-4 max-w-xl">
              <div className="space-y-2">
                <label className="font-mono text-xs uppercase text-[#888888]">Select File Format</label>
                <div className="grid grid-cols-4 gap-3">
                  {['CSV', 'Excel', 'PDF', 'JSON'].map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setSelectedFormat(fmt)}
                      className={`py-2.5 px-3 rounded-xl font-mono text-xs font-semibold uppercase border transition-all ${
                        selectedFormat === fmt
                          ? 'bg-[#111111] text-white border-[#111111]'
                          : 'bg-[#f9f8f6] text-[#666666] border-[#e5e3dc] hover:border-[#111111]'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-8 border-2 border-dashed border-[#e5e3dc] rounded-2xl text-center space-y-3 bg-[#f9f8f6]">
                <Database className="w-8 h-8 text-[#888888] mx-auto" />
                <div className="font-sans text-xs text-[#666666]">
                  Drag and drop your dataset file here or click below to ingest.
                </div>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="py-3 px-6 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-[#111111] text-white hover:bg-[#e54000] transition-colors disabled:opacity-50"
                >
                  {isUploading ? 'Ingesting Data...' : 'Upload & Process Dataset'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
