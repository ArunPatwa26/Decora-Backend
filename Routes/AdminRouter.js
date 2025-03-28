const express = require("express");
const router = express.Router();
const { createAdmin,updateAdmin,loginAdmin } = require("../Controller/AdminController");

router.post("/register", createAdmin);
router.post("/login", loginAdmin);
router.put("/update/:id", updateAdmin);

module.exports = router;
