const router = require("express").Router();
const controller = require("../controllers/auditoriaController");
const { asyncHandler } = require("../utils/http");
const { autenticar } = require("../middleware/auth");

router.use(autenticar);
router.post("/", asyncHandler(controller.registar));

module.exports = router;
