const express = require("express");
const userController = require("../controllers/userController");

router = express.Router();

router
  .route("/:userId/avatar")
  .get(
    userController.checkAvatar,
    userController.checkUser,
    userController.getUserAvatar
  );

router
  .route("/:userId/avatar")
  .delete(userController.checkAvatar, userController.deleteUserAvatar);

router
  .route("/:userId")
  .get(
    userController.checkAvatar,
    userController.checkUser,
    userController.getUserById
  );

module.exports = router;
