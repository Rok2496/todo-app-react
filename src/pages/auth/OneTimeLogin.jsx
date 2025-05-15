import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, CircularProgress, Container, TextField, Typography } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../../services/api';

const OneTimeLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('initial'); // initial, loading, code-entry, success, error
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  
  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // If token is provided in URL, verify it directly
      handleTokenVerification(token);
    } else {
      // If no token, show code entry form
      setStatus('code-entry');
    }
  }, [searchParams]);
  
  const handleTokenVerification = async (token) => {
    try {
      setStatus('loading');
      await authService.verifyOneTimeLogin(token);
      setStatus('success');
      toast.success('Successfully logged in!');
      
      // Give time for the success message to show
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error('One-time login verification failed:', err);
      setStatus('error');
      setError(err.response?.data?.detail || 'Invalid or expired login link');
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !code) {
      setError('Please enter both email and code');
      return;
    }
    
    try {
      setStatus('loading');
      await authService.verifyOneTimeCode(email, code);
      setStatus('success');
      toast.success('Successfully logged in!');
      
      // Give time for the success message to show
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error('One-time code verification failed:', err);
      setStatus('error');
      setError(err.response?.data?.detail || 'Invalid or expired code');
      setStatus('code-entry'); // Return to code entry on error
    }
  };
  
  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Card elevation={4} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ bgcolor: '#61dafb', py: 2 }}>
          <Typography variant="h4" align="center" fontWeight="bold" color="white">
            FastTodo
          </Typography>
        </Box>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom fontWeight="medium">
            One-Time Login
          </Typography>
          
          {status === 'loading' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography>Verifying your login...</Typography>
            </Box>
          )}
          
          {status === 'code-entry' && (
            <Box sx={{ my: 3 }}>
              <form onSubmit={handleCodeSubmit}>
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="One-Time Code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  InputLabelProps={{ shrink: true }}
                />
                <Button 
                  variant="contained" 
                  type="submit"
                  fullWidth
                  sx={{ 
                    mt: 3,
                    bgcolor: '#61dafb',
                    '&:hover': { bgcolor: '#21a8cb' },
                  }}
                >
                  Verify Code
                </Button>
                <Button 
                  variant="text" 
                  onClick={() => navigate('/auth/login')}
                  sx={{ mt: 2 }}
                >
                  Back to Login
                </Button>
              </form>
            </Box>
          )}
          
          {status === 'success' && (
            <Box sx={{ my: 4 }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                You've been successfully logged in!
              </Alert>
              <Typography>Redirecting to dashboard...</Typography>
            </Box>
          )}
          
          {status === 'error' && (
            <Box sx={{ my: 4 }}>
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
              <Button 
                variant="contained" 
                onClick={() => navigate('/auth/login')}
                sx={{ 
                  mt: 2,
                  bgcolor: '#61dafb',
                  '&:hover': { bgcolor: '#21a8cb' },
                }}
              >
                Back to Login
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default OneTimeLogin; 