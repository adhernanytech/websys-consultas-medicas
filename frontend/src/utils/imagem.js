export function prepararImagem(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null)
      return
    }

    const leitor = new FileReader()

    leitor.onload = (evento) => {
      const imagem = new Image()

      imagem.onload = () => {
        const tamanho = 300

        const canvas = document.createElement("canvas")
        canvas.width = tamanho
        canvas.height = tamanho

        const contexto = canvas.getContext("2d")

        const menorDimensao = Math.min(
          imagem.width,
          imagem.height
        )

        const inicioX =
          (imagem.width - menorDimensao) / 2

        const inicioY =
          (imagem.height - menorDimensao) / 2

        contexto.drawImage(
          imagem,
          inicioX,
          inicioY,
          menorDimensao,
          menorDimensao,
          0,
          0,
          tamanho,
          tamanho
        )

        const imagemRedimensionada =
          canvas.toDataURL("image/jpeg", 0.8)

        resolve(imagemRedimensionada)
      }

      imagem.onerror = () => {
        reject(
          new Error("Não foi possível processar a imagem.")
        )
      }

      imagem.src = evento.target.result
    }

    leitor.onerror = () => {
      reject(
        new Error("Não foi possível ler a fotografia.")
      )
    }

    leitor.readAsDataURL(file)
  })
}