import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Chip,
    Tooltip,
    Divider
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PendingIcon from '@mui/icons-material/Pending';

const PartitionStatusTimeline = ({ job, currentPartition, missingPartitions, processingPartitions = [] }) => {
    // Combine all partitions and sort them
    const allPartitions = [...new Set([
        currentPartition,
        ...missingPartitions,
        ...processingPartitions
    ])].sort();

    // Group partitions by month for better organization
    const groupedPartitions = allPartitions.reduce((acc, partition) => {
        // Assuming partition format is YYYY-MM-DD or YYYYMMDD
        let month;
        if (partition.includes('-')) {
            const [year, monthPart] = partition.split('-');
            month = `${year}-${monthPart}`;
        } else {
            month = partition.substring(0, 6); // YYYYMM
        }

        if (!acc[month]) {
            acc[month] = [];
        }
        acc[month].push(partition);
        return acc;
    }, {});

    const getPartitionStatus = (partition) => {
        if (processingPartitions.includes(partition)) {
            return 'PROCESSING';
        }
        if (partition === currentPartition) {
            return 'FAILED';
        }
        if (missingPartitions.includes(partition)) {
            return 'MISSING';
        }
        return 'COMPLETED';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'COMPLETED':
                return <CheckCircleIcon fontSize="small" color="success" />;
            case 'FAILED':
                return <ErrorIcon fontSize="small" color="error" />;
            case 'PROCESSING':
                return <HourglassEmptyIcon fontSize="small" color="warning" />;
            case 'MISSING':
                return <PendingIcon fontSize="small" color="disabled" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED':
                return 'success';
            case 'FAILED':
                return 'error';
            case 'PROCESSING':
                return 'warning';
            case 'MISSING':
                return 'default';
            default:
                return 'default';
        }
    };

    const formatPartitionDisplay = (partition) => {
        // Convert YYYYMMDD to YYYY-MM-DD for display if needed
        if (!partition.includes('-') && partition.length === 8) {
            return `${partition.substring(0, 4)}-${partition.substring(4, 6)}-${partition.substring(6, 8)}`;
        }
        return partition;
    };

    return (
        <Paper sx={{ p: 2, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
                Date-wise Partition Status
            </Typography>

            <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                    {Object.entries(groupedPartitions).map(([month, partitions]) => (
                        <Grid item xs={12} key={month}>
                            <Paper variant="outlined" sx={{ p: 1, mb: 1 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                    {month.includes('-') ? month : `${month.substring(0, 4)}-${month.substring(4, 6)}`}
                                </Typography>
                                <Divider sx={{ mb: 1 }} />
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {partitions.map(partition => {
                                        const status = getPartitionStatus(partition);
                                        return (
                                            <Tooltip
                                                key={partition}
                                                title={`Status: ${status}`}
                                                placement="top"
                                            >
                                                <Chip
                                                    icon={getStatusIcon(status)}
                                                    label={formatPartitionDisplay(partition)}
                                                    color={getStatusColor(status)}
                                                    variant={status === 'MISSING' ? 'outlined' : 'filled'}
                                                    size="small"
                                                    sx={{
                                                        '& .MuiChip-icon': {
                                                            ml: 0.5
                                                        }
                                                    }}
                                                />
                                            </Tooltip>
                                        );
                                    })}
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2, mb: 1 }}>
                    <CheckCircleIcon fontSize="small" color="success" sx={{ mr: 0.5 }} />
                    <Typography variant="caption">Completed</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2, mb: 1 }}>
                    <ErrorIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
                    <Typography variant="caption">Failed</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2, mb: 1 }}>
                    <HourglassEmptyIcon fontSize="small" color="warning" sx={{ mr: 0.5 }} />
                    <Typography variant="caption">Processing</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PendingIcon fontSize="small" color="disabled" sx={{ mr: 0.5 }} />
                    <Typography variant="caption">Missing</Typography>
                </Box>
            </Box>
        </Paper>
    );
};

export default PartitionStatusTimeline;