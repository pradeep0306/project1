import axios from 'axios';

// This would be replaced with actual API endpoints in a real application
const API_BASE_URL = 'https://api.example.com';

// Mock data for development
const mockFailedJobs = [
    {
        id: 1,
        tableName: 'customer_data',
        partition: '2025-07-25',
        status: 'FAILED',
        pipeline: 'SOR->SFP->AWS',
        pipelineType: 'DIAS2.0',
        sourceSystem: 'TERADATA',
        errorMessage: 'Connection timeout in DIAS2.0 processing',
        failedStep: 'poll_dias',
        missingPartitions: ['2025-07-24', '2025-07-23', '2025-07-22']
    },
    {
        id: 2,
        tableName: 'order_history',
        partition: '2025-07-25',
        status: 'FAILED',
        pipeline: 'SOR->AWS',
        pipelineType: 'DORA',
        sourceSystem: 'CCBDL',
        errorMessage: 'Data validation error during ingestion',
        failedStep: 'trigger_ingestion',
        missingPartitions: ['2025-07-24', '2025-07-23']
    },
    {
        id: 3,
        tableName: 'product_inventory',
        partition: '2025-07-24',
        status: 'FAILED',
        pipeline: 'SOR->SFP->AWS',
        pipelineType: 'INTF1',
        sourceSystem: 'TERADATA',
        errorMessage: 'Missing required fields in INTF1 payload',
        failedStep: 'prepare_intf1',
        missingPartitions: ['2025-07-23', '2025-07-22', '2025-07-21', '2025-07-20']
    },
    {
        id: 4,
        tableName: 'user_activity',
        partition: '2025-07-25',
        status: 'FAILED',
        pipeline: 'SOR->AWS',
        pipelineType: 'DIRECT',
        sourceSystem: 'Generic',
        errorMessage: 'Schema mismatch during ingestion',
        failedStep: 'trigger_ingestion',
        missingPartitions: ['2025-07-24']
    },
];

// In a real application, these would be actual API calls
export const fetchFailedJobs = async () => {
    // Simulating API call with mock data
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ data: mockFailedJobs });
        }, 500);
    });

    // Real implementation would be:
    // return axios.get(`${API_BASE_URL}/jobs/failed`);
};

export const triggerJob = async (jobId, partitions = null, batchSize = 1) => {
    // Simulating API call
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                data: {
                    success: true,
                    message: 'Job triggered successfully',
                    jobId,
                    status: 'RUNNING',
                    partitions: partitions || [mockFailedJobs.find(job => job.id === jobId).partition],
                    batchSize: batchSize
                }
            });
        }, 1000);
    });

    // Real implementation would be:
    // return axios.post(`${API_BASE_URL}/jobs/${jobId}/trigger`, { partitions, batchSize });
};

export const getJobPayloadPreview = async (jobId, partitions = null) => {
    // Simulating API call to get payload preview
    const job = mockFailedJobs.find(job => job.id === jobId);

    if (!job) {
        return Promise.reject(new Error('Job not found'));
    }

    const partitionsToUse = partitions || [job.partition];

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                data: {
                    tableName: job.tableName,
                    partitions: partitionsToUse,
                    pipeline: job.pipelineType,
                    sourceSystem: job.sourceSystem,
                    timestamp: new Date().toISOString()
                }
            });
        }, 500);
    });
};

export const getJobStatus = async (jobId) => {
    // Simulating API call
    const job = mockFailedJobs.find(job => job.id === jobId);

    if (!job) {
        return Promise.reject(new Error('Job not found'));
    }

    return new Promise((resolve) => {
        setTimeout(() => {
            // Randomly return RUNNING or COMPLETED to simulate job progress
            const statuses = ['RUNNING', 'COMPLETED'];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

            // If status is RUNNING, include some processing partitions
            let processingPartitions = [];  l
            if (randomStatus === 'RUNNING') {
                // Randomly select 1-2 partitions from missing partitions to show as processing
                const numPartitions = Math.min(Math.floor(Math.random() * 2) + 1, job.missingPartitions.length);
                processingPartitions = job.missingPartitions.slice(0, numPartitions);
            }

            resolve({
                data: {
                    jobId,
                    status: randomStatus,
                    lastUpdated: new Date().toISOString(),
                    processingPartitions
                }
            });
        }, 800);
    });

    // Real implementation would be:
    // return axios.get(`${API_BASE_URL}/jobs/${jobId}/status`);
};