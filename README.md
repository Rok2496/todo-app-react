# Todo App with Google Calendar Integration

A modern React application for managing todos with Google Calendar integration, built with Material UI.

## Features

- ✅ Create, edit, and delete todos
- 📆 Google Calendar integration
- 🔐 User authentication
- 🎨 Beautiful UI with Material UI
- 📱 Responsive design

## Tech Stack

- React 19
- React Router v7
- Material UI v7
- TanStack React Query
- Formik & Yup for form handling
- Axios for API requests
- React Toastify for notifications
- date-fns for date manipulation

## Project Structure

```
src/
├── assets/          # Static assets like images
├── components/      # Reusable UI components
│   ├── Layout/      # Layout components
│   └── Todo/        # Todo-specific components
├── contexts/        # React Context providers
├── hooks/           # Custom React hooks
├── pages/           # Full page components
│   ├── auth/        # Authentication pages
│   └── todo/        # Todo-related pages
├── services/        # API services
└── utils/           # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Rok2496/todo-app-react.git
   cd todo-app-react
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
REACT_APP_API_URL=your_api_url
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

## Deployment

Build the app for production:

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `build/` directory.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
