// TestService: Xử lý tất cả các hàm gọi API liên quan đến đề thi
import axios from 'axios';
const API_URL = 'http://localhost:5000/api/tests';

export const getAllTests = async () => {
    const res = await axios.get(API_URL);
    return res.data;
};

export const getTestById = async (id) => {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
};

export const createTest = async (testData) => {
    const res = await axios.post(API_URL, testData);
    return res.data;
};

export const updateTest = async (id, testData) => {
    const res = await axios.put(`${API_URL}/${id}`, testData);
    return res.data;
};

export const deleteTest = async (id) => {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
};
