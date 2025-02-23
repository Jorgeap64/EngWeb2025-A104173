import axios from 'axios';

/*
=====================
Alunos
=====================
*/
export async function getAlunos() {
    try {
        const resp = await axios.get( 'http://localhost:3000/alunos' );
        const alunos = resp.data;
        let htmlString = `
          <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8"/>
                    <title>Alunos</title>
                    <link rel="stylesheet" type="text/css" href="w3.css"/>
                </head>
                <body>
                    <div class="w3-card-4">
                        <header class="w3-container w3-purple">
                            <h1>Lista de Alunos</h1>
                        </header>

                        <div class="w3-container">
                            <table class="w3-table-all">
                                <tr>
                                    <th>Alunos:</th>
                                </tr>
                            `;
                            alunos.forEach( aluno => {
                                htmlString += 
                                `<tr>
                                    <td>
                                        <a href="/alunos?id=${ aluno.id }">${ aluno.nome }</a>
                                    </td>
                                </tr>`;
                            });
                            htmlString += `
                            </table>
                        </div>
                    
                        <footer class="w3-container w3-purple">
                            <h5>Generated in EngWeb2025</h5>
                        </footer>
                    </div>
                </body>
            </html>`;

        return htmlString;
    } catch ( error ) {
        console.error( 'Error:', err );
        return '<p>An error occurred while fetching alunos.</p>';
    }
}

export async function getAlunobyId( id ) {
    try {
        const resp = await axios.get(`http://localhost:3000/alunos?id=${ id }`);
        const aluno = resp.data[0];
        let htmlString = `
        <!DOCTYPE html>
          <html>
              <head>
                  <meta charset="UTF-8"/>
                  <title>Aluno #${ id }</title>
                  <link rel="stylesheet" type="text/css" href="w3.css"/>
              </head>
              <body>
                  <div class="w3-card-4">
                      <header class="w3-container w3-purple">
                          <h1>Aluno #${ id }</h1>
                      </header>

                      <div class="w3-container">
                          <ul class="w3-ul">
                          `;
                          htmlString += `<p>ID: ${ aluno.id }</p>`;
                          htmlString += `<p>Name: ${ aluno.nome }</p>`;
                          htmlString += `<p>Data de Nascimentp: ${ aluno.dataNasc }</p>`;
                          htmlString += `<p>Curso: ${ aluno.curso }</p>`;
                          htmlString += `<p>Ano do Curso: ${ aluno.anoCurso }</p>`;
                          htmlString += `<p>Instrumento: ${ aluno.instrumento }</p>`;
                          htmlString += `
                          </ul>
                      </div>
                  
                      <footer class="w3-container w3-purple">
                          <h5>Generated in EngWeb2025</h5>
                      </footer>
                  </div>
              </body>
          </html>`;
        
        return htmlString;
    } catch ( err ) {
        console.error( 'Error:', err );
        return '<p>An error occurred while fetching aluno.</p>';
    }
}


/*
=====================
Cursos
=====================
*/
export async function getCursos() {
    try {
        const resp = await axios.get( 'http://localhost:3000/cursos' );
        const cursos = resp.data;
        let htmlString = `
        <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8"/>
                    <title>Cursos</title>
                    <link rel="stylesheet" type="text/css" href="w3.css"/>
                </head>
                <body>
                    <div class="w3-card-4">
                        <header class="w3-container w3-purple">
                            <h1>Lista de Cursos</h1>
                        </header>

                        <div class="w3-container">
                            <table class="w3-table-all">
                                <tr>
                                    <th>Cursos:</th>
                                </tr>
                            `;
                            cursos.forEach( curso => {
                                htmlString += 
                                `<tr>
                                    <td>
                                        <a href="/cursos?id=${ curso.id }">${ curso.designacao }</a>
                                    </td>
                                </tr>`;
                            });
                            htmlString += `
                            </table>
                        </div>
                    
                        <footer class="w3-container w3-purple">
                            <h5>Generated in EngWeb2025</h5>
                        </footer>
                    </div>
                </body>
            </html>`;

        return htmlString;
    } catch ( error ) {
        console.error( 'Error:', err );
        return '<p>An error occurred while fetching cursos.</p>';
    }
}

export async function getCursoById( id ) {
    try {
        const resp = await axios.get( `http://localhost:3000/cursos?id=${ id }` );
        const curso = resp.data[0];
        let htmlString = `
        <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8"/>
                    <title>Curso ${ curso.designacao }</title>
                    <link rel="stylesheet" type="text/css" href="w3.css"/>
                </head>
                <body>
                    <div class="w3-card-4">
                        <header class="w3-container w3-purple">
                            <h1>Curso ${ curso.designacao }</h1>
                        </header>

                        <div class="w3-container">
                            <ul class="w3-ul">
                            `;
                            htmlString += `<p>ID: ${ curso.id }</p>`
                            htmlString += `<p>Designação: ${ curso.designacao }</p>`
                            htmlString += `<p>Duração: ${ curso.duracao }</p>`
                            htmlString += `<p>Instrumento: ${ curso.instrumento['#text'] }</p>`
                            const respAlunos = await axios.get( `http://localhost:3000/alunos?curso=${ id }` );
                            let alunos = respAlunos.data;
                            htmlString += `
                            <table class="w3-table-all">
                                <tr>
                                    <th>Alunos:</th>
                                </tr>`;
                                alunos.forEach( aluno => {
                                    htmlString +=`
                                    <tr>
                                        <td>
                                            <a href="/alunos?id=${ aluno.id }">${ aluno.nome }</a>
                                        </td>
                                    </tr>`;
                                });
                            htmlString += `
                            </table>
                          </ul>
                      </div>
                      <footer class="w3-container w3-purple">
                          <h5>Generated in EngWeb2025</h5>
                      </footer>
                  </div>
              </body>
          </html>`;
        return htmlString;
    } catch ( err ) {
        console.error( 'Error:', err );
        return '<p>An error occurred while fetching curso.</p>';
    }
}

/*
=====================
intervençoes
=====================
*/
export async function getInstrumentos() {
    try {
        const resp = await axios.get( 'http://localhost:3000/instrumentos' );
        const instrumentos = resp.data;
        let htmlString = `
        <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8"/>
                    <title>Instrumentos</title>
                    <link rel="stylesheet" type="text/css" href="w3.css"/>
                </head>
                <body>
                    <div class="w3-card-4">
                        <header class="w3-container w3-purple">
                            <h1>Lista de Cursos</h1>
                        </header>

                        <div class="w3-container">
                            <table class="w3-table-all">
                                <tr>
                                    <th>Instrumentos:</th>
                                </tr>
                            `;
                            instrumentos.forEach( instrumento => {
                                htmlString += 
                                `<tr>
                                    <td>
                                        <a href="/instrumentos?id=${ instrumento.id }">${ instrumento[ '#text' ] }</a>
                                    </td>
                                </tr>`;
                            });
                            htmlString += `
                            </table>
                        </div>
                    
                        <footer class="w3-container w3-purple">
                            <h5>Generated in EngWeb2025</h5>
                        </footer>
                    </div>
                </body>
            </html>`;

        return htmlString;
    } catch ( error ) {
        console.error( 'Error:', err );
        return '<p>An error occurred while fetching instrumentos.</p>';
    }
}

export async function getInstrumentoById( id ) {
    try {
        const resp = await axios.get( `http://localhost:3000/instrumentos?id=${ id }` );
        const instrumento = resp.data[0];
        let htmlString = `
        <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8"/>
                    <title>Instrumento ${ instrumento['#text'] }</title>
                    <link rel="stylesheet" type="text/css" href="w3.css"/>
                </head>
                <body>
                    <div class="w3-card-4">
                        <header class="w3-container w3-purple">
                            <h1>Instrumento ${ instrumento['#text'] }</h1>
                        </header>

                        <div class="w3-container">
                            <ul class="w3-ul">
                            `;
                            htmlString += `<p>ID: ${ instrumento.id }</p>`
                            htmlString += `<p>Nome: ${ instrumento['#text'] }</p>`
                            const respAlunos = await axios.get( `http://localhost:3000/alunos?instrumento.id=${ id }` );
                            let alunos = respAlunos.data;
                            htmlString += `
                            <table class="w3-table-all">
                                <tr>
                                    <th>Alunos:</th>
                                </tr>`;
                                alunos.forEach( aluno => {
                                    htmlString +=`
                                    <tr>
                                        <td>
                                            <a href="/alunos?id=${ aluno.id }">${ aluno.nome }</a>
                                        </td>
                                    </tr>`;
                                });
                            htmlString += `
                            </table>
                          </ul>
                      </div>
                      <footer class="w3-container w3-purple">
                          <h5>Generated in EngWeb2025</h5>
                      </footer>
                  </div>
              </body>
          </html>`;
        return htmlString;
    } catch ( err ) {
        console.error( 'Error:', err );
        return '<p>An error occurred while fetching instrumento.</p>';
    }
}
