'use client';

import { Purchases } from '@revenuecat/purchases-js';

const KEY = 'nemorra.revenuecat.user.v1';
const ENTITLEMENT = 'pro';
let configured: ReturnType<typeof Purchases.configure> | null = null;

function getAppUserId() {
  try {
    const existing = localStorage.getItem(KEY);
    if (existing) return existing;
    const id = Purchases.generateRevenueCatAnonymousAppUserId();
    localStorage.setItem(KEY, id);
    return id;
  } catch {
    return Purchases.generateRevenueCatAnonymousAppUserId();
  }
}

export function getRevenueCat() {
  if (typeof window === 'undefined') return null;
  const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_WEB_API_KEY;
  if (!apiKey) return null;
  if (!configured) configured = Purchases.configure({ apiKey, appUserId: getAppUserId() });
  return configured;
}

export async function getSubscriptionState() {
  const purchases = getRevenueCat();
  if (!purchases) return { configured: false, isPro: false, customerInfo: null, offerings: null };
  try {
    const [customerInfo, offerings] = await Promise.all([purchases.getCustomerInfo(), purchases.getOfferings()]);
    return {
      configured: true,
      isPro: Object.prototype.hasOwnProperty.call(customerInfo.entitlements.active, ENTITLEMENT),
      customerInfo,
      offerings,
    };
  } catch {
    return { configured: true, isPro: false, customerInfo: null, offerings: null };
  }
}

export async function purchasePro() {
  const purchases = getRevenueCat();
  if (!purchases) throw new Error('RevenueCat is not configured yet.');
  const offerings = await purchases.getOfferings();
  const pkg = offerings.current?.availablePackages?.[0];
  if (!pkg) throw new Error('No subscription offering is configured yet in RevenueCat.');
  const result = await purchases.purchase({ rcPackage: pkg });
  return {
    isPro: Object.prototype.hasOwnProperty.call(result.customerInfo.entitlements.active, ENTITLEMENT),
    customerInfo: result.customerInfo,
  };
}

export { ENTITLEMENT };
