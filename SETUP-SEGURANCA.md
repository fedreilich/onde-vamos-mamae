# Setup de Segurança — passos no Console do Firebase

O código já está pronto. Falta ativar 3 coisas no console (uma vez só, ~15 min).

## 1. Ativar os provedores de login

[Console Firebase](https://console.firebase.google.com/project/onde-vamos-mamae) → **Authentication → Sign-in method**:

1. Ativar **Anônimo** (Anonymous) — é como toda usuária entra.
2. Ativar **Google** — é como a admin entra no painel.
3. Em **Authentication → Settings → Authorized domains**, confirmar que
   `fedreilich.github.io` está na lista (adicionar se não estiver).

## 2. Publicar as Security Rules

Opção A — pelo console (mais rápido):
**Firestore Database → Rules** → colar o conteúdo de [`firestore.rules`](firestore.rules) → **Publish**.

Opção B — pela CLI:
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

⚠️ **Ordem importa:** publique as rules só DEPOIS de fazer o deploy do novo
`index.html` (com login anônimo) no GitHub Pages. Se publicar as rules antes,
as versões antigas do app perdem acesso ao banco até atualizarem.

## 3. Dar permissão de admin à sua conta Google

1. Faça o deploy do app e entre no painel admin uma vez: senha → popup do
   Google → vai aparecer "Esta conta não tem permissão de admin". Normal —
   esse primeiro login cria a conta no Firebase.
2. No console: **Configurações do projeto → Contas de serviço → Gerar nova
   chave privada** → salvar como `admin-tools/serviceAccountKey.json`
   (o `.gitignore` já protege esse arquivo).
3. No terminal:
   ```bash
   cd admin-tools
   npm install firebase-admin
   node set-admin-claim.js seuemail@gmail.com
   ```
4. Volte ao painel admin no app, saia e entre de novo. Pronto.

## 4. Restringir a API key (recomendado)

[Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials?project=onde-vamos-mamae)
→ clicar na API key do app → **Application restrictions → Websites** → adicionar:
- `fedreilich.github.io/*`
- `localhost/*` (para desenvolver)

Isso impede que a key seja usada de outros sites. (Com as rules publicadas a
key já não dá poder nenhum, mas restringir é higiene.)

## 5. Seeds de dados (mudou!)

Os scripts `seed-*.js` colados no console do navegador agora só funcionam se
você estiver logada como admin (Google) naquele navegador — caso contrário as
rules bloqueiam a escrita. Abra o painel admin (senha + Google) antes de colar.

## O que o código novo faz

- **Toda usuária entra com login anônimo do Firebase** — identidade estável,
  perfis param de morrer com o dispositivo.
- **Perfis antigos migram sozinhos**: no primeiro acesso, o app regrava o
  perfil no uid novo e "Minhas contribuições" reconhece o uid antigo também.
- **Coleção `usuarios` fechada**: só a própria usuária (e a admin) lê os dados
  pessoais. Ninguém mais consegue listar nomes, e-mails e WhatsApps.
- **Painel admin**: a senha continua como porta de entrada visual, mas o poder
  real de escrita vem do custom claim `admin:true` verificado pelas rules no
  servidor — impossível de falsificar pelo navegador.
- **Contribuições nascem `status:"pendente"`** por força de rule — ninguém
  consegue se auto-validar.

## Limitação conhecida (para a v2)

`comentarios` e `avaliacoes` usam um documento compartilhado por lugar — 
qualquer usuária logada consegue sobrescrever o doc inteiro. Baixo risco
(não há dados pessoais), mas o certo é migrar para subcoleção por autora.
