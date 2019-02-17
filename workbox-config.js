module.exports = {
  "globDirectory": "dist/",
  "globPatterns": [
    "**/*.{html,png,svg,jpg,css,xml,txt,json,webapp,js}"
  ],
  "swDest": "dist/sw.js",
  "swSrc": "src/assets/js/sw.js",
  "globIgnores": [
    "dist/workbox-config.js",
    "dist/assets/scripts/sw.js"
  ]
};