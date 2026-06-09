import mongoose, { Schema, Document } from "mongoose";

export interface IUpcomingBill extends Document {
  userId: mongoose.Types.ObjectId;
  category: string;
  billerName: string;
  consumerNumber: string;
  amount: number;
  dueDate: Date;
  status: "pending" | "paid" | "overdue";
  autoPay: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const upcomingBillSchema = new Schema<IUpcomingBill>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: [true, "User ID is required"] },
    category: { type: String, required: [true, "Bill category is required"] },
    billerName: { type: String, required: [true, "Biller name is required"] },
    consumerNumber: { type: String, required: [true, "Consumer number is required"] },
    amount: { type: Number, required: [true, "Bill amount is required"] },
    dueDate: { type: Date, required: [true, "Due date is required"] },
    status: { type: String, enum: ["pending", "paid", "overdue"], required: [true, "Bill status is required"] },
    autoPay: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IUpcomingBill>("UpcomingBill", upcomingBillSchema);
