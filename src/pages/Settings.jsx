import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Container, 
  Divider, 
  Paper, 
  Switch, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  ListItemSecondaryAction,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { Google, CalendarMonth, Check, Cloud } from '@mui/icons-material';
import { userService } from '../services/api';
import googleService from '../services/googleService';

const Settings = () => {
  const [googleConnected, setGoogleConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Fetch user data on component mount
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const user = await userService.getProfile();
      setUserData(user);
      setGoogleConnected(user.google_connected === true);
    } catch (error) {
      console.error('Error fetching user data:', error);
      showSnackbar('Failed to load user profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const checkGoogleConnection = async () => {
    try {
      setIsLoading(true);
      const user = await userService.getProfile();
      setGoogleConnected(user.google_connected === true);
    } catch (error) {
      console.error('Error checking Google connection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startGoogleAuth = async () => {
    try {
      // Get auth URL from backend
      console.log('Getting Google auth URL from backend...');
      const authUrl = await googleService.getAuthUrl();
      console.log('Received auth URL:', authUrl);
      
      if (!authUrl || typeof authUrl !== 'string') {
        showSnackbar('Invalid authorization URL received from server');
        console.error('Invalid auth URL format:', authUrl);
        return;
      }
      
      // Open in a new window and store the window reference
      console.log('Opening auth window with URL:', authUrl);
      const authWindow = window.open(authUrl, 'googleAuth', 'width=600,height=700');
      
      showSnackbar('Google authorization started. Please complete the process in the popup window.');
      
      // Check if popup was blocked
      if (!authWindow || authWindow.closed || typeof authWindow.closed === 'undefined') {
        showSnackbar('Popup blocked! Please allow popups for this site and try again.');
        return;
      }
      
      // Poll for connection status change
      const checkInterval = setInterval(async () => {
        try {
          // Check if window was closed
          if (authWindow.closed) {
            // Window closed, check if connection was successful
            await fetchUserData();
            
            if (googleConnected) {
              clearInterval(checkInterval);
              showSnackbar('Google Calendar connected successfully!');
            } else {
              // Window closed but not connected
              clearInterval(checkInterval);
              showSnackbar('Google authorization window closed. Connection not completed.');
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
        showSnackbar('Google authorization timed out. Please try again.');
      }, 180000);
      
    } catch (error) {
      console.error('Error starting Google auth:', error);
      showSnackbar('Failed to start Google authorization. Please try again.');
    }
  };

  const disconnectGoogle = async () => {
    try {
      await googleService.disconnect();
      await fetchUserData(); // Refresh user data to get updated google_connected status
      showSnackbar('Google Calendar disconnected.');
    } catch (error) {
      console.error('Error disconnecting Google:', error);
      showSnackbar('Failed to disconnect Google Calendar. Please try again.');
    }
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ borderRadius: 2, mb: 4, p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Settings
        </Typography>
        <Typography variant="body1" paragraph color="text.secondary">
          Manage your account settings and integrations
        </Typography>
      </Paper>

      <Card elevation={2} sx={{ borderRadius: 2, mb: 4, overflow: 'hidden' }}>
        <Box sx={{ bgcolor: '#61dafb', py: 1.5, px: 3 }}>
          <Typography variant="h6" color="white" fontWeight="bold">
            Integrations
          </Typography>
        </Box>
        <CardContent>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Google sx={{ color: '#4285F4' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Google Calendar" 
                    secondary={googleConnected 
                      ? "Connected - Your tasks can be added to your Google Calendar"
                      : "Not connected - Connect to add tasks to your Google Calendar"
                    }
                  />
                  <ListItemSecondaryAction>
                    {googleConnected ? (
                      <Button 
                        variant="outlined" 
                        color="error" 
                        onClick={disconnectGoogle}
                        size="small"
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button 
                        variant="contained" 
                        startIcon={<Google />}
                        onClick={startGoogleAuth}
                        sx={{ 
                          bgcolor: '#4285F4',
                          '&:hover': { bgcolor: '#3367D6' },
                        }}
                      >
                        Connect
                      </Button>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <CalendarMonth />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Default Calendar" 
                    secondary="Choose which calendar to add tasks to"
                    disabled={!googleConnected}
                  />
                  <ListItemSecondaryAction>
                    <Button 
                      variant="outlined" 
                      size="small"
                      disabled={!googleConnected}
                    >
                      Select
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
              
              {!googleConnected && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Connecting Google Calendar allows you to add tasks directly to your calendar with a single click.
                    <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
                      <li>You'll need to authorize this app in a popup window</li>
                      <li>Sign in with the Google account you want to use</li>
                      <li>Allow the requested calendar permissions</li>
                      <li>Return to this app after authorization completes</li>
                    </Box>
                  </Typography>
                </Alert>
              )}
              
              {googleConnected && (
                <Alert severity="success" sx={{ mt: 2 }} icon={<Check />}>
                  <Typography variant="body2">
                    Google Calendar is connected! You can now add tasks to your calendar by clicking the calendar icon on any task.
                  </Typography>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ bgcolor: '#61dafb', py: 1.5, px: 3 }}>
          <Typography variant="h6" color="white" fontWeight="bold">
            Account Settings
          </Typography>
        </Box>
        <CardContent>
          <List>
            <ListItem>
              <ListItemIcon>
                <Cloud />
              </ListItemIcon>
              <ListItemText 
                primary="Sync Settings" 
                secondary="Sync your tasks across devices"
              />
              <ListItemSecondaryAction>
                <Switch defaultChecked />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoClose={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default Settings; 