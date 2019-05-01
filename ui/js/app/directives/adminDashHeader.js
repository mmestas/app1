app.directive('adminDashHeader', function () {

  var controller = ['$scope', '$rootScope', '$state', '$location', 'apiSrvc', 'authSrvc', function ($scope, $rootScope, $state, $location, apiSrvc, commonFnSrvc, authSrvc) {

            function init() {
              // authSrvc.getUserInfo($scope);
            }

            init();

            $rootScope.goToManageAcctUsers = function() {
              if($location.url() === '/companyProfile') {
                $scope.editUsers(0);
              }
              $state.go('companyProfile', {editCompanyUsers : true });
            }
            $rootScope.goToCompanyProfile = function() {
              if($location.url() === '/companyProfile') {
                $rootScope.closeEditUsers();
              }
              $state.go('companyProfile', {editCompanyUsers : false });
            }
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
        templateUrl: "/views/adminDash/header.html"
    }
});
