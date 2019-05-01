app.controller('companyInviteValidationCtrl', function($rootScope, $scope, $state, $stateParams, apiSrvc, commonFnSrvc, $mdDialog, $mdToast, $location, authSrvc, envSrvc, config) {
  $scope.companyInviteInit = function() {
    var parameterVariable = $location.search();
    $scope.CompanyInvitationId = parameterVariable.CompanyInvitationId;
    $scope.companyInviteValidation();
  }

  $scope.companyInviteValidation = function() {
    apiSrvc.getData('CoNameCompanyInviteValidation&CompanyInvitationId='+$scope.CompanyInvitationId).then(function(response){
      if(response.errors.length > 0) {
        console.log('there was an error');
      }
      else {
        $rootScope.userInfo = response.data;
      }
    });
  }
//**********************************************************************************************************//
//********************************************* AGREE TO TERMS *********************************************//
//**********************************************************************************************************//
  $scope.agreeToTerms = function(password) {
    console.log(password);
      apiSrvc.getData('CoNameSetInvitedCompany&password='+password).then(function(response){
        console.log(response);
        if(response.errors.length > 0) {
        }
        else {
          $state.go('company');
        }
    });
  }


}); //End of Controller
