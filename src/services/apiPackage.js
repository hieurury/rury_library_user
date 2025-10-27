import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

const getAllPackages = async () => {
    try {
        const url = `${API_BASE}/admin/package/all`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export { getAllPackages };