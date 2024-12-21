export interface OrderItem {
  _id: string;
  menuItem: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
  variant?: {
    label: string;
    price: number;
  };
  addOns?: {
    name: string;
    price: number;
  }[];
  options?: {
    option: string;
    choice: string;
  }[];
  totalPrice: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    phoneNUmber: string;
    address?: string;
  };
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  tax: number;
  deliveryFee?: number;
  total: number;
  branchId: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type PaymentMethod = 'cash' | 'online';

export interface OrderFilterParams {
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  paymentStatus?: PaymentStatus;
}