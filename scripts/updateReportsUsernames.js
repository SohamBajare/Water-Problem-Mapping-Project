const mongoose = require('mongoose');
const Report = require('../models/report.js'); 
const User = require('../models/user.js');      


async function updateReportsUsernames() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/WaterProblemMapping');  

    const reports = await Report.find({ username: { $exists: false } });
    console.log(`Found ${reports.length} reports missing username.`);

    for (const report of reports) {
      const user = await User.findById(report._id);
      if (user) {
        report.username = user.username;
        await report.save();
        console.log(`Updated report ${report._id} with username ${user.username}`);
      } else {
        console.log(`User not found for report ${report._id}`);
      }
    }

    console.log('Update complete');
  } catch (err) {
    console.error('Error during update:', err);
  } finally {
    await mongoose.disconnect();
  }
}

updateReportsUsernames();
