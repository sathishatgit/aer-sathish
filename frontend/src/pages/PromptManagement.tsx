import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  MenuItem,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { promptApi } from '../services/api';
import { toast } from 'react-toastify';

export default function PromptManagement() {
  const [loading, setLoading] = useState(true);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    promptType: 'RFP_CREATION',
    template: '',
    isActive: true,
  });

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      const response = await promptApi.getAll();
      setPrompts(response.data);
    } catch (error: any) {
      toast.error('Failed to load prompts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (prompt?: any) => {
    if (prompt) {
      setEditingPrompt(prompt);
      setFormData({
        name: prompt.name,
        description: prompt.description || '',
        promptType: prompt.promptType,
        template: prompt.template,
        isActive: prompt.isActive,
      });
    } else {
      setEditingPrompt(null);
      setFormData({
        name: '',
        description: '',
        promptType: 'RFP_CREATION',
        template: '',
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPrompt(null);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.template) {
      toast.error('Name and template are required');
      return;
    }

    try {
      if (editingPrompt) {
        await promptApi.update(editingPrompt.id, formData);
        toast.success('Prompt updated successfully');
      } else {
        await promptApi.create(formData);
        toast.success('Prompt created successfully');
      }
      handleCloseDialog();
      loadPrompts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save prompt');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this prompt?')) {
      return;
    }

    try {
      await promptApi.delete(id);
      toast.success('Prompt deleted successfully');
      loadPrompts();
    } catch (error: any) {
      toast.error('Failed to delete prompt');
      console.error(error);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'promptType',
      headerName: 'Type',
      width: 180,
      renderCell: (params) => (
        <Chip label={params.value.replace(/_/g, ' ')} size="small" />
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      minWidth: 250,
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'updatedAt',
      headerName: 'Updated',
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
            onClick={() => handleOpenDialog(params.row)}
          >
            <EditIcon />
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
          AI Prompt Management
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" mb={3}>
        Manage AI prompts used for RFP creation, proposal parsing, comparison, and recommendations.
        You can edit these prompts to customize how the AI processes your data.
      </Typography>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={prompts}
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

      {/* Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            sx={{ mt: 2, mb: 2 }}
            disabled={!!editingPrompt}
          />

          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            select
            fullWidth
            label="Prompt Type"
            value={formData.promptType}
            onChange={(e) => setFormData({ ...formData, promptType: e.target.value })}
            sx={{ mb: 2 }}
            disabled={!!editingPrompt}
          >
            <MenuItem value="RFP_CREATION">RFP Creation</MenuItem>
            <MenuItem value="PROPOSAL_PARSING">Proposal Parsing</MenuItem>
            <MenuItem value="PROPOSAL_COMPARISON">Proposal Comparison</MenuItem>
            <MenuItem value="RECOMMENDATION">Recommendation</MenuItem>
          </TextField>

          <TextField
            fullWidth
            multiline
            rows={12}
            label="Prompt Template"
            value={formData.template}
            onChange={(e) => setFormData({ ...formData, template: e.target.value })}
            required
            helperText="Use placeholders like {input}, {emailContent}, {rfpRequirements}, etc."
            sx={{ mb: 2 }}
          />

          <TextField
            select
            fullWidth
            label="Status"
            value={formData.isActive ? 'active' : 'inactive'}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.value === 'active' })
            }
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPrompt ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
