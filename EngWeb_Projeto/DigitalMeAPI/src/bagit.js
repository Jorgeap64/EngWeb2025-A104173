const crypto = require( 'crypto' );
const fs = require('fs').promises;

//#region Create bagit functions
module.exports.generateBagitTxt = () => {
	return `BagIt-Version: 0.97\nTag-File-Character-Encoding: UTF-8\n`;
}

module.exports.generateManifestEntryAsync = async ( filePath, name, algorithm ) => {
	if ( !crypto.getHashes().includes( algorithm.toLowerCase() ) ) {
		throw new Error( `Unsupported hash algorithm: ${ algorithm }` );
	}
	const fileBuffer = await fs.readFile( filePath );
	const hashFile = crypto.createHash( algorithm ).update( fileBuffer ).digest( 'hex' );

	return `${ hashFile } ${ name }`;
}

module.exports.generateTagManifestAsync = async ( dip, bagit, algorithm ) => {
	if ( !crypto.getHashes().includes( algorithm.toLowerCase() ) ) {
		throw new Error( `Unsupported hash algorithm: ${ algorithm }` );
	}
	const dipBuffer = Buffer.from( dip, 'utf-8' );
	const bagitBuffer = Buffer.from( bagit, 'utf-8' );
	const hashDip = crypto.createHash( algorithm ).update( dipBuffer ).digest( 'hex' );
	const hashBagit = crypto.createHash( algorithm ).update( bagitBuffer ).digest( 'hex' );
	
	return `${ hashBagit } bagit.txt\n${ hashDip } tagmanifest-${ algorithm }.txt`;
}

//#endregion

//#region Validation functions
module.exports.validateBagitAsync = async ( zip ) => {
	console.log('ZIP entries:', Object.keys(zip.files));
	const bagitFile = zip.file( 'bagit.txt' );
	if ( !bagitFile ) {
		throw new Error( 'Missing bagit.txt file in the archive.' );
	}

	const bagitContent = await bagitFile.async( 'string' );

	const lines = bagitContent.trim().split( '\n' );
	const bagitMetadata = {};
	for (const line of lines) {
	const [key, ...rest] = line.split( ':' );
	if ( key && rest.length > 0 ) {
		bagitMetadata[key.trim()] = rest.join( ':' ).trim();
	}
	}

	if ( bagitMetadata['BagIt-Version'] !== '0.97' || bagitMetadata['Tag-File-Character-Encoding'] !== 'UTF-8' ) {
		throw new Error( 'Invalid or unsupported bagit.txt metadata.' );
	}
}

module.exports.validateManifestAsync = async ( zip ) => {
	// get file
	const manifestFileEntry = Object.keys( zip.files ).find( name =>
		/^manifest-(\w+)\.txt$/.test( name )
	);

	if ( !manifestFileEntry ) {
		throw new Error( 'No manifest-<algorithm>.txt file found in the archive.' );
	}

	const [, algorithm] = manifestFileEntry.match( /^manifest-(\w+)\.txt$/ );

	if ( !crypto.getHashes().includes( algorithm.toLowerCase() ) ) {
		throw new Error( `Unsupported hash algorithm: ${ algorithm }` );
	}

	// read file
	const manifestFile = zip.file( manifestFileEntry );
	const manifestContent = await manifestFile.async( 'string' );

	const manifestEntries = manifestContent.trim().split( '\n' ).map( line => {
		const [hash, ...pathParts] = line.trim().split( /\s+/ );
		return { hash, path: pathParts.join( ' ' ) };
	});

	// validate each entry
	for ( const { hash: expectedHash, path: relativePath } of manifestEntries ) {
		const zipEntry = zip.file( relativePath );
		if ( !zipEntry ) {
			throw new Error( `File listed in manifest not found in ZIP: ${ relativePath }` );
		}

		const fileBuffer = await zipEntry.async( 'nodebuffer' );
		const actualHash = crypto.createHash( algorithm.toLowerCase() ).update( fileBuffer ).digest( 'hex' );

		if ( actualHash !== expectedHash.toLowerCase() ) {
			throw new Error(
				`Hash mismatch for file ${ relativePath }:\nExpected: ${ expectedHash }\nActual: ${ actualHash }`
			);
		}
	}

	return algorithm.toLowerCase();
}

module.exports.validateTagManifestAsync = async ( zip ) => {
	// get file
	const manifestFileEntry = Object.keys( zip.files ).find( name =>
		/^tagmanifest-(\w+)\.txt$/.test( name )
	);

	if ( !manifestFileEntry ) {
		throw new Error( 'No tagmanifest-<algorithm>.txt file found in the archive.' );
	}

	const [, algorithm] = manifestFileEntry.match( /^tagmanifest-(\w+)\.txt$/ );

	if ( !crypto.getHashes().includes( algorithm.toLowerCase() ) ) {
		throw new Error( `Unsupported hash algorithm: ${ algorithm }` );
	}

	// read file
	const manifestFile = zip.file( manifestFileEntry );
	const manifestContent = await manifestFile.async( 'string' );

	const manifestEntries = manifestContent.trim().split( '\n' ).map( line => {
		const [hash, ...pathParts] = line.trim().split( /\s+/ );
		return { hash, path: pathParts.join( ' ' ) };
	});

	// validate each entry
	for ( const { hash: expectedHash, path: relativePath } of manifestEntries ) {
		const zipEntry = zip.file( relativePath );
		if ( !zipEntry ) {
			throw new Error( `File listed in tagmanifest not found in ZIP: ${ relativePath }` );
		}

		const fileBuffer = await zipEntry.async( 'nodebuffer' );
		const actualHash = crypto.createHash( algorithm.toLowerCase() ).update( fileBuffer ).digest( 'hex' );

		if ( actualHash !== expectedHash.toLowerCase() ) {
			throw new Error(
				`Hash mismatch for file ${ relativePath }:\nExpected: ${ expectedHash }\nActual: ${ actualHash }`
			);
		}
	}

	return algorithm.toLowerCase();
}
//#endregion