# D+J Bildung – Arbeit 4.0 Landingpage

Landingpage für die AZAV-zertifizierte Online-Weiterbildung **Arbeit 4.0** (100 % über Bildungsgutschein förderbar) inkl. Antrags-Generator (PDF) und Google-Sheet-CRM/Funnel-Tracking.

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | Die Landingpage (nur Werbung + Button „Antrag in 5 Minuten erstellen") |
| `antrag.html` | Der Antragsprozess – führt Schritt für Schritt (5 Schritte) durch das Formular, erzeugt die PDFs |
| `assets/style.css` | Gemeinsames Design für beide Seiten |
| `assets/config.js` | **Zentrale Konfiguration** (Webhook-URL!) + Funnel-Tracking |
| `assets/logo.png` | D+J-Logo |
| `arbeit40.html` | Weiterleitung auf die Landingpage (alte Links funktionieren weiter) |
| `Code.gs` | Google-Apps-Script (Webhook zum Google Sheet – CRM + Funnel-Auswertung) |
| `ANLEITUNG.txt` | Vollständige Schritt-für-Schritt-Anleitung |
| `.github/workflows/deploy-pages.yml` | Automatisches Deployment auf GitHub Pages bei jedem Push |

## Veröffentlichung (GitHub Pages)

Das Deployment läuft automatisch über GitHub Actions: Bei jedem Push wird der Inhalt des Repositories auf den Branch `gh-pages` veröffentlicht, den GitHub Pages ausliefert.

**Einmalige Aktivierung (nur beim allerersten Mal nötig):**
Im Repository auf GitHub: **Settings → Pages → Build and deployment → Source: „Deploy from a branch"** wählen, dann **Branch: `gh-pages`**, Ordner **`/ (root)`**, und **Save** klicken. Nach 1–2 Minuten ist die Seite live.

Die Seite ist danach erreichbar unter:

```
https://ellseybcb.github.io/D-J-Bildung-Antragsersteller/
```

(sowohl direkt als auch unter `…/arbeit40.html`)

## E-Mail-Versand an die Agentur

Die E-Mail an die Agentur kommt **aus dem eigenen Postfach der arbeitssuchenden Person** (Absender = die Person selbst). Auf dem Erfolgs-Bildschirm:

- Beide PDFs werden automatisch heruntergeladen.
- Die Person trägt die E-Mail-Adresse der Agentur ein und öffnet ihr E-Mail-Programm oder Webmail (Gmail / Outlook.com / GMX / WEB.DE) – **Empfänger, Betreff und ein freundlich formulierter Text sind schon ausgefüllt**. Sie hängt die zwei PDFs an und sendet.
- **Am Smartphone** erscheint zusätzlich der Button „Per E-Mail teilen (mit Anhängen)": über die native Teilen-Funktion werden beide PDFs direkt an die Mail-App übergeben – die **Anhänge sind dann automatisch dabei**, Absender bleibt die Person.

> Hinweis: Eine Webseite kann Anhänge technisch **nicht** automatisch in das eigene E-Mail-Fenster legen (Browser-Sicherheit). Deshalb ist am PC das Anhängen der zwei PDFs der einzige manuelle Schritt; am Handy übernimmt das die Teilen-Funktion.

**Automatische Kopie an D+J:** Sobald der Antrag erstellt wird, gehen beide PDFs im Hintergrund per E-Mail an D+J (dn@dj-bildung.de) – unabhängig davon, ob die Person die Mail an ihre Agentur wirklich abschickt. Das benötigt den eingerichteten Webhook (siehe unten).

## Was noch manuell zu tun ist (Google Sheet / Tracking / Direktversand)

Die Seite funktioniert sofort – **ohne** Tracking/CRM und ohne Direktversand. Damit Leads und Funnel-Events im Google Sheet landen, die automatische PDF-Kopie an D+J (dn@dj-bildung.de) gesendet wird und der **Direktversand an die Agentur mit PDF-Anhängen** funktioniert, müssen die Schritte 1–4 aus `ANLEITUNG.txt` einmalig ausgeführt werden:

1. Google Sheet anlegen (z. B. „D+J – Arbeit 4.0 Leads“).
2. In der Tabelle: *Erweiterungen → Apps Script* öffnen und den kompletten Inhalt von `Code.gs` einfügen.
3. *Bereitstellen → Neue Bereitstellung → Web-App* (Ausführen als: Ich, Zugriff: **Jeder**) – die Web-App-URL kopieren.
4. In **`assets/config.js`** (eine einzige Stelle für beide Seiten) eintragen:
   ```js
   SHEET_WEBHOOK_URL: "https://script.google.com/macros/s/AKfyc..../exec",
   ```
   Änderung committen/pushen – das Deployment läuft automatisch.

**Wichtig bei Änderungen an `Code.gs`:** Das Skript im Apps-Script-Editor aktualisieren und **neu bereitstellen** (Bereitstellen → Bereitstellungen verwalten → Bearbeiten → Version „Neu" → Bereitstellen), sonst läuft im Web weiterhin die alte Version.

## Creator-Links

Jeder YouTuber/Influencer bekommt einen eigenen Link mit `?ref=NAME`, z. B.:

```
https://ellseybcb.github.io/D-J-Bildung-Antragsersteller/?ref=maxmustermann
```

Die Auswertung je Creator (Klicks → Besucher → Ausgefüllt → Antrag erstellt → Abgeschickt → Bildungsgutscheine) entsteht automatisch im Sheet-Blatt „Auswertung“; zusätzlich steht der Creator bei jedem Lead im Blatt „Leads“.

**Bequemer Generator (intern):** `creator-links.html` — Creator-Name eintippen → fertiger Link mit „Kopieren“-Knopf. Erreichbar unter:

```
https://ellseybcb.github.io/D-J-Bildung-Antragsersteller/creator-links.html
```

Die Seite ist `noindex` (nicht öffentlich verlinkt) und baut die Links automatisch aus der aktuellen Adresse — funktioniert also auch nach einem Umzug auf eine eigene Domain.

## Kontakt

D+J Bildung · Daniela Nedvidek · Tel. +49 7141 461315 · dn@dj-bildung.de · [www.dj-bildung.com](https://www.dj-bildung.com)
