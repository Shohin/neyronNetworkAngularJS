var app = angular.module('neyronNetworkModul', []);
app.controller('NeyronController', ['$scope', 'neyronNetworkService', function($scope, neyronNetworkService) {
  $scope.x = [];  //result x; matrix
  $scope.y = []; //y; array
  $scope.w = [];
  $scope.allW = [];
  $scope.rows = 10;
  $scope.cols = 10;
  $scope.sums = [];
  $scope.steps = 0;
  $scope.dataFrom = 'file';
  $scope.fileChoose = '';
  $scope.inputStr = '';
  $scope.checkService = function () {
    $scope.allW = neyronNetworkService.neyronProcess($scope.x, $scope.y, $scope.w, $scope.sums);
    $scope.w = $scope.allW[$scope.allW.length - 1];
    $scope.steps = neyronNetworkService.steps;
  }
  $scope.changeRadioAction = function (){
    $scope.clearData();
  };
  $scope.clearData = function () {
    $scope.x = [];
    $scope.y = [];
    $scope.sums = [];
    $scope.w = [];
    $scope.allW = [];
  };
  $scope.generateXAndY = function(nums) {
    var len = nums.length;
    $scope.x.push(nums.slice(0, len - 1));
    $scope.y.push(nums[len - 1]);
  };
  $scope.splitFromStrToMatrix = function(str, splitStr) {
    var array = str.split(splitStr);
    var n = array.length; 
    var m = array[0].split(',').length;
    var nums;
    for (var i = 0; i < n; i++) {
      var numsStr = array[i];
      var arr = numsStr.split(',');
      nums = [];
      for (var j = 0; j < m; j++) {
        nums.push(parseInt(arr[j]));
      }
      $scope.generateXAndY(nums);
    }
    $scope.rows = n;
    $scope.cols = m;
  };
  $scope.generateRandom = function(){
    var nums;
    for (var i = 0; i < $scope.rows; i++) {
      nums = [];
      for (var j = 0; j < $scope.cols; j++) {
        nums.push(Math.floor((Math.random() * 100) + 1));
      }
      nums.push(nums[nums.length - 1] % 2);
      $scope.generateXAndY(nums);
    }
  };
  $scope.generateNumberMatrixFromFile = function(){
    var str = $scope.fileChoose;
    if (str) {
      $scope.splitFromStrToMatrix(str, '\r\n');
    } else {
      alert('Fayl tanlang');
    }
  };
  $scope.generateNumberMatrixFromInput = function(){
    var str = $scope.inputStr;
    if (str) {
      $scope.splitFromStrToMatrix(str, '\n');
    } else {
      alert('Son kiriting!');
    }
  };
  $scope.result = function() {
    alert('result');
  };
  $scope.generateNumbers = function() {
    $scope.clearData();
    if ($scope.dataFrom == 'file') {
      $scope.generateNumberMatrixFromFile();
    } else if ($scope.dataFrom == 'input') {
      $scope.generateNumberMatrixFromInput();
    } else if ($scope.dataFrom == 'random') {
      $scope.generateRandom(); 
    }
    var r = $scope.rows;
    var c = $scope.cols;
    console.log($scope.x);
  };
}]);
app.directive('fileread', [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind('change', function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.fileread = loadEvent.target.result;
                        //console.log (scope.fileread);
                    });
                }
                //reader.readAsDataURL(changeEvent.target.files[0]);
                reader.readAsText(changeEvent.target.files[0]);
            });
        }
    }
}]);
app.directive('t', function () {
  return {
    restrict: 'E',
   scope: {
      data: '=data'
    },
    templateUrl: 'directives/table.html'
    //template: '<h1>qqq</h1>'
  };
});

app.factory('neyronNetworkService', function () {
  var fac = {};
  fac.STATE = {EQUAL:'=', ADDITION:'+', SUBTRACTION:'-'};
  fac.CLASSES = {FIRSTCLASS:0, SECONDCLASS:1};
  fac.steps = 0;
  fac.checkResult = function (res) {
    var n = res.length;
    var check = false;
    for (var i = 0; i < n; i++) {
      var a = res[i];
      for (var j = i + 1; j < n; j++) {
        var b = res[j];
        var m = a.length;
        for (var k = 0; k < m; k++) {
          if (a[k] == b[k]) {
            check = true;
          } else {
            check = false;
            return check;
          }
        }
      }
    }
    return check;
  };
  fac.neyronProcess = function (xData, yData, wData, wxSums) {
    console.log ('log');
    var n = xData.length;
    var m = xData[0].length;
    var allW = [];
    var count = 0;
    var isFirst = true;
    var isFinishedOneIteration = false;
    var beginIndex;
    while (!fac.checkResult(wData)) {
    //for (var l = 0; l < 10; l++) {
      console.log ('log');
      wData = [];
      var arr = [];
      if (isFirst) {
        isFirst = false;
        beginIndex = 1;
        for (var i = 0; i < m; i++) {
          arr.push(0);
        }
        allW.push(arr);
        wData.push(arr);
      } else {
        arr = allW[allW.length - 1];
        beginIndex = 0;
      }
      
      console.log('wData: ' + wData);
      for (var i = beginIndex; i < n; i++) {
        var index = i - 1;
        var w;
        var x;
        if (isFinishedOneIteration) {
          x = xData[n - 1];
          w = arr;
          isFinishedOneIteration = false;
          index = 0;
        } else {
          w = wData[index];
          x = xData[index];
        }
        console.log('index: ' + index);
        
        console.log('x: ' + x);
        console.log('w: ' + w);
        arr = [];
        var cl = yData[index];
        var sum = 0;
        for (var k = 0; k < m; k++) {
          sum += x[k] * w[k];
        }
        wxSums.push(sum);
        var st = fac.getStateByClasses(sum, cl);
        for (var j = 0; j < m; j++) {
          var a;
          switch (st) {
            case fac.STATE.EQUAL: {
              a = w[j];
            } break;
            case fac.STATE.ADDITION: {
              a = w[j] + x[j];
            } break;
            case fac.STATE.SUBTRACTION: {
              a = w[j] - x[j];
            } break;
            default: {
              alert('Default');
            } break;
          }
          arr.push(a);
          console.log('a: ' + a);
        }
        wData.push(arr);
        allW.push(arr);
      }
      console.log(wData);
      count++;
      isFinishedOneIteration = true;
    }
    console.log(allW);
    console.log ('sums len: ' + wxSums.length);
    fac.steps = count;
    return allW;
  };
  fac.getStateByClasses = function(sum, yi) {
    var state;
    console.log('sum: ' + sum + ' ' + 'yi: ' + yi);
    if ((yi == fac.CLASSES.FIRSTCLASS && sum > 0) || (yi == fac.CLASSES.SECONDCLASS && sum < 0)) {
      state = fac.STATE.EQUAL;
    } else if (yi == fac.CLASSES.FIRSTCLASS && sum <= 0) {
      state = fac.STATE.ADDITION;
    } else if (yi == fac.CLASSES.SECONDCLASS && sum >= 0) {
      state = fac.STATE.SUBTRACTION;
    }
    return state;
  };
  return fac;
});