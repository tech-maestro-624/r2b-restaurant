import { OrderStatus } from '../../../types/order';

type StatusColor = 'default' | 'primary' | 'warning' | 'success' | 'error';

export const getStatusColor = (status: OrderStatus): StatusColor => {
  const statusColors: Record<OrderStatus, StatusColor> = {
    pending: 'warning',
    confirmed: 'primary',
    preparing: 'warning',
    ready: 'success',
    delivered: 'success',
    cancelled: 'error',
  };
  
  return statusColors[status];
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};