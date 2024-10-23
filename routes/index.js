var express = require('express');
var router = express.Router();
const cookieParser = require('cookie-parser');

const authorController = require('../controllers/authorController')
// import authorController from '../controllers/authorController'
/* GET home page. */
router.get('/', (req, res, next) => {
  // Cookies that have not been signed
  console.log('Cookies: ', req.cookies)

  // Cookies that have been signed
  console.log('Signed Cookies: ', req.signedCookies)
});

router.get('/set-cookie', (req, res, next) => {
  res.cookie('name', 'express')

  res.cookie('preference', 'dark-mode', {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  })

  res.send('Cookie has been set')
})

// membuat signed cookie
router.get('/set-signed-cookie', (req, res, next) => {
  res.cookie('user_id', '123456', { signed: true, maxAge: 1000 * 60 * 60 * 24 })
  res.send('Signed cookie has been set')
})

// membaca spesific cookie
router.get('/get-cookie', (req, res, next) => {
  const preference = req.cookies.preference
  res.send(`Preference: ${preference}`)
})

// Contoh membaca signed cookie
router.get('/get-user', (req, res) => {
  const userId = req.signedCookies.user_id;
  if (userId) {
    res.json({ userId });
  } else {
    res.status(401).json({ message: 'User tidak terautentikasi' });
  }
});

// Contoh menghapus cookie
router.get('/clear-cookie', (req, res) => {
  // Hapus cookie spesifik
  res.clearCookie('username');
  res.clearCookie('preferences');
  res.clearCookie('user_id');
  
  res.send('Cookies telah dihapus');
});

// Contoh middleware autentikasi menggunakan cookie
const authMiddleware = (req, res, next) => {
  const userId = req.signedCookies.user_id;
  if (!userId) {
    return res.status(401).json({ message: 'Akses ditolak' });
  }
  next();
};

// Route yang memerlukan autentikasi
router.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Ini adalah halaman terproteksi' });
});

// Contoh penggunaan cookie untuk shopping cart
router.post('/add-to-cart', (req, res) => {
  // Ambil cart dari cookie atau buat baru jika belum ada
  let cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
  
  // Tambah item baru (contoh)
  const newItem = {
    id: req.body.productId,
    quantity: req.body.quantity
  };
  cart.push(newItem);
  
  // Simpan cart yang sudah diupdate ke cookie
  res.cookie('cart', JSON.stringify(cart), {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
    httpOnly: true
  });
  
  res.json({ message: 'Item ditambahkan ke cart' });
});


// a middleware sub-stack shows request info for any type of HTTP request to the /user/:id path
router.use('/user/:id', (req, res, next) => {
  console.log('Request URL:', req.originalUrl)
  next()
}, (req, res, next) => {
  console.log('Request Type:', req.method)
  next()
})

// a middleware sub-stack that handles GET requests to the /user/:id path
router.get('/user/:id', (req, res, next) => {
  // if the user ID is 0, skip to the next router
  if (req.params.id === '0') next('route')
  // otherwise pass control to the next middleware function in this stack
  else next()
}, (req, res, next) => {
  // render a regular page
  res.render('regular')
})

// handler for the /user/:id path, which renders a special page
router.get('/user/:id', (req, res, next) => {
  console.log(req.params.id)
  res.render('special')
})

const headerLogger = (req, res, next) => {
  console.log("Headers: ", req.headers)
  next()
}

const validateApiKey = (req, res, next) => {
  const apiKey = req.header('X-API-KEY')
  if (!apiKey || apiKey !== 'your-api-key-here') {
    return res.status(401).json({ message: 'Invalid API key' })
  }
  next()
}

// middleware token validation
const validateAuthToken = (req, res, next) => {
  const authHeader = req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No Token provided' })
  }

  const token = authHeader.split(' ')[1]
  if(token !== 'your-token-here') {
    return res.status(401).json({ message: 'Invalid token' })
  }
  next()
}

router.get('/headers', headerLogger, (req, res) => {
  const userAgent = req.headers['user-agent']
  const acceptLanguage = req.headers['accept-language']
  const cacheControl = req.headers['cache-control']

  res.json({ userAgent, acceptLanguage, cacheControl })
})

router.get('/api/protected', validateApiKey, (req, res) => {
  res.json({ message: 'Ini adalah halaman terproteksi' })
})

// Route yang memerlukan auth token dan membuat cookie session
router.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Contoh validasi sederhana
  if (username === 'admin' && password === 'password') {
    // Set cookie untuk session
    res.cookie('sessionId', 'session123', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 jam
    });
    
    // Set response header
    res.header('X-Auth-Token', 'valid-token');
    
    res.json({ message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Route yang memerlukan both cookie dan header auth
router.get('/api/dashboard', validateAuthToken, (req, res) => {
  const sessionId = req.cookies.sessionId;
  
  if (!sessionId) {
    return res.status(401).json({ message: 'No session found' });
  }
  
  res.json({ message: 'Dashboard data', sessionId });
});

// Contoh custom response headers
router.get('/custom-headers', (req, res) => {
  // Set multiple custom headers
  res.header('X-Custom-Header', 'custom value');
  res.header('X-Response-Time', Date.now());
  res.header('X-Powered-By', 'Your App Name');
  
  res.json({ message: 'Check response headers' });
});

// Route untuk content negotiation
router.get('/content', (req, res) => {
  const acceptHeader = req.header('Accept');
  
  if (acceptHeader.includes('application/xml')) {
    res.header('Content-Type', 'application/xml');
    res.send('<data><message>XML Response</message></data>');
  } else {
    res.header('Content-Type', 'application/json');
    res.json({ message: 'JSON Response' });
  }
});



// CRUD
// Create - POST
// Read - GET
// Update - PUT
// Delete - DELETE

module.exports = router;
