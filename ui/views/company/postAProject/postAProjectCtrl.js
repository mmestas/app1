app.controller('postAProjectCtrl', function($rootScope, $scope, $state, $stateParams, $location, $document,  $timeout, apiSrvc, commonFnSrvc, $filter, upload, Upload, blockUI, $http, $mdDialog, $mdToast, authSrvc, envSrvc, config) {

  $scope.postAProject = function() {
    $scope.CoNameGetCategories();
    $scope.CoNameGetAgencies();
    $scope.CoNameGetCompanyUsers();
  }
  $scope.projectDetails = [];

  $scope.cancel = function() {
    $state.go('company');
  }
/////////////////////// Remote Methods ///////////////////////

  $scope.CoNameProcessLogout = function() {
    apiSrvc.getData('CoNameProcessLogout').then(function(response){
      $state.go('signIn');
    });
  }
  $scope.CoNameGetCategories = function() {
    apiSrvc.getData('CoNameGetCategories').then(function(response){
      $scope.categories = response.data;
    });
  }
  $scope.CoNameGetCompanyUsers = function() {
    console.log('postAProject');

    apiSrvc.getData('CoNameGetCompanyUsers').then(function(response){
      $scope.companyUsers = response.data;
      angular.forEach($scope.companyUsers, function(user) {
        if(user.gpKey ==  $scope.userInfo.gpKey) {
          $scope.projDetails.owner = user;
        }
      })
    });
  }
  // My comment
  $scope.CoNameGetAgencies = function() {
    apiSrvc.getData('CoNameGetAgencies').then(function(response){
      $scope.agencies = response.data;
    });
  }
  $scope.getAgenciesForAutoComplete = function(agency) {
      var agencyResult = [];
      angular.forEach($scope.agencies, function(item){
        var lcAcronym = angular.lowercase(item.acronymn);
        var lcItem = angular.lowercase(item.name);
        var lcAgency = angular.lowercase(agency);
        if((lcItem.search(lcAgency) >= 0) && (!item.selected) ) {
            agencyResult.push(item);
        }
        if((lcAcronym.search(lcAgency) >= 0) && (!item.selected) ) {
            agencyResult.push(item);
        }
      });
      return agencyResult;
    };

  //*********************************** FILTER - Select Categories **********************************//
  $scope.topCatSelected = function(category) {
    if(category.selected) {
      angular.forEach(category.subCategories, function(sub, $index) {
        sub.selected = true;
        return sub.selected;
      });
    }
    else {
      angular.forEach(category.subCategories, function(sub, $index) {
        sub.selected = false;
        return sub.selected;
      });
    }
  }

  $scope.subCatSelect = function(cat, subCat) {
    $scope.botharetrue = false;
    $scope.notallaretrue = false;
    $scope.notallarefalse = false;
    $scope.noneAreSelected = false;

    angular.forEach(cat.subCategories, function(sub, $index) {
      if(sub.selected) {
        $scope.notallaretrue = true;
      }
      else if(!sub.selected) {
        $scope.notallarefalse = true;
      }
      else {}
    });
    if($scope.notallaretrue && $scope.notallarefalse) {
      $scope.botharetrue = true;
    }
    if($scope.notallaretrue && !$scope.notallarefalse) {
      $scope.botharetrue = false; //added 1.10.18
    }
    if(!$scope.notallaretrue && $scope.notallarefalse) {
      $scope.noneAreSelected = true;
      cat.selected = false;
      $scope.botharetrue = false; //added 1.10.18
    }
  }

  /************************************************************************************************************/
  /***************************************** Check if Is Solicitation *****************************************/
  /************************************************************************************************************/
  $scope.showAgencies = false;
  $scope.isSolicitation = function(value) {
    if(value) {
      $scope.showAgencies = true;
    }
    else {
      $scope.showAgencies = false;
    }
  }
  $scope.projDetails = {};
  $scope.projDetails.workOnSiteRequired = false;
  $scope.projDetails.isSolicitation = false;
  $scope.projDetails.isPublic = false;
  $scope.projDetails.keywords = {};
  $scope.projDetails.keywords.anyKeyword = true;
  $scope.projDetails.exposure = 2;
  $scope.projDetails.keepPrivate = true;
  $scope.addAgency = function(agency) {
    $scope.projDetails.agency = agency;
  }

  $scope.addKeywords = function($event, projDetails, keywordInput) {
    var key = $event.which ? $event.which : $event.keyCode;
    if((key == 188) || (key == 13)) {
      if($event.which == 188) {
        keywordInput = keywordInput.replace(/,/g , " ");
      }

      if(!projDetails.keywords.keyword1) {
        projDetails.keywords.keyword1 = keywordInput;
        $scope.keywordInput = '';
      }
      else if(projDetails.keywords.keyword1 && !projDetails.keywords.keyword2) {
        projDetails.keywords.keyword2 = keywordInput;
        $scope.keywordInput = '';
      }
      else if(projDetails.keywords.keyword2 && !projDetails.keywords.keyword3) {
        projDetails.keywords.keyword3 = keywordInput;
        $scope.keywordInput = '';
      }
      else if(projDetails.keywords.keyword3 && !projDetails.keywords.keyword4) {
        projDetails.keywords.keyword4 = keywordInput;
        $scope.keywordInput = '';
      }
      else if(projDetails.keywords.keyword4 && !projDetails.keywords.keyword5) {
        projDetails.keywords.keyword5 = keywordInput;
        $scope.keywordInput = '';
      }
      else {
        console.log('you have reached your maximum # of keywords');
      }
    }
  }

  $scope.removeKeyword = function(keyword, item) {
    if(item == 1) {
      $scope.projDetails.keywords.keyword1 = '';
    }
    else if(item == 2) {
      $scope.projDetails.keywords.keyword2 = '';
    }
    else if(item == 3) {
      $scope.projDetails.keywords.keyword3 = '';
    }
    else if(item == 4) {
      $scope.projDetails.keywords.keyword4 = '';
    }
    else if(item == 5) {
      $scope.projDetails.keywords.keyword5 = '';
    }
  }

  $scope.createNewProject = function(projDetails, categories, file1, file2, file3) {
    console.log(projDetails.exposure);
    projDetails.Categories = categories;
    var objToPost = {};
    objToPost.jsonData = JSON.stringify(projDetails);
    if(file1) {
      objToPost.projectFile1 = file1;
    }
    if(file2) {
      objToPost.projectFile2 = file2;
    }
    if(file3) {
      objToPost.projectFile3 = file3;
    }

    if(projDetails.exposure === 2) {
      console.log('targeted');
      $mdDialog.show({
        controller: broadcastConfirmModal,
        templateUrl: '/views/company/postAProject/confirmBroadcast.html',
        clickOutsideToClose:false,
        scope:$scope,
        preserveScope:true,
        parent: angular.element(document.querySelector('#postNewProject')),
      })

      function broadcastConfirmModal($scope, $rootScope, apiSrvc, commonFnSrvc, $mdDialog) {
        $scope.hide = function() {$mdDialog.hide();};
        $scope.cancel = function() {$mdDialog.cancel();};

        $scope.continue = function() {
          upload({
            url: __env.apiUrl+'/index.asp?remoteCall=CoNameSetProjectDetails&RequestBinary=true',
            method: 'POST',
            data : objToPost
          })
          .then(function(response) {
            if(response.data.errors.length > 0) {

            }
            else {
              var projectDetails = response.data.data;
              $state.go('projectDetails', {id: projectDetails.gpKey, projectParams: projectDetails, selectedProgressTab: 1});
            }
          });
        }
      }
    }
    else {
      upload({
        url: __env.apiUrl+'/index.asp?remoteCall=CoNameSetProjectDetails&RequestBinary=true',
        method: 'POST',
        data : objToPost
      })
      .then(function(response) {
        if(response.data.errors.length > 0) {

        }
        else {
          var projectDetails = response.data.data;
          $state.go('projectDetails', {id: projectDetails.gpKey, projectParams: projectDetails, selectedProgressTab: 1});
        }
      });
    }

  }

});
