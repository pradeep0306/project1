import React from 'react';
import StorageIcon from '@mui/icons-material/Storage';
import CloudIcon from '@mui/icons-material/Cloud';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SendIcon from '@mui/icons-material/Send';
import LoopIcon from '@mui/icons-material/Loop';
import VerifiedIcon from '@mui/icons-material/Verified';
import DataObjectIcon from '@mui/icons-material/DataObject';
import SettingsIcon from '@mui/icons-material/Settings';
import BackupIcon from '@mui/icons-material/Backup';
import DatabaseIcon from '@mui/icons-material/Storage';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SourceIcon from '@mui/icons-material/Source';

// Define pipeline configurations for different dataset types
const pipelineConfigs = {
    // Dataset 1: TERADATA -> DIAS2.0 -> SFP -> AWS
    'TERADATA_DIAS2.0': {
        name: 'TERADATA to AWS via DIAS2.0',
        sourceSystem: 'TERADATA',
        steps: [
            { id: 'source', label: 'TERADATA', icon: <DatabaseIcon />, description: 'Source data from TERADATA database' },
            { id: 'identify', label: 'Identify Job', icon: <CompareArrowsIcon />, description: 'Identify job type based on dataset characteristics' },
            { id: 'prepare_dias', label: 'Prepare DIAS2.0', icon: <DataObjectIcon />, description: 'Prepare payload for DIAS2.0 processing' },
            { id: 'trigger_dias', label: 'Trigger DIAS2.0', icon: <SendIcon />, description: 'Trigger job in DIAS2.0 system' },
            { id: 'poll_dias', label: 'Poll DIAS2.0', icon: <LoopIcon />, description: 'Monitor DIAS2.0 job progress' },
            { id: 'file_check', label: 'File Check SFP', icon: <FileDownloadDoneIcon />, description: 'Verify files in SFP layer' },
            { id: 'prepare_aws', label: 'Prepare AWS', icon: <CloudUploadIcon />, description: 'Prepare SFP to AWS payload' },
            { id: 'trigger_aws', label: 'Trigger AWS', icon: <CloudSyncIcon />, description: 'Trigger AWS ingestion job' },
            { id: 'poll_aws', label: 'Poll AWS', icon: <CloudDownloadIcon />, description: 'Monitor AWS job progress' },
            { id: 'verify', label: 'Verify', icon: <VerifiedIcon />, description: 'Verify dataset is loaded successfully' }
        ]
    },

    // Dataset 2: TERADATA -> INTF1 -> SFP -> AWS
    'TERADATA_INTF1': {
        name: 'TERADATA to AWS via INTF1',
        sourceSystem: 'TERADATA',
        steps: [
            { id: 'source', label: 'TERADATA', icon: <DatabaseIcon />, description: 'Source data from TERADATA database' },
            { id: 'identify', label: 'Identify Job', icon: <CompareArrowsIcon />, description: 'Identify job type based on dataset characteristics' },
            { id: 'prepare_intf1', label: 'Prepare INTF1', icon: <DataObjectIcon />, description: 'Prepare payload for INTF1 processing' },
            { id: 'trigger_intf1', label: 'Trigger INTF1', icon: <SendIcon />, description: 'Trigger job in INTF1 system' },
            { id: 'poll_intf1', label: 'Poll INTF1', icon: <LoopIcon />, description: 'Monitor INTF1 job progress' },
            { id: 'file_check', label: 'File Check SFP', icon: <FileDownloadDoneIcon />, description: 'Verify files in SFP layer' },
            { id: 'prepare_aws', label: 'Prepare AWS', icon: <CloudUploadIcon />, description: 'Prepare SFP to AWS payload' },
            { id: 'trigger_aws', label: 'Trigger AWS', icon: <CloudSyncIcon />, description: 'Trigger AWS ingestion job' },
            { id: 'poll_aws', label: 'Poll AWS', icon: <CloudDownloadIcon />, description: 'Monitor AWS job progress' },
            { id: 'verify', label: 'Verify', icon: <VerifiedIcon />, description: 'Verify dataset is loaded successfully' }
        ]
    },

    // Dataset 3: CCBDL -> DORA
    'CCBDL_DORA': {
        name: 'CCBDL to AWS via DORA',
        sourceSystem: 'CCBDL',
        steps: [
            { id: 'source', label: 'CCBDL', icon: <SourceIcon />, description: 'Source data from CCBDL system' },
            { id: 'identify', label: 'Identify Job', icon: <CompareArrowsIcon />, description: 'Identify job type based on dataset characteristics' },
            { id: 'prepare_dora', label: 'Prepare DORA', icon: <DataObjectIcon />, description: 'Prepare CCBDL to DORA payload' },
            { id: 'trigger_ingestion', label: 'Trigger Ingestion', icon: <SendIcon />, description: 'Trigger ingestion in DORA' },
            { id: 'poll_ingestion', label: 'Poll Ingestion', icon: <LoopIcon />, description: 'Monitor ingestion job progress' },
            { id: 'prepare_truncation', label: 'Prepare Truncation', icon: <DeleteSweepIcon />, description: 'Prepare payload for truncation' },
            { id: 'trigger_truncation', label: 'Trigger Truncation', icon: <SendIcon />, description: 'Trigger truncation job' },
            { id: 'poll_truncation', label: 'Poll Truncation', icon: <LoopIcon />, description: 'Monitor truncation job progress' },
            { id: 'verify', label: 'Verify', icon: <VerifiedIcon />, description: 'Verify dataset is loaded successfully' }
        ]
    },

    // Dataset 4: Direct Ingestion
    'DIRECT_INGESTION': {
        name: 'Direct Ingestion to AWS',
        sourceSystem: 'Generic',
        steps: [
            { id: 'source', label: 'Dataset', icon: <StorageIcon />, description: 'Source dataset' },
            { id: 'identify', label: 'Identify Job', icon: <CompareArrowsIcon />, description: 'Identify job type based on dataset characteristics' },
            { id: 'prepare_ingestion', label: 'Prepare Ingestion', icon: <DataObjectIcon />, description: 'Prepare ingestion payload' },
            { id: 'trigger_ingestion', label: 'Trigger Ingestion', icon: <SendIcon />, description: 'Trigger ingestion job' },
            { id: 'poll_ingestion', label: 'Poll Ingestion', icon: <LoopIcon />, description: 'Monitor ingestion job progress' },
            { id: 'verify', label: 'Verify', icon: <VerifiedIcon />, description: 'Verify dataset is loaded successfully' }
        ]
    }
};

// Helper function to get pipeline config based on dataset characteristics
export const getPipelineConfig = (dataset) => {
    // This is a simplified logic - in a real application, you would have more sophisticated detection
    if (!dataset) return pipelineConfigs['DIRECT_INGESTION'];

    const sourceSystem = dataset.sourceSystem?.toUpperCase() || '';
    const pipelineType = dataset.pipelineType || '';

    if (sourceSystem === 'TERADATA' && pipelineType.includes('DIAS2.0')) {
        return pipelineConfigs['TERADATA_DIAS2.0'];
    } else if (sourceSystem === 'TERADATA' && pipelineType.includes('INTF1')) {
        return pipelineConfigs['TERADATA_INTF1'];
    } else if (sourceSystem === 'CCBDL' || pipelineType.includes('DORA')) {
        return pipelineConfigs['CCBDL_DORA'];
    } else {
        return pipelineConfigs['DIRECT_INGESTION'];
    }
};

export default pipelineConfigs;