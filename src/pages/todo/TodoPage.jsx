import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, CircularProgress, Fab, useTheme, Alert } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import { todoService } from '../../services/api';
import TodoList from '../../components/Todo/TodoList';
import TodoForm from '../../components/Todo/TodoForm';

const TodoPage = () => {
  const theme = useTheme();
  const [formOpen, setFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [showCalendarInfo, setShowCalendarInfo] = useState(true);
  
  const { data: todos, isLoading, isError, refetch } = useQuery({
    queryKey: ['todos'],
    queryFn: todoService.getAllTodos,
  });
  
  useEffect(() => {
    if (isError) {
      toast.error('Failed to load todos');
    }
  }, [isError]);
  
  const handleOpenForm = () => {
    setEditingTodo(null);
    setFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingTodo(null);
  };
  
  const handleEditTodo = (todo) => {
    setEditingTodo(todo);
    setFormOpen(true);
  };
  
  const handleSuccess = () => {
    refetch();
  };
  
  return (
    <Box sx={{ position: 'relative', minHeight: 'calc(100vh - 64px)' }}>
      {showCalendarInfo && (
        <Alert 
          severity="info" 
          sx={{ mb: 2 }}
          onClose={() => setShowCalendarInfo(false)}
        >
          To add tasks to Google Calendar, you need to connect your Google account. Ask your administrator to set this up.
        </Alert>
      )}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 2, 
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            My Tasks
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenForm}
            sx={{ 
              bgcolor: '#61dafb',
              '&:hover': { bgcolor: '#21a8cb' },
            }}
          >
            Add Task
          </Button>
        </Box>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TodoList 
            todos={todos || []} 
            onEdit={handleEditTodo} 
            onRefresh={refetch} 
          />
        )}
      </Paper>
      
      <TodoForm 
        open={formOpen} 
        handleClose={handleCloseForm} 
        editingTodo={editingTodo}
        onSuccess={handleSuccess}
      />
      
      <Fab 
        color="primary" 
        aria-label="add" 
        sx={{ 
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: '#61dafb',
          '&:hover': { bgcolor: '#21a8cb' },
        }}
        onClick={handleOpenForm}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default TodoPage; 