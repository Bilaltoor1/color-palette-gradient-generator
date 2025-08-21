import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  // don't throw at module import time, that makes routes fail to load and return
  // an empty response which causes `res.json()` on the client to blow up.
  // Instead warn and let dbConnect throw when actually called.
  console.warn("MONGODB_URI is not set in environment variables — DB calls will fail until set.");
}

let cached = global._mongoose;

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Set it in your environment to connect to MongoDB.");
  }

  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: undefined,
    }).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
