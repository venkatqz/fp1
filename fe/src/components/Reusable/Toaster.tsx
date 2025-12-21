import React from 'react';
import { Alert, AlertTitle, Snackbar, Stack } from '@mui/material';
import { useUI } from '../../context/UIContext';

// NOTE: Material UI Snackbar usually handles one at a time. 
// For multiple stacked toasts, we can build a custom stack.
// Here we use a simple right-bottom fixed stack.

const Toaster: React.FC = () => {
    const { toasts, removeToast } = useUI();

    return (
        <Stack
            spacing={2}
            sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                zIndex: 9999,
                maxWidth: 400
            }}
        >
            {toasts.map((toast) => (
                <Alert
                    key={toast.id}
                    severity={toast.type}
                    onClose={() => removeToast(toast.id!)}
                    variant="outlined"
                    sx={{ width: '100%', bgcolor: 'background.paper', boxShadow: 3 }}
                >
                    {toast.title && <AlertTitle>{toast.title}</AlertTitle>}
                    {toast.msg}
                </Alert>
            ))}
        </Stack>
    );
};

export default Toaster;
