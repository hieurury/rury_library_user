import axios from 'axios';
import { getToken } from '../hooks/useAccount';

const API_BASE = import.meta.env.VITE_API_BASE;

const createBill = async (MADOCGIA, LIST_MA_BANSAO, LOAITHANHTOAN) => {
    try {
        const url = `${API_BASE}/bill/create`;
        const response = await axios.post(url, 
            { MADOCGIA, LIST_MA_BANSAO, LOAITHANHTOAN },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

const getBillById = async (MABILL) => {
    try {
        const url = `${API_BASE}/bill/get/${MABILL}`;
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
};

const getBillsByDocGia = async (MADOCGIA) => {
    try {
        const url = `${API_BASE}/bill/docgia/${MADOCGIA}`;
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
};

const confirmCashPayment = async (MABILL) => {
    try {
        const url = `${API_BASE}/bill/payment/cash`;
        const response = await axios.put(url,
            { MABILL },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export {
    createBill,
    getBillById,
    getBillsByDocGia,
    confirmCashPayment
};
