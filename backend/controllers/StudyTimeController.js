const StudyTimeService = require('../services/StudyTimeService');
const jwt = require('jsonwebtoken');

function getUserIdFromRequest(req) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        return decoded.userId;
    } catch {
        return null;
    }
}

const startSession = async (req, res) => {
    const userId = getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ success: false, message: 'No token provided or invalid' });
    try {
        const result = await StudyTimeService.startStudySession(userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const endSession = async (req, res) => {
    const userId = getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ success: false, message: 'No token provided or invalid' });
    try {
        const { sessionId } = req.body;
        const result = await StudyTimeService.endStudySession(userId, sessionId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    startSession,
    endSession
};
