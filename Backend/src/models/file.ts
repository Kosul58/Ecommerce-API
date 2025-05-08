import { string } from "joi";
import { Schema, model, Document } from "mongoose";

interface File extends Document {
  id: string;
  original_name: string;
  type: string;
  size: number;
  blob_path: string;
  extension: string;
  mime_type: string;
  status: boolean;
  timestamp: Date;
}

const FileSchema = new Schema<File>({
  id: { type: String, required: true },
  original_name: { type: String, required: true },
  type: { type: String, required: true },
  blob_path: { type: String, required: true },
  extension: { type: String, required: true },
  mime_type: { type: String, required: true },
  status: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now },
});

const File = model<File>("File", FileSchema);
export default File;
