(function (window) {
    window.__env = window.__env || {};
    if(
      (window.origin === 'https://www.appURL.com') ||
      (window.origin === 'https://appURL.com') ||
      (location.origin === 'https://www.appURL.com') ||
      (location.origin === 'https://appURL.com')
      ){
      console.log('Production');
      window.__env.apiUrl = '';
      window.__env.protocol = 'https';
      window.__env.protocolIncludeASP = false;
      window.__env.baseUrl = '';
      // Whether or not to enable debug mode
      // Setting this to false will disable console output
      window.__env.enableDebug = true;

      window.__env.pageTitle = "CompanyNme App";

      window.__env.linkedIn = {
        apiKey: "12345",
      };
    }
    else if((window.origin === 'http://appDevURL.com') || (location.origin === 'http://appDevURL.com')) {
      console.log('Staging');
      window.__env.apiUrl = '//appDevURL.com';
      window.__env.protocol = 'http';
      window.__env.protocolIncludeASP = false;
      window.__env.baseUrl = '';
      // Whether or not to enable debug mode
      // Setting this to false will disable console output
      window.__env.enableDebug = true;

      window.__env.pageTitle = "CompanyNme Staging";

      window.__env.linkedIn = {
        apiKey: "12345",
      };
    }
    else if((window.origin === 'http://appTestingURL.com') || (location.origin === 'http://appTestingURL.com')) {
      console.log('Testing');
      window.__env.apiUrl = '//appTestingURL.com';
      window.__env.protocol = 'http';
      window.__env.protocolIncludeASP = false;
      window.__env.baseUrl = '';
      // Whether or not to enable debug mode
      // Setting this to false will disable console output
      window.__env.enableDebug = true;

      window.__env.pageTitle = "CompanyNme Testing";

      window.__env.linkedIn = {
        apiKey: "12345",
      };
    }
    else if(location.hostname === 'localhost') {
      window.__env.apiUrl = '//appDevURL.com';
      window.__env.protocol = 'http';
      window.__env.protocolIncludeASP = false;
      window.__env.baseUrl = '';
      window.__env.enableDebug = true;
      window.__env.pageTitle = "CompanyNme Staging Local";
      window.__env.linkedIn = {
        apiKey: "12345",
      };
    }
    else {
      //Default to production
      window.__env.apiUrl = 'https://appURL.com';
      window.__env.protocol = 'https';
      window.__env.protocolIncludeASP = false;
      window.__env.baseUrl = '';
      window.__env.enableDebug = true;
      window.__env.pageTitle = "CompanyNme App";
      window.__env.linkedIn = {
      apiKey: "12345",
      };
    }



}(this));
