const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt= require("jsonwebtoken");
const { response } = require("express");
const employeeSchema = new mongoose.Schema({
    firstname:{
        type: String,
        required: true
    },
    lastname:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required:true,
        unique: true
    },
    gender:{
        type: String,
        required: true
    },
    phone:{
        type: Number,
        required: true,
        unique: true
    },
    age:{
        type: Number,
        required: true
    },

    password:{
        type: String,
        required: true
    },

    confirmpassword:{
        type: String,
        required: true
    },
    tokens:[{
        token: {
            type: String,
            required: true
        }
    }]
})
//generating tokens
employeeSchema.methods.generateauthtoken = async function (){
try{
const token = jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY);
this.tokens = this.tokens.concat({token:token})
await this.save();
// console.log(token);
return token;
}
catch(err){
response.send("the error part" +err);
console.log("the error part" +err)
}
}
//coverting passowrd into hash
employeeSchema.pre("save" , async function(next){
    // const passwordhash = await bcrypt.has(password, 10);
    if(this.isModified("password")){
    console.log(`current password is ${this.password}`)
    this.password = await bcrypt.hash(this.password ,10);
    console.log(`encrypted password is ${this.password}`)
    
    //to make sure confirm password field should be empty.
    this.confirmpassword = undefined;
    }

    next();
})

//creating collection
const Register = new mongoose.model("Register", employeeSchema);

module.exports = Register;