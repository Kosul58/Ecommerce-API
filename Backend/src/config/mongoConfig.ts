import { injectable } from "tsyringe";
import { Model, Document } from "mongoose";

@injectable()
class MongoDb {
  public async findOne<T>(model: Model<T>, filter: object) {
    return model.findOne(filter).exec();
  }

  public async find<T>(model: Model<T>, filter: object) {
    return model.find(filter).exec();
  }

  public async findById<T>(model: Model<T>, id: string) {
    return model.findById(id).exec();
  }

  public async save<T extends Document>(doc: T) {
    return doc.save();
  }

  public async insertMany<T>(model: Model<T>, docs: any[]) {
    return model.insertMany(docs);
  }

  public async findByIdAndUpdate<T>(
    model: Model<T>,
    id: string,
    update: object,
    options: object = {}
  ) {
    return model.findByIdAndUpdate(id, update, options).exec();
  }
  public async findByIdAndDelete<T>(model: Model<T>, id: string) {
    return model.findByIdAndDelete(id).exec();
  }
}

export default MongoDb;
