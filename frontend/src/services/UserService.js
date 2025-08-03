
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export async function loginUser(email, password) {
    try {
        const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
        return res.data;
    } catch (err) {
        if (err.response && err.response.data) {
            return err.response.data;
        }
        return { success: false, message: 'Lỗi kết nối server' };
    }
}

export async function registerUser(userData) {
    try {
        const res = await axios.post(`${API_URL}/api/users/register`, userData);
        return res.data;
    } catch (err) {
        if (err.response && err.response.data) {
            return err.response.data;
        }
        return { success: false, message: 'Lỗi kết nối server' };
    }
}

export async function getUsers() {
    try {
        const res = await axios.get(`${API_URL}/api/users`);
        return res.data;
    } catch (err) {
        return { success: false, message: 'Lỗi kết nối server', users: [] };
    }
}

export async function deleteUser(userId) {
    try {
        const res = await axios.delete(`${API_URL}/api/users/${userId}`);
        return res.data;
    } catch (err) {
        return { success: false, message: 'Lỗi kết nối server' };
    }
}

export async function updateUser(userId, userData) {
    try {
        const res = await axios.put(`${API_URL}/api/users/${userId}`, userData);
        return res.data;
    } catch (err) {
        return { success: false, message: 'Lỗi kết nối server' };
    }
}
export async function updateEmail(userId, email) {
    try {
        const res = await axios.put(`${API_URL}/api/users/${userId}/email`, { email });
        return res.data;
    } catch (err) {
        if (err.response && err.response.data) {
            return err.response.data;
        }
        return { success: false, message: 'Lỗi kết nối server' };
    }
}

export async function toggleUserStatus(userId, isActive) {
    try {
        const res = await axios.put(`${API_URL}/api/users/${userId}/status`, { is_active: isActive });
        return res.data;
    } catch (err) {
        return { success: false, message: 'Lỗi kết nối server' };
    }
}

export async function uploadAvatar(userId, avatarFile, token) {
    try {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.post(`${API_URL}/api/users/${userId}/upload-avatar`, formData, { headers });
        return res.data;
    } catch (err) {
        return { success: false, message: 'Lỗi upload avatar' };
    }
}


export async function changePassword(userId, currentPassword, newPassword) {
    try {
        const res = await axios.post(`${API_URL}/api/users/${userId}/change-password`, {
            currentPassword,
            newPassword
        });
        return res.data;
    } catch (err) {
        if (err.response && err.response.data) {
            return err.response.data;
        }
        return { success: false, message: 'Lỗi kết nối server' };
    }
}
