import { SUBSCRIPTION_CONFIG, PlanId, SubscriptionPlanConfig } from '../config/subscriptionConfig';

export interface UserSubscriptionState {
  plan: PlanId;
  subscription_status: 'active' | 'trialing' | 'canceled' | 'past_due' | 'expired';
  subscription_id?: string;
  payment_provider?: 'razorpay' | 'phonepe' | 'none';
  billing_cycle: 'monthly' | 'yearly';
  subscription_start: string;
  subscription_end: string;
  next_billing_date: string;
  payment_customer_id?: string;
  amount_paid: number;
  usage: {
    datasetsCount: number;
    aiQueriesCount: number;
    pdfReportsCount: number;
    forecastsCount: number;
  };
}

export const DEFAULT_USER_SUBSCRIPTION: UserSubscriptionState = {
  plan: 'free',
  subscription_status: 'active',
  subscription_id: 'sub_free_trial_default',
  payment_provider: 'none',
  billing_cycle: 'monthly',
  subscription_start: new Date().toISOString().split('T')[0],
  subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  next_billing_date: 'N/A (Free Trial)',
  payment_customer_id: 'cust_free_001',
  amount_paid: 0,
  usage: {
    datasetsCount: 1,
    aiQueriesCount: 2,
    pdfReportsCount: 0,
    forecastsCount: 0,
  },
};

export const getPlanConfig = (planId: PlanId): SubscriptionPlanConfig => {
  return SUBSCRIPTION_CONFIG.plans[planId] || SUBSCRIPTION_CONFIG.plans.free;
};

export const canCreateDataset = (userState: UserSubscriptionState): { allowed: boolean; max: number; current: number } => {
  const plan = getPlanConfig(userState.plan);
  const max = plan.limits.maxDatasets;
  const current = userState.usage.datasetsCount;

  if (max >= 9999) {
    return { allowed: true, max: -1, current };
  }
  return { allowed: current < max, max, current };
};

export const canUploadFormat = (userState: UserSubscriptionState, formatExtension: string): { allowed: boolean; supportedFormats: string[] } => {
  const plan = getPlanConfig(userState.plan);
  const ext = formatExtension.replace('.', '').toUpperCase();
  const allowed = plan.limits.supportedFormats.some((fmt) => fmt.toUpperCase().includes(ext));
  return { allowed, supportedFormats: plan.limits.supportedFormats };
};

export const isDashboardFullyUnlocked = (planId: PlanId): boolean => {
  return planId === 'pro' || planId === 'enterprise';
};

export const canAccessMLForecasting = (planId: PlanId): { allowed: boolean; modelType: string } => {
  if (planId === 'enterprise') {
    return { allowed: true, modelType: 'Ensemble ML (XGBoost + LightGBM)' };
  }
  if (planId === 'pro') {
    return { allowed: true, modelType: '1-Month XGBoost ML' };
  }
  return { allowed: false, modelType: 'Locked (Requires Pro)' };
};

export const canAccessAIChatHistory = (planId: PlanId): boolean => {
  return planId === 'pro' || planId === 'enterprise';
};

export const canDownloadPDFReports = (planId: PlanId): boolean => {
  return planId === 'pro' || planId === 'enterprise';
};

export const getUsageDisplay = (current: number, max: number): string => {
  if (max >= 9999 || max === -1) {
    return 'Unlimited';
  }
  return `${current} / ${max}`;
};
