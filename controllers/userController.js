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

    const accessToken = jwt.sign(
      { _id: user._id, email: user.email, name: user.name },
      process.env.JWT_KEY,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    user.refreshToken = refreshToken;
    await user.save();

    console.log('Tokens generated successfully');

    return res.status(200).json({
      message: 'Successfully logged in',
      accessToken,
      refreshToken,
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
    const response = await userModel.find().select('-password'); 
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Server side error' });
  }
};


exports.editProfile = async (req, res) => {
  try {
    console.log('Received Body:', req.body);
    console.log('Received File:', req.file);

    const userId = req.user._id;
    const { name, email, phoneNumber } = req.body;
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
    const loggedInUserId = req.user._id; 
    console.log(loggedInUserId,"logged")
    const targetUserId = req.params.id; 
    console.log(targetUserId,"targetted")


    if (loggedInUserId !== targetUserId) {
      return res.status(403).json({ message: "You are not authorized to delete this user" });
    }

    const user = await userModel.findByIdAndDelete(targetUserId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    console.log("Received refreshToken:", refreshToken);

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token required" });
    }

    const user = await userModel.findOne({ refreshToken });
    console.log("User found in DB:", user);

    if (!user) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.error("JWT verification error:", err);
        return res.status(403).json({ error: "Invalid or expired refresh token" });
      }

      console.log("Decoded token:", decoded);

      const newAccessToken = jwt.sign(
        { _id: user._id, email: user.email, name: user.name },
        process.env.JWT_KEY,
        { expiresIn: "15m" }
      );

      return res.status(200).json({ accessToken: newAccessToken });
    });

  } catch (err) {
    console.error("Error refreshing token:", err);
    return res.status(500).json({ error: "Server-side error" });
  }
};


exports.userLogout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const user = await userModel.findOne({ refreshToken });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.refreshToken = null;
    await user.save();

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
