require('dotenv').config();
const express  = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const bcrypt = require("bcryptjs");

require("./db/conn");
const Register = require("./models/userregister");
const port = process.env.PORT || 3000;

//displaying our static index.html vala page
//koi bhi static website h uski html css bs is public folder m lakr rakh do, aur app.use m uska path de do, aur kaam ho jaega..but we r removing this index.html coz we r goind to do it with pure backend
//to use template engine must create folder with name views and then i created index.hbs in it
const staticpath = path.join(__dirname, "../public")
const templates_path = path.join(__dirname, "../templates/views")
const partials_path = path.join(__dirname, "../templates/partials")

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.static(staticpath));
//to mne to index.html delete kr di he to node / vali code p phoch kr browser pe hello worl you are awesome dikha dega whih i do not want..ab mujhe set karna padegaviews engine ko aur apne express application ko btana padega ki m using handlebar.
app.set("view engine", "hbs");
app.set("views" , templates_path)       //this line means i have changed views folder path now its under template folder..ab path chnaged ho gya he template path.
//in order to use partials we have to do it like this..simply nahi chalega
//y partials ka code alag page pr likh rahe h.. mtlb agr navbar tumhe hr login , reg page , jha bhi chchiye to us page p just write {{>navbar}}
//add -e js,hbs in script dev.
hbs.registerPartials(partials_path);

console.log(`env key is ${process.env.SECRET_KEY}`);
app.get("/",  (request, response)=>{
    // resposne.send("Hello World you are awesome");
    response.render("index");
})

app.get("/register",  (request, response)=>{
    // resposne.send("Hello World you are awesome");
    response.render("register");
})

app.get("/login",  (request, response)=>{
    response.render("login");
})

app.post("/register", async (request, response)=>{
 try{
    // console.log(request.body.firstname);
    // response.send(request.body.firstname)
    const password = request.body.password;
    const cpassword = request.body.confirmpassword;
    //getting data
    if(password === cpassword){
        const registerEmployee = new Register({
            firstname: request.body.firstname,
            lastname: request.body.lastname,
            email: request.body.email,
            gender: request.body.gender,
            phone: request.body.phone,
            age: request.body.age,
            password:  request.body.password,
            confirmpassword: request.body.confirmpassword
        })
        // before saving our data into database i need to hash my password. 
        //middleware = basically jo invigilator hmara hall ticket check krta hki aap vahi ho na..

        //ek function call
        const token = await registerEmployee.generateauthtoken();

        const registereddata = await registerEmployee.save();
        console.log(registereddata)
        response.status(201).render("index");
    }
    else{
        response.send("passwords are not matching");
    }
 }
 catch(err){
    response.status(400).send(err);
 }
})

//login check
app.post("/login", async (request, response)=>{
try{
    //using name attribute of input tag
    const email = request.body.email;
    const password = request.body.password;

    console.log(`${email} and paswword is ${password}`)
    //finding email id exist or not
    const useremail =  await Register.findOne({email:email})

    const ismatch = await bcrypt.compare(password , useremail.password);
    
    if (!useremail) {
        // User with the provided email does not exist
        return response.status(401).send("User not found");
    }
    //da and user  n jo enter kiya pass.
    if(ismatch){
         response.status(200).render("index");
    }
    else{
        response.send("pass not matching")
    }
//    repsonse.send(useremail)
//    console.log(useremail);

}
catch(err){
    response.status(400).send(err);
}
})

//securing data

const securePassword = async (password) =>{
    const passwordhash = await bcrypt.hash(password, 10);
    console.log(passwordhash)
    //comparing userpassword and database password
    const passwordmatch = await bcrypt.compare(password, passwordhash);
    console.log(passwordmatch)      //true or flase
}

securePassword("thapa@123");
//whenever any user is registring so we r genrating a token for him jis se we can know ki y vahi ame user tha..
const jwt = require("jsonwebtoken");
const createtoken = async ()=>{
    //payload(unique thing in db like id) and a secretkey(32 characters atleast) as argument, u can also add expire session here
const token = await jwt.sign({id:"66404bfa4f3b43234c5f068e"} , "mynameisvinodbahadurthapayoutuber");
console.log(token);
//how server will verify that token
const verifytoken = await jwt.verify(token , "mynameisvinodbahadurthapayoutuber");
console.log(verifytoken);
}
createtoken();

app.listen(port, ()=>{
    console.log(`server is running at port Number ${port}`);
})