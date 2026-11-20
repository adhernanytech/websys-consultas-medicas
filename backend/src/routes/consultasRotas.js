
const router = require("express").Router();

const controller = require("../controllers/consultasController");
const { asyncHandler, HttpError } = require("../utils/http");
const { autenticar } = require("../middleware/auth");
const {
  consultaSchema,
  reagendarConsultaSchema,
  estadoConsultaSchema,
} = require("../validators/schemas");

function validarBody(schema) {
  return (req, _res, next) => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      return next(
        new HttpError(
          400,
          "Dados inválidos.",
          resultado.error.issues
        )
      );
    }

    req.body = resultado.data;
    next();
  };
}

router.use(autenticar);

router.get(
  "/",
  asyncHandler(controller.listar)
);

router.get(
  "/:id",
  asyncHandler(controller.obter)
);

router.post(
  "/",
  validarBody(consultaSchema),
  asyncHandler(controller.marcar)
);

router.patch(
  "/:id/estado",
  validarBody(estadoConsultaSchema),
  asyncHandler(controller.actualizarEstado)
);

router.patch(
  "/:id",
  validarBody(reagendarConsultaSchema),
  asyncHandler(controller.actualizar)
);

module.exports = router;
