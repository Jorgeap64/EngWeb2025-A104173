import http from 'http';
import fs from 'fs';
import path from 'path';
import * as api from './api.js';
import url from 'url';

const __dirname = decodeURI(import.meta.url.replace("file:///", ""));

function startServer() {
    
    http.createServer( async ( req, res ) => {
        console.log( "METHOD: " + req.method );
        console.log( "URL: " + req.url );
        
        if( req.method == "GET" ) {
            const parsedUrl = url.parse( req.url, true );
            const pathname = parsedUrl.pathname;
            const query = parsedUrl.query;
            
            switch( pathname ) {
                case "/": // -> home
                    console.log( 'IN HOME' );
                    fs.readFile( path.resolve( __dirname , '../../public/views/home.html' ), ( err, data ) => {
                        if ( err ) {
                            res.writeHead( 500, { 'Content-Type': "text/html; charset=utf-8" });
                            res.write( "Error loading home.html" );
                        } else {
                            res.write( data );
                        }
                        res.end();
                    });
                    break;
                case "/alunos" :
                    if ( Object.keys( query ).length === 0 ) {
                        try {
                            console.log( 'IN ALUNOS' );
                            const htmlString = await api.getAlunos();
                            res.writeHead( 200, { 'Content-Type': 'text/html; charset=utf-8' } );
                            res.write( htmlString );
                        } catch ( err ) {
                            console.log( 'ERROR ALUNOS' )
                            res.writeHead( 500, { 'Content-Type': 'text/html; charset=utf-8' } );
                            res.write( '<p>Error retrieving alunos.</p>' );
                        }
                    } else {
                        try {
                            console.log( 'IN ALUNO' );
                            const htmlString = await api.getAlunobyId( query.id );
                            res.writeHead( 200, { 'Content-Type': 'text/html; charset=utf-8' } );
                            res.write( htmlString );
                        } catch ( err ) {
                            console.log( 'ERROR ALUNO' )
                            res.writeHead( 500, { 'Content-Type': 'text/html; charset=utf-8' } );
                            res.write( '<p>Error retrieving aluno.</p>' );
                        }
                    }
                    res.end();
                    break;
                case "/cursos":
                    if ( Object.keys(query).length === 0 ) {
                        try {
                            console.log( 'IN CURSOS' );
                            const htmlString = await api.getCursos();
                            res.writeHead( 200, { 'Content-Type': 'text/html; charset=utf-8' } );
                            res.write( htmlString );
                        } catch ( err ) {
                            console.log( 'ERROR CURSOS' )
                            res.writeHead( 500, { 'Content-Type': 'text/html; charset=utf-8' } );
                            res.write( '<p>Error retrieving cursos.</p>' );
                        }
                    } else {
                        try {
                            console.log( 'IN CURSO' );
                            const htmlString = await api.getCursoById( query.id );
                            res.writeHead( 200, { 'Content-Type': 'text/html; charset=utf-8' } );
                            res.write( htmlString );
                        } catch ( err ) {
                            console.log( 'ERROR CURSO' )
                            res.writeHead( 500, { 'Content-Type': 'text/html; charset=utf-8' } );
                            res.write( '<p>Error retrieving curso.</p>' );
                        }
                    }
                    res.end();
                    break;
                case "/instrumentos":
                    if ( Object.keys(query).length === 0 ) {
                        try {
                            console.log( 'IN INSTRUMENTOS' );
                            const htmlString = await api.getInstrumentos();
                            res.writeHead( 200, { 'Content-Type': 'text/html; charset=utf-8' } );
                            res.write( htmlString );
                        } catch ( err ) {
                            console.log( 'ERROR INSTRUMENTOS' )
                            res.writeHead( 500, { 'Content-Type': 'text/html; charset=utf-8' } );
                            res.write( '<p>Error retrieving instrumentos.</p>' );
                        }
                    } else {
                        try {
                            console.log( 'IN INSTRUMENTO' );
                            const htmlString = await api.getInstrumentoById( query.id );
                            res.writeHead( 200, { 'Content-Type': 'text/html; charset=utf-8' } );
                            res.write( htmlString );
                        } catch ( err ) {
                            console.log( 'ERROR INSTRUMENTO' )
                            res.writeHead( 500, { 'Content-Type': 'text/html; charset=utf-8' } );
                            res.write( '<p>Error retrieving instrumento.</p>' );
                        }
                    }
                    res.end();
                    break;
                case "/w3.css": 
                    fs.readFile( path.resolve( __dirname , '../../public/styles/w3.css' ), ( err, data ) => {
                        if ( err ) {
                            res.writeHead( 500, { 'Content-Type': "text/css; charset=utf-8" });
                            res.write( "Error loading w3.css" + err.message );
                        } else {
                            res.writeHead( 200, { 'Content-Type': "text/css; charset=utf-8" });
                            res.write( data );
                        }
                        res.end();
                    });
                    break;
                default : 
                    res.end();
                    break;
                }
        } else {
            res.statusCode( 405 ).end();
        }
    }).listen( 1234 );

    console.log( 'Server active...' );
}

export { startServer };