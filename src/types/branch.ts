export interface Branch {
  _id: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBranchDto {
  name: string;
  address: string;
  phone: string;
}

export interface BranchResponse {
  branches: Branch[];
  total: number;
  page: number;
  totalPages: number;
}