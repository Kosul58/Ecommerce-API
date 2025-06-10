import { Model, Document, Schema, Types } from "mongoose";
import { Repository } from "../common/types/classInterfaces";

export class BaseRepository implements Repository {
  protected model: any;
  constructor(model: any) {
    this.model = model;
  }
  public async findAll() {
    try {
      return await this.model.find();
    } catch (err) {
      throw err;
    }
  }
  public async findOne(id: string) {
    try {
      return await this.model.findById(id);
    } catch (err) {
      throw err;
    }
  }
  public async deleteOne(id: string) {
    try {
      return await this.model.findByIdAndDelete(id);
    } catch (err) {
      throw err;
    }
  }
  public async updateOne(id: string, update: any) {
    try {
      return await this.model.findByIdAndUpdate(
        id,
        { $set: update },
        { new: true }
      );
    } catch (err) {
      throw err;
    }
  }
  public async create(data: any) {
    try {
      const newDocument = new this.model(data);
      return await newDocument.save();
    } catch (err) {
      throw err;
    }
  }
  public async save(data: any) {
    try {
      return await data.save();
    } catch (err) {
      throw err;
    }
  }
  public async check(data: string) {
    try {
      const exists = await this.model.exists({ data });
      return exists ? true : false;
    } catch (err) {
      throw err;
    }
  }
  public async findByIds(ids: string[]) {
    try {
      const objectIds = ids.map((id) => new Types.ObjectId(id));
      const documents = await this.model.find({ _id: { $in: objectIds } });
      return documents;
    } catch (error) {
      throw error;
    }
  }
}
