import "airbnb-browser-shims";
import "./modules/util";

if ("production" !== process.env.NODE_ENV) {
  console.log("Looks like we are in development mode!");
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(registration => {
        console.log(`Service Worker registered! Scope: ${registration.scope}`);
      })
      .catch(err => {
        console.log(`Service Worker registration failed: ${err}`);
      });
  });
}
