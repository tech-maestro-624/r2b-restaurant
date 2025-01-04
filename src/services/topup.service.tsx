import api from "../utils/axios";

export const TopupService = {
    topUp: (data:Object) =>{
       return api.post('/subscription-topup', data)
    }
}