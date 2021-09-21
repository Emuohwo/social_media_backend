const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan")
const multer = require("multer");
const path = require("path")
const postRoute = require("./routes/posts")
const userRoute = require("./routes/users")
const authRoute = require("./routes/auth")
const conversationRoute = require("./routes/conversations")
const messageRoute = require("./routes/messages")

dotenv.config();

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true })
.then(() => console.log("DB connection successful"))
.catch((err) => console.log(err));

// middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use("/images", express.static(path.join(__dirname, "public/images")));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images')
    },
    filename: (req, file, cb) => {
      cb(null, req.body.name);
    },
  })

const upload = multer({storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
    try {
        return res.status(200).json("File uploaded successfully.")
    } catch (err) {
        console.log(err);
    }
})


app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);




app.listen(8800, () => {
    console.log("Backend server is running on port 8800")
})