import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { proposalApi, rfpApi } from '../services/api';
import { toast } from 'react-toastify';

export default function ProposalCompare() {
  const { rfpId } = useParams<{ rfpId: string }>();
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [gettingRec, setGettingRec] = useState(false);
  const [rfp, setRfp] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [comparison, setComparison] = useState<any>(null);
  const [recommendation, setRecommendation] = useState<any>(null);

  useEffect(() => {
    if (rfpId) {
      loadData();
    }
  }, [rfpId]);

  const loadData = async () => {
    try {
      const [rfpResponse, proposalsResponse] = await Promise.all([
        rfpApi.getOne(rfpId!),
        proposalApi.getAll(rfpId),
      ]);

      setRfp(rfpResponse.data);
      setProposals(proposalsResponse.data);
    } catch (error: any) {
      toast.error('Failed to load proposals');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    setComparing(true);

    try {
      const response = await proposalApi.compareProposals(rfpId!);
      setComparison(response.data.comparison);
      setProposals(response.data.proposals);
      toast.success('Proposals compared successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to compare proposals');
      console.error(error);
    } finally {
      setComparing(false);
    }
  };

  const handleGetRecommendation = async () => {
    setGettingRec(true);

    try {
      const response = await proposalApi.getRecommendation(rfpId!);
      setRecommendation(response.data.recommendation);
      setComparison(response.data.comparison);
      setProposals(response.data.proposals);
      toast.success('Recommendation generated!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate recommendation');
      console.error(error);
    } finally {
      setGettingRec(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!rfp || proposals.length === 0) {
    return (
      <Box>
        <Typography variant="h4" mb={3}>
          Proposal Comparison
        </Typography>
        <Alert severity="info">
          No proposals found for this RFP. Please add proposals first.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Compare Proposals - {rfp.title}
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<CompareArrowsIcon />}
            onClick={handleCompare}
            disabled={comparing || gettingRec}
          >
            {comparing ? 'Comparing...' : 'Compare with AI'}
          </Button>
          <Button
            variant="contained"
            startIcon={<ThumbUpIcon />}
            onClick={handleGetRecommendation}
            disabled={comparing || gettingRec}
          >
            {gettingRec ? 'Generating...' : 'Get Recommendation'}
          </Button>
        </Box>
      </Box>

      {/* Recommendation Section */}
      {recommendation && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'success.light', color: 'white' }}>
          <Typography variant="h5" mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            🎯 AI Recommendation
          </Typography>
          <Box mb={2}>
            <Typography variant="h6">
              Recommended Vendor: {recommendation.recommendedVendorName || recommendation.recommendedVendor || 'N/A'}
            </Typography>
          </Box>
          
          {(recommendation.justification || recommendation.reasoning) && (
            <Box mb={2}>
              <Typography variant="body1" mb={1}>
                <strong>Reasoning:</strong>
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {recommendation.justification || recommendation.reasoning}
              </Typography>
            </Box>
          )}
          
          {recommendation.keyStrengths && recommendation.keyStrengths.length > 0 && (
            <Box mb={2}>
              <Typography variant="body2" mb={1}>
                <strong>Key Strengths:</strong>
              </Typography>
              <ul style={{ margin: 0 }}>
                {recommendation.keyStrengths.map((strength: string, idx: number) => (
                  <li key={idx}>{strength}</li>
                ))}
              </ul>
            </Box>
          )}

          {(recommendation.risks && recommendation.risks.length > 0) && (
            <Box mb={2}>
              <Typography variant="body2" mb={1}>
                <strong>Risk Factors:</strong>
              </Typography>
              <ul style={{ margin: 0 }}>
                {recommendation.risks.map((risk: string, idx: number) => (
                  <li key={idx}>{risk}</li>
                ))}
              </ul>
            </Box>
          )}

          {recommendation.mitigationStrategies && recommendation.mitigationStrategies.length > 0 && (
            <Box mb={2}>
              <Typography variant="body2" mb={1}>
                <strong>Mitigation Strategies:</strong>
              </Typography>
              <ul style={{ margin: 0 }}>
                {recommendation.mitigationStrategies.map((strategy: string, idx: number) => (
                  <li key={idx}>{strategy}</li>
                ))}
              </ul>
            </Box>
          )}

          {(recommendation.alternativeVendor || (recommendation.alternatives && recommendation.alternatives.length > 0)) && (
            <Box mb={2}>
              <Typography variant="body2" mb={1}>
                <strong>Alternative Options:</strong>
              </Typography>
              {recommendation.alternativeVendor ? (
                <Typography variant="body2">{recommendation.alternativeVendor}</Typography>
              ) : (
                <ul style={{ margin: 0 }}>
                  {recommendation.alternatives.map((alt: string, idx: number) => (
                    <li key={idx}>{alt}</li>
                  ))}
                </ul>
              )}
            </Box>
          )}

          {recommendation.nextSteps && recommendation.nextSteps.length > 0 && (
            <Box>
              <Typography variant="body2" mb={1}>
                <strong>Next Steps:</strong>
              </Typography>
              <ul style={{ margin: 0 }}>
                {recommendation.nextSteps.map((step: string, idx: number) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </Box>
          )}
        </Paper>
      )}

      {/* Comparison Summary */}
      {comparison && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" mb={2}>
            Comparison Summary
          </Typography>
          
          {/* Display analysis text if available */}
          {comparison.analysis && (
            <Box mb={3}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {comparison.analysis}
              </Typography>
            </Box>
          )}

          {/* Display scores if available */}
          {comparison.scores && comparison.scores.length > 0 && (
            <Box mb={3}>
              <Typography variant="subtitle1" mb={2}>
                <strong>Vendor Scores:</strong>
              </Typography>
              <Grid container spacing={2}>
                {comparison.scores.map((scoreData: any, idx: number) => (
                  <Grid item xs={12} md={6} key={idx}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="h6">{scoreData.vendorName}</Typography>
                          <Chip 
                            label={`${scoreData.score}/100`}
                            color={scoreData.score >= 80 ? 'success' : scoreData.score >= 60 ? 'warning' : 'default'}
                          />
                        </Box>
                        {scoreData.strengths && scoreData.strengths.length > 0 && (
                          <Box mb={1}>
                            <Typography variant="body2" color="success.main">
                              <strong>Strengths:</strong>
                            </Typography>
                            <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                              {scoreData.strengths.map((strength: string, i: number) => (
                                <li key={i}><Typography variant="body2">{strength}</Typography></li>
                              ))}
                            </ul>
                          </Box>
                        )}
                        {scoreData.weaknesses && scoreData.weaknesses.length > 0 && (
                          <Box>
                            <Typography variant="body2" color="error.main">
                              <strong>Weaknesses:</strong>
                            </Typography>
                            <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                              {scoreData.weaknesses.map((weakness: string, i: number) => (
                                <li key={i}><Typography variant="body2">{weakness}</Typography></li>
                              ))}
                            </ul>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Legacy format support */}
          {comparison.comparison && (
            <>
              <Grid container spacing={2} mb={2}>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Best Price
                  </Typography>
                  <Typography variant="h6">{comparison.comparison.bestPrice}</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Best Delivery
                  </Typography>
                  <Typography variant="h6">{comparison.comparison.bestDelivery}</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Best Warranty
                  </Typography>
                  <Typography variant="h6">{comparison.comparison.bestWarranty}</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Most Compliant
                  </Typography>
                  <Typography variant="h6">{comparison.comparison.mostCompliant}</Typography>
                </Grid>
              </Grid>
            </>
          )}

          {comparison.summary && (
            <Box mt={2}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {comparison.summary}
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* Proposals List */}
      <Typography variant="h6" mb={2}>
        All Proposals ({proposals.length})
      </Typography>

      <Grid container spacing={2} mb={3}>
        {proposals.map((proposal) => (
          <Grid item xs={12} md={6} key={proposal.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Box>
                    <Typography variant="h6">{proposal.vendor.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {proposal.vendor.email}
                    </Typography>
                  </Box>
                  {proposal.aiScore && (
                    <Chip
                      label={`Score: ${proposal.aiScore}/100`}
                      color={proposal.aiScore >= 80 ? 'success' : proposal.aiScore >= 60 ? 'warning' : 'default'}
                    />
                  )}
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Pricing
                    </Typography>
                    <Typography variant="body1">
                      {proposal.pricing ? `$${proposal.pricing.toLocaleString()}` : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Delivery
                    </Typography>
                    <Typography variant="body1">{proposal.deliveryTime || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Warranty
                    </Typography>
                    <Typography variant="body1">{proposal.warranty || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Payment Terms
                    </Typography>
                    <Typography variant="body1">{proposal.paymentTerms || 'N/A'}</Typography>
                  </Grid>
                </Grid>

                {proposal.aiRecommendation && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <Typography variant="body2">{proposal.aiRecommendation}</Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Detailed Comparison Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Typography variant="h6" sx={{ p: 2 }}>
          Detailed Comparison
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vendor</TableCell>
                <TableCell>Pricing</TableCell>
                <TableCell>Delivery Time</TableCell>
                <TableCell>Warranty</TableCell>
                <TableCell>Payment Terms</TableCell>
                <TableCell>AI Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {proposals.map((proposal) => (
                <TableRow key={proposal.id}>
                  <TableCell>{proposal.vendor.name}</TableCell>
                  <TableCell>
                    {proposal.pricing ? `$${proposal.pricing.toLocaleString()}` : 'N/A'}
                  </TableCell>
                  <TableCell>{proposal.deliveryTime || 'N/A'}</TableCell>
                  <TableCell>{proposal.warranty || 'N/A'}</TableCell>
                  <TableCell>{proposal.paymentTerms || 'N/A'}</TableCell>
                  <TableCell>
                    {proposal.aiScore ? (
                      <Chip
                        label={proposal.aiScore}
                        size="small"
                        color={
                          proposal.aiScore >= 80
                            ? 'success'
                            : proposal.aiScore >= 60
                            ? 'warning'
                            : 'default'
                        }
                      />
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
