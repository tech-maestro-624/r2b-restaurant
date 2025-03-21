// Updated src/services/subscription.service.ts
import api from '../utils/axios';

export const SubscriptionService = {
  getSubscriptionStatus: (branchId: string) => {
    const token = localStorage.getItem('authToken');
    return api.get(`/subscription-status?branchId=${branchId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  updateSubscription: (subscriptionId: string, data: any) => {
    const token = localStorage.getItem('authToken');
    return api.put(`/subscription/${subscriptionId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  getAllSubscriptions: () => {
    const token = localStorage.getItem('authToken');
    return api.get(`/subscriptions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  renewSubscription: (branchId: string, amount: number) => {
    const token = localStorage.getItem('authToken');
    return api.post('/renew', { branchId, amount }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  upgradeSubscription: (branchId: string, newSubscriptionId: string, amount: number) => {
    const token = localStorage.getItem('authToken');
    return api.post('/subscription/upgrade', 
      { 
        branchId, 
        newSubscriptionId,
        amount 
      }, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
  purchaseSubscription: (branchId: string, subscriptionId: string, amount: number) => {
    const token = localStorage.getItem('authToken');
    return api.post('/subscription/purchase', 
      { 
        branchId, 
        subscriptionId,
        amount 
      }, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }
};