export interface Category {
    _id: string;
    name: string;
    isGlobal: string;
  }

  export interface CreateCategory {
    name: string;
    isGlobal: boolean;
    branch : string;
  }
  