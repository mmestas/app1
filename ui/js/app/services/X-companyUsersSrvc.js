// NOTE: Not in use and not finished
//NOTE: Possibly use in place of rootscope for this in ui-router

app.factory('companyUsersSrvc', function() {
    return {
        companyUsers: function() {
          if($rootScope.rootCompanyUsers) {}
          else {
            apiSrvc.getData('CoNameGetCompanyUsers').then(function(response){
              $rootScope.rootCompanyUsers = response.data;
              console.log($rootScope.rootCompanyUsers);
            });
          }
        }
    };
});
