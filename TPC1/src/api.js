import axios from 'axios';

/*
=====================
reparaçoes
=====================
*/
export async function getRepairs() {
    try {
        const resp = await axios.get('http://localhost:3000/reparacoes');
        const repairs = resp.data;
        let htmlString = '<ul>';
        repairs.forEach( repair => {
            htmlString += `<li><a href="/reparacoes?nome=${repair.nome}">${repair.nome}</a></li>`;
        });
        htmlString += '</ul>';
        return htmlString;
    } catch ( err ) {
        console.error('Error:', err);
        return '<p>An error occurred while fetching repairs.</p>';
    }
}

export async function getRepairByName( name ) {
    try {
        const resp = await axios.get(`http://localhost:3000/reparacoes?nome=${ name }`);
        const repair = resp.data[0];
        let htmlString = '<div>';
        htmlString += `<p>Name: ${ repair.nome }</p>`
        htmlString += `<p>ID: ${ repair.id }</p>`
        htmlString += `<p>Nif: ${ repair.nif }</div>`
        htmlString += `<p>Data: ${ repair.data }</div>`
        htmlString += `<p>Viatura: ${ repair.viatura }</div>`
        htmlString += `<p>Número de Intervenções: ${ repair.nr_intervencoes }</div>`
        htmlString += `<p>Intervenções: ${ repair.intervencoes }</div>`
        htmlString += '</div>';
        return htmlString;
    } catch ( err ) {
        console.error( 'Error:', err );
        return '<p>An error occurred while fetching repairs.</p>';
    }
}


/*
=====================
viaturas
=====================
*/
export async function getVehicles() {
    try {
        const resp = await axios.get( 'http://localhost:3000/viaturas' );
        const vehicles = resp.data;
        let htmlString = '<ul>';
        vehicles.forEach( vehicle => {
            htmlString += `<li><a href="/viaturas?matricula=${ vehicle.matricula }">${ vehicle.matricula }</a></li>`;
        });
        htmlString += '</ul>';
        return htmlString;
    } catch ( err ) {
        console.error( 'Error:', err );
        return '<p>An error occurred while fetching vehicles.</p>';
    }
}

export async function getVehicleByRegistration( registration ) {
    try {
        const resp = await axios.get( `http://localhost:3000/viaturas?matricula=${ registration }` );
        const vehicle = resp.data[0];
        let htmlString = '<div>';
        htmlString += `<p>Marca: ${ vehicle.marca }</p>`
        htmlString += `<p>Modelo: ${ vehicle.modelo }</div>`
        htmlString += `<p>Matricula: ${ vehicle.matricula }</div>`
        htmlString += `<p>Reparações ID: ${ vehicle.reparacoesId }</div>`
        htmlString += '</div>';
        return htmlString;
    } catch ( err ) {
        console.error( 'Error:', err );
        return '<p>An error occurred while fetching vehicles.</p>';
    }
}

/*
=====================
intervençoes
=====================
*/
export async function getInterventions() {
    try {
        const resp = await axios.get( 'http://localhost:3000/intervencoes' );
        const interventions = resp.data;
        let htmlString = '<ul>';
        interventions.forEach( intervention => {
            htmlString += `<li><a href="/intervencoes?codigo=${ intervention.codigo }">${ intervention.codigo }</a></li>`;
        });
        htmlString += '</ul>';
        return htmlString;
    } catch ( err ) {
        console.error( 'Error:', err );
        return '<p>An error occurred while fetching interventions.</p>';
    }
}

export async function getInterventionByCode( code ) {
    try {
        const resp = await axios.get(`http://localhost:3000/intervencoes?codigo=${ code }`);
        const intervention = resp.data[0];
        let htmlString = '<div>';
        htmlString += `<p>Código: ${ intervention.codigo }</p>`
        htmlString += `<p>Nome: ${ intervention.nome }</div>`
        htmlString += `<p>Descrição: ${ intervention.descricao }</div>`
        htmlString += '</div>';
        return htmlString;
    } catch ( err ) {
        console.error( 'Error:', err );
        return '<p>An error occurred while fetching intervention.</p>';
    }
}