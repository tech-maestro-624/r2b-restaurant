import api from "../utils/axios";

export const PaymentService = {
    verifyPayment: (paymentData: any, endpoint: string = '/subscription-topup-verify') => {
      const token = localStorage.getItem('authToken');
      return api.post(endpoint, paymentData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  };