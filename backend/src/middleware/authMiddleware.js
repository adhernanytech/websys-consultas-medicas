
const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer TOKEN

  if (!token) {
    return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
  }

  try {
    const verificado = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verificado; // Contém id, email, role
    next();
  } catch (error) {
    res.status(403).json({ erro: 'Token inválido ou expirado.' });
  }
}

function autorizarRoles(...rolesPermitidas) {
  return (req, res, next) => {
    if (!rolesPermitidas.includes(req.user.role)) {
      return res.status(403).json({ erro: 'Acesso não autorizado para este perfil.' });
    }
    next();
  };
}

module.exports = { verificarToken, autorizarRoles };