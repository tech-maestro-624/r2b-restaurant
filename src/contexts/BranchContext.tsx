import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Branch } from '../types/branch';
import { branchService } from '../services/branch.service';
import { useAuth } from './AuthContext';

interface BranchContextType {
  selectedBranch: Branch | '';
  setSelectedBranch: (branch: Branch | null) => void;
  branches: Branch[];
  isLoading: boolean;
}

const BranchContext = createContext<BranchContextType | null>(null);

const BRANCH_STORAGE_KEY = 'selected_branch';

export const BranchProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(() => {
    const stored = localStorage.getItem(BRANCH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const { data: branchData, isLoading } = useQuery({
    queryKey: ['branches', user?._id],
    queryFn: () => branchService.getAll().then((res) => res.data),
    enabled: !!user,
  });

  useEffect(() => {
    if (branchData?.branches && !selectedBranch) {
      const firstBranch = branchData.branches[0];
      if (firstBranch) {
        setSelectedBranch(firstBranch);
        localStorage.setItem(BRANCH_STORAGE_KEY, JSON.stringify(firstBranch));
      }
    }
  }, [branchData, selectedBranch]);

  useEffect(() => {
    if (selectedBranch) {
      localStorage.setItem(BRANCH_STORAGE_KEY, JSON.stringify(selectedBranch));
    } else {
      localStorage.removeItem(BRANCH_STORAGE_KEY);
    }
  }, [selectedBranch]);

  return (
    <BranchContext.Provider 
      value={{ 
        selectedBranch, 
        setSelectedBranch, 
        branches: branchData?.branches || [],
        isLoading 
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