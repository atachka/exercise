const axios = require("axios");
const fs = require("fs");
const Path = require("path");
const Db = require("../files/user.json");

exports.checkUser = (req, res, next) => {
  const user = getUserFromDbById(req.params.userId);
  req.existingUser = user;
  next();
};

exports.checkAvatar = (req, res, next) => {
  const { userId } = req.params;
  const path = Path.resolve(__dirname, "../images", `${userId}.jpg`);
  if (fs.existsSync(path)) {
    req.existingAvatar = true;
    next();
  } else {
    req.existingAvatar = false;
    next();
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await axios.get(`https://reqres.in/api/users/${userId}`);

    if (!req.existingAvatar) {
      await saveAvatarAndReturnBase64(userId, user.data.data.avatar);
    }

    if (req.existingUser) {
      res.json({
        status: "200",
        message: "success",
        user: req.existingUser,
      });
    } else {
      const path = Path.resolve(__dirname, "../files/user.json");
      fs.readFile(path, "utf-8", (err, data) => {
        if (err) {
          res.json({
            status: "400",
            message: err,
          });
        } else {
          parsedData = JSON.parse(data);
          parsedData.users.push(user.data.data);
          fs.writeFile(path, JSON.stringify(parsedData, null, 2), (err) => {
            if (err) {
              res.json({
                status: "400",
                message: err,
              });
            }
          });
        }
      });

      res.json({
        status: "200",
        message: "success",
        user: user.data,
      });
    }
  } catch (err) {
    res.json({
      status: "400",
      message: err,
    });
  }
};

exports.getUserAvatar = async (req, res) => {
  try {
    const { userId } = req.params;
    const path = Path.resolve(__dirname, "../images", `${userId}.jpg`);

    if (req.existingAvatar) {
      const imageAsBase64 = fs.readFileSync(path, "base64");
      res.json({
        status: "200",
        message: "success",
        avatar: imageAsBase64,
      });
    } else {
      let user = getUserFromDbById(userId);
      if (!user) {
        //   res.json({
        //     status: "400",
        //     message: `User with Id: ${userId}, was not found, create User to retrieve avatar`,
        //   });
        user = await axios.get(`https://reqres.in/api/users/${userId}`);
      }
      const base64 = await saveAvatarAndReturnBase64(
        userId,
        user.data.data.avatar
      );
      res.json({
        status: "200",
        message: "success",
        avatar: base64,
      });
    }
  } catch (err) {
    res.json({
      status: "400",
      message: err,
    });
  }
};

exports.deleteUserAvatar = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.existingAvatar) {
      const path = Path.resolve(__dirname, "../images", `${userId}.jpg`);
      fs.unlinkSync(path);
      res.json({
        status: "200",
        message: "success",
      });
    } else {
      res.json({
        status: "400",
        message: `Avatar with provided Id: ${userId}, was not found`,
      });
    }
  } catch (err) {
    res.json({
      status: "400",
      message: err,
    });
  }
};

async function saveAvatarAndReturnBase64(userId, avatarLink) {
  try {
    const path = Path.resolve(__dirname, "../images", `${userId}.jpg`);
    const response = await axios(avatarLink, {
      responseType: "arraybuffer",
    });
    fs.writeFileSync(path, response.data);
    return Buffer.from(response.data).toString("base64");
  } catch (err) {
    res.json({
      status: "400",
      message: err,
    });
  }
}

function getUserFromDbById(userId) {
  try {
    return Db.users.find((user) => user.id == userId);
  } catch (err) {
    res.json({
      status: "400",
      message: err,
    });
  }
}
