const StatsService = require('../services/StatsService');
exports.getStats = async (req, res) => {
  try {
    const data = await StatsService.getStatsData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server', chartData: [] });
  }
};
