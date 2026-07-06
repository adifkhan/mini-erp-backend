import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ISaleItem {
  product: Types.ObjectId;
  productName: string; // snapshot at time of sale
  quantity: number;
  unitPrice: number; // snapshot of sellingPrice at time of sale
  subtotal: number;
}

export interface ISale extends Document {
  customer: Types.ObjectId;
  items: ISaleItem[];
  grandTotal: number;
  soldBy: Types.ObjectId; // user who created the sale
  createdAt: Date;
  updatedAt: Date;
}

const saleItemSchema = new Schema<ISaleItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const saleSchema = new Schema<ISale>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    items: {
      type: [saleItemSchema],
      required: true,
      validate: {
        validator: (items: ISaleItem[]) => items.length > 0,
        message: "A sale must contain at least one product",
      },
    },
    grandTotal: { type: Number, required: true, min: 0 },
    soldBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Sale: Model<ISale> = mongoose.model<ISale>("Sale", saleSchema);
