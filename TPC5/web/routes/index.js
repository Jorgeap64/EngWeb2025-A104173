var express = require('express');
var router = express.Router();
var axios = require( 'axios' );

/* GET home page. */
router.get('/', function(req, res, next) {
    axios.get("http://localhost:16000/contratos").then( resposta => {
      let contratos = resposta.data;
      res.status(200).render('index', { title: 'Interface de Contratos', contratos: contratos});
    }).catch( erro => {
      res.status(500).render('error', { error: erro });
    });
  });
  
router.get('/:id', function(req, res, next) {
    axios.get("http://localhost:16000/contratos/" + req.params.id).then( resposta => {
      let contrato = resposta.data;
      res.status(200).render('contract', { title: 'Contrato #' + req.params.id, contrato: contrato });
    }).catch( erro => {
      res.status(500).render('error', { error: erro });
    })
});

router.get('/entidades/:id', function(req, res, next) {
    axios.get("http://localhost:16000/contratos?entidadeNIPC=" + req.params.id).then( resposta => {
      let contratos = resposta.data;
      if (contratos.length > 0) {
          let nomeEntidade = contratos[0].entidade_comunicante;
          let somatorio = 0;
          contratos.forEach( contrato => {
              somatorio += contrato.precoContratual;
          })
  
          res.status(200).render('entity', 
              { 
                  nipc: req.params.id, 
                  nome: nomeEntidade,
                  contratos: contratos, 
                  valor: somatorio 
              }
          );
      } else {
          res.status(500).render('error', { error: "Error while fetching contratos, because the list is empty." });
      }
    }).catch( erro => {
      res.status(500).render('error', { error: erro });
    })
});
  
module.exports = router;
