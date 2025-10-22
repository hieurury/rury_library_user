import axios from "axios";

// Get API Base URL
const API_BASE = import.meta.env.VITE_API_BASE;

// Validation
if (!API_BASE) {
  console.error('❌ VITE_API_BASE is not defined!');
}

const getBorrowWithUserId = async (userId) => {
  try {
    const url = `${API_BASE}/borrow/user/${userId}`;
    console.log('📤 Get Borrow By User URL:', url);
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching borrow data:", error.response?.data || error.message);
    throw error;
  }
};

const getBorrowInfo = async (borrowId) => {
  try {
    const url = `${API_BASE}/borrow/${borrowId}`;
    console.log('📤 Get Borrow Info URL:', url);
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching borrow info:", error.response?.data || error.message);
    throw error;
  }
};

const getAllBorrowsInfo = async () => {
  try {
    const url = `${API_BASE}/borrow/admin/all`;
    console.log('📤 Get All Borrows URL:', url);
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching all borrows info:", error.response?.data || error.message);
    throw error;
  }
}

export { getBorrowWithUserId, getBorrowInfo, getAllBorrowsInfo };
