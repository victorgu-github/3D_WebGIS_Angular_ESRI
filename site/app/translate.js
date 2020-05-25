'use strict';

module.exports = function ($translateProvider) {
  // English by default
  let lang = window.localStorage.lang || 'en';
  if (process.env.SHANGHAI) {
    lang = 'cn';
  }
  $translateProvider.preferredLanguage(lang);
  $translateProvider.fallbackLanguage(['en']);
  $translateProvider.useStaticFilesLoader({
    prefix: '/assets/i18n/',
    suffix: '.json'
  });
  $translateProvider.useSanitizeValueStrategy('escapeParameters');
};
