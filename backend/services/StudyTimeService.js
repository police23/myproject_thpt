
const StudyTime = require('../models/StudyTimeModel');
const startStudySession = async (userId) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let studyRecord = await StudyTime.findOne({
            userId: userId,
            date: today
        });

        if (!studyRecord) {
            studyRecord = new StudyTime({
                userId: userId,
                date: today,
                studyMinutes: 0,
                sessions: []
            });
        }
        const newSession = {
            startTime: new Date(),
            endTime: null,
            duration: 0
        };
        studyRecord.sessions.push(newSession);
        await studyRecord.save();

        return {
            success: true,
            sessionId: newSession._id,
            message: 'Study session started'
        };
    } catch (error) {
        throw new Error('Error starting study session: ' + error.message);
    }
};

const endStudySession = async (userId, sessionId) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const studyRecord = await StudyTime.findOne({
            userId: userId,
            date: today
        });

        if (!studyRecord) {
            throw new Error('Study record not found');
        }

        const session = studyRecord.sessions.id(sessionId);
        if (!session) {
            throw new Error('Study session not found');
        }

        session.endTime = new Date();
        session.duration = Math.round((session.endTime - session.startTime) / (1000 * 60)); 
        studyRecord.studyMinutes = studyRecord.sessions.reduce((total, s) => {
            return total + (s.duration || 0);
        }, 0);

        await studyRecord.save();

        return {
            success: true,
            duration: session.duration,
            totalToday: studyRecord.studyMinutes,
            message: 'Study session ended'
        };
    } catch (error) {
        throw new Error('Error ending study session: ' + error.message);
    }
};

const getWeeklyStats = async (userId) => {
    try {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const weeklyData = await StudyTime.find({
            userId: userId,
            date: {
                $gte: startOfWeek,
                $lte: endOfWeek
            }
        }).sort({ date: 1 });

        const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        const weekStats = [];

        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startOfWeek);
            currentDate.setDate(startOfWeek.getDate() + i);

            const dayData = weeklyData.find(data => 
                data.date.toDateString() === currentDate.toDateString()
            );

            weekStats.push({
                day: daysOfWeek[i],
                date: currentDate,
                hours: dayData ? Number((dayData.studyMinutes / 60).toFixed(1)) : 0,
                minutes: dayData ? dayData.studyMinutes : 0
            });
        }

        return weekStats;
    } catch (error) {
        throw new Error('Error getting weekly stats: ' + error.message);
    }
};

const getMonthlyStats = async (userId) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);

        const monthlyData = await StudyTime.find({
            userId: userId,
            date: {
                $gte: startOfMonth,
                $lte: endOfMonth
            }
        }).sort({ date: 1 });

        const weeks = [];
        let currentWeekStart = new Date(startOfMonth);

        for (let week = 0; week < 4; week++) {
            const weekEnd = new Date(currentWeekStart);
            weekEnd.setDate(currentWeekStart.getDate() + 6);

            const weekData = monthlyData.filter(data => 
                data.date >= currentWeekStart && data.date <= weekEnd
            );

            const totalMinutes = weekData.reduce((sum, day) => sum + day.studyMinutes, 0);

            weeks.push({
                week: week + 1,
                startDate: new Date(currentWeekStart),
                endDate: new Date(weekEnd),
                hours: Number((totalMinutes / 60).toFixed(1)),
                minutes: totalMinutes
            });

            currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        }

        return weeks;
    } catch (error) {
        throw new Error('Error getting monthly stats: ' + error.message);
    }
};

const getTotalStudyTime = async (userId) => {
    try {
        const result = await StudyTime.aggregate([
            { $match: { userId: userId } },
            { $group: { _id: null, totalMinutes: { $sum: '$studyMinutes' } } }
        ]);

        const totalMinutes = result.length > 0 ? result[0].totalMinutes : 0;
        return {
            totalHours: Number((totalMinutes / 60).toFixed(1)),
            totalMinutes: totalMinutes
        };
    } catch (error) {
        throw new Error('Error getting total study time: ' + error.message);
    }
};

const updateActiveTime = async (userId, minutesToAdd = 1) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let studyRecord = await StudyTime.findOne({
            userId: userId,
            date: today
        });

        if (!studyRecord) {
            studyRecord = new StudyTime({
                userId: userId,
                date: today,
                studyMinutes: 0,
                sessions: []
            });
        }

        studyRecord.studyMinutes += minutesToAdd;
        await studyRecord.save();

        return studyRecord.studyMinutes;
    } catch (error) {
        throw new Error('Error updating active time: ' + error.message);
    }
};

module.exports = {
    startStudySession,
    endStudySession
};
