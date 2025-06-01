# EngWeb-Project
## Índice
1. [Introdução](#introdução)
2. [DigitalMe API](#digitalme-api)<br>
   - [Rotas para Arquivos AIP (`routes/aip.js`)](#rotas-para-arquivos-aip-routesaipjs)<br>
      - [Processamento de Arquivos ZIP e Validação BagIt](#processamento-de-arquivos-zip-e-validação-bagit)<br>
      - [Paginação e Filtros](#paginação-e-filtros)<br>
   - [Rotas dos Utilizadores (`routes/user.js`)](#rotas-dos-utilizadores-routesuserjs)<br>
      - [Implementação da Autenticação Social](#implementação-da-autenticação-social)<br>
      - [Segurança e Autenticação](#segurança-e-autenticação)
3. [DigitalMe Web App](#digitalme-web-app)
4. [Conclusão](#conclusão)


## Introdução

Este relatório descreve o desenvolvimento e a implementação de um projeto baseado na arquitetura de microserviços, composto por uma **API REST** construída com **Express.js**, uma aplicação web e uma base de dados **MongoDB**. Para facilitar a orquestração e a gestão destes componentes, foi utilizado o **Docker Compose**, permitindo a execução dos serviços em containers isolados e garantindo uma maior portabilidade, escalabilidade e facilidade de implantação.

O objetivo principal deste projeto é demonstrar a integração entre os diferentes serviços, assegurando uma comunicação eficiente e segura, ao mesmo tempo que se tira partido das vantagens oferecidas pelas tecnologias escolhidas, nomeadamente a simplicidade do framework Express para desenvolvimento backend, a flexibilidade do MongoDB como base de dados NoSQL, e a facilidade de gestão e distribuição providenciada pelo Docker.

No decorrer do relatório, serão detalhados os aspetos técnicos do projeto, a estrutura da aplicação, o processo de configuração dos containers e a forma como os diferentes componentes interagem para formar um sistema coeso e funcional.

## DigitalMe API

A API desenvolvida destina-se à gestão de Arquivos de Informação Permanente (AIP), suportando operações de criação, leitura, atualização, eliminação e download dos arquivos, bem como a autenticação e autorização dos utilizadores. A API está construída em Node.js com Express, utilizando MongoDB para persistência e suporta múltiplos tipos de utilizadores com diferentes níveis de acesso (administrador e utilizador comum).

### Estrutura das Rotas

As rotas da API estão organizadas em módulos, nomeadamente `aip.js` para gestão dos arquivos e `user.js` para gestão dos utilizadores e autenticação. A seguir, são descritas as principais rotas da API relacionadas com os AIPs:

### Rotas para Arquivos AIP (`routes/aip.js`)

- **GET `/aip/`**  
  Recupera todos os arquivos AIP existentes. Esta rota é protegida e apenas acessível a administradores (`Auth.validateAdmin`).

- **GET `/aip/public`**  
  Permite o acesso público paginado aos arquivos AIP com filtro opcional por categoria. Os arquivos retornados incluem metadados e o conteúdo codificado em base64.

- **GET `/aip/private`**  
  Retorna os arquivos privados de um utilizador autenticado, suportando paginação e filtro por categoria.

- **GET `/aip/privateAdmin`**  
  Similar à rota anterior, porém destinada a administradores, retorna todos os arquivos com estatísticas adicionais (número de utilizadores e arquivos).

- **POST `/aip/`**  
  Permite a submissão de um arquivo ZIP que deve conter um arquivo `bagit.txt` válido, manifestos e um ficheiro XML `manifesto-SIP.xml` para metadados. Após validação, os ficheiros são extraídos, armazenados no servidor e as informações guardadas na base de dados. Requer autenticação de utilizador.

- **DELETE `/aip/:id`**  
  Apaga um arquivo AIP identificado pelo ID. Administradores podem apagar qualquer arquivo; utilizadores só podem apagar os seus próprios.

- **PUT `/aip/:id`**  
  Atualiza os metadados de um arquivo AIP específico, com controle de acesso igual ao DELETE.

- **GET `/aip/download/:id`**  
  Permite o download do arquivo AIP em formato ZIP, contendo o arquivo original, manifestos, ficheiro bagit.txt e um ficheiro XML com metadados do DIP. Requer controle de acesso (comentado, mas previsto para implementação).

- **GET `/aip/categories`**  
  Retorna a lista de categorias disponíveis para os arquivos AIP.

#### Processamento de Arquivos ZIP e Validação BagIt
A norma [BagIt](https://datatracker.ietf.org/doc/html/rfc8493), é uma especificação para a embalagem de conteúdo digital em "bags", ou seja, diretórios ou arquivos compactados contendo dados e os respetivos metadados de verificação de integridade. Cada bag inclui:

- Um ou mais ficheiros de dados;
- Um ficheiro `bagit.txt` com a versão da especificação;
- Um ou mais ficheiros (`manifest-*.txt`) com os hashes dos ficheiros de dados;
- Um ficheiro tag (`tagmanifest-*.txt`) para verificação de ficheiros de metadados;
- Um ficheiro `manifesto-SIP.xml` ou `manifesto-DIP.xml`, conforme o pacote, que contém os metadados dos ficheiros da bag.

#### Ingestão (Validação de um SIP com BagIt)

Durante o upload (`POST /aip`), um ficheiro ZIP contendo uma estrutura BagIt é submetido e validado:

1. **Validação de `bagit.txt`**
   - Verifica se a versão e a codificação estão corretas.

2. **Validação de `manifest-<alg>.txt`**
   - Cada ficheiro de dados é verificado quanto ao seu hash.

3. **Validação de `tagmanifest-<alg>.txt`**
   - Os ficheiros `bagit.txt` e `manifesto-SIP.xml` são verificados quanto ao seus hashs.

4. **Leitura de `manifesto-SIP.xml`**
   - O conteúdo XML é analisado para extrair metadados e instruções de armazenamento que serão guardados na mongo.

5. **Armazenamento**
   - Os ficheiros válidos são extraídos e guardados em `fileStore/{senderID}`.

#### Disseminação (Geração de um DIP com BagIt)

No processo de download (`GET /aip/download/:id`), é gerado um arquivo `.zip` estruturado conforme BagIt:

1. **Ficheiro de Dados**
   - Inclui o ficheiro original submetido pelo utilizador.

2. **`bagit.txt`**
   - Gerado com conteúdo fixo:
     ```
     BagIt-Version: 0.97
     Tag-File-Character-Encoding: UTF-8
     ```

3. **`manifest-<algoritmo>.txt`**
   - Contém o hash (e.g. SHA-256) do ficheiro de dados, ex.:
     ```
     a2b4c6... yourfile.pdf
     ```

4. **`tagmanifest-<algoritmo>.txt`**
   - Contém os hashes de `bagit.txt` e do ficheiro `manisfesto-DIP.xml`.

5. **`manisfesto-DIP.xml`**
   - Documento XML com os metadados do ficheiro (nome, mimetype, categoria, datas, etc).

A verificação de integridade é realizada com base em algoritmos de hashing, como SHA-256. Estes garantem que quaisquer alterações nos ficheiros serão detetadas durante a validação, evitando corrupção ou manipulação maliciosa dos dados.

#### Paginação e Filtros

As rotas públicas e privadas para listagem de arquivos suportam paginação (`page` query parameter) e filtragem por categoria (`category` query parameter). Isso permite otimizar a apresentação dos dados e controlar o volume de informação trafegada.

### Rotas dos Utilizadores (`routes/user.js`)

- **GET `/user/`**  
  Retorna a lista completa de utilizadores, bem como estatísticas como o número total de utilizadores e arquivos AIP existentes. Esta rota é protegida e acessível apenas a administradores (`Auth.validateAdmin`).

- **GET `/user/:id`**  
  Obtém os detalhes de um utilizador específico pelo seu ID. Também protegida e apenas para administradores.

- **PUT `/user/:id`**  
  Permite a atualização dos dados de um utilizador (username, nome, email). Apenas administradores podem realizar esta operação.

- **DELETE `/user/:id`**  
  Remove um utilizador do sistema pelo ID. Exclusivo para administradores.

- **POST `/user/register`**  
  Regista um novo utilizador com os dados enviados (username, email, nome, password, flag de administrador opcional). O password é tratado de forma segura pelo modelo `userModel.register`.

- **POST `/user/login`**  
  Efetua o login local usando autenticação via `passport-local`. Em caso de sucesso, gera e devolve um token JWT com uma validade de 1 hora.

- **GET `/user/auth/google`**  
  Inicia o fluxo de autenticação OAuth 2.0 com o Google para login social.

- **GET `/user/auth/google/callback`**  
  Endpoint callback para o Google após autenticação. Cria/utiliza utilizador existente e devolve um token JWT, redirecionando para o frontend com o token.

- **GET `/user/auth/facebook`**  
  Inicia o fluxo de autenticação OAuth 2.0 com o Facebook para login social.

- **GET `/user/auth/facebook/callback`**  
  Endpoint callback para o Facebook após autenticação. Similar ao Google, cria/utiliza utilizador existente, devolve token JWT e redireciona.

#### Implementação da Autenticação Social

A API utiliza `passport.js` com estratégias específicas para Google e Facebook:

- **GoogleStrategy**  
  - Configurada com `clientID`, `clientSecret` e `callbackURL`.  
  - Ao autenticar, procura o utilizador pelo `googleId` na base de dados. Se não existir, cria um novo registo com os dados do perfil.  
  - Após sucesso, executa o `done()` para continuar o fluxo de autenticação.

- **FacebookStrategy**  
  - Configurada de forma semelhante, utilizando `facebookId`.  
  - Também cria novo utilizador se não existir e prossegue com o fluxo.

#### Segurança e Autenticação

A autenticação baseia-se num sistema personalizado implementado em `auth/auth.js`, que verifica se o utilizador é administrador (`req.admin`) ou utilizador comum autenticado (`req.userID`). Para rotas sensíveis, é feita a validação do nível de acesso. A API suporta ainda autenticação via OAuth com Google e Facebook, utilizando `passport.js`, permitindo login social seguro.

## DigitalMe Web App

A aplicação web desenvolvida destina-se a servir de interface gráfica para interagir com a **DigitalMe API**, permitindo que utilizadores registados façam autenticação, naveguem pelos ficheiros públicos, gerenciem o seu próprio repositório de AIPs (Arquivos de Informação Permanente) e, em caso de administradores, acedam a funcionalidades adicionais de gestão. A Web App está construída em **Node.js** com **Express**, utiliza **Pug** como motor de templates e armazena ficheiros temporariamente com **multer** antes de enviá-los à API. A autenticação baseia-se em **JWT** guardados em cookies HTTP-only.


### Estrutura das Rotas

As rotas da Web App estão organizadas em dois principais módulos: `routes/index.js` (rotas públicas e de dashboard) e `routes/users.js` (registo, login e logout). Abaixo, descrevem-se as rotas mais relevantes:

#### Rotas Públicas (`routes/index.js`)

- **GET `/`**  
  Lista os arquivos AIP públicos (consome `GET http://digitalme-api:7777/aip/public?page=&category=`). Os utilizadores não autenticados visualizam os links “Login” e “Register”.  
  - Query parameters suportados:  
    - `page` (número da página, para paginação)  
    - `category` (filtra por categoria)

- **GET `/login`**  
  Exibe o formulário de entrada (login). Se o utilizador já tiver um token válido, é redirecionado para `/dashboard`.

- **POST `/login`**  
  Recebe credenciais (username/email e password) e faz `POST http://digitalme-api:7777/user/login`. Em caso de sucesso, guarda o JWT devolvido como cookie HTTP-only (`token`) e redireciona:  
  - Se o token indicar `"admin": true`, redireciona para `/adminDashboard`  
  - Caso contrário, para `/dashboard`

- **GET `/register`**  
  Exibe o formulário de registo. Se o utilizador já estiver autenticado, redireciona para `/dashboard`.

- **POST `/register`**  
  Envia dados de registo (`username`, `name`, `email`, `password`, opção de `"admin": false/true`) para `POST http://digitalme-api:7777/user/register`. Se o registo for bem-sucedido, o token é armazenado como cookie e redireciona para `/dashboard`.

- **GET `/logout`**  
  Limpa o cookie JWT (`res.clearCookie('token')`) e redireciona para `/`.  

#### Rotas de Dashboard (Utilizadores Autenticados)

Estas rotas usam o middleware `ensureAuthenticated` (em `middleware/auth.js`) para verificar se há um cookie `token` válido. Se o token faltar ou for inválido, redireciona para `/login`.

- **GET `/dashboard`**  
  Exibe a página de dashboard do utilizador comum, listando os seus AIPs privados (consome `GET http://digitalme-api:7777/aip/private?page=&category=`).  
  Funcionalidades incluídas:  
  - **Eliminar arquivo**: chama `GET /dashboard/delete/:id`  
  - **Toggle de visibilidade**: chama `GET /dashboard/toggle/:id` (envia `PUT http://digitalme-api:7777/aip/:id`)  
  - **Download de arquivo**: chama `GET /dashboard/download/:id` (faz GET a `http://digitalme-api:7777/aip/download/:id` com `responseType: stream`)  
  - **Upload de novo AIP**: formulário `multipart/form-data` em `POST /dashboard/upload`

- **GET `/dashboard/delete/:id`**  
  Elimina um AIP do utilizador autenticado. Implementa `DELETE http://digitalme-api:7777/aip/:id` (cabeçalho `Authorization: Bearer <token>`). Redireciona de volta a `/dashboard?page=…`.

- **GET `/dashboard/toggle/:id`**  
  Alterna entre público/privado o AIP especificado. Envia `PUT http://digitalme-api:7777/aip/:id` (cabeçalho `Authorization`). Redireciona para `/dashboard?page=…`.

- **GET `/dashboard/download/:id`**  
  Descarrega o ZIP do AIP.

- **POST `/dashboard/upload`**
Upload de um novo ficheiro ZIP (deve conter a estrutura BagIt). 

**POST `/dashboard/upload`**

Upload de um novo ficheiro ZIP (deve conter a estrutura BagIt). Utiliza `multer({ dest: 'uploads/' })` para guardar temporariamente em `uploads/<nome_tmp>`.


## Rotas de Administração (`routes/index.js`)

Estas rotas usam o middleware `ensureAuthenticatedAdmin` (em `middleware/auth.js`), que além de verificar o token, confirma que `decodedToken.admin === true`. Caso contrário, redireciona para `/`.

### GET `/adminDashboard`

Exibe a área de administração geral, listando todos os AIPs (públicos e privados) e mostrando estatísticas (total de arquivos e total de utilizadores). Consome ```GET http://digitalme-api:7777/aip/privateAdmin?page=&category=```

Funcionalidades incluídas:

- **Eliminar qualquer arquivo**  

- **Toggle de visibilidade de qualquer arquivo**  

- **Download de qualquer arquivo**  

- **Link para `/adminUsers`** (gestão de utilizadores)


**GET `/adminDashboard/delete/:id`**

Elimina um AIP no contexto administrativo. Chama:
```DELETE http://digitalme-api:7777/aip/:id```
com o token de admin. Redireciona para `/adminDashboard?page=…`.


**GET `/adminDashboard/toggle/:id`**

Alterna visibilidade de qualquer AIP. Chama:
```PUT http://digitalme-api:7777/aip/:id```
Redireciona para `/adminDashboard?page=…`.


**GET `/adminDashboard/download/:id`**

Igual ao download de dashboard de utilizador, mas para qualquer arquivo. Usa-se o mesmo padrão de streaming:


**GET `/adminUsers`**

Lista todos os utilizadores registados (consome algo como `GET http://digitalme-api:7777/user?page=&limit=`). Exibe colunas:

- **Username**
- **Name**
- **Email**
- **Data de Criação**

Botão “Ver Detalhes” redireciona para `/adminUsers/view/:id`.


### GET `/adminUsers/view/:id`

Exibe detalhe de um utilizador específico:

- **Username**
- **Nome**
- **Email**
- **Data de criação**
- **Número de AIPs associados** (obtido via contacto à API ou variável enviada pelo endpoint `/user/:id`)


## Middlewares e Segurança

### `middleware/auth.js`

#### `ensureAuthenticated(req, res, next)`

1. Lê `req.cookies.token`.
2. Se faltar ou inválido (JWT inválido/expirado), redireciona para `/login`.
3. Decodifica o token usando _secret_ (por defeito `'digitalMeKey'`), popula `req.userID` e `req.admin` (booleano), e chama `next()`.

#### `ensureAuthenticatedAdmin(req, res, next)`

1. Usa `ensureAuthenticated` para validar o token.
2. Verifica se `req.admin === true`.
3. Se não for admin, redireciona para `/`. Caso contrário, chama `next()`.

#### `redirectIfAuthenticated(req, res, next)`

1. Lê `req.cookies.token`.
2. Se válido, redireciona para `/dashboard` (ou `/adminDashboard`, se for admin).
3. Caso contrário, chama `next()` para continuar no fluxo de login/register.


## Comunicação com a API

A Web App comunica com a API através de **axios**, definindo sempre o cabeçalho de autorização quando necessário:

**Listagem de AIPs Públicos**
```js
const response = await axios.get(
  `http://digitalme-api:7777/aip/public?page=${page}&category=${category}`
);
```

**Listagem de AIPs Privados (Utilizador)**
```js
const token = req.cookies.token;
const response = await axios.get(
  `http://digitalme-api:7777/aip/private?page=${page}&category=${category}`,
  { headers: { Authorization: `Bearer ${token}` } }
);
```

**Listagem de AIPs (Admin)**
```js
const token = req.cookies.token;
const response = await axios.get(
  `http://digitalme-api:7777/aip/privateAdmin?page=${page}&category=${category}`,
  { headers: { Authorization: `Bearer ${token}` } }
);
```


**Eliminar AIP**
```js
await axios.delete(
  `http://digitalme-api:7777/aip/${archiveId}`,
  { headers: { Authorization: `Bearer ${token}` } }
);
```

**Toggle Visibilidade**
```js
await axios.put(
  `http://digitalme-api:7777/aip/${archiveId}`,
  {},
  { headers: { Authorization: `Bearer ${token}` } }
);
```

**Download de AIP**
```js
const response = await axios.get(
  `http://digitalme-api:7777/aip/download/${archiveId}`,
  {
    responseType: 'stream',
    headers: { Authorization: `Bearer ${token}` },
  }
);
res.setHeader(
  'Content-Disposition',
  response.headers['content-disposition']
);
response.data.pipe(res);
```

**Upload de AIP**
```js
const form = new FormData();
form.append(
  'file',
  fs.createReadStream(req.file.path),
  req.file.originalname
);
await axios.post('http://digitalme-api:7777/aip', form, {
  headers: {
    ...form.getHeaders(),
    Authorization: `Bearer ${token}`,
  },
});
fs.unlinkSync(req.file.path);
```

### Gestão de Utilizadores (Admin)

**Listar Utilizadores**
```js
const response = await axios.get(
  'http://digitalme-api:7777/user',
  { headers: { Authorization: `Bearer ${token}` } }
);
```

**Detalhe de Utilizador**
```js
const response = await axios.get(
  `http://digitalme-api:7777/user/${userId}`,
  { headers: { Authorization: `Bearer ${token}` } }
);
```


## Middlewares, Autenticação e Segurança

### JWT Secret
- Por defeito, a chave usada para assinar/verificar tokens JWT é `'digitalMeKey'` (hard-coded em `middleware/auth.js`).  
- Em produção, recomenda-se definir:
  ```bash
  export JWT_SECRET="alguma_chave_secreta"
  ```
  e alterar o código para usar `process.env.JWT_SECRET`.

### Cookies HTTP-only
- O token JWT é armazenado como cookie HTTP-only (`cookie-parser` em `app.js` lê e grava cookies).
- Isto impede que scripts no lado do cliente leiam o token diretamente.

### Validação de Acesso
- **`ensureAuthenticated`** → garante que existe um token JWT válido e popula `req.userID` e `req.admin`.  
- **`ensureAuthenticatedAdmin`** → além de validar o token, verifica `req.admin === true`; caso contrário, recusa o acesso redirecionando para `/`.  
- **`redirectIfAuthenticated`** → impede utilizadores já autenticados de acederem a `/login` ou `/register`.  


## Scripts e Comandos

### Instalar Dependências
```bash
cd DigitalMe
npm i
npm install --save-dev nodemon
npm i axios
```

```bash
cd DigitalMeAPI
npm i
npm install --save-dev nodemon
npm i mongoose
```

### Docker

Para criar e executar container:
```bash
docker-compose up --build
```
E irá criar automaticamente os serviços **web** (apontando para esta pasta) e **api** (caso configurado).


## Conclusão
A API desenvolvida fornece uma solução robusta para a gestão de arquivos digitais permanentes, com ênfase na segurança, integridade dos dados e flexibilidade no acesso aos conteúdos. A integração com sistemas de autenticação social melhora a experiência do utilizador e o controlo de acesso garante a proteção dos arquivos privados.