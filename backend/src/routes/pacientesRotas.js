const router = require("express").Router();
const controller = require("../controllers/pacientesController");
const { asyncHandler } = require("../utils/http");
const { autenticar } = require("../middleware/auth");
const { validarBody } = require("../middleware/validarBody");
const { pacienteSchema } = require("../validators/schemas");

router.use(autenticar);
router.get("/me", asyncHandler(controller.obterMeu));
router.patch("/me", validarBody(pacienteSchema.partial()), asyncHandler(controller.actualizarMeu));

module.exports = router;
