import axios from "../utils/axios";

export const screenResumes = async (formData) => {
  const response = await axios.post("/api/screening/screen", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getHistory = async () => {
  const response = await axios.get("/api/screening/history");
  return response.data;
};

export const getSession = async (sessionId) => {
  const response = await axios.get(`/api/screening/session/${sessionId}`);
  return response.data;
};

export const exportCSV = async (sessionId) => {
  const response = await axios.get(`/api/screening/export/csv/${sessionId}`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `screening_${sessionId}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const exportExcel = async (sessionId) => {
  const response = await axios.get(`/api/screening/export/excel/${sessionId}`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `screening_${sessionId}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
