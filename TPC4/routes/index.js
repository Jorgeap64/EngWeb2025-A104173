var express = require('express');
var router = express.Router();
var axios = require( 'axios' );

/* home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Absolute Cinema' });
});

/* movies page. */
router.get( '/movies', async function( req, res, next ) {
	try {
		const _res = await axios.get( 'http://localhost:3000/filmes' );
		res.render( 'movies', { filmes: _res.data, title: "Movies" } );
	} catch( err ) {
		console.log( err );
	}
});

router.get('/movie/delete/:id', async function(req, res) {
    try {
        const id = req.params.id;
        await axios.delete( `http://localhost:3000/filmes/${ id }` );
        res.redirect( '/movies' );
    } catch( err ) {
        console.log( err );
    }
});

/* movie page. */
router.get( '/movie/:title', async function( req, res, next ) {
	try {
		const movieTitle = decodeURI( req.params.title );
		const _res = await axios.get( `http://localhost:3000/filmes?title=${ movieTitle }` );
		res.render( 'movie', { filme: _res.data[0], title: movieTitle } );
	} catch( err ) {
		console.log( err );
	}
});

router.get( '/actors/:actor' , async function( req, res, next ) {
    try {
        const actor = decodeURI( req.params.actor );

        const _res = await axios.get('http://localhost:3000/filmes');
        const movies = _res.data;
        
        const filteredMovies = movies
            .filter(movie => movie.cast.includes(actor))
            .map(movie => movie.title);
        
        res.render( 'actor', { filme: filteredMovies, title: actor } );
    } catch( err ) {
        console.log( err );
    }
});

/* edit page. */
router.get( '/movie/edit/:id', async function( req, res, next ) {
	try {
		//const movieTitle = decodeURI( req.params.title );
        const id = req.params.id;
		const _res = await axios.get( `http://localhost:3000/filmes?id=${ id }` );
		res.render( 'edit', { filme: _res.data[0] } );
	} catch( err ) {
		console.log( err );
	}
});

router.post( '/movie/edit/:id', async function( req, res ) {
	try{
        const id = req.params.id;
		let updatedMovie = {
			title: req.body.title,
			year: req.body.year,
			cast: Array.isArray(req.body.cast) ? req.body.cast : req.body.cast.split(',').map(a => a.trim()),
			genres: Array.isArray(req.body.genres) ? req.body.genres : req.body.genres.split(',').map(g => g.trim()),
            id: id
		};
		
		await axios.put( `http://localhost:3000/filmes/${ id }`, updatedMovie, { header: { "Content-Type" : "application/json; charset=utf-8" } });
		res.redirect( '/movies' );
	} catch( err ) {
		console.log( err );
	}
});

module.exports = router;
