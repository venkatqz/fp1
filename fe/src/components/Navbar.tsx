import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    InputBase,
    Box,
    IconButton,
    Avatar,
    Container,
    alpha,
    useTheme,
    Button,
    Menu,
    MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

// --- Constants ---


/**
 * Main Navigation Bar for the Application.
 * Contains: Logo, Search Bar, and Profile Actions.
 */
const Navbar: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    // --- State for Search ---
    const { user, logout } = useAuth();
    const { isLoading } = useUI();
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Default Dates
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const [checkIn, setCheckIn] = useState<string>(today);
    const [checkOut, setCheckOut] = useState<string>(tomorrow);
    const [guests, setGuests] = useState<string>('1');

    const [isCheckInFocused, setIsCheckInFocused] = useState(false);
    const [isCheckOutFocused, setIsCheckOutFocused] = useState(false);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    // --- Event Handlers ---
    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleMenuClose();
        navigate('/login');
    };

    return (
        <AppBar position="sticky" color="default" elevation={1}>
            <Container maxWidth="xl">
                <Toolbar disableGutters sx={{ height: 80, display: 'flex', justifyContent: 'space-between' }}>

                    {/* 1. Logo Section */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                            variant="h4"
                            noWrap
                            component="a"
                            href="/"
                            sx={{
                                mr: 2,
                                display: { xs: 'none', md: 'flex' },
                                fontFamily: 'Inter',
                                fontWeight: 800,
                                letterSpacing: '-.05rem',
                                color: theme.palette.primary.main,
                                textDecoration: 'none',
                            }}
                        >
                            HotelRent
                        </Typography>
                    </Box>

                    {/* 2. Composite Search Section (Centered) - Only visible when logged in */}
                    {user && (
                        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', maxWidth: '800px' }}>
                            <Box
                                sx={{
                                    position: 'relative',
                                    borderRadius: 100, // Pill shape
                                    backgroundColor: alpha(theme.palette.common.black, 0.05),
                                    border: `1px solid ${alpha(theme.palette.common.black, 0.1)}`,
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.common.black, 0.08),
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    },
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    transition: 'all 0.2s',
                                    p: 0.5,
                                }}
                            >
                                {/* Location Input */}
                                <InputBase
                                    placeholder="Where to?"
                                    value={searchQuery}
                                    onChange={handleSearchInputChange}
                                    sx={{ ml: 2, flex: 1.5, fontWeight: 500 }}
                                    startAdornment={<SearchIcon color="action" sx={{ mr: 1 }} />}
                                />

                                {/* Divider */}
                                <Box sx={{ width: '1px', height: 24, bgcolor: 'divider', mx: 1 }} />

                                {/* Check In */}
                                <InputBase
                                    type={isCheckInFocused ? "date" : "text"}
                                    placeholder="Check In"
                                    value={isCheckInFocused ? checkIn : (checkIn ? checkIn.split('-').reverse().join('/') : '')}
                                    onFocus={() => setIsCheckInFocused(true)}
                                    onBlur={() => setIsCheckInFocused(false)}
                                    onChange={(e) => setCheckIn(e.target.value)}
                                    sx={{ flex: 1, '& input': { cursor: 'pointer' } }}
                                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                                />

                                {/* Divider */}
                                <Box sx={{ width: '1px', height: 24, bgcolor: 'divider', mx: 1 }} />

                                {/* Check Out */}
                                <InputBase
                                    type={isCheckOutFocused ? "date" : "text"}
                                    placeholder="Check Out"
                                    value={isCheckOutFocused ? checkOut : (checkOut ? checkOut.split('-').reverse().join('/') : '')}
                                    onFocus={() => setIsCheckOutFocused(true)}
                                    onBlur={() => setIsCheckOutFocused(false)}
                                    onChange={(e) => setCheckOut(e.target.value)}
                                    sx={{ flex: 1, '& input': { cursor: 'pointer' } }}
                                    inputProps={{ min: checkIn || new Date().toISOString().split('T')[0] }}
                                />

                                {/* Divider */}
                                <Box sx={{ width: '1px', height: 24, bgcolor: 'divider', mx: 1 }} />

                                {/* Guests */}
                                <InputBase
                                    type="number"
                                    placeholder="Guests"
                                    value={guests}
                                    inputProps={{ min: 1 }}
                                    onChange={(e) => setGuests(e.target.value)}
                                    sx={{ flex: 0.8, maxWidth: '80px' }}
                                />

                                {/* Search Button */}
                                <Box
                                    sx={{
                                        ml: 1,
                                        bgcolor: isLoading ? 'action.disabled' : theme.palette.primary.main,
                                        borderRadius: '50%',
                                        p: 1,
                                        color: 'white',
                                        cursor: isLoading ? 'default' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        pointerEvents: isLoading ? 'none' : 'auto'
                                    }}
                                    onClick={() => {
                                        if (isLoading) return; // Prevent spamming
                                        const params = new URLSearchParams();
                                        if (searchQuery) params.set('query', searchQuery);
                                        if (checkIn) params.set('checkIn', checkIn);
                                        if (checkOut) params.set('checkOut', checkOut);
                                        if (guests) params.set('guests', guests);
                                        navigate(`/search?${params.toString()}`);
                                    }}
                                >
                                    <SearchIcon fontSize="small" />
                                </Box>
                            </Box>
                        </Box>
                    )}

                    {/* 3. Actions Section (Right) */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

                        {/* Profile / Login Actions */}
                        {/* Profile / Login Actions */}
                        {user ? (
                            <>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={handleMenuOpen}>
                                    <Typography variant="body2" fontWeight="bold" sx={{ display: { xs: 'none', sm: 'block' } }}>
                                        {user.name || 'User'}
                                    </Typography>
                                    <IconButton size="small" edge="end" aria-label="user account">
                                        <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 32, height: 32 }}>
                                            {user.name?.charAt(0) || '?'}
                                        </Avatar>
                                    </IconButton>
                                </Box>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                >
                                    <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                                        My Profile
                                    </MenuItem>
                                    {user.role === 'HOTEL_MANAGER' && (
                                        <MenuItem onClick={() => { handleMenuClose(); navigate('/manager/dashboard'); }}>
                                            Dashboard
                                        </MenuItem>
                                    )}
                                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
                                <Button variant="contained" onClick={() => navigate('/register')} disableElevation>
                                    Sign Up
                                </Button>
                            </Box>
                        )}
                    </Box>

                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar;
