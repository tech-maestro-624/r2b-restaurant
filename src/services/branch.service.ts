import api from '../utils/axios';
import { Branch, CreateBranchDto } from '../types/branch';

interface BranchResponse {
  branches: Branch[];
  total: number;
  page: number;
  totalPages: number;
}

const user = JSON.parse(localStorage.getItem('restaurant_admin_user') || '{}');
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
  
  create: (data: CreateBranchDto) =>
    api.post<Branch>('/branches', data),
  
  update: (id: string, data: Partial<CreateBranchDto>) =>
    api.patch<Branch>(`/branches/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/branches/${id}`),
};