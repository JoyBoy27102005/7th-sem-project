import mongoose from "mongoose";

async function test() {
  try {
    await mongoose.connect(
      "YOUR_MONGO_URI_HERE"
    );

    console.log("Connected Successfully");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();