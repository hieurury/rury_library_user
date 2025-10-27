import axios        from    "axios";
import {
    getToken
}                   from    '../hooks/useAccount';

const API_BASE = import.meta.env.VITE_API_BASE;

const registerAccount = async (accountData) => {
    try {
        const url = `${API_BASE}/user/register`;
        const response = await axios.post(url, accountData);
        return response.data;
    } catch (error) {
        throw error;
    }
}

const loginccount = async (accountData) => {
    try {
        const url = `${API_BASE}/user/login`;
        const response = await axios.post(url, accountData);
        return response.data;
    } catch (error) {
        throw error;
    }
}

const getUserInfo = async (id) => {
    try {
        const url = `${API_BASE}/user/get/${id}`;
        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export { registerAccount, loginccount, getUserInfo };