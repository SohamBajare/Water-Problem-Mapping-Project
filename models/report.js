const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  imageUrl: String,
  date: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: String, 
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, default: "Pending" },
  evidence: {
    measuresTaken: { type: String },
    afterImageUrl: { type: String },
    submittedAt: { type: Date }
  }
  
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
