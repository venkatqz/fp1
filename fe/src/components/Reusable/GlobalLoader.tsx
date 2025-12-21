import React from 'react';
import { Backdrop, CircularProgress } from '@mui/material';
import { useUI } from '../../context/UIContext';

const GlobalLoader: React.FC = () => {
    const { isLoading } = useUI();

    return (
        <Backdrop
            sx={{
                color: '#primary.main',
                zIndex: (theme) => theme.zIndex.appBar - 1,
                backgroundColor: 'rgba(255, 255, 255, 0.5)' // Semi-transparent white instead of gray
            }}
            open={isLoading}
        >
            <CircularProgress color="secondary" />
        </Backdrop>
    );
};

export default GlobalLoader;
