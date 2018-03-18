let express = require('express')
let fs = require('fs');
let app = express();
app.set('view engine', 'ejs');

function readFileToArr(filename){
    let flightProviderText = fs.readFileSync('./provider/'+ filename,"utf-8");
    let flightProviderArr = flightProviderText.split("\n");
    flightProviderArr.shift();
    return flightProviderArr;
}
// LAS,6/23/2014 13:30:00,LAX,6/23/2014 14:40:00,$151.00
function parseFormat(arr){
    let newArr = arr.map(item=>{
        return item.replace(/-/g,'/').replace(/\|/g,',')
    });

    return newArr;
}

function stringToObj(str){
    let flightArr = str.split(',');
    let flightObj ={};
    flightObj['origin'] = flightArr[0];
    flightObj['departTime']  = flightArr[1];
    flightObj['destination'] = flightArr[2];
    flightObj['destTime'] = flightArr[3];
    flightObj['price'] = flightArr[4];
    return flightObj;
}

function sortByPrice(result){
    return result.sort((a,b)=>{
        return a.price - b.price;
    })
}

function sortByDate(result){
    return result.sort((a,b)=>{
        return new Date(a.departTime) - new Date(b.departTime);
    })
}

function result(flightsArray,origin,dest){

    let parseFlightsArray = parseFormat(flightsArray);
    // only get the unique flight info    
    parseFlightsArray = [...new Set(parseFlightsArray)];

    let parseFlightsObjs = parseFlightsArray.map(item=>{
        return stringToObj(item)
    })

    let result = parseFlightsObjs.filter(obj=>{
        return obj.origin == origin && obj.destination == dest;
    });

    result = sortByPrice(result);
    result = sortByDate(result);

    return result;
}

//endpoints
app.get('/SearchFlights/:origin/:dest',(req,res)=>{
  
    let origin = req.params.origin;
    let dest = req.params.dest;
    let flightProvide1Arr = readFileToArr('provider1.txt')
    let flightProvide2Arr = readFileToArr('provider2.txt')
    let flightProvide3Arr = readFileToArr('provider3.txt')

    let flightProvide1result = result(flightProvide1Arr,origin,dest);
    let flightProvide2result =result(flightProvide2Arr,origin,dest);
    let flightProvide3result =result(flightProvide3Arr,origin,dest);

   res.render('result',{origin,dest,flightProvide1result,flightProvide2result,flightProvide3result});

})

app.all('*', function(req, res) {
    res.redirect("http://localhost:3000/SearchFlights/YYZ/YYC");
  });

//server port

app.listen(3000,()=>{
    console.log("server is running")
})