app.controller('legalDocsCtrl', function($scope, $rootScope, $state, $stateParams, $document, apiSrvc, commonFnSrvc,  NgTableParams, Upload, upload, $filter, blockUI, $http, $mdDialog, $mdToast, $timeout, $q, $location, authSrvc, envSrvc, config) {

  $scope.legalDocsInit = function() {
    $scope.CoNameGetCompanyEngagementDocuments();
    authSrvc.getUserInfo($scope);
  }

  $scope.CoNameProcessLogout = function() {
    apiSrvc.getData('CoNameProcessLogout').then(function(response){
      $state.go('signIn');
    });
  }
  $scope.CoNameGetCompanyEngagementDocuments = function() {
    apiSrvc.getData('CoNameGetCompanyEngagementDocuments').then(function(response){
      $scope.projectsWithSignatures = response.data;
    });
  }
  $scope.CoNameGetCompanyApprovedPaymentDeliveryReceipts = function() {
    if($scope.approvedPayments) {

    }
    else {
      apiSrvc.getData('CoNameGetCompanyApprovedPaymentDeliveryReceipts').then(function(response) {
        $scope.approvedPayments = response.data;
      });
    }

  }

}); //End of Controller
