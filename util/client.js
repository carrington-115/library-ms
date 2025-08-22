require("dotenv").config();
const { MongoClient } = require("mongodb");
const _client = new MongoClient(
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_DB_PASSWORD}@book-store-cluster.4dykwvv.mongodb.net/?retryWrites=true&w=majority&appName=book-store-cluster`
);

module.exports.connection = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_DB_PASSWORD}@book-store-cluster.4dykwvv.mongodb.net/library_os?retryWrites=true&w=majority&appName=book-store-cluster`;

module.exports.client = _client;
