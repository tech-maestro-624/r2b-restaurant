import api from '../utils/axios';
import { MenuItem, CreateMenuItemDto, MenuCategory, CreateCategoryDto } from '../types/menu';

interface CategoriesResponse {
  categories: MenuCategory[];
}

export const menuService = {
  // Menu Items
  getAllItems: (branchId: string) => 
    api.get<MenuItem[]>(`/food-items/${branchId}`),
  
  getItemById: (branchId: string, id: string) =>
    api.get<MenuItem>(`/food-items/${branchId}/${id}`),
  
  createItem: (data: CreateMenuItemDto) =>
    api.post<MenuItem>(`/food-items/${data.branchId}`, data),
  
  updateItem: (id: string, data: Partial<CreateMenuItemDto>) =>
    api.put<MenuItem>(`/food-items/${id}`, {
      ...data,
      branchId: undefined // Remove branchId from payload since it's in URL
    }),
  
  deleteItem: (branchId: string, id: string) =>
    api.delete(`/food-items/${id}`,{params : {branchId}}),
  
  toggleAvailability: (branchId: string, id: string, isAvailable: boolean) =>
    api.put<MenuItem>(`/food-items/${id}`, { isAvailable },{params : {branchId}}),

  // Categories
  getAllCategories: (branchId : string) =>
    api.get<CategoriesResponse>('/categories',{params : {condition : {$or : [{branch : branchId},{isGlobal : true}]}}}),
  
  createCategory: (data: CreateCategoryDto) =>
    api.post<MenuCategory>('/category', data),
  
  updateCategory: (id: string, data: Partial<CreateCategoryDto>) =>
    api.patch<MenuCategory>(`/categories/${id}`, data),
  
  deleteCategory: (id: string) =>
    api.delete(`/categories/${id}`),
};