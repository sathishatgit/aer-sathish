import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { rfpApi } from '../services/api';
import { toast } from 'react-toastify';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function RFPCreate() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  // Natural Language Form
  const [nlInput, setNlInput] = useState('');

  // Structured Form
  const [structuredData, setStructuredData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleNLSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nlInput.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setLoading(true);

    try {
      const response = await rfpApi.createFromNL(nlInput);
      toast.success('RFP created successfully with AI!');
      navigate(`/rfps/${response.data.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create RFP');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStructuredSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!structuredData.title || !structuredData.description) {
      toast.error('Title and description are required');
      return;
    }

    setLoading(true);

    try {
      const data = {
        ...structuredData,
        budget: structuredData.budget ? parseFloat(structuredData.budget) : undefined,
        deadline: structuredData.deadline || undefined,
      };

      const response = await rfpApi.create(data);
      toast.success('RFP created successfully!');
      navigate(`/rfps/${response.data.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create RFP');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" mb={3}>
        Create New RFP
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="rfp creation tabs">
            <Tab label="Natural Language (AI)" />
            <Tab label="Structured Form" />
          </Tabs>
        </Box>

        {/* Natural Language Tab */}
        <TabPanel value={tabValue} index={0}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Describe your procurement needs in natural language, and our AI will structure it
            into an RFP for you.
          </Alert>

          <Box component="form" onSubmit={handleNLSubmit}>
            <TextField
              fullWidth
              multiline
              rows={10}
              label="Describe your procurement needs"
              placeholder="Example: I need to procure laptops and monitors for our new office. Budget is $50,000 total. Need delivery within 30 days. We need 20 laptops with 16GB RAM and 15 monitors 27-inch. Payment terms should be net 30, and we need at least 1 year warranty."
              value={nlInput}
              onChange={(e) => setNlInput(e.target.value)}
              disabled={loading}
            />

            <Box mt={3} display="flex" gap={2}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading || !nlInput.trim()}
                startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
              >
                {loading ? 'Processing with AI...' : 'Create RFP with AI'}
              </Button>
              <Button variant="outlined" onClick={() => navigate('/rfps')} disabled={loading}>
                Cancel
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* Structured Form Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box component="form" onSubmit={handleStructuredSubmit}>
            <TextField
              fullWidth
              label="Title"
              value={structuredData.title}
              onChange={(e) =>
                setStructuredData({ ...structuredData, title: e.target.value })
              }
              disabled={loading}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              multiline
              rows={6}
              label="Description"
              value={structuredData.description}
              onChange={(e) =>
                setStructuredData({ ...structuredData, description: e.target.value })
              }
              disabled={loading}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              type="number"
              label="Budget"
              value={structuredData.budget}
              onChange={(e) =>
                setStructuredData({ ...structuredData, budget: e.target.value })
              }
              disabled={loading}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              type="date"
              label="Deadline"
              InputLabelProps={{ shrink: true }}
              value={structuredData.deadline}
              onChange={(e) =>
                setStructuredData({ ...structuredData, deadline: e.target.value })
              }
              disabled={loading}
              sx={{ mb: 2 }}
            />

            <Box mt={3} display="flex" gap={2}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
              >
                {loading ? 'Creating...' : 'Create RFP'}
              </Button>
              <Button variant="outlined" onClick={() => navigate('/rfps')} disabled={loading}>
                Cancel
              </Button>
            </Box>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
}
