const express = require("express");
const router = express.Router();
const { createTransport } = require("../controllers/gmail");
const multer = require("multer");

const upload = multer({
    storage: multer.memoryStorage()
});

router.post("/send-email", upload.single("pdf"), createTransport);

module.exports = router;