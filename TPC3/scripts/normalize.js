import * as fsp from "fs/promises";

async function normalizeJSON( inputFilePath, outputFilePath ) {
  try {
    const fileData = await fsp.readFile( inputFilePath, { encoding: "utf8" } );
    const dataset = JSON.parse( fileData );

    const newDataset = {
      reparacoes: [],
      intervencoes: [],
      viaturas: []
    };

    const nifSet = new Set();
    const interSet = new Set();

    for ( const i in dataset.reparacoes ) {
      const rep = dataset.reparacoes[i];

      if ( nifSet.has(rep.nif) ) {
        console.warn(`NIF already processed: ${ rep.nif }.`);
        continue;
      }
      nifSet.add( rep.nif );

      if ( rep.viatura ) {
        const veiculo = rep.viatura;
        veiculo.reparacoesId = i;
        newDataset.viaturas.push( veiculo );
      }

      if ( rep.intervencoes ) {
        for ( const interv of rep.intervencoes ) {
          if ( interSet.has( interv.codigo ) ) continue;
          newDataset.intervencoes.push( { ...interv } );
          interSet.add( interv.codigo );
        }
      }

      const intervs = rep.intervencoes ? rep.intervencoes.map( interv => interv.codigo ) : [];

      // Remove nested properties to avoid duplication
      delete rep.viatura;
      delete rep.intervencoes;

      rep.id = i;
      rep.intervencoes = intervs;
      newDataset.reparacoes.push( rep );
    }

    newDataset.intervencoes.sort( ( a, b ) => a.codigo.localeCompare( b.codigo ) );

    await fsp.writeFile( outputFilePath, JSON.stringify( newDataset, null, 2 ), { encoding: "utf8" } );
    console.log(`Normalized JSON data written to ${outputFilePath}`);
  } catch ( error ) {
    console.error( "Error processing file:", error );
  }
}

export { normalizeJSON };