import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_BASE;

const getCategories = async () => {
    try {
        const response = await axios.get(`${API_BASE}/the-loai/all`);
        // Server trả về { status, message, data }
        // response.data = { status, message, data }
        // Nên cần return response.data để component lấy .data
        return response.data;
    } catch (error) {
        console.error('API Error (getCategories):', error);
        throw error;
    }
};

const getTopCategories = async () => {
    try {
        const response = await axios.get(`${API_BASE}/the-loai/top-categories`);
        return response.data;
    } catch (error) {
        console.error('API Error (getTopCategories):', error);
        throw error;
    }
};

const getBooksByCategory = async (maLoai) => {
    try {
        const response = await axios.get(`${API_BASE}/the-loai/${maLoai}/books`);
        return response.data;
    } catch (error) {
        console.error('API Error (getBooksByCategory):', error);
        throw error;
    }
};

export {
    getCategories,
    getTopCategories,
    getBooksByCategory
}