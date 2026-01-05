const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  currency: { 
    type: String, 
    default: 'INR' 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Success', 'Failed'], 
    default: 'Pending' 
  },
  payment_method: { 
    type: String 
  },
  related_entity: { 
    type: String, 
    enum: ['Course', 'Mentorship'], 
    required: true 
  },
  related_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    refPath: 'related_entity'
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Transaction', transactionSchema);
