import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Chip,
    Tooltip,
    CircularProgress,
    Divider
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import CloudIcon from '@mui/icons-material/Cloud';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SendIcon from '@mui/icons-material/Send';
import LoopIcon from '@mui/icons-material/Loop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import HorizontalPipelineFlow from './HorizontalPipelineFlow';

const DatasetArchitectureFlow = ({
                                     job,
                                     status,
                                     currentStep = 0,
                                     failedStep = null,
                                     onTriggerConfirm
                                 }) => {
    const [activeStep, setActiveStep] = useState(currentStep);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedPipeline, setSelectedPipeline] = useState(null);

    // Determine if the job uses DIAS2.0/INTF1 or DORA
    const isDIAS = job.pipeline.includes('SFP');
    const pipelineType = isDIAS ? 'DIAS2.0/INTF1' : 'DORA';

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handlePipelineSelect = (pipeline) => {
        setSelectedPipeline(pipeline);
        setConfirmOpen(true);
    };

    const handleConfirmTrigger = () => {
        setConfirmOpen(false);
        if (onTriggerConfirm) {
            onTriggerConfirm(selectedPipeline);
        }
        handleNext();
    };

    const getStepIcon = (step) => {
        switch (step) {
            case 0:
                return <StorageIcon />;
            case 1:
                return <CompareArrowsIcon />;
            case 2:
                return <FilterAltIcon />;
            case 3:
                return <SendIcon />;
            case 4:
                return <LoopIcon />;
            default:
                return <CloudIcon />;
        }
    };

    const getStepStatus = (step) => {
        if (status === 'COMPLETED') {
            return 'completed';
        }

        if (status === 'RUNNING') {
            if (step < activeStep) {
                return 'completed';
            } else if (step === activeStep) {
                return 'running';
            } else {
                return 'pending';
            }
        }

        if (status === 'FAILED') {
            if (step < activeStep) {
                return 'completed';
            } else if (step === activeStep) {
                return 'failed';
            } else {
                return 'pending';
            }
        }

        return step <= activeStep ? 'active' : 'pending';
    };

    const getStatusIcon = (stepStatus) => {
        switch (stepStatus) {
            case 'completed':
                return <CheckCircleIcon fontSize="small" color="success" />;
            case 'failed':
                return <ErrorIcon fontSize="small" color="error" />;
            case 'running':
                return <CircularProgress size={16} />;
            default:
                return null;
        }
    };

    const steps = [
        {
            label: 'Dataset Fetched',
            description: `Source data is fetched from the ${job.tableName} table.`,
        },
        {
            label: 'Identify Pipeline',
            description: 'Determine whether to use DIAS2.0/INTF1 or DORA pipeline based on data characteristics.',
            action: (
                <Box sx={{ mb: 2, mt: 1 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handlePipelineSelect('DIAS2.0/INTF1')}
                        sx={{ mr: 1 }}
                        disabled={status === 'RUNNING' || status === 'COMPLETED'}
                    >
                        Select DIAS2.0/INTF1
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handlePipelineSelect('DORA')}
                        disabled={status === 'RUNNING' || status === 'COMPLETED'}
                    >
                        Select DORA
                    </Button>
                </Box>
            ),
        },
        {
            label: 'Payload Prepared',
            description: 'Data payload is prepared and formatted for processing.',
        },
        {
            label: `Trigger ${selectedPipeline || pipelineType}`,
            description: `Job is triggered in the ${selectedPipeline || pipelineType} system.`,
        },
        {
            label: `Polling ${selectedPipeline || pipelineType}`,
            description: 'Monitoring job progress and waiting for completion.',
        },
    ];

    return (
        <Box sx={{ width: '100%' }}>
            {/* Horizontal Pipeline Flow */}
            <HorizontalPipelineFlow
                job={job}
                status={status}
                currentStep={activeStep}
                failedStep={failedStep}
            />

            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                        Current Pipeline:
                    </Typography>
                    <Chip
                        label={pipelineType}
                        color={isDIAS ? 'primary' : 'secondary'}
                        size="small"
                    />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Stepper activeStep={activeStep} orientation="vertical">
                    {steps.map((step, index) => (
                        <Step key={step.label}>
                            <StepLabel
                                StepIconComponent={() => (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box sx={{
                                            color: getStepStatus(index) === 'pending' ? 'text.disabled' : 'primary.main',
                                            mr: 1,
                                            position: 'relative'
                                        }}>
                                            {getStepIcon(index)}
                                            <Box sx={{
                                                position: 'absolute',
                                                bottom: -5,
                                                right: -5,
                                                bgcolor: 'background.paper',
                                                borderRadius: '50%',
                                            }}>
                                                {getStatusIcon(getStepStatus(index))}
                                            </Box>
                                        </Box>
                                    </Box>
                                )}
                            >
                                <Typography variant="subtitle2">{step.label}</Typography>
                            </StepLabel>
                            <StepContent>
                                <Typography variant="body2" color="text.secondary">
                                    {step.description}
                                </Typography>
                                {step.action}

                                {!step.action && (
                                    <Box sx={{ mb: 2, mt: 1 }}>
                                        <div>
                                            <Button
                                                disabled={index === 0 || status === 'RUNNING' || status === 'COMPLETED'}
                                                onClick={handleBack}
                                                sx={{ mt: 1, mr: 1 }}
                                            >
                                                Back
                                            </Button>
                                            <Button
                                                variant="contained"
                                                onClick={handleNext}
                                                sx={{ mt: 1, mr: 1 }}
                                                disabled={status === 'RUNNING' || status === 'COMPLETED'}
                                            >
                                                {index === steps.length - 1 ? 'Finish' : 'Next'}
                                            </Button>
                                        </div>
                                    </Box>
                                )}
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>
            </Paper>

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
            >
                <DialogTitle>Confirm Pipeline Selection</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        You are about to prepare a payload for the <strong>{selectedPipeline}</strong> pipeline.
                        This will process data from <strong>{job.tableName}</strong> with partition <strong>{job.partition}</strong>.

                        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="subtitle2" gutterBottom>Payload Preview:</Typography>
                            <Typography variant="body2" component="pre" sx={{
                                overflow: 'auto',
                                maxHeight: 150,
                                p: 1,
                                bgcolor: 'grey.100',
                                borderRadius: 1
                            }}>
                                {`{
  "table": "${job.tableName}",
  "partition": "${job.partition}",
  "pipeline": "${selectedPipeline}",
  "timestamp": "${new Date().toISOString()}"
}`}
                            </Typography>
                        </Box>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmTrigger} color="primary" variant="contained">
                        Confirm and Trigger
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DatasetArchitectureFlow;