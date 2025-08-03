import axios from 'axios';
const API_URL = 'http://localhost:5000/api/admin/stats';

// Lấy số liệu thống kê cho Dashboard Admin
export const getStats = async () => {
  try {
    const res = await axios.get(API_URL);
    return res.data;
  } catch (err) {
    throw err.response?.data || { error: 'Lỗi kết nối server' };
  }
};
