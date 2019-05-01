app.controller('signUpCtrl', function($rootScope, $scope, $state, $stateParams, $location, $anchorScroll, apiSrvc, NgTableParams, Upload, upload, $filter, blockUI, $timeout, $http, $mdDialog, $mdToast, $document, authSrvc, envSrvc, config) {

  $scope.nonAccessLogout = function() {
    apiSrvc.getData('CoNameProcessLogout').then(function(response){
      $state.go('signIn');
    });
  };

  /************************************************************************************************************/
  /*************************************************** INIT  **************************************************/
  /************************************************************************************************************/
    //Step 1
    $scope.companySAMInit = function() {
        var url = $location.path().split('/');
        $scope.appInfo.referralCode = url[2];
    };
    //Step 2
    $scope.planSelectionStep = function() {
      if($stateParams.marketingSite == 1) { //must be == not === because # is sometimes a string
        fbq('track', 'AddPaymentInfo');
      }
      $scope.CoNameGetUserInformation();
      $scope.getPaymentForm();
      $scope.CoNameGetItems();
      $scope.CoNameGetContent();
    };
    //Step 2 with Referral code
    $scope.planReferralPurchase = function() {
      if($stateParams.marketingSite == 1) { //must be == not === because # is sometimes a string
        fbq('track', 'AddPaymentInfo');
      }
      $scope.CoNameGetUserInformation();
      $scope.getPaymentForm();
      $scope.CoNameGetItems();
      $scope.CoNameGetContent();

      //IMPLEMENT WHEN REMOTE IS BUILT
      apiSrvc.getData('CoNameGetUSBCPricingPackages').then(function(response) {
        if(response.errors.length > 0) {

        }
        else {
          $scope.appInfo.item = response.data[0];
        }

      })

    };

  /************************************************************************************************************/
  /****************************************** Sign Up - Change Views  *****************************************/
  /************************************************************************************************************/
    //Right now only being used in responsive menu
    $scope.goToStep1 = function() {
      $state.go('step1-Company', {codeId: null});
    };

  /************************************************************************************************************/
  /*************************************************** STEPS **************************************************/
  /************************************************************************************************************/
    //Remote is called to verify email and sends an email notification - redirects to confirm Email page
    $scope.CoNameSignUpStep01 = function(appInfo, ev) {

      appInfo.marketingSite = $stateParams.marketingSite;
      $scope.differentEmailDomains = false;
      apiSrvc.sendPostData('CoNameProcessCompanySignUpStep01', appInfo).then(function(response) {
          if(response.errors.length > 0) {
            if(response.errors[0].number === 340) {
              $scope.differentEmailDomains = true;
            }
            else if(response.errors[0].number === 330) {
              $scope.companyAdmin = response.data.firstName + " " + response.data.lastName;
              $mdToast.show({
                  hideDelay   : false,
                  position    : 'bottom',
                  parent : $document[0].querySelector('.custom-btnWrapper'),
                  scope:$scope,
                  preserveScope:true,
                  controller  : companyExistsInSystemToast ,
                  template :  '<md-toast class="md-warning-toast-theme"><div class="md-toast-text flex">This Cage Code is not found in the SAM database</div><div class="md-toast-text "><md-button ng-click="close()">Okay</md-button></div></md-toast>'
                });
               function companyExistsInSystemToast ($scope, $rootScope, apiSrvc, $mdDialog, $mdToast) {
                 $scope.close = function() {$mdToast.hide();}
               }
            }
            else if(response.errors[0].number === 360) {
              $scope.companyAdmin = response.data.firstName + " " + response.data.lastName;
              $mdToast.show({
                  hideDelay   : false,
                  position    : 'bottom',
                  parent : $document[0].querySelector('.custom-btnWrapper'),
                  scope:$scope,
                  preserveScope:true,
                  controller  : companyExistsInSystemToast ,
                  template :  '<md-toast class="md-warning-toast-theme"><div class="md-toast-text flex">Your company already has a registered account in CompanyNme.  A notification has been sent to {{companyAdmin}} to add you to the account.</div><div class="md-toast-text "><md-button ng-click="close()">Okay</md-button></div></md-toast>'
                });
               function companyExistsInSystemToast ($scope, $rootScope, apiSrvc, $mdDialog, $mdToast) {
                 $scope.close = function() {$mdToast.hide();}
               }
            }
            else if(response.errors[0].number === 380) {
              $mdToast.show({
                  hideDelay   : false,
                  position    : 'bottom',
                  parent : $document[0].querySelector('.custom-btnWrapper'),
                  scope:$scope,
                  preserveScope:true,
                  controller  : companyExistsInSystemToast ,
                  template :  '<md-toast class="md-warning-toast-theme"><div class="md-toast-text flex">This user already has an account in our system. If you have forgotten your username or password, please click the link on the login page to retrieve your information.</div><div class="md-toast-text "><md-button ng-click="close()">Okay</md-button></div></md-toast>'
                });
               function companyExistsInSystemToast ($scope, $rootScope, apiSrvc, $mdDialog, $mdToast) {
                 $scope.close = function() {$mdToast.hide();}
               }
            }
          }
          else {
            if($stateParams.marketingSite == 1) {
              $mdDialog.show({
                controller: companyMarketingSignUpCtrl,
                templateUrl: '/views/company/signUpPro/marketingCompanyConfirmDialog.html',
                parent: angular.element(document.querySelector('#companyMarketingSite')),
                targetEvent: ev,
                clickOutsideToClose:true,
              });
              function companyMarketingSignUpCtrl($scope, $mdDialog, apiSrvc) {
                $scope.hide = function() {$mdDialog.hide();};
                $scope.cancel = function() {$mdDialog.cancel();};
              };
            }

            else {
              $state.go('confirmEmail');
            }

          }
      })

    };
    //Once email verification link is clicked, link takes them to the verification page which will redirect them to Step 2
    $scope.verify = function() {
      var paramterVariable = $location.search();
      $rootScope.signUpId = paramterVariable.SignUpId;
      var signUpId = paramterVariable.SignUpId;
      var marketingSite = paramterVariable.marketingSite;
      var referralCode = paramterVariable.referralCode;
      var usbc = paramterVariable.USBC;
      $scope.verifyMessage = 'Please be patient.  Your credentials are being validated and will be redirected when finished.';
      blockUI.start(" ");
      apiSrvc.getData('CoNameProcessSignUpIdValidation&SignUpId='+signUpId).then(function(response){
        if(response.errors.length > 1) {
          $scope.verifyMessage = 'There was a problem with your email.  Please contact CompanyNme for more information.';
          blockUI.stop();
        }
        else {
          blockUI.stop();
          if(marketingSite == 1) {//must be == not ===
            // this came from the marketing site
            fbq('track', 'CompleteRegistration');
          }

          if(usbc == 1) {
            $state.go('step4-USCB', {marketingSite: marketingSite});
          }
          else  {
            $state.go('step4-Company', {marketingSite: marketingSite});
          }

        }
      })
    };



  /************************************************************************************************************/
  /************************************************* GET DATA  ************************************************/
  /************************************************************************************************************/
    //Get User Info - used after step 1
    $scope.CoNameGetUserInformation = function() {
      apiSrvc.getData('CoNameGetUserInformation').then(function(response){
        $rootScope.userInfo = response.data;
        $rootScope.isConsultant = response.data.isConsultant;
        $rootScope.isCompany = !response.data.isConsultant;
        $rootScope.authenticated = response.data.isAuthenticated;
        $rootScope.allowedAccess = response.data.allowAccess;
        if(response.data.isAuthenticated && response.data.isConsultant) {$state.go('consultant');}
        if(response.data.isAuthenticated && !response.data.isConsultant && response.data.allowAccess) {$state.go('company');}
        else {}
      });
    };
    //Get Plans
    $scope.CoNameGetItems = function() {
      apiSrvc.getData('CoNameGetPricingPackages').then(function(response){
        $scope.licenses = response.data;
      });
    };
  /************************************************************************************************************/
  /************************************************** ECOMMERCE ***********************************************/
  /************************************************************************************************************/
    $scope.CoNameGetContent = function() {
      apiSrvc.getData('CoNameGetContent').then(function(response){
        $scope.contensiveContent = response.data;
        $scope.thankYouContent = response.data.SignUpFormThankYou;
        $scope.BankRoutingContentInformation = response.data.BankRoutingContentInformation;
        $scope.ItemContentInformation = response.data.ItemContentInformation;
        $scope.PaymentAcknowledgementContent = response.data.PaymentAcknowledgementContent;
      });
    };
    $scope.getPaymentForm = function() {
      apiSrvc.getData('CoNameGetPaymentFields')
      .then(function(response) {
        $('#js-ecommercePayments').html(response.data);
      });
    };
    $scope.ccError = false;
    $scope.formNotComplete = false;
    $scope.submitPayment = function(appInfo) {
      $scope.errorMsg = '';
      $scope.ccError = false;
      var userInfo = $rootScope.userInfo;
      var okayToSubmit = false;
      if(userInfo.isAuthenticated) {
        if(appInfo.item) {
          if(appInfo.item.gpKey === "{97123f6d-98c8-40fa-a00b-03dc9db0dc04}") { // if Freemium (free plan)
            okayToSubmit = true;
          }
          else { // A plan to purchase
            if($("input[name='onDemandMethodTypeId']:checked").val() == 1) {
              // Credit Card
              if($("#js-ecommercePayments #cardType").val().length === 0 ){
                okayToSubmit = false;
                $("#js-ecommercePayments #cardType").addClass('custom-errOutline');
              }
              else {okayToSubmit = true; $("#js-ecommercePayments #cardType").removeClass('custom-errOutline');}

              if($("#js-ecommercePayments #cardNumber").val().length === 0 ){
                okayToSubmit = false;
                $("#js-ecommercePayments #cardNumber").addClass('custom-errOutline');
              }
              else {okayToSubmit = true; $("#js-ecommercePayments #cardNumber").removeClass('custom-errOutline');}

              if($("#js-ecommercePayments #cardExpirationMonth").val().length === 0 ){
                okayToSubmit = false;
                $("#js-ecommercePayments #cardExpirationMonth").addClass('custom-errOutline');
              }
              else {okayToSubmit = true; $("#js-ecommercePayments #cardExpirationMonth").removeClass('custom-errOutline');}

              if($("#js-ecommercePayments #cardExpirationYear").val().length === 0 ){
                okayToSubmit = false;
                $("#js-ecommercePayments #cardExpirationYear").addClass('custom-errOutline');
              }
              else {okayToSubmit = true; $("#js-ecommercePayments #cardExpirationYear").removeClass('custom-errOutline');}

              if($("#js-ecommercePayments #cardCVV").val().length === 0 ){
                okayToSubmit = false;
                $("#js-ecommercePayments #cardCVV").addClass('custom-errOutline');
              }
              else {okayToSubmit = true; $("#js-ecommercePayments #cardCVV").removeClass('custom-errOutline');}

              if($("#js-ecommercePayments #cardName").val().length === 0 ){
                okayToSubmit = false;
                $("#js-ecommercePayments #cardName").addClass('custom-errOutline');
              }
              else {okayToSubmit = true; $("#js-ecommercePayments #cardName").removeClass('custom-errOutline');}
            }
            else if($("input[name='onDemandMethodTypeId']:checked").val() == 2) {
              //BANK ACCOUNT
              if($("#js-ecommercePayments #onDemandMethodAchRoutingNumber").val().length === 0 ){
                okayToSubmit = false;
                $("#js-ecommercePayments #onDemandMethodAchRoutingNumber").addClass('custom-errOutline');
              }
              else {okayToSubmit = true; $("#js-ecommercePayments #onDemandMethodAchRoutingNumber").removeClass('custom-errOutline');}

              if($("#js-ecommercePayments #onDemandMethodAchAccountNumber").val().length === 0 ){
                okayToSubmit = false;
                $("#js-ecommercePayments #onDemandMethodAchAccountNumber").addClass('custom-errOutline');
              }
              else {okayToSubmit = true; $("#js-ecommercePayments #onDemandMethodAchAccountNumber").removeClass('custom-errOutline');}

              if($("#js-ecommercePayments #onDemandMethodAchAccountName").val().length === 0 ){
                okayToSubmit = false;
                $("#js-ecommercePayments #onDemandMethodAchAccountName").addClass('custom-errOutline');
              }
              else {okayToSubmit = true; $("#js-ecommercePayments #onDemandMethodAchAccountName").removeClass('custom-errOutline');}
            }

            var formSerializeData = $("#js-ecommercePayments").serialize();
            if(formSerializeData) {
              formSerializeData = '&' + formSerializeData;
            }

          }

          //could do this differently
          if(appInfo.item.name) {
            $scope.licenseNeeded = false;
          }
          else {
            $scope.licenseNeeded = true;
          }

          if(okayToSubmit) {
            apiSrvc.sendPostData('CoNameProcessCompanySignUpStep02' + formSerializeData, appInfo).then(function(response) {
              if(response.errors.length === 0) {
                if($stateParams.marketingSite == 1) { //must be == not ===
                  fbq('track', 'Subscribe');
                }
                $state.go('company');
              }
              else {
                $scope.ccError = true;
                $scope.errorMsg = response.errors[0].userMsg;
              }
            });
          }
          else {
            $scope.ccError = true;
            $scope.errorMsg = 'Please fill out all required information';
          }
        }
        else {
          // This is in two places due to a change in the sign up process
          // $scope.ccError = true;
          $scope.licenseNeeded = true;
          // $scope.errorMsg = 'Please select a plan';
        }
      }
      else {
        // console.log('you are not allowed to be here.');
        $state.go('signUp');
      }

    };

  /************************************************************************************************************/
  /*********************************************** Plan Selection *********************************************/
  /************************************************************************************************************/
    $rootScope.appInfo = {};
    $scope.displaylicenseAmount = function(license) {
      $scope.amountDue = license.UnitPrice;
    };
    $scope.planSelected = function(pos){
      $rootScope.appInfo.item = $scope.licenses[pos];
      $scope.displaylicenseAmount($rootScope.appInfo.item);
    };
  /************************************************************************************************************/
  /************************************************* INFO MODAL ***********************************************/
  /************************************************************************************************************/
    $scope.showLicenseInfo = function(ev) {
      $mdDialog.show({
        controller: DialogController,
        templateUrl: '/views/company/modals/licenseInfo.html',
        parent: angular.element(document.querySelector('#signUpStep4')),
        targetEvent: ev,
        clickOutsideToClose:true,
        locals: {
             contensiveContent: $scope.contensiveContent
           },
      });
    };
    function DialogController($scope, $mdDialog, apiSrvc, contensiveContent) {
      $scope.hide = function() {
        $mdDialog.hide();
      };

      $scope.cancel = function() {
        $mdDialog.cancel();
      };

      $scope.answer = function(answer) {
        $mdDialog.hide(answer);
      };
      $scope.thankYouContent = contensiveContent.SignUpFormThankYou;
      $scope.BankRoutingContentInformation = contensiveContent.BankRoutingContentInformation;
      $scope.ItemContentInformation = contensiveContent.ItemContentInformation;
      $scope.PaymentAcknowledgementContent = contensiveContent.PaymentAcknowledgementContent;
    };

    $scope.goToCompanyMarketingSignUp = function() {
      $location.hash('marketingCompanySignUp');
      $anchorScroll();
    };


// END of CONTROLLER
});
