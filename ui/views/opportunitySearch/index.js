app.controller('opportunityCtrl', function($rootScope, $scope, $state, $stateParams, apiSrvc, commonFnSrvc, $http, Upload, upload, $filter, blockUI, $http, $mdDialog, $mdToast, $document, $location, authSrvc, envSrvc, config, $q) {

/**********************************************************************************************************/
/*************************************************** INIT *************************************************/
/**********************************************************************************************************/
  var getPromise = function(companyInfo) {
    if(companyInfo) {
      //if user is a company
      companyInfo.primaryNaicsCode.selected = true;
      $scope.filter.NaicsFilter.push(companyInfo.primaryNaicsCode);
      $scope.NaicsFilter.push(companyInfo.primaryNaicsCode);
    }
    else {
      //if user is a consultant
      //make some default filter for consultant users so the list isn't huge
    }

    $scope.ApplyFilters();
    $scope.paging.onPageChaged = loadOpportunityPages;
  };

  $scope.opportunityInit = function() {
      $scope.opportunityResults = {};
      $scope.CoNameGetOpportunitiesFavorite();
      $scope.CoNameGetCompanyOpportunitiesSavedSearches();
      $scope.pageNumber = 1;
      $scope.pageSize = 10;
      $scope.pagesTotal = 0;
      $scope.currentPage = 1;
      $scope.paging = {
        total: $scope.pagesTotal,
        current: $scope.currentPage,
        // onPageChaged: loadOpportunityPages,
      };
      $scope.todaysDate = new Date();
      $scope.filter = {
        "KeywordFilter": {
          "keywords": [],
          "anyKeyword": true
        },
        "AgencyFilter": [],
        "NaicsFilter": [],
        "BusinessTypeFilter": {
          "name": "",
          "gpKey": ""
        },
        "OpportunityTypeFilter": {
          "name": "",
          "gpKey": ""
        },
        "DateFilter": {
          "startDate": "",
          "endDate": ""
        }
      };
      authSrvc.getUserInfoForCompanyInfo($scope, getPromise);
  };

  /**********************************************************************************************************/
  /******************************************* Remote Method Calls ******************************************/
  /**********************************************************************************************************/
  $scope.CoNameGetOpportunities = function() {
      apiSrvc.sendPostData('CoNameProcessOpportunitySearch&PageNumber='+$scope.currentPage+'&PageSize='+$scope.pageSize, $scope.filter).then(function(response){
        $scope.opportunities = response.data.opportunities;
        $scope.filter = response.data.filter;

        //Temporary
        $scope.filter.DateFilter = {
          startDate: null,
          endDate: null
        };

        $scope.keywordFilterArray = response.data.filter.KeywordFilter.keywords;
        if($scope.filter.KeywordFilter.anyKeyword) {
          $scope.filterResultsOn = 'Any Keyword';
        }
        else {
          $scope.filterResultsOn = 'All Keywords';
        }

        $scope.pagesTotal = response.data.totalPages;
        $scope.opportunityResults.totalResults = response.data.totalResults;
        $scope.paging.total = $scope.pagesTotal;
      });
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
  };
  $scope.favoriteOpportunitiesTab = function() {
    $scope.favPageNumber = 1;
    $scope.favPageSize = 7;
    $scope.favPagesTotal = 0;
    $scope.favCurrentPage = 1;
    $scope.favPaging = {
      total: $scope.favPagesTotal,
      current: $scope.favCurrentPage,
      onFavPageChaged: loadFavoriteOpportunities,
    };
  };

  /**********************************************************************************************************/
  /******************************************** Download Results ********************************************/
  /**********************************************************************************************************/
  $scope.downloadOpportunitiesList = function(opportunities) {
    var a = document.createElement("a");
    apiSrvc.sendPostData('CoNameProcessOpportunitySearchNoPagination', $scope.filter).then(function(response){
      if(response.errors.length > 0) {
        console.log('There has been an error');
      }
      else {
        var opportunityList = response.data.opportunities;

      //needed to convert Objects to strings and json date into readable date
        angular.forEach(opportunityList, function(opportunity) {
          opportunity.agency = opportunity.agency.name;
          opportunity.setAside = opportunity.setAside.name;
          opportunity.opportunityType = opportunity.opportunityType.name;
          opportunity.closeDate = $filter('dateConverter')(opportunity.closeDate);
          opportunity.closeDate = $filter('date')(opportunity.closeDate);
        })

        var keysList = Object.keys(opportunityList[0]);
        var replacer = function(key, value) { return value === null ? '' : value };
        var csv = opportunityList.map(function(row){
          return keysList.map(function(fieldName){
            return JSON.stringify(row[fieldName], replacer)
          }).join(',')
        })
        csv.unshift(keysList.join(',')); // add header column
        var finalCSV = csv.join('\r\n');
        a.href = 'data:attachment/csv;charset=utf-8,' + encodeURIComponent(finalCSV); //fix for Firefox
        a.target = '_blank';
        a.download = 'opportunitiesList.csv';
        document.body.appendChild(a);
        a.click();
      }
    })
  };

  /**********************************************************************************************************/
  /************************************************ Pagination **********************************************/
  /**********************************************************************************************************/
  function loadOpportunityPages() {
    $scope.currentPage = $scope.paging.current;
    $scope.CoNameGetOpportunities();
  };
  function loadFavoriteOpportunities() {
    $scope.favCurrentPage = $scope.favPaging.current;
    $scope.CoNameGetFavoriteOpportunities();
  };

  /**********************************************************************************************************/
  /******************************************* Top Filters & Sorts ******************************************/
  /**********************************************************************************************************/
  $scope.sortByName = 'Sort By';
  $scope.sortOrderChange = function(sbs) {
    $scope.sortBySelected = sbs
    $scope.sortByName = sbs.name;
    $scope.selectedFilterId = sbs.id;
    $scope.ApplyFilters();
  };
  $scope.filterKeywordsBy = function(value, text) {
    $scope.filter.KeywordFilter.anyKeyword = value;
    $scope.filterResultsOn = text;
    $scope.ApplyFilters();
  };
  $scope.findOpportunitiesSortBy = [
    {"id": 10, "name": "asc"},
    {"id": 15, "name": "desc"},
  ];

  /************************************** Clear Individual/All Filters **************************************/
  $scope.clearKeyword = function(index, keyword) {
    $scope.filter.KeywordFilter.keywords.splice(index, 1);
  };
  $scope.clearDateFilter = function() {
    $scope.filter.DateFilter.startDate = null;
    $scope.filter.DateFilter.endDate = null;
    $scope.dateFilter.startDate = null;
    $scope.dateFilter.endDate = null;
    $scope.EndDateMin = null;
    $scope.StartDateMax = null;
  };
  $scope.clearAgency = function(index, agency) {
    $scope.filter.AgencyFilter.splice(index, 1);
  };
  $scope.clearNaicsCode = function(index, code) {
    $scope.NaicsFilter.splice(index, 1);
    $scope.filter.NaicsFilter.splice(index, 1);
  };
  $scope.clearSetAside = function(index, saf) {
    $scope.filter.BusinessTypeFilter = {};
    $scope.selectedSAT.setAsideType = '';
  };
  $scope.clearCeiling = function(ceiling) {
    ceiling = null;
    $scope.filter.ceiling = null;
    $scope.addCeilingBtn = false;
  };
  $scope.clearContractType = function() {
    $scope.filter.OpportunityTypeFilter = {};
    $scope.selectedOT.opportunityType = '';
  };
  $scope.clearOpportunityRelevance = function(oppRelvance) {
    oppRelvance = null;
    $scope.filter.opportunityRelevance = null;
    $scope.opportunityRelevance = null;
  };
  /*************** Clear All **************/
  $scope.clearAllFilter = function(filter) {
    $scope.filter.DateFilter.startDate = null;
    $scope.filter.DateFilter.endDate = null;
    $scope.dateFilter.startDate = null;
    $scope.dateFilter.endDate = null;
    $scope.EndDateMin = null;
    $scope.StartDateMax = null;
    $scope.filter.AgencyFilter = [];
    $scope.NaicsFilter = [];
    $scope.filter.NaicsFilter = [];
    $scope.filter.OpportunityTypeFilter = {};
    $scope.selectedOT.opportunityType = '';
    $scope.selectedSAT.setAsideType = '';
    $scope.filter.BusinessTypeFilter = {};
    $scope.keywordFilterArray = [];
    $scope.filter.KeywordFilter.keywords = [];
    filter.ceiling = null;
    $scope.addCeilingBtn = false;
  };

  /**********************************************************************************************************/
  /********************************************* FILTERS  ***************************************************/
  /**********************************************************************************************************/

  /*********************************************** APPLY FILTERS ********************************************/
  $scope.ApplyFilters = function() {
    $scope.currentPage = 1;
    $scope.paging.current = 1;
    $scope.CoNameGetOpportunities();
  };

  /********************************************* Get Saved Searches *****************************************/
  $scope.CoNameGetCompanyOpportunitiesSavedSearches = function() {
    apiSrvc.getData('CoNameGetCompanyOpportunitiesSavedSearches').then(function(response){
      $scope.savedOpportunitySearches = response.data;
    });
  };
  $scope.ApplySavedFilters = function(mySavedSearch) {
    var jsonString = mySavedSearch.filterData;
    var jsonObject = JSON.parse(jsonString);
    $scope.filter = jsonObject;
    $scope.currentPage = 1;
    $scope.CoNameGetOpportunities();
  };

  /*********************************************** Keyword Search *******************************************/
  $scope.addKeyword = function($event, keywordInput) {
    var keyCode = $event.which || $event.keyCode;
    if (keyCode === 13) {
      if(keywordInput === '') {}
      else if($scope.keywordFilterArray.indexOf(keywordInput) !== -1) {
          console.log('exists');
        }
        else {
          $scope.keywordFilterArray.push(keywordInput);
          $scope.filter.KeywordFilter.keywords = $scope.keywordFilterArray;
        }
      $event.currentTarget.value = "";
      $scope.ApplyFilters(); //NOTE: not sure if the search should happen on enter
      return $scope.keywordInput = '';
    }
  };
  $scope.searchKeywords = function(keywordInput) {
    if($scope.keywordFilterArray.indexOf(keywordInput) !== -1) {
        console.log('exists');
    }
    else {
      $scope.keywordFilterArray.push(keywordInput);
      $scope.filter.KeywordFilter.keywords = $scope.keywordFilterArray;
    }
      $scope.ApplyFilters();
  };

  /************************************************* Filter By Date  **********************************************/
  $scope.dateFilter = {};
  $scope.getStartDate = function(startDate) {
    var date = startDate;
    var dateMin = angular.copy(startDate);
    var dateMax = angular.copy(startDate);
    dateMin.setDate(date.getDate() + 1);
    $scope.EndDateMin = dateMin;

    $scope.filter.DateFilter.startDate = startDate;
  };
  $scope.getEndDate = function(endDate) {
    var date = endDate;
    var dateMin = angular.copy(endDate);
    var dateMax = angular.copy(endDate);

    dateMax.setDate(dateMax.getDate() - 1);
    $scope.StartDateMax = dateMax;

    $scope.filter.DateFilter.endDate = endDate;
  };

  /************************************************* Agencies  **********************************************/
  $scope.CoNameGetAgencies = function() {
    apiSrvc.getData('CoNameGetAgencies').then(function(response){
      $scope.agencies = response.data;
    });
  };
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
  $scope.agenciesFilterArray = [];
  $scope.searchAgencyText = {};
  $scope.addAgency = function(agency) {
    $scope.searchAgencyText.searchText = '';
    angular.forEach($scope.agencies, function(item){
      if(agency) {
        if(item.gpKey == agency.gpKey) {
            item.selected = true;
            $scope.agenciesFilterArray.push(item);
            $scope.filter.AgencyFilter = $scope.agenciesFilterArray;
        }
      }
    });
  };
  $scope.removeAgency = function(index, agency) {
    $scope.agency = agency;
    $scope.agency.selected = false;
  };
  $scope.addAgencyForProject = function(agency) {
    $scope.projectDetails.agency = agency;
  };

  /************************************************* NAICS **************************************************/
  $scope.searchNAICS = function(searchText) {
    return $http
     .get(__env.apiUrl+'/index.asp?remoteCall=CoNameGetNaicsCodesAutoCompleteResults&keyword='+searchText)
     .then(function(data) {
       return data.data.data;
      });
  };
  $scope.NaicsFilter = [];
  $scope.searchNaicsText = {};
  $scope.addOpportunityNAICS = function(naicsItem) {
    $scope.searchNaicsText.searchText = '';
    if(naicsItem) {
      if($scope.NaicsFilter.indexOf(naicsItem) == -1) {
        naicsItem.selected = true;
        $scope.NaicsFilter.push(naicsItem);
        $scope.filter.NaicsFilter = $scope.NaicsFilter;
      }
      else {
        console.log('alreay exists');
      }
    }

  };
  $scope.removeOpportunityNAICS = function(index) {
    $scope.filter.NaicsFilter.splice(index, 1);
  };

  /********************************************* Set Aside Type *********************************************/
  $scope.CoNameGetBusinessTypes = function() {
    apiSrvc.getData('CoNameGetBusinessTypes').then(function(response){
      // console.log(response);
      $scope.setAsideList = response.data;
    });
  };
  $scope.selectedSAT = {};
  $scope.addSetAsideFilter = function(setAsideType) {
    $scope.filter.BusinessTypeFilter = setAsideType;
  };
  //NOTE: Originally for Set Asides confustion with multiple names for same thing (Business Types) and sending an object not an array
  // $scope.setAsideFilterArray = [];
  // $scope.addSetAsideFilter = function(setAside) {
  //   if(setAside.id == 1) {
  //
  //   }
  //   else if($scope.setAsideFilterArray.indexOf(setAside) == -1) {
  //     $scope.setAsideFilterArray.push(setAside);
  //   }
  //   else {
  //     console.log('alreay exists');
  //   }
  // };

  /********************************************* Add Ceiling ************************************************/
  $scope.addCeilingBtn = false;
  $scope.addCeiling = function($event, ceilingInput) {
    var keyCode = $event.which || $event.keyCode;
    if (keyCode === 13) {
      $scope.filter.ceiling = ceilingInput;
      $scope.addCeilingBtn = true;
    }
  };

  /******************************************** Contract Type ***********************************************/
  $scope.CoNameGetOpportunitiesTypes = function() {
    apiSrvc.getData('CoNameGetOpportunitiesTypes').then(function(response) {
      $scope.opportunityTypes = response.data;
    })
  };
  $scope.selectedOT = {};
  $scope.addContractTypeFilter = function(opportunityType) {
    $scope.filter.OpportunityTypeFilter = opportunityType;
  };

  /**************************************** Opportunity Relevance *******************************************/
  // NOTE: NOT SURE IF THIS IS USED
  $scope.CoNameGetOpportunityRelevance = function() {
    apiSrvc.getData('CoNameGetOpportunityRelevance').then(function(response) {
      $scope.opportunityRelevanceList = response.data;
    })
  };
  $scope.selectOpportunityRelevance = function(oppRel) {
    $scope.filter.opportunityRelevance = oppRel;
  };

  /**********************************************************************************************************/
  /************************************* Opportunities Options/Actions  *************************************/
  /**********************************************************************************************************/
  $scope.addOpportunityToFavorites = function(opportunity) {
    var closeDate = $filter('dateConverter')(opportunity.closeDate);
    if($scope.todaysDate > closeDate) {
      var errorMsg = "Only opportunities with current or future dates can be added to Favorites."
        $mdDialog.show({
          controller: errorModalCtrl,
          templateUrl: '/views/globalModals/errorModal.html',
          parent: angular.element(document.querySelector('#appBody')),
          scope:$scope,
          preserveScope:true,
          clickOutsideToClose:true,
          locals: {
            dialogErrorMsg : errorMsg
          }
        });
    }
    else {
      apiSrvc.getData('CoNameSetOpportunityFavorite&gpKey='+opportunity.gpKey).then(function(response) {
        if(response.errors.length > 0) {
          $mdToast.show(
           $mdToast.simple({parent : $document[0].querySelector('.navbar-fixed-top')})
             .textContent('There was a problem adding this to your favorites.')
             .hideDelay(3000)
             .theme("warning-toast")
             .position('top right')
         );
        }
        else {
          $scope.favoriteOpportunities = response.data;
          // alert('works');
          $mdToast.show(
           $mdToast.simple({parent : $document[0].querySelector('.navbar-fixed-top')})
             .textContent('This Opportunity has been added to your Favorites!')
             .hideDelay(3000)
             .theme("success-toast")
             .position('top right')
         );
        }

      })
    }

  };
  $scope.CoNameGetOpportunitiesFavorite = function() {
    apiSrvc.getData('CoNameGetOpportunitiesFavorite').then(function(response) {
      $scope.favoriteOpportunities = response.data;
      var today = new Date();
      angular.forEach($scope.favoriteOpportunities, function(opp) {
        var convertedDate = $filter('dateConverter')(opp.closeDate);
        if(today > convertedDate) {
          $scope.CoNameRemoveOpportunityFavorite(opp);
        }
      })
    })
  };
  $scope.CoNameRemoveOpportunityFavorite = function(favOp) {
    apiSrvc.sendPostData('CoNameRemoveOpportunityFavorite&gpKey='+favOp.gpKey).then(function(response) {
      $scope.favoriteOpportunities = response.data;
    })
  };
  $scope.addCompanyToLookingForPartnerList = function(addMyCompany) {
    $scope.addMyCompany = addMyCompany;
  };
  $scope.runTeammateMatchReport = function(opportunity) {
    if($scope.teamMateMatchOpportunities) {
      apiSrvc.getData('CoNameProcessTeamMateSearch').then(function(response) {
      })
    }
    else {
      apiSrvc.getData('CoNameGetTeamMateMatchOpportunities').then(function(response) {
          $scope.teamMateMatchOpportunities = response.data;
          apiSrvc.getData('CoNameProcessTeamMateSearch').then(function(response) {
          })
      })
    }

  };
  $scope.createProject = function(opportunity) {
    $state.go('createOSProject', {opportunityDetails: opportunity});
  };

  /**********************************************************************************************************/
  /************************************************* MODALS  ************************************************/
  /**********************************************************************************************************/

  /******************* Opportunity Details ********************/
  $scope.openDetailsModal = function(ev, opportunity) {
    $scope.addMyCompany = false;
    $scope.openAddToPipeline = false;
    $mdDialog.show({
      controller: osDetailsCtrl,
      templateUrl: '/views/opportunitySearch/osDetails.html',
      parent: angular.element(document.querySelector('.custom-detailWrapper')),
      scope:$scope,
      preserveScope:true,
      targetEvent: ev,
      clickOutsideToClose:true,
      locals: {
        opportunityDetails : opportunity
      },
      onRemoving: function (event, removePromise) {
        if($scope.addMyCompany) {

        }
        if($scope.openAddToPipeline) {
          $scope.openAddOppToPipelineModal(ev, opportunity);
        }
      }
    });
  };

  /******************* Add Opportunity to Pipeline ********************/
  $scope.openAddOppToPipelineModal = function(ev, opportunity) {
    $scope.addMyCompany = false;
    $mdDialog.show({
      controller: osAddToPipelineCtrl,
      templateUrl: '/views/opportunitySearch/osAddToPipeline.html',
      parent: angular.element(document.querySelector('.custom-detailWrapper')),
      scope:$scope,
      preserveScope:true,
      targetEvent: ev,
      clickOutsideToClose:true,
      locals: {
        opportunityDetails : opportunity
      },
      onRemoving: function (event, removePromise) {

      }
    });
  };

  /******************* SHOW Save Search MODAL ***********************/
  $scope.showSaveSearchModal= function(ev) {
    $rootScope.allowSaveFilter = false;
    $mdDialog.show({
      controller: applyFilterCtrl,
      templateUrl: '/views/opportunitySearch/saveSearchModal.html',
      parent: angular.element(document.querySelector('.custom-dashWrapper')),
      scope:$scope,
      preserveScope:true,
      targetEvent: ev,
      clickOutsideToClose:true,
      locals: {
           savedOpportunitySearches: $scope.savedOpportunitySearches,
           envURL: $scope.envURL
         },
      onRemoving: function (event, removePromise) {
         if($rootScope.allowSaveFilter) {
           apiSrvc.sendPostData('CoNameSetCompanyOpportunitySearch&FilterSearchName='+$rootScope.filtername, $scope.filter).then(function(response){
             $scope.savedOpportunitySearches = response.data;
           });
         }
       }
    });
  };
  function applyFilterCtrl($scope, $rootScope, $mdDialog, apiSrvc, commonFnSrvc, savedOpportunitySearches) {
    $scope.hide = function() {
      $mdDialog.hide();
    };
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    $scope.answer = function(answer) {
      $mdDialog.hide(answer);
    };
    $scope.nameExists = false;
    $scope.hideNameExists = function() {
      $scope.nameExists = false;
    }
    $scope.saveFilter = function(filtername) {
      var keepGoing = true;
      angular.forEach(savedOpportunitySearches, function(savedSearch) {
        if(keepGoing) {
          if(savedSearch.name === filtername) {
             keepGoing = false;
             $scope.nameExists = true;
          }
          else {
          }
        }
      })
      if(keepGoing) {
        $rootScope.filtername = filtername;
        $rootScope.allowSaveFilter = true;
        $mdDialog.cancel();
      }
    }
  }

  /**********************************************************************************************************/
  /******************************************* Accordion - Filters ******************************************/
  /**********************************************************************************************************/
  $scope.openOSDateFilter = function() {$scope.openDateFilter = true;};
  $scope.closeOSDateFilter = function() {$scope.openDateFilter = false;};
  //
  $scope.openOSAgenciesFilter = function() {
    $scope.openAgenciesFilter = true;
    if($scope.agencies) {}
    else {$scope.CoNameGetAgencies();}
  };
  $scope.closeOSAgenciesFilter = function() {$scope.openAgenciesFilter = false;};
  //
  $scope.openOSNAICSFilter = function() {$scope.openNAICSFilter = true;};
  $scope.closeOSNAICSFilter = function() {$scope.openNAICSFilter = false;};
  //
  $scope.openOSSetAsideFilter = function() {
    $scope.openSetAsideFilter = true;
    if($scope.setAsideList) {}
    else {$scope.CoNameGetBusinessTypes();}
  };
  $scope.closeOSSetAsideFilter = function() {$scope.openSetAsideFilter = false;};
  //
  $scope.openOSCeilingFilter = function() {$scope.openCeilingFilter = true;};
  $scope.closeOSCeilingFilter = function() {$scope.openCeilingFilter = false;};
  //
  $scope.openOSOpportunityFilter = function() {
    $scope.openOpportunityFilter = true;
    if($scope.contractTypes) {}
    else {$scope.CoNameGetOpportunitiesTypes();}
  };
  $scope.closeOSOpportunityFilter = function() {$scope.openOpportunityFilter = false;};
  //
  $scope.openOSOpportunityRelevanceFilter = function() {
    $scope.openOpportunityRelevanceFilter = true;
    if($scope.opportunityRelevance) {}
    else {$scope.CoNameGetOpportunityRelevance();}
  };
  $scope.closeOSOpportunityRelevanceFilter = function() {$scope.openOpportunityRelevanceFilter = false;};
  //

  /**********************************************************************************************************/
  /********************************************** Common Remotes ********************************************/
  /**********************************************************************************************************/
  //logout
  $scope.CoNameProcessLogout = function() {
    apiSrvc.getData('CoNameProcessLogout').then(function(response){
      $state.go('signIn');
    });
  };
  //Get the User's Company Profile
  $scope.CoNameGetCompanyProfile = function(userInfo) {
    apiSrvc.getData('CoNameGetCompanyProfile&gpKey='+userInfo.Company.gpKey).then(function(response) {
      $scope.companyInfo = response.data;
      $rootScope.companyInfo = response.data;
    })
  };

/********* END OF CONTROLLER *********/
});
