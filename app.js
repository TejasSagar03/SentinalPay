var app = angular.module("loanApp", []);

app.controller("LoanController", function($scope, $timeout){

  $scope.step = 0;
  $scope.profile = {salary:50000, otherEmi:5000, credit:700};
  $scope.loan = {amount:1000000, rate:10, tenure:5};
  $scope.counter = {emi:0,interest:0};

  $scope.next = () => $scope.step = 1;

  /* EMI calculation */
  function emiCalc(P,r,y){
    var R=r/12/100;
    var N=y*12;
    return (P*R*Math.pow(1+R,N))/(Math.pow(1+R,N)-1);
  }

  $scope.liveEmi = function(){
    return Math.round(emiCalc($scope.loan.amount,$scope.loan.rate,$scope.loan.tenure));
  };

  /* sound */
  var tick = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3");
  $scope.playTick = function(){
    tick.currentTime = 0;
    tick.play();
  };

  /* presets */
  $scope.applyPreset = function(type){
    if(type==="middle"){
      $scope.profile={salary:50000, otherEmi:5000, credit:700};
    }
    if(type==="aggressive"){
      $scope.profile={salary:90000, otherEmi:20000, credit:650};
    }
    if(type==="safe"){
      $scope.profile={salary:120000, otherEmi:2000, credit:780};
    }
  };

  /* animated counter */
  function animate(key,value){
    $scope.counter[key]=0;
    var step=Math.ceil(value/30);
    var i=setInterval(()=>{
      $scope.$apply(()=>{
        $scope.counter[key]+=step;
        if($scope.counter[key]>=value){
          $scope.counter[key]=value;
          clearInterval(i);
        }
      });
    },20);
  }

  /* probability color */
  $scope.getProbClass = function(){
    if($scope.probability > 75) return "prob-high";
    if($scope.probability > 45) return "prob-mid";
    return "prob-low";
  };

  /* analyze */
  $scope.analyze=function(){
    $scope.step=2;

    $timeout(function(){

      var emi=$scope.liveEmi();
      var total=emi*$scope.loan.tenure*12;
      var interest=Math.round(total-$scope.loan.amount);
      var foir=Math.round(((emi+$scope.profile.otherEmi)/$scope.profile.salary)*100);

      var status="APPROVED",cls="approved";
      if(foir>60||$scope.profile.credit<600){status="REJECTED";cls="rejected";}
      else if(foir>45){status="CONDITIONAL";cls="conditional";}

      $scope.result={emi,interest,foir,status,statusClass:cls};
      $scope.probability=Math.max(5,100-foir);

      animate("emi",emi);
      animate("interest",interest);

      $scope.step=3;

    },1500);
  };

  /* drag */
  $scope.drag = function($event){
    var el = $event.target.closest(".result-card");
    el.style.left = $event.pageX - 100 + "px";
    el.style.top = $event.pageY - 50 + "px";
  };

  $scope.restart=()=> $scope.step=0;

});
