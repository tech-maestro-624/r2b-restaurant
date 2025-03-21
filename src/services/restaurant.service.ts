import api from '../utils/axios';

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface CreateRestaurantDto {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export const restaurantService = {
  getAll: () => api.get<Restaurant[]>('/restaurants-branches'),
  getById: (id: string) => api.get<Restaurant>(`/restaurants/${id}`),
  create: (data: CreateRestaurantDto) => api.post<Restaurant>('/restaurants', data),
  update: (id: string, data: Partial<CreateRestaurantDto>) =>
    api.patch<Restaurant>(`/restaurants/${id}`, data),
  delete: (id: string) => api.delete(`/restaurants/${id}`),
};