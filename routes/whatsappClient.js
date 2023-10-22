const { Client } = require("whatsapp-web.js");
const { MongoClient } = require("mongodb");

// MongoDB URI
const uri = "mongodb+srv://kevin:kevin@cluster0.xyjfa6e.mongodb.net/";

// Create a new MongoClient
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Function to connect to the server and update the database
async function run() {
  try {
    // Connect to the MongoDB cluster
    await client.connect();

    // Set up WhatsApp client
    const whatsappClient = new Client();

    whatsappClient.on("qr", (qr) => {
      // Following your existing QR code logic
      console.log(qr);
      process.send("QR RECEIVED " + qr);
    });

    whatsappClient.on("ready", () => {
      console.log("WhatsApp Client is ready!");
    });

    whatsappClient.on("message", async (msg) => {
      try {
        // Extract information
        const text = msg.body;
        const user = msg._data.notifyName; // This field might differ based on the API's response structure
        const timestamp = msg.timestamp;

        // Specify the database and collection
        const database = client.db("users");
        const messages = database.collection("messages");

        // Create a document to be inserted
        const document = {
          text,
          user, // You might need to parse the correct user identity (like name) based on your requirements
          timestamp: Number(timestamp), // Ensure this is in the correct format you need
        };

        // Insert the message into the database
        const result = await messages.insertOne(document);
        console.log(`Message saved with ID: ${result.insertedId}`);
      } catch (error) {
        console.error("Error in message event: ", error);
      }
    });

    whatsappClient.initialize();
  } catch (e) {
    console.error(e);
  }
}

// Run the function to connect to the server and listen for WhatsApp messages
run().catch(console.dir);

// This should ideally be handled better, based on your application's logic.
process.on("exit", (code) => {
  console.log(`About to exit with code: ${code}`);
  client.close(); // Ensure the MongoDB client is closed on process termination
});
