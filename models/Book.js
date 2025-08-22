// const { ObjectId } = require("mongodb");
// const client = require("../util/client");
// const database = client.db("library_os");
// const books = database.collection("books");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const Book = new Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  ISBN: {
    type: String,
    required: true,
  },
  publishedDate: {
    type: String,
    required: true,
  },
  shelfNumber: {
    type: Number,
    required: true,
  },
  amountAvailable: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Book", Book);

// class Book {
//   constructor(
//     name,
//     image,
//     author,
//     ISBN,
//     publishedDate,
//     shelfNumber,
//     amountAvailable,
//     description
//   ) {
//     this.name = name;
//     this.image = image;
//     this.publishedDate = publishedDate;
//     this.shelfNumber = shelfNumber;
//     this.amountAvailable = amountAvailable;
//     this.author = author;
//     this.ISBN = ISBN;
//     this.description = description;
//   }

//   save(callback) {
//     books
//       .insertOne(this)
//       .then((data) => {
//         callback(data.insertedId);
//       })
//       .then((error) => {
//         console.error(error);
//       });
//   }

//   static getBookById(id, callback) {
//     books
//       .findOne({ _id: new ObjectId(id) })
//       .then((book) => {
//         callback(book);
//       })
//       .catch((err) => {
//         console.error(err);
//       });
//   }

//   static getAllBooks(callback) {
//     return books
//       .find()
//       .toArray()
//       .then((data) => {
//         callback(data);
//       })
//       .catch((err) => console.error(err));
//   }

//   static deleteBookById(id) {
//     return books
//       .deleteOne({ _id: new ObjectId(id) })
//       .then((res) => {
//         console.log("Deleted");
//       })
//       .catch((err) => console.error(err));
//   }

//   static updateBookById(id, data) {
//     return books
//       .updateOne(
//         { _id: new ObjectId(id) },
//         {
//           $set: {
//             name: data.title,
//             image: data.image,
//             author: data.author,
//             ISBN: data.isbn,
//             publishedDate: data.pub,
//             shelfNumber: data.position,
//             amountAvailable: data.size,
//             description: data.description,
//           },
//         }
//       )
//       .then((res) => {
//         console.log("updated");
//       })
//       .catch((err) => console.error(err));
//   }

//   static getAllCartBooks(cart) {
//     const bookIds = cart.map((book) => {
//       return new ObjectId(book._id);
//     });
//     return books
//       .find({
//         _id: { $in: bookIds },
//       })
//       .toArray();
//   }
// }

// module.exports = Book;
