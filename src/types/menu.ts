export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  category: string;
  price?: number;
  image: string;
  isAvailable: boolean;
  dishType: 'veg' | 'non-veg';
  taxSlab: number;
  branchId: string;
  hasVariants: boolean;
  variants?: {
    label: string;
    price: number;
    attributes: {
      servingSize?: number;
      volume?: string;
      quantity?: number;
    };
  }[];
  options?: {
    option: string;
    choices: string[];
  }[];
  addOns?: {
    name: string;
    price: number;
  }[];
  created_at: string;
  updated_at: string;
}

export interface CreateMenuItemDto {
  name: string;
  description: string;
  category: string;
  price?: number;
  image: string;
  dishType: 'veg' | 'non-veg';
  taxSlab: number;
  branchId: string;
  hasVariants: boolean;
  variants?: {
    label: string;
    price: number;
    attributes: {
      servingSize?: number;
      volume?: string;
      quantity?: number;
    };
  }[];
  options?: {
    option: string;
    choices: string[];
  }[];
  addOns?: {
    name: string;
    price: number;
  }[];
}

export interface MenuCategory {
  _id: string;
  name: string;
  description?: string;
  isGlobal : boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryDto {
  name: string;
  isGlobal : boolean;
  branch : string;
  description?: string;
}