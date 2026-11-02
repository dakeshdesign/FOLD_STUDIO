export type PlanId = 'free' | 'pro' | 'enterprise';
export type BillingPeriod = 'monthly' | 'yearly';
export type CurrencyCode = 'INR';

export interface PlanFeature {
  text: string;
  included: boolean;
  isHighlight?: boolean;
  lockedBadge?: boolean;
}

export interface SubscriptionPlanConfig {
  planId: PlanId;
  name: string;
  badge?: string;
  isPopular?: boolean;
  tagline: string;
  prices: {
    monthly: number; // in INR
    yearly: number;  // in INR total per year
  };
  yearlyDiscountPercent: number;
  currency: {
    code: CurrencyCode;
    symbol: string;
  };
  ctaText: {
    monthly: string;
    yearly: string;
    enterpriseText?: string;
  };
  limits: {
    maxDatasets: number; // -1 or Infinity for unlimited
    maxUploadFiles: number;
    supportedFormats: string[];
    maxAiQueriesPerMonth: number;
    maxPdfReportsPerMonth: number;
    maxForecastsPerMonth: number;
  };
  dashboardPermission: '50%_preview' | '100%_full' | 'advanced_custom';
  forecastingPermission: 'none' | 'xgboost_1mo' | 'ensemble_xgboost_lightgbm';
  aiPermissions: {
    summaryReport: 'preview' | 'full' | 'executive';
    assistant: 'none' | 'unlocked' | 'advanced';
    chatHistoryUnlocked: boolean;
  };
  reportPermissions: 'preview' | 'high_res_pdf' | 'custom_whitelabel';
  supportLevel: 'Standard customer support' | 'Priority customer support' | 'Enterprise-level 24/7 support';
  features: PlanFeature[];
}

export interface SubscriptionConfig {
  currency: {
    code: CurrencyCode;
    symbol: string;
  };
  yearlyDiscountNotice: string;
  plans: Record<PlanId, SubscriptionPlanConfig>;
}

export const SUBSCRIPTION_CONFIG: SubscriptionConfig = {
  currency: {
    code: 'INR',
    symbol: '₹',
  },
  yearlyDiscountNotice: 'Save 20%',
  plans: {
    free: {
      planId: 'free',
      name: 'Free Trial',
      tagline: 'Essential preview for small datasets and quick KPI lookups.',
      prices: {
        monthly: 0,
        yearly: 0,
      },
      yearlyDiscountPercent: 0,
      currency: {
        code: 'INR',
        symbol: '₹',
      },
      ctaText: {
        monthly: 'Continue with Free Trial',
        yearly: 'Continue with Free Trial',
      },
      limits: {
        maxDatasets: 1,
        maxUploadFiles: 1,
        supportedFormats: ['CSV'],
        maxAiQueriesPerMonth: 5,
        maxPdfReportsPerMonth: 0,
        maxForecastsPerMonth: 0,
      },
      dashboardPermission: '50%_preview',
      forecastingPermission: 'none',
      aiPermissions: {
        summaryReport: 'preview',
        assistant: 'none',
        chatHistoryUnlocked: false,
      },
      reportPermissions: 'preview',
      supportLevel: 'Standard customer support',
      features: [
        { text: '1 dataset', included: true },
        { text: 'CSV file format only', included: true },
        { text: '50% dashboard preview', included: true },
        { text: 'Basic KPI overview metrics', included: true },
        { text: 'AI summary preview', included: true },
        { text: 'AI chat history locked', included: false, lockedBadge: true },
        { text: 'ML revenue forecasting locked', included: false, lockedBadge: true },
        { text: 'High-res PDF downloads locked', included: false, lockedBadge: true },
        { text: 'Standard customer support', included: true },
      ],
    },
    pro: {
      planId: 'pro',
      name: 'Pro',
      badge: 'RECOMMENDED',
      isPopular: true,
      tagline: 'Complete analytics, ML forecasting, and interactive AI for growing businesses.',
      prices: {
        monthly: 1499,
        yearly: 14390, // ~20% off (1499 * 12 * 0.8 = ~14390)
      },
      yearlyDiscountPercent: 20,
      currency: {
        code: 'INR',
        symbol: '₹',
      },
      ctaText: {
        monthly: 'Upgrade to Pro',
        yearly: 'Upgrade to Pro (Save 20%)',
      },
      limits: {
        maxDatasets: 3,
        maxUploadFiles: 3,
        supportedFormats: ['CSV', 'Excel (.xlsx)'],
        maxAiQueriesPerMonth: 50,
        maxPdfReportsPerMonth: 10,
        maxForecastsPerMonth: 10,
      },
      dashboardPermission: '100%_full',
      forecastingPermission: 'xgboost_1mo',
      aiPermissions: {
        summaryReport: 'full',
        assistant: 'unlocked',
        chatHistoryUnlocked: true,
      },
      reportPermissions: 'high_res_pdf',
      supportLevel: 'Priority customer support',
      features: [
        { text: 'Up to 3 datasets', included: true, isHighlight: true },
        { text: 'Up to 3 dataset files', included: true },
        { text: 'CSV & Excel (.xlsx) support', included: true },
        { text: '100% full dashboard unlocked', included: true, isHighlight: true },
        { text: 'Full KPI metrics & Profit & Loss table', included: true },
        { text: '1-month ML revenue forecasting (XGBoost)', included: true, isHighlight: true },
        { text: 'Product-wise inventory analysis', included: true },
        { text: 'Fully generated AI business summary report', included: true },
        { text: 'Interactive AI data assistant', included: true },
        { text: 'AI chatbot & chat history unlocked', included: true, isHighlight: true },
        { text: 'High-resolution PDF report downloads', included: true },
        { text: 'Priority customer support', included: true },
      ],
    },
    enterprise: {
      planId: 'enterprise',
      name: 'Enterprise',
      badge: 'CUSTOM',
      tagline: 'Unlimited power, ensemble ML, custom filters, and 24/7 dedicated support.',
      prices: {
        monthly: 4999,
        yearly: 47990,
      },
      yearlyDiscountPercent: 20,
      currency: {
        code: 'INR',
        symbol: '₹',
      },
      ctaText: {
        monthly: 'Contact Sales / Get Started',
        yearly: 'Contact Sales / Get Started',
        enterpriseText: 'Contact Sales',
      },
      limits: {
        maxDatasets: 9999, // Unlimited
        maxUploadFiles: 9999,
        supportedFormats: ['CSV', 'Excel (.xlsx)', 'PDF tables', 'JSON'],
        maxAiQueriesPerMonth: 9999,
        maxPdfReportsPerMonth: 9999,
        maxForecastsPerMonth: 9999,
      },
      dashboardPermission: 'advanced_custom',
      forecastingPermission: 'ensemble_xgboost_lightgbm',
      aiPermissions: {
        summaryReport: 'executive',
        assistant: 'advanced',
        chatHistoryUnlocked: true,
      },
      reportPermissions: 'custom_whitelabel',
      supportLevel: 'Enterprise-level 24/7 support',
      features: [
        { text: 'Unlimited datasets & file uploads', included: true, isHighlight: true },
        { text: 'CSV, Excel, PDF tables, JSON support', included: true },
        { text: 'Advanced interactive dashboard with custom filters', included: true },
        { text: 'Ensemble ML forecasting (XGBoost + LightGBM)', included: true, isHighlight: true },
        { text: 'AI executive briefing & Advanced AI assistant', included: true },
        { text: 'Advanced analytics & custom integrations', included: true },
        { text: 'Enterprise-level 24/7 support', included: true },
      ],
    },
  },
};
