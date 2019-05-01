var app = angular.module('CoName', ['ui.router', 'ngTable', 'ngFileUpload', 'lr.upload', 'ngMaterial', 'ngMessages', 'ngSanitize', 'ui.materialize', 'blockUI', 'vcRecaptcha', 'rzModule', 'cl.paging', 'textAngular', 'material.svgAssetsCache', 'imageCropper', 'ngInputCurrency', 'dndLists', 'ngCsv', 'ngHopscotch'], function($httpProvider) {

  // Use x-www-form-urlencoded Content-Type
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
  $httpProvider.defaults.withCredentials = true;

  /**
   * The workhorse; converts an object to x-www-form-urlencoded serialization.
   * @param {Object} obj
   * @return {String}
   */
  var param = function(obj) {
    var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

    for(name in obj) {
      value = obj[name];

      if(value instanceof Array) {
        for(i=0; i<value.length; ++i) {
          subValue = value[i];
          fullSubName = name + '[' + i + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value instanceof Object) {
        for(subName in value) {
          subValue = value[subName];
          fullSubName = name + '[' + subName + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value !== undefined && value !== null)
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
    }

    return query.length ? query.substr(0, query.length - 1) : query;
  };

  // Override $http service's default transformRequest
  $httpProvider.defaults.transformRequest = [function(data) {
    return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
  }];

});


var authenticateUserToIntercom = function(UserInformation) {
    //console.log('UserInformation');
    //console.log(UserInformation);
	if (UserInformation.isConsultant) {
		// Consultant
		var intercomData = UserInformation.intercomConsultant;
		var jsonUserData = {
			app_id: intercomData.app_id,
			name: intercomData.name,
			email: intercomData.email,
			user_hash: intercomData.user_hash,
			"Referral Code": intercomData.referralCode,
			"Title": intercomData.title,
			"Account Type": intercomData.account_type,
			"Company Name": intercomData.company_name,
			"Company Website": intercomData.company_website,
			"Projects": intercomData.projects,
			"Certifications": intercomData.certifications,
			"Clearance": intercomData.clearance,
			"Rate Amount": intercomData.rate_amount,
			"Rating": intercomData.rating,
			"Member_Since_at": intercomData.member_since,
			"Profile Completion": intercomData.profile_completion,
			};

		//console.log('Consultant jsonUserData');
		//console.log(jsonUserData);
		window.Intercom("boot", jsonUserData );

	} else {
		// Company User
		var intercomData = UserInformation.intercomCompany;
		if (UserInformation.allowAccess && UserInformation.Company.gpKey && intercomData.company.id != '0000000000'){
			// Is a real Company User
			//console.log('Company jsonUserData');
			var jsonUserData = {
				app_id: intercomData.app_id,
				name: intercomData.name,
				email: intercomData.email,
				user_hash: intercomData.user_hash,
				"Referral Code": intercomData.referralCode,
				"Title": intercomData.title,
				"User Role": intercomData.user_role,
				"Account Type": intercomData.account_type,
				"Company Name": intercomData.company_name,
				"Company Website": intercomData.company_website,
				company: {
						id: intercomData.company.id,
						name: intercomData.company.name,
						"Company Website": intercomData.company.company_website,
						"Support Plan": intercomData.company.Support_Plan,
						"Purchase_Date_at": intercomData.company.Purchase_Date,
						"Expiration_at": intercomData.company.Expiration,
						"Support Hours": intercomData.company.Support_Hours,
						"Project Limit": intercomData.company.Project_Limit,
						"NAICS Code": intercomData.company.NAICS_Code,
						"Primary Naics Code": intercomData.company.Primary_Naics_Code,
						"Primary Naics Name": intercomData.company.Primary_Naics_Name,
						"Services Offered": intercomData.company.Services_Offered,
						"Projects Active": intercomData.company.Projects_Active,
						"Projects Total": intercomData.company.Projects_Total
					}
				};
		} else {
			// Is a contensive admin or user with not organization set
			//console.log('Site Admin jsonUserData');
			var jsonUserData = {
				app_id: intercomData.app_id,
				name: UserInformation.name,
				email: UserInformation.email,
				user_hash: UserInformation.userHash,
				};
		}
		//console.log(jsonUserData);
		window.Intercom("boot", jsonUserData );
	}
};

var checkRouting = function ($q, $rootScope, $state, apiSrvc, commonFnSrvc, $filter) {
  apiSrvc.getData('CoNameGetUserInformation').then(function(response){
    $rootScope.userInfo = response.data;
    $rootScope.isConsultant = response.data.isConsultant;
    $rootScope.consultantPendingAccess = response.data.consultantPendingAccess;
    $rootScope.isCompany = !response.data.isConsultant;
    $rootScope.authenticated = response.data.isAuthenticated;
    $rootScope.allowedAccess = response.data.allowAccess;
    //To be used for company admin vs user roles
    $rootScope.companyRole = response.data.role;
    // JC Login using Intercom
    if($rootScope.authenticated) {
  	   authenticateUserToIntercom(response.data);
    }

    if($rootScope.isConsultant && $rootScope.authenticated && $rootScope.consultantPendingAccess) {
      $state.go('consultantInviteValidation');
    }
    else if(response.data.isInImpersonateGroup && !response.data.allowAccess) {
      $state.go('csaDashboard');
    }
    else if ($rootScope.isConsultant && $rootScope.authenticated && !$rootScope.consultantPendingAccess) {
      $rootScope.CoNameGetConsultantInformation(response.data.gpKey); //Need to make this a service. Getting an error sometimes - impersonation, for example
      apiSrvc.getData('CoNameGetConsultantApprovedProjects').then(function(response){
         $rootScope.approvedProjectsList = response.data;
         $rootScope.completedEngagements = [];
         $rootScope.incompleteEngagements = [];

         angular.forEach($rootScope.approvedProjectsList, function(engagement) {
           if(engagement.companyApproved) {
             // if(engagement.companyInvoiceApproved) {
             //   $rootScope.completedEngagements.push(engagement);
             // }
             // else {
               $rootScope.incompleteEngagements.push(engagement);

               // qFix
                if(engagement.quoteInvitationInfo.quoteType === 1) {
                  var activeLoop = true;
                  var completedLoop = true;
                  angular.forEach(engagement.quoteInvitationInfo.qFix, function(qfx) {
                   if(activeLoop) {
                     if(qfx.completed === false) {
                       activeLoop = false;
                       completedLoop = false;
                       engagement.status = 'Active';
                       engagement.statNo = 1;
                     }
                     else if(activeLoop && completedLoop) {
                       if(qfx.completed === true) {
                         if(qfx.approved === false) {
                            engagement.status = 'Work Completed';
                            engagement.statNo = 2;
                            completedLoop = false;
                          }
                          else if(qfx.approved === true) {
                            engagement.status = 'Work Approved';
                            engagement.statNo = 3;
                          }
                       }
                     }
                   }
                  })
                }
               // qHours
                if(engagement.quoteInvitationInfo.quoteType === 2) {
                  var activeLoop = true;
                  var completedLoop = true;
                  angular.forEach(engagement.quoteInvitationInfo.qHours, function(qh) {
                      if(activeLoop) {
                        if(qh.completed === false) {
                          activeLoop = false;
                          completedLoop = false;
                          engagement.status = 'Active';
                          engagement.statNo = 1;
                        }
                        else if(activeLoop && completedLoop) {
                          if(qh.completed === true) {
                            if(qh.approved === false) {
                               engagement.status = 'Work Completed';
                               engagement.statNo = 2;
                               completedLoop = false;
                             }
                             else if(qh.approved === true) {
                               engagement.status = 'Work Approved';
                               engagement.statNo = 3;
                             }
                          }
                        }
                      }
                  })
                }
               //Recurring
               //NOTE: Not sure if this will work because of the nature of the Recurring Engagement
                if(engagement.quoteInvitationInfo.quoteType === 3) {
                  if(engagement.quoteInvitationInfo.qRecurring.approved) {
                   engagement.status = 'Work Approved';
                   engagement.statNo = 3;
                  }
                  else if(engagement.quoteInvitationInfo.qRecurring.completed) {
                   engagement.status = 'Work Completed';
                   engagement.statNo = 2;
                  }
                  else {
                   engagement.status = 'Active';
                   engagement.statNo = 1;
                  }
                }
           }
         });

       });

      if($state.current.name === 'signIn') {
       $state.go('consultant');
      }
    }
    else if($rootScope.isCompany && $rootScope.authenticated && !$rootScope.allowedAccess) {
      console.log('Company Sign Up');
      $state.go('step4-Company');
    }
    else if($rootScope.isCompany && $rootScope.authenticated && $rootScope.allowedAccess) {

      //commented 3.7.19
        // apiSrvc.getData('CoNameGetPlanInformation').then(function(response){
        //   $rootScope.planInformation = response.data;
        // });

      if($state.current.name === 'company') {
        $state.params.userParams = response.data;
        var userInfo = response.data;
        apiSrvc.getData('CoNameGetCompanyProfile&gpKey='+userInfo.Company.gpKey).then(function(response) {
          $rootScope.companyInfo = response.data;
        })
      }
      else if($state.current.name === 'signIn') {
        $state.go('company', {userParams: response.data});
      }
      else {}
    }

    else {
      //NOT authenticated
			// JC Login using Intercom
			window.Intercom("shutdown");
      $state.go("signIn")
    }
  });
};

var checkConsultantAuth = function($q, $rootScope, $state, apiSrvc, commonFnSrvc, authSrvc) {
  apiSrvc.getData('CoNameGetUserInformation').then(function(response){
    console.log('app');
      var userInfo = response.data;
      var isConsultant = response.data.isConsultant;
      var isAuthenticated = response.data.isAuthenticated;
      var allowedAccess = response.data.allowAccess;
      var isImpersonateSession = response.data.isImpersonateSession;
      var consultantPendingAccess = response.data.consultantPendingAccess;

      if(isConsultant && isAuthenticated) {
        console.log('is authenticated');
      }
      else {
        $state.go('signIn');
      }
  });

};
