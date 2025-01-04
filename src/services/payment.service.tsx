import api from "../utils/axios";

export const PaymentService = {
    verifyPayment: (data:Object) =>{
        console.log(data);
        
       return api.post('/subscription-topup-verify', data)
    }
}