import axios        from    "axios";
import {
    getToken
}                   from    '../hooks/useAccount';

// Get API Base URL and validate
const API_BASE = import.meta.env.VITE_API_BASE;

// Validation: Check if API_BASE is properly configured
if (!API_BASE) {
    console.error('❌ VITE_API_BASE is not defined in environment variables!');
} else {
    console.log('✅ API Base URL:', API_BASE);
}

//ĐĂNG KÝ TÀI KHOẢN NGƯỜI DÙNG MỚI
const registerAccount = async (accountData) => {
    try {
        const url = `${API_BASE}/user/register`;
        console.log('📤 Register URL:', url);
        const response = await axios.post(url, accountData);
        return response.data;
    } catch (error) {
        console.error('❌ Register Error:', error.response?.data || error.message);
        throw error;
    }
}

const loginccount = async (accountData) => {
    try {
        const url = `${API_BASE}/user/login`;
        console.log(url);
        console.log('📤 Login URL:', url);
        const response = await axios.post(url, accountData);
        return response.data;
    } catch (error) {
        console.error('❌ Login Error:', error.response?.data || error.message);
        throw error;
    }
}

const getUserInfo = async (id) => {
    try {
        const url = `${API_BASE}/user/get/${id}`;
        console.log('📤 Get User Info URL:', url);
        const response = await axios.get(url, {
            // xác thực token
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('❌ Get User Info Error:', error.response?.data || error.message);
        throw error;
    }
}

export { registerAccount, loginccount, getUserInfo };