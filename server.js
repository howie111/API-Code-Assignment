var express = require('express')
var fs = require('fs');
var app = express();
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    // instead of simply sending some text, our response will be a rendering of an HTML page
    res.render('index');
})

//endpoints
app.get('/SearchFlights/:origin/:dest',(req,res)=>{
  
    var origin = req.params.origin;
    var dest = req.params.dest;

    function readFileToArr(filename){

        var flightProviderText = fs.readFileSync('./provider/'+ filename,"utf-8");
        var flightProviderArr = flightProviderText.split("\n");
        flightProviderArr.shift();

        return flightProviderArr;

    }

// LAS,6/23/2014 13:30:00,LAX,6/23/2014 14:40:00,$151.00
    function parseFormat(arr){
        var newArr = arr.map(item=>{
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

    //let test = parseFormat(flightProvide1Arr);
    
    function result(flightsArray){

        var parseFlightsArray = parseFormat(flightsArray);
        // only get the unique flight info    
        parseFlightsArray = [...new Set(parseFlightsArray)];
    
        var parseFlightsObjs = parseFlightsArray.map(item=>{
            return stringToObj(item)
        })

        var result = parseFlightsObjs.filter(obj=>{
            return obj.origin == origin && obj.destination == dest;
        });
  
        result.sort((a,b)=>{
            return a.price - b.price;
        })

        result.sort((a,b)=>{
            return new Date(a.departTime) - new Date(b.departTime);
        })

        return result;
    }

    var flightProvide1Arr = readFileToArr('provider1.txt')
    var flightProvide2Arr = readFileToArr('provider2.txt')
    var flightProvide3Arr = readFileToArr('provider3.txt')


    var flightProvide1result = result(flightProvide1Arr);
    var flightProvide2result =result(flightProvide2Arr);
    var flightProvide3result =result(flightProvide3Arr);

   res.render('result',{origin,dest,flightProvide1result,flightProvide2result,flightProvide3result});

})

app.all('*', function(req, res) {
    res.redirect("http://localhost:3000/SearchFlights/YYZ/YYC");
  });

//server port

app.listen(3000,()=>{
    console.log("server is running")
})