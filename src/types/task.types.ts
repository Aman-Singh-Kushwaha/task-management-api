export interface TaskQuery {
  page?: string;
  limit?: string;
  sort?: string;
  status?: 'pending' | 'in-progress' | 'completed';
  search?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface TaskListResponse {
  tasks: any[];
  pagination: PaginationInfo;
}
