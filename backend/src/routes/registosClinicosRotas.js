const router = require("express").Router();
const controller = require("../controllers/registosClinicosController");
const { asyncHandler } = require("../utils/http");
const { autenticar } = require("../middleware/auth");
const { validarBody } = require("../middleware/validarBody");
const { registoClinicoSchema } = require("../validators/schemas");

router.use(autenticar);
router.get("/", asyncHandler(controller.listar));
router.get("/consulta/:consultaId", asyncHandler(controller.obterPorConsulta));
router.get("/:id", asyncHandler(controller.obter));
router.post(
  "/consulta/:consultaId",
  validarBody(registoClinicoSchema),
  asyncHandler(controller.criar)
);
router.patch(
  "/consulta/:consultaId",
  validarBody(registoClinicoSchema.partial()),
  asyncHandler(controller.actualizar)
);
router.put(
  "/consulta/:consultaId",
  validarBody(registoClinicoSchema),
  asyncHandler(controller.criar)
);

module.exports = router;
