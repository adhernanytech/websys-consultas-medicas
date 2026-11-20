
const router = require("express").Router();

const controller = require("../controllers/medicosController");
const { asyncHandler } = require("../utils/http");
const { autenticar, permitir } = require("../middleware/auth");
const { validarBody } = require("../middleware/validarBody");
const { medicoPerfilSchema } = require("../validators/schemas");

router.get("/", asyncHandler(controller.listar));
router.get("/me", autenticar, asyncHandler(controller.obterMeu));
router.get("/:id", asyncHandler(controller.obter));
router.post("/", autenticar, permitir("admin"), asyncHandler(controller.criarConta));
router.patch("/:id/estado", autenticar, permitir("admin"), asyncHandler(controller.alterarEstadoConta));
router.patch("/me", autenticar, validarBody(medicoPerfilSchema.partial()), asyncHandler(controller.actualizarMeu));

module.exports = router;
