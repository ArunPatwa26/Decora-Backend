const express = require("express");
const router = express.Router();
const { createUser, loginUser, updateUser, getAllUsers, deleteUser , getUserById } = require("../Controller/UserController");

router.get("/all-user", getAllUsers);
router.get('/:id', getUserById);
router.post("/register", createUser);
router.post("/login", loginUser);
router.put("/update/:id", updateUser);
router.delete("/delete-user/:id", deleteUser);


module.exports = router;
