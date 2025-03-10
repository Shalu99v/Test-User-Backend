const userModel = require('../models/UserSchema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.userLogin = async (req, res) => {
  try {
    console.log('Received request body:', req.body);

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and Password are required' });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      console.log('User not found:', email);
      return res.status(404).json({ error: 'Invalid email or password' });
    }

    console.log('Entered Password:', password);
    console.log('Stored Hashed Password:', user.password);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password Match:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const jwtToken = jwt.sign(
      { _id: user._id, email: user.email, name: user.name },
      process.env.JWT_KEY,
      { expiresIn: '7d' }
    );

    console.log('JWT Token generated successfully:', jwtToken);

    return res.status(200).json({
      message: 'Successfully logged in',
      token: jwtToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
  } catch (err) {
    console.error('Error during user login:', err);
    return res.status(500).json({ error: 'Server-side error' });
  }
};

exports.userSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Signup Error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const response = await userModel.find();
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(406).json({
      err: 'server side error',
    });
  }
};

exports.editProfile = async (req, res) => {
  try {
    console.log('Received Body:', req.body);
    console.log('Received File:', req.file);

    const userId = req.user._id; 
    const { name, email ,phoneNumber} = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    if (!name && !email && !image && !phoneNumber) {
      return res
        .status(400)
        .json({ error: 'At least one field must be updated' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (image) updateData.image = image;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;


    const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    return res.status(500).json({ error: 'Server-side error' });
  }
};


exports.deleteUser = async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await userModel.findByIdAndDelete(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
