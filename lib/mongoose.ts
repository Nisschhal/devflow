import mongoose, { Mongoose } from "mongoose"
import logger from "./logger"

// grab the mongodb url from .env file
const MONGODB_URI = process.env.MONGODB_URI as string

// if someone forgot to add it in .env, crash early with a clear message
if (!MONGODB_URI) throw new Error("MONGODB_URI missing!")

// shape of our cache - what we store globally
interface MongooseCache {
  conn: Mongoose | null // the actual connection (null until connected)
  promise: Promise<Mongoose> | null // a connection in progress (only used once)
}

// store the cache on global so it survives hot reloads in development
// without this, every time you save a file, a NEW connection would be created
declare global {
  var mongoose: MongooseCache
}

// check if we already have a cache from a previous load
let cached = global.mongoose

// first time ever? create an empty cache
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

const dbConnect = async (): Promise<Mongoose> => {
  // already connected before? just reuse it, no waiting needed
  if (cached.conn) {
    logger.info("Using existing mongoose connection")
    return cached.conn
  }

  // no one started connecting yet? start now and save the promise
  // if someone else already started, we skip this and just wait on their promise
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "devflow",
      })
      .then((result) => {
        logger.info("Connected to MongoDB")
        return result
      })
      .catch((error) => {
        logger.error("Error connecting to MongoDB!", error)
        throw error
      })
  }

  // wait for the connection to finish and store it
  // next time someone calls dbConnect, they'll get it instantly from cached.conn
  cached.conn = await cached.promise

  return cached.conn
}

export default dbConnect
