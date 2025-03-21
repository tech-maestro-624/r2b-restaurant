import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Branch } from '../types/branch';
import { branchService } from '../services/branch.service';
import { useAuth } from './AuthContext';

interface BranchContextType {
  selectedBranch: Branch | null;
  setSelectedBranch: (branch: Branch | null) => void;
  branches: Branch[];
  isLoading: boolean;
  resetBranchState: () => void;
}

const BranchContext = createContext<BranchContextType | null>(null);

const BRANCH_STORAGE_KEY = 'selected_branch';
const USER_ID_KEY = 'branch_user_id';

export const BranchProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  console.log('user',user);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const queryClient = useQueryClient();
  const previousUserId = useRef<string | null>(null);
  
  // Function to completely reset branch state
  const resetBranchState = () => {
    setSelectedBranch(null);
    localStorage.removeItem(BRANCH_STORAGE_KEY);
    localStorage.removeItem(USER_ID_KEY);
    queryClient.removeQueries(['branches']);
    console.log('Branch state reset completely');
  };

  // Query for branches with proper dependencies and reset on user change
  const { data: branchData, isLoading } = useQuery({
    queryKey: ['branches', user?._id],
    queryFn: () => branchService.getAll().then((res) => res.data),
    enabled: !!user,
    staleTime: 300000, // 5 minutes
    onError: () => {
      // Clear branch data on error
      resetBranchState();
    }
  });

  // Handle user changes (logout or different user login)
  useEffect(() => {
    if (!user) {
      // User logged out
      resetBranchState();
      return;
    }

    // Check if user ID changed (different user logged in)
    const storedUserId = localStorage.getItem(USER_ID_KEY);
    if (storedUserId && storedUserId !== user._id) {
      console.log('User changed, resetting branch state');
      resetBranchState();
    }
    
    // Update stored user ID
    localStorage.setItem(USER_ID_KEY, user._id);
    previousUserId.current = user._id;
    
  }, [user]);

  // Load selected branch from localStorage only when user is logged in
  // with additional validation to ensure branches belong to current user
  useEffect(() => {
    if (user) {
      try {
        const stored = localStorage.getItem(BRANCH_STORAGE_KEY);
        const storedUserId = localStorage.getItem(USER_ID_KEY);
        
        // Only load if the stored branch belongs to current user
        if (stored && storedUserId === user._id) {
          const parsedBranch = JSON.parse(stored);
          setSelectedBranch(parsedBranch);
        } else if (stored) {
          // Branch from different user - clear it
          console.log('Branch from different user detected, clearing');
          localStorage.removeItem(BRANCH_STORAGE_KEY);
          setSelectedBranch(null);
        }
      } catch (error) {
        console.error('Error parsing stored branch:', error);
        localStorage.removeItem(BRANCH_STORAGE_KEY);
      }
    } else {
      // No user - clear branch state
      resetBranchState();
    }
  }, [user]);

  // Update localStorage when selected branch changes
  useEffect(() => {
    if (selectedBranch && user) {
      localStorage.setItem(BRANCH_STORAGE_KEY, JSON.stringify(selectedBranch));
      localStorage.setItem(USER_ID_KEY, user._id);
    } else if (!selectedBranch) {
      localStorage.removeItem(BRANCH_STORAGE_KEY);
    }
  }, [selectedBranch, user]);

  // Reset branches when component unmounts
  useEffect(() => {
    return () => {
      if (!user) {
        resetBranchState();
      }
    };
  }, []);

  return (
    <BranchContext.Provider 
      value={{ 
        selectedBranch, 
        setSelectedBranch, 
        branches: branchData?.branches || [],
        isLoading,
        resetBranchState
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
};