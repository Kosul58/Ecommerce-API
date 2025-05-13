import { Schema, model, Document } from "mongoose";
interface Audit extends Document {
  path: string;
  action: string;
  targetId: string;
  data: object;
  sourceId: string;
  sourceType: string;
  method: string;
  status: string;
  timestamp: Date;
}

const auditSchema = new Schema<Audit>({
  path: { type: String, required: true },
  action: { type: String, required: true },
  targetId: { type: String, required: true },
  data: { type: Object, required: true },
  sourceId: { type: String, required: true },
  sourceType: { type: String, required: true },
  method: { type: String, required: true },
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Audit = model<Audit>("Audit", auditSchema);

export default Audit;
