import express from 'express'; 
import mongoose from 'mongoose'; 
import bcrypt from 'bcryptjs'; 
import jwt from 'jsonwebtoken'; 
import UserModel from './models/userModel.js'; 
import foodModel from './models/foodModel.js';
import verifytoken from './verifyToken.js';
import trackingModel from './models/trackingModel.js';



// Database connection
mongoose.connect("mongodb://localhost:27017/nutrify")
    .then(() => {
        console.log("Connected to MongoDB...");
    })
    .catch((error) => {
        console.log("Error connecting to MongoDB: ", error);
    });

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// User registration route
app.post("/register", async (req, res) => {
    let user = req.body;

    try {
        const salt = await bcrypt.genSalt(10); // Generate salt
        const hashedPassword = await bcrypt.hash(user.password.toString(), salt); // Password ko string me convert karein
        user.password = hashedPassword; // Set the hashed password

        // Create and save the user
        const doc = await UserModel.create(user);
        res.status(201).send({ message: "User Registered" });
    } catch (err) {
        console.log("Error: ", err);
        res.status(500).send({ message: "Some Problem" });
    }
});

// User login route

app.post('/login', async (req, res) => {
    let userCred = req.body;
    try {
        const user = await UserModel.findOne({ email: userCred.email });
        if (user !== null) {
            bcrypt.compare(userCred.password, user.password, (err, sucess) => {
                if (sucess == true) {
                    jwt.sign({ email: userCred }, "nutrifyapp", (err, token) => {
                        if (!err) 
                        {
                            res.send({ message: "Login Success", token: token, userid: user._id, name: user.name });
                        }
                    })
                }
                else
                {
                    res.status(401).send({ message: "Invalid Password" });
                }
            })
        } 
        else 
        {
            res.status(404).send({ message: "User Not Found" });
        }


    } catch (error) {
        console.log("Error: ", error);
        res.status(500).send({ message: "Some Problem" });
    }
})

// endpoint to see all the food items

app.get('/foods',verifytoken,async(req,res)=>{
    try{
        let foods = await foodModel.find();
        res.send(foods);
    }catch(err){
        console.log("Error: ",err);
        res.status(500).send({ message: "Some Problem while getting food items." });
    }
})

// Search food by name
app.get ('/food/:name',verifytoken,async(req,res)=>{
    try{
        let foods = await foodModel.find({name:{$regex:req.params.name,$options:'i'}})
        if (foods.length!==0)
        {
            res.send(foods);
        }else{
            res.status(500).send({ message: "food item not found....." });
        }
        

    }catch (error){
        console.log("Error: ",error);
        res.status(500).send({ message: "Some Problem while searching food by name." });
    }
    
})

// Endpoint to track a food
app.post("/track",verifytoken,async(req, res)=>{
    let trackData = req.body;
    try{
        let data = await trackingModel.create(trackData);
        console.log(data);
        res.status(201).send({ message: "Food Added Successfully" });   
    }catch(error){
        console.log("Error: ",error);
        res.status(500).send({ message: "Some Problem while tracking food." });
    }

})

// Endpoint to fetch all foods by a person
app.get("/track/:userid/:date",async (req,res)=>{

    let userid = req.params.userid;
    let date = new Date(req.params.date);
    let strDate = date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();
    

    try
    {

        let foods = await trackingModel.find({userId:userid,eatenDate:strDate}).populate('userId').populate('foodId')
        res.send(foods);

    }
    catch(err)
    {
        console.log(err);
        res.status(500).send({message:"Some Problem in getting the food"})
    }
})


// Start the server
app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});
