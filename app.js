// app.js

// Import necessary modules
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const multer = require('multer');
const AWS = require('aws-sdk');
const initializePassport = require('./passport-config');


const app = express();

// Configure AWS S3
AWS.config.update({
  accessKeyId: 'AKIAYGINPQ2H42KMVZM3',
  secretAccessKey: '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',
  region: 'eu-north-1'
});

const BUCKETNAME = 'photo-club-s3'; // Define the S3 bucket name
const s3 = new AWS.S3();
function createS3Instance() {
  return new AWS.S3();
}
// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// User array and other initializations
const users = [];

// Define your helper functions like eee, getUserByEmail, etc.
async function eee(str) {
    const a = await bcrypt.hash(str, 10);
    return a;
  }

  (async () => {
    var hashedPassword = await eee("admin");
  
    users.push({
      id: Date.now().toString(),
      name: "admin",
      email: "admin@a",
      password: hashedPassword,
      role: 'admin'
    })
    
    hashedPassword = await eee("member");
    users.push({
      id: Date.now().toString(),
      name: "admin",
      email: "member@a",
      password: hashedPassword,
      role: 'member'
    })
    
    hashedPassword = await eee("club");
    users.push({
      id: Date.now().toString(),
      name: "admin",
      email: "club@a",
      password: hashedPassword,
      role: 'club'
    })
    
    hashedPassword = await eee("user");
    users.push({
      id: Date.now().toString(),
      name: "admin",
      email: "user@admin",
      password: hashedPassword,
      role: 'user'
    });
  
    // Rest of your code...
  })();
  
  const getUserByEmail = (email) => {
    return users.find((user) => user.email === email);
  };
  
  const getUserById = (id) => {
    return users.find(user => user.id === id);
  };
  
initializePassport(passport, getUserByEmail, getUserById);

// Express app configuration
app.set('view engine', 'ejs');
app.use(express.static('path_to_static_files')); // Adjust the path
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

// Define your routes
app.use(express.static('./SWE363 Project/css'));
app.use(express.static('./SWE363 Project/fonts'));
app.use(express.static('./SWE363 Project/js')); // Changed 'JS' to 'js' for consistency
app.use(express.static('./SWE363 Project/images'));
app.use(express.static('./Face_recognition/your_script.by'))
app.use(methodOverride('_method'));

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
}


// Route definitions
app.get('/', (req, res) => {
  const isAuthenticated = req.isAuthenticated();
  if (isAuthenticated){
    res.render('index', { userRole: req.user.role });
  } else {
    res.render('index', { userRole: "visitor" });
  }
});

app.get('/index1', (req, res) => {
  console.log("index111");
  const isAuthenticated = req.isAuthenticated();
  if (isAuthenticated){
    res.render('index1', { userRole: req.user.role });
  } else {
    res.render('index1', { userRole: "visitor" });
  }
});

app.get('/register', checkNotAuthenticated, (req, res) => {
  const isAuthenticated = req.isAuthenticated();
  if (isAuthenticated){
    res.render('register', { userRole: req.user.role });
  } else {
    res.render('register', { userRole: "visitor" });
  }
});

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const email = req.body.email;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = getUserByEmail(email);
    if (user) {
      req.flash('error', 'Email already exists');
      return res.status(400).render('register', { messages: req.flash() });
    }
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: email,
      password: hashedPassword,
      role: 'user'
    });
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.redirect('/register');
  }
});

app.get('/login', checkNotAuthenticated, (req, res) => {
  const isAuthenticated = req.isAuthenticated();
  if (isAuthenticated){
    res.render('login', { userRole: req.user.role });
  } else {
    res.render('login', { userRole: "visitor" });
  }
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

app.post('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// Coverage Route
let covrg = {
  ceremonyTitle: "Ceremony honoring club presidents",
  details: "Short course in portrait photography by Mr. Mohammad Shabeb Don't miss this chance Note: \"your attend count with non academic activities\"",
  photos: [
    "https://lh3.googleusercontent.com/fife/AGXqzDnnPT8rp3D2B_ZpmI4LuyFnNsS_JpZ1Q1XEVsNMUK5hSn5BEELIHkiv9itleiE_wK_8UjwEDoiE69kf89J4N8dTBtDNNHSQCMUGH-8El8O_p1xjozu0r8shymerZmXDUsmcGmef4X3plkAwF6Bjm6uQk5_rToaGSi631_jC-W0aAfyPMK2T1mGf25J6ks6tupR62C_bG7wwCSN-_HTLD-DJxQ42JrZ9iuMm6Fx-iFNIFnSlhrCQ994iDtWQ3wJxvgmNPs8ICwccYsreRxwCn9JICSXzhp-zcdl2_QB52Bq-M6bqgGbgi2XCXzWvnfy35lxGERPzIta6VLpqN83OW27UySJlbPTZkT12AwU4YSYPRvqs17PtpYxg3CCgp_XH2dYlLbko5523tKdS19Sw9hjmGw8E0R1WtRrLJFV7tGGrtMMHZwBKTqeXTmFUt3p9-B2DvUbvdbMMLQYw7OLdMBQRu2UNQVoIRITtv1BhAaWOCvSFF_m5UC1QLVqB0cSX4Bxk_JaFTD3tedHypYAkbZuCnAACDuyW3HoNhTwbqutTKAVZoBWpuBwHo4g_rKmO4kOSkC8O2XBsMvIxADFcrHbnjtDuDajFhCqY3zrwtpHxYUTKh5FNQKpYSyqlrR-vEUeciYjcRju3xUdieT0E2oaoFtJLan_57zMfAiAJBJ2ZxQTEhwNRlGNSDxqfjRvecoWqx5fDtSacGlFRprCS23VWBHIGP1smCn_4KQjbVNooJy1aMiO40TYHSsxFhKb1ECkVQkptcjXdfSBlVFskiK-tFTzweP4-grEu92mcXvWifQAF5VxcirSQAMel5tgxtjaUie7Xhvx9PBQN0phEJQCEoJQJxUUR7c56VP23xTFnObARU-AAqj_74_RQO2M2I8JTEEekcZqWZehyzrHlZxVjcGGoew_5Lm7r4n-T8rlBL7w=w1194-h1470",
    "https://lh3.googleusercontent.com/fife/AGXqzDmT87diGBY96akkAyQxKrN0YeY1nemEXD5zI1Ji6wNHMYdN7OHbMFT3GM5kA_A1_-fALwCbG3jogjboXwuiPcOVyNPsNBbhA39t_Km8CmRJJ45SjpDuBa6vSIyjCWVQFT2W-DPm31zOZD4-XPXdiMSxP-0yVs6zpAMjj2I6E0A7O2YF9ozj1NSXkiAc66rRh36irggFrbTixbQPgPgEvhhNM9o0M5JJSQ3BDq2dqiIHm9KAxPQZIB9A3MIhppuXHr8Dz2nZIkutmtA8asevlJPufirImVLlsRqh2nKWKzcrTHN6L7lfir_2kK4ov96FUsct8viI8o4V0dRSM0XTbcm34OZWi8V83HDx16e3J3bD5UpW4icyuB8w1TtUi57ZjcXGQ08T3hFl2bEO8L-pQkbfrJeyG4A3Oq_xC4s4IL6NtnYlDvzRX12941-aD2SjRv4_7MkA4OdCriNXOi0LeZf364TltBYiGXAtwwCuKqgm9wFMs9taQ3KRpktGEkB9rG9n9eaAX0HPxCWQneS8o66akN1td3wZ_YXebBpZObm1SXo182dbGVNGJCVQ3uR6rCm3HhIsjksYXeHBAeMg0aAQ4Ognx7dcmfHfhY_B60vR7t1_fqi7IpaansBgmBdemm5LZC2x3EnE2vdDNIKKecKZT0xg9eEtV9NSFfivhE4mIkTJ_AcAcZsUs6tXu-POsuo5VRSS-6Rnpp-cDjhlrkMLEckkxwOKxt5XPSQpH90Qti83gXjdLMQzcZBTioeg-kyUKoAksf1CX04RmaKJGa1k86Hfu2Ov5-2EKk_Hr-pL2XuuNmNdShSsSzHC_aM0BQUgHvOda5byfHaoh4ZHFcbNmzODADQUswgVbydbuwP6RdICGJ-v4vNK8FHBGUYvbupwJHlDVJYbTgeHmYNKPuMmk8fDE9OQQlBWpwVpf2-G-dA=w1194-h1470"
  ]
};









app.get('/covrege', (req, res) => {
  const s3 = createS3Instance();
  const listParams = { Bucket: BUCKETNAME };

  s3.listObjectsV2(listParams, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    } else {
      const files = data.Contents.map(file => {
        const folderName = path.dirname(file.Key); // Fix the syntax error by changing 'file.key' to 'file.Key'
        const fileName = path.basename(file.Key); // Fix the syntax error by changing 'file.key' to 'file.Key'

        return {
          folder: folderName,
          name: fileName,
          url: `https://${BUCKETNAME}.s3.amazonaws.com/${file.Key}`
        };
      });
      const isAuthenticated = req.isAuthenticated();
      if (isAuthenticated){
        res.render('covrege', { files, covrg, userRole: req.user.role });
      } else {
        res.render('covrege', { files, covrg, userRole: "visitor" });
      }
    }
  });
});

app.get('/covreges',  (req, res) => {
  const isAuthenticated = req.isAuthenticated();
  if (isAuthenticated){
    res.render('covreges', { userRole: req.user.role });
  } else {
    res.render('covreges', { userRole: "visitor" });
  }
});

app.get('/events', (req, res) => {
  const isAuthenticated = req.isAuthenticated();
  if (isAuthenticated){
    res.render('events', { userRole: req.user.role });
  } else {
    res.render('events', { userRole: "visitor" });
  }
});

// AWS S3 File Operations Routes
app.get('/files', (req, res) => {
  const listParams = { Bucket: BUCKETNAME };
  s3.listObjectsV2(listParams, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    } else {
      const files = data.Contents.map(file => ({
      name: file.Key,
      
      url: `https://${BUCKETNAME}.s3.amazonaws.com/${file.Key}`
    }));
      
      res.json(files);
    }
  });
});

app.post('/upload', upload.array('files'), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
  const uploadPromises = req.files.map(file => {
    const uploadParams = {
      Bucket: BUCKETNAME,
      Key: `${req.body.folder}/`+file.originalname,
      Body: file.buffer
    };
    return s3.upload(uploadParams).promise();
  });
  Promise.all(uploadPromises)
    .then(() => res.redirect('/'))
    .catch(err => res.status(500).json({ error: 'Error -> ' + err }));
});

app.delete('/files/:name', (req, res) => {
  const deleteParams = { Bucket: BUCKETNAME, Key: req.params.name };
  s3.deleteObject(deleteParams, (err) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    } else {
      res.send("File deleted successfully");
    }
  });
});

// Error handling for undefined routes
app.all('*', (req, res) => {
  res.status(404).send('Resource not found');
});

// Start the server
app.listen(3000, () => {
  console.log('Server is listening on port 3000...');
});