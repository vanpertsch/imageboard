const express = require('express');
const app = express();
const db = require("./db.js");

const multer = require('multer');
const uidSafe = require('uid-safe');
const path = require('path');

const s3 = require('./s3');
const makeMiddleware = require('multer/lib/make-middleware');


// -------------------------------------------makeMiddleware---------------------------------
app.use(express.static('./public'));

app.use(express.json());


// -------------------------------------------multerHelperFunctions-------------------------

const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, path.join(__dirname, 'uploads'));
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function (uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

// -------------------------------------------Routing-------------------------

app.get("/images.json", (req, res) => {
    db.getImages()
        .then(({ rows }) => {
            return res.json(rows);
        })
        .catch(err => console.log("err in geImages", err));
});

app.get("/moreimages/:id", (req, res) => {
    const lastid = req.params.id;
    db.getMoreImages(lastid)
        .then(({ rows }) => {
            return res.json(rows);
        })
        .catch(err => console.log("err in getmoreImages/:id", err));
});

app.get("/moreimagesbytag/:id&:tag", (req, res) => {
    const lastid = req.params.id;
    const tag = req.params.tag;
    console.log("moreimagesbytag id", lastid);
    console.log("moreimagesbytag tag", tag);
    db.getMoreImagesByTag(lastid, tag)
        .then(({ rows }) => {
            return res.json(rows);
        })
        .catch(err => console.log("err in getmoreImages/:id", err));
});


app.get("/images/:id", (req, res) => {
    const imageId = req.params.id;
    db.getImageById(imageId)
        .then(({ rows }) => {
            return res.json(rows[0]);
        })
        .catch((err) => {
            console.log("err in getImageById", err);
            return res.send({ error: "no match" });
        });
});

app.get("/alltags/:tag", (req, res) => {
    const tag = req.params.tag;
    db.getImagesByTag(tag)
        .then(({ rows }) => {
            return res.json(rows);
        })
        .catch((err) => {
            console.log("err in getImagesByTag", err);
            return res.send({ error: "no match" });
        });
});

app.get("/tags/:id", (req, res) => {
    const imageId = req.params.id;
    db.getTagsByImageId(imageId)
        .then(({ rows }) => {
            return res.json(rows);
        })
        .catch((err) => {
            console.log("err in getTagsByImageId", err);
            return res.send({ error: "no match" });
        });
});


app.get("/comments/:id", (req, res) => {
    console.log("/comments.json", req.params.id);
    const imageId = req.params.id;
    db.getCommentsByImageId(imageId)
        .then(({ rows }) => {
            return res.json(rows);
        })
        .catch(err => console.log("err in getCommentsByImageId", err));
});


app.post("/comments", (req, res) => {

    const { username, comment, image_id } = req.body;
    db.addComment({ username, comment, image_id })
        .then(({ rows }) => {

            return res.json(rows[0]);
        })
        .catch(err => console.log("error in addComment", err));

});






app.post('/upload', uploader.single("file"), s3.upload, (req, res) => {
    console.log("*****************");
    console.log("POST /upload Route");
    console.log("*****************");


    if (req.file) {
        // once we're successfully uploaded to the cloud, we want to
        // add a new image to the database!
        const { username, title, description, tags } = req.body;
        // const username = req.body.username;
        // const title = req.body.title;
        // const description = req.body.description;

        const aws = "https://s3.amazonaws.com/";
        const bucket = "spicedling/";
        const filename = req.file.filename;
        const url = `${aws}${bucket}${filename}`;
        const tagsArr = tags.split(',');

        db.addImage({ username, title, description, url })
            .then(({ rows }) => {
                console.log("rows", rows);
                console.log("rows[0].id", rows[0].id);
                console.log("tatagsArrgs", tagsArr);
                if (tagsArr) {
                    for (let i = 0; i < tagsArr.length; i++) {
                        console.log(i);
                        db.addTags(rows[0].id, tagsArr[i])
                            .then(console.log("tags are in"))
                            .catch(err => console.log("error in addTags", err));
                    }
                }

                return res.json(rows[0]);


            })
            .catch(err => console.log("error in addImage", err));

        // db.addTags()

    } else {
        res.json({
            success: false
        });
    }
});

app.get('*', (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
});



app.listen(8080, () => console.log(`I'm listening.`));

