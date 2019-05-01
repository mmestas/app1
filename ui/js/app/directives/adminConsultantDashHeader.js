app.directive('adminConsultantDashHeader', function () {

  var controller = ['$scope', '$rootScope', '$state', '$location', 'apiSrvc', 'authSrvc', function ($scope, $rootScope, $state, $location, apiSrvc, commonFnSrvc, authSrvc) {

            function init() {
              // authSrvc.getUserInfo($scope);
            }

            init();

            $rootScope.CoNameProcessLogout = function() {
              apiSrvc.getData('CoNameProcessLogout').then(function(response){
                $state.go('signIn');
              });
            }

    }];

    return {
        restrict: 'A',
        replace: true,
        controller: controller,
        templateUrl: "/views/admin-consultantDash/header.html"
    }
});
