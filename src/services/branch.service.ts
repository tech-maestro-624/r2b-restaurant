import api from '../utils/axios';
import { Branch, CreateBranchDto } from '../types/branch';

interface BranchResponse {
  branches: Branch[];
  total: number;
  page: number;
  totalPages: number;
}

const user = JSON.parse(localStorage.getItem('restaurant_admin_user') || '{}');
const resturant = JSON.parse(localStorage.getItem('selected_branch') || '{}');


export const branchService = {
  getAll: (page = 1, limit = 10) => 
    api.get<BranchResponse>('/branches', {
      params: {
        page,
        limit,
        condition: { ownerId: user?._id }
      }
    }),
  
  getById: (id: string) =>
    api.get<Branch>(`/branches/${id}`),
  
  create: (data: CreateBranchDto) =>{
    let updated = {
      ...data, 
      restaurant : resturant.restaurant._id
    }
    api.post<Branch>('/branch', updated)},
  
  update: (id: string, data: Partial<CreateBranchDto>) =>{
    console.log(id, data);
    
    api.put<Branch>(`/branch/${id}`, data)},
  
  delete: (id: string) =>
    api.delete(`/branches/${id}`),

  getStats: (id: string) => {
    console.log(id);
    return api.get(`/branch-stats/${id}`);
  },

  getBalance: (id: string) => {
    return api.get(`/branch-balance/${id}`);
  }
  
};