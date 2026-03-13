const jwt = require("jsonwebtoken");

const JWT_SECRET = "supersecretkey";

module.exports = function(req,res,next){

    try{

        const authHeader = req.headers.authorization;

        if(!authHeader){
            return res.status(401).json({error:"No token provided"});
        }

        // Bearer token split
        const token = authHeader.split(" ")[1];

        if(!token){
            return res.status(401).json({error:"Invalid token format"});
        }

        const decoded = jwt.verify(token,JWT_SECRET);

        req.user = decoded;

        next();

    }
    catch(err){

        console.error("Token verification failed:",err);

        res.status(401).json({
            error:"Invalid or expired token"
        });

    }

};