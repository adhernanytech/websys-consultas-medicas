function valorSeguro(valor) {
  return String(valor ?? "").replace(/[\r\n]+/g, " ").trim()
}

export function exportarCSV(nomeFicheiro, cabecalhos, linhas) {
  const escapar = (valor) => `"${valorSeguro(valor).replace(/"/g, '""')}"`
  const conteudo = [cabecalhos, ...linhas]
    .map((linha) => linha.map(escapar).join(";"))
    .join("\r\n")
  const blob = new Blob(["\uFEFF", conteudo], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = nomeFicheiro.endsWith(".csv") ? nomeFicheiro : `${nomeFicheiro}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function escaparHTML(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/** Abre um relatório formatado para impressão; no diálogo, escolher «Guardar como PDF». */
export function exportarPDF(titulo, subtitulo, cabecalhos, linhas, nomeDocumento = "relatorio") {
  const janela = window.open("", "_blank", "width=1000,height=750")
  if (!janela) {
    throw new Error("O navegador bloqueou a janela do relatório. Permita pop-ups para exportar em PDF.")
  }
  const th = cabecalhos.map((c) => `<th>${escaparHTML(c)}</th>`).join("")
  const tr = linhas.map((linha) => `<tr>${linha.map((c) => `<td>${escaparHTML(c)}</td>`).join("")}</tr>`).join("")
  const data = new Intl.DateTimeFormat("pt-PT", { dateStyle: "long", timeStyle: "short" }).format(new Date())
  janela.document.write(`<!doctype html><html lang="pt"><head><meta charset="utf-8"><title>${escaparHTML(titulo)}</title><style>
    @page{size:A4 landscape;margin:14mm}*{box-sizing:border-box}body{font:12px Arial,sans-serif;color:#172033;margin:0}header{border-bottom:3px solid #155dfc;padding-bottom:14px;margin-bottom:18px}h1{font-size:22px;margin:0 0 6px}p{margin:4px 0;color:#526071}.meta{font-size:10px;margin-top:10px}table{width:100%;border-collapse:collapse;table-layout:auto}th{background:#eef4ff;color:#163b80;text-align:left}th,td{border:1px solid #d8dee8;padding:7px;vertical-align:top;overflow-wrap:anywhere}tr:nth-child(even) td{background:#f8fafc}footer{margin-top:18px;color:#667085;font-size:10px}@media print{button{display:none}}
    </style></head><body><header><h1>${escaparHTML(titulo)}</h1><p>${escaparHTML(subtitulo || "Sistema Web de Marcação de Consultas Médicas")}</p><p class="meta">Gerado em ${escaparHTML(data)} · Documento: ${escaparHTML(nomeDocumento)}</p></header><table><thead><tr>${th}</tr></thead><tbody>${tr || `<tr><td colspan="${cabecalhos.length}">Sem dados para apresentar.</td></tr>`}</tbody></table><footer>Documento gerado pelo painel administrativo. Confirmar a exactidão dos dados antes de utilização oficial.</footer><script>window.addEventListener('load',()=>window.print())<\/script></body></html>`)
  janela.document.close()
}
