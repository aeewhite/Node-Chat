var socket = io.connect();
var userColor;
var notify= new Audio('facebook pop.m4a');

function addMessage(msg, pseudo,color) {
	$("#chatEntries").append('<div class="message"><p><span style="color:'+color+'">' + pseudo + '</span> : ' + msg + '</p></div>');
	$("div.message").last().linkify();
	$("div.message").last().find("a.linkified").each(function( index ) {
		var url = $(this).attr('href');
		console.log(url);
		IsValidImageUrl(url, function(result){
			if(result){
				$("div.message").last().append('<div class="chatPicDiv"><img src="'+url+'" class="chatPic" ></div'); 
			}
		});
		if(parseUri(url).host=="www.youtube.com"){
			console.log("Added vid from youtube.com");
			$("div.message").last().append('<iframe width="640" height="360" src="//www.youtube.com/embed/' + getYouTubeId(url) + '" frameborder="0" allowfullscreen></iframe>');
		}
		if(parseUri(url).host=="youtu.be"){
			console.log("Added vid from youtu.be");
			$("div.message").last().append('<iframe width="640" height="360" src="//www.youtube.com/embed/' + url.slice(-11) + '" frameborder="0" allowfullscreen></iframe>');
		}
		
	});
	notify.play();
}
function sentMessage() {
	if ($('#messageInput').val() != "") 
	{
		socket.emit('message', $('#messageInput').val());
		addMessage($('#messageInput').val(), "Me", userColor);
		$('#messageInput').val('');
		$("#chatEntries").linkify();
		$("#chatEntries").stop().animate({scrollTop:$("#chatEntries")[0].scrollHeight}, 600);

	}
}
function setPseudo() {
	if ($("#pseudoInput").val() != "")
	{
		userColor='#'+Math.floor(Math.random()*16777215).toString(16);
		socket.emit('setPseudo', [$("#pseudoInput").val(),userColor]);
		$('.chat').show();
		$('#pseudoInput').hide();
		$('#pseudoSet').hide();
		$("header").hide();
		$('#messageInput').focus();
	}
}


function IsValidImageUrl(url, callback) {
	$("<img>", {
		src: url,
		error: function() { callback(false) },
		load: function() { callback(true) }
	});
}

function getYouTubeId(url) {
	var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
	var match = url.match(regExp);

	if (match && match[2].length == 11) {
		return match[2];
	} else {
		return 'error';
	}
}

socket.on('message', function(data) {
	addMessage(data['message'], data['pseudo'], data['color']);
	$("#chatEntries").linkify();
});

var currentlyConnected;

socket.on('sendAllUsers',function(allUsers){
	if(allUsers.length > 0){
		var users = "";
		for (var i = 0; i < allUsers.length; i++) {
			if(i==0){
				users+=" <span style='color:"+allUsers[i][1]+"'>"+allUsers[i][0]+"</span>";
			}
			else{
				users+=", <span style='color:"+allUsers[i][1]+"'>"+allUsers[i][0]+"</span>";
			}
		};
		$("#chatEntries").append('<div class="message"><p><span style="color:white">SERVER</span>: The Currently Connected Users Are: ' + users + '</p></div>');
	}
});

socket.on('disconnected', function (name,color){
	if(name){
		$("#chatEntries").append('<div class="message disconnect"><p>User <span style="color:'+color+'">' + name + '</span> has disconnected</p></div>');	
	}
})

socket.on('userConnected', function (name, color){
	$("#chatEntries").append('<div class="message connection"><p>User <span style="color:'+color+'">' + name + '</span> has connected</p></div>')
})

$(function() {
	$(".chat").hide();

	$("#pseudoSet").click(function() {setPseudo()});
	$('#pseudoInput').keypress(function(e) {
		if (e.which == 13) {
			setPseudo();
		}
	});

	$("#submit").click(function() {sentMessage();});
	$('#messageInput').keypress(function(e) {
		if (e.which == 13) {
			sentMessage();
		}
	});

	$("#pseudoInput").focus();
});






// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License

function parseUri (str) {
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};

parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};

// Enable or Disable the Video Chat
var videoChat=false;

if(videoChat==true){
	$("#video").show();
	var webRTC = new SimpleWebRTC({
		// the id/element dom element that will hold "our" video
	    localVideoEl: 'myVid',
	    // the id/element dom element that will hold remote videos
	    remoteVideosEl: 'remoteVideos',
	    // immediately ask for camera access
	    autoRequestMedia: true
	})

	webRTC.on('readyToCall', function () {
	    // you can name it anything
	    webRTC.joinRoom('videoCall');
	});
}