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
                case "/reparacoes" :
                    if ( Object.keys(query).length === 0 ) {
                        try {
                            console.log( 'IN REPAIRS' );
                            const htmlString = await api.getRepairs();
                            res.writeHead( 200, { 'Content-Type': 'text/html; charset=utf-8' } );
                            const title = '<h1>Lista de Reparações</h1>';
                            res.write( title );
                            res.write( htmlString );
                        } catch ( err ) {
                            console.log( 'ERROR REPAIRS' )
                            res.writeHead( 500, { 'Content-Type': 'text/html; charset=utf-8' } );
                            res.write( '<p>Error retrieving repairs.</p>' );
                        }
                    } else {
                        try {
                            console.log( 'IN REPAIR' );
                            const htmlString = await api.getRepairByName( query.nome );
                            res.writeHead( 200, { 'Content-Type': 'text/html; charset=utf-8' } );
                            const title = '<h1>Reparações</h1>';
                            res.write( title );
                            res.write( htmlString );
                        } catch ( err ) {
                            console.log( 'ERROR REPAIR' )
                            res.writeHead( 500, { 'Content-Type': 'text/html; charset=utf-8' } );
                            res.write( '<p>Error retrieving repairs.</p>' );
                        }
                    }
                    res.end();
                    break;
                case "/viaturas":
                    if ( Object.keys(query).length === 0 ) {
                        try {
                            console.log( 'IN VEHICLES' );
                            const htmlString = await api.getVehicles();
                            res.writeHead( 200, { 'Content-Type': 'text/html; charset=utf-8' } );
                            const title = '<h1>Lista de Viaturas</h1>';
                            res.write( title );
                            res.write( htmlString );
                        } catch ( err ) {
                            console.log( 'ERROR VEHICLES' )
                            res.writeHead( 500, { 'Content-Type': 'text/html; charset=utf-8' } );
                            res.write( '<p>Error retrieving vehicle.</p>' );
                        }
                    } else {
                        try {
                            console.log( 'IN VEHICLE' );
                            const htmlString = await api.getVehicleByRegistration( query.matricula );
                            res.writeHead( 200, { 'Content-Type': 'text/html; charset=utf-8' } );
                            const title = '<h1>Viaturas</h1>';
                            res.write( title );
                            res.write( htmlString );
                        } catch ( err ) {
                            console.log( 'ERROR VEHICLE' )
                            res.writeHead( 500, { 'Content-Type': 'text/html; charset=utf-8' } );
                            res.write( '<p>Error retrieving vehicle.</p>' );
                        }
                    }
                    res.end();
                    break;
                case "/intervencoes":
                    if ( Object.keys(query).length === 0 ) {
                        try {
                            console.log( 'IN INTERVENTIONS' );
                            const htmlString = await api.getInterventions();
                            res.writeHead( 200, { 'Content-Type': 'text/html; charset=utf-8' } );
                            const title = '<h1>Lista de Intervenções</h1>';
                            res.write( title );
                            res.write( htmlString );
                        } catch ( err ) {
                            console.log( 'ERROR INTERVENTIONS' )
                            res.writeHead( 500, { 'Content-Type': 'text/html; charset=utf-8' } );
                            res.write( '<p>Error retrieving interventions.</p>' );
                        }
                    } else {
                        try {
                            console.log( 'IN INTERVENTION' );
                            const htmlString = await api.getInterventionByCode( query.codigo );
                            res.writeHead( 200, { 'Content-Type': 'text/html; charset=utf-8' } );
                            const title = '<h1>Intervenção</h1>';
                            res.write( title );
                            res.write( htmlString );
                        } catch ( err ) {
                            console.log( 'ERROR INTERVENTION' )
                            res.writeHead( 500, { 'Content-Type': 'text/html; charset=utf-8' } );
                            res.write( '<p>Error retrieving vehicle.</p>' );
                        }
                    }
                    res.end();
                    break;
                default : 
                    res.end();
                    break;
                }
        } else {
            res.statusCode( 405 ).end();
        }
    }).listen( 7777 );

    console.log( 'Server active...' );
}

export { startServer };