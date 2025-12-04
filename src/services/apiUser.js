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

const addFavorite = async (MADOCGIA, MASACH) => {
    try {
        const url = `${API_BASE}/user/favorites/add`;
        const response = await axios.post(url, 
            { MADOCGIA, MASACH },
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

const removeFavorite = async (MADOCGIA, MASACH) => {
    try {
        const url = `${API_BASE}/user/favorites/remove`;
        const response = await axios.post(url, 
            { MADOCGIA, MASACH },
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

// Đếm số sách đang mượn (TINHTRANG = 'borrowing')
const getBorrowingCount = async (MADOCGIA) => {
    try {
        const url = `${API_BASE}/user/borrowing-count/${MADOCGIA}`;
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

// Cập nhật cài đặt email notification
const updateEmailNotification = async (EMAIL_NOTIF) => {
    try {
        const url = `${API_BASE}/user/settings/email-notification`;
        const response = await axios.put(url, 
            { EMAIL_NOTIF },
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

// Lấy danh sách thông báo
const getNotifications = async () => {
    try {
        const url = `${API_BASE}/user/notifications`;
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

// Đánh dấu thông báo đã đọc
const markNotificationAsRead = async (notificationId) => {
    try {
        const url = `${API_BASE}/user/notifications/mark-read`;
        const response = await axios.put(url, 
            { notificationId },
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

// Đánh dấu tất cả thông báo đã đọc
const markAllNotificationsAsRead = async () => {
    try {
        const url = `${API_BASE}/user/notifications/mark-all-read`;
        const response = await axios.put(url, 
            {},
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

// Xóa tất cả thông báo
const deleteAllNotifications = async () => {
    try {
        const url = `${API_BASE}/user/notifications/delete-all`;
        const response = await axios.delete(url, {
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

// Cập nhật thông tin người dùng
const updateUser = async (MADOCGIA, userData) => {
    try {
        const url = `${API_BASE}/user/update/${MADOCGIA}`;
        const response = await axios.put(url, 
            userData,
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

// Upload avatar
const uploadAvatar = async (MADOCGIA, file) => {
    try {
        const formData = new FormData();
        formData.append('avatar', file);
        
        const url = `${API_BASE}/user/upload-avatar/${MADOCGIA}`;
        const response = await axios.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${getToken()}`
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Forgot password - gửi OTP
const forgotPassword = async (email) => {
    try {
        const url = `${API_BASE}/user/forgot-password`;
        const response = await axios.post(url, { EMAIL: email });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Verify OTP
const verifyOTP = async (email, otp) => {
    try {
        const url = `${API_BASE}/user/verify-otp`;
        const response = await axios.post(url, { EMAIL: email, OTP: otp });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Reset password
const resetPassword = async (resetToken, newPassword) => {
    try {
        const url = `${API_BASE}/user/reset-password`;
        const response = await axios.post(url, { resetToken, newPassword });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export { 
    registerAccount, 
    loginccount, 
    getUserInfo, 
    addFavorite, 
    removeFavorite, 
    getBorrowingCount,
    updateEmailNotification,
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteAllNotifications,
    updateUser,
    uploadAvatar,
    forgotPassword,
    verifyOTP,
    resetPassword
};