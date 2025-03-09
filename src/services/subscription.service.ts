import axios from 'axios';

const API_URL = 'http://192.168.1.102:4000/api';

const SubscriptionService = {
  getSubscriptionStatus: (branchId: string) => {
    const token = localStorage.getItem('authToken');
    return axios.get(`${API_URL}/subscription-status?condition=${branchId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

export { SubscriptionService };