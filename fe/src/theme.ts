
import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';


const theme = createTheme({
    palette: {
        primary: {
            main: '#0057b7', // Strong Blue (Klare Blue)
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#FF8700', // McLaren Orange
            contrastText: '#000000',
        },
        error: {
            main: red.A400,
        },
        background: {
            default: '#f4f6f8',
            paper: '#ffffff',
        },
        text: {
            primary: '#1A2027',
            secondary: '#3E5060',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontSize: '2.5rem',
            fontWeight: 700,
            lineHeight: 1.2,
        },
        h2: {
            fontSize: '2rem',
            fontWeight: 600,
        },
        h3: {
            fontSize: '1.75rem',
            fontWeight: 600,
        },
        button: {
            textTransform: 'none', // Remove uppercase default from MUI buttons
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 8, // Softer corners
    },
    components: {
        // Global Component Overrides
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    padding: '10px 24px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
                    },
                },
                containedPrimary: {
                    background: 'linear-gradient(45deg, #0057b7 30%, #0072EA 90%)',
                },
                containedSecondary: {
                    background: 'linear-gradient(45deg, #FF8700 30%, #FFA033 90%)',
                    color: '#fff',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                    color: '#1A2027',
                    boxShadow: '0px 1px 3px rgba(0,0,0,0.05)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
                    border: '1px solid #eaeff5',
                },
            },
        },
    },
});

export default theme;