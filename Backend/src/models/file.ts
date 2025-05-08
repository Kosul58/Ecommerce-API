import { number, string } from "joi";
import { Schema, model, Document } from "mongoose";

interface File extends Document {
  publicid: string;
  original_name: string;
  type: string;
  size: number;
  blob_path: string;
  mimetype: string;
  status: boolean;
  timestamp: Date;
}

const FileSchema = new Schema<File>({
  publicid: { type: String, required: true },
  original_name: { type: String, required: false },
  type: { type: String, required: true },
  blob_path: { type: String, required: true },
  mimetype: { type: String, required: true },
  status: { type: Boolean, required: true },
  size: { type: Number, required: false },
  timestamp: { type: Date, default: Date.now },
});

const File = model<File>("File", FileSchema);
export default File;
