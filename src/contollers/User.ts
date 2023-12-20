
import { Router } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import * as bcrypt from "bcrypt";

const authRouter = Router();

authRouter.post("/signup", async (req, res) => {
    console.log("Hello");
    try {
      // hash the password
      req.body.password = await bcrypt.hash(req.body.password, 10);
      // create a new user
      const user = await User.create(req.body);
      // send new user as response
      res.json(user);
    } catch (error) {
      res.status(400).json({ error });
    }
});

authRouter.post("/login", async (req, res) => {
    const secr = process.env.SECRET;
    try{
        const user = await User.findOne({username: req.body.username});
        if(user) {
            const result = await bcrypt.compare(req.body.password, user.password);
            if(result) {
                const token = jwt.sign({ username: user.username }, secr);
                res.json({token});
            } else {
                res.status(400).json({error: "Password doesn't match"});
            }
        } else {
            res.status(400).json({error: "User doesn't exist"});
        }
    } catch (error) {
        res.status(400).json({error});
    }
});
  
export { authRouter };