/*************************************************************************
 *  D+J Bildung – Arbeit 4.0 Landingpage
 *  Google-Sheet-Webhook (Apps Script)
 *
 *  Aufgabe:
 *    - nimmt Daten der Landingpage entgegen (Leads + Funnel-Events)
 *    - schreibt sie in die Blätter "Leads" und "Events"
 *    - berechnet automatisch das Blatt "Auswertung" (Funnel je Creator)
 *
 *  Einrichtung: siehe ANLEITUNG.txt
 *************************************************************************/

// Reihenfolge der Spalten im Blatt "Leads"
var LEAD_COLS = [
  ['created_at','Zeitstempel'],
  ['creator','Creator'],
  ['visitor_id','Besucher-ID'],
  ['status','Status'],
  ['anrede','Anrede'],
  ['titel','Titel'],
  ['vorname','Vorname'],
  ['nachname','Nachname'],
  ['email','E-Mail'],
  ['telefon','Telefon'],
  ['strasse','Straße'],
  ['plz','PLZ'],
  ['ort','Ort'],
  ['geburtsdatum','Geburtsdatum'],
  ['kundennummer','Kundennummer'],
  ['beschaeftigungsstatus','Status (Beschäftigung)'],
  ['status_seit','Status seit'],
  ['agentur','Agentur/Jobcenter'],
  ['vermittler','Vermittler'],
  ['leistungen','Leistungen'],
  ['bildungsabschluss','Bildungsabschluss'],
  ['branche','Branche'],
  ['berufserfahrung','Berufserfahrung (J.)'],
  ['grund_arbeitssuche','Grund Arbeitssuche'],
  ['durchfuehrung','Durchführung'],
  ['zielberuf','Zielberuf'],
  ['digital_kompetenz','Digitale Kompetenz'],
  ['kontakt_erlaubt','Kontakt erlaubt'],
  ['notiz','Notiz (intern)']
];

var EVENT_COLS = [
  ['created_at','Zeitstempel'],
  ['event_type','Event'],
  ['creator','Creator'],
  ['visitor_id','Besucher-ID'],
  ['page','Seite'],
  ['meta','Details']
];

function doPost(e){
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try{
    var data = JSON.parse(e.postData.contents);
    var now = new Date();

    if (data.type === 'mailcopy'){
      // Zwei PDFs als Anhang per E-Mail an D+J senden (zum Nachfassen)
      var atts = (data.files || []).map(function(f){
        return Utilities.newBlob(Utilities.base64Decode(f.base64), 'application/pdf', f.name);
      });
      var to = data.notify_to || 'dn@dj-bildung.de';
      var subj = 'Neuer Antrag über Landingpage: ' + (data.name || 'Unbekannt')
               + ' (' + (data.creator || 'direkt') + ')';
      var body = 'Über die Arbeit-4.0-Landingpage wurde ein Antrag erstellt.\n\n'
               + 'Name: ' + (data.name || '') + '\n'
               + 'E-Mail: ' + (data.email || '') + '\n'
               + 'Telefon: ' + (data.telefon || '') + '\n'
               + 'Agentur/Jobcenter: ' + (data.agentur || '') + '\n'
               + 'Creator: ' + (data.creator || 'direkt') + '\n\n'
               + 'Die beiden PDFs (Antrag + Info-Anlage) sind angehängt.';
      MailApp.sendEmail({ to: to, subject: subj, body: body, attachments: atts });
      return json_({ok:true, sent:true});
    }

    if (data.type === 'lead'){
      var sheet = getSheet_('Leads', LEAD_COLS);
      var row = LEAD_COLS.map(function(c){
        if (c[0] === 'created_at') return now;
        var v = data[c[0]];
        return (v === undefined || v === null) ? '' : v;
      });
      sheet.appendRow(row);
    } else { // event
      var esheet = getSheet_('Events', EVENT_COLS);
      var meta = data.meta ? JSON.stringify(data.meta) : '';
      esheet.appendRow([now, data.event_type||'', data.creator||'', data.visitor_id||'', data.page||'', meta]);
    }

    rebuildDashboard_();
    return json_({ok:true});
  } catch(err){
    return json_({ok:false, error:String(err)});
  } finally {
    lock.releaseLock();
  }
}

function doGet(){
  return json_({ok:true, service:'D+J Arbeit 4.0 Webhook', time:new Date()});
}

/* ---------- Hilfsfunktionen ---------- */

function getSheet_(name, cols){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh){
    sh = ss.insertSheet(name);
    var headers = cols.map(function(c){ return c[1]; });
    sh.getRange(1,1,1,headers.length).setValues([headers]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function json_(obj){
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Baut das Blatt "Auswertung": Funnel je Creator + Gesamtzeile
function rebuildDashboard_(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var ev = ss.getSheetByName('Events');
  var events = ev ? ev.getDataRange().getValues() : [];
  var ld = ss.getSheetByName('Leads');
  var leads = ld ? ld.getDataRange().getValues() : [];

  // Events auswerten (erste Zeile = Header)
  // Spalten: 0 Zeitstempel, 1 Event, 2 Creator, 3 Besucher-ID
  var stats = {}; // creator -> {klicks, besucher:Set, start:Set, pdf:Set, sub:Set}
  function bucket(c){
    if(!stats[c]) stats[c]={klicks:0,besucher:{},start:{},pdf:{},sub:{}};
    return stats[c];
  }
  for (var i=1;i<events.length;i++){
    var typ=events[i][1], cr=events[i][2]||'direkt', vis=events[i][3]||('_'+i);
    var b=bucket(cr);
    if(typ==='page_view'){ b.klicks++; b.besucher[vis]=1; }
    else if(typ==='form_start'){ b.start[vis]=1; }
    else if(typ==='pdf_generated'){ b.pdf[vis]=1; }
    else if(typ==='submitted'){ b.sub[vis]=1; }
  }

  // Gutscheine je Creator aus Leads (Status='gutschein')
  // Leads-Spalten: 1 Creator, 3 Status
  var gutschein={};
  for (var j=1;j<leads.length;j++){
    var lc=leads[j][1]||'direkt', st=(leads[j][3]||'').toString().toLowerCase();
    if(st==='gutschein'){ gutschein[lc]=(gutschein[lc]||0)+1; }
  }

  var header=['Creator','Klicks','Besucher','Ausgefüllt (Start)','Antrag erstellt','Abgeschickt','Bildungsgutscheine'];
  var rows=[header];
  var tot=[0,0,0,0,0,0];
  Object.keys(stats).sort().forEach(function(c){
    var b=stats[c];
    var r=[c, b.klicks, count_(b.besucher), count_(b.start), count_(b.pdf), count_(b.sub), (gutschein[c]||0)];
    rows.push(r);
    for(var k=0;k<6;k++) tot[k]+=r[k+1];
  });
  rows.push(['GESAMT'].concat(tot));

  var sh=ss.getSheetByName('Auswertung');
  if(!sh){ sh=ss.insertSheet('Auswertung',0); }
  sh.clearContents();
  sh.getRange(1,1,rows.length,header.length).setValues(rows);
  sh.getRange(1,1,1,header.length).setFontWeight('bold');
  sh.getRange(rows.length,1,1,header.length).setFontWeight('bold');
  sh.setFrozenRows(1);
  try{ sh.autoResizeColumns(1,header.length); }catch(e){}
}

function count_(o){ return Object.keys(o).length; }

// Optional manuell ausführbar, um das Sheet initial anzulegen
function setup(){
  getSheet_('Leads', LEAD_COLS);
  getSheet_('Events', EVENT_COLS);
  rebuildDashboard_();
}
