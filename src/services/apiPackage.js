import axios from "axios";

// Get API Base URL
const API_BASE = import.meta.env.VITE_API_BASE;

// Validation
if (!API_BASE) {
    console.error('❌ VITE_API_BASE is not defined!');
}

//LẤY DANH SÁCH CÁC GÓI SẴN CÓ
const getAllPackages = async () => {
    try {
        const url = `${API_BASE}/admin/package/all`;
        console.log('📤 Get All Packages URL:', url);
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching packages:', error.response?.data || error.message);
        throw error;
    }
}






export { getAllPackages };