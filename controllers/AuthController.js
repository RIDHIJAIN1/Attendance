// const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// const { sendSuccess, sendError } = require('../utils/response');
const User = require('../models/User');
const OAUTH_SECRET = process.env.OAUTH_SECRET;


const signup = async(req,res)=>{
    const {name,email,password} = req.body;
    
    let user = await User.findOne({email});
    
    
    
    if(user){
        return res.status(404).json({
            success:false,
            message:"User already exist"
        })
    }
    const hashedPassword = await bcrypt.hash(password, 10);
        
     user = await User.create({
        name,
        email,
        password:hashedPassword,
     })
    
     console.log(OAUTH_SECRET);
     const token = jwt.sign({ id: user._id }, OAUTH_SECRET, { expiresIn: '1d' });
     console.log(token);
    
      res.status(201).json({
        success:true,
        token,
        message:'Registered Successfully'
      })
    
     
    };

const login = async(req,res,next)=>{
    const{email,password} = req.body;
    const user = await User.findOne({email}).select("+password")
   
    if (user && user.blocked) {
      return res.status(403).json({ success: false, message: 'User is blocked' });
    }

    if(!user)
    return res.status(404).json({
       success: false,
       message: "Invalid email or password"
    })

    const isMatch = await bcrypt.compare(password , user.password)

    if(!isMatch)
    return res.status(404).json({
        success: false,
        message: "Invalid email or password"
     });

 
     const token = jwt.sign({ id: user._id }, OAUTH_SECRET, { expiresIn: '1d' });
   

  res.status(201).json({
    success:true,
    token,
    user,
    message:`Welcome back, ${user.name}`
  
  })
  console.log(user)
}
module.exports = { signup, login };
