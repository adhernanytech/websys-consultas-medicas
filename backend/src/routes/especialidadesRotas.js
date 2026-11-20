const router = require("express").Router();
const controller = require("../controllers/especialidadesController");
const { asyncHandler } = require("../utils/http");
const { autenticar, permitir } = require("../middleware/auth");
const { especialidadeSchema } = require("../validators/schemas");
const { HttpError } = require("../utils/http");

function validarBody(schema) {
  return (req, _res, next) => {
    const resultado = schema.safeParse(req.body);
    if (!resultado.success) {
      return next(new HttpError(400, "Dados inválidos.", resultado.error.issues));
    }
    req.body = resultado.data;
    next();
  };
}

router.get("/", asyncHandler(controller.listar));
router.get("/:id", asyncHandler(controller.obter));
router.post("/", autenticar, permitir("admin"), validarBody(especialidadeSchema), asyncHandler(controller.criar));
router.patch("/:id", autenticar, permitir("admin"), validarBody(especialidadeSchema.partial()), asyncHandler(controller.actualizar));

module.exports = router;
