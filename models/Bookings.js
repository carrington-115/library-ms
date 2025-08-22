// const { ObjectId } = require("mongodb");
// const client = require("../util/client");
// const db = client.db("library_os");
// const bookings = db.collection("bookings");
// const moment = require("moment");
const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const Bookings = new Schema({
  cart: [
    {
      _id: {
        type: Types.ObjectId,
        required: true,
      },
      qty: Number,
    },
  ],
  bookingDate: {
    type: String,
    required: true,
  },
  returnDate: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  faculty: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Bookings", Bookings);

// class Bookings {
//   constructor(cart, userId, username, email, faculty, department) {
//     this.cart = cart;
//     this.userId = userId;
//     this.username = username;
//     this.email = email;
//     this.faculty = faculty;
//     this.department = department;
//   }

//   addBooking() {
//     return bookings.insertOne({
//       cart: this.cart,
//       bookingDate: moment().format("L"),
//       returnDate: moment().add(16, "days").calendar(),
//       user: {
//         uid: this.userId,
//         name: this.username,
//         email: this.email,
//         faculty: this.faculty,
//         department: this.department,
//       },
//     });
//   }

//   getAllBookings(uid) {
//     return bookings.find({ "user.uid": uid }).toArray();
//   }

//   static handleDeleteBooking(id) {
//     return bookings.deleteOne({ _id: new ObjectId(id) });
//   }
// }

// module.exports = Bookings;
