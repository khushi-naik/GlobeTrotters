const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const crypto = require('crypto')
const mongoose = require('mongoose')
const multer = require('multer')
const GridFsStorage = require('multer-gridfs-storage')
const Grid = require('gridfs-stream')
const methodOverride = require('method-override')

const app = express()

//middleware
app.use(bodyParser.json())
app.use(methodOverride('_method'))
app.set('view engine', 'ejs')

//mongodb URI
const url = 'mongodb://localhost:27017/blog'
const conn = mongoose.createConnection(url, ({useUnifiedTopology: true, useNewUrlParser: true}))

//initialize gridfs
let gfs;

conn.once('open', () => {
    //initialize stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads')
  })


//Create Storage engine
const storage = new GridFsStorage({
    url: url,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
  });
  const upload = multer({ storage });
  
// get route  
app.get('/', (req, res) =>{
    gfs.files.find().toArray((err, files) =>{
        // Check if files exists at all
        if( !files || files.length === 0){
            res.render('index', {files : false})
        }else{
            files.map(file =>{
                if(file.contentType === 'image/jpeg' || file.contentType === 'image/png'){
                    file.isImage = true;
                }else{
                    file.isImage = false;
                }
            })
            res.render('index', {files : files})
        }
    })
})

// post route
app.post('/upload', upload.single('file'), (req, res) =>{
    //res.json({file : req.file})
    res.redirect('/')
})

// get files
// Display all files
app.get('/files' , (req, res) =>{
    gfs.files.find().toArray((err, files) =>{
        // Check if files exists at all
        if( !files || files.length === 0){
            return res.status(404).json({
                err : 'Files dosent exists'
            })
        }
        return res.json(files)
    })
})

// get files:filename
// Display single file object
app.get('/files/:filename' , (req, res) =>{
    gfs.files.findOne({filename : req.params.filename}, (err, file) =>{
        // Check if file exists at all
        if( !file || file.length === 0){
            return res.status(404).json({
                err : 'File dosent exists'
            })
        }

        return res.json(file)
    })
})

// get image:filename
// Display image
app.get('/image/:filename' , (req, res) =>{
    gfs.files.findOne({filename : req.params.filename}, (err, file) =>{
        // Check if file exists at all
        if( !file || file.length === 0){
            return res.status(404).json({
                err : 'File dosent exists'
            })
        }

        if(file.contentType === 'image/jpeg' || file.contentType === 'image/png'){
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        }else{
            res.status(404).json({
                err : 'Not an image....'
            })
        }
    })
})

// get delete
app.delete('/files/:id', (req, res) =>{
    gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
        if (err) {
          return res.status(404).json({ err: err });
        }
    
        res.redirect('/');
      });
})

const PORT = 7070;

app.listen((PORT), () => console.log(`server started on port ${PORT}`))