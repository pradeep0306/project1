import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Button,
    Grid,
    Paper,
    LinearProgress,
    Divider,
    List,
    ListItem,
    ListItemText,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobStatus, triggerJob, getJobPayloadPreview } from '../services/api';
import DatasetArchitectureFlow from './DatasetArchitectureFlow';
import PartitionStatusTimeline from './PartitionStatusTimeline';

const JobDetails = ({ jobs }) => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([]);
    const [refreshInterval, setRefreshInterval] = useState(null);
    const [failedModule, setFailedModule] = useState(null);
    const [currentArchStep, setCurrentArchStep] = useState(0);
    const [processingPartitions, setProcessingPartitions] = useState([]);
    const [showPipelineFlow, setShowPipelineFlow] = useState(false);
    const [retriggeredCount, setRetriggeredCount] = useState(0);
    const [currentStepName, setCurrentStepName] = useState('');

    useEffect(() => {
        const selectedJob = jobs.find(j => j.id === parseInt(jobId));
        if (selectedJob) {
            setJob(selectedJob);
            setStatus(selectedJob.status);
            setFailedModule(selectedJob.failedStep);
        }
    }, [jobId, jobs]);

    useEffect(() => {
        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        };
    }, [refreshInterval]);

    const handleTriggerJob = async (pipeline = null, partitions = null, batchSize = 1) => {
        setLoading(true);
        try {
            // If a pipeline is specified, log it
            if (pipeline) {
                addLog(`Selected pipeline: ${pipeline}`);
            }

            // Update the architecture flow step
            setCurrentArchStep(3); // Move to "Trigger" step

            // If partitions are specified, use them, otherwise use the current partition
            const partitionsToProcess = partitions || [job.partition];

            // Set initial processing partitions
            setProcessingPartitions(partitionsToProcess);

            addLog(`Triggering job for ${partitionsToProcess.length} partition(s): ${partitionsToProcess.join(', ')}`);

            const response = await triggerJob(parseInt(jobId), partitionsToProcess, batchSize);
            setStatus(response.data.status);
            // Increment the retrigger count
            setRetriggeredCount(prev => prev + partitionsToProcess.length);
            addLog(`Job triggered successfully. Status: ${response.data.status}`);

            // Move to "Polling" step
            setCurrentArchStep(4);
            setCurrentStepName('Initializing');

            // Start polling for status updates
            const interval = setInterval(fetchJobStatus, 3000);
            setRefreshInterval(interval);
        } catch (error) {
            setStatus('ERROR');
            addLog(`Error triggering job: ${error.message}`);
            // Clear processing partitions on error
            setProcessingPartitions([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchJobStatus = async () => {
        try {
            const response = await getJobStatus(parseInt(jobId));
            setStatus(response.data.status);
            addLog(`Status updated: ${response.data.status} at ${new Date().toLocaleTimeString()}`);

            // When job is running, update processing partitions and simulate progress through the pipeline
            if (response.data.status === 'RUNNING') {
                // Update processing partitions
                if (response.data.processingPartitions) {
                    setProcessingPartitions(response.data.processingPartitions);
                } else {
                    // Simulate processing partitions if not provided by API
                    const partitionsToProcess = job.missingPartitions.slice(0, 2);
                    setProcessingPartitions(partitionsToProcess);
                    addLog(`Processing partitions: ${partitionsToProcess.join(', ')}`);
                }

                // This is a simplified simulation - in a real app, the backend would provide this information
                const modules = job.pipeline.includes('SFP') ? ['SOR', 'SFP', 'AWS'] : ['SOR', 'AWS'];
                const currentModuleIndex = modules.indexOf(failedModule);

                // Randomly progress through the pipeline
                const randomProgress = Math.random();
                if (randomProgress > 0.7 && currentModuleIndex > 0) {
                    // Move backward in the pipeline (simulating processing at an earlier stage)
                    const newModule = modules[currentModuleIndex - 1];
                    setFailedModule(newModule);
                    setCurrentStepName(`Processing at ${newModule}`);
                    addLog(`Processing at ${newModule} module`);
                } else if (randomProgress > 0.4 && currentModuleIndex < modules.length - 1) {
                    // Move forward in the pipeline
                    const newModule = modules[currentModuleIndex + 1];
                    setFailedModule(newModule);
                    setCurrentStepName(`Processing at ${newModule}`);
                    addLog(`Processing at ${newModule} module`);
                }
            }

            // Stop polling if job is completed
            if (response.data.status === 'COMPLETED') {
                clearInterval(refreshInterval);
                setRefreshInterval(null);
                // When completed, set the failed module to null (all modules successful)
                setFailedModule(null);
                // Set architecture step to completed (5 or beyond)
                setCurrentArchStep(5);
                setCurrentStepName('Completed');
                // Clear processing partitions
                setProcessingPartitions([]);
            }
        } catch (error) {
            addLog(`Error fetching status: ${error.message}`);
        }
    };

    const addLog = (message) => {
        setLogs(prevLogs => [
            { id: Date.now(), message, timestamp: new Date().toLocaleTimeString() },
            ...prevLogs
        ]);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'FAILED':
                return 'error';
            case 'RUNNING':
                return 'warning';
            case 'COMPLETED':
                return 'success';
            case 'TRIGGERING':
                return 'info';
            case 'ERROR':
                return 'error';
            default:
                return 'default';
        }
    };

    if (!job) {
        return <LinearProgress />;
    }

    return (
        <Box sx={{ mt: 3 }}>
            <Button
                variant="outlined"
                onClick={() => navigate('/')}
                sx={{ mb: 2 }}
            >
                Back to Jobs List
            </Button>

            <Card>
                <CardContent>
                    {/* Dataset Summary Header */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', md: 'center' },
                        mb: 3,
                        pb: 2,
                        borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
                    }}>
                        <Box>
                            <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
                                {job.tableName}
                            </Typography>
                            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                Failed Date: <Chip label={job.partition} size="small" color="error" sx={{ ml: 1 }} />
                            </Typography>
                        </Box>

                        <Box sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 2,
                            mt: { xs: 2, md: 0 },
                            justifyContent: { xs: 'flex-start', md: 'flex-end' }
                        }}>
                            <Paper elevation={0} variant="outlined" sx={{ p: 1.5, minWidth: 120, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">Missing Dates</Typography>
                                <Typography variant="h6">{job.missingPartitions.length}</Typography>
                            </Paper>

                            <Paper elevation={0} variant="outlined" sx={{ p: 1.5, minWidth: 120, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">Processing</Typography>
                                <Typography variant="h6">{processingPartitions.length}</Typography>
                            </Paper>

                            <Paper elevation={0} variant="outlined" sx={{ p: 1.5, minWidth: 120, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">Retrigger Count</Typography>
                                <Typography variant="h6">{retriggeredCount}</Typography>
                            </Paper>
                        </Box>
                    </Box>

                    {/* Current Status Section */}
                    <Box sx={{ mb: 3 }}>
                        <Paper
                            elevation={0}
                            variant="outlined"
                            sx={{
                                p: 2,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                bgcolor: status === 'RUNNING' ? 'rgba(255, 152, 0, 0.1)' : 'transparent'
                            }}
                        >
                            <Box>
                                <Typography variant="h6">Current Status</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                    {status === 'RUNNING' ? (
                                        <HourglassEmptyIcon color="warning" sx={{ mr: 1 }} />
                                    ) : status === 'COMPLETED' ? (
                                        <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                                    ) : (
                                        <ErrorIcon color="error" sx={{ mr: 1 }} />
                                    )}
                                    <Typography variant="body1">
                                        {status === 'RUNNING' ? (
                                            <>
                                                <strong>Running:</strong> {currentStepName}
                                            </>
                                        ) : status === 'COMPLETED' ? (
                                            <strong>Completed Successfully</strong>
                                        ) : (
                                            <strong>Failed: {job.errorMessage}</strong>
                                        )}
                                    </Typography>
                                </Box>
                            </Box>

                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setShowPipelineFlow(!showPipelineFlow)}
                                endIcon={showPipelineFlow ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            >
                                {showPipelineFlow ? "Hide Pipeline Flow" : "View Pipeline Flow"}
                            </Button>
                        </Paper>
                    </Box>

                    {/* Date-wise Partition Status Timeline */}
                    <PartitionStatusTimeline
                        job={job}
                        currentPartition={job.partition}
                        missingPartitions={job.missingPartitions || []}
                        processingPartitions={processingPartitions}
                    />

                    {/* Pipeline Flow Visualization - Collapsible */}
                    {showPipelineFlow && (
                        <Box sx={{ mt: 3 }}>
                            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                            Pipeline Flow Status
                                        </Typography>
                                        {status && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                <Typography variant="body2" sx={{ mr: 1 }}>
                                                    Current Status:
                                                </Typography>
                                                <Chip
                                                    label={status}
                                                    color={
                                                        status === 'RUNNING' ? 'info' :
                                                            status === 'COMPLETED' ? 'success' :
                                                                status === 'FAILED' ? 'error' :
                                                                    'default'
                                                    }
                                                    size="small"
                                                />
                                            </Box>
                                        )}
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body2" sx={{ mr: 1 }}>
                                            Pipeline Type:
                                        </Typography>
                                        <Chip
                                            label={
                                                job.pipeline === "SOR->SFP->AWS" ? "TERADATA → DIAS2.0 → SFP → AWS" :
                                                    job.pipeline === "SOR->AWS" ? "TERADATA → DORA → AWS" :
                                                        "Direct Ingestion"
                                            }
                                            color="primary"
                                            size="small"
                                        />
                                    </Box>
                                </Box>

                                {/* Processing Step Indicator */}
                                {currentArchStep > 0 && (
                                    <Box sx={{ mb: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                                        <Typography variant="subtitle2" color="info.dark">
                                            Currently Processing: Step {currentArchStep}
                                            {currentArchStep === 1 && " - Fetching Data from Source"}
                                            {currentArchStep === 2 && " - Processing in Pipeline"}
                                            {currentArchStep === 3 && " - Validating Data"}
                                            {currentArchStep === 4 && " - Loading to Destination"}
                                        </Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={(currentArchStep / 4) * 100}
                                            sx={{ mt: 1, height: 8, borderRadius: 4 }}
                                        />
                                    </Box>
                                )}

                                <DatasetArchitectureFlow
                                    job={job}
                                    status={status}
                                    currentStep={currentArchStep}
                                    failedStep={failedModule}
                                    onTriggerConfirm={handleTriggerJob}
                                />
                            </Paper>
                        </Box>
                    )}

                    <Grid container spacing={2} sx={{ mt: 3 }}>
                        <Grid item xs={12}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Processing Logs
                                </Typography>
                                <List dense sx={{ maxHeight: 200, overflow: 'auto', bgcolor: 'background.paper' }}>
                                    {logs.map((log) => (
                                        <ListItem key={log.id} divider>
                                            <ListItemText
                                                primary={log.message}
                                                secondary={log.timestamp}
                                            />
                                        </ListItem>
                                    ))}
                                    {logs.length === 0 && (
                                        <ListItem>
                                            <ListItemText
                                                primary="No logs available yet"
                                                secondary="Trigger the job to see processing logs"
                                            />
                                        </ListItem>
                                    )}
                                </List>
                            </Paper>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );
};

export default JobDetails;