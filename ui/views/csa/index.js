app.controller('csaCtrl', function($rootScope, $scope, $state, $stateParams, apiSrvc, commonFnSrvc, $filter, blockUI, $http, $mdDialog, $location, authSrvc, envSrvc, config) {

  $scope.csaInit = function() {
    authSrvc.getUserInfo($scope);
  }

  $scope.getUsersForImpersonation = function(username) {
    var objectToPost = {keyword: username};
    return $http
     // .get(__env.apiUrl+'/index.asp?remoteCall=CoNameGetImpersonateUsers&username='+username)
     .post(__env.apiUrl+'/index.asp?remoteCall=CoNameGetImpersonateUsers', { jsonData : JSON.stringify(objectToPost) })
     .then(function(response) {
       return response.data.data;
     });
  }

  $scope.setPerson = function(selectedUser) {
    $scope.selectedUser = selectedUser;
  }

  $scope.impersonateUser = function() {
    var userName = $scope.selectedUser.username;
    var gpKey = $scope.selectedUser.gpKey;
    // apiSrvc.getData('CoNameProcessImpersonateUser&username='+userName).then(function(response){
    apiSrvc.getData('CoNameProcessImpersonateUser&gpKey='+gpKey).then(function(response){
      if(response.errors.length > 0) {
        alert('there was an error');
      }
      else if(response.data.isConsultant) {
        $state.go('consultant');
      }
      else if(response.data.allowAccess) {
        $state.go('company');
      }
      else {}
    });
  }

  $scope.impersonateDemoCompanyUser = function() {
    apiSrvc.getData('CoNameProcessImpersonateCompanyUser').then(function(response){
      if(response.errors.length > 0) {}
      else {
        $state.go('company');
      }
    })
  }
  $scope.impersonateDemoConsultant = function() {
    apiSrvc.getData('CoNameProcessImpersonateConsultant').then(function(response){
      if(response.errors.length > 0) {}
      else {
        $state.go('consultant');
      }
    })
  }
});
