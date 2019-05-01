app.controller('teammateMatchCtrl', function($rootScope, $scope, $state, $stateParams, apiSrvc, commonFnSrvc, Upload, upload, $filter, blockUI, $http, $mdDialog, $location, $q, $timeout, authSrvc, envSrvc, config) {

  $scope.teammateMatchInit = function() {
    authSrvc.getUserInfo($scope);
    $scope.CoNameGetTeamMateMatchOpportunities();
    $scope.CoNameGetTeamMateMatchSearchs();
  };
  //Get the Company Info
  $scope.CoNameGetCompanyProfile = function(userInfo) {
    apiSrvc.getData('CoNameGetCompanyProfile&gpKey='+userInfo.Company.gpKey).then(function(response) {
      console.log(response.data);
      $scope.companyInfo = response.data;
      $rootScope.companyInfo = response.data;
    })
  }

  $scope.CoNameGetTeamMateMatchOpportunities = function() {
    apiSrvc.getData('CoNameGetTeamMateMatchOpportunities').then(function(response) {
      $scope.opportunities = response.data;
    })
  }
  //Saved Searches
  $scope.CoNameGetTeamMateMatchSearchs = function() {
    apiSrvc.getData('CoNameGetTeamMateMatchSearchs').then(function(response) {
      $scope.savedSearches = response.data;
    })
  }
  $scope.CoNameSetTeamMateMatchSearch = function() {

  }
  $scope.CoNameProcessTeamMateSearch = function(values) {
    console.log(values);
    if(!values.rfpNumber) {
      values.rfpNumber = '';
    }
    if(!values.opportunity.name) {
      values.opportunity.name = '';
      values.opportunity.gpKey = '';
      values.opportunity.source = null;
    }
    var objectToPost = {
      name: values.opportunity.name,
      gpKey: values.opportunity.gpKey,
      source: values.opportunity.source,
      rfpNumber: values.rfpNumber
    }
    apiSrvc.sendPostData('CoNameProcessTeamMateSearch', objectToPost).then(function(response){
      console.log(response);
    });
  }
  $scope.CoNameProcessSendTeamMateMessage = function() {

  }



  // Open the Modal //
  // $scope.openModal = function(ev, result) {
  //   $mdDialog.show({
  //     controller: modalCtrl,
  //     templateUrl: '/views/teammateMatch/modal.html',
  //     parent: angular.element(document.querySelector('.custom-detailWrapper')),
  //     targetEvent: ev,
  //     clickOutsideToClose:true,
  //     locals: {
  //         result: result
  //     },
  //     onRemoving: function (event, removePromise) {
  //     }
  //   });
  // };

  $scope.teammateMatchInit();
});
