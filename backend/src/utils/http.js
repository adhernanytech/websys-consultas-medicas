class HttpError extends Error {
  constructor(status, message, details = undefined) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

function asyncHandler(handler) {
  return function wrappedHandler(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function parseId(value, fieldName = "id") {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    throw new HttpError(400, `${fieldName} inválido.`);
  }
  try {
    return BigInt(value);
  } catch {
    throw new HttpError(400, `${fieldName} inválido.`);
  }
}

module.exports = { HttpError, asyncHandler, parseId };
