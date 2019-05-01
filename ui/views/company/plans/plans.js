app.controller('plansCtrl', function($rootScope, $scope, $state, $stateParams, $location, $document, $timeout, apiSrvc, commonFnSrvc, passDataSrvc, NgTableParams, Upload, upload, $filter, blockUI, $http, $mdDialog, $mdToast, authSrvc, envSrvc, config) {

  $scope.initPlans = function() {
    $scope.CoNameGetItems();
    $scope.getPaymentForm();
    $scope.showPaymentFields = false;
  };

  $scope.CoNameGetItems = function() {
    // apiSrvc.getData('CoNameGetUpgradePlans').then(function(response){
    apiSrvc.getData('CoNameGetUpgradePricingPackages').then(function(response){
      $scope.licenseList = response.data;
      console.log($scope.licenseList);

      // Old conditions
      // angular.forEach($scope.licenseList, function(license) {
      //   if($scope.planInformation.UnitPrice < license.UnitPrice) {
      //     license.active = true;
      //   }
      //   else {
      //     license.active = false;
      //   }
      //   if(license.gpKey === '{97123f6d-98c8-40fa-a00b-03dc9db0dc04}') {
      //     $scope.basicUpgradeAmt = 'Free';
      //   }
      //   if(license.gpKey === '{155329f3-e5a5-4799-b2ec-bad7232cf5e7}') {
      //     $scope.essentialUpgradeAmt = license.UnitPrice;
      //   }
      //   if(license.gpKey === '{0bbbd9aa-632f-4cd3-a970-b0d2018bd98e}') {
      //     $scope.professionalUpgradeAmt = license.UnitPrice;
      //   }
      //   if(license.gpKey === '{bb25bed0-bac4-45f0-8a87-7b31c2bfcfaf}') {
      //     $scope.enterpriseUpgradeAmt = license.UnitPrice;
      //   }
      // })
      $scope.licenses = $scope.licenseList;
      console.log($scope.licenses);
    });
  };

  $rootScope.selectedPlan = {};

  $scope.planSelected = function(pos){
    $scope.showPaymentFields = true;
	  $rootScope.selectedPlan.item = $scope.licenses[pos];
    $scope.displaylicenseAmount($rootScope.selectedPlan.item);
  };

  $scope.displaylicenseAmount = function(license) {
    $scope.amountDue = license.UnitPrice;
  };

  $scope.backToPlans = function() {
    $scope.showPaymentFields = false;
  };

  /************************************************************************************************************/
  /************************************************* Ecommerce ************************************************/
  /************************************************************************************************************/

  $scope.getPaymentForm = function() {
    console.log('get payment frm');
    apiSrvc.getData('CoNameGetPaymentFields')
    .then(function(response) {
      $('#js-ecommercePayments').html(response.data);
    });
  };

  $scope.ccError = false;

  $scope.formNotComplete = false;

  $scope.submitPayment = function(selectedPlan) {
    if(selectedPlan.item.gpKey === "{97123f6d-98c8-40fa-a00b-03dc9db0dc04}") {}
    else {
      if($("#js-ecommercePayments #cardType").val().length === 0 ){
        $("#js-ecommercePayments #cardType").addClass('custom-errOutline');
      }
      else { $("#js-ecommercePayments #cardType").removeClass('custom-errOutline');}

      if($("#js-ecommercePayments #cardNumber").val().length === 0 ){
        $("#js-ecommercePayments #cardNumber").addClass('custom-errOutline');
      }
      else {$("#js-ecommercePayments #cardNumber").removeClass('custom-errOutline');}

      if($("#js-ecommercePayments #cardExpirationMonth").val().length === 0 ){
        $("#js-ecommercePayments #cardExpirationMonth").addClass('custom-errOutline');
      }
      else {$("#js-ecommercePayments #cardExpirationMonth").removeClass('custom-errOutline');}

      if($("#js-ecommercePayments #cardExpirationYear").val().length === 0 ){
        $("#js-ecommercePayments #cardExpirationYear").addClass('custom-errOutline');
      }
      else {$("#js-ecommercePayments #cardExpirationYear").removeClass('custom-errOutline');}

      if($("#js-ecommercePayments #cardCVV").val().length === 0 ){
        $("#js-ecommercePayments #cardCVV").addClass('custom-errOutline');
      }
      else {$("#js-ecommercePayments #cardCVV").removeClass('custom-errOutline');}

      if($("#js-ecommercePayments #cardName").val().length === 0 ){
        $("#js-ecommercePayments #cardName").addClass('custom-errOutline');
      }
      else {$("#js-ecommercePayments #cardName").removeClass('custom-errOutline');}

      //BANK ACCOUNT
      if($("#js-ecommercePayments #onDemandMethodAchRoutingNumber").val().length === 0 ){
        $("#js-ecommercePayments #onDemandMethodAchRoutingNumber").addClass('custom-errOutline');
      }
      else {$("#js-ecommercePayments #onDemandMethodAchRoutingNumber").removeClass('custom-errOutline');}

      if($("#js-ecommercePayments #onDemandMethodAchAccountNumber").val().length === 0 ){
        $("#js-ecommercePayments #onDemandMethodAchAccountNumber").addClass('custom-errOutline');
      }
      else {$("#js-ecommercePayments #onDemandMethodAchAccountNumber").removeClass('custom-errOutline');}

      if($("#js-ecommercePayments #onDemandMethodAchAccountName").val().length === 0 ){
        $("#js-ecommercePayments #onDemandMethodAchAccountName").addClass('custom-errOutline');
      }
      else {$("#js-ecommercePayments #onDemandMethodAchAccountName").removeClass('custom-errOutline');}
    }
    if(!selectedPlan.item.name) {$scope.licenseNeeded = true;}
    else {$scope.licenseNeeded = false;}
    if (selectedPlan.item.name) {
      var formSerializeData = $("#js-ecommercePayments").serialize();
      if(formSerializeData) {
        formSerializeData = '&' + formSerializeData;
      }
      apiSrvc.sendPostData('CoNameUpgradePlan' + formSerializeData, selectedPlan).then(function(response) {
        if(response.errors.length == 0) {
          console.log('jump for joy and yell hooray!');
          $mdToast.show({
              hideDelay   : false,
              theme : "warning-toast",
              position    : 'bottom',
              parent : $document[0].querySelector('#upgradePlan'),
              scope:$scope,
              preserveScope:true,
              controller  : upgradePlanToastCtrl,
              template :  '<md-toast class="md-success-toast-theme"><div class="md-toast-text flex">Congratulations, your plan has been upgraded!</div><div class="md-toast-text "></div><div class="md-toast-text "><md-button ng-click="closeUpgradeToast()">Close</md-button></div></md-toast>'
            });
           function upgradePlanToastCtrl($scope, $rootScope, apiSrvc, commonFnSrvc, $mdDialog, $mdToast) {
             $scope.closeUpgradeToast = function() {$mdToast.hide(); $state.go('company');}
           }
        }
        else {
          $scope.ccError = true;
          $scope.errorMsg = response.errors[0].userMsg;
        }
      })
    }
  };

});
