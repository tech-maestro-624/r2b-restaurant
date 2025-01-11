import api from '../utils/axios';
import { Order, OrderFilterParams } from '../types/order';

interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
}

export const orderService = {
  getAll: (branchId: string, filters?: OrderFilterParams, page = 1, limit = 10) =>{
    console.log(filters);
    
  return  api.get<OrdersResponse>(`/orders/${branchId}`, {
      params: {  page,
        limit,condition : {
        ...filters,
      }},
    })},

  getById: ( orderId: string) =>
    api.get<Order>(`/order/${orderId}`),

  updateStatus: ( orderId: string, status: Order['status']) =>
    api.put<Order>(`/order/${orderId}/status`, { status }),

  updatePaymentStatus: (branchId: string, orderId: string, paymentStatus: Order['paymentStatus']) =>
    api.patch<Order>(`/orders/${branchId}/${orderId}/payment`, { paymentStatus }),
};