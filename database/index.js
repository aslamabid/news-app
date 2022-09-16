import mongoose from "mongoose";
import { MONGO_URI } from "../config";

const dbConnection = () => {
    mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => {
        console.log(`DB connected successfully`);
    }).catch((err) => {
        console.log('Error while connecting to DB', err);
    })
};

export default dbConnection;