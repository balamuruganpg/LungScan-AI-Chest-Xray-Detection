import axios from 'axios';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // In live production browser environment (e.g., medrag.in), use current window origin if not on localhost
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return window.location.origin;
  }
  return 'http://127.0.0.1:8000';
};

const API_BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

export const predictXRay = async (imageFile, patientId = null, doctorId = null, symptoms = []) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  if (patientId) formData.append('patient_id', patientId);
  if (doctorId) formData.append('doctor_id', doctorId);
  if (symptoms && symptoms.length > 0) {
    formData.append('symptoms', JSON.stringify(symptoms));
  }

  try {
    const response = await apiClient.post('/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (err) {
    const errDetail = err.response?.data?.detail || err.message || 'X-Ray analysis request failed.';
    throw new Error(errDetail);
  }
};

export const getPatientScans = async (patientId) => {
  try {
    const response = await apiClient.get(`/api/scans/patient?patient_id=${patientId}`);
    return response.data || [];
  } catch (err) {
    console.warn("API getPatientScans warning:", err);
    return [];
  }
};

export const getDoctorPatients = async (doctorId) => {
  try {
    const response = await apiClient.get(`/api/doctors/patients?doctor_id=${doctorId}`);
    return response.data || [];
  } catch (err) {
    console.warn("API getDoctorPatients warning:", err);
    return [];
  }
};

export const getDoctorCapacity = async () => {
  try {
    const response = await apiClient.get('/api/doctors/capacity');
    return response.data || [];
  } catch (err) {
    console.warn("API getDoctorCapacity warning:", err);
    return [];
  }
};

export const autoAssignDoctor = async (patientId) => {
  try {
    const response = await apiClient.post(`/api/patients/assign-doctor?patient_id=${patientId}`);
    return response.data;
  } catch (err) {
    console.warn("API autoAssignDoctor warning:", err);
    return null;
  }
};

// ── Admin API Service Calls ──────────────────────────────────────────────────
export const getAdminStats = async () => {
  try {
    const response = await apiClient.get('/api/admin/stats');
    return response.data || {};
  } catch (err) {
    console.warn("API getAdminStats warning:", err);
    return {};
  }
};

export const getAdminDoctors = async () => {
  try {
    const response = await apiClient.get('/api/admin/doctors');
    return response.data || [];
  } catch (err) {
    console.warn("API getAdminDoctors warning:", err);
    return [];
  }
};

export const updateDoctorStatus = async (doctorId, updateData) => {
  try {
    const response = await apiClient.put(`/api/admin/doctors/${doctorId}`, updateData);
    return response.data;
  } catch (err) {
    console.warn("API updateDoctorStatus warning:", err);
    return null;
  }
};

export const getAdminPatients = async () => {
  try {
    const response = await apiClient.get('/api/admin/patients');
    return response.data || [];
  } catch (err) {
    console.warn("API getAdminPatients warning:", err);
    return [];
  }
};

export const reassignPatientDoctor = async (patientId, newDoctorId) => {
  try {
    const response = await apiClient.put(`/api/admin/patients/${patientId}/reassign`, { new_doctor_id: newDoctorId });
    return response.data;
  } catch (err) {
    console.warn("API reassignPatientDoctor warning:", err);
    return null;
  }
};

export const getAdminScans = async () => {
  try {
    const response = await apiClient.get('/api/admin/scans');
    return response.data || [];
  } catch (err) {
    console.warn("API getAdminScans warning:", err);
    return [];
  }
};
