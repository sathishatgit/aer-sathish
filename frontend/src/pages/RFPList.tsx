import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Chip,
  IconButton,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { rfpApi } from '../services/api';
import { toast } from 'react-toastify';

export default function RFPList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rfps, setRfps] = useState<any[]>([]);

  useEffect(() => {
    loadRFPs();
  }, []);

  const loadRFPs = async () => {
    try {
      const response = await rfpApi.getAll();
      setRfps(response.data);
    } catch (error: any) {
      toast.error('Failed to load RFPs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this RFP?')) {
      return;
    }

    try {
      await rfpApi.delete(id);
      toast.success('RFP deleted successfully');
      loadRFPs();
    } catch (error: any) {
      toast.error('Failed to delete RFP');
      console.error(error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      DRAFT: 'default',
      SENT: 'info',
      IN_PROGRESS: 'warning',
      EVALUATING: 'secondary',
      COMPLETED: 'success',
      CANCELLED: 'error',
    };
    return colors[status] || 'default';
  };

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'budget',
      headerName: 'Budget',
      width: 120,
      valueFormatter: (params) =>
        params.value ? `$${params.value.toLocaleString()}` : 'N/A',
    },
    {
      field: 'deadline',
      headerName: 'Deadline',
      width: 120,
      valueFormatter: (params) =>
        params.value ? new Date(params.value).toLocaleDateString() : 'N/A',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip label={params.value} color={getStatusColor(params.value)} size="small" />
      ),
    },
    {
      field: 'proposalsCount',
      headerName: 'Proposals',
      width: 100,
      valueGetter: (params) => params.row.proposals?.length || 0,
    },
    {
      field: 'vendorsCount',
      headerName: 'Vendors',
      width: 100,
      valueGetter: (params) => params.row.rfpVendors?.length || 0,
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            color="primary"
            onClick={() => navigate(`/rfps/${params.row.id}`)}
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          RFPs
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/rfps/create')}
        >
          Create New RFP
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rfps}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
        />
      </Paper>
    </Box>
  );
}
