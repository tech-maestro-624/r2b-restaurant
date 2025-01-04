import api from "../utils/axios";

export const SubscriptionService = {
    getSubscriptionStatus: (id: string) => {
        console.log(id);
        
        return api.get(`/subscription-status/${id}`);
      }
    }