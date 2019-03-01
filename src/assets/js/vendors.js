import LogRocket from "logrocket";
import * as Sentry from '@sentry/browser';

LogRocket.init("aupmtr/yewtree-web");

LogRocket.identify('1234', {
  name: 'Mathew Teague',
  email: 'matehw.teague@yewtreeweb.co.uk'
});

Sentry.init({
  dsn: 'https://5369c98ddf5d4da8a6d896fe552afab9@sentry.io/1406163'
});
