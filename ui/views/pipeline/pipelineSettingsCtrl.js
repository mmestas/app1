app.controller('pipelineSettingsCtrl', function($rootScope, $scope, $state, $stateParams, apiSrvc, commonFnSrvc, Upload, upload, $filter, blockUI, $http, $mdDialog, $location, $timeout, $q, authSrvc, envSrvc, config, $compile) {

  $scope.pipelineSettingsInit = function() {
    authSrvc.getUserInfoForCompanyInfo($scope);
    $scope.CoNameGetPipelineStages();
  }

  $scope.CoNameGetPipelineStages = function() {
    apiSrvc.getData('CoNameGetPipelineStages').then(function(response){
      $scope.pipelineStages = response.data.companyStages;
      $scope.numberOfStages = response.data.numberOfStages;
    })
  }

  $scope.CoNameSetPipelineStages = function(pipelineStages) {
    var numberOfStages = $scope.numberOfStages;
    objectToSend = {
      numberOfStages: numberOfStages,
      companyStages: pipelineStages
    }
    apiSrvc.sendPostData('CoNameSetPipelineStages', objectToSend).then(function(response){
      if(response.errors.length > 0) {}
      else {
        $state.go('pipeline');
      }
    })
  }

});
