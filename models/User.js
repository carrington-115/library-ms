// const { ObjectId } = require("mongodb");
// const _client = require("../util/client");
// const db = _client.db("library_os");
// const users = db.collection("users");
// const Bookings = require("./Bookings");
const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const User = new Schema({
  uid: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  emailId: {
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
  role: {
    type: String,
    required: true,
  },
  passwordResetToken: {
    type: String,
    required: false,
  },
  passwordResetTokenExpirationDate: {
    type: String,
    required: false,
  },
  cart: [
    {
      _id: { type: Types.ObjectId, required: true },
      qty: { type: Number, required: true },
    },
  ],
});

module.exports = mongoose.model("User", User);

// class User {
//   constructor(uid, name, emailId, faculty, department, role, cart) {
//     this.uid = uid; // we can consider this to be the user id like an enrollment number for student and employee id for staff
//     this.name = name;
//     this.emailId = emailId;
//     this.faculty = faculty;
//     this.department = department;
//     this.role = role;
//     this.cart = cart;
//   }

//   save() {
//     return users
//       .insertOne(this)
//       .then((result) => {
//         console.log("User has completed sign up");
//       })
//       .catch((err) => {
//         console.error(err);
//       });
//   }

//   static getUserById(id) {
//     return users.findOne({ _id: new ObjectId(id) });
//   }

//   static updateSavedUser(id, updatedUserDetails) {
//     return users
//       .updateOne(
//         { _id: new ObjectId(id) },
//         {
//           $set: updatedUserDetails,
//         }
//       )
//       .then((data) => {
//         console.log("User account updated");
//       })
//       .catch((err) => {
//         console.error(err);
//       });
//   }

//   static deleteUserById(id) {
//     return users
//       .deleteOne({ _id: new ObjectId(id) })
//       .catch((err) => console.error(err));
//   }

//   addBookToCart(bookId) {
//     const bookInCartCheck = this.cart.find((book) => book._id === bookId);
//     const cartBook = {
//       _id: bookId,
//       qty: 1,
//     };
//     let updatedCart;
//     if (bookInCartCheck) {
//       throw "Book is already in cart";
//     } else {
//       updatedCart = [...this.cart, cartBook];
//     }
//     return users.updateOne(
//       { uid: this.uid },
//       {
//         $set: {
//           cart: updatedCart,
//         },
//       }
//     );
//   }

//   deleteBookFromCart(bookId) {
//     const updatedCart = this.cart.filter((book) => {
//       return book._id !== bookId;
//     });

//     return users.updateOne(
//       { uid: this.uid },
//       {
//         $set: { cart: updatedCart },
//       }
//     );
//   }

//   checkOutCart() {
//     const BookingOrder = new Bookings(
//       this.cart,
//       this.uid,
//       this.name,
//       this.emailId,
//       this.faculty,
//       this.department
//     );
//     return BookingOrder.addBooking()
//       .then((data) => {
//         return users.updateOne({ uid: this.uid }, { $set: { cart: [] } });
//       })
//       .catch((err) => console.error(err));
//   }
// }

// module.exports = User;
