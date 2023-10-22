var express = require("express");
var router = express.Router();
const { fork } = require("child_process");
const qrcodeParser = require("qrcode-terminal");
const cors = require("cors");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

let connected = false
/* GET test page and initialize WhatsApp Web client in a child process */
router.get("/test", cors(), function (req, res, next) {
  if (connected) return
  connected = true

  // Fork a child process to run the WhatsApp client
  const childProcess = fork("./routes/whatsappClient.js");
  

  // Listen for any messages from the child process
  childProcess.on("message", (message) => {
    //check for QR RECEIVED in message
    if (message.includes("QR RECEIVED")) {
      const qrCode = message.replace("QR RECEIVED ", "");
      qrcodeParser.generate(qrCode, { small: true });
      //send the QR code to the client without the QR RECEIVED text
      res.send(qrCode);
      
    }
  });

  childProcess.on("exit", (code) => {
    console.log(`Child process exited with code ${code}`);
  });
});

module.exports = router;
