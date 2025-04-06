var express = require('express');
var router = express.Router();
var axios = require( 'axios' );
const Contrato = require('../controllers/contratos.js');

// GET /contratos
router.get('/', async function(req, res, next) {
    if (req.query.entidade) {
        const entidade = decodeURI( req.query.entidade );
        Contrato.getContratoByEntidade( entidade )
            .then( data => res.status(200).jsonp(data))
            .catch( error => res.status(500).jsonp(error) );
        //res.render('entidade', { title: 'Contrato' });
    } else if (req.query.tipo) {
        const data = await Contrato.getContratoByTipo(req.query.tipo);
        res.status(200).jsonp(data);
    } else {
        Contrato.getContratos()
            .then( data => res.status(200).jsonp(data))
            .catch( error => res.status(500).jsonp(error) );
        //res.render('contratos', { title: 'Contratos' });
    }
});

// GET /contratos/tipos
router.get('/tipos', async (req, res) => {
    console.log(req.url);
    try {
        const data = await Contrato.getTipos();
        res.status(200).jsonp(data);
    } catch (err) {
        res.status(500).jsonp({ erro: err });
    }
});

// GET /contratos/entidades
router.get('/entidades', async (req, res) => {
    try {
        const data = await Contrato.getEntidades();
        res.status(200).jsonp(data);
    } catch (err) {
        res.status(500).jsonp({ erro: err });
    }
});

// GET /contratos/:id
router.get("/:id", function(req, res, next) {
    Contrato.getContratoById(req.params.id)
        .then(data => res.status(200).jsonp(data))
        .catch(erro => res.status(500).jsonp(erro));
});

// POST /contratos
router.post('/', async (req, res) => {
    console.log(req.url);
    try {
        const data = await Contrato.insert(req.body);
        res.status(201).jsonp(data);
    } catch (err) {
        res.status(500).jsonp({ erro: err });
    }
});

// DELETE /contratos/:id
router.delete('/:id', async (req, res) => {
    console.log(req.url);
    try {
        const data = await Contrato.delete(req.params.id);
        res.status(200).jsonp(data);
    } catch (err) {
        res.status(500).jsonp({ erro: err });
    }
});

// PUT /contratos/:id
router.put('/:id', async (req, res) => {
    try {
        const data = await Contrato.update(req.body, req.params.id);
        res.status(200).jsonp(data);
    } catch (err) {
        res.status(500).jsonp({ erro: err });
    }
});

module.exports = router;
