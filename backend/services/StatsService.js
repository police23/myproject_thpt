const UsersModel = require('../models/UserModel');
const ResultsModel = require('../models/ResultsModel');
const VisitsCounter = require('../models/VisitsCounter');

const getStatsData = async () => {
    // Tổng số user, kết quả
    const userCount = await UsersModel.countDocuments();
    const resultCount = await ResultsModel.countDocuments();

    // Tính tổng lượt truy cập tuần này và tuần trước
    const today = new Date();
    const days = [];
    const lastWeekDays = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        days.push(d.toISOString().slice(0, 10));
        const d2 = new Date(today);
        d2.setDate(today.getDate() - i - 7);
        lastWeekDays.push(d2.toISOString().slice(0, 10));
    }
    const visitCounters = await VisitsCounter.find({ date: { $in: days } });
    const lastWeekVisitCounters = await VisitsCounter.find({ date: { $in: lastWeekDays } });
    const visitCount = visitCounters.reduce((sum, v) => sum + (v.count || 0), 0);
    const lastWeekVisitCount = lastWeekVisitCounters.reduce((sum, v) => sum + (v.count || 0), 0);

    let visitPercent = 0;
    if (lastWeekVisitCount === 0 && visitCount > 0) {
        visitPercent = 100;
    } else if (lastWeekVisitCount === 0 && visitCount === 0) {
        visitPercent = 0;
    } else {
        visitPercent = ((visitCount - lastWeekVisitCount) / lastWeekVisitCount) * 100;
    }

    const topUsers = await ResultsModel.aggregate([
        { $group: { _id: "$user_id", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "user"
            }
        },
        { $unwind: "$user" },
        {
            $project: {
                _id: 0,
                userId: "$user._id",
                name: "$user.name",
                avatar: "$user.avatar",
                count: 1
            }
        }
    ]);

    // Dữ liệu biểu đồ 7 ngày gần nhất
    const daysObj = days.map(date => ({ date, users: 0, results: 0, visits: 0 }));
    // Users đăng ký mỗi ngày
    const userDaily = await UsersModel.aggregate([
        {
            $match: {
                created_at: { $gte: new Date(days[0] + 'T00:00:00.000Z') }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
                count: { $sum: 1 }
            }
        }
    ]);
    // Lượt làm bài mỗi ngày
    const resultDaily = await ResultsModel.aggregate([
        {
            $match: {
                created_at: { $gte: new Date(days[0] + 'T00:00:00.000Z') }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
                count: { $sum: 1 }
            }
        }
    ]);
    // Lượt truy cập mỗi ngày
    let visitDaily = [];
    if (VisitsCounter.aggregate) {
        visitDaily = await VisitsCounter.aggregate([
            {
                $match: {
                    date: { $gte: days[0] }
                }
            },
            {
                $group: {
                    _id: "$date",
                    count: { $sum: "$count" }
                }
            }
        ]);
    }
    // Gán dữ liệu vào mảng daysObj
    userDaily.forEach(u => {
        const d = daysObj.find(x => x.date === u._id);
        if (d) d.users = u.count;
    });
    resultDaily.forEach(r => {
        const d = daysObj.find(x => x.date === r._id);
        if (d) d.results = r.count;
    });
    visitDaily.forEach(v => {
        const d = daysObj.find(x => x.date === v._id);
        if (d) d.visits = v.count;
    });
    return {
        userCount,
        resultCount,
        visitCount,
        visitPercent,
        topUsers,
        chartData: Array.isArray(daysObj) ? daysObj : []
    };
};

module.exports = {
    getStatsData
};
