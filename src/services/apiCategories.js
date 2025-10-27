import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_BASE;

const getCategories = async () => {
    try {
        const response = await axios.get(`${API_BASE}/the-loai/all`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const getTopCategories = async () => {
    try {
        const response = await axios.get(`${API_BASE}/the-loai/top-categories`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export {
    getCategories,
    getTopCategories
}