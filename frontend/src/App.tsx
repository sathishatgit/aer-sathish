import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RFPList from './pages/RFPList';
import RFPCreate from './pages/RFPCreate';
import RFPDetails from './pages/RFPDetails';
import VendorList from './pages/VendorList';
import ProposalCompare from './pages/ProposalCompare';
import PromptManagement from './pages/PromptManagement';

function App() {
  return (
    <Layout>
      <Box sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rfps" element={<RFPList />} />
          <Route path="/rfps/create" element={<RFPCreate />} />
          <Route path="/rfps/:id" element={<RFPDetails />} />
          <Route path="/vendors" element={<VendorList />} />
          <Route path="/proposals/:rfpId" element={<ProposalCompare />} />
          <Route path="/prompts" element={<PromptManagement />} />
        </Routes>
      </Box>
    </Layout>
  );
}

export default App;
