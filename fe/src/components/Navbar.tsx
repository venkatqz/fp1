import React, { useState, useEffect } from 'react';
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

// --- Constants ---


/**
 * Main Navigation Bar for the Application.
 * Contains: Logo, Search Bar, and Profile Actions.
 */
const Navbar: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    // --- State for Search ---
    // --- State for Search ---
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Default Dates
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const [checkIn, setCheckIn] = useState<string>(today);
    const [checkOut, setCheckOut] = useState<string>(tomorrow);
    const [guests, setGuests] = useState<string>('1');

    const [user, setUser] = useState<any>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const checkUser = () => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== "undefined") {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from local storage in Navbar", e);
                localStorage.removeItem('user');
                setUser(null);
            }
        } else {
            setUser(null);
        }
    };

    useEffect(() => {
        checkUser();
        // Listen for storage events (login/logout from other tabs/pages)
        window.addEventListener('storage', checkUser);
        return () => window.removeEventListener('storage', checkUser);
    }, []);

    // --- Effects ---
    // Debounce removed for auto-navigation to allow full form filling


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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event("storage"));
        setUser(null);
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

                    {/* 2. Composite Search Section (Centered) */}
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
                                type="text"
                                placeholder="Check In"
                                value={checkIn ? checkIn.split('-').reverse().join('/') : ''}
                                onFocus={(e) => {
                                    (e.currentTarget as HTMLInputElement).type = "date";
                                    // When switching to date input, we need the standard YYYY-MM-DD
                                    (e.currentTarget as HTMLInputElement).value = checkIn;
                                }}
                                onBlur={(e) => {
                                    (e.currentTarget as HTMLInputElement).type = "text";
                                    // When switching to text, we format it nicely
                                    // This is visual only, React state 'checkIn' remains YYYY-MM-DD
                                }}
                                onChange={(e) => setCheckIn(e.target.value)}
                                sx={{ flex: 1, '& input': { cursor: 'pointer' } }}
                                inputProps={{ min: new Date().toISOString().split('T')[0] }}
                            />

                            {/* Divider */}
                            <Box sx={{ width: '1px', height: 24, bgcolor: 'divider', mx: 1 }} />

                            {/* Check Out */}
                            <InputBase
                                type="text"
                                placeholder="Check Out"
                                value={checkOut ? checkOut.split('-').reverse().join('/') : ''}
                                onFocus={(e) => {
                                    (e.currentTarget as HTMLInputElement).type = "date";
                                    (e.currentTarget as HTMLInputElement).value = checkOut;
                                }}
                                onBlur={(e) => (e.currentTarget as HTMLInputElement).type = "text"}
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
                                    bgcolor: theme.palette.primary.main,
                                    borderRadius: '50%',
                                    p: 1,
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onClick={() => {
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
                                        <MenuItem onClick={() => { handleMenuClose(); navigate('/admin/hotel/new'); }}>
                                            Add Hotel
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
