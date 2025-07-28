import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Chip,
    Link,
    Box,
    Typography,
    CircularProgress,
    Tooltip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Dialog,
    DialogTitle,
    DialogContent,S
    DialogContentText,
    DialogActions,
    Badge,
    IconButton
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import StorageIcon from '@mui/icons-material/Storage';
import CloudIcon from '@mui/icons-material/Cloud';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import InfoIcon from '@mui/icons-material/Info';
import { triggerJob, getJobPayloadPreview } from '../services/api';

const FailedJobsTable = ({ jobs, onJobStatusChange }) => {
    const [triggeredJobs, setTriggeredJobs] = useState({});
    const [batchSizes, setBatchSizes] = useState({});
    const [c, setPayloadPreviewOpen] = useState(false);
    const [currentPayload, setCurrentPayload] = useState(null);
    const [selectedJobsId, setSelectedJobId] = useState(null);
    const [selectedPartitions, setSelectedPartitions] = useState({});
    const [partitionSelectionOpen, setPartitionSelectionOpen] = useState(false);

    // Function to render pipeline icons
    const renderPipelineIcons = (pipeline) => {
        const isPipelineSFP = pipeline.includes('SFP');

        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Tooltip title="Source System (SOR)">
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                        <StorageIcon />
                        <Typography variant="body2" sx={{ ml: 0.5 }}>SOR</Typography>
                    </Box>
                </Tooltip>

                <ArrowRightAltIcon sx={{ mx: 0.5 }} />

                {isPipelineSFP && (
                    <>
                        <Tooltip title="Processing Layer (SFP)">
                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'secondary.main' }}>
                                <FilterAltIcon />
                                <Typography variant="body2" sx={{ ml: 0.5 }}>SFP</Typography>
                            </Box>
                        </Tooltip>
                        <ArrowRightAltIcon sx={{ mx: 0.5 }} />
                    </>
                )}

                <Tooltip title="Destination (AWS)">
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'info.main' }}>
                        <CloudIcon />
                        <Typography variant="body2" sx={{ ml: 0.5 }}>AWS</Typography>
                    </Box>
                </Tooltip>
            </Box>
        );
    };
    const handleBatchSizeChange = (jobId, value) => {
        setBatchSizes(prev => ({ ...prev, [jobId]: value }));
    };

    const handleOpenPartitionSelection = (jobId) => {
        setSelectedJobId(jobId);

        // Initialize selected partitions if not already set
        if (!selectedPartitions[jobId]) {
            const job = jobs.find(j => j.id === jobId);
            // By default, select the failed partition and first few missing partitions based on batch size
            const batchSize = batchSizes[jobId] || 1;
            const initialSelected = {
                [job.partition]: true, // Always select the failed partition
                ...job.missingPartitions.slice(0, batchSize - 1).reduce((acc, partition) => {
                    acc[partition] = true;
                    return acc;
                }, {})
            };

            setSelectedPartitions(prev => ({
                ...prev,
                [jobId]: initialSelected
            }));
        }

        setPartitionSelectionOpen(true);
    };

    const handleTogglePartition = (jobId, partition) => {
        setSelectedPartitions(prev => ({
            ...prev,
            [jobId]: {
                ...prev[jobId],
                [partition]: !prev[jobId][partition]
            }
        }));
    };

    const handleSelectAllPartitions = (jobId) => {
        const job = jobs.find(j => j.id === jobId);
        const allPartitions = [job.partition, ...job.missingPartitions];

        setSelectedPartitions(prev => ({
            ...prev,
            [jobId]: allPartitions.reduce((acc, partition) => {
                acc[partition] = true;
                return acc;
            }, {})
        }));
    };

    const handleDeselectAllPartitions = (jobId) => {
        const job = jobs.find(j => j.id === jobId);
        const allPartitions = [job.partition, ...job.missingPartitions];

        setSelectedPartitions(prev => ({
            ...prev,
            [jobId]: allPartitions.reduce((acc, partition) => {
                acc[partition] = false;
                return acc;
            }, {})
        }));
    };

    const handleShowPayloadPreview = async (jobId) => {
        setSelectedJobId(jobId);

        try {
            const job = jobs.find(j => j.id === jobId);

            // Get selected partitions
            let partitionsToProcess;

            if (selectedPartitions[jobId]) {
                // Use manually selected partitions
                partitionsToProcess = Object.entries(selectedPartitions[jobId])
                    .filter(([
                        _, isSelected]) => isSelected)
                    .map(([partition]) => partition);
            } else {
                // Fallback to batch size selection
                const batchSize = batchSizes[jobId] || 1;
                partitionsToProcess =r [job.partition, ...job.missingPartitions.slice(0, batchSize - 1)];
            }

            const response = await getJobPayloadPreview(jobId, partitionsToProcess);
            setCurrentPayload(response.data);
            setPayloadPreviewOpen(true);
        } catch (error) {
            console.error('Error getting payload preview:', error);
        }
    };

    const handleTriggerJob = async (jobId) => {
        setTriggeredJobs(prev => ({
            ...prev,
            [jobId]: { status: 'TRIGGERING', loading: true }
        }));

        try {

            const job = jobs.find(j => j.id === jobId);

            // Get selected partitions
            let partitionsToProcess;

            if (selectedPartitions[jobId]) {
                // Use manually selected partitions
                partitionsToProcess = Object.entries(selectedPartitions[jobId])
                    .filter(([_, isSelected]) => isSelected)
                    .map(([partition]) => partition);
            } else {
                // Fallback to batch size selection
                const batchSize = batchSizes[jobId] || 1;
                partitionsToProcess = [job.partition, ...job.missingPartitions.slice(0, batchSize - 1)];
            }

            const response = await triggerJob(jobId, partitionsToProcess, partitionsToProcess.length);
            setTriggeredJobs(prev => ({
                ...prev,
                [jobId]: {
                    status: response.data.status,
                    loading: false,
                    message: response.data.message,
                    partitions: response.data.partitions
                }
            }));

            // Notify parent component about the status change
            if (onJobStatusChange) {
                onJasobStatusChange(jobId, response.data.status);
            }
        } catch (error) {
            setTriggeredJobs(prev => ({
                ...prev,
                [jobId]: {
                    status: 'ERROR',
                    loading: false,
                    message: error.message || 'Failed to trigger job'
                }
            }));
        }
    };

    const handleConfirmTrigger = async () => {
        setPayloadPreviewOpen(false);
        await handleTriggerJob(selectedJobId);
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

    return (
        <>
            <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table sx={{ minWidth: 650 }} aria-label="failed jobs table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Dataset Name</TableCell>
                            <TableCell>Failed Date</TableCell>
                            <TableCell>Missing Dates</TableCell>
                            <TableCell>Pipeline Type</TableCell>
                            <TableCell>Batch Size</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {jobs.map((job) => (
                            <TableRow
                                key={job.id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            ><TableCell component="th" scope="row">
                                    <Link
                                        component={RouterLink}
                                        to={`/job/${job.id}`}
                                        underline="hover"
                                        color="primary"
                                    >
                                        {job.tableName}
                                    </Link>
                                </TableCell>
                                <TableCell>{job.partition}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Chip
                                            label={`${job.missingPartitions.length} partition(s)`}
                                            color="error"
                                            variant="outlined"
                                            onClick={() => handleOpenPartitionSelection(job.id)}
                                            sx={{ cursor: 'pointer' }}
                                        />
                                        <Tooltip title="Click to view and select partitions">
                                            <IconButton size="small" sx={{ ml: 1 }}>
                                                <InfoIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </TableCell>

                                <TableCell>{job.pipeline}</TableCell>
                                <TableCell
                                    <FormControl variant="outlined" size="small" sx={{ minWidth: 80 }}>
                                        <Select
                                            value={batchSizes[job.id] || 1}
                                            onChange={(e) => handleBatchSizeChange(job.id, e.target.value)}
                                            disabled={!!triggeredJobs[job.id]?.loading}
                                        >
                                            {[...Array(Math.min(job.missingPartitions.length + 1, 10)).keys()].map(i => (
                                                <MenuItem key={i + 1} value={i + 1}>
                                                    {i + 1}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </TableCell>
                                <TableCell>
                                    {triggeredJobs[job.id]?.loading ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <CircularProgress size={24} sx={{ mr: 1 }} />
                                            <Typography variant="body2">Triggering...</Typography>
                                        </Box>
                                    ) : triggeredJobs[job.id]?.status === 'RUNNING' ? (
                                        <Box>
                                            <Chip
                                                label="Running"
                                                color="warning"
                                                size="small"
                                                sx={{ mb: 1 }}
                                            />
                                            {triggeredJobs[job.id]?.partitions && (
                                                <Typography variant="caption" display="block">
                                                    Processing {triggeredJobs[job.id].partitions.length} partition(s)
                                                </Typography>
                                            )}
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button
                                                variant="outlined"
                                                color="info"
                                                size="small"
                                                onClick={() => handleOpenPartitionSelection(job.id)}
                                            >
                                                Select Partitions
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                onClick={() => handleOpenPartitionSelection(job.id)}
                                            >
                                                Trigger
                                            </Button>
                                        </Box>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Partition Selection Dialog */}
            <Dialog
                open={partitionSelectionOpen}
                onClose={() => setPartitionSelectionOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Select Partitions to Process</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Select the partitions you want to process:
                    </DialogContentText>

                    {selectedJobId && jobs.find(j => j.id === selectedJobId) && (
                        <>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, mt: 2 }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleSelectAllPartitions(selectedJobId)}
                                >
                                    Select All
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleDeselectAllPartitions(selectedJobId)}
                                >
                                    Deselect All
                                </Button>
                            </Box>

                            <Paper sx={{ maxHeight: 300, overflow: 'auto', p: 2 }}>
                                {/* Failed partition */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>Failed Partition:</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                                        <Chip
                                            label={jobs.find(j => j.id === selectedJobId).partition}
                                            color="error"
                                            variant={selectedPartitions[selectedJobId]?.[jobs.find(j => j.id === selectedJobId).partition] ? "filled" : "outlined"}
                                            onClick={() => handleTogglePartition(
                                                selectedJobId,
                                                jobs.find(j => j.id === selectedJobId).partition
                                            )}
                                            sx={{ mr: 1, mb: 1 }}
                                        />
                                    </Box>
                                </Box>

                                {/* Missing partitions */}
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom>Missing Partitions:</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', ml: 2 }}>
                                        {jobs.find(j => j.id === selectedJobId).missingPartitions.map((partition, index) => (
                                            <Chip
                                                key={index}
                                                label={partition}
                                                color="primary"
                                                variant={selectedPartitions[selectedJobId]?.[partition] ? "filled" : "outlined"}
                                                onClick={() => handleTogglePartition(selectedJobId, partition)}
                                                sx={{ mr: 1, mb: 1 }}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            </Paper>

                            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                                Selected: {.
                                selectedPartitions[selectedJobId] ?
                                    Object.values([ ][selectedJobId]).filter(Boolean).length : 0
                            } partition(s)
                            </Typography>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPartitionSelectionOpen(false)}>Cancel</Button>
                    <Button
                        onClick={() => {
                            setPartitionSelectionOpen(false);
                            handleShowPayloadPreview(selectedJobId);
                        }}
                        variant="contained"
                        color="primary"
                    >
                        Continue to Preview
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Payload Preview Dialog */}
            <Dialog
                open={payloadPreviewOpen}
                onClose={() => setPayloadPreviewOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Confirm Job Trigger</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please review the payload before triggering the job:
                    </DialogContentText>

                    {currentPayload && (
                        <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.100', fontFamily: 'monospace' }}>
                            <Typography variant="subtitle1" gutterBottom>Table: {currentPayload.tableName}</Typography>
                            <Typography variant="subtitle2" gutterBottom>Pipeline: {currentPayload.pipeline}</Typography>
                            <Typography variant="subtitle2" gutterBottom>Source: {currentPayload.sourceSystem}</Typography>
                            <Typography varant="subtitle2" gutterBottom>Timestamp: {currentPayload.timestamp}</Typography>

                            <Typography variant="subtitle2" sx={{ mt: 2 }}>Partitions to process ({currentPayload.partitions.length}):</Typography>
                            <Box component="ul" sx={{ pl: 2, maxHeight: 200, overflow: 'auto' }}>
                                .{currentPayload.partitions.map((partition, index) => (
                                    <Typography component="li" key={index} variant="body2">
                                        {partition}
                                    </Typography>
                                ))}
                            </Box>
                        </Paper>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPayloadPreviewOpen(false)}>Cancel</Button>
                    <Button
                        onClick={() => {
                            setPayloadPreviewOpen(false);
                            setPartitionSelectionOpen(true);
                        }}
                        color="info"
                    >
                        Back to Selection
                    </Button><Button onClick={handleConfirmTrigger} variant="contained" color="primary">
                        Confirm & Trigger
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default FailedJobsTable;