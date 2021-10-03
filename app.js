require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

//const bcrypt = require('bcrypt');
//const md5 = require('md5');
//const encrypt = require('mongoose-encryption');
//const { StringDecoder } = require('string_decoder');

//const saltRounds =10;

const app= express();

//console.log(md5(123456));

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: "Our secret string",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology:true});
//mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

//encryption using mongoose-encryption.
//userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User = new mongoose.model("User", userSchema);
//createStrategy is responsible to setup passport-local LocalStrategy with the correct options.
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/",function(req,res){
    res.render("home");
})

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/register",function(req,res){
    res.render("register");
});

app.get("/secrets", function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }
    else{
        res.redirect("/login");
    }
});

app.get("/logout", function(req,res){
    req.logout();
    res.redirect("/");
});

app.post("/register",function(req,res){

    // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    //     const newUser= new User({
    //         email: req.body.username,
    //         password: hash
    //     });
    //     newUser.save(function(err){
    //         if(err)
    //          console.log(err);
    //         else
    //          res.render("secrets");
    //     });
    // });
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if(err)
        {
            console.log(err);
            res.send("/register");
        }
        else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    })
    
})

app.post("/login",function(req,res){
//     const username= req.body.username;
//     const password = req.body.password;
//    // const password = md5(req.body.password); //encryption using md5 hashing

//     User.findOne({email: username}, function(err, foundUser){
//         if(err)
//          console.log(err);
//         else{
//             if(foundUser){
//                 bcrypt.compare(password, foundUser.password, function(error, result) {
//                     if(!error)
//                     {
//                         if(result===true)
//                         res.render("secrets");
//                     }
//                     else
//                      console.log(error);
                    
//                 });
                
//             }
//         }
//     });

        const user = new User({
            username: req.body.username,
            password: req.body.password
        });

        req.login(user, function(err){
            if(err)
            {
                console.log(err);
            }
            else{
                passport.authenticate("local")(req, res, function(){
                    res.redirect("/secrets");
                });
            }
        })
});

app.listen(3000, function(req,res){
    console.log("go to 3000");
});