require("dotenv").config();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const moment = require("moment");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

// sendgridTransport.
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API,
    },
  })
);

exports.getSignUpToAccount = (req, res, next) => {
  const user = req?.user;
  if (user) {
    return res.redirect("/user/profile");
  }
  res.render("accounts/signup", {
    title: "Sign up here",
    path: "/user/account",
    cart: req?.user?.cart,
  });
};

exports.getLoginToAccount = (req, res, next) => {
  const user = req?.user;
  if (user) {
    return res.redirect("/user/profile");
  }
  res.render("accounts/login", {
    title: "Login here",
    path: "/user/account/login",
    cart: req?.user?.cart,
  });
};

exports.getEditAccountDetails = (req, res, next) => {
  const user = req?.user;
  if (!user) {
    return res.redirect("/user/account");
  }

  // go here if the user exist
  res.render("edit-account", {
    title: "Edit your user account details",
    path: "/user/profile",
    user: user,
    cart: req?.user?.cart,
  });
};

exports.getUserProfile = (req, res, next) => {
  if (!req?.user) {
    return res.redirect("/user/account");
  }
  res.render("profile.pug", {
    title: `${req?.user?.name}`,
    path: "/user/profile",
    cart: req?.user?.cart,
  });
};

exports.getResetPassword = (req, res, next) => {
  const time = moment().add(1, "hour").format();
  console.log(time);
  res.render("accounts/reset-password", {
    title: `Reset your password`,
    path: "/user/account",
    cart: req?.user?.cart,
  });
};

exports.getUpdatePassword = (req, res, next) => {
  const tokenId = req.params.tokenId;
  User.findOne({ passwordResetToken: tokenId })
    .then((user) => {
      if (!user) {
        return res.render("accounts/update-password-error", {
          title: "Error detected",
          path: "/user/account",
          cart: req?.user?.cart,
          content: {
            title: "This code is either invalid or user does not exist",
            link: "/user/account",
            btnName: "Create your account",
          },
        });
      }
      const expire = user.passwordResetTokenExpirationDate;
      const current = moment().format();
      switch (current < expire) {
        case true:
          res.render("accounts/update-password", {
            title: "Update your password",
            path: "/user/account",
            cart: req?.user?.cart,
            uid: user.uid,
            token: tokenId,
          });
          break;
        case false:
          res.render("accounts/update-password-error", {
            title: "Error detected",
            path: "/user/account",
            cart: req?.user?.cart,
            content: {
              title: "Password reset link is expired. Request for another one",
              link: "/user/accounts/login/reset-password",
              btnName: "Request another link",
            },
          });
          break;
        default:
          res.render("accounts/update-password-error", {
            title: "Error detected",
            path: "/user/account",
            cart: req?.user?.cart,
            content: {
              title: "This code is either invalid or user does not exist",
              link: "/user/account",
              btnName: "Create your account",
            },
          });
          break;
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

// all the post routes

exports.postEditAccountDetails = (req, res, next) => {
  const userDetails = req.body;
  const id = req?.user?._id;
  User.findByIdAndUpdate(id, {
    uid: userDetails.uid,
    name: userDetails.name,
    password: userDetails.password,
    emailId: userDetails.email,
    faculty: userDetails.faculty,
    department: userDetails.department,
    role: userDetails.role,
  }).then((user) => {
    transporter
      .sendMail({
        from: "fru@student.iul.ac.in",
        to: user.emailId,
        subject: "Your Account has been updated",
        html: `
        <div>
          <h1>Your Account was updated</h1>
          <p><strong>Time:</strong> ${moment().format()}
        </div>
      `,
      })
      .then((success) => {
        res.redirect("/user/profile");
      })
      .catch((err) => console.error(err));
  });
};

exports.postSignUpToAccount = (req, res, next) => {
  const signUpData = req.body; // name, uid, email, faculty, department, role
  const hashedPassword = bcrypt.hash(signUpData.password, 12);
  const validationErrors = validationResult(req).errors;
  // console.log(validationErrors.errors);
  if (validationErrors.length > 0) {
    const errorMessages = validationErrors.map((error) => {
      return `${error.path}: ${error.msg}`;
    });
    let message = "";
    errorMessages.forEach((error) => {
      message = message + " \n " + error;
    });

    console.log(message);
    return res.status(422).render("404", {
      message: message,
    });
  }

  hashedPassword
    .then((hashpsd) => {
      const LibraryUser = new User({
        uid: signUpData.uid,
        name: signUpData.name,
        password: hashpsd,
        emailId: signUpData.email,
        faculty: signUpData.faculty,
        department: signUpData.department,
        role: signUpData.role,
        cart: [],
      });
      return LibraryUser.save();
    })
    .then((user) => {
      transporter
        .sendMail({
          from: "fru@student.iul.ac.in",
          to: user.emailId,
          subject: "Sign up successful",
          html: `
          <div>
            <h1>Your Account was created</h1>
            <p><strong>Time and date:</strong> ${moment().format()}
          </div>
        `,
        })
        .then((success) => {
          req.session.isLoggedIn = true;
          req.session.user = user;
          req.session.save((err) => {
            if (err) console.error(err);
            res.redirect("/books");
          });
        })
        .catch((err) => console.error(err));
    })
    .catch((err) => {
      console.error(err);
    });
};

exports.postDeleteAccount = (req, res, next) => {
  const user = req?.user;
  User.findByIdAndDelete(user._id)
    .then((data) => {
      transporter
        .sendMail({
          from: "fru@student.iul.ac.in",
          to: user.emailId,
          subject: "Account termination successful",
          html: `
          <div>
            <h1>Your Account was deleted</h1>
            <p><strong>Time and date:</strong> ${moment().format()}
          </div>
        `,
        })
        .then((success) => {
          req.session.destroy(() => {
            res.redirect("/books");
          });
        })
        .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));
};

exports.postLoginToAccount = (req, res, next) => {
  const user = req.body;
  const errorResults = validationResult(req).errors;

  if (errorResults.length > 0) {
    let message;
    errorResults
      .map((err) => {
        return `${err.path} - ${err.msg}`;
      })
      .forEach((error) => {
        message = message + " \n " + error;
      });

    return res.status(422).render("404", { message });
  }

  User.findOne({ emailId: user?.email })
    .then((dbUser) => {
      if (!dbUser) {
        return res.redirect("/user/account/login");
      }
      bcrypt
        .compare(user.password, dbUser.password)
        .then((matchUser) => {
          if (!matchUser) {
            return res.redirect("/user/account/login");
          }
          transporter
            .sendMail({
              from: "fru@student.iul.ac.in",
              to: user.email,
              subject: "Log in successful",
              html: `
                    <div>
                      <h1>Your Account logged in</h1>
                      <p><strong>Time and date:</strong> ${moment().format()}
                    </div>
                  `,
            })
            .then((success) => {
              req.session.isLoggedIn = true;
              req.session.user = dbUser;
              req.session.save((err) => {
                if (err) {
                  console.error("Login session error:", err);
                  return res.redirect("/user/account/login");
                }
                console.log("User was found. No error again");
                return res.redirect("/user/profile");
              });
            })
            .catch((err) => console.error(err));
        })
        .catch((err) => {
          console.error(err);
          res.redirect("/user/account/login");
        });
    })
    .catch((err) => {
      console.error(err);
      res.redirect("/user/account/login");
    });
};

exports.postLogout = (req, res, next) => {
  transporter
    .sendMail({
      from: "fru@student.iul.ac.in",
      to: req.user.emailId,
      subject: "You logged out from your account",
      html: `
        <div>
          <h1>Your Account received this logout request</h1>
          <p><strong>Date and time:</strong> ${moment().format()}
        </div>
      `,
    })
    .then((success) => {
      req.session.destroy(() => {
        res.redirect("/books");
      });
    })
    .catch((err) => console.error(err));
};

exports.postResetPassword = (req, res, next) => {
  const email = req.body.email;
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.error(err);
      return res.redirect("/user/account/login");
    }
    const token = buffer.toString("hex");
    User.findOne({ emailId: email })
      .then((user) => {
        if (!user) {
          return res.redirect("/user/account/login");
        }
        user.passwordResetToken = token;
        user.passwordResetTokenExpirationDate = moment()
          .add(1, "hour")
          .format();
        return user.save();
      })
      .then((updatedUser) => {
        transporter.sendMail({
          from: "fru@student.iul.ac.in",
          to: updatedUser.emailId,
          subject: "Update your password",
          html: `
            <p>Your Account received this update password request</p>
            <p>Reset password link <a href="http://localhost:3000/user/account/login/update-password/${token}">http://localhost:3000/user/account/login/update-password/${token}</a> </p>
            <p><strong>Date and time:</strong> ${moment().format()} </p>
            <p><strong>This link will expire in:</strong> ${moment()
              .add(1, "hour")
              .format()} </p>
          `,
        });
      })
      .catch((err) => {
        console.error(err);
      });
    res.redirect("/user/account/login");
  });
};

exports.postUpdatePassword = (req, res, next) => {
  const password = req.body.password;
  const confirmPassword = req.body.confirm_password;
  const token = req.body.tokenId;
  const uid = req.body.uid;
  if (password === confirmPassword) {
    bcrypt
      .hash(password, 12)
      .then((hashedPassword) => {
        return User.findOneAndUpdate(
          { uid: uid },
          {
            password: hashedPassword,
          }
        );
      })
      .then((updatedUser) => {
        res.redirect("/user/account/login");
      })
      .catch((err) => console.error(err));
  } else {
    res.redirect(`/user/account/login/update-password/${token}`);
  }
};
