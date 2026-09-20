const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://nexstepai_db_user:<Jarvis1109>@cluster1.wdh9pvm.mongodb.net/?appName=Cluster1";

async function main() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log("Connected!");
    await client.close();
  } catch (e) {
    console.error(e);
  }
}

main();