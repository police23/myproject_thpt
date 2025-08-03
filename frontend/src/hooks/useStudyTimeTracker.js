import { useState, useEffect, useCallback, useMemo } from 'react';

// Hook đơn giản để tracking thời gian học
export const useStudyTimeTracker = () => {
    // Key cho từng ngày
    const getDayKey = (date) => {
        return `studyTime_${date.getFullYear()}_${date.getMonth()}_${date.getDate()}`;
    };

    // Key cho tuần hiện tại
    const getWeekKey = (date) => {
        // Tuần ISO: Thứ 2 là ngày đầu tuần
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        return `studyTime_week_${date.getFullYear()}_${weekNumber}`;
    };

    // Xóa dữ liệu 7 ngày tuần trước
    const clearLastWeekData = () => {
        const today = new Date();
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);
        for (let i = 0; i < 7; i++) {
            const d = new Date(lastWeek);
            d.setDate(lastWeek.getDate() + i);
            localStorage.removeItem(getDayKey(d));
        }
    };


    // Load thời gian từ localStorage hoặc khởi tạo với 0
    const loadTodayStudyTime = () => {
        const today = new Date();
        const savedTime = localStorage.getItem(getDayKey(today));
        return savedTime ? parseInt(savedTime, 10) : 0;
    };

    const [isTracking, setIsTracking] = useState(true);
    const [todayStudyTime, setTodayStudyTime] = useState(loadTodayStudyTime()); // in seconds

    // Khi sang tuần mới thì xóa dữ liệu tuần trước
    useEffect(() => {
        const today = new Date();
        const currentWeekKey = getWeekKey(today);
        const lastSavedWeek = localStorage.getItem('lastSavedWeek');
        if (lastSavedWeek && lastSavedWeek !== currentWeekKey) {
            clearLastWeekData();
        }
        localStorage.setItem('lastSavedWeek', currentWeekKey);
    }, []);

    // Lưu thời gian vào localStorage mỗi khi thay đổi
    useEffect(() => {
        const today = new Date();
        localStorage.setItem(getDayKey(today), todayStudyTime.toString());
    }, [todayStudyTime]);

    // Auto increment thời gian mỗi 1 phút thực tế
    useEffect(() => {
        const interval = setInterval(() => {
            setTodayStudyTime(prev => prev + 60); // Tăng 60 giây mỗi phút
        }, 60000);
        return () => clearInterval(interval);
    }, []);
    // Hàm lấy tổng thời gian 7 ngày gần nhất (1 tuần)
    const getWeeklyStudyTime = () => {
        const today = new Date();
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const key = getDayKey(d);
            const value = parseInt(localStorage.getItem(key) || '0', 10);
            days.unshift({ date: d, seconds: value });
        }
        return days;
    };

    const startTracking = () => {
        setIsTracking(true);
    };

    const stopTracking = () => {
        setIsTracking(false);
    };

    return {
        isTracking,
        todayStudyTime,
        startTracking,
        stopTracking,
        todayStudyHours: Number((todayStudyTime / 3600).toFixed(3)), // Convert seconds to hours
        getWeeklyStudyTime // trả về mảng 7 ngày gần nhất
    };
};

// Hook để lấy dashboard data từ API
export const useStudyDashboard = (todayStudyHours = 0) => {
    const [dashboardData, setDashboardData] = useState({
        weeklyStats: [],
        monthlyStats: [],
        totalHours: 0,
        thisWeekTotal: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Lấy ngày hiện tại trong tuần (0 = Chủ nhật, 1 = Thứ 2, ...)
    const getTodayIndex = () => {
        const today = new Date().getDay();
        const index = today === 0 ? 6 : today - 1; // Chuyển đổi: CN=6, T2=0, T3=1, ...
        console.log('Today is:', ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][today], 'index:', index);
        return index;
    };

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/study-time/dashboard', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                setDashboardData(result.data);
                setError(null);
            } else {
                throw new Error('Failed to fetch dashboard data');
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(err.message);
            // Fallback to mock data nếu API fail
            setDashboardData({
                weeklyStats: [
                    { day: 'T2', hours: 0 },
                    { day: 'T3', hours: 0 },
                    { day: 'T4', hours: 0 },
                    { day: 'T5', hours: 0 },
                    { day: 'T6', hours: 0 },
                    { day: 'T7', hours: 0 },
                    { day: 'CN', hours: 0 }
                ],
                monthlyStats: [
                    { week: 1, hours: 0 },
                    { week: 2, hours: 0 },
                    { week: 3, hours: 0 },
                    { week: 4, hours: 0 }
                ],
                totalHours: 0,
                thisWeekTotal: 0
            });
        } finally {
            setLoading(false);
        }
    }, []);

    // Tối ưu hóa: chỉ tính toán lại khi todayStudyHours thay đổi đáng kể (mỗi phút)
    const roundedTodayStudyHours = useMemo(() => {
        const rounded = Number(todayStudyHours.toFixed(3));
        console.log('roundedTodayStudyHours recalculated:', rounded, 'from:', todayStudyHours);
        return rounded;
    }, [Math.floor(todayStudyHours * 60)]); // trigger mỗi khi thay đổi 1 phút (60 giây)

    // Cập nhật thời gian hôm nay vào weeklyStats - sử dụng useMemo để tránh re-compute
    const updatedDashboardData = useMemo(() => {
        if (!dashboardData.weeklyStats || dashboardData.weeklyStats.length === 0) {
            console.log('No weeklyStats data, returning original dashboardData');
            return dashboardData;
        }

        const todayIndex = getTodayIndex();
        const updatedWeeklyStats = [...dashboardData.weeklyStats];
        
        // Cập nhật thời gian cho ngày hôm nay
        if (updatedWeeklyStats[todayIndex]) {
            const previousHours = updatedWeeklyStats[todayIndex].hours;
            updatedWeeklyStats[todayIndex] = {
                ...updatedWeeklyStats[todayIndex],
                hours: roundedTodayStudyHours
            };
            console.log(`Updated today (index ${todayIndex}) from ${previousHours} to ${roundedTodayStudyHours} hours`);
            console.log('Updated weeklyStats:', updatedWeeklyStats.map(d => d.hours));
        }

        return {
            ...dashboardData,
            weeklyStats: updatedWeeklyStats
        };
    }, [dashboardData, roundedTodayStudyHours]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return {
        dashboardData: updatedDashboardData,
        loading,
        error,
        refreshData: fetchDashboardData
    };
};