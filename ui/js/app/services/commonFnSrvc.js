app.service('commonFnSrvc', function ($http, apiSrvc, blockUI, $q, $state, $mdToast, $document) {

  // COMPANY functions
  this.CoNameGetCompanyUsers = function(scope) {
    apiSrvc.getData('CoNameGetCompanyUsers').then(function(response){
        //rename later so only one scope
        scope.companyPointOfContacts = response.data;
        scope.companyUsers = response.data;
    })
  };
  this.CoNameGetCompanyInformation = function(scope) {
    apiSrvc.getData('CoNameGetCompanyInformation').then(function(response){
      scope.companySnapshots = response.data.CompanySnapshots;
      scope.companyInfoBoxes = response.data.CompanyInfoBoxes;
    });
  };
  this.CoNameGetCompanyProfile = function(scope, userInfo) {
    apiSrvc.getData('CoNameGetCompanyProfile&gpKey='+userInfo.Company.gpKey).then(function(response) {
      scope.companyInfo = response.data;
      scope.certificationList = response.data.certifications;
      scope.businessTypeList = response.data.businessTypes;
      scope.additionalNaicsCodes = response.data.additionalNaicsCodes;
    })
  };
  this.CoNameGetProjectStatusList = function(scope) {
    apiSrvc.getData('CoNameGetProjectStatusList').then(function(response){
      scope.projectStatusList = response.data;
    });
  };
  this.CoNameGetPlanInformation = function(scope) {
    apiSrvc.getData('CoNameGetPlanInformation').then(function(response){
      scope.planInformation = response.data;
    });
  };
  this.CoNameGetCompanyCertifications = function(scope) {
    apiSrvc.getData('CoNameGetCompanyCertifications').then(function(response){
      scope.companyCertifications = response.data;
    });
  };
  this.CoNameGetBusinessTypes = function(scope) {
    apiSrvc.getData('CoNameGetBusinessTypes').then(function(response){
      scope.businessTypes = response.data;
    });
  };

  // GLOBAL functions
  this.CoNameGetStates = function(scope) {
    apiSrvc.getData('CoNameGetStates').then(function(response){
      scope.statesList = response.data;
    });
  };
  this.CoNameGetSecurityClearances = function(scope) {
    apiSrvc.getData('CoNameGetSecurityClearances').then(function(response){
      scope.securityClearances = response.data;
    });
  };
  this.CoNameGetBusinessTypes = function(scope) {
    apiSrvc.getData('CoNameGetBusinessTypes').then(function(response){
      scope.businessTypes = response.data;
    });
  };
  this.CoNameGetMobileCarriers = function(scope) {
    apiSrvc.getData('CoNameGetMobileCarriers').then(function(response){
      scope.mobileCarriers = response.data;
    });
  };
  this.CoNameGetRoles = function(scope) {
    apiSrvc.getData('CoNameGetRoles').then(function(response){
      scope.roles = response.data;
    });
  };

  this.errorFunction = function (parentLocation, message, toastFunction) {
      // parentLocation is where the toast will appear
      // message is the html that will go in the toastTemplate
      // toastFunction is a function to be called when the toast closes
      $mdToast.show({
       hideDelay: 0,
       position: 'top right',
       parent : $document[0].querySelector(parentLocation),
       controller: 'toastCtrl',
       bindToController: true,
       locals: {
         toastMessage: message,
         toastFunction: toastFunction
       },
       templateUrl: '/views/globalModals/toastTemplate.html'
     }).then(function(result) {
       result();
     }).catch(function(error) {
     });
  };

});
