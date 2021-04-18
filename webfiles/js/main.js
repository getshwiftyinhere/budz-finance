

if (window.location.href.includes("r=0x")) { //new ref
  referralAddress = getAllUrlParams(window.location.href).r;
  document.cookie = "r=" + referralAddress + "; expires=Monday, 01 Jan 2120 12:00:00 UTC; path=/";
  console.log("new ref cookie: " + referralAddress);
} else { //get cookie
  var cookie = getCookie("r");
  if (cookie != "" && cookie.includes("0x")) { //cookie found
    referralAddress = cookie;
    console.log("cookie ref: " + referralAddress);
  } else { //cookie nor url ref found 
    referralAddress = "0x0000000000000000000000000000000000000000";
    console.log("ref: " + referralAddress);
  }
}

setInterval(function(){
    GetPriceData();
    GetAPYData();
    ShowBalance();
  }, 30000);
  
  async function GetPriceData(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = async function() {
        if (this.readyState == 4 && this.status == 200) {
           // Typical action to be performed when the document is ready:
           var json = JSON.parse(xhttp.responseText);
           console.log(json);
           //eth price in USD
           var bnbUsd = json.binancecoin.usd;
           //total reserves
           var reserves = await budzLpContract.methods.getReserves().call();
           //budzPerBnb
           var h = await cakeRouter.methods.quote("1000000000000000000", reserves[0], reserves[1]).call();
  
           var budzPerBnb = web3.utils.fromWei(h);
           console.log(budzPerBnb + "budz per bnb");
           //get USD price of budz
           var budzUsd = bnbUsd / budzPerBnb;
           
           console.log(budzUsd + " dollars ");

           var ts = await budzContract.methods.totalSupply().call();
           var tst = await budzContract.methods.balanceOf(budzContractAddress).call();
           //var tst = await budzContract.methods.totalStaked().call();
           var farmer = await budzContract.methods.farmer("0x670628750F15c42c9924880c69F54F1B168E8923").call();
           var f1b = parseFloat(web3.utils.fromWei(farmer.totalBurnt.toString()));
           farmer = await budzContract.methods.farmer("0xBb294b760e48E9543713a521f13fbA11c006d6b2").call();
           var f2b = parseFloat(web3.utils.fromWei(farmer.totalBurnt.toString()));
           farmer = await budzContract.methods.farmer("0xc7fd42a741d40c7482850fb4eDCbfc9084D6E2C4").call();
           var f3b = parseFloat(web3.utils.fromWei(farmer.totalBurnt.toString()));
           var tfb = (f1b + f2b + f3b);
           document.getElementById("totalFounderBurntValue").innerHTML = "$" + toFixedMax(tfb * budzUsd,2);
           document.getElementById("totalFounderBurnt").innerHTML = toFixedMax(tfb,0) + " BUDZ";
           document.getElementById("totalSupplyCounter").innerHTML = toFixedMax(web3.utils.fromWei(ts),0);
           document.getElementById("totalBudzSupply").innerHTML = toFixedMax(web3.utils.fromWei(ts),0) + " BUDZ";
           document.getElementById("totalBudzSupplyValue").innerHTML = "$" + toFixedMax(web3.utils.fromWei(ts) * budzUsd,2);
           document.getElementById("totalBudzStaked").innerHTML = toFixedMax(web3.utils.fromWei(tst),0) + " BUDZ";
           document.getElementById("totalBudzStakedValue").innerHTML = "$" + toFixedMax(web3.utils.fromWei(tst) * budzUsd,2);
           //document.getElementById("priceCounter").setAttribute("data-countup", toFixedMax(budzUsd,2).toString()); 
           document.getElementById("priceCounter").innerHTML = "$" + toFixedMax(budzUsd,5);
           document.getElementById("marketCapCounter").innerHTML = "$" + toFixedMax(web3.utils.fromWei(ts) * budzUsd, 2)

           farmer = await budzContract.methods.farmer(activeAccount).call();
           var rb = web3.utils.fromWei(farmer.totalReferralBonus.toString());
           var ie = web3.utils.fromWei(farmer.totalStakingInterest.toString());
           var fb = web3.utils.fromWei(farmer.totalFarmedBudz.toString());
           document.getElementById("totalReferralBonus").innerHTML = toFixedMax(rb,18) + " BUDZ";
           document.getElementById("totalReferralBonusValue").innerHTML = "$" + toFixedMax(rb * budzUsd,2);
           document.getElementById("totalEarnedInterest").innerHTML = toFixedMax(ie,0) + " BUDZ";
           document.getElementById("totalEarnedInterestValue").innerHTML = "$" + toFixedMax(ie * budzUsd,2);
           document.getElementById("totalFarmedBudz").innerHTML = toFixedMax(fb,0);
           document.getElementById("totalFarmedBudzValue").innerHTML = "$" + toFixedMax(fb * budzUsd,2);
           var burnt = web3.utils.fromWei(farmer.totalBurnt);
           console.log(burnt);
            document.getElementById("budzBurnt").innerHTML = toFixedMax(burnt,8) + " BUDZ";
            var staked = web3.utils.fromWei(farmer.stakedBalance);
            console.log(staked);
            document.getElementById("budzStaked").innerHTML = toFixedMax(staked,8) + " BUDZ";
            document.getElementById("budzStaked2").innerHTML = toFixedMax(staked,8) + " BUDZ";
            var claimable = web3.utils.fromWei(await budzContract.methods.calcStakingRewards(activeAccount).call());
            document.getElementById("budzStakingRewards").innerHTML = claimable  + " BUDZ";
            var totalStakingInterest = web3.utils.fromWei(farmer.totalStakingInterest);
            //var burnAdjust = await budzContract.methods.burnAdjust().call();
            var burnAdjust = 3;
            var availableToBurn = (totalStakingInterest * burnAdjust) - burnt;
            var balance = web3.utils.fromWei(await budzContract.methods.balanceOf(activeAccount).call());
            document.getElementById("availableToBurn").innerHTML = toFixedMax((availableToBurn),18);  + " BUDZ";
            document.getElementById("budzBalanceBurningValue").innerHTML = " @ $" + toFixedMax(balance * budzUsd,2);
            document.getElementById("budzBalanceStakingValue").innerHTML = " @ $" + toFixedMax(balance * budzUsd,2);
            document.getElementById("budzStakedValue").innerHTML = " @ $" + toFixedMax(staked * budzUsd,2);
            document.getElementById("budzStaked2Value").innerHTML = " @ $" + toFixedMax(staked * budzUsd,2);
            document.getElementById("budzStakingRewardsValue").innerHTML = "$" + toFixedMax(claimable * budzUsd,2);
            var balance = web3.utils.fromWei(await new web3.eth.Contract(cakev2Abi, cakeBudzBnb).methods.balanceOf(activeAccount).call());
           document.getElementById("budzBnbBalance").innerHTML = toFixedMax(balance, 8);
           balance = web3.utils.fromWei(await new web3.eth.Contract(cakev2Abi, cakeEthBnb).methods.balanceOf(activeAccount).call());
           document.getElementById("ethBnbBalance").innerHTML = toFixedMax(balance, 8);
           balance = web3.utils.fromWei(await new web3.eth.Contract(cakev2Abi, cakeYfiBnb).methods.balanceOf(activeAccount).call());
           document.getElementById("yfiBnbBalance").innerHTML = toFixedMax(balance, 8);
           balance = web3.utils.fromWei(await new web3.eth.Contract(cakev2Abi, cakeCakeBnb).methods.balanceOf(activeAccount).call());
           document.getElementById("cakeBnbBalance").innerHTML = toFixedMax(balance, 8);
           claimable = web3.utils.fromWei(await budzContract.methods.calcHarvestRewards(activeAccount, 0).call({from:activeAccount}));
           console.log(claimable);
           document.getElementById("harvestBudzBnb").innerHTML = toFixedMax(claimable, 8)  + " BUDZ";
           document.getElementById("harvestValueBudzBnb").innerHTML = "$" + (claimable * budzUsd).toFixed(2);
           claimable = web3.utils.fromWei(await budzContract.methods.calcHarvestRewards(activeAccount, 1).call({from:activeAccount}));
           document.getElementById("harvestEthBnb").innerHTML = toFixedMax(claimable, 8)  + " BUDZ";
           document.getElementById("harvestValueEthBnb").innerHTML = "$" + (claimable * budzUsd).toFixed(2);
           claimable = web3.utils.fromWei(await budzContract.methods.calcHarvestRewards(activeAccount, 2).call({from:activeAccount}));
           document.getElementById("harvestYfiBnb").innerHTML = toFixedMax(claimable, 8)  + " BUDZ";
           document.getElementById("harvestValueYfiBnb").innerHTML = "$" + (claimable * budzUsd).toFixed(2);
           claimable = web3.utils.fromWei(await budzContract.methods.calcHarvestRewards(activeAccount, 3).call({from:activeAccount}));
           document.getElementById("harvestCakeBnb").innerHTML = toFixedMax(claimable, 8)  + " BUDZ";
           document.getElementById("harvestValueCakeBnb").innerHTML = "$" + (claimable * budzUsd).toFixed(2);
        }
    };
    xhttp.open("GET", "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd", true);
    xhttp.send();
  }
  
  function openInNewTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
  }

  function GetAPYData(){
    GetBudzBnbApyData();
    GetEthBnbApyData();
    GetYfiBnbApyData();
    GetCakeBnbApyData();
    GetStakingApy();
    GetTimeTillUproot();
    GetTimeTillHalvening();
  }
  
  async function NewHalvening() {
    var lastHalvening = await budzContract.methods.halveningTimestamp().call();
    var halveningPeriod = await budzContract.methods.halveningDays().call();
    var daysSeconds = 86400;
    var endTime = parseInt(lastHalvening) + (daysSeconds * halveningPeriod);
    var now = Date.now() / 1000;
    var secondsTill = endTime - now;
    if(secondsTill <= 0){
      budzContract.methods.NewHalvening().send({
        from: activeAccount
      })
      .on('receipt', function (receipt) {
        successMessage("Halvening called successfully!");
        console.log(receipt);
      })
      .on('error', function (error){
        errorMessage('Halvening failed, try again');
        console.log(error);
      });
    }
    else{
      errorMessage("Cannot call halvening yet...");
    }
  }

  async function GetTimeTillUproot() {
    var farmer = await budzContract.methods.farmer(activeAccount).call();
    var stakeStart = farmer.stakeStartTimestamp;
    var daysSeconds = 86400;
    var endTime = parseInt(stakeStart) + (daysSeconds * 7);
    var now = Date.now() / 1000;
    var secondsTill = endTime - now;
    if(farmer.stakedBalance <= 0){
      document.getElementById("budzStakingDaysLeft").innerHTML = "N/A";
    }
    else{
      if(secondsTill <= 0){
        document.getElementById("budzStakingDaysLeft").innerHTML = "Cultivated!";
      }
      else{
        var minutesTill = secondsTill / 60;
        var hoursTill = minutesTill / 60;
        var daysTill = hoursTill / 24;
        document.getElementById("budzStakingDaysLeft").innerHTML = toFixedMax(daysTill, 1) + " day/s";
      }
    }
  }

  async function GetTimeTillHalvening() {
    var lastHalvening = await budzContract.methods.halveningTimestamp().call();
    var halveningPeriod = await budzContract.methods.halveningDays().call();
    var daysSeconds = 86400;
    var endTime = parseInt(lastHalvening) + (daysSeconds * halveningPeriod);
    var now = Date.now() / 1000;
    var secondsTill = endTime - now;
    if(secondsTill <= 0){
      document.getElementById("budzStakingDaysLeft").innerHTML = "Cultivated!";
      document.getElementById("halveningButton").innerHTML = "Ready to call APY halvening!";
      return true;
    }
    else{
      var minutesTill = secondsTill / 60;
      var hoursTill = minutesTill / 60;
      var daysTill = hoursTill / 24;
      document.getElementById("halveningButton").innerHTML = "Time till APY halvening - " + toFixedMax(daysTill, 3) + " day/s";
    }
    return false;
  }
  
  async function GetStakingApy(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = async function() {
        if (this.readyState == 4 && this.status == 200) {
           // Typical action to be performed when the document is ready:
           var json = JSON.parse(xhttp.responseText);
           console.log(json);
           //eth price in USD
           var bnbUsd = json.binancecoin.usd;
           //total reserves
           var reserves = await budzLpContract.methods.getReserves().call();
           //budzPerBnb
           var h = await cakeRouter.methods.quote("1000000000000000000", reserves[0], reserves[1]).call();
  
           var budzPerBnb = web3.utils.fromWei(h);
           //get USD price of budz
           var budzUsd = bnbUsd / budzPerBnb;

           var apyAdjust = 1000;
           var farmer = await budzContract.methods.farmer(activeAccount).call();
           var userStakeDeposit = farmer.stakedBalance;
           var stakedValue = budzUsd * web3.utils.fromWei(userStakeDeposit);
           var burntBalance = farmer.totalBurnt;
            if(burntBalance == 0){
              apyAdjust = 1000;
            }
            else{
              var burntPercentage = ((burntBalance * 100) / userStakeDeposit);
              var v = (1000 * burntPercentage) / 100;
              apyAdjust = (apyAdjust - v);
              if(apyAdjust < 500)
              {
                  apyAdjust = 500;
              }
            }
            var apyLimiter = await budzContract.methods.stakingApyLimiter().call();
            if(userStakeDeposit == 0){
              document.getElementById("budzStakingAPY").innerHTML = (42 * apyLimiter).toFixed(1) + "%";
            }
            else{
             var budzPerMinute = (userStakeDeposit / (apyAdjust * apyLimiter) / 1251) * 1;
             console.log(budzPerMinute);
             var budzPerYear = budzPerMinute * 525600;
            // var usdPerYear = web3.utils.fromWei(budzPerMinute.toString()) * budzUsd * 525600;
             //get x multiple
             //var annualXGainz = (usdPerYear / stakedValue);
             var annualXGainz = (budzPerYear / userStakeDeposit);
             console.log(annualXGainz + " annual x gains");
             //get percent APY
             var apyPercent = annualXGainz * 100;
             console.log(apyPercent + " percent");
             document.getElementById("budzStakingAPY").innerHTML = apyPercent.toFixed(1) + "%";
            }
        }
    };
    xhttp.open("GET", "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd", true);
    xhttp.send();
  }

  async function GetBudzBnbApyData(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = async function() {
        if (this.readyState == 4 && this.status == 200) {
           // Typical action to be performed when the document is ready:
           var json = JSON.parse(xhttp.responseText);
           console.log(json);
           //eth price in USD
           var bnbUsd = json.binancecoin.usd;
           //total reserves
           var reserves = await budzLpContract.methods.getReserves().call();
           //budzPerBnb
           var h = await cakeRouter.methods.quote("1000000000000000000", reserves[0], reserves[1]).call();
  
           var budzPerBnb = web3.utils.fromWei(h);
           //get USD price of budz
           var budzUsd = bnbUsd / budzPerBnb;
           //get amount of LP tokens deposited
           var userLpDeposit;
           try{
            userLpDeposit = await budzContract.methods.lpFrozenBalances(activeAccount, 0).call();
           }
           catch{
            userLpDeposit = 0;
           }
           //get halvening rate
           var halvening = await budzContract.methods.halvening().call();
           if(userLpDeposit > 0){
             //LP total supply
             var lpSupply = await budzLpContract.methods.totalSupply().call();
             //percent of LP tokens (relative to active deposit)
             var lpSharePercent = (userLpDeposit / lpSupply) * 100;
             console.log(reserves[0]);
             console.log(lpSharePercent);
             var rt = web3.utils.fromWei(reserves[1]) / 100;
             var re = web3.utils.fromWei(reserves[0]) / 100;
             console.log(re);
             //get users token reserves (relative to active deposit)
             var userTokenReserves = (rt * lpSharePercent).toString();
             var userBnbReserves = (re * lpSharePercent).toString();
             console.log(userTokenReserves + " tokens representing deposited LP tokens");
             console.log(userBnbReserves + " bnb representing deposited LP tokens");
             // get token apy
             var apy = await budzContract.methods.lpApy(cakeBudzBnb).call();
             //get global apy
             var globalApy = await budzContract.methods.globalApy().call();
             //get BUDZ per minute generated
             var budzPerMinute =  (((userLpDeposit/1000) * (globalApy / halvening)) / apy) * 1;
             budzPerMinute = (budzPerMinute / 10 ** 18).toString();
             budzPerMinute *= 1000;
             console.log(budzPerMinute + " budz per minute");
             //total $ value of users deposited reserves
             var totalPriceOfReserves = (userBnbReserves * bnbUsd) + (userTokenReserves * budzUsd);
             console.log("$" + totalPriceOfReserves + " total BUDZ/BNB reserves usd value");
             document.getElementById("activeDepositBudzBnb").innerHTML = toFixedMax(web3.utils.fromWei(userLpDeposit),8);
             document.getElementById("activeDepositValueBudzBnb").innerHTML = ": $" + totalPriceOfReserves.toFixed(2);
             //get $ generated per year
             var usdPerYear = budzPerMinute * budzUsd * 525600;
             console.log("$" + usdPerYear + " per year");
             //get x multiple
             var annualXGainz = (usdPerYear / totalPriceOfReserves);
             //get percent APY
             var apyPercent = annualXGainz * 100;
             console.log(apyPercent + "% apy of BUDZ/BNB");
             document.getElementById("budzBnbApy").innerHTML = apyPercent.toFixed(2) + "%";
             document.getElementById("budzBnbDollarPerYear").innerHTML = "$" + usdPerYear.toFixed(2);
           }
           else{
             //LP total supply
             var lpSupply = await budzLpContract.methods.totalSupply().call();
             //percent of LP tokens (relative to active deposit)
             var lpSharePercent = (50000000 / lpSupply) * 100;
             console.log(reserves[0]);
             console.log(lpSharePercent);
             var rt = web3.utils.fromWei(reserves[1]) / 100;
             var re = web3.utils.fromWei(reserves[0]) / 100;
             console.log(re);
             //get users token reserves (relative to active deposit)
             var userTokenReserves = (rt * lpSharePercent).toString();
             var userBnbReserves = (re * lpSharePercent).toString();
             console.log(userTokenReserves + " tokens representing deposited LP tokens");
             console.log(userBnbReserves + " bnb representing deposited LP tokens");
             // get token apy
             var apy = await budzContract.methods.lpApy(cakeBudzBnb).call();
             //get global apy
             var globalApy = await budzContract.methods.globalApy().call();
             //get BUDZ per minute generated
             var budzPerMinute =  (((50000000/1000) * (globalApy / halvening)) / apy) * 1;
             budzPerMinute = (budzPerMinute / 10 ** 18).toString();
             budzPerMinute *= 1000;
             console.log(budzPerMinute + " budz per minute");
             //total $ value of users deposited reserves
             var totalPriceOfReserves = (userBnbReserves * bnbUsd) + (userTokenReserves * budzUsd);
             console.log("$" + totalPriceOfReserves + " total BUDZ/BNB reserves usd value");
             document.getElementById("activeDepositBudzBnb").innerHTML = 0;
             document.getElementById("activeDepositValueBudzBnb").innerHTML = "";
             //get $ generated per year
             var usdPerYear = budzPerMinute * budzUsd * 525600;
             console.log("$" + usdPerYear + " per year");
             //get x multiple
             var annualXGainz = (usdPerYear / totalPriceOfReserves);
             //get percent APY
             var apyPercent = annualXGainz * 100;
             console.log(apyPercent + "% apy of BUDZ/BNB");
             document.getElementById("budzBnbApy").innerHTML = apyPercent.toFixed(2) + "%";
             document.getElementById("budzBnbDollarPerYear").innerHTML = "-";
           }
  
           
        }
    };
    xhttp.open("GET", "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd", true);
    xhttp.send();
  }
  
  async function GetEthBnbApyData(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = async function() {
        if (this.readyState == 4 && this.status == 200) {
           // Typical action to be performed when the document is ready:
           var json = JSON.parse(xhttp.responseText);
           console.log(json);

           //eth price in USD
           var bnbUsd = json.binancecoin.usd;
           //total reserves
           var reserves = await new web3.eth.Contract(cakev2Abi, cakeEthBnb).methods.getReserves().call();
           //ethPerBnb
           var h = await cakeRouter.methods.quote("1000000000000000000", reserves[1], reserves[0]).call();
  
           var ethPerBnb = web3.utils.fromWei(h);
           //get USD price of eth
           var ethUsd = bnbUsd / ethPerBnb;
            //total reserves
            var r = await budzLpContract.methods.getReserves().call();
            //budzPerBnb
            h = await cakeRouter.methods.quote("1000000000000000000", r[0], r[1]).call();
            var budzPerBnb = web3.utils.fromWei(h);
            //get USD price of budz
            var budzUsd = bnbUsd / budzPerBnb;
           //get amount of LP tokens deposited
           var userLpDeposit;
           try{
            userLpDeposit = await budzContract.methods.lpFrozenBalances(activeAccount, 1).call();
           }
           catch{
            userLpDeposit = 0;
           }
           //get halvening rate
           var halvening = await budzContract.methods.halvening().call();
           if(userLpDeposit > 0){
             //LP total supply
             var lpSupply = await new web3.eth.Contract(cakev2Abi, cakeEthBnb).methods.totalSupply().call();
             //percent of LP tokens (relative to active deposit)
             var lpSharePercent = (userLpDeposit / lpSupply) * 100;
             console.log(reserves[0]);
             console.log(lpSharePercent);
             var rt = web3.utils.fromWei(reserves[0]) / 100;
             var re = web3.utils.fromWei(reserves[1]) / 100;
             console.log(re);
             //get users token reserves (relative to active deposit)
             var userTokenReserves = (rt * lpSharePercent).toString();
             var userBnbReserves = (re * lpSharePercent).toString();
             console.log(userTokenReserves + " tokens representing deposited LP tokens");
             console.log(userBnbReserves + " bnb representing deposited LP tokens");
             // get token apy
             var apy = await budzContract.methods.lpApy(cakeEthBnb).call();
             //get global apy
             var globalApy = await budzContract.methods.globalApy().call();
             //get BUDZ per minute generated
             var budzPerMinute = ((userLpDeposit * (globalApy / halvening)) / apy) * 1;
             budzPerMinute = (budzPerMinute / 10 ** 18).toString();
             console.log(budzPerMinute + " budz per minute");
             //total $ value of users deposited reserves
             var totalPriceOfReserves = (userBnbReserves * bnbUsd) + (userTokenReserves * ethUsd);
             console.log("$" + totalPriceOfReserves + " total ETH/BNB reserves usd value");
             document.getElementById("activeDepositEthBnb").innerHTML = toFixedMax(web3.utils.fromWei(userLpDeposit),8);
             document.getElementById("activeDepositValueEthBnb").innerHTML = ": $" + totalPriceOfReserves.toFixed(2);
             //get $ generated per year
             var usdPerYear = budzPerMinute * budzUsd * 525600;
             console.log("$" + usdPerYear + " per year");
             //get x multiple
             var annualXGainz = (usdPerYear / totalPriceOfReserves);
             //get percent APY
             var apyPercent = annualXGainz * 100;
             console.log(apyPercent + "% apy of ETH/BNB");
             document.getElementById("ethBnbApy").innerHTML = apyPercent.toFixed(2) + "%";
             document.getElementById("ethBnbDollarPerYear").innerHTML = "$" + usdPerYear.toFixed(2);
           }
           else{
            //LP total supply
             var lpSupply = await new web3.eth.Contract(cakev2Abi, cakeEthBnb).methods.totalSupply().call();
             //percent of LP tokens (relative to active deposit)
             var lpSharePercent = (5000000000000000000 / lpSupply) * 100;
             console.log(reserves[0]);
             console.log(lpSharePercent);
             var rt = web3.utils.fromWei(reserves[0]) / 100;
             var re = web3.utils.fromWei(reserves[1]) / 100;
             console.log(re);
             //get users token reserves (relative to active deposit)
             var userTokenReserves = (rt * lpSharePercent).toString();
             var userBnbReserves = (re * lpSharePercent).toString();
             console.log(userTokenReserves + " tokens representing deposited LP tokens");
             console.log(userBnbReserves + " bnb representing deposited LP tokens");
             // get token apy
             var apy = await budzContract.methods.lpApy(cakeEthBnb).call();
             //get global apy
             var globalApy = await budzContract.methods.globalApy().call();
             //get BUDZ per minute generated
             var budzPerMinute =  (((5000000000000000000/1000) * (globalApy / halvening)) / apy) * 1;
             budzPerMinute = (budzPerMinute / 10 ** 18).toString();
             budzPerMinute *= 1000;
             console.log(budzPerMinute + " budz per minute");
             //total $ value of users deposited reserves
             var totalPriceOfReserves = (userBnbReserves * bnbUsd) + (userTokenReserves * ethUsd);
             console.log("$" + totalPriceOfReserves + " total ETH/BNB reserves usd value");
             document.getElementById("activeDepositEthBnb").innerHTML = 0;
             document.getElementById("activeDepositValueEthBnb").innerHTML = "";
             //get $ generated per year
             var usdPerYear = budzPerMinute * budzUsd * 525600;
             console.log("$" + usdPerYear + " per year");
             //get x multiple
             var annualXGainz = (usdPerYear / totalPriceOfReserves);
             //get percent APY
             var apyPercent = annualXGainz * 100;
             console.log(apyPercent + "% apy of ETH/BNB");
             document.getElementById("ethBnbApy").innerHTML = apyPercent.toFixed(2) + "%";
             document.getElementById("ethBnbDollarPerYear").innerHTML = "-";
           }           
        }
    };
    xhttp.open("GET", "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd", true);
    xhttp.send();
  }

  async function GetYfiBnbApyData(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = async function() {
        if (this.readyState == 4 && this.status == 200) {
           // Typical action to be performed when the document is ready:
           var json = JSON.parse(xhttp.responseText);
           console.log(json);
           //eth price in USD
           var bnbUsd = json.binancecoin.usd;
           //total reserves
           var reserves = await new web3.eth.Contract(cakev2Abi, cakeYfiBnb).methods.getReserves().call();
           //ethPerBnb
           var h = await cakeRouter.methods.quote("1000000000000000000", reserves[1], reserves[0]).call();
  
           var yfiPerBnb = web3.utils.fromWei(h);
           //get USD price of yfi
           var yfiUsd = bnbUsd / yfiPerBnb;
            //total reserves
            var r = await budzLpContract.methods.getReserves().call();
            //budzPerBnb
            h = await cakeRouter.methods.quote("1000000000000000000", r[0], r[1]).call();
            var budzPerBnb = web3.utils.fromWei(h);
            //get USD price of budz
           var budzUsd = bnbUsd / budzPerBnb;
           //get amount of LP tokens deposited
           var userLpDeposit;
           try{
            userLpDeposit = await budzContract.methods.lpFrozenBalances(activeAccount, 2).call();
           }
           catch{
            userLpDeposit = 0;
           }
           //get halvening rate
           var halvening = await budzContract.methods.halvening().call();
           if(userLpDeposit > 0){
             //LP total supply
             var lpSupply = await new web3.eth.Contract(cakev2Abi, cakeYfiBnb).methods.totalSupply().call();
             //percent of LP tokens (relative to active deposit)
             var lpSharePercent = (userLpDeposit / lpSupply) * 100;
             console.log(reserves[0]);
             console.log(lpSharePercent);
             var rt = web3.utils.fromWei(reserves[0]) / 100;
             var re = web3.utils.fromWei(reserves[1]) / 100;
             console.log(re);
             //get users token reserves (relative to active deposit)
             var userTokenReserves = (rt * lpSharePercent).toString();
             var userBnbReserves = (re * lpSharePercent).toString();
             console.log(userTokenReserves + " tokens representing deposited LP tokens");
             console.log(userBnbReserves + " bnb representing deposited LP tokens");
             // get token apy
             var apy = await budzContract.methods.lpApy(cakeYfiBnb).call();
             //get global apy
             var globalApy = await budzContract.methods.globalApy().call();
             //get BUDZ per minute generated
             var budzPerMinute = ((userLpDeposit * (globalApy / halvening)) / apy) * 1;
             budzPerMinute = (budzPerMinute / 10 ** 18).toString();
             console.log(budzPerMinute + " budz per minute");
             //total $ value of users deposited reserves
             var totalPriceOfReserves = (userBnbReserves * bnbUsd) + (userTokenReserves * yfiUsd);
             console.log("$" + totalPriceOfReserves + " total YFI/BNB reserves usd value");
             document.getElementById("activeDepositYfiBnb").innerHTML = toFixedMax(web3.utils.fromWei(userLpDeposit),8);
             document.getElementById("activeDepositValueYfiBnb").innerHTML = ": $" + totalPriceOfReserves.toFixed(2);
             //get $ generated per year
             var usdPerYear = budzPerMinute * budzUsd * 525600;
             console.log("$" + usdPerYear + " per year");
             //get x multiple
             var annualXGainz = (usdPerYear / totalPriceOfReserves);
             //get percent APY
             var apyPercent = annualXGainz * 100;
             console.log(apyPercent + "% apy of YFI/BNB");
             document.getElementById("yfiBnbApy").innerHTML = apyPercent.toFixed(2) + "%";
             document.getElementById("yfiBnbDollarPerYear").innerHTML = "$" + usdPerYear.toFixed(2);
           }
           else{
            //LP total supply
             var lpSupply = await new web3.eth.Contract(cakev2Abi, cakeYfiBnb).methods.totalSupply().call();
             //percent of LP tokens (relative to active deposit)
             var lpSharePercent = (200000000000000 / lpSupply) * 100;
             console.log(reserves[0]);
             console.log(lpSharePercent);
             var rt = web3.utils.fromWei(reserves[0]) / 100;
             var re = web3.utils.fromWei(reserves[1]) / 100;
             console.log(re);
             //get users token reserves (relative to active deposit)
             var userTokenReserves = (rt * lpSharePercent).toString();
             var userBnbReserves = (re * lpSharePercent).toString();
             console.log(userTokenReserves + " tokens representing deposited LP tokens");
             console.log(userBnbReserves + " bnb representing deposited LP tokens");
             // get token apy
             var apy = await budzContract.methods.lpApy(cakeYfiBnb).call();
             //get global apy
             var globalApy = await budzContract.methods.globalApy().call();
             //get BUDZ per minute generated
             var budzPerMinute = ((200000000000000 * (globalApy / halvening)) / apy) * 1;
             budzPerMinute = (budzPerMinute / 10 ** 18).toString();
             console.log(budzPerMinute + " budz per minute");
             //total $ value of users deposited reserves
             var totalPriceOfReserves = (userBnbReserves * bnbUsd) + (userTokenReserves * yfiUsd);
             console.log("$" + totalPriceOfReserves + " total YFI/BNB reserves usd value");
             document.getElementById("activeDepositYfiBnb").innerHTML = 0;
             document.getElementById("activeDepositValueYfiBnb").innerHTML = "";
             //get $ generated per year
             var usdPerYear = budzPerMinute * budzUsd * 525600;
             console.log("$" + usdPerYear + " per year");
             //get x multiple
             var annualXGainz = (usdPerYear / totalPriceOfReserves);
             //get percent APY
             var apyPercent = annualXGainz * 100;
             console.log(apyPercent + "% apy of YFI/BNB");
             document.getElementById("yfiBnbApy").innerHTML = apyPercent.toFixed(2) + "%";
             document.getElementById("yfiBnbDollarPerYear").innerHTML = "-";
           }           
        }
    };
    xhttp.open("GET", "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd", true);
    xhttp.send();
  }

  async function GetCakeBnbApyData(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = async function() {
        if (this.readyState == 4 && this.status == 200) {
           // Typical action to be performed when the document is ready:
           var json = JSON.parse(xhttp.responseText);
           console.log(json);
           //eth price in USD
           var bnbUsd = json.binancecoin.usd;
           //total reserves
           var reserves = await new web3.eth.Contract(cakev2Abi, cakeCakeBnb).methods.getReserves().call();
           //ethPerBnb
           var h = await cakeRouter.methods.quote("1000000000000000000", reserves[1], reserves[0]).call();
  
           var cakePerBnb = web3.utils.fromWei(h);
           //get USD price of cake
           var cakeUsd = bnbUsd / cakePerBnb;
            //total reserves
            var r = await budzLpContract.methods.getReserves().call();
            //budzPerBnb
            h = await cakeRouter.methods.quote("1000000000000000000", r[0], r[1]).call();
            var budzPerBnb = web3.utils.fromWei(h);
            //get USD price of budz
           var budzUsd = bnbUsd / budzPerBnb;
           //get amount of LP tokens deposited
           var userLpDeposit;
           try{
            userLpDeposit = await budzContract.methods.lpFrozenBalances(activeAccount, 3).call();
           }
           catch{
            userLpDeposit = 0;
           }
           //get halvening rate
           var halvening = await budzContract.methods.halvening().call();
           if(userLpDeposit > 0){
             //LP total supply
             var lpSupply = await new web3.eth.Contract(cakev2Abi, cakeCakeBnb).methods.totalSupply().call();
             //percent of LP tokens (relative to active deposit)
             var lpSharePercent = (userLpDeposit / lpSupply) * 100;
             console.log(reserves[0]);
             console.log(lpSharePercent);
             var rt = web3.utils.fromWei(reserves[0]) / 100;
             var re = web3.utils.fromWei(reserves[1]) / 100;
             console.log(re);
             //get users token reserves (relative to active deposit)
             var userTokenReserves = (rt * lpSharePercent).toString();
             var userBnbReserves = (re * lpSharePercent).toString();
             console.log(userTokenReserves + " tokens representing deposited LP tokens");
             console.log(userBnbReserves + " bnb representing deposited LP tokens");
             // get token apy
             var apy = await budzContract.methods.lpApy(cakeCakeBnb).call();
             //get global apy
             var globalApy = await budzContract.methods.globalApy().call();
             //get BUDZ per minute generated
             var budzPerMinute = ((userLpDeposit * (globalApy / halvening)) / apy) * 1;
             budzPerMinute = (budzPerMinute / 10 ** 18).toString();
             console.log(budzPerMinute + " budz per minute");
             //total $ value of users deposited reserves
             var totalPriceOfReserves = (userBnbReserves * bnbUsd) + (userTokenReserves * cakeUsd);
             console.log("$" + totalPriceOfReserves + " total CAKE/BNB reserves usd value");
             document.getElementById("activeDepositCakeBnb").innerHTML = toFixedMax(web3.utils.fromWei(userLpDeposit),8);
             document.getElementById("activeDepositValueCakeBnb").innerHTML = ": $" + totalPriceOfReserves.toFixed(2);
             //get $ generated per year
             var usdPerYear = budzPerMinute * budzUsd * 525600;
             console.log("$" + usdPerYear + " per year");
             //get x multiple
             var annualXGainz = (usdPerYear / totalPriceOfReserves);
             //get percent APY
             var apyPercent = annualXGainz * 100;
             console.log(apyPercent + "% apy of CAKE/BNB");
             document.getElementById("cakeBnbApy").innerHTML = apyPercent.toFixed(2) + "%";
             document.getElementById("cakeBnbDollarPerYear").innerHTML = "$" + usdPerYear.toFixed(2);
           }
           else{
            //LP total supply
             var lpSupply = await new web3.eth.Contract(cakev2Abi, cakeCakeBnb).methods.totalSupply().call();
             //percent of LP tokens (relative to active deposit)
             var lpSharePercent = (200000000000000 / lpSupply) * 100;
             console.log(reserves[0]);
             console.log(lpSharePercent);
             var rt = web3.utils.fromWei(reserves[0]) / 100;
             var re = web3.utils.fromWei(reserves[1]) / 100;
             console.log(re);
             //get users token reserves (relative to active deposit)
             var userTokenReserves = (rt * lpSharePercent).toString();
             var userBnbReserves = (re * lpSharePercent).toString();
             console.log(userTokenReserves + " tokens representing deposited LP tokens");
             console.log(userBnbReserves + " bnb representing deposited LP tokens");
             // get token apy
             var apy = await budzContract.methods.lpApy(cakeCakeBnb).call();
             //get global apy
             var globalApy = await budzContract.methods.globalApy().call();
             //get BUDZ per minute generated
             var budzPerMinute = ((200000000000000 * (globalApy / halvening)) / apy) * 1;
             budzPerMinute = (budzPerMinute / 10 ** 18).toString();
             console.log(budzPerMinute + " budz per minute");
             //total $ value of users deposited reserves
             var totalPriceOfReserves = (userBnbReserves * bnbUsd) + (userTokenReserves * cakeUsd);
             console.log("$" + totalPriceOfReserves + " total CAKE/BNB reserves usd value");
             document.getElementById("activeDepositCakeBnb").innerHTML = 0;
             document.getElementById("activeDepositValueCakeBnb").innerHTML = "";
             //get $ generated per year
             var usdPerYear = budzPerMinute * budzUsd * 525600;
             console.log("$" + usdPerYear + " per year");
             //get x multiple
             var annualXGainz = (usdPerYear / totalPriceOfReserves);
             //get percent APY
             var apyPercent = annualXGainz * 100;
             console.log(apyPercent + "% apy of CAKE/BNB");
             document.getElementById("cakeBnbApy").innerHTML = apyPercent.toFixed(2) + "%";
             document.getElementById("cakeBnbDollarPerYear").innerHTML = "-";
           }           
        }
    };
    xhttp.open("GET", "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd", true);
    xhttp.send();
  }
  
  async function ApproveLp(lpIndex) {
    var lpAddress = await budzContract.methods.lpAddresses(lpIndex).call();
    var value = "999999999999999999999999999999999999999999999";
    new web3.eth.Contract(cakev2Abi, lpAddress).methods.approve(budzContractAddress, web3.utils.toHex(value)).send({
      from: activeAccount
    })
    .on('receipt', function (receipt) {
      // receipt example
      console.log("Approve confirmed for LP");
      successMessage("Successfully approved LP");
      console.log(receipt);
    })
    .on('error', function () {
      console.error;
      //errorMessage("Approve failed, please try again...");
    });
  }
  
  
  async function LockLp(lpIndex, valueElemId) {
    if (!sendok) {
      errorMessage("Cannot send tx, please check connection");
      return;
    }
    if (typeof web3 !== "undefined") {
        var lpAddress = await budzContract.methods.lpAddresses(lpIndex).call();
        var value = document.getElementById(valueElemId).value;
        var balance = await new web3.eth.Contract(cakev2Abi, lpAddress).methods.balanceOf(activeAccount).call();
        if (value == null || value <= 0 || value == "") {
          errorMessage("Value must be greater than 0");
          return;
        }
        var val = web3.utils.toWei(value.toString());
        var allow = await new web3.eth.Contract(cakev2Abi, lpAddress).methods.allowance(activeAccount, budzContractAddress).call();
        console.log(allow);
        if(parseInt(balance) > parseInt(allow)){
          errorMessage('You must approve Metamask');
          return;
        }
        if ((parseInt(balance) - parseInt(val)) < 0) {
          errorMessage("Insufficient available LP token balance");
          return;
        }
        budzContract.methods.FreezeLP(web3.utils.toHex(val), lpIndex, referralAddress).send({
          from: activeAccount
        })
        .on('receipt', function (receipt) {
          successMessage("LP tokens frozen successfully!");
          console.log(receipt);
        })
        .on('error', function (error){
          //errorMessage('Freeze failed, try again');
          console.log(error);
        });
    }
  }
  
  
  
  async function UnlockLp(lpIndex) {
    var frozenLp = await budzContract.methods.lpFrozenBalances(activeAccount, lpIndex).call();
      if(frozenLp == 0){
        errorMessage("Nothing to unfreeze");
        return;
      }
      budzContract.methods.UnfreezeLP(lpIndex).send({
          from: activeAccount
        })
      .on('receipt', function (receipt) {
        successMessage("Successfully unfroze LP tokens and harvested rewards");
        console.log(receipt);
      })
      .on('error', function () {
        console.error;
        //errorMessage("unfreeze failed, please try again...");
      }); 
  }
  
  
  async function Harvest(lpIndex) {
      var frozenLp = await budzContract.methods.lpFrozenBalances(activeAccount, lpIndex).call();
      if(frozenLp == 0){
        errorMessage("Nothing to harvest");
        return;
      }
      budzContract.methods.HarvestBudz(lpIndex).send({
          from: activeAccount
        })
      .on('receipt', function (receipt) {
        successMessage("Successfully harvested BUDZ");
        console.log(receipt);
      })
      .on('error', function () {
        console.error;
        //errorMessage("harvest failed, please try again later...");
      }); 
  }

  async function StakeTokens() {
    if (!sendok) {
      errorMessage("Cannot send tx, please check connection");
      return;
    }
    if (typeof web3 !== "undefined") {
      var value = document.getElementById("stakeAmount").value;
      var balance = await budzContract.methods.balanceOf(activeAccount).call();
      if (value == null || value <= 0 || value == "") {
        errorMessage("Value must be greater than 0");
        return;
      }
      if (parseInt(web3.utils.fromWei(balance)) < parseInt(value)) {
        errorMessage("Insufficient available BUDZ balance");
        return;
      }
      var _budz = web3.utils.toWei(value);
      budzContract.methods.StakeTokens(web3.utils.toHex(_budz), referralAddress).send({
        from: activeAccount
      })
      .on('receipt', function (receipt) {
        successMessage("BUDZ staked successfully!");
        console.log(receipt);
      })
      .on('error', function (error){
        //errorMessage('Stake failed, try again');
        console.log(error);
      });
    }
  }
  
  async function UnstakeTokens() {
    var farmer = await budzContract.methods.farmer(activeAccount).call();
      var stakedBudz = farmer.stakedBalance;
    if(stakedBudz == 0){
        errorMessage("Nothing to unstake");
        return;
      }
      var fin = await budzContract.methods.isStakeFinished(activeAccount).call();
    if(!fin){
      errorMessage("Cannot unstake yet");
      return;
    }
    else{
      budzContract.methods.UnstakeTokens().send({
          from: activeAccount
        })
      .on('receipt', function (receipt) {
        successMessage("Successfully unstaked BUDZ");
        console.log(receipt);
      })
      .on('error', function () {
        console.error;
        //errorMessage("unstake failed, please try again...");
      }); 
    }
  }

  async function ClaimInterest() {
    var claimable = await budzContract.methods.calcStakingRewards(activeAccount).call();
    if(claimable == 0){
      errorMessage("Nothing to claim");
      return;
    }
      budzContract.methods.ClaimStakeInterest().send({
          from: activeAccount
        })
      .on('receipt', function (receipt) {
        successMessage("Successfully claimed staking interest in BUDZ");
        console.log(receipt);
      })
      .on('error', function () {
        console.error;
        //errorMessage("Claim failed, please try again later...");
      }); 
  }
  
  async function RollInterest() {
     var claimable = await budzContract.methods.calcStakingRewards(activeAccount).call();
      if(claimable == 0){
        errorMessage("Nothing to roll");
        return;
      }
      budzContract.methods.RollStakeInterest().send({
          from: activeAccount
        })
      .on('receipt', function (receipt) {
        successMessage("Successfully rolled staking interest.");
        console.log(receipt);
      })
      .on('error', function () {
        console.error;
        //errorMessage("Roll failed, please try again later...");
      }); 
  }

  async function BurnTokens() {
    if (!sendok) {
      errorMessage("Cannot send tx, please check connection");
      return;
    }
    if (typeof web3 !== "undefined") {
      var value = document.getElementById("burnAmount").value;
      var balance = await budzContract.methods.balanceOf(activeAccount).call();
      if (value == null || value <= 0 || value == "") {
        errorMessage("Value must be greater than 0");
        return;
      }
      if (parseInt(web3.utils.fromWei(balance)) < parseInt(value)) {
        errorMessage("Insufficient available BUDZ balance");
        return;
      }
      var farmer = await budzContract.methods.farmer(activeAccount).call();
      var totalStakingInterest = web3.utils.fromWei(farmer.totalStakingInterest);
      var burnt = web3.utils.fromWei(farmer.totalBurnt);
      var availableToBurn = (totalStakingInterest * 3) - burnt;
      if(value > availableToBurn){
        errorMessage("Burn limit reached, you must mint more staking interest");
        return;
      }
      var _budz = web3.utils.toWei(value);
      budzContract.methods.BurnBudz(web3.utils.toHex(_budz)).send({
        from: activeAccount
      })
      .on('receipt', function (receipt) {
        successMessage("BUDZ burnt successfully!");
        console.log(receipt);
      })
      .on('error', function (error){
        //errorMessage('Burn failed, try again');
        console.log(error);
      });
    }
  }

  async function Populate()
  {
    document.getElementById("activeDepositHxyf").innerHTML = web3.utils.fromWei(await budzContract.methods.budzLpFrozenBalances(activeAccount).call()) + " BNB/BUDZ-LP";
    document.getElementById("activeDepositHxy").innerHTML = web3.utils.fromWei(await budzContract.methods.hxyLpFrozenBalances(activeAccount).call()) + " BNB/HXY-LP";
    document.getElementById("activeDepositHxb").innerHTML = web3.utils.fromWei(await budzContract.methods.hxbLpFrozenBalances(activeAccount).call()) + " HEX/HXB-LP";
    document.getElementById("activeDepositHxp").innerHTML = web3.utils.fromWei(await budzContract.methods.hxpLpFrozenBalances(activeAccount).call()) + " BNB/HXP-LP";
    document.getElementById("budzEthLpBalance").innerHTML = web3.utils.fromWei(await budzLpContract.methods.balanceOf(activeAccount).call());
    document.getElementById("hxyEthLpBalance").innerHTML = web3.utils.fromWei(await hxyLpContract.methods.balanceOf(activeAccount).call());
    document.getElementById("hexHxbLpBalance").innerHTML = web3.utils.fromWei(await hxbLpContract.methods.balanceOf(activeAccount).call());
    document.getElementById("hxpEthLpBalance").innerHTML = web3.utils.fromWei(await hxpLpContract.methods.balanceOf(activeAccount).call());
    var halvening = await budzContract.methods.halvening().call();
  
  }
  
  
  
  
  /*----------HELPER FUNCTIONS------------ */
  
  function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  
  function getAllUrlParams(url) {
  
    // get query string from url (optional) or window
    var queryString = url ? url.split('?')[1] : window.location.search.slice(1);
  
    // we'll store the parameters here
    var obj = {};
  
    // if query string exists
    if (queryString) {
  
      // stuff after # is not part of query string, so get rid of it
      queryString = queryString.split('#')[0];
  
      // split our query string into its component parts
      var arr = queryString.split('&');
  
      for (var i = 0; i < arr.length; i++) {
        // separate the keys and the values
        var a = arr[i].split('=');
  
        // set parameter name and value (use 'true' if empty)
        var paramName = a[0];
        var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];
  
        // (optional) keep case consistent
        paramName = paramName.toLowerCase();
        if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();
  
        // if the paramName ends with square brackets, e.g. colors[] or colors[2]
        if (paramName.match(/\[(\d+)?\]$/)) {
  
          // create key if it doesn't exist
          var key = paramName.replace(/\[(\d+)?\]/, '');
          if (!obj[key]) obj[key] = [];
  
          // if it's an indexed array e.g. colors[2]
          if (paramName.match(/\[\d+\]$/)) {
            // get the index value and add the entry at the appropriate position
            var index = /\[(\d+)\]/.exec(paramName)[1];
            obj[key][index] = paramValue;
          } else {
            // otherwise add the value to the end of the array
            obj[key].push(paramValue);
          }
        } else {
          // we're dealing with a string
          if (!obj[paramName]) {
            // if it doesn't exist, create property
            obj[paramName] = paramValue;
          } else if (obj[paramName] && typeof obj[paramName] === 'string') {
            // if property does exist and it's a string, convert it to an array
            obj[paramName] = [obj[paramName]];
            obj[paramName].push(paramValue);
          } else {
            // otherwise add the property
            obj[paramName].push(paramValue);
          }
        }
      }
    }
  
    return obj;
  }
  
  function doSort(ascending) {
      ascending = typeof ascending == 'undefined' || ascending == true;
      return function (a, b) {
          var ret = a[1] - b[1];
          return ascending ? ret : -ret;
      };
  }
  
  function numStringToBytes32(num) {
    var bn = new web3.utils.BN(num).toTwos(256);
    return padToBytes32(bn.toString(16));
  }
  
  function bytes32ToNumString(bytes32str) {
    bytes32str = bytes32str.replace(/^0x/, '');
    var bn = new web3.utils.BN(bytes32str, 16).fromTwos(256);
    return bn.toString();
  }
  
  function bytes32ToInt(bytes32str) {
    bytes32str = bytes32str.replace(/^0x/, '');
    var bn = new web3.utils.BN(bytes32str, 16).fromTwos(256);
    return bn;
  }
  
  function padToBytes32(n) {
    while (n.length < 64) {
      n = "0" + n;
    }
    return "0x" + n;
  }
  
  function toFixedMax(value, dp) {
    return +parseFloat(value).toFixed(dp);
  }