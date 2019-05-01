app.controller('loginCtrl', function($rootScope, $scope, $state, $stateParams, apiSrvc, commonFnSrvc, NgTableParams, Upload, upload, $filter, blockUI, $http, $mdDialog, $location, authSrvc, envSrvc, config) {


  $scope.signUpLanding = function() {
    $scope.CoNameGetUserInformation();
  }
  $scope.signInInit = function() {
    $scope.CoNameGetUserInformation();
  }
  /************************************************************************************************************/
  /************************************************** SIGN IN *************************************************/
  /************************************************************************************************************/
  $scope.signInSubmit = function(signIn, invalid) {
    $scope.showLoginError = false;
    if(signIn.rememberme) {
    }
    else {
      signIn.rememberme = false;
    }
    if(invalid) {
    }
    else {
      apiSrvc.sendPostData('CoNameProcessLogin', signIn).then(function(response){
        $rootScope.isConsultant = response.data.isConsultant;
        $rootScope.isCompany = !response.data.isConsultant;

        if(response.errors.length > 0) {
          console.log('there was an error');
          $scope.showLoginError = true;
        }
        else if(response.data.isInImpersonateGroup && !response.data.allowAccess) {
          $state.go('csaDashboard');
        }
        else if(response.data.isConsultant) {
          $state.go('consultant');
          $scope.showLoginError = false;
        }
        else if(response.data.allowAccess) {
          $state.go('company');
          $scope.showLoginError = false;
        }
      });
    }
  }
  $scope.forgotPassLink = function() {
    $scope.hideSignInForm = true;
  }
  $scope.returnToSignIn = function() {
    $scope.hideSignInForm = false;
  }
  $scope.sendPassword = function(email, invalid) {
    if(invalid) {
    }
    else {
      apiSrvc.getData('CoNameProcessForgetPassword&email='+email).then(function(response){
        if(response.errors == 0) {
          $scope.passwordEmailSent = true;
          $state.go('signUp');
        }
        else {
          $scope.passwordEmailSent = false;
        }

      });
    }
  }
  $scope.CoNameGetUserInformation = function() {
    apiSrvc.getData('CoNameGetUserInformation').then(function(response){
      $rootScope.isConsultant = response.data.isConsultant;
      $rootScope.isCompany = !response.data.isConsultant;
      $rootScope.authenticated = response.data.isAuthenticated;
      $rootScope.allowedAccess = response.data.allowAccess;
      if(response.data.isAuthenticated && response.data.isConsultant) {console.log('is Consultant'); $state.go('consultant');}
      if(response.data.isAuthenticated && !response.data.isConsultant && response.data.allowAccess) {console.log('is Company'); $state.go('company');}
      if(response.data.isAuthenticated && !response.data.isConsultant && !response.data.allowAccess) {console.log('Company Sign Up'); $state.go('step2-Company');}
      else {}
    });
  }
  /************************************************************************************************************/
  /************************************* Sign Up - Go to SignUp Landing ************************************/
  /************************************************************************************************************/
  $scope.goToSignUpLanding = function() {
    $state.go('signUp');
  }
  /************************************************************************************************************/
  /************************************* Sign Up - Go to Company SignUp ************************************/
  /************************************************************************************************************/
  $scope.goToStep1 = function() {
    $state.go('step1-Company', {codeId: null});
  }

  /************************************************************************************************************/
  /************************************* Sign Up - Go to Consultant SignUp ************************************/
  /************************************************************************************************************/
  $scope.goToConsultantSignUp = function() {
    $state.go('consultantSignUp');
  }


//End of Controller
});
