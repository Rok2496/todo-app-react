import React, { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Container, TextField, Typography, Link as MuiLink, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { authService } from '../../services/api';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [needsOtp, setNeedsOtp] = useState(false);
  const [otp, setOtp] = useState('');

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const loginSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError('');
        await authService.login(values.email, values.password);
        toast.success('Logged in successfully!');
        navigate('/');
      } catch (error) {
        console.error('Login failed:', error);
        
        if (error.response && error.response.status === 403 && error.response.data.detail === '2FA required') {
          setNeedsOtp(true);
        } else {
          setError(error.response?.data?.detail || 'Login failed. Please check your credentials.');
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const handleVerify2FA = async () => {
    try {
      setLoading(true);
      setError('');
      await authService.verify2FA(otp);
      toast.success('2FA verification successful!');
      navigate('/');
    } catch (error) {
      console.error('2FA verification failed:', error);
      setError(error.response?.data?.detail || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleOneTimeLogin = async () => {
    try {
      if (!formik.values.email) {
        setError('Please enter your email address first');
        return;
      }
      
      setLoading(true);
      setError('');
      
      await authService.requestOneTimeLogin(formik.values.email);
      
      // Show a more detailed message with instructions
      setError('');
      toast.success('One-time login code sent!', { autoClose: 3000 });
      
      // Display more detailed instructions
      const msg = `Please check your email (${formik.values.email}) for a one-time login code. 
                   Enter this code along with your email on the one-time login page.`;
      toast.info(msg, { autoClose: 10000 });
      
      // Navigate to the one-time login page
      navigate('/auth/onetime');
      
    } catch (error) {
      console.error('One-time login request failed:', error);
      setError(error.response?.data?.detail || 'Failed to send one-time login code');
    } finally {
      setLoading(false);
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
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight="medium" align="center">
            {needsOtp ? '2FA Verification' : 'Log In'}
          </Typography>
          
          {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
          
          {!needsOtp ? (
            <Box component="form" onSubmit={formik.handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                sx={{ mb: 2 }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{ 
                  mt: 3, 
                  mb: 2, 
                  py: 1.2,
                  bgcolor: '#61dafb',
                  '&:hover': { bgcolor: '#21a8cb' },
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              
              <Box sx={{ textAlign: 'center', mt: 1 }}>
                <Button 
                  onClick={handleOneTimeLogin} 
                  disabled={!formik.values.email || loading}
                  sx={{ mb: 1, textTransform: 'none' }}
                >
                  Get one-time login code
                </Button>
                <Box>
                  <Typography variant="body2" color="text.secondary" display="inline">
                    Don't have an account?{' '}
                  </Typography>
                  <MuiLink component={Link} to="/auth/register" variant="body2">
                    Sign Up
                  </MuiLink>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="otp"
                label="Verification Code"
                name="otp"
                autoFocus
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                sx={{ mb: 2 }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <Button
                fullWidth
                variant="contained"
                onClick={handleVerify2FA}
                disabled={loading || !otp}
                sx={{ 
                  mt: 2, 
                  py: 1.2,
                  bgcolor: '#61dafb',
                  '&:hover': { bgcolor: '#21a8cb' },
                }}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </Button>
              <Button
                fullWidth
                variant="text"
                onClick={() => setNeedsOtp(false)}
                sx={{ mt: 1 }}
              >
                Go back to login
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login; 