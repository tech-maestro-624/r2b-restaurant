import api from '../utils/axios';
import { Category,CreateCategory } from '../types/category';

interface CategoryResponse {
  data : {};
}

export const categoryService = {
  getAll: (page = 1, limit = 10) => 
    api.get<CategoryResponse>('/categories', {
      params: {
        page,
        limit,
      }
    }),
  
  create: (data: CreateCategory) =>
    api.post<Category>('/category', data),

};