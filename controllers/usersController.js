const Users = require("../model/userModel");
const bcrypt = require("bcryptjs");

module.exports.register = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    if (!username || typeof username !== "string") {
      return res.status(419).json({ message: "Invalid username" });
    }

    if (!email || typeof email !== "string") {
      return res.status(420).json({ message: "Invalid email" });
    }

    if (!password || typeof password !== "string") {
      return res.status(421).json({ message: "Invalid password" });
    }

    const usernameExit = await Users.findOne({ username: username });
    if (usernameExit) {
      return res.status(422).json({ message: "Username already exit" });
    }

    const emailExit = await Users.findOne({ email: email });
    if (emailExit) {
      return res.status(423).json({ message: "Email already exit" });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // salt value 10
    const user = new Users({
      username,
      email,
      password: hashedPassword,
    });
    await user.save();
    delete user.password;
    return res.json({ status: true, user });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(11000)
        .json({ message: "Username already exit in database" });
    }
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await Users.findOne({ username });
    if (!user || typeof username !== "string") {
      return res
        .status(419)
        .json({ message: "Incorrect username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid || typeof password !== "string") {
      return res
        .status(421)
        .json({ message: "Incorrect username or password" });
    }

    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

module.exports.avatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    // console.log(typeof avatarImage);
    const userData = await Users.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage: avatarImage,
      },
      { upsert: true, new: false }
    );
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await Users.find({ _id: { $ne: req.params.id} }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);
    return res.json(users);
  } catch (ex) {
    next(ex);
  }
};
