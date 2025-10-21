import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE;

const getBorrowWithUserId = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE}/borrow/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching borrow data:", error);
    throw error;
  }
};

const getBorrowInfo = async (borrowId) => {
  try {
    const response = await axios.get(`${API_BASE}/borrow/${borrowId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching borrow info:", error);
    throw error;
  }
};

const getAllBorrowsInfo = async () => {
  try {
    const response = await axios.get(`${API_BASE}/borrow/admin/all`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all borrows info:", error);
    throw error;
  }
}

export { getBorrowWithUserId, getBorrowInfo, getAllBorrowsInfo };
