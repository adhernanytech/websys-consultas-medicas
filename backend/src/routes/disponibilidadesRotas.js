const router = require("express").Router();
const controller = require("../controllers/disponibilidadesController");
const { asyncHandler, HttpError } = require("../utils/http");
const { autenticar, permitir } = require("../middleware/auth");
const { disponibilidadeSchema } = require("../validators/schemas");

function validarBody(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) return next(new HttpError(400, "Dados inválidos.", result.error.issues));
    req.body = result.data;
    next();
  };
}

router.get("/", asyncHandler(controller.listar));
router.post("/", autenticar, permitir("admin", "medico"), validarBody(disponibilidadeSchema), asyncHandler(controller.criar));
router.patch("/:id", autenticar, permitir("admin", "medico"), validarBody(disponibilidadeSchema), asyncHandler(controller.actualizar));
router.patch("/:id/estado", autenticar, permitir("admin", "medico"), asyncHandler(controller.cancelar));
router.delete("/:id", autenticar, permitir("admin", "medico"), asyncHandler(controller.cancelar));

module.exports = router;
