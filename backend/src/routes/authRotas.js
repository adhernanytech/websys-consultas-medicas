
const express = require("express");

const router = express.Router();
const authController = require("../controllers/authController");
const { autenticar } = require("../middleware/auth");

router.post("/registro", authController.registrar);
router.post("/login", authController.login);

router.get("/me", autenticar, authController.obterSessao);

router.post("/esqueci-senha", authController.esqueciSenha);
router.post("/redefinir-senha", authController.redefinirSenha);

router.post(
  "/alterar-senha-inicial",
  autenticar,
  authController.alterarSenhaInicial
);

module.exports = router;
