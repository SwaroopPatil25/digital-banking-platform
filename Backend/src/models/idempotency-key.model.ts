import mongoose, { Schema, Document } from "mongoose";

export interface IIdempotencyKey extends Document {
  key: string;
  userId: mongoose.Types.ObjectId;
  requestHash: string;
  response: any;
  statusCode: number;
  createdAt: Date;
  expiresAt: Date;
}

const idempotencyKeySchema = new Schema<IIdempotencyKey>(
  {
    key: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    requestHash: { type: String, required: true },
    response: { type: Schema.Types.Mixed, required: true },
    statusCode: { type: Number, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

idempotencyKeySchema.index({ key: 1, userId: 1 }, { unique: true });
idempotencyKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IIdempotencyKey>("IdempotencyKey", idempotencyKeySchema);
