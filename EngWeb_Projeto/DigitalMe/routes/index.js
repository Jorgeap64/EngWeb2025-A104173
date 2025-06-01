var express = require('express');
var router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

var Middleware = require('../middleware/auth');

// GET home page
router.get('/', async function(req, res, next) {
  const pageNum = parseInt(req.query.pageNum) || 1;
  const selectedCategory = req.query.category || '';

  let archives = [];
  let totalPages = 1;
  let selectCategories = [];

  try {
    const response = await axios.get(`http://digitalme-api:7777/aip/public?page=${pageNum}&category=${selectedCategory}`);
    const categories = await axios.get(`http://digitalme-api:7777/aip/categories`);
    
    selectCategories = categories.data;
    archives = response.data.data || [];
    totalPages = response.data.totalPages || 1;
  } catch (err) {
    console.error('Failed to fetch public archives:', err.message);
  }

  const token = req.cookies.token;

  const renderOptions = {
    title: 'Digital Me',
    archives,
    pageNum,
    totalPages,
    selectCategories,
    selectedCategory
  };

  if (token) {
    jwt.verify(token, 'digitalMeKey', (err, decodedToken) => {
      if (!err) {
        if (!decodedToken.admin) {
          res.render('index', { ...renderOptions, dashboard: 'Dashboard', logout: 'Logout' });
        } else {
          res.render('index', { ...renderOptions, adminDashboard: 'Admin Dashboard', logout: 'Logout' });
        }
      } else {
        res.render('index', { ...renderOptions, login: 'Login', register: 'Register' });
      }
    });
  } else {
    res.render('index', { ...renderOptions, login: 'Login', register: 'Register' });
  }
});

// GET login page
router.get('/login', Middleware.redirectIfAuthenticated, function(req, res, next) {
  res.render('login', { title: 'Digital Me | Login', subtitle: 'Login To Your Digital Me Account', register: 'Register' });
});

// GET register page
router.get('/register', Middleware.redirectIfAuthenticated, function(req, res, next) {
  res.render('register', { title: 'Digital Me | Register', subtitle: 'Create An Account In Digital Me', login: 'Login' });
});

// GET dashboard page
router.get('/dashboard', Middleware.ensureAuthenticatedUser, async function(req, res, next) {
  const pageNum = parseInt(req.query.pageNum) || 1;
  const category = req.query.category || '';
  const token = req.cookies.token;

  try {
    const queryParams = new URLSearchParams({ page: pageNum });
    if (category) queryParams.append('category', category);

    const response = await axios.get(`http://digitalme-api:7777/aip/private?${queryParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const archives = response.data.data || [];
    const totalPages = response.data.totalPages || 1;

    const categoriesResponse = await axios.get(`http://digitalme-api:7777/aip/categories`);
    const selectCategories = categoriesResponse.data;

    res.render('dashboard', {
      title: 'Digital Me | Dashboard',
      logout: 'Logout',
      archives,
      pageNum,
      totalPages,
      selectCategories,
      selectedCategory: category
    });
  } catch (err) {
    console.error('Failed to fetch private archives:', err.message);
    res.status(500).render('error', { message: 'Could not load private dashboard' });
  }
});

router.get('/dashboard/delete/:id', Middleware.ensureAuthenticatedUser, async (req, res) => {
  const archiveID = req.params.id;
  const token = req.cookies.token;

  try {
    const response = await axios.delete(`http://digitalme-api:7777/aip/${archiveID}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    res.redirect('/dashboard?pageNum=1');
  } catch (err) {
    console.error('Delete failed:', err.message);
    res.status(500).render('error', { message: 'Failed to delete archive.' });
  }
});

router.get('/adminDashboard/delete/:id', Middleware.ensureAuthenticatedAdmin, async (req, res) => {
  const archiveID = req.params.id;
  const token = req.cookies.token;

  try {
    const response = await axios.delete(`http://digitalme-api:7777/aip/${archiveID}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    res.redirect('/adminDashboard?pageNum=1');
  } catch (err) {
    console.error('Delete failed:', err.message);
    res.status(500).render('error', { message: 'Failed to delete archive.' });
  }
});

router.get('/dashboard/toggle/:id', Middleware.ensureAuthenticatedUser, async (req, res) => {
  const archiveID = req.params.id;
  const token = req.cookies.token;

  try {
    await axios.put(
      `http://digitalme-api:7777/aip/${archiveID}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    res.redirect('/dashboard?pageNum=1');
  } catch (err) {
    console.error('Update failed:', err.message);
    res.status(500).render('error', { message: 'Failed to update archive.' });
  }
});

router.get('/adminDashboard/toggle/:id', Middleware.ensureAuthenticatedAdmin, async (req, res) => {
  const archiveID = req.params.id;
  const token = req.cookies.token;

  try {
    await axios.put(
      `http://digitalme-api:7777/aip/${archiveID}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    res.redirect('/adminDashboard?pageNum=1');
  } catch (err) {
    console.error('Update failed:', err.message);
    res.status(500).render('error', { message: 'Failed to update archive.' });
  }
});

router.get( '/dashboard/download/:id', async ( req, res ) => {
	try {
		const response = await axios.get( `http://digitalme-api:7777/aip/download/${ req.params.id }`,
			{
				responseType: 'stream',
			}
		);

		res.setHeader( 'Content-Disposition', response.headers['content-disposition'] );
		res.setHeader( 'Content-Type', response.headers['content-type'] );

		response.data.pipe( res );
	} catch ( error ) {
		console.error( 'Download failed:', error.message );
		res.status( 500 ).render( 'error', { message: 'Failed to download archive.' } );
	}
});

router.post('/dashboard/upload', Middleware.ensureAuthenticated, upload.single('file'), async (req, res) => {
  const token = req.cookies.token;

  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(req.file.path), req.file.originalname);

    await axios.post('http://digitalme-api:7777/aip', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    fs.unlinkSync(req.file.path);
    
    if (req.admin) {
      res.redirect('/adminDashboard?pageNum=1');
    } else {
      res.redirect('/dashboard?pageNum=1');
    }
  } catch (err) {
    console.error('Upload failed:', err.message);
    res.status(500).render('error', { message: 'Upload failed.' });
  }
});

// GET adminDashboard page
router.get('/adminDashboard', Middleware.ensureAuthenticatedAdmin, async function(req, res, next) {
  const pageNum = parseInt(req.query.pageNum) || 1;
  const category = req.query.category || '';
  const token = req.cookies.token;

  try {
    const queryParams = new URLSearchParams({ page: pageNum });
    if (category) queryParams.append('category', category);

    const response = await axios.get(`http://digitalme-api:7777/aip/privateAdmin?${queryParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const archives = response.data.data || [];
    const totalPages = response.data.totalPages || 1;

    const categoriesResponse = await axios.get(`http://digitalme-api:7777/aip/categories`);
    const selectCategories = categoriesResponse.data;

    res.render('adminDashboard', {
      title: 'Digital Me | Admin',
      admin: true,
      allUsers: 'All Users',
      logout: 'Logout',
      numArchives: response.data.numArchives,
      numUsers: response.data.numUsers,
      archives,
      pageNum,
      totalPages,
      selectCategories,
      selectedCategory: category
    });
  } catch (err) {
    console.error('Failed to fetch private archives:', err.message);
    res.status(500).render('error', { message: 'Could not load private dashboard' });
  }
});

// GET adminUsers page
router.get('/adminUsers', Middleware.ensureAuthenticatedAdmin, async function(req, res, next) {
  const token = req.cookies.token;

  try {
    const response = await axios.get(`http://digitalme-api:7777/user`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const users = response.data.users;
    const numUsers = response.data.numUsers;
    const numArchives = response.data.numArchives;

    res.render('adminUsers', {
      title: 'Digital Me | Users',
      admin: true,
      logout: 'Logout',
      numArchives: response.data.numArchives,
      numUsers: response.data.numUsers,
      adminDashboard: 'Admin Dashboard',
      users,
      numUsers,
      numArchives
    });
  } catch (err) {
    console.error('Failed to fetch users:', err.message);
    res.status(500).render('error', { message: 'Could not load users' });
  }
});

// GET adminUsers/view/userID
router.get('/adminUsers/view/:id', Middleware.ensureAuthenticatedAdmin, async function(req, res, next) {
  const token = req.cookies.token;

  try {
    const response = await axios.get(`http://digitalme-api:7777/user/${req.params.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const user = response.data.user;
    const numUsers = response.data.numUsers;
    const numArchives = response.data.numArchives;

    res.render('userPage', {
      title: 'Digital Me | User',
      admin: true,
      logout: 'Logout',
      username: user.username,
      name: user.name,
      email: user.email,
      creationDate: user.creationDate,
      adminDashboard: 'Admin Dashboard',
      adminUsers: 'Admin Users',
      userID: req.params.id,
      numUsers,
      numArchives
    });
  } catch (err) {
    console.error('Failed to fetch user:', err.message);
    res.status(500).render('error', { message: 'User not found' });
  }
});

// POST adminUsers/edit/:id
router.post('/adminUsers/edit/:id', Middleware.ensureAuthenticatedAdmin, async function(req, res) {
  const token = req.cookies.token;
  const { username, name, email } = req.body;

  try {
    await axios.put(`http://digitalme-api:7777/user/${req.params.id}`, {
      username,
      name,
      email
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    res.redirect(`/adminUsers/view/${req.params.id}`);
  } catch (err) {
    console.error('Failed to update user:', err.message);

    res.status(500).render('userPage', {
      title: 'Digital Me | User',
      admin: true,
      logout: 'Logout',
      username,
      name,
      email,
      creationDate: req.body.creationDate || new Date().toISOString(),
      adminDashboard: 'Admin Dashboard',
      adminUsers: 'Admin Users',
      userID: req.params.id,
      error: 'Failed to update user. Please try again.',
      numUsers: null,
      numArchives: null
    });
  }
});

router.get('/adminUsers/delete/:id', Middleware.ensureAuthenticatedAdmin, async (req, res) => {
  const userID = req.params.id;
  const token = req.cookies.token;

  try {
    const response = await axios.delete(`http://digitalme-api:7777/user/${userID}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    res.redirect('/adminUsers');
  } catch (err) {
    console.error('Delete failed:', err.message);
    res.status(500).render('error', { message: 'Failed to delete user.' });
  }
});

// POST Login handle
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const response = await axios.post('http://digitalme-api:7777/user/login', { username, password });

    if (response.status === 201 && response.data.token) {
      res.cookie('token', response.data.token, { httpOnly: true });
      res.redirect('/');
    } else {
      res.render('login', {
        title: 'Digital Me',
        subtitle: 'Login To Your Digital Me Account',
        errorMessage: 'Login failed',
        register: 'Register'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.render('login', {
      title: 'Digital Me',
      subtitle: 'Login To Your Digital Me Account',
      errorMessage: 'Invalid username or password',
      register: 'Register'
    });
  }
});

router.get('/oauth-success', (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).send('Auth failed');
  }

  res.cookie('token', token, { httpOnly: true });

  res.redirect('/');
});

// GET Logout handle
router.get('/logout', Middleware.ensureAuthenticated, (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

// POST Register handle
router.post('/register', async (req, res) => {
  const { username, name, email, password, confirmPassword } = req.body;

  // Validate passwords match
  if (password !== confirmPassword) {
    return res.render('register', {
      title: 'Digital Me',
      subtitle: 'Create An Account In Digital Me',
      errorMessage: 'Passwords do not match',
      login: 'Login'
    });
  }

  try {
    const response = await axios.post('http://digitalme-api:7777/user/register', {
      username,
      name,
      email,
      password
    });

    if (response.status === 201 || response.data === 'Success') {
      return res.redirect('/login');
    } else {
      return res.render('register', {
        title: 'Digital Me',
        subtitle: 'Create An Account In Digital Me',
        errorMessage: 'Registration failed. Please try again.',
        login: 'Login'
      });
    }
  } catch (error) {
    console.error('Register error:', error.response?.data || error.message);

    return res.render('register', {
      title: 'Digital Me',
      subtitle: 'Create An Account In Digital Me',
      errorMessage: error.response?.data?.message || 'Email or username already exists',
      login: 'Login'
    });
  }
});

// POST Admin Register handle
router.post('/adminUsers/register', async (req, res) => {
  const { username, name, email, password, confirmPassword, admin } = req.body;

  if (password !== confirmPassword) {
    return res.render('adminRegister', {
      title: 'Digital Me | Admin Registration',
      errorMessage: 'Passwords do not match'
    });
  }

  try {
    const response = await axios.post('http://digitalme-api:7777/user/register', {
      username,
      name,
      email,
      password,
      admin: admin === 'on'
    });

    if (response.status === 201 || response.data === 'Success') {
      return res.redirect('/adminUsers');
    } else {
      return res.render('adminRegister', {
        title: 'Digital Me | Admin Registration',
        errorMessage: 'Registration failed. Please try again.'
      });
    }
  } catch (error) {
    console.error('Admin Register error:', error.response?.data || error.message);

    return res.render('adminRegister', {
      title: 'Digital Me | Admin Registration',
      errorMessage: error.response?.data?.message || 'Email or username already exists'
    });
  }
});
module.exports = router;
