// CRUD Operations for items
var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var multer = require("multer");

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var Item = require("../models/Item");
var VerifyToken = require("../_helper/VerifyToken");

//Image upload config
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./public/images");
    console.log(file);
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});
var upload = multer({ storage });
/* router.post("/upload-image", upload.single("file"), function(req, res) {
  res.status("201").send("Uploaded");
}); */

// CREATES A NEW ITEM
router.post("/", VerifyToken, upload.single("file"), function(req, res) {
  Item.create(
    {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      owner: req.userId,
      imageLocation: req.file.path
    },
    function(err, item) {
      if (err)
        return res
          .status(500)
          .send("There was a problem adding the information to the database.");
      res.status(201).send(item);
    }
  );
});

// GETS A SINGLE ITEM FROM THE DATABASE
router.get("/:id", function(req, res) {
  Item.findById(req.params.id)
    .populate({ path: "owner", select: "name" })
    .exec(function(err, item) {
      if (err)
        return res.status(500).send("There was a problem finding the item.");
      if (!item) return res.status(404).send("No user found.");
      res.status(200).send(item);
    });
});

// RETURNS ALL THE ITEMS IN THE DATABASE
router.get("/", function(req, res) {
  Item.find({})
    .populate({ path: "owner", select: "name" })
    .exec(function(err, items) {
      if (err)
        return res.status(500).send("There was a problem finding the items.");
      res.status(200).send(items);
    });
});

// DELETES AN ITEM FROM THE DATABASE
router.delete("/:id", VerifyToken, function(req, res) {
  console.log(req.params.id);
  Item.findByIdAndRemove(req.params.id, function(err, item) {
    if (err)
      return res.status(500).send("There was a problem deleting the item.");
    if (item)
      return res.status(200).send("Iteme: " + item.name + " was deleted.");
  });
});

// UPDATES A SINGLE ITEM IN THE DATABASE
router.put("/:id", VerifyToken, function(req, res) {
  Item.findByIdAndUpdate(req.params.id, req.body, { new: true }, function(
    err,
    item
  ) {
    if (err) {
      console.log(err);
      return res.status(500).send("There was a problem updating the item.");
    }

    res.status(200).send(item);
    console.log(item);
  });
});



module.exports = router;