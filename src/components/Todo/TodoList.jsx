import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Checkbox, Chip, IconButton, Typography, Stack, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
import { Delete, Edit, EventNote, Search, CheckCircle, RadioButtonUnchecked, Google } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import format from 'date-fns/format';
import isToday from 'date-fns/isToday';
import isTomorrow from 'date-fns/isTomorrow';
import isPast from 'date-fns/isPast';
import { todoService, userService } from '../../services/api';
import googleService from '../../services/googleService';
import { toast } from 'react-toastify';

const TodoList = ({ todos, onEdit, onRefresh }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [googleDialogOpen, setGoogleDialogOpen] = useState(false);
  const [pendingCalendarTodoId, setPendingCalendarTodoId] = useState(null);
  
  useEffect(() => {
    // Check if Google is connected
    checkGoogleConnection();
  }, []);
  
  const checkGoogleConnection = async () => {
    await googleService.checkConnection();
  };
  
  // Function to handle toggling the completion status
  const handleToggleComplete = async (todo) => {
    try {
      await todoService.updateTodo(todo.id, {
        title: todo.title,
        completed: !todo.completed
      });
      onRefresh();
      toast.success(`Task ${todo.completed ? 'marked as incomplete' : 'completed'}`);
    } catch (error) {
      console.error('Error updating todo:', error);
      toast.error('Failed to update task status');
    }
  };
  
  // Function to handle todo deletion
  const handleDelete = async (id) => {
    try {
      await todoService.deleteTodo(id);
      onRefresh();
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast.error('Failed to delete task');
    }
  };
  
  // Function to add a todo to Google Calendar
  const handleAddToCalendar = async (id) => {
    try {
      // Check if Google is connected first
      const userProfile = await userService.getProfile();
      const isConnected = userProfile.google_connected;
      
      if (!isConnected) {
        // Store the todo ID for later use
        setPendingCalendarTodoId(id);
        // Show the Google connect dialog
        setGoogleDialogOpen(true);
        return;
      }
      
      // If connected, add to calendar using new service
      await googleService.addToCalendar(id);
      toast.success('Task added to Google Calendar');
    } catch (error) {
      console.error('Error adding to calendar:', error);
      
      // Handle specific error cases
      if (error.response) {
        const status = error.response.status;
        const errorDetail = error.response.data?.detail;
        
        if (status === 401) {
          toast.error('Authentication required. Please log in again.');
        } else if (status === 404) {
          toast.error('Task not found or cannot be added to calendar.');
        } else if (status === 400 && errorDetail === "Google not connected") {
          // Show the Google connect dialog
          setPendingCalendarTodoId(id);
          setGoogleDialogOpen(true);
        } else {
          toast.error('Failed to add task to calendar. Please try again.');
        }
      } else {
        toast.error('Failed to add task to calendar. Please try again.');
      }
    }
  };
  
  const goToSettings = () => {
    setGoogleDialogOpen(false);
    navigate('/settings');
  };
  
  const connectGoogleFromDialog = async () => {
    try {
      console.log('Getting Google auth URL from backend...');
      const authUrl = await googleService.getAuthUrl();
      console.log('Received auth URL:', authUrl);
      
      if (!authUrl || typeof authUrl !== 'string') {
        toast.error('Invalid authorization URL received from server');
        console.error('Invalid auth URL format:', authUrl);
        return;
      }
      
      // Open in a new window and store the window reference
      console.log('Opening auth window with URL:', authUrl);
      const authWindow = window.open(authUrl, 'googleAuth', 'width=600,height=700');
      
      toast.info('Google authorization started. Please complete the process in the popup window.');
      
      // Check if popup was blocked
      if (!authWindow || authWindow.closed || typeof authWindow.closed === 'undefined') {
        toast.error('Popup blocked! Please allow popups for this site and try again.');
        return;
      }

      // Poll for connection status change
      const checkInterval = setInterval(async () => {
        try {
          // Check if window was closed
          if (authWindow.closed) {
            // Window closed, check if connection was successful
            const userProfile = await userService.getProfile();
            const connected = userProfile.google_connected;
            
            if (connected) {
              clearInterval(checkInterval);
              toast.success('Google Calendar connected successfully!');
              setGoogleDialogOpen(false);
              
              // After connection, try to add the task to calendar again if we have a pending ID
              if (pendingCalendarTodoId) {
                try {
                  await todoService.addToCalendar(pendingCalendarTodoId);
                  toast.success('Task added to Google Calendar');
                  setPendingCalendarTodoId(null);
                } catch (calendarError) {
                  console.error('Error adding to calendar after connection:', calendarError);
                  toast.error('Failed to add task to calendar after connection.');
                }
              }
            } else {
              // Window closed but not connected
              clearInterval(checkInterval);
              toast.warning('Google authorization window closed. Connection not completed.');
            }
          }
        } catch (e) {
          // Error checking window status or profile, clear interval
          console.error('Error during connection check:', e);
          clearInterval(checkInterval);
        }
      }, 1000);
      
      // Stop polling after 3 minutes
      setTimeout(() => {
        if (authWindow && !authWindow.closed) {
          authWindow.close();
        }
        clearInterval(checkInterval);
        toast.warning('Google authorization timed out. Please try again.');
      }, 180000);
    } catch (error) {
      console.error('Error connecting to Google:', error);
      toast.error('Failed to connect to Google Calendar. Please try again.');
    }
  };
  
  // Filter todos based on search
  const filteredTodos = todos.filter(todo => 
    todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (todo.description && todo.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Format the due date
  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    
    if (isToday(date)) {
      return 'Today';
    } else if (isTomorrow(date)) {
      return 'Tomorrow';
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };
  
  // Get the color for the due date chip
  const getDueDateColor = (dueDate) => {
    if (!dueDate) return 'default';
    
    const date = new Date(dueDate);
    
    if (isPast(date) && !isToday(date)) {
      return 'error';
    } else if (isToday(date)) {
      return 'warning';
    } else if (isTomorrow(date)) {
      return 'info';
    } else {
      return 'default';
    }
  };
  
  return (
    <Box>
      <TextField
        fullWidth
        placeholder="Search tasks..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        margin="normal"
        variant="outlined"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />
      
      {filteredTodos.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 5, 
          border: '2px dashed #ccc', 
          borderRadius: 2,
          backgroundColor: '#f9f9f9'
        }}>
          <Typography variant="h6" color="text.secondary">
            No todos found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {searchTerm ? 'Try a different search term' : 'Start by adding a new todo'}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {filteredTodos.map((todo) => (
            <Card 
              key={todo.id} 
              elevation={1}
              sx={{ 
                borderLeft: todo.completed ? '5px solid #4caf50' : '5px solid #2196f3',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3,
                },
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                    <Checkbox 
                      checked={todo.completed}
                      onChange={() => handleToggleComplete(todo)}
                      icon={<RadioButtonUnchecked />}
                      checkedIcon={<CheckCircle />}
                      sx={{ 
                        mt: -0.5, 
                        mr: 1,
                        color: todo.completed ? '#4caf50' : '#2196f3',
                        '&.Mui-checked': {
                          color: '#4caf50',
                        }
                      }}
                    />
                    <Box sx={{ width: '100%' }}>
                      <Typography 
                        variant="h6" 
                        component="div" 
                        sx={{ 
                          textDecoration: todo.completed ? 'line-through' : 'none',
                          color: todo.completed ? 'text.secondary' : 'text.primary',
                        }}
                      >
                        {todo.title}
                      </Typography>
                      
                      {todo.description && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            mt: 1, 
                            textDecoration: todo.completed ? 'line-through' : 'none',
                            opacity: todo.completed ? 0.7 : 1
                          }}
                        >
                          {todo.description}
                        </Typography>
                      )}
                      
                      {todo.due_date && (
                        <Chip 
                          label={formatDueDate(todo.due_date)}
                          size="small"
                          color={getDueDateColor(todo.due_date)}
                          sx={{ mt: 1, borderRadius: 1 }}
                        />
                      )}
                    </Box>
                  </Box>
                  
                  <Box>
                    <IconButton size="small" onClick={() => onEdit(todo)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleAddToCalendar(todo.id)}>
                      <EventNote fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(todo.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
      
      {/* Google Calendar Connection Dialog */}
      <Dialog open={googleDialogOpen} onClose={() => setGoogleDialogOpen(false)}>
        <DialogTitle>Connect Google Calendar</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Google sx={{ fontSize: 60, color: '#4285F4', mb: 2 }} />
            <Typography variant="body1" paragraph>
              You need to connect your Google account to add tasks to Google Calendar.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              This will allow the app to create events in your Google Calendar. 
              The connection will persist until you log out or disconnect.
            </Typography>
            <Alert severity="info" sx={{ mt: 2, mb: 2, textAlign: 'left' }}>
              <Typography variant="body2">
                When prompted by Google, please:
                <ol style={{ paddingLeft: '20px', margin: '8px 0' }}>
                  <li>Sign in with your Google account</li>
                  <li>Allow the requested calendar permissions</li>
                  <li>Return to this app after authorization</li>
                </ol>
              </Typography>
            </Alert>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Button 
                variant="contained" 
                startIcon={<Google />}
                sx={{ 
                  bgcolor: '#4285F4',
                  '&:hover': { bgcolor: '#3367D6' },
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  py: 1,
                  px: 2,
                }}
                onClick={connectGoogleFromDialog}
              >
                Connect Google Calendar
              </Button>
              <Button 
                variant="outlined"
                onClick={goToSettings}
              >
                Go to Settings
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGoogleDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TodoList; 