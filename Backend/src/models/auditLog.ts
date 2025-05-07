import { Schema, model, Document } from "mongoose";

interface AuditLog extends Document {
  action: string;
  target: string;
  targetId: string;
  data: object;
  user: string;
  timestamp: Date;
}

const auditLogSchema = new Schema<AuditLog>({
  action: { type: String, required: true },
  target: { type: String, required: true },
  targetId: { type: String, required: true },
  data: { type: Object, required: true },
  user: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const AuditLogModel = model<AuditLog>("AuditLog", auditLogSchema);

export default AuditLogModel;
