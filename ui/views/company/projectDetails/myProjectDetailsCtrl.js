app.controller('detailCtrl', function($scope, $rootScope, $state, $stateParams, $document, apiSrvc, commonFnSrvc, passDataSrvc, NgTableParams, Upload, upload, $filter, blockUI, $http, $mdDialog, $mdToast, $timeout, $q, $location, authSrvc, envSrvc, config) {

/********************************************** INIT **********************************************/
  $scope.selectedProgressTab = $stateParams.selectedProgressTab;

  $scope.initProjectDetails = function() {
    // authSrvc.getUserInfo($scope);
    $scope.getProjectDetails($stateParams.id);
    $scope.showEditProjectFields = $stateParams.showEditProjectFields;
    $scope.showDuplicateProject = $stateParams.showDuplicateProject;
    $scope.cameFromDashboard = $stateParams.cameFromDashboard;
    if($scope.showEditProjectFields) {
      $scope.projectOverviewTemplate = 'editProject'
    }
    else {
      $scope.projectOverviewTemplate = 'projectOverview'
    }
  }
  $scope.getProjectDetails = function(gpKey) {
    apiSrvc.getData('CoNameGetProjectDetails&gpkey=' + gpKey).then(function(response){
      $scope.projectDetails = response.data;
      if($scope.projectDetails.exposure === 3) {
        $scope.projectDetails.exposure = 1;
      }
      $scope.shortlist = response.data.Shortlist;
      $scope.favorites = response.data.Favorites;
      $scope.bench = response.data.Bench;
      $scope.checkIfAdded($scope.shortlist);
      $scope.checkIfAdded($scope.favorites);
      $scope.checkIfAdded($scope.bench);
      $scope.quotesReceived = response.data.QuotesReceived;
      $scope.engagementsToApprove = [];
      $scope.activeEngagements = [];
      $scope.engagements = response.data.Engagements;
      //Old- When tasks were added by the company
      // angular.forEach($scope.engagements, function(engagement) {
      //   if(engagement.companyApproved) {
      //     $scope.activeEngagements.push(engagement);
      //     angular.forEach($scope.activeEngagements, function(ae) {
      //       angular.forEach(ae.tasks, function(aeTask) {
      //         var keepGoing = true;
      //         ae.actionNeeded = false;
      //         ae.needsRating = false;
      //         ae.isCompleted = false;
      //         if(keepGoing) {
      //           if(aeTask.completed && !aeTask.approved) {
      //               ae.actionNeeded = true;
      //               var keepGoing = false;
      //           }
      //           else if(aeTask.completed && aeTask.approved && !aeTask.rated) {
      //               ae.needsRating = true;
      //               var keepGoing = false;
      //           }
      //           else if(aeTask.completed && aeTask.approved && aeTask.rated) {
      //               ae.isCompleted = true;
      //               var keepGoing = false;
      //           }
      //         }
      //
      //       })
      //     })
      //   }
      // })
      $scope.projectDetails.projectIsAllowedToClose = true; //property to check if All engagements are finished and allowed to close
      angular.forEach($scope.engagements, function(engagement) {
        if(engagement.quoteInvitationInfo.quoteType==0){
          // Before Quote Invite
          if(engagement.companyApproved) {
            angular.forEach(engagement.tasks, function(task) {
              if(task.completed && !task.approved) {
                engagement.actionNeeded = true;
              }
              if(task.completed && task.approved && !task.rated) {
                engagement.ratingNeeded = true;
              }
              if(task.completed && task.approved && task.rated) {
                engagement.completed = true;
              }
            })
          }
        } else {
          // After Quote Invite
          if(engagement.quoteInvitationInfo.quoteType==1){
            // Fixed
            angular.forEach(engagement.quoteInvitationInfo.qFix, function(task) {
              if(task.completed && !task.approved) {
                engagement.actionNeeded = true;
              }
              if(task.completed && task.approved && !task.rated) {
                engagement.ratingNeeded = true;
              }
              if(task.completed && task.approved && task.rated) {
                engagement.completed = true;
              }
            })
          } else if (engagement.quoteInvitationInfo.quoteType==2){
            // Hourly
            angular.forEach(engagement.quoteInvitationInfo.qHours, function(task) {
              if(task.completed && !task.approved) {
                engagement.actionNeeded = true;
              }
              if(task.completed && task.approved && !task.rated) {
                engagement.ratingNeeded = true;
              }
              if(task.completed && task.approved && task.rated) {
                engagement.completed = true;
              }
            })
          }  else if (engagement.quoteInvitationInfo.quoteType==3){
            // Hourly
            if(engagement.quoteInvitationInfo.qRecurring.completed && !engagement.quoteInvitationInfo.qRecurring.approved) {
              engagement.actionNeeded = true;
            }
            if(engagement.quoteInvitationInfo.qRecurring.completed && engagement.quoteInvitationInfo.qRecurring.approved && !engagement.quoteInvitationInfo.qRecurring.rated) {
              engagement.ratingNeeded = true;
            }
            if(engagement.quoteInvitationInfo.qRecurring.completed && engagement.quoteInvitationInfo.qRecurring.approved && engagement.quoteInvitationInfo.qRecurring.rated) {
              engagement.completed = true;
            }
          }
        }

        if(engagement.actionNeeded || (engagement.companyApproved && !engagement.ratingNeeded && !engagement.actionNeeded && !engagement.completed) ) {
          $scope.projectDetails.projectIsAllowedToClose = false;
        }
        //
        return engagement;
      })


      if($stateParams.selectedProgressTab == 0 && $stateParams.showEditProjectFields) {
        $scope.editProjectDetails($scope.projectDetails);
      }
      else if($stateParams.selectedProgressTab == 0 && $stateParams.showDuplicateProject) {
        $scope.duplicateProject($scope.projectDetails);
      }
      if($scope.projectDetails.exposure == 0) {
        $scope.projectDetails.exposure = 2;
      }
    });
  }
  $scope.CoNameProcessLogout = function() {
    apiSrvc.getData('CoNameProcessLogout').then(function(response){
      $state.go('signIn');
    });
  }
  $scope.CoNameGetCompanyUsers = function() {
    console.log('myProjectDetails');

    apiSrvc.getData('CoNameGetCompanyUsers').then(function(response){
      $scope.companyUsers = response.data;
      $rootScope.rootCompanyUsers = response.data;
      //Needs to be a better practice - adding this here 1.10.19 -  is also in ui router in run function
      var addNew = {name: "Add New", gpKey: null};
       $rootScope.rootCompanyUsers.push(addNew);
    });
  }
  $scope.CoNameGetCompanyProjects = function() {
    apiSrvc.getData('CoNameGetCompanyProjects').then(function(response){
      $scope.myProjects = response.data;
    });
  }
  $scope.CoNameGetAgencies = function() {
    apiSrvc.getData('CoNameGetAgencies').then(function(response){
      $scope.agencies = response.data;
    });
  }
  $scope.CoNameGetUserCertifications = function() {
    apiSrvc.getData('CoNameGetUserCertifications').then(function(response){
      $scope.certifications = response.data;
    });
  }
  $scope.CoNameGetCategories = function() {
    apiSrvc.getData('CoNameGetCategories').then(function(response){
      $scope.categories = response.data;
    });
  }
  $scope.CoNameGetAvailabilities = function() {
    apiSrvc.getData('CoNameGetAvailabilities').then(function(response){
      $scope.availabilities = response.data;
    });
  }
  $scope.CoNameGetCompanySavedSearches = function() {
    apiSrvc.getData('CoNameGetCompanySavedSearches').then(function(response){
      $scope.savedSearches = response.data;
    });
  }

//////////////////////// HEADER ///////////////////////////
  $scope.selectDifferentProject = function(selectedProject) {
    $stateParams.id = selectedProject.gpKey;
    $state.go('projectDetails', {id: selectedProject.gpKey, projectParams: selectedProject,  selectedProgressTab: $scope.selectedProgressTab, showEditProjectFields: true});

  }

  $scope.pageNumber = 1;
  $scope.pageSize = 7;
  $scope.pagesTotal = 0;
  $scope.currentPage = 0;
  if($scope.currentPage == 0) {}
  else {
    $scope.paging = {
      total: $scope.pagesTotal,
      current: $scope.currentPage,
      onPageChanged: loadPages,
    };
  }
  function loadPages() {
    console.log('Current page is : ' + $scope.paging.current);
    $scope.currentPage = $scope.paging.current;
    $scope.updatePagination();
   }


  $scope.myConvertDate = function(dateToConvert) {
    var dateString = dateToConvert.substr(6);
    var memberSince = new Date(parseInt(dateString));
    return memberSince;
  }
  $scope.CoNameGetFindExperts = function() {
    $('[data-toggle="tooltip"]').tooltip();
    apiSrvc.getData('CoNameGetFindExperts&gpKey='+$stateParams.id+'&PageNumber='+$scope.pageNumber+'&PageSize='+$scope.pageSize).then(function(response){
      $scope.expertList = $scope.checkIfAdded(response.data.consultants);
      $scope.filter = response.data.filter;
      console.log('filter', $scope.filter);
      $scope.filter.AgencyFilter = [];
      if($scope.filter.KeywordFilter.anyKeyword) {
        $scope.filterResultsOn = 'Any Keyword';
      }
      else {
        $scope.filterResultsOn = 'All Keywords';
      }

      angular.forEach($scope.filter.AgencyFilter, function(filter) {
        if(filter.selected) {
          $scope.agenciesFilterArray.push(filter.selected);
          $scope.filter.AgencyFilter = $scope.agenciesFilterArray;
        }
      })
      //added 3.23.18
      $scope.filter.CertificationsFilter = [];
      angular.forEach($scope.filter.CertificationsFilter, function(filter) {
        if(filter.selected) {
          $scope.certificationsFilterArray.push(filter.selected);
          $scope.filter.CertificationsFilter = $scope.certificationsFilterArray;
        }
      })

      $scope.securityFilter = response.data.filter.SecurityFilter;
      $scope.keywordFilterArray = response.data.filter.KeywordFilter.keywords;
      // $scope.filter.KeywordFilter.anyKeyword = true;
      $scope.filter.RatingFilter = [
        {"id": "starFilter5", "ratingValue": 5, "selected": false},
        {"id": "starFilter4", "ratingValue": 4, "selected": false},
        {"id": "starFilter3", "ratingValue": 3, "selected": false},
        {"id": "starFilter2", "ratingValue": 2, "selected": false},
        {"id": "starFilter1", "ratingValue": 1, "selected": false}
      ];
      $scope.filter.VerificationFilter = response.data.filter.VerificationFilter;
      $scope.pagesTotal = response.data.ConsultantTotalPages;
      $scope.totalResults = response.data.TotalResults;
      $scope.currentPage = response.data.ConsultantPageNumber;
      $scope.paging = {
        total: $scope.pagesTotal,
        current: $scope.currentPage,
        onPageChanged: loadPages,
      };
      $scope.callappNameRatingFilter();
    });
  }
  $scope.sortByName = 'Sort By';
  $scope.sortOrderChange = function(sbs) {
    $scope.sortBySelected = sbs
    $scope.sortByName = sbs.name;
    $scope.selectedFilterId = sbs.id;
    $scope.ApplyFilters();
  }
  $scope.filterKeywordsBy = function(value, text) {
    $scope.filter.KeywordFilter.anyKeyword = value;
    $scope.filterResultsOn = text;
    $scope.ApplyFilters();
  }
  $scope.updatePagination = function() {
    console.log('update pagination');
    apiSrvc.sendPostData('CoNameProcessFindExperts&gpKey='+$stateParams.id+'&PageNumber='+$scope.currentPage+'&PageSize='+$scope.pageSize+'&sortOrder='+$scope.sortBySelected.id, $scope.filter).then(function(response){
      $scope.expertList = $scope.checkIfAdded(response.data.consultants);
      $scope.pagesTotal = response.data.ConsultantTotalPages;
      $scope.currentPage = response.data.ConsultantPageNumber;
      $scope.totalResults = response.data.TotalResults;
      $scope.paging = {
        total: $scope.pagesTotal,
        current: $scope.currentPage,
        onPageChanged: loadPages,
      };
      // This allows the page to go back to the top after pagination is clicked
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    });
  }
  $scope.$watch('$scope.filter', function(newVal, oldVal, scope) {
  }, true);
  $scope.ApplyFilters = function() {
      console.log('ApplyFilters');
    $scope.filter.AgencyFilter = $scope.agenciesFilterArray;
    $scope.filter.CertificationsFilter = $scope.certificationsFilterArray;
    $scope.filter.KeywordFilter.keywords = $scope.keywordFilterArray;
    apiSrvc.sendPostData('CoNameProcessFindExperts&gpKey='+$stateParams.id+'&PageNumber='+1+'&PageSize='+$scope.pageSize+'&sortOrder='+$scope.sortBySelected.id, $scope.filter).then(function(response){
      $scope.expertList = $scope.checkIfAdded(response.data.consultants);

      // // For testing only until we get this property Added
      // angular.forEach('$scope.expertList', function(expert, index) {
      //   if(index % 2 === 0) {
      //     expert.isVIP = true;
      //   }
      //   else {
      //     expert.isVIP = false;
      //   }
      // })


      $scope.pagesTotal = response.data.ConsultantTotalPages;
      $scope.currentPage = response.data.ConsultantPageNumber;
      $scope.totalResults = response.data.TotalResults;
      $scope.paging = {
        total: $scope.pagesTotal,
        current: $scope.currentPage,
        onPageChanged: loadPages,
      };
      angular.forEach(response.data.consultants, function(consultant) {
        var dateString = consultant.joinDate.substr(6);
        var memberSince = new Date(parseInt(dateString));
        $scope.memberSince = memberSince;
      })
    });
  }
  $scope.ApplySavedFilters = function(sf) {
    var filterObj = angular.fromJson(sf.filterData);
    $scope.filter = filterObj;
    $scope.ApplyFilters();
  }

  //*********************************** Expert Star Rating **********************************//
  // NOTE: Check to see if this is used anymore - may not be used
  $scope.callLastFunction = function(){
  		$( document ).ready(function() {
        $(".myrating").rating({displayOnly: true, step: 0.5});
        $(".rating").rating({displayOnly: true, step: 1});
  		});
  	}

  //*********************************** Expert Star Rating **********************************//
  $scope.callappNameRatingFilter = function(){
    console.log('pro rating');
		$( document ).ready(function() {
      $("#starLevel5").rating({displayOnly: true, step: 1});
      $("#starLevel4").rating({displayOnly: true, step: 1});
      $("#starLevel3").rating({displayOnly: true, step: 1});
      $("#starLevel2").rating({displayOnly: true, step: 1});
      $("#starLevel1").rating({displayOnly: true, step: 1});
		});
	}
  $scope.callappNameRatingFilterAfterInit = function(){
    console.log('pro rating 2');
      $("#starFilter5").rating({displayOnly: true, step: 1});
      $("#starFilter4").rating({displayOnly: true, step: 1});
      $("#starFilter3").rating({displayOnly: true, step: 1});
      $("#starFilter2").rating({displayOnly: true, step: 1});
      $("#starFilter1").rating({displayOnly: true, step: 1});

  }
  $scope.expertStar = function(starValue) {
    $("#expert-star").rating({displayOnly: true, step: 0.5});
    $('#expert-star').rating('update', starValue);
  }

  //*********************************** Call Collapse after Page Has loaded **********************************//
  $scope.initializeCollapse = function() {
    $('.collapsible').collapsible();
  }
  $scope.CoNameGetProjectEditCategories = function(projDetails) {
    $scope.projectDetails = projDetails;

    apiSrvc.getData('CoNameGetProjectEditCategories&gpKey='+projDetails.gpKey).then(function(response){
      projDetails.Categories = response.data;
      $scope.projectDetails.Categories = response.data;
    });
  }
  $scope.editProjectDetails = function(projDetails) {
    $scope.showEditProjectFields = true;
    $scope.showDuplicateProject = false;
    $scope.projectOverviewTemplate = 'editProject';
    $scope.projectKeyword = {word: ''};
    $scope.CoNameGetProjectEditCategories(projDetails);
    $scope.CoNameGetCompanyUsers();
    $scope.CoNameGetAgencies();

    if(projDetails.isSolicitation) {
      $scope.showAgencies = true;
    }
    else {
      $scope.showAgencies = false;
    }
    console.log(projDetails.agency.name);
    if(projDetails.agency.name) {
      console.log('ture');
      $scope.agencyPlaceholder = projDetails.agency.name;
      $scope.selectedAgencyItem =  projDetails.agency.name;
    }
    else {
      console.log('false');
      $scope.agencyPlaceholder = 'Agency (Autocomplete)';
    }


    if(!projDetails.projectFiles[0]) {
        // projDetails.projectFiles[0] = {};
        $rootScope.placeholder = 'No File Chosen';
    }
    else {
      $rootScope.placeholder = projDetails.projectFiles[0].name;
    }
    if(!projDetails.projectFiles[1]) {
        // projDetails.projectFiles[1] = {};
        $rootScope.placeholder1 = 'No File Chosen';
    }
    else {
      $rootScope.placeholder1 = projDetails.projectFiles[1].name;
    }
    if(!projDetails.projectFiles[2]) {
        // projDetails.projectFiles[2] = {};
        $rootScope.placeholder2 = 'No File Chosen';
    }
    else {
      $rootScope.placeholder2 = projDetails.projectFiles[2].name;
    }

  }
  $scope.postKeywords = function($event, projDetails, projectKeywordInput) {
    var key = $event.which ? $event.which : $event.keyCode;
    if((key == 188) || (key == 13)) {
      if($event.which == 188) {
        projectKeywordInput.word = projectKeywordInput.word.replace(/,/g , " ");
      }

      if(!projDetails.keywords.keyword1) {
        projDetails.keywords.keyword1 = projectKeywordInput.word;
        $scope.projectKeyword.word = '';

      }
      else if(projDetails.keywords.keyword1 && !projDetails.keywords.keyword2) {
        projDetails.keywords.keyword2 = projectKeywordInput.word;
        $scope.projectKeyword.word = '';
      }
      else if(projDetails.keywords.keyword2 && !projDetails.keywords.keyword3) {
        projDetails.keywords.keyword3 = projectKeywordInput.word;
        $scope.projectKeyword.word = '';
      }
      else if(projDetails.keywords.keyword3 && !projDetails.keywords.keyword4) {
        projDetails.keywords.keyword4 = projectKeywordInput.word;
        $scope.projectKeyword.word = '';
        console.log(projectKeywordInput);
        console.log($scope.projectKeyword);
      }
      else if(projDetails.keywords.keyword4 && !projDetails.keywords.keyword5) {
        projDetails.keywords.keyword5 = projectKeywordInput.word;
        $scope.projectKeyword.word = '';
        console.log(projectKeywordInput);
        console.log($scope.projectKeyword);
      }
      else {
        console.log('you have reached your maximum # of keywords');
      }
    }
  }
  $scope.removeKeyword = function(projDetails, item) {
    if(item == 1) {
      $scope.projectDetails.keywords.keyword1 = '';
      projDetails.keywords.keyword1 = '';
    }
    else if(item == 2) {
      $scope.projectDetails.keywords.keyword2 = '';
      projDetails.keywords.keyword2 = '';
    }
    else if(item == 3) {
      $scope.projectDetails.keywords.keyword3 = '';
      projDetails.keywords.keyword3 = '';
    }
    else if(item == 4) {
      $scope.projectDetails.keywords.keyword4 = '';
      projDetails.keywords.keyword4 = '';
    }
    else if(item == 5) {
      $scope.projectDetails.keywords.keyword5 = '';
      projDetails.keywords.keyword5 = '';
    }
  }
  $scope.isSolicitation = function(solicitationValue) {
    $scope.showAgencies = solicitationValue;
  }
  $scope.saveProjectDetails = function(projDetails, documentFiles) {
    //Server will blow out if the date field is sent, so this is what I need to send
    // Categories: projDetails.Categories, //No Longer needed -but keep just in case
    var detailsToSave = {
      title: projDetails.title,
      description: projDetails.description,
      owner: projDetails.owner,
      agency: projDetails.agency,
      solicitationTitle: projDetails.solicitationTitle,
      solicitationNumber: projDetails.solicitationNumber,
      workOnSiteRequired: projDetails.workOnSiteRequired,
      isSolicitation: projDetails.isSolicitation,
      isPublic: projDetails.isPublic,
      exposure: projDetails.exposure,
      keepPrivate: projDetails.keepPrivate,
      keywords: projDetails.keywords,
      gpKey: projDetails.gpKey,
    }

    var objToPost = {};
    objToPost.jsonData = JSON.stringify(detailsToSave);

    if(documentFiles) {
      if(documentFiles.file) {
        objToPost.projectFile1 = documentFiles.file;
      }
      if(documentFiles.file1) {
        objToPost.projectFile2 = documentFiles.file1;
      }
      if(documentFiles.file2) {
        objToPost.projectFile3 = documentFiles.file2;
      }
    }
    upload({
      url: __env.apiUrl+'/index.asp?remoteCall=CoNameSetProjectDetails&gpKey='+detailsToSave.gpKey+'&RequestBinary=true',
      method: 'POST',
      data : objToPost
    })
    .then(function(response) {
      console.log(response.data);
        if(response.data.errors.length > 0) {
        }
        else {
          if(projDetails.duplicate) {
            $state.go('company');
          }
          else if($scope.cameFromDashboard) {
            $state.go('company');
          }
          else {
            $scope.showEditProjectFields = false;
            $scope.showDuplicateProject = false;
            $scope.projectOverviewTemplate = 'projectOverview'
            $scope.projectDetails = response.data.data;
          }
        }
    });
  }
  $scope.saveDuplicatedProject = function(projDetails, documentFiles) {
    projDetails.duplicate = true;
    $scope.saveProjectDetails(projDetails, documentFiles);
  }
  $scope.CoNameSetConsultantToFavorites = function(consultant) {
    var projectKey = $stateParams.id;
    apiSrvc.getData('CoNameSetConsultantToFavorites&gpKey='+consultant.gpKey+'&projectKey='+projectKey).then(function(response){
     $scope.favorites = response.data;
     $scope.checkIfAdded($scope.favorites);
     consultant.existsInFavorites = true;
    });
  }
  $scope.CoNameSetConsultantToBench = function(consultant) {
    var projectKey = $stateParams.id;
    apiSrvc.getData('CoNameSetConsultantToBench&gpKey='+consultant.gpKey+'&projectKey='+projectKey).then(function(response){
      $scope.bench = response.data;
      $scope.checkIfAdded($scope.bench);
      consultant.existsInBench = true;
    });
  }
  $scope.CoNameSetConsultantToShortlist = function(consultant) {
    var projectKey = $stateParams.id;
    apiSrvc.getData('CoNameSetConsultantToShortlist&gpKey='+consultant.gpKey+'&projectKey='+projectKey).then(function(response){
       $scope.shortlist = response.data;
       $scope.checkIfAdded($scope.shortlist);
       consultant.existsInShortlist = true;
    });
  }
  $scope.CoNameRemoveConsultantFromFavorites = function(consultant) {
    var projectKey = $stateParams.id;
    apiSrvc.getData('CoNameRemoveConsultantFromFavorites&gpKey='+consultant.gpKey+'&projectKey='+projectKey).then(function(response){
     $scope.favorites = response.data;
     $scope.checkIfAdded($scope.favorites);
     consultant.existsInFavorites = false;
    });
  }
  $scope.CoNameRemoveConsultantFromBench = function(consultant) {
    var projectKey = $stateParams.id;
    apiSrvc.getData('CoNameRemoveConsultantFromBench&gpKey='+consultant.gpKey).then(function(response){
      $scope.bench = response.data;
      $scope.checkIfAdded($scope.bench);
      consultant.existsInBench = false;
    });
  }
  $scope.CoNameRemoveConsultantFromShortlist = function(consultant) {
    var projectKey = $stateParams.id;
    apiSrvc.getData('CoNameRemoveConsultantFromShortlist&gpKey='+consultant.gpKey+'&projectKey='+projectKey).then(function(response){
     $scope.shortlist = response.data;
     $scope.checkIfAdded($scope.shortlist);
     consultant.existsInShortlist = false;
    });
  }

  $scope.checkIfAdded = function(expertList) {
    var inFav = false;
    var inSList = false;
    var inBench = false;
    angular.forEach(expertList, function(elist, key1) {
      inFav = false;
      inSList = false;
      inBench = false;
      // for testing only 4.29.19
      if(key1 % 2 === 0) {
        elist.isVIP = true;
      }
      else {
        elist.isVIP = false;
      }
      // end for testing only
      angular.forEach($scope.favorites, function(favList, key2) {
        if(favList.gpKey === elist.gpKey) {
          inFav = true;
        }
      });
      angular.forEach($scope.shortlist, function(sList, key3) {
        if(sList.gpKey === elist.gpKey) {
          inSList = true;
        }
      });
      angular.forEach($scope.bench, function(benchList, key4) {
        if(benchList.gpKey === elist.gpKey) {
          inBench = true;
        }
      });
      elist.existsInFavorites = inFav;
      elist.existsInShortlist = inSList;
      elist.existsInBench = inBench;
    })
    return expertList;
  }
  $scope.duplicateProject = function(projDetails) {

    // if($scope.cameFromDashboard) {
    //   projDetails = $scope.projectDetails;
    // }

    $scope.duplicatedProject = angular.copy(projDetails);
    $scope.duplicatedProject.title = $scope.duplicatedProject.title + ' (Copy)';
    $scope.duplicatedProject.projectFiles = [];
    $rootScope.placeholder = 'No File Chosen';
    $rootScope.placeholder1 = 'No File Chosen';
    $rootScope.placeholder2 = 'No File Chosen';

    $scope.duplicatedProject.gpKey = '';
    $scope.showEditProjectFields = false;
    $scope.showDuplicateProject = true;
    $scope.projectOverviewTemplate = 'duplicateProject'

    $scope.CoNameGetAgencies();
    if(projDetails.agency.name) {
      $scope.agencyPlaceholder = projDetails.agency.name;
      $scope.selectedAgencyItem =  projDetails.agency.name;
    }
    else {
      $scope.agencyPlaceholder = 'Agency (Autocomplete)';
    }
  }
  $scope.cancelEditProject = function() {
    $scope.showEditProjectFields = false;
    $scope.showDuplicateProject = false;
    $scope.projectOverviewTemplate = 'projectOverview'

  }

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
    }
    if(!$scope.notallaretrue && $scope.notallarefalse) {
      $scope.noneAreSelected = true;
      cat.selected = false;
    }
  }

  //********************************* Small FUNCTIONS *****************************************//
  $scope.limitDescription = 250;
  $scope.limitDescription150 = 150;
  $scope.readMoreDescription = function() {
    $scope.limitDescription = '';
    $scope.limitDescription150 = '';
  }
  $scope.showLessDescription = function() {
    $scope.limitDescription = 250;
    $scope.limitDescription150 = 150;
  }

  //*********************************** REMOTE METHODS - AUTOCOMPLETE **********************************//
  //*********************************** LOCATION **********************************//
  $scope.CoNameGetLocationAutoCompleteResults = function(city) {
    return $http
     .get('/index.asp?remoteCall=CoNameGetLocationAutoCompleteResults&location='+city)
     .then(function(data) {
      return $scope.removeFromSelectedCities(data.data.data, $scope.citiesFilterArray);
     });
  }
  $scope.removeFromSelectedCities = function(serverList, selectedList) {
   var rowExist = false;
   var ResultArray=[];
   angular.forEach(serverList, function(citystate, $index) {
     rowExist = false;
    angular.forEach(selectedList, function(citySelected) {
      if((citystate.city === citySelected.city) && (citystate.state === citySelected.state)) {
        rowExist = true;
      }
    })
    if (!rowExist){
      ResultArray.push(citystate);
    }
  })
  return ResultArray;
  }
  $scope.citiesFilterArray = [];
  $scope.searchLocationText = {};
  $scope.addCity = function(city) {
   $scope.searchLocationText.searchText = '';
   if(city) {
    $scope.citiesFilterArray.push(city);
    $scope.filter.LocationFilter = $scope.citiesFilterArray;
   }
  }
  $scope.removeCity = function(index) {
   $scope.citiesFilterArray.splice(index, 1);
  };

  /*********************************** AGENCIES  **********************************/
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
  }
  $scope.removeAgency = function(index, agency) {
    $scope.agency = agency;
    $scope.agency.selected = false;
  };
  $scope.addAgencyForProject = function(agency) {
    $scope.projectDetails.agency = agency;
  }
  $scope.addAgencyForDuplicatedProject = function(agency) {
    $scope.duplicatedProject.agency = agency;
  }


  /*********************************** CERTIFICATIONS **********************************/
  $scope.CoNameGetUserCertifications();
  $scope.getCertificationsForAutoComplete = function(certification) {
      var certificationResult = [];
      angular.forEach($scope.certifications, function(item){
        var lcItem = angular.lowercase(item.name);
        var lcCertification = angular.lowercase(certification);
        if((lcItem.search(lcCertification) >= 0) && (!item.selected) ) {
            certificationResult.push(item);
        }
      });
      return certificationResult;
    };
  $scope.certificationsFilterArray = [];
  $scope.searchCertificationText = {};
  $scope.addCertification = function(certification) {
    $scope.searchCertificationText.searchText = '';
    angular.forEach($scope.certifications, function(item){
      if(certification) {
        if(item.gpKey == certification.gpKey) {
            item.selected = true;
            if($scope.filter.CertificationsFilter.length > 0) {
              $scope.filter.CertificationsFilter.push(item)
            }
            else {
              $scope.certificationsFilterArray.push(item);
              $scope.filter.CertificationsFilter = $scope.certificationsFilterArray;
            }

        }
      }
    });
  }
  $scope.removeCertification = function(index, certification) {
    $scope.certification = certification;
    $scope.certification.selected = false;
  };

  //*************************************************************************************//
  //************************************** Keyword Search *************************************//
  //*************************************************************************************//
  $scope.addKeyword = function($event, keywordInput) {
    var keyCode = $event.which || $event.keyCode;
    if (keyCode === 13) {
      if($scope.keywordFilterArray.indexOf(keywordInput) !== -1) {
          console.log('exists');
        }
        else {
          $scope.keywordFilterArray.push(keywordInput);
        }
      $event.currentTarget.value = "";
      $scope.ApplyFilters();
      return $scope.keywordInput = '';
    }

    console.log(keywordInput);
    console.log($event);
  }
  $scope.searchKeywords = function(keywordInput) {
    // $scope.keywordFilterArray.push(keywordInput);
    if($scope.keywordFilterArray.indexOf(keywordInput) !== -1) {
        console.log('exists');
    }
    else {
      $scope.keywordFilterArray.push(keywordInput);
    }
      $scope.ApplyFilters();
  }

  //*************************************************************************************//
  //********************************** Clear Individual Filters *********************************//
  //*************************************************************************************//
  $scope.clearSubCat = function(sub) {
    sub.selected = false;
  }
  $scope.clearAgency = function(agency) {
    agency.selected = false;
  }
  $scope.clearCertification = function(certification) {
    certification.selected = false;
  }
  $scope.clearRating = function(rating) {
    rating.selected = false;
  }
  $scope.clearSecurityLevel = function(level) {
    level.selected = false;
  }
  $scope.clearVerification = function(verification) {
    verification.selected = false;
  }
  $scope.clearProfileCompletion = function(ProfileFilter) {
    ProfileFilter.profileCompletion = 0;
  }
  $scope.clearKeyword = function(index, keyword) {
    $scope.keywordFilterArray.splice(index, 1);
  }
  $scope.clearHasResume = function(resume) {
    resume.onlyWithResume = false;
  }
  $scope.clearAvailability = function(availabilityFilter) {
    console.log(availabilityFilter);
    availabilityFilter.Availability = {name: '', gpKey: ''};
    // filter.AvailabilityFilter.Availability = {name: '', gpKey: ''};
  }
  $scope.clearAdvisoryBoard = function(type) {
    type.advisoryBoardCandidate = false;
  }
  $scope.clearFreelance = function(type) {
    type.checkFreelanceConsultant = false;
  }
  $scope.resetHourlyRate = function(type, rangeSlider) {
    type.freelanceHourlyRateMax = 0;
    type.freelanceHourlyRateMin = 0;
    rangeSlider.minValue = 0;
    rangeSlider.maxValue = 0;
  }
  $scope.resetSalary = function(type, rangeSlider2) {
    type.fullTimeAnnualSalaryMax = 0;
    type.fullTimeAnnualSalaryMin = 0;
    rangeSlider2.minValue = 0;
    rangeSlider2.maxValue = 0;
  }
  $scope.clearFullTime = function(type) {
    type.checkFullTimeEmployee = false;
  }

  //*************************************************************************************//
  //********************************** Clear All Filter *********************************//
  //*************************************************************************************//
  $scope.clearAllFilter = function(filter) {
    angular.forEach(filter.RatingFilter, function(rating) {
      rating.selected = false;
    })
    angular.forEach(filter.CategoryFilter, function(cat) {
      cat.selected = false;
      angular.forEach(cat.subCategories, function(subCat) {
        subCat.selected = false;
      })
    });
    angular.forEach(filter.SecurityFilter, function(level) {
      level.selected = false;
    });
    angular.forEach(filter.VerificationFilter, function(verfication) {
      verfication.selected = false;
    });
    angular.forEach($scope.certifications, function(cert) {
      cert.selected = false;
    })
    angular.forEach($scope.agencies, function(agency) {
      agency.selected = false;
    })

    filter.KeywordFilter.keywords = [];

    filter.TypeFilter = {
      checkFreelanceConsultant: false,
      freelanceHourlyRateMin: 0,
      freelanceHourlyRateMax: 0,
      checkFullTimeEmployee: false,
      fullTimeAnnualSalaryMin: 0,
      fullTimeAnnualSalaryMax: 0,
      advisoryBoardCandidate: false
    };
    filter.AvailabilityFilter.Availability = {name: '', gpKey: ''};
    filter.LocationFilter = [];
    filter.ProfileFilter.profileCompletion = 0;
    filter.ResumeFilter.onlyWithResume = false;

    $scope.keywordFilterArray = [];
    $scope.citiesFilterArray = [];
     if(angular.isDefined($scope.mySavedSearches)){
       delete $scope.mySavedSearches;
      }
     $scope.agenciesFilterArray = [];
     $scope.filter.AgencyFilter = [];

     $scope.certificationsFilterArray = [];
     $scope.filter.CertificationsFilter = [];
     $scope.filter = filter;
     $scope.callLastFunction();
   }

  //*********************************** Range Slider **********************************//
  $scope.rangeSlider = {
      minValue: 10,
      maxValue: 500,
      options: {
        floor: 10,
        ceil: 1000,
        step: 1,
        minRange: 10,
        noSwitching: true,
        translate: function(value) {
          return '$' + value;
        },
        onEnd: function(value) {
          $scope.filter.TypeFilter.freelanceHourlyRateMin = $scope.rangeSlider.minValue;
          $scope.filter.TypeFilter.freelanceHourlyRateMax = $scope.rangeSlider.maxValue;
        }
      }
    }
  $scope.rangeSlider2 = {
    minValue: 30000,
    maxValue: 250000,
    options: {
      floor: 0,
      ceil: 500000,
      step: 1,
      translate: function(value) {
        return '$' + value.toLocaleString();
      },
      onEnd: function(value) {
        $scope.filter.TypeFilter.fullTimeAnnualSalaryMin = $scope.rangeSlider2.minValue;
        $scope.filter.TypeFilter.fullTimeAnnualSalaryMax = $scope.rangeSlider2.maxValue;
      }
    }
  }

  /************************************************************************************************************/
  /******************************************* DELETE and ARCHIVE  ********************************************/
  /************************************************************************************************************/
  $scope.deleteProject = function(project) {
    if(project.status.gpKey === '{79839C99-B83A-4420-A867-10ACF3BBDAB5}') {
      $mdToast.show({
          hideDelay   : false,
          position    : 'bottom',
          parent : $document[0].querySelector('.custom-projectDetailHeader'),
          scope:$scope,
          preserveScope:true,
          controller  : deleteProjectWarningToastCtrl,
          template :  '<md-toast class="md-warning-toast-theme"><div class="md-toast-text flex">Are you sure you want to delete this project?</div><div class="md-toast-text "><md-button ng-click="closeDelete()">Cancel</md-button><md-button ng-click="yesDelete()">Yes, Delete</md-button></div></md-toast>'
        });
       function deleteProjectWarningToastCtrl($scope, $rootScope, apiSrvc, commonFnSrvc, $mdDialog, $mdToast) {
         $scope.closeDelete = function() {$mdToast.hide();}
         $scope.yesDelete = function() {
           apiSrvc.getData('CoNameProcessProjectDelete&gpKey='+project.gpKey).then(function(response) {
             $mdToast.hide();
             $state.go('company');
           })
         }
       }
    }
    else {}
  }
  $scope.archiveProject = function(project) {
    if(project.status.gpKey === '{74699447-4fad-47f9-9f68-48a3e86b7f5e}') {
      $mdToast.show({
          hideDelay   : false,
          position    : 'bottom',
          parent : $document[0].querySelector('.custom-projectDetailHeader'),
          scope:$scope,
          preserveScope:true,
          controller  : archiveProjectWarningToastCtrl,
          template :  '<md-toast class="md-warning-toast-theme"><div class="md-toast-text flex">Are you sure you want to archive this project?</div><div class="md-toast-text "><md-button ng-click="closeArchive()">Cancel</md-button><md-button ng-click="yesArchive()">Yes, Archive</md-button></div></md-toast>'
        });
       function archiveProjectWarningToastCtrl($scope, $rootScope, apiSrvc, commonFnSrvc, $mdDialog, $mdToast) {
         $scope.closeArchive = function() {$mdToast.hide();}
         $scope.yesArchive = function() {
           apiSrvc.getData('CoNameProcessProjectArchive&gpKey='+project.gpKey).then(function(response) {
             $mdToast.hide();
             $state.go('myProjects');
           })
         }
       }
    }
    else {}
  }
  $scope.closeProject = function(project) {
    if(project.status.gpKey === '{A40E44D2-332E-4D01-9039-28E52B5193FB}') {
      $mdToast.show({
          hideDelay   : false,
          position    : 'bottom',
          parent : $document[0].querySelector('.custom-projectDetailHeader'),
          scope:$scope,
          preserveScope:true,
          controller  : closeProjectWarningToastCtrl,
          template :  '<md-toast class="md-warning-toast-theme"><div class="md-toast-text flex">Are you sure you want to close this project?</div><div class="md-toast-text "><md-button ng-click="closeCloseProject()">Cancel</md-button><md-button ng-click="yesCloseProject()">Yes, Close Project</md-button></div></md-toast>'
        });
       function closeProjectWarningToastCtrl($scope, $rootScope, apiSrvc, commonFnSrvc, $mdDialog, $mdToast) {
         $scope.closeCloseProject = function() {$mdToast.hide();}
         $scope.yesCloseProject = function() {
           apiSrvc.getData('CoNameProcessProjectClosed&gpKey='+project.gpKey).then(function(response) {
             $mdToast.hide();
             $state.go('company');
           })
         }
       }
    }
    else {}
  }

  /************************************************************************************************************/
  /************************************************** LINKS ***************************************************/
  /************************************************************************************************************/

  $scope.goToDashboard = function() {
    $state.go('company');
  }
  $scope.goToMyAccount = function() {
    $state.go('myAccount');
  }
  $scope.goToMyProfile = function() {
    $state.go('myProfile');
  }
  $scope.goToMyProjects = function() {
    $state.go('myProjects');
  }
  $scope.goToContractsSearch = function() {
    $state.go('contractsSearch');
  }
  $scope.goToTrendingOpportunities = function() {
    $state.go('trendingOpportunities');
  }
  $scope.goToResources = function() {
    $state.go('resources');
  }
  $scope.goToPostAProject = function() {
    $state.go('postProject');
  }
  $scope.goToFindExperts = function() {
    $state.go('findExperts');
  }
  $scope.goToAwardProject = function() {
    $state.go('awardProject');
  }
  $scope.goToManageProject = function() {
    $state.go('manageProject');
  }
  $scope.goToVIP = function() {
    $state.go('VIP');
  }
  $scope.goToBench = function() {
    $state.go('bench');
  }

  //**********************************************************************************************************//
  //******************************************* Accordion - Details ********************************************//
  //**********************************************************************************************************//
  $scope.openAcc2 = function() {$scope.openAccordion2 = true;}
  $scope.closeAcc2 = function() {$scope.openAccordion2 = false;}
  $scope.openAcc3 = function() {$scope.openAccordion3 = true;}
  $scope.closeAcc3 = function() {$scope.openAccordion3 = false;}
  $scope.openAcc4 = function() {$scope.openAccordion4 = true;}
  $scope.closeAcc4 = function() {$scope.openAccordion4 = false;}
  $scope.openQuotesReceived = function() {$scope.openAccordion5 = true; $scope.CoNameGetCompanyUsers();}
  $scope.closeQuotesReceived = function() {$scope.openAccordion5 = false;}
  $scope.openengagementsToApprove = function() {$scope.openAccordion6 = true;}
  $scope.closeengagementsToApprove = function() {$scope.openAccordion6 = false;}

  //**********************************************************************************************************//
  //******************************************* Accordion - Filters ********************************************//
  //**********************************************************************************************************//
  $scope.openappNameRating = function() {$scope.openGPRating = true; $scope.callappNameRatingFilterAfterInit();}
  $scope.closeappNameRating = function() {$scope.openGPRating = false;}
  //
  $scope.openKeywordSearch = function() {$scope.openKeySearch = true;}
  $scope.closeKeywordSearch = function() {$scope.openKeySearch = false;}
  //
  $scope.openappNameCategory = function() {$scope.openGPCategory = true;}
  $scope.closeappNameCategory = function() {$scope.openGPCategory = false;}
  //
  $scope.openappNameCost = function() {$scope.openGPCost = true;}
  $scope.closeappNameCost = function() {$scope.openGPCost = false;}
  //
  $scope.openappNameType = function() {$scope.openGPType = true;}
  $scope.closeappNameType = function() {$scope.openGPType = false;}
  //
  $scope.openAvailability = function() {$scope.openGPAvailability = true;}
  $scope.closeAvailability = function() {$scope.openGPAvailability = false;}
  //
  $scope.openLocation = function() {$scope.openGPLocation = true;}
  $scope.closeLocation = function() {$scope.openGPLocation = false;}
  //
  $scope.openSecurityClearance = function() {$scope.openSecClear = true;}
  $scope.closeSecurityClearance = function() {$scope.openSecClear = false;}
  //
  $scope.openCertifications = function() {$scope.openCert = true;}
  $scope.closeCertifications = function() {$scope.openCert = false;}
  //
  $scope.openRecommendations = function() {$scope.openVer = true;}
  $scope.closeRecommendations = function() {$scope.openVer = false;}
  //
  $scope.openAgency = function() {$scope.openAgencyFilter = true;$scope.CoNameGetAgencies();}
  $scope.closeAgency = function() {$scope.openAgencyFilter = false;}
  //
  $scope.openProfileCompletion = function() {$scope.openProfComplete = true;}
  $scope.closeProfileCompletion = function() {$scope.openProfComplete = false;}
  //
  $scope.openResume = function() {$scope.openGPResume = true;}
  $scope.closeResume = function() {$scope.openGPResume = false;}
  //
  $scope.openCustomerFamiliarity = function() {$scope.openGPCustomerFamiliarity = true;}
  $scope.closeCustomerFamiliarity = function() {$scope.openGPCustomerFamiliarity = false;}

  /************************************** MODALS **********************************/
  $scope.showFiltersModal= function(ev) {
    $rootScope.allowSaveFilter = false;
    $mdDialog.show({
      controller: applyFilterCtrl,
      templateUrl: '/views/company/projectDetails/findExperts/modals/saveFiltersModal.html',
      parent: angular.element(document.querySelector('.custom-dashWrapper')),
      targetEvent: ev,
      clickOutsideToClose:true,
      locals: {
           savedSearches: $scope.savedSearches,
           envURL: $scope.envURL
         },
      onRemoving: function (event, removePromise) {
         if($rootScope.allowSaveFilter) {
           $scope.filter.AgencyFilter = $scope.agenciesFilterArray;
           $scope.filter.CertificationsFilter = $scope.certificationsFilterArray; //added 3.23.18
           apiSrvc.sendPostData('CoNameSetCompanySearch&FilterSearchName='+$rootScope.filtername, $scope.filter).then(function(response){
             $scope.savedSearches = response.data;
           });
         }
       }
    });
  };
  function applyFilterCtrl($scope, $rootScope, $mdDialog, apiSrvc, commonFnSrvc, savedSearches) {
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
      angular.forEach(savedSearches, function(savedSearch) {
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
  //////////////////// Show Send Message Short List Modal ////////////////////////
  $scope.showSendMsgSLModal = function(ev, sl) {
    $rootScope.closeAndGoToDash = false;
    $scope.slInfo = sl;
    $mdDialog.show({
      controller: sendMsgSLCtrl,
      templateUrl: '/views/company/projectDetails/findExperts/modals/sendMessageSLModal.html',
      parent: angular.element(document.querySelector('.custom-dashWrapper')),
      targetEvent: ev,
      clickOutsideToClose:true,
      locals: {
           slInfo: $scope.slInfo,
           userInfo: $scope.userInfo,
           projectInfo: $scope.projectDetails,
           envURL: $scope.envURL
         },
      onRemoving: function (event, removePromise) {
       if($rootScope.closeAndGoToDash) {
         $state.go('company');
       }
      }
    });
  };

  //////////////////// Show Engagement Invite Modal  ////////////////////////
  $scope.showEngagementInviteModal = function(ev, sl) {
    $rootScope.closeAndGoToDash = false;
    $scope.slInfo = sl;
    $mdDialog.show({
      controller: EICtrl,
      templateUrl: '/views/company/projectDetails/findExperts/modals/inviteToQuoteModal.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      locals: {
           slInfo: $scope.slInfo,
           userInfo: $scope.userInfo,
           projectInfo: $scope.projectDetails,
           referenceFile: $rootScope.referenceFile,
           envURL: $scope.envURL
         },
      onRemoving: function (event, removePromise) {
        if($rootScope.closeAndGoToDash) {
          $state.go('company');
        }
      }
    });
  };

  //////////////////// Add Consultant to GROUP Engagement Invite ////////////////////////
  $scope.groupLength = 0;
  $scope.addConsultantToGroupInvite = function(sl) {
    if(sl.selectedForGroup) {
      $scope.groupLength = ($scope.groupLength + 1);
      console.log($scope.groupLength);
    }
    else {
      $scope.groupLength = ($scope.groupLength - 1);
      console.log($scope.groupLength);
    }
  }

  //////////////////// Show GROUP Engagement Invite Modal  ////////////////////////
  $scope.showGroupEngagementInviteModal = function(ev, shortlist) {
    $rootScope.closeAndGoToDash = false;
    console.log(shortlist);
    var groupToBeInvited = [];
    angular.forEach(shortlist, function(selectedPerson) {
      if(selectedPerson.selectedForGroup) {
        groupToBeInvited.push(selectedPerson);
      }
    });

    $mdDialog.show({
      controller: groupInviteToQuoteCtrl,
      templateUrl: '/views/company/projectDetails/findExperts/modals/groupInviteToQuoteModal.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      locals: {
           groupInfo: groupToBeInvited,
           userInfo: $scope.userInfo,
           projectInfo: $scope.projectDetails,
           referenceFile: $rootScope.referenceFile,
           envURL: $scope.envURL
         },
      onRemoving: function (event, removePromise) {
        if($rootScope.closeAndGoToDash) {
          $state.go('company');
        }
      }
    });
  };

  //////////////////// Show Review Quote Details Modal  ////////////////////////
  $scope.getAccountStatus = function() {
    apiSrvc.getData('CoNameGetAccountStatusInfo').then(function(response) {
      $scope.accountInfo = response.data;
    });
  };
  $scope.getAccountStatus();

  $scope.showQuoteReviewModal = function(ev, qd, ui) {

    if(!qd.consultantSubmitted && !qd.consultantOCINDARejected && !qd.companyRejected) {
      console.log('do nothing');
    }
    else {
      $rootScope.approveToast = false;
      $rootScope.rejectToast = false;
      var addNewAP = {name: "Add New AP", guid: "0", addNew: true};
      apiSrvc.getData('CoNameGetAccountStatusInfo').then(function(response) {
        $scope.accountInfo = response.data;
        $mdDialog.show({
          controller: quoteReviewModalCtrl,
          templateUrl: '/views/company/projectDetails/reviewQuotes/quoteReviewModal.html',
          parent: angular.element(document.querySelector('body')),
          targetEvent: ev,
          clickOutsideToClose:false,
          scope:$scope,
          preserveScope:true,
          locals: {
            quoteDetails: qd,
            userInfo: ui,
            // companyUsers: $scope.companyUsers,
            accountInfoData : $scope.accountInfo,
            envURL: $scope.envURL
             },
          onRemoving: function (event, removePromise) {
             if($rootScope.approveToast) {
               qd.companyApproved = true;
               $mdToast.show(
                 // $mdToast.simple({parent : $document[0].querySelector('#custom-QuotesPanel')})
                $mdToast.simple({parent : $document[0].querySelector('.custom-quotesReceivedList')})
                  .textContent('You have approved this offer!')
                  .hideDelay(3000)
                  .theme("warning-toast")
              );
             }
             if($rootScope.rejectToast) {
               qd.companyRejected = true;
               $mdToast.show(
                $mdToast.simple({parent : $document[0].querySelector('.custom-quotesReceivedList')})
                  .textContent('You have rejected this offer')
                  .hideDelay(false)
                  .theme("warning-toast")
                  .action('Ok')
              );
              // !!!! Will get this data in promise - to change tomorrow !!!!
              apiSrvc.getData('CoNameGetProjectDetails&gpkey=' + $stateParams.id).then(function(response){
                $scope.projectDetails = response.data;
                $scope.shortlist = response.data.Shortlist;
                $scope.favorites = response.data.Favorites;
                $scope.bench = response.data.Bench;
                $scope.checkIfAdded($scope.shortlist);
                $scope.checkIfAdded($scope.favorites);
                $scope.checkIfAdded($scope.bench);
                $scope.quotesReceived = response.data.QuotesReceived;
                $scope.engagementsToApprove = response.data.EngagementsToApprove;
                $scope.engagements = response.data.Engagements;
                //Not sure about this anymore as ive changed the code
                $scope.completedEngagements = [];
                angular.forEach($scope.engagements, function(engagement) {
                  angular.forEach(engagement.tasks, function(task) {
                    if(task.completed && task.approved) {
                      $scope.completedEngagements.push(engagement);
                    }
                  })
                })

                //Temporary until this field is updated for all projects
                console.log($scope.projectDetails.exposure)
                if($scope.projectDetails.exposure == 0) {
                  $scope.projectDetails.exposure = 2;
                  console.log($scope.projectDetails.exposure);
                }
              });
             }
           }
        });
      });

    }

  };

  //////////////////// Show Review Quote Details Modal  ////////////////////////
  $scope.CoNameGetPlanInformation = function() {
    apiSrvc.getData('CoNameGetPlanInformation').then(function(response){
      console.log(response.data);
      $scope.planInformation = response.data;
    });
  }

  $scope.showEngagementsToApproveModal = function(ev, ed) {

    function openEngagementModal() {
      $rootScope.taskHasBeenApproved = false;
       $rootScope.consultantWasRated = false;
        $mdDialog.show({
        controller: engagementsToApproveModalCtrl,
        templateUrl: 'views/company/projectDetails/manageEngagements/engagementsToApproveModal.html',
        parent: angular.element(document.querySelector('body')),
        targetEvent: ev,
        clickOutsideToClose:true,
        scope:$scope,
        preserveScope:true,
        locals: {
          engagementDetails: ed,
          accountInfoData : $scope.accountInfo,
          userInfo : $rootScope.userInfo,
          envURL: $scope.envURL,
          planInformation: $scope.planInformation
        },
        onRemoving: function (event, removePromise) {
          if($rootScope.openEIModal) {
            $scope.showEngagementInviteModal(event, ed);
          }
          // added 7.10.18 see showQuoteReviewModal()
          if($rootScope.taskHasBeenApproved || $rootScope.consultantWasRated) {
            // !!!! Will get this data in promise - to change tomorrow !!!!
            apiSrvc.getData('CoNameGetProjectDetails&gpkey=' + $stateParams.id).then(function(response){
              $scope.engagementsToApprove = response.data.EngagementsToApprove;
              $scope.engagements = response.data.Engagements;
              $scope.completedEngagements = [];
              angular.forEach($scope.engagements, function(engagement) {
                angular.forEach(engagement.tasks, function(task) {
                  var keepGoing = true;
                  engagement.actionNeeded = false;
                  engagement.needsRating = false;
                  engagement.isCompleted = false;

                  if(task.completed && task.approved) {
                    $scope.completedEngagements.push(engagement);
                  }

                  if(keepGoing) {
                    if(task.completed && !task.approved) {
                        engagement.actionNeeded = true;
                        var keepGoing = false;
                    }
                    else if(task.completed && task.approved && !task.rated) {
                        engagement.needsRating = true;
                        var keepGoing = false;
                    }
                    else if(task.completed && task.approved && task.rated) {
                        engagement.isCompleted = true;
                        var keepGoing = false;
                    }
                  }

                })
              })
              console.log($scope.projectDetails.exposure)
              if($scope.projectDetails.exposure == 0) {
                $scope.projectDetails.exposure = 2;
                console.log($scope.projectDetails.exposure);
              }
            });
          }
        }
      });
    }

    if(!$scope.planInformation) {
       apiSrvc.getData('CoNameGetPlanInformation').then(function(response){
          $scope.planInformation = response.data;
          openEngagementModal();
        });

    }
    else {
      openEngagementModal();
    }
  };
  $scope.CoNameSetConsultantTotalViews = function(expert) {
    apiSrvc.getData('CoNameSetConsultantTotalViews&gpKey='+expert.gpKey).then(function(response) {});
  }
  $scope.goToExpertDetails = function(expert) {
    $state.go('expertProfile', {id: expert.gpKey, expertDetails: expert })
  }
  //////////////////// Show Review Quote Details Modal  ////////////////////////
  $scope.showFullConsultantDetailsModal = function(ev, expert, planinfo) {
    console.log(planinfo);
    if(expert.isVIP && (planinfo.gpKey === "{763b37dc-8c46-4eb6-9b7e-ba9c963d5a7f}")) {
      $scope.infoObject = {
        msg: 'Please upgrade to Professional to access VIP/Senior Executives.',
        title: 'Notice',
      }
      console.log('YOU CANNOT see the full details');
      $mdDialog.show({
        controller: infoModalCtrl,
        templateUrl: '/views/globalModals/infoModal.html',
        parent: angular.element(document.querySelector('body')),
        targetEvent: ev,
        clickOutsideToClose:true,
        locals: {
             dialogInfo: $scope.infoObject
           }
      });
    }
    else {
      $scope.CoNameSetConsultantTotalViews(expert);
      apiSrvc.getData('CoNameGetConsultantInformation&gpKey='+expert.gpKey).then(function(response) {
        $rootScope.openEIModal = false;
        var details = response.data;
        // details.isVIP = true; // 4.29.19 testing only
        $mdDialog.show({
          controller: expertDetailsModalCtrl,
          templateUrl: 'views/company/projectDetails/findExperts/modals/fullConsultantDetailsModal.html',
          parent: angular.element(document.querySelector('body')),
          targetEvent: ev,
          clickOutsideToClose:true,
          scope:$scope,
          preserveScope:true,
          locals: {
            expertDetails: details,
            envURL: $scope.envURL
          },
          onRemoving: function (event, removePromise) {
            if($rootScope.openEIModal) {
              $scope.showEngagementInviteModal(event, details);
            }
            if($rootScope.openSMModal) {
              $scope.showSendMsgSLModal(event, details);
            }
          }
        });
      })
    }


  };

/************************** FAKE DATA *********************/
  $rootScope.referenceFile = [
    { "id": "1", "filename":"placeholder", "file": "placeholder.pdf"},
    { "id": "2", "filename":"placeholder", "file": "placeholder.pdf"},
    { "id": "3", "filename":"placeholder", "file": "placeholder.pdf"}
  ]
  $scope.profileFilter = [
    {"value": 0, "name": "All Levels"},
    {"value": 50, "name": ">50%"},
    {"value": 70, "name": ">70%"},
    {"value": 80, "name": ">80%"},
    {"value": 90, "name": ">90%"},
    {"value": 100, "name": "100%"},
  ]
  $scope.findExpertSortBy = [
    // {"id": 0, "name": "Default"},
    {"id": 10, "name": "Performance Rating"},
    {"id": 40, "name": "References"},
    {"id": 20, "name": "Cost Low to High"},
    {"id": 21, "name": "Cost High to Low"},
    {"id": 35, "name": "Most Popular"},

    {"id": 60, "name": "Last Name"}
  ]
  //NOTE: Added this 1.8.18 when changing to tabs
  $scope.detailsAreLoaded = function() {
    $scope.sortBySelected = $scope.findExpertSortBy[0];
    $scope.CoNameGetCompanySavedSearches();
    $scope.CoNameGetAvailabilities();
    $scope.CoNameGetCategories();
  }
  $scope.detailsAreLoaded();

//END CONTROLLER
});
