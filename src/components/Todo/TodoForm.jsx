import React, { useState, useEffect, useRef } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, FormControlLabel, Checkbox } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { todoService } from '../../services/api';

const TodoForm = ({ open, handleClose, editingTodo, onSuccess }) => {
  const isEditing = Boolean(editingTodo);
  const [formValues, setFormValues] = useState({
    title: '',
    description: '',
    due_date: '',
    completed: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const dueDateRef = useRef(null);
  
  useEffect(() => {
    if (editingTodo) {
      setFormValues({
        title: editingTodo.title || '',
        description: editingTodo.description || '',
        due_date: editingTodo.due_date ? editingTodo.due_date.slice(0, 16) : '',
        completed: editingTodo.completed || false
      });
    } else {
      setFormValues({
        title: '',
        description: '',
        due_date: '',
        completed: false
      });
    }
  }, [editingTodo, open]);
  
  const handleInputChange = (field, value) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get latest input values directly from DOM
    const currentTitle = titleRef.current.value;
    const currentDescription = descriptionRef.current.value;
    const currentDueDate = dueDateRef.current.value;
    
    const submissionValues = {
      title: currentTitle,
      description: currentDescription,
      due_date: currentDueDate ? new Date(currentDueDate).toISOString() : null,
      completed: formValues.completed
    };
    
    if (!submissionValues.title) {
      setErrors({ title: 'Title is required' });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (isEditing) {
        await todoService.updateTodo(editingTodo.id, submissionValues);
        toast.success('Todo updated successfully');
      } else {
        await todoService.createTodo(submissionValues);
        toast.success('Todo created successfully');
      }
      
      resetForm();
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error saving todo:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} todo`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setFormValues({
      title: '',
      description: '',
      due_date: '',
      completed: false
    });
    setErrors({});
  };
  
  const handleCancel = () => {
    resetForm();
    handleClose();
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 24,
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: '#f5f5f5'
      }}>
        {isEditing ? 'Edit Task' : 'Add New Task'}
        <IconButton onClick={handleClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ py: 3 }}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="title" style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>
              Task Title <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              ref={titleRef}
              id="title"
              name="title"
              type="text"
              defaultValue={formValues.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: errors.title ? '1px solid red' : '1px solid #ccc',
                fontSize: '16px'
              }}
              autoFocus
            />
            {errors.title && (
              <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                {errors.title}
              </div>
            )}
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="description" style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>
              Description (Optional)
            </label>
            <textarea
              ref={descriptionRef}
              id="description"
              name="description"
              defaultValue={formValues.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '16px',
                resize: 'vertical'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="due_date" style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>
              Due Date (Optional)
            </label>
            <input
              ref={dueDateRef}
              id="due_date"
              name="due_date"
              type="datetime-local"
              defaultValue={formValues.due_date}
              onChange={(e) => handleInputChange('due_date', e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '16px'
              }}
            />
          </div>
          
          {isEditing && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={formValues.completed}
                  onChange={(e) => handleInputChange('completed', e.target.checked)}
                  name="completed"
                  color="primary"
                />
              }
              label="Mark as completed"
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Button 
            onClick={handleCancel}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            sx={{ 
              bgcolor: '#61dafb',
              '&:hover': { bgcolor: '#21a8cb' },
              ml: 1 
            }}
          >
            {isEditing ? 'Update' : 'Add'} Task
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TodoForm; 