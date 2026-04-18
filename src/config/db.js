import mongoose from "mongoose";

export const dataBase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected:`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
};