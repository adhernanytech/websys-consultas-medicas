function estiloLink({ isActive }) {

  return isActive

    ? `
      font-bold
      text-texto-terciario
      border-b-2
      border-borda
      pb-1
    `

    : `
      hover:text-texto-terciario
      transition
    `
}

export default estiloLink