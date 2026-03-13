const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "supersecretkey";

/* REGISTER */

exports.register = async(req,res)=>{

    try{

        const {name,email,password} = req.body;

        const existing = await User.findOne({email});

        if(existing){

            return res.status(400).json({
                error:"User already exists"
            });

        }

        const hashed = await bcrypt.hash(password,10);

        const user = new User({

            name,
            email,
            password:hashed

        });

        await user.save();

        res.json({

            success:true,
            message:"User registered successfully"

        });

    }

    catch(err){

        res.status(500).json({
            error:err.message
        });

    }

};


/* LOGIN */

exports.login = async(req,res)=>{

    try{

        const {email,password} = req.body;

        const user = await User.findOne({email});

        if(!user){

            return res.status(400).json({
                error:"Invalid email"
            });

        }

        const match = await bcrypt.compare(password,user.password);

        if(!match){

            return res.status(400).json({
                error:"Invalid password"
            });

        }

        const token = jwt.sign(

            {id:user._id},

            JWT_SECRET,

            {expiresIn:"7d"}

        );

        res.json({

            success:true,

            token,

            user:{
                id:user._id,
                name:user.name,
                email:user.email
            }

        });

    }

    catch(err){

        res.status(500).json({
            error:err.message
        });

    }

};