import path from 'path';
import { exec } from 'child_process';
import { startServer } from './server.js';

const __dirname = decodeURI(import.meta.url.replace("file:///", ""));

/*
=====================
main
=====================
*/
console.log( "__dirname: ", __dirname );
const inputFilePath = path.resolve( __dirname , "../../dataset/db.json" );
//const outputFilePath = path.resolve( __dirname , "../../dataset/normalized.json" );
console.log( 'Getting files...' );

console.log("Input File Path:", inputFilePath);
//console.log("Output File Path:", outputFilePath);

//normalizeJSON( inputFilePath, outputFilePath );
//console.log( 'Normalized JSON' );

// start json-server
const jsonServerCommand = `json-server --watch "${ inputFilePath }"`;
const jsonServerProcess = exec( jsonServerCommand );
console.log( 'Executing json-server...' );

jsonServerProcess.stdout.on( 'data', ( data ) => {
    console.log( 'json-server:', data );
    
    // wait until json-server is ready
    if ( data.includes( 'Watching...' ) ) {
        console.log( 'json-server is ready. Starting server...' );
        startServer();
    }
});
  
// error json-server
jsonServerProcess.stderr.on( 'data' , ( data ) => {
    console.error( 'json-server error:', data );
    // die
    jsonServerProcess.kill();
});