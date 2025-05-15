import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { authService } from '../services/api';

/**
 * Custom hook for todo operations
 * Provides methods to fetch, create, update and delete todos
 */
export const useTodos = () => {
  const queryClient = useQueryClient();
  
  // Get all todos
  const { data: todos = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      try {
        const response = await authService.getTodos();
        return response.data || [];
      } catch (error) {
        console.error('Error fetching todos:', error);
        throw error;
      }
    }
  });
  
  // Create a new todo
  const createMutation = useMutation({
    mutationFn: (todoData) => authService.createTodo(todoData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success('Todo created successfully!');
    },
    onError: (error) => {
      console.error('Error creating todo:', error);
      toast.error(error.response?.data?.message || 'Failed to create todo');
    }
  });
  
  // Update an existing todo
  const updateMutation = useMutation({
    mutationFn: ({ id, todoData }) => authService.updateTodo(id, todoData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success('Todo updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating todo:', error);
      toast.error(error.response?.data?.message || 'Failed to update todo');
    }
  });
  
  // Delete a todo
  const deleteMutation = useMutation({
    mutationFn: (id) => authService.deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success('Todo deleted successfully!');
    },
    onError: (error) => {
      console.error('Error deleting todo:', error);
      toast.error(error.response?.data?.message || 'Failed to delete todo');
    }
  });
  
  // Mark todo as complete or incomplete
  const toggleCompleteMutation = useMutation({
    mutationFn: ({ id, completed }) => authService.updateTodo(id, { completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success('Todo status updated!');
    },
    onError: (error) => {
      console.error('Error updating todo status:', error);
      toast.error(error.response?.data?.message || 'Failed to update todo status');
    }
  });
  
  return {
    todos,
    isLoading,
    isError,
    error,
    refetch,
    createTodo: createMutation.mutate,
    updateTodo: updateMutation.mutate,
    deleteTodo: deleteMutation.mutate,
    toggleComplete: toggleCompleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isTogglingComplete: toggleCompleteMutation.isPending,
  };
}; 