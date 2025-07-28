import React from 'react';
import { Box, Paper, Typography, Tooltip } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import CloudIcon from '@mui/icons-material/Cloud';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

const PipelineFlow = ({ pipeline, status, failedModule }) => {
    // Determine the pipeline steps based on the pipeline type
    const isPipelineSFP = pipeline.includes('SFP');

    // Define the modules in the pipeline
    const modules = isPipelineSFP
        ? ['SOR', 'SFP', 'AWS']
        : ['SOR', 'AWS'];

    // Determine the status of each module
    const getModuleStatus = (module) => {
        if (status === 'COMPLETED') {
            return 'completed';
        }

        if (status === 'RUNNING') {
            // If the job is running, determine which module is currently processing
            const moduleIndex = modules.indexOf(module);
            const failedModuleIndex = failedModule ? modules.indexOf(failedModule) : -1;

            if (moduleIndex < failedModuleIndex) {
                return 'completed';
            } else if (moduleIndex === failedModuleIndex) {
                return 'running';
            } else {
                return 'pending';
            }
        }

        // For failed jobs
        if (module === failedModule) {
            return 'failed';
        }

        const moduleIndex = modules.indexOf(module);
        const failedModuleIndex = failedModule ? modules.indexOf(failedModule) : modules.length;

        return moduleIndex < failedModuleIndex ? 'completed' : 'pending';
    };

    // Get the appropriate icon for each module
    const getModuleIcon = (module) => {
        switch (module) {
            case 'SOR':
                return <StorageIcon fontSize="large" />;
            case 'SFP':
                return <FilterAltIcon fontSize="large" />;
            case 'AWS':
                return <CloudIcon fontSize="large" />;
            default:
                return null;
        }
    };

    // Get the status icon
    const getStatusIcon = (moduleStatus) => {
        switch (moduleStatus) {
            case 'completed':
                return <CheckCircleIcon fontSize="small" color="success" />;
            case 'failed':
                return <ErrorIcon fontSize="small" color="error" />;
            case 'running':
                return <HourglassEmptyIcon fontSize="small" color="warning" />;
            default:
                return null;
        }
    };

    // Get color based on module status
    const getModuleColor = (moduleStatus) => {
        switch (moduleStatus) {
            case 'completed':
                return 'success.main';
            case 'failed':
                return 'error.main';
            case 'running':
                return 'warning.main';
            default:
                return 'text.disabled';
        }
    };

    return (
        <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
                Pipeline Flow
            </Typography>

            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                my: 2,
                px: 2
            }}>
                {modules.map((module, index) => {
                    const moduleStatus = getModuleStatus(module);
                    const isLastModule = index === modules.length - 1;

                    return (
                        <React.Fragment key={module}>
                            <Tooltip title={`${module} - ${moduleStatus.toUpperCase()}`}>
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    position: 'relative'
                                }}>
                                    <Box sx={{
                                        p: 1.5,
                                        borderRadius: '50%',
                                        bgcolor: 'background.paper',
                                        border: 2,
                                        borderColor: getModuleColor(moduleStatus),
                                        color: getModuleColor(moduleStatus),
                                        position: 'relative'
                                    }}>
                                        {getModuleIcon(module)}

                                        <Box sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            right: 0,
                                            bgcolor: 'background.paper',
                                            borderRadius: '50%',
                                            width: 20,
                                            height: 20,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {getStatusIcon(moduleStatus)}
                                        </Box>
                                    </Box>

                                    <Typography
                                        variant="body2"
                                        sx={{
                                            mt: 1,
                                            fontWeight: 'bold',
                                            color: getModuleColor(moduleStatus)
                                        }}
                                    >
                                        {module}
                                    </Typography>
                                </Box>
                            </Tooltip>

                            {!isLastModule && (
                                <ArrowRightAltIcon
                                    fontSize="large"
                                    sx={{
                                        color: getModuleStatus(modules[index + 1]) === 'pending'
                                            ? 'text.disabled'
                                            : 'text.secondary'
                                    }}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </Box>
        </Paper>
    );
};

export default PipelineFlow;