/**
 * Selo G | Registro institucional de emissões
 * Configure SCRIPT_PROPERTY "REGISTRY_SPREADSHEET_ID" com ID da planilha privada.
 * Aba: EMISSOES. Cabeçalhos:
 * codigo,tipo,titular,nivel,escopo,emissao,validade,situacao,publicar
 *
 * Emissões e mudanças de status são realizadas SOMENTE pelo responsável,
 * diretamente na base privada. Este endpoint é exclusivamente de leitura.
 * Publique como web app (executar como proprietário, acesso público).
 *
 * Estados aceitos: VIGENTE, SUSPENSO, REVOGADO, CANCELADO.
 * EXPIRADO é calculado automaticamente após a data final.
 * publicar = SIM autoriza expor somente os campos listados.
 */
const CABECALHOS=['codigo','tipo','titular','nivel','escopo','emissao','validade','situacao','publicar'];
const TIPOS=['SELO','CERTIFICADO','CREDENCIAMENTO'];
const ESTADOS=['VIGENTE','SUSPENSO','REVOGADO','CANCELADO'];
function doGet(e){
  const p=(e&&e.parameter)||{};
  // Callback fixo evita execução de código arbitrário fornecido pela URL.
  if(p.callback!=='SELOG_receive')return ContentService.createTextOutput('Consulta inválida.').setMimeType(ContentService.MimeType.TEXT);
  let result;
  try{result=consultar_(String(p.codigo||''));}
  catch(err){console.error(err);result={ok:false,error:'UNAVAILABLE'};}
  const json=JSON.stringify(result).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  return ContentService.createTextOutput('SELOG_receive('+json+');').setMimeType(ContentService.MimeType.JAVASCRIPT);
}
function consultar_(codigo){
  if(!/^[A-Z0-9-]{6,64}$/.test(codigo))return {ok:false,error:'INVALID_CODE'};
  const id=PropertiesService.getScriptProperties().getProperty('REGISTRY_SPREADSHEET_ID');
  if(!id)return {ok:false,error:'UNAVAILABLE'};
  const sheet=SpreadsheetApp.openById(id).getSheetByName('EMISSOES');
  if(!sheet)throw new Error('Aba EMISSOES ausente');
  const rows=sheet.getDataRange().getValues();
  if(rows.length<2)return {ok:false,error:'NOT_FOUND'};
  const headers=rows[0].map(v=>String(v).trim().toLowerCase());
  if(CABECALHOS.some(k=>!headers.includes(k)))throw new Error('Cabeçalhos incompatíveis');
  const index=Object.fromEntries(headers.map((k,i)=>[k,i]));
  const matches=rows.slice(1).filter(row=>String(row[index.codigo]).trim().toUpperCase()===codigo);
  if(matches.length!==1)return {ok:false,error:matches.length?'UNAVAILABLE':'NOT_FOUND'};
  const row=matches[0],get=k=>String(row[index[k]]??'').trim();
  if(get('publicar').toUpperCase()!=='SIM')return {ok:false,error:'NOT_FOUND'};
  const tipo=get('tipo').toUpperCase(),original=get('situacao').toUpperCase();
  if(!TIPOS.includes(tipo)||!ESTADOS.includes(original))return {ok:false,error:'UNAVAILABLE'};
  const expiration=parseDate_(row[index.validade]);
  if(!expiration)return {ok:false,error:'UNAVAILABLE'};
  const today=new Date();const currentDay=Date.UTC(today.getFullYear(),today.getMonth(),today.getDate());
  const endDay=Date.UTC(expiration.getFullYear(),expiration.getMonth(),expiration.getDate());
  const status=original==='VIGENTE'&&endDay<currentDay?'EXPIRADO':original;
  return {ok:true,registro:{
    codigo,tipo,titular:get('titular'),nivel:get('nivel'),escopo:get('escopo'),
    emissao:formatDate_(row[index.emissao]),validade:formatDate_(row[index.validade]),situacao:status
  }};
}
function parseDate_(v){
 if(Object.prototype.toString.call(v)==='[object Date]'&&!isNaN(v.getTime()))return v;
 const s=String(v||'').trim(),m=s.match(/^(\d{4})-(\d{2})-(\d{2})$/)||s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
 if(!m)return null;
 const iso=s.includes('-'),y=Number(iso?m[1]:m[3]),mo=Number(m[2]),d=Number(iso?m[3]:m[1]);
 const date=new Date(y,mo-1,d);return date.getFullYear()===y&&date.getMonth()===mo-1&&date.getDate()===d?date:null;
}
function formatDate_(v){const d=parseDate_(v);return d?Utilities.formatDate(d,Session.getScriptTimeZone(),'dd/MM/yyyy'):'';}
