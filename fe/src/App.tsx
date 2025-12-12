import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import SearchPage from './pages/SearchPage';
import HomePage from './pages/HomePage';
import HotelDetailsPage from './pages/HotelDetailsPage';
import ManageHotelPage from './pages/ManageHotelPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import { Box } from '@mui/material';

function App() {
  return (
    <Router>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        <Navbar />

        <Box component="main" sx={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/hotel/:id" element={<HotelDetailsPage />} />
            <Route path="/admin/hotel/new" element={<ManageHotelPage />} />
            <Route path="/admin/hotel/:id" element={<ManageHotelPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </Box>

      </Box>
    </Router>
  );
}

export default App;