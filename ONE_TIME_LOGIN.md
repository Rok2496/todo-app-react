# One-Time Login Implementation Guide

## Overview

The one-time login feature allows users to login without a password by sending a time-limited login link to their email. This document explains how the feature works and how to test it.

## How It Works

1. **Request Process**:
   - User enters their email address on the login page
   - User clicks "Get one-time login link" button
   - Frontend sends a request to `/auth/onetime/request` with the email
   - Backend generates a JWT token with a short expiry (10 minutes)
   - Backend creates a link with this token and sends it to the user's email

2. **Login Process**:
   - User clicks the link in their email
   - Link should direct to: `http://localhost:3000/auth/onetime?token=<JWT_TOKEN>`
   - Frontend extracts the token and sends it to `/auth/onetime/verify`
   - Backend verifies the token validity
   - If valid, the user is logged in and receives a regular access token

## Backend Configuration

Make sure your backend properly generates the link with your frontend URL:

In the FastAPI backend (`/app/api/auth.py`):
```python
@router.post("/onetime/request")
async def request_one_time_login(data: schemas.OneTimeLoginRequest, 
                                 db: Session = Depends(get_db), 
                                 background_tasks: BackgroundTasks = None):
    # ...
    token = auth.create_access_token({"sub": user.email}, expires_delta=timedelta(minutes=10))
    
    # This should be your frontend URL + route
    link = f"http://localhost:3000/auth/onetime?token={token}"
    
    # Email sending logic...
```

## Testing One-Time Login

To test this feature:

1. Make sure your backend is running (`cd /Users/rokon/Desktop/fast && uvicorn app.main:app --reload --port 8000`)
2. Make sure your frontend is running (`cd /Users/rokon/Desktop/fast-client && npm start`)
3. Open the login page and enter a valid email
4. Click "Get one-time login link"
5. Check the console/terminal where your backend is running to see if the email is being sent
6. Check your email for the link
7. If email delivery is not working, you can manually construct the link:
   - Get the token from the backend logs
   - Create a URL: `http://localhost:3000/auth/onetime?token=<TOKEN>`
   - Open this URL in your browser

## Troubleshooting

If the one-time login is not working:

1. Check backend logs for errors during token generation
2. Verify that the backend is generating the correct frontend URL
3. Ensure that the frontend route `/auth/onetime` is properly defined
4. Check that the token verification endpoint is working correctly
5. Verify that your email service is properly configured in the backend

## Frontend Route Configuration

The frontend must have a route that handles the token parameter:

```jsx
<Route path="/auth/onetime" element={
  <AuthRoute>
    <OneTimeLogin />
  </AuthRoute>
} />
```

The `OneTimeLogin` component should extract the token from the URL and verify it with the backend. 