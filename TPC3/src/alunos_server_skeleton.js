// alunos_server.js
// EW2024 : 04/03/2024
// by jcr

import http from 'http';
import axios from 'axios';
import { parse } from 'querystring';

import * as templates from './templates.js';          // Necessario criar e colocar na mesma pasta
import * as _static from './static.js';             // Colocar na mesma pasta
import { resourceLimits } from 'worker_threads';

// Aux functions
function collectRequestBodyData( request, callback ) {
    if(request.headers['content-type'] === 'application/x-www-form-urlencoded') {
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        request.on('end', () => {
            callback( parse( body ) );
        });
    } else {
        callback( null );
    }
}

// Server creation
var alunosServer = http.createServer( async ( req, res ) => {
    // Logger: what was requested and when it was requested
    var d = new Date().toISOString().substring(0, 16);
    console.log(req.method + " " + req.url + " " + d);
    let a;

    // Handling request
    if(_static.staticResource(req)){
        _static.serveStaticResource(req, res);
    } else{
        switch( req.method ){
            case "GET": 
                // GET /alunos --------------------------------------------------------------------
                if ( req.url === '/' || req.url === 'alunos' ) {
                    res.writeHead( 405, { 'Content-Type' : 'text/html; charset=utf-8' } );
                    const data = (await axios.get( 'http://localhost:3000/alunos' )).data;
                    res.write(templates.studentsListPage( data, d ));
                }
                // GET /alunos/:id --------------------------------------------------------------------
                else if ( a = req.url.match(/\/alunos\/(A|PG)\d+$/) ) {
                    const id = a[1]; 
                    console.log( id );
                    res.writeHead( 405, { 'Content-Type' : 'text/html; charset=utf-8' } );
                    const data = (await axios.get( `http://localhost:3000/alunos/id=${ id }` )).data[0];
                    res.write(templates.studentPage( data, d ));   
                }
                // GET /alunos/registo --------------------------------------------------------------------
                else if ( req.url === "alunos/registo") {
            
                }
                // GET /alunos/edit/:id --------------------------------------------------------------------
                else if ( req.url.match(/\/alunos\/registo\/(A|PG)\d+$/) ) {
                    
                }
                // GET /alunos/delete/:id --------------------------------------------------------------------
                else if ( req.url.match(/\/alunos\/delete\/(A|PG)\d+$/) ) {
                    
                }
                // GET ? -> Lancar um erro
                res.end();
                break;
            case "POST":
                // POST /alunos/registo --------------------------------------------------------------------
                if ( req.url === "/alunos/registo" ) {
                    collectRequestBodyData( req, async result => {
                        if ( result ) {
                            const res = await axios.post( 'http://localhost:3000/alunos, result' );
                            res.write(  );

                        } else {
                            res.writeHead( 500, { 'Content-Type' : 'text/html; charset=utf-8' } );
                            res.end();
                        }
                    } );
                }
                // POST /alunos/edit/:id --------------------------------------------------------------------

                // POST ? -> Lancar um erro
            case "PUT":
            case "DELETE":
            default: 
                // Outros metodos nao sao suportados
                console.log("Ain't it chief");
                res.writeHead( 500, { 'Content-Type' : 'text/html; charset=utf-8' } );
                res.end();
                break;
        }
    }
});

export function startServer () {
    alunosServer.listen( 7777, () => {
        console.log("Servidor à escuta na porta 7777...")
    });
}


