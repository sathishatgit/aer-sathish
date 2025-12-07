import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Paper,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { rfpApi, vendorApi } from '../services/api';
import { toast } from 'react-toastify';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    rfp: { total: 0, draft: 0, sent: 0, completed: 0 },
    vendor: { total: 0, withProposals: 0, withoutProposals: 0 },
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [rfpStats, vendorStats] = await Promise.all([
        rfpApi.getStats(),
        vendorApi.getStats(),
      ]);

      setStats({
        rfp: rfpStats.data,
        vendor: vendorStats.data,
      });
    } catch (error: any) {
      toast.error('Failed to load statistics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Dashboard
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

      <Grid container spacing={3}>
        {/* RFP Stats */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <DescriptionIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">Total RFPs</Typography>
              </Box>
              <Typography variant="h3">{stats.rfp.total}</Typography>
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">
                  Draft: {stats.rfp.draft} | Sent: {stats.rfp.sent} | Completed:{' '}
                  {stats.rfp.completed}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Vendor Stats */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PeopleIcon color="secondary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">Total Vendors</Typography>
              </Box>
              <Typography variant="h3">{stats.vendor.total}</Typography>
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">
                  With Proposals: {stats.vendor.withProposals}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/rfps/create')}
                >
                  Create RFP
                </Button>
                <Button variant="outlined" fullWidth onClick={() => navigate('/rfps')}>
                  View All RFPs
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/vendors')}
                >
                  Manage Vendors
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Info */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AssessmentIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">System Info</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                AI-powered RFP management with automated proposal parsing and comparison
              </Typography>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => navigate('/prompts')}
              >
                Manage AI Prompts
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity Section */}
      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h5" mb={2}>
          Welcome to RFP Management System
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This system helps you manage the entire RFP lifecycle:
        </Typography>
        <Box component="ul" sx={{ mt: 2 }}>
          <li>
            <Typography variant="body2">
              Create RFPs from natural language descriptions using AI
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              Manage vendors and send RFPs via email
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              Automatically parse vendor proposals with AI
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              Compare proposals and get AI-powered recommendations
            </Typography>
          </li>
        </Box>
      </Paper>
    </Box>
  );
}
