// Dá permissão de admin a uma conta Google (custom claim admin:true).
//
// Pré-requisitos (uma vez só):
//   1. A conta Google precisa ter feito login no app pelo menos uma vez
//      (painel admin → senha → popup do Google).
//   2. Baixar a chave de service account:
//      Console Firebase → Configurações do projeto → Contas de serviço
//      → "Gerar nova chave privada" → salvar como serviceAccountKey.json
//      NESTA pasta (admin-tools/). O .gitignore já impede o commit dela.
//   3. cd admin-tools && npm install firebase-admin
//
// Uso:
//   node set-admin-claim.js seuemail@gmail.com
//   node set-admin-claim.js seuemail@gmail.com --remover

const path = require("path");
const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(path.join(__dirname, "serviceAccountKey.json")),
  projectId: "onde-vamos-mamae",
});

const email = process.argv[2];
const remover = process.argv.includes("--remover");

if (!email || !email.includes("@")) {
  console.error("Uso: node set-admin-claim.js <email-da-conta-google> [--remover]");
  process.exit(1);
}

(async () => {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, remover ? { admin: false } : { admin: true });
    console.log(`✓ ${remover ? "Removido admin de" : "Admin concedido a"}: ${email} (uid ${user.uid})`);
    console.log("A pessoa precisa sair e entrar de novo no painel para o token atualizar.");
  } catch (e) {
    if (e.code === "auth/user-not-found") {
      console.error(`Conta ${email} não encontrada. Ela precisa fazer login no app (popup Google do painel admin) antes.`);
    } else {
      console.error("Erro:", e.message);
    }
    process.exit(1);
  }
})();
