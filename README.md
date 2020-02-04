# watson-assistant-widget-preview

**This plugin injects on a website of your choice (by setting its domain) the IBM Watson Assistant Web Chat integration 
widget for preview reasons, prior to touch HTML. The plugin is provided as a quick way to preview the final result.**

## What it does

- This add-on injects external JavaScript into pages.
- This add-on can be configured by clicking on its icon in the toolbar.

## What it shows

- If correctly configured, a chat widget will appear in the bottom right corner of the page
- A settings panel where is possible to configure the website domain where the JavaScript code will be injected, 
the integration id and region parameters provided by IBM Watson Assistant service

## How to run it

Use npm commands:

- npm run react: runs settings panel in dev mode (built with react)
- npm run react:build: builds react app that powers the settings panel
- npm run build: build react app and then packages the web extensions
- npm run lint: web-ext lint
- npm run sign: web-ext sign
- npm start: web-ext run
- npm run dev: web-ext with a specific profile called "dev" and keeps profile changes

## How it is programmed

- manifest.json is located inside "public" folder
- web-ext code (icons, css, js content and background files) is located inside "public" folder
- browser action popup is react app. Its source code is located inside "src" folder

---
