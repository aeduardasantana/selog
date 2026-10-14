# Configuração Google Apps Script — Programa G

## Status
Código do backend e da interface criado no repositório. **Não está implantado no Google, não está integrado ao subsite e não recebe inscrições.** Emissão de reconhecimento não é automática.

## Arquivos
- `Code.gs`: processamento de solicitações, registro de concessões e consulta pública.
- `Main.html`: interface de solicitação e de verificação.

## Antes de implantar
1. Aprovar política de privacidade (controlador, base legal, finalidades, retenção, direitos, contato), regulamento, critérios, independência da análise e revisão de segurança.
2. Criar Google Sheets exclusivo para candidaturas, **restrito** a responsáveis autorizados, sem colocá-lo em pastas compartilhadas com acesso público.
3. Criar projeto Apps Script, colar Code.gs e Main.html e configurar `CONF.SPREADSHEET_ID` com ID real da planilha.
4. Executar `setup()` pelo editor autorizando o acesso à planilha; serão criadas as abas `Solicitacoes` e `Reconhecimentos`.
5. Em **Implantar > Nova implantação > Aplicativo da Web**, escolher executar como responsável e restringir o acesso durante testes. **Atenção:** uma publicação acessível a qualquer pessoa expõe a consulta de códigos e o cadastro de solicitações; requer avaliação de abuso, controle de tráfego, rate limiting externo e política de privacidade antes de lançamento.
6. Testar envio, ausência de classificação automática, suspensão e revogação, datas de emissão e vencimento em seis meses, rotação de credenciais e autenticação administrativa.
7. Depois de homologar, conectar o subsite às URLs reais do aplicativo, com links de candidatura e validação (não foram configurados por falta da URL de implantação). A página pública /validar do domínio G **não está publicada** nesta etapa.

## Observações críticas
- O Apps Script `google.script.run` só funciona dentro da página publicada pelo próprio Google Apps Script; o arquivo Main.html não é hospedável diretamente na Locaweb sem adaptação.
- Solicitar reconhecimento e autorizar contato comercial são decisões independentes.
- O uso público exige salvaguarda contra envios automatizados: uma versão de demonstração **não** está pronta para tráfego em massa. Avaliar CAPTCHA/Cloudflare/proxy e quotas.
- Os dados de contato devem ficar em aba privada; a consulta pública expõe apenas empresa/país/escopo/nível/data/status/código/versão do regulamento.
- Validade de seis meses contada da emissão; vencido não equivale a revogado. Suspensão e revogação prevalecem.
- A assinatura do certificado pode ser institucional, com responsável formal identificado internamente. Código + QR não equivalem a assinatura digital.
- O símbolo da marca G é o hexágono aprovado, não redesenhar.

## Contato
contato@compassrosesystems.com.br
