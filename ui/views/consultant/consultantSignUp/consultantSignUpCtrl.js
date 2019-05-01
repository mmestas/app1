app.controller('consultantSignUpCtrl', function($rootScope, $scope, $state, $stateParams, apiSrvc, commonFnSrvc, NgTableParams, Upload, upload, $filter, blockUI, $http, $mdDialog, linkedInService, $location, $anchorScroll, authSrvc, envSrvc, config) {

  eScope = $scope;

  $scope.liAuth = function() {
    IN.User.authorize(function(){
   });
   $scope.getLinkedInData();
 };

  $scope.getLinkedInData = function(){
    linkedInService.OnLinkedInFrameworkLoad().then(function(profile){
      $scope.linkedInProfileData = profile;
      if($scope.linkedInProfileData) {
      }
    });
  };
	$scope.logoutLinkedIn = function() {
		IN.User.logout();
		delete $rootScope.userprofile;
		$rootScope.loggedUser = false;
	};

  $scope.showLinkedInStep = false;
  $scope.duplicateEmails = false;
  $scope.goToStepLinkedIn = function(consultantInfo) {
    $scope.duplicateEmails = false;
    var email = {
      email: consultantInfo.email
    }
    apiSrvc.sendPostData('CoNameSetVerifyConsultantSignUp', email).then(function(response) {
      if(response.errors.length > 0) {
        $scope.duplicateEmails = true;
      }
      else {
        $scope.showLinkedInStep = true;
      }
    });
  };

  $scope.CoNameSetConsultantSignUp = function(consultantInfo, linkedInData) {
    if(linkedInData.positions._total > 0) {
      if(linkedInData.positions.values[0].isCurrent && !linkedInData.positions.values[0].endDate) {
        linkedInData.positions.values[0].endDate = {};
        linkedInData.positions.values[0].endDate.month = 0;
        linkedInData.positions.values[0].endDate.year = 0;
      }
      var parameters = {
        linkedInId: linkedInData.id,
        linkedInEmail: linkedInData.email,
        linkedInLocation: linkedInData.location.name,
        linkedInPictureUrl: linkedInData.photo,
        linkedInTitle: linkedInData.positions.values[0].title,
        linkedInCompany: linkedInData.positions.values[0].company.name,
        linkedInStartDateMonth: linkedInData.positions.values[0].startDate.month,
        linkedInStartDateYear: linkedInData.positions.values[0].startDate.year,
        linkedInEndDateYear: linkedInData.positions.values[0].endDate.month,
        linkedInEndDate: linkedInData.positions.values[0].endDate.year,
        linkedInIsCurrent: linkedInData.positions.values[0].isCurrent,
        linkedInSummary: linkedInData.summary,
        linkedInPublicProfileUrl: linkedInData.publicProfileUrl,
        firstName: consultantInfo.firstName,
        lastName: consultantInfo.lastName,
        email: consultantInfo.email,
        password: consultantInfo.password,
        companyName: consultantInfo.companyName,
        referralCode: consultantInfo.referralCode
      }
    }
    else {
      var parameters = {
        linkedInId: linkedInData.id,
        linkedInEmail: linkedInData.email,
        linkedInLocation: linkedInData.location.name,
        linkedInPictureUrl: linkedInData.photo,
        linkedInSummary: linkedInData.summary,
        linkedInPublicProfileUrl: linkedInData.publicProfileUrl,
        firstName: consultantInfo.firstName,
        lastName: consultantInfo.lastName,
        email: consultantInfo.email,
        password: consultantInfo.password,
        companyName: consultantInfo.companyName,
        referralCode: consultantInfo.referralCode
      }
    }

    apiSrvc.sendPostData('CoNameSetConsultantSignUp', parameters).then(function(response) {
      if(response.errors.length  > 0) {
      }
      else {
        $state.go('consultant');
      }
    })
  };
  $scope.CoNameSetConsultantSignUpWithoutLinkedIn = function(consultantInfo, signUpLocation) {
    var parameters = {
      firstName: consultantInfo.firstName,
      lastName: consultantInfo.lastName,
      email: consultantInfo.email,
      password: consultantInfo.password,
      companyName: consultantInfo.companyName,
      referralCode: consultantInfo.referralCode
    }
    apiSrvc.sendPostData('CoNameSetConsultantSignUp', parameters).then(function(response) {
      if(response.errors > 0) {
      }
      else {
        $state.go('consultant', {signUpLocation: signUpLocation});
      }
    })
  };

  $scope.goToConsultantMarketingSignUp = function() {
    $location.hash('marketingConsultantSignUp');
    $anchorScroll();
  }
// End of Controller
});
