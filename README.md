# G — Reconhecimento em Gestão Psicossocial

Subsite institucional do programa privado e gratuito **G**, iniciativa do Grupo Eduarda Bispo.

## Endereço previsto
`https://selog.grupoeduardabispo.com.br`

O endereço depende de configuração de DNS, subdomínio e pasta na hospedagem Locaweb. Não presuma que esteja ativo apenas porque o código existe.

## Destino informado
`/public_html/selog`

## Hospedagem
O fluxo `.github/workflows/deploy-locaweb.yml` publica via **FTPS** em alterações na branch principal, quando todos os segredos abaixo estiverem configurados em **Settings > Secrets and variables > Actions**:

- `LOCAWEB_FTP_SERVER` — host FTP/FTPS obtido no painel da hospedagem.
- `LOCAWEB_FTP_USERNAME` — usuário FTP com acesso à pasta correta.
- `LOCAWEB_FTP_PASSWORD` — senha FTP.

**ATENÇÃO:** antes da primeira publicação, confirme no painel FTP se o caminho `/public_html/selog/` é relativo à raiz exposta à conta. Em alguns planos, a conta FTP já começa dentro de `public_html`, e seria necessário ajustar `server-dir`. Não publicar até confirmar o destino para evitar criar pasta incorreta.

Sem credenciais a automação apenas registra aviso e não realiza deploy. Não inserir senhas no repositório.

## Estado e limites
- Homepage institucional com seções internas.
- Níveis G Bronze/Prata/Ouro apresentados como critérios preliminares.
- Triagem de seis perguntas executada **apenas no navegador**.
- Nenhuma resposta enviada a servidor, registrada em Google Sheets ou coletada para marketing.
- A triagem não gera certificado, diagnóstico NR-1 ou aprovação oficial.
- Ícone hexagonal mostrado é apenas placeholder técnico; integrar o **arquivo visual já aprovado pela direção** sem reinventar o design.
- A concessão depende de regulamento, metodologia, imparcialidade, tratamento de dados, validação e verificador público.

## Antes de captar leads
Implantar endpoint seguro e planilha privada, publicar política de privacidade completa e transparência LGPD, separar consentimento comercial de manifestação de interesse institucional e homologar validação, anti-spam, direitos dos titulares e testes ponta a ponta.

## Documentação do projeto
- [Arquitetura e decisão de subsite](https://docs.google.com/document/d/1beOllRsrVIGxEWKA2w8QoD9x7Y7L4LzWOjNsMKebGjo/edit)
- [Manual preliminar de reconhecimento](https://docs.google.com/document/d/1wY8mvs25bQj3bZcpEa7IvihfEyyhhhyO1eXWYhRviMw/edit)
- [Brandbook](https://docs.google.com/document/d/1qttTIRWhW240NsGMKCFPk2GTdBvBvdEAkglZm-KAiAM/edit)
