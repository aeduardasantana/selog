/**
 * G — Solicitações e validação pública.
 * Instalar como projeto Google Apps Script vinculado a uma planilha PRIVADA.
 * Não habilita emissão automática: concessões exigem registro manual autorizado.
 */
const CONF = Object.freeze({
  SPREADSHEET_ID: '', // obrigatório: ID da planilha privada (não a pasta pública)
  SHEET_APPLICATIONS: 'Solicitacoes',
  SHEET_AWARDS: 'Reconhecimentos',
  CONTACT_EMAIL: 'contato@compassrosesystems.com.br',
  VALID_MONTHS: Object.freeze({BRONZE:6,PRATA:6,OURO:12}),
  TIMEZONE: 'America/Sao_Paulo',
  ORIGIN_SITE: 'https://selog.compassrosesystems.com.br'
});
const APP_COLS=['Protocolo','CriadoEm','Organizacao','Pais','Setor','Porte','Responsavel','Email','Telefone','Campanhas','Diagnostico','Medidas','Programa','Monitoramento','Evidencias','InteresseReconhecimento','ConsentimentoComercial','Situacao','Observacoes'];
const AWARD_COLS=['Codigo','Organizacao','Pais','Escopo','Nivel','EmitidoEm','ValidoAte','Situacao','VersaoRegulamento','AprovadorInterno','RegistroCriadoEm','Observacoes'];
function doGet(e) {
  const q=e && e.parameter || {};
  const tpl=HtmlService.createTemplateFromFile('Main');
  tpl.mode=q.view==='validar'?'validar':'participar';
  tpl.prefill=String(q.codigo||'').slice(0,60);
  return tpl.evaluate().setTitle('G — Programa de Reconhecimento em Gestão Psicossocial')
    .addMetaTag('viewport','width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}
function setup() {
  const ss=getSS_();
  ensureSheet_(ss,CONF.SHEET_APPLICATIONS,APP_COLS);
  ensureSheet_(ss,CONF.SHEET_AWARDS,AWARD_COLS);
  return 'Pronto: '+ss.getUrl();
}
function getSS_(){if(!CONF.SPREADSHEET_ID)throw Error('Configure SPREADSHEET_ID antes de usar.');return SpreadsheetApp.openById(CONF.SPREADSHEET_ID);}
function ensureSheet_(ss,name,columns){
  let sh=ss.getSheetByName(name);if(!sh)sh=ss.insertSheet(name);
  if(sh.getLastRow()===0)sh.appendRow(columns);
  else if(sh.getRange(1,1,1,columns.length).getValues()[0].join('|')!==columns.join('|'))throw Error('Colunas da aba '+name+' divergem do esquema.');
  sh.setFrozenRows(1);return sh;
}
function clean_(v,max){return String(v===undefined||v===null?'':v).trim().replace(/[\u0000-\u001f]/g,' ').slice(0,max);}
function safeCell_(v,max){const s=clean_(v,max);return /^[=+\-@]/.test(s)?"'"+s:s;}
function token_(){return Utilities.getUuid().replace(/-/g,'').slice(0,16).toUpperCase();}
function submitApplication(obj){
  if(!obj || typeof obj!=='object')throw Error('Solicitação inválida.');
  // O website poderá utilizar apenas a interface Google Apps Script, sem enviar dados pessoais em URLs.
  if(clean_(obj.website,200))throw Error('Envio não aceito.'); // campo honeypot
  const nome=clean_(obj.organizacao,160),email=clean_(obj.email,180),resp=clean_(obj.responsavel,120);
  if(nome.length<3||resp.length<3||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Informe organização, responsável e e-mail válido.');
  if(obj.interesseReconhecimento!==true)throw Error('Confirme que deseja solicitar análise de reconhecimento.');
  if(obj.cientePrivacidade!==true)throw Error('Leia o aviso de privacidade.');
  const answers=['campanhas','diagnostico','medidas','programa','monitoramento','evidencias'].map(k=>clean_(obj[k],12));
  if(answers.some(a=>!['sim','nao','nao-sei'].includes(a)))throw Error('Preencha as perguntas da triagem.');
  const lock=LockService.getScriptLock();lock.waitLock(15000);
  try{
    const id='GP-'+Utilities.formatDate(new Date(),CONF.TIMEZONE,'yyyyMMdd')+'-'+token_();
    const ss=getSS_(),sh=ensureSheet_(ss,CONF.SHEET_APPLICATIONS,APP_COLS);
    sh.appendRow([
      id,new Date(),safeCell_(nome,160),safeCell_(obj.pais,80),safeCell_(obj.setor,100),safeCell_(obj.porte,60),safeCell_(resp,120),
      safeCell_(email,180),safeCell_(obj.telefone,40),...answers,
      'SIM',obj.consentimentoComercial===true?'SIM':'NAO','Novo - nao avaliado',''
    ]);
    return {ok:true,protocolo:id,mensagem:'Solicitação registrada para análise posterior. Nenhum selo foi concedido.'};
  }finally{lock.releaseLock();}
}
function parseDate_(v){if(v instanceof Date && !Number.isNaN(v.getTime()))return new Date(v);const d=new Date(v);return Number.isNaN(d.getTime())?null:d;}
function expiryByLevel_(date,level){
 const months=CONF.VALID_MONTHS[clean_(level,20).toUpperCase()];
 if(!months)throw Error('Nível inválido para cálculo da validade.');
 const d=new Date(date.getTime());const day=d.getDate();
 d.setDate(1);d.setMonth(d.getMonth()+months);
 const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();
 d.setDate(Math.min(day,last));return d;
}
function formatted_(date){return Utilities.formatDate(date,CONF.TIMEZONE,'dd/MM/yyyy');}
function validateAward(code){
 const q=clean_(code,70).toUpperCase();if(!/^[A-Z0-9-]{8,70}$/.test(q))return {found:false,message:'Código não localizado.'};
 const sh=getSS_().getSheetByName(CONF.SHEET_AWARDS);
 if(!sh||sh.getLastRow()<2)return {found:false,message:'Código não localizado.'};
 const found=sh.getRange(2,1,sh.getLastRow()-1,1).createTextFinder(q).matchEntireCell(true).findNext();
 if(!found)return {found:false,message:'Código não localizado.'};
 const row=sh.getRange(found.getRow(),1,1,AWARD_COLS.length).getValues()[0];
 const issued=parseDate_(row[5]);if(!issued)return {found:false,message:'Registro sem data de emissão válida.'};
 const level=clean_(row[4],20).toUpperCase();
 if(!CONF.VALID_MONTHS[level])return {found:false,message:'Nível de reconhecimento inválido.'};
 const expiration=parseDate_(row[6])||expiryByLevel_(issued,level);
 // O vencimento é calculado obrigatoriamente a partir da data de concessão.
 const expected=expiryByLevel_(issued,level);
 if(formatted_(expiration)!==formatted_(expected))return {found:false,message:'Registro requer revisão administrativa da validade.'};
 const state=clean_(row[7],50).toLowerCase();
 let status='INDETERMINADO';
 if(state==='revogado')status='REVOGADO';
 else if(state==='suspenso')status='SUSPENSO';
 else if(state==='vigente'||state==='ativo')status=(new Date().getTime()>endOfDay_(expiration).getTime())?'VENCIDO':'VIGENTE';
 else status='EM REVISAO';
 return {found:true,status,codigo:q,organizacao:clean_(row[1],160),pais:clean_(row[2],60),
   escopo:clean_(row[3],160),nivel:clean_(row[4],20),emissao:formatted_(issued),validade:formatted_(expiration),
   regulamento:clean_(row[8],60),natureza:'Reconhecimento privado e gratuito; não substitui conformidade legal com NR-1.'};
}
function endOfDay_(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate(),23,59,59,999);}
/**
 * Rotina somente administrativa; executar manualmente pelo editor autorizado.
 * Não é endpoint público (não é chamada pela página).
 * Exemplo: registrarReconhecimento_({ organizacao:'...',nivel:'BRONZE', ...})
 */
function registrarReconhecimento_(dados){
 const approved=['BRONZE','PRATA','OURO'];
 if(!dados||!approved.includes(clean_(dados.nivel,20).toUpperCase()))throw Error('Nível inválido');
 if(!dados.aprovadorInterno||!dados.versaoRegulamento)throw Error('Exigidos aprovador e versão do regulamento.');
 const issued=new Date(),expiration=expiryByLevel_(issued,dados.nivel);
 const code='G-'+Utilities.formatDate(issued,CONF.TIMEZONE,'yyyy')+'-'+token_();
 const lock=LockService.getScriptLock();lock.waitLock(15000);
 try{const sh=ensureSheet_(getSS_(),CONF.SHEET_AWARDS,AWARD_COLS);
 sh.appendRow([code,safeCell_(dados.organizacao,160),safeCell_(dados.pais,60),safeCell_(dados.escopo,160),
   clean_(dados.nivel,20).toUpperCase(),issued,expiration,'VIGENTE',clean_(dados.versaoRegulamento,60),
   safeCell_(dados.aprovadorInterno,120),new Date(),safeCell_(dados.observacoes,500)]);
 return {codigo:code,validade:formatted_(expiration)};}finally{lock.releaseLock();}
}
