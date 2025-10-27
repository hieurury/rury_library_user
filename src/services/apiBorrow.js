import axios from "axios";

// Get API Base URL
const API_BASE = import.meta.env.VITE_API_BASE;

const getBorrowWithUserId = async (userId) => {
  try {
    const url = `${API_BASE}/theo-doi-muon-sach/user/${userId}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getBorrowInfo = async (borrowId) => {
  try {
    const url = `${API_BASE}/theo-doi-muon-sach/${borrowId}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getAllBorrowsInfo = async () => {
  try {
    const url = `${API_BASE}/theo-doi-muon-sach/all`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { getBorrowWithUserId, getBorrowInfo, getAllBorrowsInfo };
