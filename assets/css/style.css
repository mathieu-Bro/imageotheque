:root {
  --bg: #1e1f23;
  --panel: rgba(42, 45, 51, 0.92);
  --panel-strong: rgba(22, 24, 28, 0.96);
  --text: #e6e9ef;
  --muted: #a5adb8;
  --accent: #4f8cff;
  --radius: 14px;

  --shadow-out:
    6px 6px 12px rgba(0,0,0,0.45),
   -6px -6px 12px rgba(255,255,255,0.04);

  --shadow-inset:
    inset 4px 4px 8px rgba(0,0,0,0.45),
    inset -4px -4px 8px rgba(255,255,255,0.04);
}

* {
  box-sizing: border-box;
}

html {
  min-height: 100%;
}

body {
  margin: 0;
  min-height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  color: var(--text);
  background: var(--bg);
}

body.no-scroll {
  overflow: hidden;
}

body.has-bg {
  background: url("../img/background.jpg") center/cover no-repeat fixed;
}

body.has-bg::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  background: rgba(8, 10, 14, 0.76);
}

/* HEADER */

.site-header {
  padding: 30px;
  text-align: center;
}

.site-header h1 {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
}

.site-header p {
  margin: 8px 0 0;
  color: var(--muted);
}

/* FILTERS */

.filters-panel {
  position: sticky;
  top: 0;
  z-index: 20;
  padding: 16px;
  background: rgba(20, 22, 26, 0.72);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.filters-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1.3fr 1.6fr 1.2fr auto;
  gap: 12px;
  align-items: center;
}

input,
select,
button {
  min-height: 46px;
  border-radius: var(--radius);
  font-size: 14px;
}

input,
select {
  width: 100%;
  border: none;
  outline: none;
  background: var(--panel);
  color: var(--text);
  padding: 0 14px;
  box-shadow: var(--shadow-inset);
}

input::placeholder {
  color: rgba(230, 233, 239, 0.48);
}

input:focus,
select:focus {
  outline: 2px solid rgba(79, 140, 255, 0.75);
}

button {
  border: none;
  padding: 0 18px;
  background: var(--panel);
  color: var(--text);
  font-weight: 700;
  cursor: pointer;
  box-shadow: var(--shadow-out);
}

button:hover {
  background: rgba(60, 64, 72, 0.96);
}

/* GALLERY */

.count {
  padding: 18px 18px 0;
  color: var(--muted);
  font-size: 14px;
}

.grid {
  padding: 22px 18px 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 18px;
}

.card {
  position: relative;
  min-height: 150px;
  border-radius: 16px;
  overflow: hidden;
  background: var(--panel);
  box-shadow: var(--shadow-out);
  cursor: pointer;
  transform: translateZ(0);
  -webkit-tap-highlight-color: transparent;
}

.card:hover {
  transform: translateY(-4px);
}

.photo {
  display: block;
  width: 100%;
  height: 150px;
  object-fit: cover;
  opacity: 1;
  transition: opacity 0.25s ease;
  pointer-events: none;
}

/* LOADER */

.card-loader {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #25282e;
  color: rgba(255,255,255,0.75);
  font-size: 13px;
  font-weight: 700;
  pointer-events: none;
}

.card-loader span {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255,255,255,0.08);
}

.loaded-card .card-loader {
  opacity: 0;
  pointer-events: none;
}

.loading-card .photo {
  opacity: 0;
}

.loaded-card .photo {
  opacity: 1;
}

.image-error .card-loader {
  opacity: 1;
  color: #ffb4b4;
}

/* SENTINEL */

.gallery-sentinel {
  display: none;
  margin: 0 auto 34px;
  padding: 12px 18px;
  max-width: 360px;
  text-align: center;
  color: var(--muted);
  font-size: 13px;
  border-radius: 999px;
  background: rgba(20, 22, 26, 0.62);
  backdrop-filter: blur(10px);
}

/* FOOTER */

.site-footer {
  text-align: center;
  padding: 22px;
  color: var(--muted);
}

/* LIGHTBOX */

.lightbox {
  position: fixed;
  inset: 0;
  display: none;
  z-index: 9999;
  background: rgba(0,0,0,0.96);
  touch-action: none;
}

.lightbox.open {
  display: block;
}

.lightbox-stage {
  position: fixed;
  inset: 0;
  z-index: 10000;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 82px 96px 86px;
}

.lightbox-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 12px;
  background: #050505;
  box-shadow: 0 30px 90px rgba(0,0,0,0.65);

  opacity: 0;
  transform: scale(0.985);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.lightbox-image.visible {
  opacity: 1;
  transform: scale(1);
}

/* CONTROLES LIGHTBOX */

.lightbox-close,
.lightbox-nav,
.lightbox-toolbar,
.lightbox-caption {
  position: fixed;
  z-index: 10010;
}

.lightbox-close,
.lightbox-nav,
.lightbox-toolbar button,
.slideshow-duration {
  background: rgba(18, 20, 24, 0.92) !important;
  color: white !important;
  border: 1px solid rgba(255,255,255,0.22) !important;
  box-shadow: 0 10px 35px rgba(0,0,0,0.55) !important;
  backdrop-filter: blur(10px);
}

.lightbox-close {
  top: 18px;
  right: 18px;
  width: 54px;
  height: 54px;
  border-radius: 999px;
  font-size: 38px;
  line-height: 1;

  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-nav {
  top: 50%;
  transform: translateY(-50%);
  width: 54px;
  height: 76px;
  border-radius: 18px;
  font-size: 52px;
  line-height: 1;
}

.lightbox-prev {
  left: 22px;
}

.lightbox-next {
  right: 22px;
}

.lightbox-toolbar {
  top: 18px;
  left: 18px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.lightbox-toolbar button {
  height: 44px;
  border-radius: 999px;
  padding: 0 16px;
  font-weight: 800;
}

.lightbox-toolbar button.active {
  background: var(--accent) !important;
}

.slideshow-duration {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.slideshow-duration select {
  min-height: 30px;
  height: 30px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(255,255,255,0.08);
  box-shadow: none;
}

.lightbox-caption {
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  max-width: calc(100vw - 40px);
  padding: 11px 16px;
  border-radius: 16px;
  background: rgba(18, 20, 24, 0.92);
  color: white;
  text-align: center;
  box-shadow: 0 10px 35px rgba(0,0,0,0.55);
  backdrop-filter: blur(10px);
}

#lightboxTitle {
  font-weight: 800;
}

#lightboxMeta {
  margin-top: 4px;
  color: var(--muted);
  font-size: 13px;
}

/* FAUX PLEIN ÉCRAN / PROJECTION */

.lightbox.fullscreen-mode {
  background: black;
}

.lightbox.fullscreen-mode .lightbox-stage {
  padding: 0;
}

.lightbox.fullscreen-mode .lightbox-image {
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  border-radius: 0;
  box-shadow: none;
}

/* MOBILE / IPHONE */

@media (max-width: 900px) {
  body.has-bg {
    background-attachment: scroll;
  }

  .site-header {
    padding: 22px 16px 16px;
    text-align: left;
  }

  .site-header h1 {
    font-size: 24px;
  }

  .site-header p {
    font-size: 14px;
  }

  .filters-panel {
    position: relative;
    padding: 12px;
  }

  .filters-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  input,
  select,
  button {
    min-height: 46px;
    font-size: 15px;
  }

  .count {
    padding: 14px 12px 0;
    font-size: 13px;
  }

  .grid {
    grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
    gap: 12px;
    padding: 14px 12px 18px;
  }

  .card {
    min-height: 118px;
    border-radius: 14px;
  }

  .card:hover {
    transform: none;
  }

  .photo {
    height: 118px;
  }

  .card-loader {
    font-size: 12px;
  }

  .gallery-sentinel {
    margin-bottom: 24px;
    max-width: calc(100vw - 32px);
  }

  .lightbox-stage {
    padding: 72px 0 120px;
  }

  .lightbox-image {
    max-width: 100vw;
    max-height: calc(100vh - 192px);
    border-radius: 0;
  }

  .lightbox-close {
    top: 12px;
    right: 12px;
    width: 54px;
    height: 54px;
    font-size: 40px;
  }

  .lightbox-nav {
    width: 44px;
    height: 62px;
    font-size: 42px;
    border-radius: 14px;
  }

  .lightbox-prev {
    left: 8px;
  }

  .lightbox-next {
    right: 8px;
  }

  .lightbox-toolbar {
    top: auto;
    left: 10px;
    right: 10px;
    bottom: 58px;

    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .lightbox-toolbar button {
    height: 40px;
    min-height: 40px;
    padding: 0 12px;
    font-size: 13px;
  }

  .slideshow-duration {
    height: 40px;
    font-size: 12px;
  }

  .slideshow-duration select {
    height: 30px;
    min-height: 30px;
    font-size: 12px;
  }

  .lightbox-caption {
    bottom: 10px;
    max-width: calc(100vw - 20px);
    padding: 8px 12px;
    font-size: 12px;
  }

  #lightboxMeta {
    font-size: 11px;
  }
}
/* MEDIA / VIDEO + LIGHTBOX V2 */
.video-card::after {
  content: "▶";
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 46px;
  color: rgba(255,255,255,0.92);
  text-shadow: 0 8px 26px rgba(0,0,0,0.75);
  pointer-events: none;
}

.video-thumb {
  width: 100%;
  object-fit: cover;
  background: #050505;
}

.media-badge {
  position: absolute;
  left: 8px;
  bottom: 8px;
  z-index: 3;
  padding: 5px 8px;
  border-radius: 999px;
  background: rgba(0,0,0,0.65);
  color: white;
  font-size: 12px;
  font-weight: 800;
  pointer-events: none;
}

.lightbox-video {
  display: none;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 12px;
  background: #050505;
  box-shadow: 0 30px 90px rgba(0,0,0,0.65);
  opacity: 0;
  transition: opacity 0.3s ease;
  transform-origin: center center;
}

.lightbox-video.visible {
  display: block;
  opacity: 1;
}

.lightbox.is-video .lightbox-image {
  display: none;
}

.lightbox:not(.is-video) .lightbox-video {
  display: none;
}

.lightbox.controls-hidden .lightbox-close,
.lightbox.controls-hidden .lightbox-nav,
.lightbox.controls-hidden .lightbox-toolbar,
.lightbox.controls-hidden .lightbox-caption {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.18s ease;
}

.lightbox.fullscreen-mode .lightbox-video {
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  border-radius: 0;
  box-shadow: none;
}

.lightbox.fullscreen-mode .lightbox-image,
.lightbox-image,
.lightbox-video {
  transform-origin: center center;
}

@media (max-width: 900px) {
  .lightbox-video {
    max-width: 100vw;
    max-height: calc(100vh - 192px);
    border-radius: 0;
  }
}
