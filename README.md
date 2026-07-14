# D+J Bildung – Arbeit 4.0 Landingpage

Landingpage für die AZAV-zertifizierte Online-Weiterbildung **Arbeit 4.0** (100 % über Bildungsgutschein förderbar) inkl. Antrags-Generator (PDF) und Google-Sheet-CRM/Funnel-Tracking.

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | Die Landingpage (wird über GitHub Pages veröffentlicht) |
| `arbeit40.html` | Identische Kopie unter dem Original-Dateinamen (`…/arbeit40.html`) |
| `Code.gs` | Google-Apps-Script (Webhook zum Google Sheet – CRM + Funnel-Auswertung) |
| `ANLEITUNG.txt` | Vollständige Schritt-für-Schritt-Anleitung |
| `.github/workflows/deploy-pages.yml` | Automatisches Deployment auf GitHub Pages bei jedem Push |

## Veröffentlichung (GitHub Pages)

Das Deployment läuft automatisch über GitHub Actions: Bei jedem Push wird der Inhalt des Repositories auf GitHub Pages veröffentlicht. Es ist keine manuelle Einrichtung nötig.

Die Seite ist danach erreichbar unter:

```
https://ellseybcb.github.io/D-J-Bildung-Antragsersteller/
```

(sowohl direkt als auch unter `…/arbeit40.html`)

## Was noch manuell zu tun ist (Google Sheet / Tracking)

Die Seite funktioniert sofort – **ohne** Tracking/CRM. Damit Leads und Funnel-Events im Google Sheet landen und die automatische PDF-Kopie an D+J (dn@dj-bildung.de) gesendet wird, müssen die Schritte 1–4 aus `ANLEITUNG.txt` einmalig ausgeführt werden:

1. Google Sheet anlegen (z. B. „D+J – Arbeit 4.0 Leads“).
2. In der Tabelle: *Erweiterungen → Apps Script* öffnen und den kompletten Inhalt von `Code.gs` einfügen.
3. *Bereitstellen → Neue Bereitstellung → Web-App* (Ausführen als: Ich, Zugriff: **Jeder**) – die Web-App-URL kopieren.
4. In `index.html` **und** `arbeit40.html` im `CONFIG`-Block eintragen:
   ```js
   SHEET_WEBHOOK_URL: "https://script.google.com/macros/s/AKfyc..../exec",
   ```
   Änderung committen/pushen – das Deployment läuft automatisch.

## Creator-Links

Jeder YouTuber/Influencer bekommt einen eigenen Link mit `?ref=NAME`, z. B.:

```
https://ellseybcb.github.io/D-J-Bildung-Antragsersteller/?ref=maxmustermann
```

Die Auswertung je Creator (Klicks → Besucher → Ausgefüllt → Antrag erstellt → Abgeschickt → Bildungsgutscheine) entsteht automatisch im Sheet-Blatt „Auswertung“.

## Kontakt

D+J Bildung · Daniela Nedvidek · Tel. +49 7141 461315 · dn@dj-bildung.de · [www.dj-bildung.com](https://www.dj-bildung.com)
