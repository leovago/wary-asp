$( document ).ready(function() {
  /*global io*/
  var socket = io();
  
  socket.on('user count', function(data){
    console.log(data);
  });
  
  socket.on('user', function(data){
    console.log(data);
    $('#num-users').text(data.currentUsers+' users online');
    let status = '';
    (data.connected) ? status = 'joined' : status = 'left';
    let message = `${data.name} has ${status} the chat`;
    
    $('#messages').append($('<li>').html('<b>'+ message +'<\/b>'));
  });
  
  socket.on('chat message', function(message){
    $('#messages').append($('<li>').html('<b>'+ message.name + ': ' + message.message +'<\/b>'));
  });
  
  
  // Form submittion with new message in field with id 'm'
  $('form').submit(function(){
    var messageToSend = $('#m').val();
    //send message to server here?
    socket.emit('chat message', messageToSend);
    $('#m').val('');
    return false; // prevent form submit from refreshing page
  });
  
  
  
});
