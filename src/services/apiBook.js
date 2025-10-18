import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE;


const getAllBooks = async () => {
    try {
        const response = await axios.get(`${API_BASE}/sach/all`);
        return response.data;
    } catch (error) {
        console.error("Error fetching books:", error);
        throw error;
    }
};

const getBookById = async (bookId) => {
    try {
        const response = await axios.get(`${API_BASE}/sach/${bookId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching book with ID ${bookId}:`, error);
        throw error;
    }
};

export {
    getAllBooks,
    getBookById
};