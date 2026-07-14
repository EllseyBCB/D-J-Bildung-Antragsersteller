/* =========================================================
   KONFIGURATION  –  hier eure echten Werte eintragen
   (gilt für ALLE Seiten: Landingpage + Antragsseite)
   ========================================================= */
const CONFIG = {
  // Google-Sheet-Webhook: hier die Web-App-URL aus Apps Script eintragen
  // (leer = Tracking/CRM aus, die Seiten und PDFs funktionieren trotzdem)
  SHEET_WEBHOOK_URL: "https://script.google.com/macros/s/AKfycbxGkBQpG23sNgf6f5gVtmJjdQgKuB3Qj8SbQsQ5csU4Z99jlldHGifcGO-38DLTYdm6dQ/exec",
  DANIELA_EMAIL:     "dn@dj-bildung.de",
  PHONE:             "+49 7141 461315",
  HOMEPAGE:          "https://www.dj-bildung.com",
  IMPRESSUM:         "https://www.dj-bildung.com/impressum/",
  DATENSCHUTZ:       "https://www.dj-bildung.com/datenschutz/",
  MASSNAHME_NR:      "641/70/2025"
};

/* =========================================================
   TRACKING & ATTRIBUTION (seitenübergreifend)
   ========================================================= */
function getParam(n){return new URLSearchParams(location.search).get(n);}
function storeGet(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function storeSet(k,v){try{localStorage.setItem(k,v);}catch(e){}}

// Creator-Attribution: ?ref=NAME  oder  ?utm_source=... / ?utm_campaign=...
const CREATOR = getParam('ref') || getParam('utm_source') || getParam('utm_campaign') || storeGet('dj_creator') || 'direkt';
if (CREATOR && CREATOR!=='direkt') storeSet('dj_creator', CREATOR);

// Eindeutige Besucher-ID (für Funnel: Klick -> Ausfüllen -> Absenden)
let VISITOR = storeGet('dj_visitor');
if(!VISITOR){ VISITOR = 'v_'+Date.now().toString(36)+Math.random().toString(36).slice(2,8); storeSet('dj_visitor', VISITOR); }

const sheetOn = ()=>!!CONFIG.SHEET_WEBHOOK_URL;

// Sendet Daten an das Google Sheet. Body als reiner String -> kein CORS-Preflight.
function postToSheet(type, data){
  if(!sheetOn()) return Promise.resolve();
  try{
    return fetch(CONFIG.SHEET_WEBHOOK_URL,{
      method:'POST',
      body: JSON.stringify(Object.assign({type:type}, data))
    }).catch(()=>{});
  }catch(e){ return Promise.resolve(); }
}

async function track(eventType, meta){
  await postToSheet('event', {event_type:eventType, creator:CREATOR, visitor_id:VISITOR, meta:meta||{}, page:location.pathname});
}

// Jeder Seitenaufruf wird gezählt (auf der Landingpage = Klick auf den Creator-Link)
track('page_view',{referrer:document.referrer||null});

// Query-String (?ref=... etc.) an interne Links weiterreichen,
// damit die Attribution auch ohne localStorage funktioniert.
function propagateQuery(){
  if(!location.search) return;
  document.querySelectorAll('a[data-keep-query]').forEach(a=>{
    const url=new URL(a.getAttribute('href'), location.href);
    new URLSearchParams(location.search).forEach((v,k)=>url.searchParams.set(k,v));
    a.setAttribute('href', url.pathname.split('/').pop()+url.search+url.hash);
  });
}
document.addEventListener('DOMContentLoaded', propagateQuery);

// CTA-Klicks tracken (Buttons/Links mit data-cta="...")
document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('[data-cta]').forEach(a=>a.addEventListener('click',()=>track('cta_click',{source:a.dataset.cta})));
});

// Jahr im Footer
document.addEventListener('DOMContentLoaded', ()=>{
  const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();
});
