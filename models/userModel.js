import mongoose from 'mongoose'; 

// Define a schema 
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    age: { type: Number, required: true, min: 10 },
},{timestamps: true});

// Model
const UserModel = mongoose.model('user', userSchema);

export default UserModel; 