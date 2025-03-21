import api from '../utils/axios';
import { Branch, CreateBranchDto } from '../types/branch';

interface BranchResponse {
  branches: Branch[];
  total: number;
  page: number;
  totalPages: number;
}

// Remove static caching and global variables
export const branchService = {
  // Get current user without caching
  getCurrentUser: async () => {
    try {
      // Get authToken from localStorage
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        console.error('No auth token found in localStorage');
        return null;
      }
      
      // Always fetch fresh user data
      const response = await api.get('/auth/me');
      console.log('Fresh user data fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  },
  
  getAll: async (page = 1, limit = 99) => {
    try {
      // Always get fresh user data
      const userData = await branchService.getCurrentUser();
      
      if (!userData || !userData.user || !userData.user._id) {
        throw new Error('Unable to fetch valid user data');
      }
      
      const userId = userData.user._id;
      console.log('Using user ID to fetch branches:', userId);
      
      // Now use the user ID to fetch branches
      return api.get<BranchResponse>('/admin/branches', {
        params: {
          page,
          limit,
          condition: { ownerId: userId }
        }
      });
    } catch (error) {
      console.error('Error in getAll branches:', error);
      throw error;
    }
  },
  
  getByPhoneNumber: (phoneNumber: string) => {
    return api.get(`/branch/${phoneNumber}`);
  },

  getById: (id: string) => {
    return api.get<Branch>(`/branches/${id}`);
  },
  
  create: async (data: CreateBranchDto) => {
    try {
      // Get current restaurant from localStorage at function call time, not module load time
      const resturantData = localStorage.getItem('selected_branch');
      
      if (!resturantData) {
        throw new Error('No restaurant selected');
      }
      
      const resturant = JSON.parse(resturantData);
      
      if (!resturant || !resturant.restaurant || !resturant.restaurant._id) {
        throw new Error('Invalid restaurant data');
      }
      
      const updated = {
        ...data, 
        restaurant: resturant.restaurant._id
      };
      
      return api.post<Branch>('/branch', updated);
    } catch (error) {
      console.error('Error creating branch:', error);
      throw error;
    }
  },
  
  update: (id: string, data: Partial<CreateBranchDto>) => {
    return api.put<Branch>(`/branch/${id}`, data);
  },
  
  delete: (id: string) => {
    return api.delete(`/branch/${id}`);
  },

  getStats: (id: string) => {
    console.log('Getting stats for branch:', id);
    return api.get(`/branch-stats/${id}`);
  },

  getBalance: (id: string) => {
    return api.get(`/branch-balance/${id}`);
  },
  
  // Add a method to reset any internal state if needed
  resetState: () => {
    // No cached state to reset in this implementation
    console.log('Branch service state reset');
  }
};