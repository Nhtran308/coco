import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    brand: { type: String, required: true },
    subCategory: { type: String, required: true },
    colors: { type: Array, required: true },
    sizes: { type: Array, required: true },
    totalStock: { type: Number, required: true },
    totalSold: { type: Number, default: 0 },
    bestseller: { type: Boolean, required: true },
    averageReview: { type: Number, required: false, default: 0 },
    date: { type: Number, required: true },
  },
  { timestamps: true }
);

const productModel =
  mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
