app.controller('referenceRatingCtrl', function($rootScope, $scope, $state, $stateParams, $location, apiSrvc, commonFnSrvc, Upload, upload, $filter, blockUI, $http, $mdDialog, $location, authSrvc, envSrvc, config) {

  $scope.invitedReferenceInit = function() {

    var paramterVariable = $location.search();
    $scope.referenceInvitationId = paramterVariable.ReferenceInvitationId;
    apiSrvc.getData('CoNameProcessReferenceInvitation&ReferenceInvitationId='+$scope.referenceInvitationId).then(function(response){
      if(response.errors.length > 0) {
        $state.go('referenceError');
      }
      else {
        $scope.consultantInfo = response.data.consultantInformation;
      }
    });
  }

  $(".referenceReviewRating").rating({
    displayOnly: false,
    step: 0.5,
    starCaptions: {0.5: 'Unsatisfactory', 1: 'Very Poor', 1.5: 'Very Poor', 2: 'Poor', 2.5: 'Poor', 3: 'Ok', 3.5: 'Satisfactory', 4: 'Good', 4.5: 'Very Good', 5: 'Outstanding'}
  });
  $scope.referenceRating = {};

  $scope.submitReferenceRating = function(rating) {

    if(angular.element("#quality")[0].valueAsNumber) {
      rating.quality = angular.element("#quality")[0].valueAsNumber;
    }
    if(angular.element("#responsiveness")[0].valueAsNumber) {
      rating.responsiveness = angular.element("#responsiveness")[0].valueAsNumber;
    }
    if(angular.element("#timeliness")[0].valueAsNumber) {
      rating.timeliness = angular.element("#timeliness")[0].valueAsNumber;
    }
    if(angular.element("#cost")[0].valueAsNumber) {
      rating.cost = angular.element("#cost")[0].valueAsNumber;
    }

    upload({
        url: __env.apiUrl+'/index.asp?remoteCall=CoNameSetReferenceSurvey&RequestBinary=true',
        method: 'POST',
        data : {
          ReferenceInvitationId : $scope.referenceInvitationId,
          jsonData : JSON.stringify(rating)
        }
      }).then(function(response) {
        if(response.data.errors.length > 0) {
          console.log(response.data.errors);
        }
        else {
          $state.go('referenceThankYou');
        }
      });
  }


});
