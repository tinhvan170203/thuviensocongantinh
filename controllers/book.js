const Books = require("../models/Book");
const Loaisachs = require("../models/Loaisach");
const path = require("path");
const fs = require("fs");

const cloudinary = require("cloudinary").v2;
// Cloudinary configuration
cloudinary.config({
  cloud_name: "tienlu",
  api_key: "382685334454586",
  api_secret: "QpUFWWtZEopW4lc7h8rEUIrjnqA",
});

async function uploadToCloudinary(locaFilePath) {
  var mainFolderName = "thuvienso";
  // filePathOnCloudinary: path of image we want
  // to set when it is uploaded to cloudinary
  var filePathOnCloudinary =
    mainFolderName + "/uploads/" + locaFilePath.slice(7);

  return cloudinary.uploader
    .upload(locaFilePath, { public_id: filePathOnCloudinary })
    .then((result) => {
      fs.unlinkSync(locaFilePath);
      return {
        message: "Success",
        url: result.url,
        public_id: result.public_id,
      };
    })
    .catch((error) => {
      // Remove file from local uploads folder
      fs.unlinkSync(locaFilePath);
      return { message: "Fail" };
    });
}

module.exports = {
  getLoaisachList: async (req, res) => {
    try {
      let loaisachs = await Loaisachs.find().sort({ thutu: 1 });
      res.status(200).json({ status: "success", loaisachs });
    } catch (error) {
      console.log("lỗi: ", error.message);
      res
        .status(401)
        .json({
          status: "failed",
          message: "Có lỗi xảy ra khi lấy dữ liệu loại sách",
        });
    }
  },
  getBooks: async (req, res) => {
    let perPage = 10;
    let page = Number(req.query.page) || 1;
    let tensach = "";
    let tacgia = "";
    let theloaiString = "";
    let nhaxuatban = "";
    let trichyeu = "";

    
    //check xem có query tensach.. hay k
    if (req.query.tensach !== undefined) { //check xem có query hay k
      tensach = req.query.tensach;
      tacgia = req.query.tacgia;
      nhaxuatban = req.query.nhaxuatban;
      trichyeu = req.query.trichyeu;
      theloaiString = req.query.theloai;
    }
    
    
    try {
      let booksDb = await Books.find({
        tensach: { $regex: tensach, $options: "$ i" },
        tacgia: { $regex: tacgia, $options: "$ i" },
        trichyeu: { $regex: trichyeu, $options: "$ i" },
        nhaxuatban: { $regex: nhaxuatban, $options: "$ i" },
        theloaiString: { $regex: theloaiString, $options: "$ i" },
      }).sort({ thutu: 1 });


      let total = Math.ceil(booksDb.length / perPage);

      let books = await Books.find({
        tensach: { $regex: tensach, $options: "$ i" },
        tacgia: { $regex: tacgia, $options: "$ i" },
        trichyeu: { $regex: trichyeu, $options: "$ i" },
        nhaxuatban: { $regex: nhaxuatban, $options: "$ i" },
        theloaiString: { $regex: theloaiString, $options: "$ i" },
      })
        .populate("theloai")
        .sort({ thutu: 1 })
        .skip((page - 1) * perPage)
        .limit(perPage);

      res.status(200).json({ status: "success", books, page, total });
    } catch (error) {
      console.log("lỗi: ", error.message);
      res
        .status(401)
        .json({
          status: "failed",
          message: "Có lỗi xảy ra khi lấy dữ liệu sách",
        });
    }
  },
  addBook: async (req, res) => {
    let localFilePath = req.files["file"][0].path;
    let localImgPath = req.files["img"][0].path;

    let { tensach, theloai, trichyeu, thutu, tacgia, nhaxuatban, show } = req.body;
    let perPage = 10;
    let page = 1;
    try {
      var result = await uploadToCloudinary(localFilePath);
      var result1 = await uploadToCloudinary(localImgPath);

      let newItem = new Books({
        tensach,
        theloai,
        trichyeu,
        thutu: Number(thutu),
        tacgia,
        show,
        nhaxuatban,
        theloaiString: theloai,
        url: result.url,
        public_id: result.public_id,
        imgUrl: result1.url,
        img_public_id: result1.public_id,
      });

      await newItem.save();

      let bookDb = await Books.find().sort({ thutu: 1 });

      let total = Math.ceil(bookDb.length / perPage);
      let books = await Books.find()
        .populate("theloai")
        .sort({ thutu: 1 })
        .skip((page - 1) * perPage)
        .limit(perPage);
      res
        .status(200)
        .json({
          status: "success",
          books,
          total,
          message: "Thêm mới sách thành công",
        });
    } catch (error) {
      console.log("lỗi: ", error.message);
      res
        .status(401)
        .json({ status: "failed", message: "Có lỗi xảy ra khi thêm mới sách" });
    }
  },
  deleteBook: async (req, res) => {
    let id = req.params.id;
    let perPage = 10;
    let page = 1;

    try {
      let item = await Books.findById(id);
      let urlCloud = item.public_id;
      let img_public_id = item.img_public_id;
      await cloudinary.uploader.destroy(urlCloud, function (result) {
        console.log(result);
      });
      await cloudinary.uploader.destroy(img_public_id, function (result) {
        console.log(result);
      });
      await item.remove();

      let booksDb = await Books.find().sort({ thutu: 1 });

      let total = Math.ceil(booksDb.length / perPage);
      let books = await Books.find()
        .populate("theloai")
        .sort({ thutu: 1 })
        .skip((page - 1) * perPage)
        .limit(perPage);

      res
        .status(200)
        .json({
          status: "success",
          books,
          total,
          message: "Xóa sách, truyện thành công",
        });
    } catch (error) {
      console.log("lỗi: ", error.message);
      res
        .status(401)
        .json({ status: "failed", message: "Có lỗi xảy ra khi xóa sách" });
    }
  },
  editBook: async (req, res) => {
    let id = req.params.id;

    let { tensach, theloai, trichyeu, thutu, page, tacgia, nhaxuatban, showEdit } =
      req.body;
    let perPage = 10;

    let localFilePath = req.files["fileEdit"];
    let localImgPath = req.files["imgEdit"];
    // console.log(show)

    try {
      let item = await Books.findById(id);
      let urlCloud = item.public_id;

      let img_public_id = item.img_public_id;
      //Nếu thay đổi tệp đính kèm thì thay thế tệp cũ bằng tệp mới
      if (localFilePath) {
        await cloudinary.uploader.destroy(urlCloud, function (result) {
          // console.log(result);
        });
        let result2 = await uploadToCloudinary(localFilePath[0].path);
        // console.log("result2", result2);
        item.url = result2.url;
        item.public_id = result2.public_id;
      }

      //Nếu thay đổi ảnh minh họa thì thay thế ảnh
      if (localImgPath) {
        await cloudinary.uploader.destroy(img_public_id, function (result) {
          console.log(result);
        });
        let result1 = await uploadToCloudinary(localImgPath[0].path);
        item.imgUrl = result1.url;
        item.img_public_id = result1.public_id;
      }

      item.tensach = tensach;
      item.theloai = theloai;
      item.theloaiString = theloai;
      item.trichyeu = trichyeu;
      item.tacgia = tacgia;
      item.show = showEdit;
      item.nhaxuatban = nhaxuatban;
      item.thutu = Number(thutu);
      await item.save();

      let books = await Books.find()
        .populate("theloai")
        .sort({ thutu: 1 })
        .skip((page - 1) * perPage)
        .limit(perPage);

      res
        .status(200)
        .json({
          status: "success",
          books,
          message: "Cập nhật sách, truyện thành công",
        });
    } catch (error) {
      console.log("lỗi: ", error.message);
      res
        .status(401)
        .json({ status: "failed", message: "Có lỗi xảy ra khi cập nhật sách" });
    }
  },
  thongkeTotalSach: async(req, res) => {
    try {
      let typeBooks = await Loaisachs.find().sort({ thutu: 1 });

      let data = [];
      for (i of typeBooks) {
        let books = await Books.find({ theloai: i}).populate('theloai')
          .sort({ thutu: 1 })
          .limit(10);
        data.push({
          theloai: i,
          books: books,
        });
      };

      let total = 0;
      data.forEach(i=> {
        total += i.books.length
      });


      res.status(200).json({ status: "success", data , total});
    } catch (error) {
      console.log("lỗi: ", error.message);
      res
        .status(401)
        .json({
          status: "failed",
          message: "Có lỗi xảy ra khi lấy dữ liệu loại sách",
        });
    }
  },
  thongkeViews: async (req, res) => {
    try {
      let typeBooks = await Loaisachs.find().sort({ thutu: 1 });

      let data = [];
      for (i of typeBooks) {
        let books = await Books.find({ theloai: i}).populate('theloai')
          .sort({ thutu: 1 })
          .limit(10);
          let views = 0;
          for( book of books){
            views +=  book.views
          }
        data.push({
          theloai: i,
          views
        });
      };

      let total = 0;
      data.forEach(i=> {
        total += i.views
      });


      res.status(200).json({ status: "success", data , total});
    } catch (error) {
      console.log("lỗi: ", error.message);
      res
        .status(401)
        .json({
          status: "failed",
          message: "Có lỗi xảy ra"
        });
    }
  },
  thongkeDownloads: async (req, res) => {
    try {
      let typeBooks = await Loaisachs.find().sort({ thutu: 1 });

      let data = [];
      for (i of typeBooks) {
        let books = await Books.find({ theloai: i}).populate('theloai')
          .sort({ thutu: 1 })
          .limit(10);
          
          let downloads = 0;
          for( book of books){
            downloads +=  book.downloads
          }
        data.push({
          theloai: i,
          downloads
        });
      };

      let total = 0;
      data.forEach(i=> {
        total += i.downloads
      });


      res.status(200).json({ status: "success", data , total});
    } catch (error) {
      console.log("lỗi: ", error.message);
      res
        .status(401)
        .json({
          status: "failed",
          message: "Có lỗi xảy ra"
        });
    }
  },

};
