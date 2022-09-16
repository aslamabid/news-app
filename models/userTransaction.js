import mongoose from "mongoose";

const userTransactionSchema = new mongoose.Schema({
    type: { type: String, required: true},
    amount: { type: Number, maxLength: [8, "Price cannot exceed 8 characters"], required: true},
    category: { type: String, required: true},
    mode: { type: String, required: true},
    notes: { type: String,},
    user_id: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
}, {timestamps: true});

export default mongoose.model('Transaction', userTransactionSchema, 'transactions')