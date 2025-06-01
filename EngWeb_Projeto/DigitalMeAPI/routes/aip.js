var express = require('express');
var router = express.Router();
var Aip = require('../controllers/aip');
var User = require('../controllers/user');
var multer = require('multer');
var fs = require('fs');
var jszip = require('jszip');
var xml2js = require('xml2js')
const path = require('path');
const archiver = require('archiver');
const bagit = require( '../src/bagit' );

var upload = multer({dest: 'upload/'});

var Auth = require('../auth/auth');

router.get('/', Auth.validateAdmin, function(req, res, next) {
  Aip.findAll()
    .then(data => {
        res.status(200).jsonp({ data });
    })
    .catch(error => {
      console.error(error);
      res.status(500).jsonp({ error });
    });
});

router.delete('/:id', Auth.validateUser, function(req, res, next) {
  if (req.admin) {
    Aip.deleteById(req.params.id)
      .then(data => {
          res.status(200).jsonp({ data });
      })
      .catch(error => {
        console.error(error);
        res.status(500).jsonp({ error });
      });
  } else {
    Aip.deleteByIdOwnedByUser(req.params.id, req.userID)
      .then(data => {
          res.status(200).jsonp({ data });
      })
      .catch(error => {
        console.error(error);
        res.status(500).jsonp({ error });
      });
  }
});

router.put('/:id', Auth.validateUser, function(req, res, next) {
  if (req.admin) {
    Aip.putById(req.params.id)
      .then(data => {
          res.status(200).jsonp({ data });
      })
      .catch(error => {
        console.error(error);
        res.status(500).jsonp({ error });
      });
  } else {
    Aip.putByIdOwnedByUser(req.params.id, req.userID)
      .then(data => {
          res.status(200).jsonp({ data });
      })
      .catch(error => {
        console.error(error);
        res.status(500).jsonp({ error });
      });
  }
});

router.get('/public', async function (req, res, next) {
  const pageNum = parseInt(req.query.page) || 1;
  const category = req.query.category || '';

  try {
    const { results, totalPages } = await Aip.findAllPublic(pageNum, category);
    const enrichedData = [];
    for (const entry of results) {
      const filePath = path.join(__dirname, '..', 'fileStore', entry.sender_id, `${entry.originalName}.${entry.mimetype}`);
      try {
        const fileContent = await fs.promises.readFile(filePath);
        enrichedData.push({
          ...entry.toObject(),
          content: fileContent.toString('base64')
        });
      } catch (err) {
        console.warn(`Could not read file for AIP ${entry._id}:`, err.message);
        enrichedData.push({
          ...entry.toObject(),
          content: null,
          error: 'File not found or unreadable'
        });
      }
    }

    res.status(200).jsonp({
      data: enrichedData,
      totalPages
    });
  } catch (error) {
    console.error(error);
    res.status(500).jsonp({ error });
  }
});

router.get('/private', Auth.validateUser, async function (req, res, next) {
  const pageNum = parseInt(req.query.page) || 1;
  const category = req.query.category || '';

  try {
    const { results, totalPages } = await Aip.findAllPrivateUser(pageNum, req.userID, category);
    const enrichedData = [];

    for (const entry of results) {
      const filePath = path.join(__dirname, '..', 'fileStore', entry.sender_id, `${entry.originalName}.${entry.mimetype}`);
      try {
        const fileContent = await fs.promises.readFile(filePath);
        enrichedData.push({
          ...entry.toObject(),
          content: fileContent.toString('base64')
        });
      } catch (err) {
        console.warn(`Could not read file for AIP ${entry._id}:`, err.message);
        enrichedData.push({
          ...entry.toObject(),
          content: null,
          error: 'File not found or unreadable'
        });
      }
    }

    res.status(200).jsonp({
      data: enrichedData,
      totalPages
    });
  } catch (error) {
    console.error(error);
    res.status(500).jsonp({ error });
  }
});

router.get('/privateAdmin', Auth.validateAdmin, async function (req, res, next) {
  const pageNum = parseInt(req.query.page) || 1;
  const category = req.query.category || '';

  try {
    const { results, totalPages } = await Aip.findAll(pageNum, category);
    const numUsers = await User.countUsers();
    const numArchives = await Aip.countAips();
    const enrichedData = [];

    for (const entry of results) {
      const filePath = path.join(__dirname, '..', 'fileStore', entry.sender_id, `${entry.originalName}.${entry.mimetype}`);
      try {
        const fileContent = await fs.promises.readFile(filePath);
        enrichedData.push({
          ...entry.toObject(),
          content: fileContent.toString('base64')
        });
      } catch (err) {
        console.warn(`Could not read file for AIP ${entry._id}:`, err.message);
        enrichedData.push({
          ...entry.toObject(),
          content: null,
          error: 'File not found or unreadable'
        });
      }
    }

    res.status(200).jsonp({
      data: enrichedData,
      numUsers,
      numArchives,
      totalPages
    });
  } catch (error) {
    console.error(error);
    res.status(500).jsonp({ error });
  }
});

router.get( '/download/:id', async function( req, res ) {
	try {
		const aip = await Aip.findById( req.params.id );
		console.log( 'AIP to download:', aip );
		// Check permissions if user is not admin
		// if ( !req.admin && aip.producer_id !== req.userID ) {
		// 	return res.status( 403 ).json({ error: 'Unauthorized' });
		// }

		const filePath = path.join( __dirname, '..', 'fileStore', aip.sender_id, `${ aip.originalName }.${ aip.mimetype }`);

		// Set ZIP filename
		const now = new Date();
		const timestamp = now.toISOString().replace( /[:.]/g, '-' );
		const zipName = `${aip.originalName}_archive_${ timestamp }.zip`;

		res.setHeader( 'Content-Disposition', `attachment; filename="${ zipName }"` );
		res.setHeader( 'Content-Type', 'application/zip' );

		const archive = archiver( 'zip', { zlib: { level: 9 } } );
		archive.pipe(res);

		const dipXML = `
		<dip>
			<metadata>
				<originalName>${aip.originalName}</originalName>
				<mimetype>${aip.mimetype}</mimetype>
				<category>${aip.category}</category>
				<creationDate>${aip.creation_date}</creationDate>
				<submissionDate>${aip.submission_date}</submissionDate>
				<downloadDate>${now.toISOString()}</downloadDate>
				<producerID>${aip.producer_id}</producerID>
				<senderID>${aip.sender_id}</senderID>
				<public>${aip.public}</public>
			</metadata>
		</dip>`.trim();

		const dipBuffer = Buffer.from( dipXML, 'utf-8' );
		const bagitBuffer = Buffer.from( bagit.generateBagitTxt(), 'utf-8' );

		// Add file to ZIP
		archive.file( filePath, { name: `${ aip.originalName }.${ aip.mimetype }` } );
		
		// add manifest
		archive.append( await bagit.generateManifestEntryAsync( filePath, `${ aip.originalName}.${ aip.mimetype }`, aip.hashManifest ), { name: `manifest-${ aip.hashManifest }.txt` } );

		// add tagmanifest
		archive.append( await bagit.generateTagManifestAsync( dipBuffer, bagitBuffer, aip.hashTag ), { name: `tagmanifest-${ aip.hashTag }.txt` } );
		
		// add bagit.txt
		archive.append( bagitBuffer, { name: 'bagit.txt' } );

		// Add manifesto-DIP.xml
		archive.append( dipBuffer, { name: 'manifesto-DIP.xml' } );

		// Finalize the ZIP
		await archive.finalize();
	} catch ( err ) {
		console.error( err );
		res.status( 500 ).json( { error: 'Failed to generate archive' } );
	}
});

router.post('/', upload.single('file'), Auth.validateUser, async function (req, res, next) {
  const oldPath = __dirname + '/../' + req.file.path;
  console.log('Uploaded ZIP path:', oldPath);
  
  const user = await User.findUserByID(req.userID)
  try {
    const zipData = fs.readFileSync(oldPath);
    const zip = await jszip.loadAsync(zipData);

    // check and validate bagit.txt exists
    await bagit.validateBagitAsync( zip );

    // validate tagmanifest
    const hashTag = await bagit.validateTagManifestAsync( zip );

    // validate manifest
    const hashManifest = await bagit.validateManifestAsync( zip );

    // laod manifesto-SIP.xml
    const xmlContent = await zip.file('manifesto-SIP.xml').async('string');
    const parser = new xml2js.Parser({ explicitArray: false });

    parser.parseString(xmlContent, async (err, result) => {
      if (err) return res.status(500).jsonp({ error: 'Failed to parse XML', details: err });

      const senderID = user.username;
      let files = result.sip.metadata.files.file;

      // Ensure it's always an array
      if (!Array.isArray(files)) files = [files];

      const savedEntries = [];

      for (const fileMeta of files) {
        const title = fileMeta.title;
        const mimetype = fileMeta.mimetype;
        const contentFileName = `${title}.${mimetype}`;
        const producerID = fileMeta.producerID;

        const contentFile = zip.file(contentFileName);
        if (!contentFile) {
          console.warn(`Skipping missing file: ${contentFileName}`);
          continue; // or collect error if preferred
        }

        const contentData = await contentFile.async('nodebuffer');
        const dir = `${__dirname}/../fileStore/${senderID}`;
        const newPath = `${dir}/${contentFileName}`;

        await fs.promises.mkdir(dir, { recursive: true });
        await fs.promises.writeFile(newPath, contentData);

        const aip = {
          creation_date: fileMeta.creationDate,
          submission_date: new Date(),
          producer_id: producerID,
          sender_id: senderID,
          originalName: title,
          public: fileMeta.public === 'true',
          mimetype: mimetype,
          category: fileMeta.category,
          hashManifest: hashManifest,
          hashTag: hashTag
        };

        const saved = await Aip.save(aip);
        savedEntries.push(saved);
      }

      // Delete the uploaded zip file
      fs.unlinkSync(oldPath);

      if (savedEntries.length === 0) {
        res.status(400).jsonp({ error: 'No valid files were saved from the archive.' });
      } else {
        res.status(200).jsonp(savedEntries);
      }
    });
  } catch (zipErr) {
    console.error('Error handling ZIP:', zipErr);
    res.status(500).jsonp({ error: 'Error processing ZIP', details: zipErr });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const cats = await Aip.findAllCategories();
    res.json(cats);
  } catch (err) {
    res.status(500).send('Error retrieving categories');
  }
});

module.exports = router;