import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Hotel } from '../client/models/Hotel';

interface WithManagerActionsProps {
    hotel: Hotel;
    onEdit: (hotel: Hotel) => void;
    onDelete: (hotel: Hotel) => void;
}

/**
 * Higher-Order Component that adds manager action buttons (Edit/Delete) to a hotel card
 * This wraps the original component and adds an overlay with action buttons
 */
export function withManagerActions<P extends { hotel: Hotel }>(
    WrappedComponent: React.ComponentType<P>
) {
    return function WithManagerActionsComponent(
        props: P & WithManagerActionsProps
    ) {
        const { hotel, onEdit, onDelete, ...restProps } = props;

        return (
            <Box sx={{ position: 'relative' }}>
                {/* Original Component */}
                <WrappedComponent {...(restProps as P)} hotel={hotel} />

                {/* Manager Actions Overlay - Always show both Edit and Delete */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        display: 'flex',
                        gap: 1,
                        zIndex: 10
                    }}
                >
                    <Tooltip title="Edit">
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onEdit(hotel);
                            }}
                            sx={{
                                bgcolor: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(4px)',
                                boxShadow: 1,
                                '&:hover': {
                                    bgcolor: 'background.paper',
                                    boxShadow: 2
                                }
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onDelete(hotel);
                            }}
                            sx={{
                                bgcolor: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(4px)',
                                boxShadow: 1,
                                '&:hover': {
                                    bgcolor: 'background.paper',
                                    boxShadow: 2
                                }
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
        );
    };
}

export default withManagerActions;
