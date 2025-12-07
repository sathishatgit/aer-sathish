import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// RFP APIs
export const rfpApi = {
  createFromNL: (naturalLanguageInput: string) =>
    api.post('/rfps/create-from-nl', { naturalLanguageInput }),
  
  create: (data: any) => api.post('/rfps', data),
  
  getAll: () => api.get('/rfps'),
  
  getOne: (id: string) => api.get(`/rfps/${id}`),
  
  update: (id: string, data: any) => api.put(`/rfps/${id}`, data),
  
  delete: (id: string) => api.delete(`/rfps/${id}`),
  
  sendToVendors: (id: string, vendorIds: string[]) =>
    api.post(`/rfps/${id}/send`, { vendorIds }),
  
  getStats: () => api.get('/rfps/stats'),
};

// Vendor APIs
export const vendorApi = {
  create: (data: any) => api.post('/vendors', data),
  
  getAll: () => api.get('/vendors'),
  
  getOne: (id: string) => api.get(`/vendors/${id}`),
  
  update: (id: string, data: any) => api.put(`/vendors/${id}`, data),
  
  delete: (id: string) => api.delete(`/vendors/${id}`),
  
  getStats: () => api.get('/vendors/stats'),
};

// Proposal APIs
export const proposalApi = {
  create: (data: any) => api.post('/proposals', data),
  
  getAll: (rfpId?: string) =>
    api.get('/proposals', { params: rfpId ? { rfpId } : {} }),
  
  getOne: (id: string) => api.get(`/proposals/${id}`),
  
  update: (id: string, data: any) => api.put(`/proposals/${id}`, data),
  
  delete: (id: string) => api.delete(`/proposals/${id}`),
  
  compareProposals: (rfpId: string) =>
    api.post(`/proposals/rfp/${rfpId}/compare`),
  
  getRecommendation: (rfpId: string) =>
    api.post(`/proposals/rfp/${rfpId}/recommend`),
};

// Prompt APIs
export const promptApi = {
  create: (data: any) => api.post('/prompts', data),
  
  getAll: (type?: string) =>
    api.get('/prompts', { params: type ? { type } : {} }),
  
  getOne: (id: string) => api.get(`/prompts/${id}`),
  
  update: (id: string, data: any) => api.put(`/prompts/${id}`, data),
  
  delete: (id: string) => api.delete(`/prompts/${id}`),
};

export default api;
