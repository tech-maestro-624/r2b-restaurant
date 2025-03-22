import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Branch } from '../types/branch';
import { branchService } from '../services/branch.service';
import { useAuth } from './AuthContext';

interface BranchContextType {
  selectedBranch: Branch | null;
  setSelectedBranch: (branch: Branch | null) => void;
  branches: Branch[];
  isLoading: boolean;
}

const BranchContext = createContext<BranchContextType | null>(null);

export const BranchProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  // When the user changes, load the branch stored for that specific user.
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`selected_branch_${user._id}`);
      if (stored) {
        setSelectedBranch(JSON.parse(stored));
      } else {
        setSelectedBranch(null);
      }
    } else {
      // Clear selection when no user is present.
      setSelectedBranch(null);
    }
  }, [user]);

  const { data: branchData, isLoading } = useQuery({
    queryKey: ['branches', user?._id],
    queryFn: () => branchService.getAll().then((res) => res.data),
    enabled: !!user,
  });

  // If no branch is selected, automatically choose the first available branch.
  useEffect(() => {
    if (branchData?.branches && !selectedBranch) {
      const firstBranch = branchData.branches[0];
      if (firstBranch) {
        setSelectedBranch(firstBranch);
        if (user) {
          localStorage.setItem(`selected_branch_${user._id}`, JSON.stringify(firstBranch));
        }
      }
    }
  }, [branchData, selectedBranch, user]);

  // Keep the local storage in sync with the current selection.
  useEffect(() => {
    if (user) {
      if (selectedBranch) {
        localStorage.setItem(`selected_branch_${user._id}`, JSON.stringify(selectedBranch));
      } else {
        localStorage.removeItem(`selected_branch_${user._id}`);
      }
    }
  }, [selectedBranch, user]);

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
