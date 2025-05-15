import React from 'react';
import { Box, Button, Card, CardContent, Container, Grid, Paper, Typography } from '@mui/material';
import { Assignment as AssignmentIcon, CalendarToday as CalendarIcon, CheckCircle as CheckCircleIcon, Add as AddIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { todoService } from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  
  const { data: todos = [] } = useQuery({
    queryKey: ['todos'],
    queryFn: todoService.getAllTodos,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Calculate statistics
  const totalTodos = todos.length;
  const completedTodos = todos.filter(todo => todo.completed).length;
  const pendingTodos = totalTodos - completedTodos;
  const dueSoonTodos = todos.filter(todo => {
    if (!todo.due_date || todo.completed) return false;
    const dueDate = new Date(todo.due_date);
    const today = new Date();
    const timeDiff = dueDate.getTime() - today.getTime();
    const dayDiff = timeDiff / (1000 * 3600 * 24);
    return dayDiff <= 3 && dayDiff >= 0; // Due within 3 days
  }).length;
  
  const StatCard = ({ icon, title, value, color }) => (
    <Card 
      elevation={2}
      sx={{ 
        height: '100%',
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
        },
      }}
    >
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          height: '5px', 
          bgcolor: color 
        }} 
      />
      <CardContent sx={{ p: 3 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1,
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: `${color}22`, 
              borderRadius: '50%', 
              p: 1,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h3" component="div" fontWeight="bold" sx={{ mt: 2 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Welcome to FastTodo
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your tasks efficiently and stay productive.
        </Typography>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<AssignmentIcon sx={{ color: '#2196f3' }} />}
            title="Total Tasks" 
            value={totalTodos}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<CheckCircleIcon sx={{ color: '#4caf50' }} />}
            title="Completed" 
            value={completedTodos}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<AssignmentIcon sx={{ color: '#ff9800' }} />}
            title="Pending" 
            value={pendingTodos}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<CalendarIcon sx={{ color: '#f44336' }} />}
            title="Due Soon" 
            value={dueSoonTodos}
            color="#f44336"
          />
        </Grid>
      </Grid>
      
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Recent Tasks
          </Typography>
          <Button 
            component={Link} 
            to="/todos" 
            size="small"
            endIcon={<AssignmentIcon />}
          >
            View All
          </Button>
        </Box>
        
        {todos.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, border: '2px dashed #ccc', borderRadius: 2 }}>
            <Typography color="text.secondary" gutterBottom>No tasks yet</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => navigate('/todos')}
              sx={{ 
                mt: 2,
                bgcolor: '#61dafb',
                '&:hover': { bgcolor: '#21a8cb' },
              }}
            >
              Create New Task
            </Button>
          </Box>
        ) : (
          <Box>
            {todos.slice(0, 5).map((todo) => (
              <Box 
                key={todo.id} 
                sx={{ 
                  py: 1.5, 
                  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                  '&:last-of-type': { borderBottom: 'none' },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      width: 10, 
                      height: 10, 
                      borderRadius: '50%', 
                      bgcolor: todo.completed ? '#4caf50' : '#ff9800',
                      mr: 2 
                    }} 
                  />
                  <Typography 
                    variant="body1" 
                    sx={{
                      textDecoration: todo.completed ? 'line-through' : 'none',
                      color: todo.completed ? 'text.secondary' : 'text.primary',
                    }}
                  >
                    {todo.title}
                  </Typography>
                </Box>
                {todo.due_date && (
                  <Typography variant="body2" color="text.secondary">
                    {new Date(todo.due_date).toLocaleDateString()}
                  </Typography>
                )}
              </Box>
            ))}
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button 
                component={Link} 
                to="/todos" 
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                View All Tasks
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
      
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Quick Tips
        </Typography>
        <Typography variant="body2" paragraph>
          • Create tasks with due dates to keep track of deadlines
        </Typography>
        <Typography variant="body2" paragraph>
          • Add detailed descriptions to clarify task requirements
        </Typography>
        <Typography variant="body2" paragraph>
          • Add tasks to Google Calendar for better time management
        </Typography>
        <Typography variant="body2">
          • Check off completed tasks to track your progress
        </Typography>
      </Paper>
    </Container>
  );
};

export default Home; 