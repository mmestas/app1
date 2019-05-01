app.service('authSrvc', function ($http, apiSrvc, commonFnSrvc, blockUI, $q, $state) {

  this.getUserInfo = function(scope) {
    apiSrvc.getData('CoNameGetUserInformation').then(function(response){
      if(response.data.isAuthenticated) {
        scope.userInfo = response.data;
        return scope.userInfo;
      }
    })
  };
  this.getUserInfoForProfile = function(scope) {
    apiSrvc.getData('CoNameGetUserInformation').then(function(response){
      if(response.data.isAuthenticated) {
        scope.userInfo = response.data;
        var gpKey = response.data.gpKey;
        apiSrvc.getData('CoNameGetUserProfile&gpKey='+gpKey).then(function(response){
          scope.profileInfo = response.data;
          return scope.profileInfo;
        });
        return scope.userInfo;
      }
    })
  };
  this.getUserInfoForCompanyInfo = function(scope, functionToGetCalled) {
    apiSrvc.getData('CoNameGetUserInformation').then(function(response){
      if(response.data.isAuthenticated) {
        scope.userInfo = response.data;
        var userInfo = response.data;
        var gpKey = response.data.gpKey;
        //1.8.19
        if(userInfo.isConsultant) {
          if(functionToGetCalled) {
            functionToGetCalled();
          }

        }
        else {
          apiSrvc.getData('CoNameGetCompanyProfile&gpKey='+userInfo.Company.gpKey).then(function(response) {
            scope.companyInfo = response.data;
            if(functionToGetCalled) {
              functionToGetCalled(scope.companyInfo);
            }
            return scope.companyInfo;
          })
        }

        return scope.userInfo;
      }
    })
  };

  this.getUserInfoForFunction = function(scope, functionToGetCalled) {

    apiSrvc.getData('CoNameGetUserInformation').then(function(response){
      if(response.data.isAuthenticated) {
        scope.userInfo = response.data;
        functionToGetCalled();
      }
      else {
        //Redirect to Login
        // return false;
      }
    });
  };

}); //End of service
