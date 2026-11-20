const { HttpError } = require("../utils/http");

function validarBody(schema) {
  return (req, _res, next) => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      return next(
        new HttpError(400, "Dados inválidos.", resultado.error.issues)
      );
    }

    req.body = resultado.data;
    return next();
  };
}

module.exports = { validarBody };
