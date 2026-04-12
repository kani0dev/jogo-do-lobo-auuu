# como rodar esse projeto 
## oque você vai precisar para rodar o projeto:
- git 
- node.js
- npm ou yarn
- docker
- docker composer 

primeiro clone do repo do github 
```bash
git clone https://github.com/kani0dev/jogo-do-lobo-auuu.git
```
mudar para diretorio do projeto e entao installar as dependecias do node 

```bash
cd jogo-do-lobo-auuu/

npm install
```
agora so falta buildar o docker container e rodar o projeto

```bash
docker compose up -d 

npm run start
```