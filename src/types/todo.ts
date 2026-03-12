export interface TodoItem {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string | null;
  completed?: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export type FilterType = 'all' | 'active' | 'completed';
