app.controller('consultantLegalDocsCtrl', function($scope, $rootScope, $state, $stateParams, $document, apiSrvc, commonFnSrvc,  NgTableParams, Upload, upload, $filter, blockUI, $http, $mdDialog, $mdToast, $timeout, $q,  $location, authSrvc, envSrvc, config) {

  $scope.myLegalDocsInit = function() {
    $scope.CoNameGetConsultantEngagementDocuments();
    $scope.CoNameGetConsultantPaymentDeliveryReceipts();
    $scope.CoNameGetUserInformation();
  }

  $scope.CoNameGetConsultantEngagementDocuments = function() {
    apiSrvc.getData('CoNameGetConsultantEngagementDocuments').then(function(response){
      $scope.projectsWithSignatures = response.data;
    });
  }

  $scope.CoNameGetConsultantPaymentDeliveryReceipts = function() {
    apiSrvc.getData('CoNameGetConsultantPaymentDeliveryReceipts').then(function(response){
      $scope.consultantInvoices = response.data;
    });
  }


  $scope.CoNameGetUserInformation = function() {
    apiSrvc.getData('CoNameGetUserInformation').then(function(response){
      if(response.data.isAuthenticated) {
        $scope.userInfo = response.data;
        $scope.imageUrl = response.data.ImageFilename;
      }
    });
  }
});
