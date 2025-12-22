import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import SearchPage from './Pages/SearchPage';
import HomePage from './Pages/HomePage';
import HotelDetailsPage from './Pages/HotelDetailsPage';
import ManageHotelPage from './Pages/ManageHotelPage';
import ManagerDashboard from './Pages/ManagerDashboard';
import LoginPage from './Pages/LoginPage';
import RegisterPage from './Pages/RegisterPage';
import ProfilePage from './Pages/ProfilePage';
import { Box } from '@mui/material';
import { UIProvider } from './context/UIContext';
import { AuthProvider } from './context/AuthContext';
import Toaster from './components/Reusable/Toaster';
import GlobalLoader from './components/Reusable/GlobalLoader';
import PublicRoute from './components/PublicRoute';

function App() {
  return (
    <UIProvider>
      <Router>
        <AuthProvider>
          <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            <Navbar />

            <Box component="main" sx={{ flexGrow: 1 }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/hotel/:id" element={<HotelDetailsPage />} />
                <Route path="/manager/dashboard" element={<ManagerDashboard />} />
                <Route path="/admin/hotel/new" element={<ManageHotelPage />} />
                <Route path="/admin/hotel/:id" element={<ManageHotelPage />} />

                {/* Routes only for non-authenticated users */}
                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                </Route>

                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            </Box>

            <GlobalLoader />
            <Toaster />

          </Box>
        </AuthProvider>
      </Router>
    </UIProvider>
  );
}

export default App;