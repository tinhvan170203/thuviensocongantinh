
const Loaisachs = require("../models/Loaisach");

module.exports = {
  getLoaisachList: async (req, res) => {
    let perPage = 10;
    let page = Number(req.query.page) || 1;
    try {
      let loaisachsDb = await Loaisachs.find().sort({thutu: 1});

      let total = Math.ceil(loaisachsDb.length/perPage);
      let loaisachs = await Loaisachs.find().sort({thutu: 1}).skip((page -1)*perPage).limit(perPage);
      res.status(200).json({status: "success", loaisachs, page,total})
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({ status: "failed", message: "Có lỗi xảy ra khi lấy dữ liệu loại sách" });
    }
  },
  addLoaisach: async(req, res) => {
    let {tenloaisach, mota, thutu} = req.body;
    let perPage = 10;
    let page = 1;
    try {
      let newItem = new Loaisachs({
        tenloaisach,mota,thutu
      });
      await newItem.save();
      let loaisachsDb = await Loaisachs.find().sort({thutu: 1});

      let total = Math.ceil(loaisachsDb.length/perPage);
      let loaisachs = await Loaisachs.find().sort({thutu: 1}).skip((page -1)*perPage).limit(perPage);
      res.status(200).json({status: "success", loaisachs, total, message: "Thêm mới loại sách thành công"})
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({ status: "failed", message: "Có lỗi xảy ra khi thêm mới loại sách" });
    }
  },
  editLoaisach: async (req, res) => {
    let id = req.params.id;
    const {tenloaisach, mota, thutu, page} = req.body;

    let perPage = 10;
    try {
      await Loaisachs.findByIdAndUpdate(id, {
        tenloaisach, mota, thutu
      });

      let loaisachs = await Loaisachs.find().sort({thutu: 1}).skip((page -1)*perPage).limit(perPage);
   
      res.status(200).json({status: "success", loaisachs,  message: "Cập nhật loại sách thành công"})
    } catch (error) {
        console.log("lỗi: ", error.message);
        res.status(401).json({ status: "failed", message: "Có lỗi xảy ra khi cập nhật loại sách" });
    }
  },
  deleteLoaisach: async (req, res) => {
    let id = req.params.id;
    let perPage = 10;
    let page = 1;
    try {
      await Loaisachs.findByIdAndDelete(id);
      let loaisachsDb = await Loaisachs.find().sort({thutu: 1});

      let total = Math.ceil(loaisachsDb.length/perPage);
      let loaisachs = await Loaisachs.find().sort({thutu: 1}).skip((page -1)*perPage).limit(perPage);

      res.status(200).json({status: "success", loaisachs, total, message: "Xóa loại sách thành công"})
    } catch (error) {
        console.log("lỗi: ", error.message);
        res.status(401).json({ status: "failed", message: "Có lỗi xảy ra khi xóa loại sách" });
    }
  }
};
