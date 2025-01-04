import api from "../utils/axios";

export interface ICoupon {
    _id?: string;
    code: string;
    description?: string;
    discountType: 'Percentage' | 'Amount';
    value: number;
    validFrom?: Date;
    validTo?: Date;
    createdBy: 'Restaurant' | 'Company' | 'Branch';
    restaurant?: string;        // or mongoose.Schema.Types.ObjectId
    branches?: string[];        // or mongoose.Schema.Types.ObjectId[]
    createdAt?: Date;
    updatedAt?: Date;
    minCartValue? : number;
    freeShipping? : boolean;
}

export const Coupons = {
    getAll: async (): Promise<ICoupon[]> => {
        try {
            const response = await api.get<ICoupon[]>('/coupon');
            return response.data.coupons;
        } catch (error) {
            console.error("Error fetching coupons:", error);
            throw error;
        }
    },

    getById: async (id: string): Promise<ICoupon> => {
        try {
            const response = await api.get<ICoupon>(`/coupon/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching coupon with ID ${id}:`, error);
            throw error;
        }
    },

    create: async (coupon: ICoupon): Promise<ICoupon> => {
        try {
            const response = await api.post<ICoupon>('/coupon', coupon);
            return response.data;
        } catch (error) {
            console.error("Error creating coupon:", error);
            throw error;
        }
    },

    update: async (id: string, coupon: Partial<ICoupon>): Promise<ICoupon> => {
        try {
            const response = await api.put<ICoupon>(`/coupon/${id}`, coupon);
            return response.data;
        } catch (error) {
            console.error(`Error updating coupon with ID ${id}:`, error);
            throw error;
        }
    },

    delete: async (id: string): Promise<void> => {
        try {
            await api.delete(`/coupon/${id}`);
        } catch (error) {
            console.error(`Error deleting coupon with ID ${id}:`, error);
            throw error;
        }
    }
};