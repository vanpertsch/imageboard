const spicedPg = require("spiced-pg");

const dbUsername = "postgres";
const dbUserPassword = "postgres";
const database = "imageboard";

const db = spicedPg(process.env.DATABASE_URL || `postgres:${dbUsername}:${dbUserPassword}@localhost:5432/${database}`);

console.log("[db] Connecting to ", database);


// ----------------------Adding------------------------------------------------
module.exports.addImage = ({ username, title, description, url }) => {
    const q = `INSERT INTO images (username, title, description, url) VALUES($1,$2,$3,$4) RETURNING *`;
    const params = [username, title, description, url];
    return db.query(q, params);
};
module.exports.addComment = ({ username, image_id, comment }) => {
    const q = `INSERT INTO comments (username, image_id, comment ) VALUES($1,$2,$3) RETURNING *`;
    const params = [username, image_id, comment];
    return db.query(q, params);
};
module.exports.addTags = (image_id, tag) => {
    const q = `INSERT INTO tags (image_id, tag ) VALUES($1,$2)`;
    const params = [image_id, tag];
    return db.query(q, params);
};

// ---------------------Delete--------------------------------------------------

module.exports.deleteImage = (id) => {
    const q = `DELETE FROM images WHERE id = ${id} RETURNING *`;
    return db.query(q);
};




// ---------------------GET--------------------------------------------------
module.exports.getImages = () => {
    const q = `SELECT * FROM images ORDER BY created_at DESC LIMIT 6`;
    return db.query(q);
};
module.exports.getImagesByTag = (tag) => {
    const q = `SELECT url, title, id FROM images WHERE images.id =  ANY(SELECT image_id FROM tags WHERE tags.tag = $1) ORDER BY created_at DESC LIMIT 6`;
    const params = [tag];
    return db.query(q, params);
};
module.exports.getTagsByImageId = (id) => {
    const q = `SELECT tag FROM tags WHERE image_id = ${id}`;
    return db.query(q);
};
module.exports.getMoreImages = (id) => {
    const q = `SELECT url, title, id, (SELECT id FROM images ORDER BY id ASC LIMIT 1) AS "lowestId" FROM images WHERE id < ${id} ORDER BY id DESC LIMIT 6`;
    return db.query(q);
};

module.exports.getMoreImagesByTag = (id, tag) => {
    const q = `SELECT url, title, id, (SELECT id FROM images ORDER BY id ASC LIMIT 1) AS "lowestId" FROM images WHERE images.id < $1 AND images.id = ANY(SELECT image_id FROM tags WHERE tags.tag = $2) ORDER BY id DESC LIMIT 6`;
    const params = [id, tag];
    return db.query(q, params);
};

module.exports.getImageById = (id) => {
    const q = `SELECT * FROM images WHERE id = ${id}`;
    return db.query(q);
};

module.exports.getCommentsByImageId = (id) => {
    const q = `SELECT * FROM comments WHERE image_id = ${id}`;
    return db.query(q);
};
