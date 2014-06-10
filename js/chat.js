$(document).on('change', '.btn-file :file', function() {
  var input = $(this),
      numFiles = input.get(0).files ? input.get(0).files.length : 1,
      label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
  input.trigger('fileselect', [numFiles, label]);
});

$(document).ready( function() {
    $('.btn-file :file').on('fileselect', function(event, numFiles, label) {
        
        var input = $(this).parents('.input-group').find(':text'),
            log = numFiles > 1 ? numFiles + ' files selected' : label;
        
        if( input.length ) {
            input.val(log);
        } else {
            if( log ) alert(log);
        }
        
    });
});

/** Chat application **/

var fireBaseRef = new Firebase("https://goncaloalveschat.firebaseio.com/");
var connectedRef = new Firebase("https://goncaloalveschat.firebaseio.com/.info/connected");
var disconnectedRef = new Firebase('https://goncaloalveschat.firebaseio.com/disconnectmessage');

/** Avisar o utilizador quando está connectado **/


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

/** Avisar todos os utilizadores quando o cliente se desconectou **/

var nick=$("#nick");
var nickValue=$.trim(nick.val());

disconnectedRef.onDisconnect().set({type: 'disconnect', timeStamp: Firebase.ServerValue.TIMESTAMP, nick: nickValue});

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


/** Enviar mensagem para Firebase **/
$("#submit-btn").bind("click", function(){
	var comment=$("#comments");
	var commentValue=$.trim(comment.val());

	var nick=$("#nick");
	var nickValue=$.trim(nick.val());

	var imgFile=document.getElementById("imgFile").files[0];

	var reader = new FileReader();

	var imgURL;

	reader.onload = function(e) {
  		imgURL = reader.result;
  		fireBaseRef.push({timeStamp: Firebase.ServerValue.TIMESTAMP,
						comment: commentValue,
						nick: nickValue,
						img: imgURL}, function(error){
		if(error!=null){
			alert('Unable to push comments to Firebase!');
		}
		});
	}


	reader.readAsDataURL(imgFile);

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

/** Apresentar mensagem do Firebase **/
fireBaseRef.on('child_added', function(snapshot){
	var uniqName=snapshot.name();
	var comment = snapshot.val().comment;
	var timeStamp= snapshot.val().timeStamp;
	var nick = snapshot.val().nick;

	var commentsContainer=$('#comments-container');

	if (snapshot.val().type=='disconnect'){
		return;
	}
	else{
		$('<div/>', {class: 'comment-container'})
			.html('<span class="label label-info">'+timeStampToString(timeStamp)+
				' ' + nick + '</span>' + comment).appendTo(commentsContainer);
	}
	
	commentsContainer.scrollTop(commentsContainer.prop('scrollHeight'));
});


/** Função Auxiliar de conversão de timestamps UNIX para String
@param timeStamp Data em formato Unix (milisegundos)
@return (String) Data no formato HH:MM:SS
 **/
function timeStampToString(timeStamp){
	var date= new Date(timeStamp);
	
	var hours = date.getHours().toString(); if (hours.length===1) hours= '0' + hours;
	var minutes= date.getMinutes().toString(); if (minutes.length===1) minutes= '0' + minutes;
	var seconds= date.getSeconds().toString(); if (seconds.length===1) seconds= '0' + seconds;

	return hours+':'+minutes+':'+seconds;
}