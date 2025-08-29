const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  bookId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  blobStorageUrl: {
    type: String,
    required: false,
    default: null,
  },
});

module.exports = mongoose.model("Order", orderSchema);
