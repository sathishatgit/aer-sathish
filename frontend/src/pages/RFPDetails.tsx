import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  Card,
  CardContent,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AddIcon from '@mui/icons-material/Add';
import { rfpApi, vendorApi, proposalApi } from '../services/api';
import { toast } from 'react-toastify';

export default function RFPDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rfp, setRfp] = useState<any>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [proposalDialogOpen, setProposalDialogOpen] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  
  // Proposal creation state
  const [proposalData, setProposalData] = useState({
    vendorId: '',
    rawContent: '',
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      const [rfpResponse, vendorsResponse] = await Promise.all([
        rfpApi.getOne(id!),
        vendorApi.getAll(),
      ]);

      setRfp(rfpResponse.data);
      setVendors(vendorsResponse.data);
    } catch (error: any) {
      toast.error('Failed to load RFP details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRFP = async () => {
    if (selectedVendors.length === 0) {
      toast.error('Please select at least one vendor');
      return;
    }

    setSending(true);

    try {
      await rfpApi.sendToVendors(id!, selectedVendors);
      toast.success('RFP sent successfully!');
      setSendDialogOpen(false);
      setSelectedVendors([]);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send RFP');
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const handleCreateProposal = async () => {
    if (!proposalData.vendorId || !proposalData.rawContent) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await proposalApi.create({
        rfpId: id,
        vendorId: proposalData.vendorId,
        rawContent: proposalData.rawContent,
      });

      toast.success('Proposal created and parsed successfully!');
      setProposalDialogOpen(false);
      setProposalData({ vendorId: '', rawContent: '' });
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create proposal');
      console.error(error);
    }
  };

  const handleCompareProposals = () => {
    navigate(`/proposals/${id}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!rfp) {
    return <Typography>RFP not found</Typography>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {rfp.title}
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<SendIcon />}
            onClick={() => setSendDialogOpen(true)}
          >
            Send to Vendors
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setProposalDialogOpen(true)}
          >
            Add Proposal
          </Button>
          {rfp.proposals && rfp.proposals.length > 0 && (
            <Button
              variant="contained"
              startIcon={<CompareArrowsIcon />}
              onClick={handleCompareProposals}
            >
              Compare Proposals
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* RFP Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              RFP Details
            </Typography>

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              <Chip label={rfp.status} color="primary" />
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body1">{rfp.description}</Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Budget
                </Typography>
                <Typography variant="body1">
                  {rfp.budget ? `$${rfp.budget.toLocaleString()}` : 'N/A'}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Deadline
                </Typography>
                <Typography variant="body1">
                  {rfp.deadline ? new Date(rfp.deadline).toLocaleDateString() : 'N/A'}
                </Typography>
              </Grid>
            </Grid>

            {rfp.requirements && (
              <Box mt={3}>
                <Typography variant="h6" mb={1}>
                  Requirements
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(rfp.requirements, null, 2)}
                  </pre>
                </Paper>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Vendors */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" mb={2}>
              Vendors ({rfp.rfpVendors?.length || 0})
            </Typography>
            {rfp.rfpVendors && rfp.rfpVendors.length > 0 ? (
              rfp.rfpVendors.map((rv: any) => (
                <Box key={rv.id} mb={1}>
                  <Typography variant="body2">{rv.vendor.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {rv.emailSent ? '✓ Email sent' : 'Not sent'}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No vendors added yet
              </Typography>
            )}
          </Paper>

          {/* Proposals */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>
              Proposals ({rfp.proposals?.length || 0})
            </Typography>
            {rfp.proposals && rfp.proposals.length > 0 ? (
              rfp.proposals.map((proposal: any) => (
                <Card key={proposal.id} sx={{ mb: 1 }}>
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="body2" fontWeight="bold">
                      {proposal.vendor.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {proposal.pricing ? `$${proposal.pricing.toLocaleString()}` : 'N/A'}
                    </Typography>
                    {proposal.aiScore && (
                      <Chip
                        label={`Score: ${proposal.aiScore}`}
                        size="small"
                        color="primary"
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No proposals received yet
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Send RFP Dialog */}
      <Dialog open={sendDialogOpen} onClose={() => setSendDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send RFP to Vendors</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Select vendors to send this RFP to:
          </Typography>
          <FormGroup>
            {vendors.map((vendor) => (
              <FormControlLabel
                key={vendor.id}
                control={
                  <Checkbox
                    checked={selectedVendors.includes(vendor.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedVendors([...selectedVendors, vendor.id]);
                      } else {
                        setSelectedVendors(selectedVendors.filter((id) => id !== vendor.id));
                      }
                    }}
                  />
                }
                label={`${vendor.name} (${vendor.email})`}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendDialogOpen(false)} disabled={sending}>
            Cancel
          </Button>
          <Button
            onClick={handleSendRFP}
            variant="contained"
            disabled={sending || selectedVendors.length === 0}
          >
            {sending ? 'Sending...' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Proposal Dialog */}
      <Dialog
        open={proposalDialogOpen}
        onClose={() => setProposalDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Vendor Proposal</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Paste the vendor's email response. AI will automatically parse the details.
          </Typography>

          <TextField
            select
            fullWidth
            label="Vendor"
            value={proposalData.vendorId}
            onChange={(e) => setProposalData({ ...proposalData, vendorId: e.target.value })}
            SelectProps={{ native: true }}
            sx={{ mb: 2 }}
          >
            <option value="">Select a vendor</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name} ({vendor.email})
              </option>
            ))}
          </TextField>

          <TextField
            fullWidth
            multiline
            rows={10}
            label="Vendor Response (Email Content)"
            placeholder="Paste the vendor's email response here..."
            value={proposalData.rawContent}
            onChange={(e) =>
              setProposalData({ ...proposalData, rawContent: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProposalDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateProposal}
            variant="contained"
            disabled={!proposalData.vendorId || !proposalData.rawContent}
          >
            Parse with AI & Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
