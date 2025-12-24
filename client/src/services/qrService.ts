import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const getTableByQRCode = async (qrCode: string) => {
    try {
        const response = await axios.get(`${API_URL}/api/qr/${qrCode}`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching table information');
    }
};