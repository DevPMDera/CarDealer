// ============================
// Appwrite Configuration
// ============================

/* const client = new Appwrite.Client();

client
    .setEndpoint("https://fra.cloud.appwrite.io/v1") // Replace if yours is different
    .setProject("6a5e53fe003d5c21264b");

// Services
const databases = new Appwrite.Databases(client);

// IDs
const DATABASE_ID = "6a5e55c600120ce8b813";
const CARS_COLLECTION_ID = "cars";

console.log("✅ Appwrite Connected"); */







const client = new Appwrite.Client();

client
    .setEndpoint("https://fra.cloud.appwrite.io/v1")
    .setProject("6a5e53fe003d5c21264b");

const databases = new Appwrite.Databases(client);
const storage = new Appwrite.Storage(client);

const DATABASE_ID = "6a5e55c600120ce8b813";
const CARS_COLLECTION_ID = "cars";
const BUCKET_ID = "cars-images";

console.log("✅ Appwrite Connected");
