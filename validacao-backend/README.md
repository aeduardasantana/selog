# Selo G — Registro e validação pública

Este diretório contém o **backend de consulta**, separado do site estático.

## Configuração

1. Criar uma planilha **privada** com a aba `EMISSOES`.
2. Na primeira linha, colocar, exatamente: `codigo,tipo,titular,nivel,escopo,emissao,validade,situacao,publicar`. Cada campo deve ocupar uma coluna.
3. Em um projeto Google Apps Script, incluir o arquivo `Code.gs`.
4. Nas propriedades do script, cadastrar `REGISTRY_SPREADSHEET_ID` com o ID da planilha. Nunca publicar o ID ou usar a planilha como página pública.
5. Definir o fuso horário do projeto como `America/Sao_Paulo`; publicar como aplicativo Web, executado pelo proprietário, acesso para qualquer pessoa.
6. Conferir o domínio e o comportamento do retorno JSONP; após homologação, colar a URL de implantação em `API_URL` em `validar/index.html`. Não usar URL de teste /dev.
7. Testar códigos existente, inexistente, expirado, suspenso, revogado, duplicado e ausência de conexão antes de ativar.

## Contrato

Somente consulta por código; não há listagem, pesquisa por empresa ou acesso aos documentos e evidências. Apenas linhas com `publicar=SIM` podem aparecer. Valores de `tipo`: `SELO`, `CERTIFICADO`, `CREDENCIAMENTO`. Estados: `VIGENTE`, `SUSPENSO`, `REVOGADO`, `CANCELADO`. O sistema calcula `EXPIRADO` quando o prazo passa.

Exemplo ilustrativo de registro (não emitir como válido):
`SG-2026-TESTE001 | SELO | Empresa Exemplo Ltda. | BRONZE | Matriz Goiânia | 19/10/2026 | 19/04/2027 | VIGENTE | NÃO`

**Segurança e governança:** gerar códigos aleatórios não sequenciais de alta entropia; impedir duplicidade na emissão; restringir escrita a responsáveis autorizados, registrar histórico de decisões e alterações em aba privada separada; não publicar dados de saúde, informações pessoais desnecessárias ou arquivos de evidências. Antes da operação, implementar regras documentadas de emissão, revogação, suspensão, renovação e correção.

**Importante:** até a configuração e homologação da integração, a página pública informa que a consulta está indisponível. Nem a criação destes arquivos nem um commit no GitHub significam que a base oficial esteja conectada.
