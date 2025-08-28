const Book = require("../models/Book");
const Order = require("../models/orders");
const Booking = require("../models/Bookings");
const PDFDoc = require("pdfkit");
const User = require("../models/User");

exports.getUserOrders = (req, res, next) => {
  const { userId } = req.params;
  if (!req.user) {
    return res.status(422).redirect("/user/account");
  } else if (req.user.role === "staff") {
    return res.status(422).redirect("/books");
  }

  Order.find({ userId: userId })
    .then((orders) => {
      if (orders.length < 1) {
        return res.render("orders", {
          title: `${req.user.name} orders`,
          path: `/users/${userId}/orders`,
          orders: [],
        });
      }

      // make it work for multiple orders
      const bookingIds = orders.map((order) => {
        return order.bookId;
      });

      const orderIds = orders.map((order) => {
        return order._id;
      });

      Booking.find({
        _id: {
          $in: bookingIds,
        },
      }).then((bookings) => {
        const allCarts = bookings.map((booking) => {
          return booking.cart;
        });
        // for each cart pull the _id
        let testSet = [];
        allCarts.forEach((cart) => {
          testSet = [...testSet, ...cart];
        });

        Book.find({
          _id: {
            $in: testSet,
          },
        }).then((allBooks) => {
          let updatedOrders = allBooks.map((book) => {
            return {
              orderId: null,
              book: book,
            };
          });
          for (let i = 0; i < updatedOrders.length; i++) {
            updatedOrders[i].orderId = orderIds[i];
          }

          return res.render("orders", {
            title: `${req.user.name} orders`,
            path: `/users/${userId}/orders`,
            orders: updatedOrders,
          });
        });
      });
    })
    .catch((err) => {
      console.error(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};
exports.postGetOrderInvoice = (req, res, next) => {
  const { orderId } = req.body;
  Order.findById(orderId)
    .then((order) => {
      Booking.findById(order.bookId)
        .then((booking) => {
          if (!booking) {
            return next("Booking not found");
          }
          const b_cart = booking.cart;
          User.findById(order.userId)
            .then((user) => {
              if (!user) {
                return next("User not found");
              }
              const filename = `Invoice-${Date.now().toLocaleString()}.pdf`;
              const pdf = new PDFDoc();
              res.setHeader("Content-Type", "application/pdf");
              res.setHeader(
                "Content-Disposition",
                `attachment; filename="${filename}"`
              );
              pdf.fontSize(24).text("Order Invoice", {
                underline: true,
              });
              pdf.text("\n-----------------------------\n");
              pdf
                .fontSize(16)
                .text(`Name: ${user.name} \nEmail: ${user.emailId}\n`);
              pdf.fontSize(20).text("Books");
              pdf.text("\n-----------------------------\n");
              pdf.fontSize(16).text(`Books total: ${b_cart.length}`);
              pdf.pipe(res);
              pdf.end();
            })
            .catch((err) => {
              return next(err);
            });
        })
        .catch((err) => {
          return next(err);
        });
    })
    .catch((err) => {
      return next(err);
    });
  //
};

exports.postDeleteOrders = (req, res, next) => {
  const { orderId } = req.body;
  Order.findByIdAndDelete(orderId)
    .then((success) => {
      if (!success) {
        return next("This is a server problem. We will resolve it soon");
      }
      return res.redirect("/user/" + req.user._id + "/orders");
    })
    .catch((err) => {
      return next(err);
    });
};
