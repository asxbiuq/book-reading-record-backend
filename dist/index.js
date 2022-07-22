import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import multer from 'multer';
import expressValidator from 'express-validator';
import bcryptjs from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import path, { resolve } from 'path';
import fs, { realpathSync } from 'fs';
import { config } from 'dotenv';
import OSS from 'ali-oss';
import { assign, last } from 'lodash-es';

// import { Schema, model } from 'mongoose'
const { Schema: Schema$3, model: model$3, set: set$4, connect: connect$4 } = mongoose;
const userSchema = new Schema$3({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: 'I am new!',
    },
    posts: [
        {
            type: Schema$3.Types.ObjectId,
            ref: 'Post',
        },
    ],
});
var User = model$3('User', userSchema);

// config/env.js
// 先构造出.env*文件的绝对路径
const appDirectory = realpathSync(process.cwd());
const resolveApp = (relativePath) => resolve(appDirectory, relativePath);
const pathsDotenv = resolveApp('.env');
// 按优先级由高到低的顺序加载.env文件
config({ path: `${pathsDotenv}.local` }); // 加载.env.local
config({ path: `${pathsDotenv}.development` }); // 加载.env.development
config({ path: `${pathsDotenv}` }); // 加载.env
// 打印一下此时的process.env
// console.log(process.env.NAME); // zhangsan
// console.log(process.env.AGE); // 20
// console.log(process.env.COUNTRY); // China
// console.log(process.env.LOCAL_ENV); // local

const { validationResult: validationResult$3 } = expressValidator;
const { hash, compare } = bcryptjs;
const { sign: sign$1, verify: verify$1 } = jsonwebtoken;
const signup = async (req, res, next) => {
    const errors = validationResult$3(req);
    if (!errors.isEmpty()) {
        throw {
            statusCode: 422,
            message: 'Validation failed.',
        };
    }
    const { email, name, password } = req.body;
    const hashedPw = await hash(password, 12);
    const user = new User({
        email: email,
        password: hashedPw,
        name: name,
    });
    const result = await user.save();
    if (!process.env.KEY) {
        throw {
            statusCode: 401,
            message: `process.env.KEY is ${process.env.KEY || null}`,
        };
    }
    const token = sign$1({
        email: email,
        userId: result._id,
    }, process.env.KEY, { expiresIn: '24h' });
    res
        .status(201)
        .json({ message: 'User created!', userId: result._id, token: token });
    console.log('User created!');
};
const login = async (req, res, next) => {
    const { email, password } = req.body;
    let loadedUser;
    const user = await User.findOne({ email: email });
    if (!user) {
        throw {
            statusCode: 401,
            message: `A user with this email could not be found.${email}`,
        };
    }
    loadedUser = user;
    const isEqual = await compare(password, user.password);
    if (!isEqual) {
        throw {
            statusCode: 401,
            message: 'Wrong password!',
        };
    }
    if (!process.env.KEY) {
        throw {
            statusCode: 401,
            message: `process.env.KEY is ${process.env.KEY || null}`,
        };
    }
    const token = sign$1({
        email: loadedUser.email,
        userId: loadedUser._id.toString(),
    }, process.env.KEY, { expiresIn: '24h' });
    const remainingMilliseconds = 24 * 60 * 60 * 1000;
    const expiryDate = new Date(new Date().getTime() + remainingMilliseconds);
    res.status(200).json({
        token: token,
        userId: loadedUser._id.toString(),
        name: user._doc.name,
        expiryDate: expiryDate,
    });
    console.log('User login!');
};

const { body } = expressValidator;
// POST /feed/post
const postValidator = [
    body('title').trim().isLength({ min: 5 }),
    // body('content')
    //   .trim()
    //   .isLength({ min: 5 })
];
// PUT /feed/post
const putValidator = [
    body('title').trim().isLength({ min: 5 }),
    body('author').trim().isLength({ min: 5 }),
];
//  /auth/signup
const signupValidator = [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
            if (userDoc) {
                return Promise.reject('E-Mail address already exists!');
            }
        });
    })
        .normalizeEmail(),
    body('password').trim().isLength({ min: 5 }),
    body('name').trim().not().isEmpty(),
];
//  /auth/status
[body('status').trim().not().isEmpty()];

const { Router: Router$4 } = express;
const router$4 = Router$4();
router$4.put('/signup', signupValidator, signup);
router$4.post('/login', login);

if (!process.env.ossAccessKeyId && !process.env.ossAccessKeySecret) {
    throw new Error(`process.env.ossAccessKeyId is ${process.env.ossAccessKeyId ?? null}, process.env.ossAccessKeySecret is ${process.env.ossAccessKeySecret ?? null}`);
}
const client = new OSS({
    // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
    region: process.env.ossRegion,
    // 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
    accessKeyId: process.env.ossAccessKeyId,
    accessKeySecret: process.env.ossAccessKeySecret,
    // 填写Bucket名称。
    bucket: process.env.ossBucket,
});

// import { Schema, model } from 'mongoose'
const { Schema: Schema$2, model: model$2, set: set$3, connect: connect$3 } = mongoose;
const postSchema = new Schema$2({
    title: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: false,
    },
    creator: {
        type: Schema$2.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    isFav: {
        type: Boolean,
        required: true,
    },
    time: {
        type: Date,
        required: true,
    },
    avatar: {
        type: String,
        required: false,
    },
    comments: [
        {
            type: Schema$2.Types.ObjectId,
            ref: 'Comment',
        },
    ],
}, { timestamps: true });
var Post = model$2('Post', postSchema);

const { validationResult: validationResult$2 } = expressValidator;
const getPosts = async (req, res, next) => {
    const { page } = req.params;
    const posts = await Post.find({})
        .skip((page - 1) * 3)
        .limit(3);
    if (!posts) {
        throw {
            statusCode: 404,
            message: `Fetched posts(page: ${page}) failed.`,
        };
    }
    res.status(200).json({
        message: 'Fetched posts successfully.',
        posts: posts,
    });
    console.log('Fetched posts successfully');
};
const createPost = async (req, res, next) => {
    const errors = validationResult$2(req);
    if (!errors.isEmpty()) {
        throw {
            message: 'Validation failed, entered data is incorrect.',
            statusCode: 422,
        };
    }
    const { title, author, isFav, creator, time } = req.body;
    if (!process.env.Storage_URL) {
        throw `process.env.Storage_URL is ${process.env.Storage_URL || null}`;
    }
    let ossImageName = req.file.path.toString().slice(7);
    let imageUrl = `C:\\Users\\72994\\Downloads\\Chrome_download\\js\\book-reading-record-backend\\src\\tmp\\${req.file.path}`;
    let client = new OSS({
        // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
        region: 'oss-cn-shanghai',
        // 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
        accessKeyId: 'LTAI5tGazUPpfGYbyniy5dzq',
        accessKeySecret: 'eLiCtlk39kVOZmWztLIXmeHxOmKI1x',
        // 填写Bucket名称。
        bucket: 'webplus-cn-shanghai-s-62a8832ef968dd14ceb7c781',
    });
    const ossResult = await client.put(ossImageName, path.normalize(imageUrl));
    const post = new Post({
        title: title,
        author: author,
        isFav: isFav,
        time: time,
        imageUrl: ossResult.url,
        creator: creator,
    });
    // assign(post,req.body)
    // console.log(post)
    const result = await post.save();
    if (result) {
        console.log('Post created successfully!');
        fs.unlink(imageUrl, (err) => {
            if (err) {
                throw new Error(err.message);
            }
            // console.log('remove file success')
        });
        res.status(201).json({
            message: 'Post created successfully!',
            post: post,
        });
    }
};
const getPost = async (req, res, next) => {
    const postId = req.params.postId;
    const post = await Post.findById(postId);
    if (!post) {
        throw {
            message: 'Could not find post.',
            statusCode: 404,
        };
    }
    res.status(200).json({ message: 'Post fetched.', post: post });
    console.log('Post fetched');
};
const updatePost = async (req, res, next) => {
    const postId = req.params.postId;
    const errors = validationResult$2(req);
    if (!errors.isEmpty()) {
        throw {
            message: 'Validation failed, entered data is incorrect.',
            statusCode: 422,
        };
    }
    const post = await Post.findById(postId);
    if (!post) {
        throw {
            message: 'Could not find post.',
            statusCode: 404,
        };
    }
    if (post.creator.toString() !== req.userId) {
        throw {
            message: 'Not authorized!',
            statusCode: 403,
        };
    }
    assign(post, req.body);
    const result = await post.save();
    if (result) {
        res.status(200).json({ message: 'Post updated!', post: result });
        console.log('Post updated!');
    }
};
const deletePost = async (req, res, next) => {
    const postId = req.params.postId;
    const post = await Post.findById(postId);
    if (!post) {
        throw {
            message: 'Could not find post.',
            statusCode: 404,
        };
    }
    if (post.creator.toString() !== req.userId) {
        throw {
            message: 'Not authorized!',
            statusCode: 403,
        };
    }
    const result = await Post.findByIdAndRemove(postId);
    const imageUrl = last(result.imageUrl.split('/'));
    // console.log(imageUrl)
    if (typeof imageUrl === 'string') {
        let ossDeleteResult = await client.delete(imageUrl);
        if (ossDeleteResult.res.status !== 204) {
            throw new Error(`delete oss failed, ossDeleteResult: ${ossDeleteResult}`);
        }
    }
    else {
        throw new Error(`delete image failed, imageUrl:${imageUrl ?? null}`);
    }
    const user = await User.findById(req.userId);
    await user.posts.pull(postId);
    await user.save();
    // console.log(result);
    res.status(200).json({ message: 'Deleted post!' });
    console.log('Deleted post!');
};

// import { verify } from 'jsonwebtoken'
const { sign, verify } = jsonwebtoken;
const isAuth = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        throw {
            statusCode: 401,
            message: 'Not authenticated.',
        };
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    if (process.env.KEY) {
        decodedToken = verify(token, process.env.KEY);
    }
    else {
        throw {
            statusCode: 401,
            message: `process.env.KEY is ${process.env.KEY || null}`,
        };
    }
    if (!decodedToken) {
        throw {
            statusCode: 401,
            message: 'Token error.',
        };
    }
    req.userId = decodedToken.userId;
    next();
};

const { Router: Router$3 } = express;
const router$3 = Router$3();
router$3.get('/posts/:page', isAuth, getPosts);
// router.get('/posts', isAuth, getPosts)
router$3.get('/:postId', isAuth, getPost);
router$3.post('/', isAuth, postValidator, createPost);
router$3.put('/:postId', isAuth, putValidator, updatePost);
router$3.delete('/:postId', isAuth, deletePost);

const getFav = async (req, res, next) => {
    const { userId } = req;
    const { page } = req.params;
    const posts = await Post.find({ creator: userId, isFav: true })
        .skip((page - 1) * 3)
        .limit(3);
    // console.log(posts)
    if (posts) {
        console.log('Fetched fav posts successfully');
        res.status(200).json({
            message: 'Fetched fav posts successfully.',
            posts: posts,
        });
    }
    else {
        throw {
            message: 'getFav failed',
        };
    }
};

const { Router: Router$2 } = express;
const router$2 = Router$2();
router$2.get('/:page', isAuth, getFav);

// import { Schema, model } from 'mongoose'
const { Schema: Schema$1, model: model$1, set: set$2, connect: connect$2 } = mongoose;
const commentSchema = new Schema$1({
    creator: {
        type: String,
        required: true,
    },
    creatorId: {
        type: String,
        required: true,
    },
    time: {
        type: Date,
        required: true,
    },
    avatar: {
        type: String,
        required: false,
    },
    content: {
        type: String,
        required: true,
    },
    postId: {
        type: String,
        required: true,
    },
    replies: [
        {
            type: Schema$1.Types.ObjectId,
            ref: 'Reply',
        },
    ],
}, { timestamps: true });
var Comment = model$1('Comment', commentSchema);

const { validationResult: validationResult$1 } = expressValidator;
const getComments = async (req, res, next) => {
    const { postId } = req.params;
    const comments = await Comment.find({ postId: postId });
    if (comments) {
        console.log('Fetched comments successfully');
        res.status(200).json({
            message: 'Fetched comments successfully.',
            comments: comments,
        });
    }
    else {
        throw {
            message: 'Could not find comment.',
            statusCode: 404,
        };
    }
};
const getComment = async (req, res, next) => {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);
    if (comment) {
        console.log('Fetched comment successfully');
        res.status(200).json({
            message: 'Fetched comment successfully',
            posts: comment,
        });
    }
};
const updateComment = async (req, res, next) => {
    const errors = validationResult$1(req);
    if (!errors.isEmpty()) {
        throw {
            message: 'Validation failed, entered data is incorrect.',
            statusCode: 422,
        };
    }
    const { _id: commentId } = req.body;
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw {
            message: 'Could not find comment.',
            statusCode: 404,
        };
    }
    // if (comment.creator.toString() !== req.userId) {
    //   const error = new Error('Not authorized!')
    //   error.statusCode = 403
    //   throw error
    // }
    assign(comment, req.body);
    const result = await comment.save();
    if (result) {
        console.log('comment updated!');
        res.status(200).json({ message: 'comment updated!', comment: result });
    }
};
const deleteComment = async (req, res, next) => {
    const { commentId, postId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw {
            message: 'Could not find comment.',
            statusCode: 404,
        };
    }
    if (comment.creatorId !== req.userId) {
        throw {
            message: 'Not authorized!',
            statusCode: 403,
        };
    }
    const post = await Post.findById(comment.postId);
    await Comment.findByIdAndRemove(commentId);
    // const post = await Post.findById(postId)
    await post.comments.pull(commentId);
    await post.save();
    console.log('Deleted comment!');
    res.status(200).json({ message: 'Deleted comment!' });
};
const createComment = async (req, res, next) => {
    const errors = validationResult$1(req);
    if (!errors.isEmpty()) {
        throw {
            message: 'Validation failed, entered data is incorrect.',
            statusCode: 422,
        };
    }
    const { creator, creatorId, time, content, postId } = req.body;
    // const avatar = process.env.Storage_URL + req.file.path;
    const comment = new Comment({
        creator: creator,
        time: time,
        content: content,
        postId: postId,
        creatorId: creatorId,
        // avatar: avatar,
    });
    const result = await comment.save();
    const post = await Post.findById(postId);
    await post.comments.push(result);
    await post.save();
    if (result) {
        console.log('Comment created successfully!');
        res.status(201).json({
            message: 'Comment created successfully!',
            comment: result,
        });
    }
};

const { Router: Router$1 } = express;
const router$1 = Router$1();
router$1.post('/:postId', isAuth, 
// commentValidator,
createComment);
router$1.get('/:postId/comments', isAuth, getComments);
router$1.get('/:postId/:commentId', isAuth, getComment);
router$1.put('/:commentId', isAuth, 
// commentValidator,
updateComment);
router$1.delete('/:commentId', isAuth, deleteComment);

// import { Schema, model } from 'mongoose'
const { Schema, model, set: set$1, connect: connect$1 } = mongoose;
const replySchema = new Schema({
    creator: {
        type: String,
        required: true,
    },
    creatorId: {
        type: String,
        required: true,
    },
    time: {
        type: Date,
        required: true,
    },
    avatar: {
        type: String,
        required: false,
    },
    content: {
        type: String,
        required: true,
    },
    commentId: {
        type: String,
        required: true,
    },
});
var Reply = model('Reply', replySchema);

const { validationResult } = expressValidator;
const getReplies = async (req, res, next) => {
    const { commentId } = req.params;
    const replies = await Reply.find({ commentId: commentId });
    if (replies) {
        console.log('Fetched replies successfully');
        res.status(200).json({
            message: 'Fetched replies successfully.',
            replies: replies,
        });
    }
};
const createReply = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw {
                message: 'Validation failed, entered data is incorrect.',
                statusCode: 422,
            };
        }
        // const creator = req.body.creator
        // const time = req.body.time
        // const content = req.body.content
        // const commentId = req.body.commentId
        // const replyId = req.body.replyId
        // const avatar = process.env.Storage_URL + req.file.path;
        // {
        //   creator: title,
        //   time: author,
        //   avatar: isFav,
        //   content: userUid,
        //   commentId: imageUrl,
        //   replyId:replyId
        // }
        const reply = new Reply();
        assign(reply, req.body);
        // console.log(post)
        const result = await reply.save();
        const comment = await Comment.findById(req.body.commentId);
        // console.log(result)
        await comment.replies.push(result);
        await comment.save();
        if (result) {
            console.log('reply created successfully!');
            res.status(201).json({
                message: 'reply created successfully!',
                reply: reply,
            });
        }
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
const getReply = async (req, res, next) => {
    const commentId = req.params.commentId;
    const reply = await Reply.findById(commentId);
    if (!reply) {
        throw {
            message: 'Could not find post.',
            statusCode: 404,
        };
    }
    console.log('reply fetched');
    res.status(200).json({ message: 'reply fetched.', reply: reply });
};
const updateReply = async (req, res, next) => {
    const commentId = req.params.commentId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw {
            message: 'Validation failed, entered data is incorrect.',
            statusCode: 422,
        };
    }
    // const { creator, time, avatar, content, commentId, replyId } = req.body
    const reply = await Reply.findById(commentId);
    if (!reply) {
        throw {
            message: 'Could not find reply.',
            statusCode: 404,
        };
    }
    if (reply.creator.toString() !== req.userId) {
        throw {
            message: 'Not authorized!',
            statusCode: 403,
        };
    }
    // post.title = title
    // post.isFav = isFav
    // post.userUid = userUid
    // post.author = author
    // post.imageUrl = imageUrl
    // const reply = new Reply()
    assign(reply, req.body);
    const result = await reply.save();
    if (result) {
        console.log('reply updated!');
        res.status(200).json({ message: 'reply updated!', reply: result });
    }
};
const deleteReply = async (req, res, next) => {
    const replyId = req.params.replyId;
    const reply = await Reply.findById(replyId);
    if (!reply) {
        throw {
            message: 'Could not find reply.',
            statusCode: 404,
        };
    }
    if (reply.creatorId !== req.userId) {
        throw {
            message: 'Not authorized!',
            statusCode: 403,
        };
    }
    await Reply.findByIdAndRemove(reply._id);
    const comment = await Comment.findById(reply.commentId);
    await comment.replies.pull(reply._id);
    await comment.save();
    console.log('Deleted reply!');
    res.status(200).json({ message: 'Deleted reply!' });
};

const { Router } = express;
const router = Router();
router.get('/:commentId/replies', isAuth, getReplies);
router.get('/:commentId/:replyId', isAuth, getReply);
router.post('/:commentId', isAuth, 
// commentValidator,
createReply);
router.put('/:replyId', isAuth, 
// commentValidator,
updateReply);
router.delete('/:replyId', isAuth, deleteReply);

const setHeader = (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
};

// const debugA = createDebug('debugA:')
const errorHandler = (error, req, res, next) => {
    console.log(`发生了错误: statusCode: ${error.statusCode ?? 500}, message: ${error.message}`);
    const status = error.statusCode ?? 500;
    const message = error.message;
    res.status(status).json({ message: message });
};

const { set, connect } = mongoose;
const { diskStorage } = multer;
const app = express();
const fileStorage = diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'tmp/');
    },
    filename: (req, file, cb) => {
        // Windows 操作系统不接受带有 “:” 所以要做处理
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
    },
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg') {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
};
app.use(bodyParser.urlencoded({ extended: false })); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(multer({
    // dest: 'upload/'
    storage: fileStorage,
    fileFilter: fileFilter,
}).single('image'));
// app.use('/public', express.static('public'))
app.use(setHeader);
app.use('/auth', router$4);
app.use('/reply', router);
app.use('/comment', router$1);
app.use('/post', router$3);
app.use('/fav', router$2);
app.use(errorHandler);
try {
    if (process.env.DATABASE_URL) {
        set('useFindAndModify', false);
        connect(process.env.DATABASE_URL, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });
    }
    else {
        throw {
            message: `process.env.DATABASE_URL is ${process.env.DATABASE_URL || null}`,
        };
    }
    console.log('mongodb connected!');
    app.listen(8080);
}
catch (err) {
    console.log(err.message);
}
