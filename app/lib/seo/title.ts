/**
 * O layout raiz aplica o template `%s | Bolsa Click` em todo `title`. Título
 * que já chega com a marca no fim (metaTitle salvo no banco, literal antigo)
 * sai com sufixo duplicado: "FAQ | Bolsa Click | Bolsa Click".
 *
 * Remove o sufixo de marca final — com `|`, `-`, `–` ou `—` como separador —
 * pra que o template o acrescente uma vez só. Usar em todo título vindo de
 * dado editável (blog, categoria, central de ajuda).
 */
export function stripBrandSuffix(title: string): string {
  return title.replace(/\s*[|\-–—]\s*Bolsa\s*Click\s*$/i, '').trim()
}
