import axios from "axios";

// Get API Base URL
const API_BASE = import.meta.env.VITE_API_BASE;

const getAllBooks = async () => {
    try {
        const url = `${API_BASE}/sach/all`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const getBookById = async (bookId) => {
    try {
        const url = `${API_BASE}/sach/${bookId}`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const getTopBooks = async () => {
    try {
        const url = `${API_BASE}/sach/top-books`;
        console.log('Fetching top books from:', url);
        const response = await axios.get(url);
        console.log('Top books response:', response.data);
        return response.data;
    } catch (error) {
        console.error('API Error (getTopBooks):', error);
        throw error;
    }
};

const getAvailableCopies = async (bookId) => {
    try {
        const url = `${API_BASE}/sach/copies/${bookId}`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export {
    getAllBooks,
    getBookById,
    getTopBooks,
    getAvailableCopies
};