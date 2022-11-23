const jwt = require("jsonwebtoken");
const RefreshTokens = require("../models/RefreshToken");
const Users = require("../models/User");

module.exports = {
  login: async (req, res) => {
    // console.log(req.body)
    try {
      let user = await Users.findOne({
        username: req.body.username,
        password: req.body.password,
      });
      if (!user) {
        return res.status(401).json({ status: false, message: "Sai tên đăng nhập hoặc mật khẩu" });
      } else {
      //cần kiểm tra xem client có refreshtoken k nếu có thì phải kiểm tra db và xóa đi khi login thành công và tạo mới refreshtoken
      let refreshTokenCookie = req.cookies.refreshToken;
      if(refreshTokenCookie){
        await RefreshTokens.findOneAndDelete({refreshToken: refreshTokenCookie})
      };

        //generate accessToken, refreshToken
        const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_KEY,{
          expiresIn: '2m'
        });

        const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_KEY,{
          expiresIn: '30d'
        });

        let newItem = new RefreshTokens({
          refreshToken
        });
        await newItem.save()
       
        // res.cookie("refreshToken", refreshToken, {
          // domain:"https://conganhungyenthuvienso.onrender.com",
          // secure: true,
          // httpOnly: false,
          // sameSite: "none",
          // expires: new Date(Date.now() + 86409000*7)
        // });
        res.status(200).json({ status: "success", username: user.username, accessToken, refreshToken });
      }
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({ status: "failed", message: "Lỗi đăng nhập hệ thống" });
    }
  },
  logout: async(req, res) => {
    //xóa refreshTonken trong database
    let refreshTokenCookie = req.cookies.refreshToken;
    try {
      if(refreshTokenCookie){
        await RefreshTokens.findOneAndDelete({refreshToken: refreshTokenCookie})
      };

      //xóa cookie
      res.clearCookie('refreshToken');
      res.status(200).json({status: "success",message: "Đăng xuất thành công"})
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({ status: "failed", message: "Lỗi hệ thống" });
    }
  },
  getUserList: async (req, res) => {
    let perPage = 10;
    let page = Number(req.query.page) || 1;
    try {
      let usersDb = await Users.find().sort({thutu: 1});

      let total = Math.ceil(usersDb.length/perPage);
      let users = await Users.find().sort({thutu: 1}).skip((page -1)*perPage).limit(perPage);
      res.status(200).json({status: "success", users, page,total})
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({ status: "failed", message: "Có lỗi xảy ra khi lấy dữ liệu người dùng" });
    }
  },
  addUser: async(req, res) => {
    let {username, password, thutu} = req.body;
    let perPage = 10;
    let page = 1;
    try {
      let newItem = new Users({
        username,password,thutu, roles: "Admin"
      });
      await newItem.save();
      let usersDb = await Users.find().sort({thutu: 1});

      let total = Math.ceil(usersDb.length/perPage);
      let users = await Users.find().sort({thutu: 1}).skip((page -1)*perPage).limit(perPage);
      res.status(200).json({status: "success", users, total, message: "Thêm tài khoản người dùng thành công"})
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({ status: "failed", message: "Có lỗi xảy ra khi thêm mới người dùng" });
    }
  },
  editUser: async (req, res) => {
    let id = req.params.id;
    const {username, password, thutu, page} = req.body;
    let perPage = 10;
    try {
      await Users.findByIdAndUpdate(id, {
        username, password, thutu
      });
      // let usersDb = await Users.find().sort({thutu: 1});

      // let total = Math.ceil(usersDb.length/perPage);
      let users = await Users.find().sort({thutu: 1}).skip((page -1)*perPage).limit(perPage);

      res.status(200).json({status: "success", users,  message: "Cập nhật tài khoản người dùng thành công"})
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({ status: "failed", message: "Có lỗi xảy ra khi cập nhật người dùng" });
    }
  },
  deleteUser: async (req, res) => {
    let id = req.params.id;
    let perPage = 10;
    let page = 1;
    try {
      await Users.findByIdAndDelete(id);
      let usersDb = await Users.find().sort({thutu: 1});

      let total = Math.ceil(usersDb.length/perPage);
      let users = await Users.find().sort({thutu: 1}).skip((page -1)*perPage).limit(perPage);

      res.status(200).json({status: "success", users, total, message: "Xóa tài khoản người dùng thành công"})
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({ status: "failed", message: "Có lỗi xảy ra khi xóa người dùng" });
    }
  },

  requestRefreshToken: async (req, res) => {

    const refreshToken = req.cookies.refreshToken;
    // console.log(refreshToken)
    if(!refreshToken){
      return res.status(401).json({message: 'You are not authenticated'})
    };
    // kiểm tra xem trong db có refreshtoken này không nếu k có thì là k hợp lệ
    const checkRefreshTokenInDb = await RefreshTokens.findOne({refreshToken});
    // console.log(checkRefreshTokenInDb)
    if(!checkRefreshTokenInDb) return res.status(403).json({message: "Token không hợp lệ", refreshToken});

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY, async (err, user) => {
      if(err){
        console.log(err.message);
        res.status(403).json({message: "Token không hợp lệ"});
      };

      const newAccessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_KEY,{
        expiresIn: '2m'
      });

      const newRefreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_KEY,{
        expiresIn: '30d'
      });

      await RefreshTokens.findOneAndDelete({refreshToken: refreshToken})
      // thêm refreshtoken mới vào db sau đó trả về client accesstoken mới
      let newItem = new RefreshTokens({
        refreshToken: newRefreshToken
      });
      await newItem.save()

      // res.cookie("refreshToken", newRefreshToken, {
        //  domain:"https://conganhungyenthuvienso.onrender.com",
        //   secure: true,
        // expires: new Date(Date.now() + 86409000*7)
        // secure: true,
        // httpOnly: false,
        // sameSite: "none",
        // expires: new Date(Date.now() + 86409000*7)
      // });

      res.status(200).json({accessToken: newAccessToken, refreshToken: newRefreshToken})
    })
  }
};
