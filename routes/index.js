var express = require('express');
var router = express.Router();

var list = [];

// This function will remove the particular 
// connection object from the list

var removeFromList = function (id,callback) {
	for(var i =0 ;i < list.length ;i++){
		if(list[i].Cid === id){
			var data = list[i].status;
			list.splice(i,1);
			if(data === "Running")
				data="Ok";
			callback(data);
			return;
		}
	}
}

// This function will return the array of object  
// having current status of every connection id

var printServerStatus =function(callback) {
	var data = [];
	var d = new Date();
	var n = parseInt(d.getTime());
	var len = list.length;
	if(!list.length){
		callback("No Process In The Server");
		return;
	}
	for(var i=0;i<list.length;i++){
		var obj = {
			Cid : list[i].Cid,
			left_time : list[i].ed_time-n,
			st_time : list[i].st_time,
			ed_time : list[i].ed_time,
			status : list[i].status
		}
		data.push(obj);
		if(data.length === len){
			callback(data);
			return;
		}
	}
}

// This function change the status of the connection  
// which was requested to be killed.

var changeStatus = function(id,callback){
	var Oid = parseInt(id);
	for(var i=0;i<list.length;i++){
		if(list[i].Cid === Oid){
			if(list[i].status === "Running"){
				list[i].status = "Killed";
				callback("Status : Ok");
				return;
			}
		}
		else if(list[i].Cid !== Oid && i === list.length-1){
			callback("Not present at the server");
			return;
		}
	}
}

// This will check whether the particular connection 
// is present in the server list

var checkCid = function(id,callback){
	if(!list.length){
		callback("Not present");
		return;
	}
	for(var i =0 ;i < list.length ;i++){
		if(list[i].Cid === id){
			callback("present");
			return;
		}
		if(i === list.length-1){
			callback("Not present");
			return;
		}
	}
}

//-----------------------------------------
//------------Routes-----------------------
//-----------------------------------------


router.get('/api/request', function(req, res, next) {
	var id = parseInt(req.query.connId);
	var time = parseInt(req.query.timeout);
	checkCid(id,function(data){
		if(data === "Not present"){
			var d = new Date();
			var n = parseInt(d.getTime());
			var start_time = n;
			var end_time = n + time;
			var obj = {
				Cid : id,
				interval : time,
				st_time : start_time,
				ed_time : end_time,
				status : "Running"
			}
			list.push(obj);
			setTimeout(function(){
				removeFromList(id,function(data){
				//This will print ok when the request is completed
					console.log("status: " + data);
				//This will send response to the server
					res.send("status: " +data);
				});
			},time);
		}
		else if(data === "present"){
			res.send("Connection Id : "+id+" is already in use.");
		}
	});
});


router.get('/api/serverStatus',function(req, res, next) {
	printServerStatus(function(data){
		//this will print the server status at the terminal
			console.log(data);
		// this will send status to the server
			res.send(data);
	});
});


router.put('/api/kill/:id',function(req,res){
	var Cid = req.params.id;
	changeStatus(Cid,function(data){
		//here you can check the status of the id at the terminal 
		console.log(list);
		// this will send ok in response to the server
		res.send(data);
	});
});

module.exports = router;