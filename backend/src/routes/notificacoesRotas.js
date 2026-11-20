const router = require("express").Router();
const controller = require("../controllers/notificacoesController");
const { asyncHandler } = require("../utils/http");
const { autenticar } = require("../middleware/auth");

router.use(autenticar);
router.get("/", asyncHandler(controller.listar));
router.patch("/marcar-todas-lidas", asyncHandler(controller.marcarTodasLidas));
router.patch("/:id/lida", asyncHandler(controller.marcarLida));
router.delete("/:id", asyncHandler(controller.remover));

module.exports = router;
