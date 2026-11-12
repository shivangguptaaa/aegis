const cron = require('node-cron');
const collegeModel = require('../models/college-model');

const startCollegeCleanup = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const result = await collegeModel.deleteMany({
        isVerified: false,
        otpExpiresAt: { $lt: Date.now() }
      });
      if (result.deletedCount > 0) {
        console.log(`Deleted ${result.deletedCount} unverified colleges`);
      }
    } catch (err) {
      console.error("Error cleaning up unverified colleges:", err);
    }
  });
};

module.exports = startCollegeCleanup;
