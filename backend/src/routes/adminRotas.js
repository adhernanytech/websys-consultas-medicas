const router = require("express").Router();
const controller = require("../controllers/adminController");
const auditoriaController = require("../controllers/auditoriaController");
const { asyncHandler, HttpError, parseId } = require("../utils/http");
const { autenticar, permitir } = require("../middleware/auth");

router.use(autenticar, permitir("admin"));
router.get("/dashboard", asyncHandler(controller.dashboard));
router.get("/utilizadores", asyncHandler(controller.listarUtilizadores));
router.get("/actividade", asyncHandler(auditoriaController.listar));
router.get("/configuracoes", asyncHandler(controller.obterConfiguracoes));
router.put("/configuracoes", asyncHandler(controller.guardarConfiguracoes));
router.patch(
  "/utilizadores/:id/estado",
  (req, _res, next) => {
    if (typeof req.body.ativo !== "boolean") {
      return next(new HttpError(400, "O campo ativo deve ser booleano."));
    }
    try {
      parseId(req.params.id);
      return next();
    } catch (error) {
      return next(error);
    }
  },
  asyncHandler(controller.alterarEstadoUtilizador)
);

module.exports = router;
