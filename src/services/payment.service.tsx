import api from "../utils/axios";

export const PaymentService = {
    verifyPayment: (paymentData: any, endpoint: string = '/subscription-topup-verify') => {
        console.log(`Verifying payment at endpoint: ${endpoint}`, paymentData);
        const token = localStorage.getItem('authToken');
        return api.post(endpoint, paymentData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    }