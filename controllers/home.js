const Books = require("../models/Book");
const Loaisachs = require("../models/Loaisach");

module.exports = {
  getBooks: async (req, res) => {
    // console.log(req.headers.token)
    try {
      let typeBooks = await Loaisachs.find().sort({ thutu: 1 });

      let data = [];
      for (i of typeBooks) {
        let books = await Books.find({ theloai: i, show: true }).populate('theloai')
          .sort({ thutu: 1 })
          .limit(10);
        data.push({
          theloai: i,
          books: books,
        });
      }

      res.status(200).json({ status: "success", data });
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
  getBooksSearch: async (req, res) => {
    let tensach = req.query.tensach;
    let tacgia = req.query.tacgia;
    let nhaxuatban = req.query.nhaxuatban;
    let trichyeu = req.query.trichyeu;
    let = theloaiString = req.query.theloai;
    // console.log(theloaiString);

    try {
      let books = await Books.find({
        tensach: { $regex: tensach, $options: "$ i" },
        tacgia: { $regex: tacgia, $options: "$ i" },
        trichyeu: { $regex: trichyeu, $options: "$ i" },
        nhaxuatban: { $regex: nhaxuatban, $options: "$ i" },
        theloaiString: { $regex: theloaiString, $options: "$ i" },
      })
        .populate("theloai")
        .sort({ thutu: 1 });

      res.status(200).json({ status: "success", books });
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({
        status: "failed",
        message: "Có lỗi xảy ra khi lấy dữ liệu sách",
      });
    }
  },
  getBooksOfType: async (req, res) => {
    let id = req.params.id;
    let page = req.query.page || 1;
    let perPage = 6;
    try {
      let allBook = await Books.find({ theloai: id }).sort({ thutu: 1 });

      let total = Math.ceil(allBook.length / perPage);
      let books = await Books.find({ theloai: id })
        .populate("theloai")
        .sort({ thutu: 1 })
        .skip((page - 1) * perPage)
        .limit(perPage);
      const loaisach = await Loaisachs.findById(id);
      res.status(200).json({ status: "success", books, page, total, loaisach, quantity: allBook.length});
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
  incrementView: async (req, res) => {
    let id=req.params.id;
    try {
      let item = await Books.findById(id);
      item.views +=1;
      await item.save();
      res.status(200).json({message: `Cảm ơn đọc giả đã xem "${item.tensach}". Ở chế độ smartphone, sử dụng vuốt màn hình cảm ứng để lật trang sách. `})
    } catch (error) {
      console.log("lỗi: ", error.message);
      res
        .status(401)
        .json({
          status: "failed",
          message: "Có lỗi xảy ra khi đọc sách",
        });
    }
  },
  incrementDownload: async (req, res) => {
    let id=req.params.id;
    try {
      let item = await Books.findById(id);
      item.downloads +=1;
      await item.save();
      res.status(200).json({message: `Download thành công`, book: item})
    } catch (error) {
      console.log("lỗi: ", error.message);
      res
        .status(401)
        .json({
          status: "failed",
          message: "Có lỗi xảy ra khi dowload",
        });
    }
  }
};
