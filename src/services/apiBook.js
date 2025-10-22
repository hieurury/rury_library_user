import axios from "axios";

// Get API Base URL
const API_BASE = import.meta.env.VITE_API_BASE;

// Validation
if (!API_BASE) {
    console.error('❌ VITE_API_BASE is not defined!');
}

const getAllBooks = async () => {
    try {
        const url = `${API_BASE}/sach/all`;
        console.log('📤 Get All Books URL:', url);
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching books:", error.response?.data || error.message);
        throw error;
    }
};

const getBookById = async (bookId) => {
    try {
        const url = `${API_BASE}/sach/${bookId}`;
        console.log('📤 Get Book By ID URL:', url);
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`❌ Error fetching book with ID ${bookId}:`, error.response?.data || error.message);
        throw error;
    }
};

export {
    getAllBooks,
    getBookById
};