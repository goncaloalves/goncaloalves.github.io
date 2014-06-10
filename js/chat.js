/** Chat application
@param


 */
var connectedRef = new Firebase("https://goncaloalveschat.firebaseio.com/.info/connected");

connectedRef.on("value", function(snapshot){
	if(snapshot.val()===true){
		var commentsContainer=$('#comments-container');

		$('<div/>', {class: 'alert alert-success'})
		.html('Connected!').appendTo(commentsContainer);
	}
	/*
	else{
		alert('Not Connected');
	}
	*/
});

var disconnectedRef = new Firebase('https://goncaloalveschat.firebaseio.com/disconnectmessage');
var nick=$("#nick");
var nickValue=$.trim(nick.val());

disconnectedRef.onDisconnect().set({type: 'disconnect', timeStamp: Firebase.ServerValue.TIMESTAMP, nick: nickValue});

var fireBaseRef = new Firebase("https://goncaloalveschat.firebaseio.com/");

$("#submit-btn").bind("click", function(){
	var comment=$("#comments");
	var commentValue=$.trim(comment.val());

	var nick=$("#nick");
	var nickValue=$.trim(nick.val());

	if(commentValue.length===0){
		alert('Comments are required to continue!');
	} else{
		fireBaseRef.push({timeStamp: Firebase.ServerValue.TIMESTAMP,
						comment: commentValue,
						nick: nickValue}, function(error){
		if(error!=null){
			alert('Unable to push comments to Firebase!');
		}
	});	
		comment.val("");
	}
	
	return false;
});

fireBaseRef.on('child_added', function(snapshot){
	var uniqName=snapshot.name();
	var comment = snapshot.val().comment;
	var timeStamp= snapshot.val().timeStamp;
	var nick = snapshot.val().nick;

	var commentsContainer=$('#comments-container');

	if (snapshot.val().type=='disconnect'){
		console.log('Disconnect');
	}
	else{
		$('<div/>', {class: 'comment-container'})
			.html('<span class="label label-info">'+timeStampToString(timeStamp)+
				' ' + nick + '</span>' + comment).appendTo(commentsContainer);
	}
	
	commentsContainer.scrollTop(commentsContainer.prop('scrollHeight'));
});

fireBaseRef.on('child_changed', function(childSnapshot, prevChildName){
	var commentsContainer=$('#comments-container');

	if (childSnapshot.val().type=="disconnect"){
		var timeStamp= timeStampToString(childSnapshot.val().timeStamp);
		var nick = childSnapshot.val().nick;

		$('<div/>', {class: 'alert alert-warning'})
		.html(timeStamp + ' ' + nick + ' Disconnected!').appendTo(commentsContainer);
	}

	commentsContainer.scrollTop(commentsContainer.prop('scrollHeight'));
});

function timeStampToString(timeStamp){
	var date= new Date(timeStamp);
	
	var hours = date.getHours().toString(); if (hours.length===1) hours= '0' + hours;
	var minutes= date.getMinutes().toString(); if (minutes.length===1) minutes= '0' + minutes;
	var seconds= date.getSeconds().toString(); if (seconds.length===1) seconds= '0' + seconds;

	return hours+':'+minutes+':'+seconds;
}