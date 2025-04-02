export interface Todo {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    createdAt: Date;
    dueDate?: Date;
    imageUrl?: string;
    userId: string;
    priority: 'low' | 'medium' | 'high';
    category?: string;
  }

  export type TodoInput = Omit<Todo, 'id' | 'createdAt' | 'userId'> & {
    createdAt?: Date;
    userId?: string;
  };

  export interface TodoFilter {
    completed?: boolean;
    priority?: 'low' | 'medium' | 'high';
    category?: string;
    searchQuery?: string;
  }