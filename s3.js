const aws = require("aws-sdk");
const { AWS_SECRET, AWS_KEY } = require("./secrets");
const fs = require("fs");


const s3 = new aws.S3({
    accessKeyId: AWS_KEY,
    secretAccessKey: AWS_SECRET,
});

module.exports.upload = (req, res, next) => {
    if (!req.file) {
        console.log("no file on server :(");
        // no file on request, sth went wrong with multer,
        // nothing to upload : let the
        // client side know! and end our function!
        return res.sendStatus(500);
    }
    const { filename, mimetype, size, path } = req.file;
    const promise = s3
        .putObject({
            Bucket: "spicedling",
            ACL: "public-read",
            Key: filename,
            Body: fs.createReadStream(path),
            ContentType: mimetype,
            ContentLength: size,
        })
        .promise();

    promise
        .then(() => {
            console.log("image is in the cloud!");
            next();
            // once my image in the cloud I don't need to store
            // it in uploads anymore!
            fs.unlink(path, () => console.log("file removed"));
        })
        .catch((err) => {
            console.log("sth went wrong with cloud upload", err);
            return res.sendStatus(500);
        });
};
