import express from "express";
import cors from "cors";
import {json} from 'body-parser';
import mongoose from 'mongoose';
import connectDB from "./config/db";
import * as dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler";
import { chatRouter } from "./routes/chatRoutes";
import { router } from "./routes/userRoutes";

dotenv.config();

const app= express();
const PORT= process.env.PORT || 3000;

//connect to db
connectDB()

app.use(express.json());
app.use(chatRouter);
app.use(router);

const server=app.listen(
    PORT,()=>{
        console.log(`Server is running on port ${PORT}`)
    }
)