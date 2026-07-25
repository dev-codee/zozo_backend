import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  phoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Phone',
    required: true,
  },
  sessionId: {
    type: String,
    required: true,
  },
  pollType: {
    type: String,
    required: true,
    enum: ['value_for_money', 'favorite_features'],
  },
  value: {
    type: mongoose.Schema.Types.Mixed, // Can be String ('yes'/'no') or Array of strings
    required: true,
  }
}, { timestamps: true });

// Ensure a user (session) can only vote once per poll type per phone
voteSchema.index({ phoneId: 1, sessionId: 1, pollType: 1 }, { unique: true });

const Vote = mongoose.model('Vote', voteSchema);

export default Vote;
