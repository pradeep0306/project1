import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Tooltip,
    Divider,
    Chip
} from '@mui/material';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { getPipelineConfig } from '../utils/pipelineConfigs';

const HorizontalPipelineFlow = ({
                                    job,
                                    status,
                                    currentStep = 0,
                                    failedStep = null
                                }) => {
    // Get the appropriate pipeline configuration based on the job
    const pipelineConfig = getPipelineConfig(job);
    const steps = pipelineConfig.steps;

    // Get status for a step
    const getStepStatus = (step, index) => {
        const stepId = step.id;

        if (status === 'COMPLETED') {
            return 'completed';
        }

        if (status === 'RUNNING') {
            if (index < currentStep) {
                return 'completed';
            } else if (index === currentStep) {
                return 'running';
            } else {
                return 'pending';
            }
        }

        if (status === 'FAILED') {
            // If we have a specific failed step ID from the job data
            if (failedStep && stepId === failedStep) {
                return 'failed';
            }

            // Otherwise use the current step index
            if (index < currentStep) {
                return 'completed';
            } else if (index === currentStep) {
                return 'failed';
            } else {
                return 'pending';
            }
        }

        return index <= currentStep ? 'active' : 'pending';
    };

    // Get color based on step status
    const getStepColor = (stepStatus) => {
        switch (stepStatus) {
            case 'completed':
                return 'success.main';
            case 'running':
                return 'warning.main';
            case 'failed':
                return 'error.main';
            case 'active':
                return 'primary.main';
            default:
                return 'text.disabled';
        }
    };

    // Get the status icon
    const getStatusIcon = (stepStatus) => {
        switch (stepStatus) {
            case 'completed':
                return <CheckCircleIcon fontSize="small" />;
            case 'failed':
                return <ErrorIcon fontSize="small" />;
            case 'running':
                return <HourglassEmptyIcon fontSize="small" />;
            default:
                return null;
        }
    };

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Pipeline Flow</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip
                        label={`Source: ${pipelineConfig.sourceSystem}`}
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                    />
                    <Chip
                        label={`Type: ${pipelineConfig.name}`}
                        color="secondary"
                        size="small"
                    />
                </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                px: 2,
                py: 1,
                overflowX: 'auto',
                width: '100%'
            }}>
                {steps.map((step, index) => {
                    const stepStatus = getStepStatus(step, index);
                    const isLastStep = index === steps.length - 1;

                    return (
                        <React.Fragment key={step.id}>
                            <Tooltip title={
                                <Box>
                                    <Typography variant="subtitle2">{step.label}</Typography>
                                    <Typography variant="body2">{step.description}</Typography>
                                    <Typography variant="caption" sx={{ color: getStepColor(stepStatus) }}>
                                        Status: {stepStatus.toUpperCase()}
                                    </Typography>
                                </Box>
                            }>
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    minWidth: '80px',
                                    maxWidth: '100px',
                                    mx: 0.5
                                }}>
                                    <Box sx={{
                                        position: 'relative',
                                        width: 60,
                                        height: 60,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: stepStatus === 'running' ? 'rgba(255, 152, 0, 0.1)' : 'transparent',
                                        border: 2,
                                        borderColor: getStepColor(stepStatus),
                                        color: getStepColor(stepStatus),
                                        boxShadow: stepStatus === 'running' ? '0 0 10px rgba(255, 152, 0, 0.5)' : 'none',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        {React.cloneElement(step.icon, { fontSize: 'large' })}

                                        {getStatusIcon(stepStatus) && (
                                            <Box sx={{
                                                position: 'absolute',
                                                bottom: -5,
                                                right: -5,
                                                bgcolor: 'background.paper',
                                                borderRadius: '50%',
                                                width: 22,
                                                height: 22,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '1px solid',
                                                borderColor: getStepColor(stepStatus),
                                                color: getStepColor(stepStatus)
                                            }}>
                                                {getStatusIcon(stepStatus)}
                                            </Box>
                                        )}
                                    </Box>

                                    <Typography
                                        variant="caption"
                                        sx={{
                                            mt: 1,
                                            fontWeight: stepStatus === 'running' ? 'bold' : 'normal',
                                            color: getStepColor(stepStatus),
                                            textAlign: 'center',
                                            maxWidth: '100px',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}
                                    >
                                        {step.label}
                                    </Typography>
                                </Box>
                            </Tooltip>

                            {!isLastStep && (
                                <ArrowRightAltIcon
                                    fontSize="medium"
                                    sx={{
                                        color: getStepStatus(steps[index + 1], index + 1) === 'pending'
                                            ? 'text.disabled'
                                            : 'text.secondary',
                                        mx: 0.5
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

export default HorizontalPipelineFlow;