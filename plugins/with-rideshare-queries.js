const { withAndroidManifest } = require('expo/config-plugins');

module.exports = function withRideshareQueries(config) {
  return withAndroidManifest(config, config => {
    const manifest = config.modResults.manifest;
    manifest.queries ??= [];
    const packages = ['com.pathao.user', 'sinet.startup.inDriver', 'com.yandex.yango',
      'com.olacabs.customer', 'com.rapido.passenger', 'com.grabtaxi.passenger', 'com.gojek.app', 'com.careem.acma'];
    for (const packageName of packages) {
      if (!manifest.queries.some(query => query.package?.some(
        entry => entry.$['android:name'] === packageName,
      ))) {
        manifest.queries.push({ package: [{ $: { 'android:name': packageName } }] });
      }
    }
    return config;
  });
};
