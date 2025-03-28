const Order=require("../module/Order")
const Product = require('../module/Product');
const User = require('../module/User');

// Get analytics data
exports.getAnalytics = async (req, res) => {
  try {
    const { range = 'monthly' } = req.query;
    
    // Calculate date ranges based on the selected time range
    let startDate;
    const endDate = new Date();
    
    switch (range) {
      case 'weekly':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'yearly':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default: // monthly
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
    }

    // Get sales data grouped by time period
    const salesData = await getSalesData(startDate, endDate, range);
    
    // Get user growth data
    const userGrowth = await getUserGrowth(startDate, endDate, range);

    res.status(200).json({
      success: true,
      salesData,
      userGrowth
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data'
    });
  }
};

// Helper function to get sales data
async function getSalesData(startDate, endDate, range) {
  try {
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'delivered'
    }).select('total_price createdAt');

    // Group by time period
    const groupedData = {};
    orders.forEach(order => {
      let period;
      const date = new Date(order.createdAt);
      
      if (range === 'weekly') {
        period = `Day ${date.getDate()}`;
      } else if (range === 'yearly') {
        period = date.toLocaleString('default', { month: 'short' });
      } else {
        // Monthly - group by week
        const week = Math.floor((date.getDate() - 1) / 7) + 1;
        period = `Week ${week}`;
      }

      if (!groupedData[period]) {
        groupedData[period] = 0;
      }
      groupedData[period] += order.total_price;
    });

    // Convert to array format for chart
    return Object.keys(groupedData).map(period => ({
      name: period,
      sales: groupedData[period]
    }));

  } catch (error) {
    console.error('Sales data error:', error);
    return [];
  }
}

// Helper function to get user growth data
async function getUserGrowth(startDate, endDate, range) {
  try {
    const users = await User.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).select('createdAt');

    // Group by time period
    const groupedData = {};
    users.forEach(user => {
      let period;
      const date = new Date(user.createdAt);
      
      if (range === 'weekly') {
        period = `Day ${date.getDate()}`;
      } else if (range === 'yearly') {
        period = date.toLocaleString('default', { month: 'short' });
      } else {
        // Monthly - group by week
        const week = Math.floor((date.getDate() - 1) / 7) + 1;
        period = `Week ${week}`;
      }

      if (!groupedData[period]) {
        groupedData[period] = 0;
      }
      groupedData[period]++;
    });

    // Convert to array format for chart
    return Object.keys(groupedData).map(period => ({
      name: period,
      users: groupedData[period]
    }));

  } catch (error) {
    console.error('User growth error:', error);
    return [];
  }
}