$(document).ready(function(){
  const joinRoom = $('#joinRoom');
  const roomKeyIn = $('#roomKeyIn');
  const messageText = $('#messageText');
  const createRoom = $('#createRoom');

  function isValidKey(key){
    if(isNaN(key)) return false;
    if(key.toString().length != 8) return false;
    return true;
  }

  function displayMessage(message){
    messageText.text(message);
    messageText.addClass('fade');
    setTimeout(function(){
      messageText.removeClass('fade');
    }, 2000);
  }

  function checkKey(key){
    $.ajax('/validRoom', {
      type: 'GET',
      data: {key: key},
      success: function(data){
        if(data) joinRoomByKey(key);
        else displayMessage('Room Does Not Exist');
      }
    });
  }

  function joinRoomByKey(key){
    location.href = '/room?key=' + key;
  }

  joinRoom.click(() => {
    let roomKey = roomKeyIn.val();
    if(!isValidKey(roomKey)) displayMessage('Invalid Room Key');
    else checkKey(roomKey)
  });

  createRoom.click(() => {
    $.ajax('/createRoom', {
      type: 'GET',
      data: {},
      success: function(data){
        location.href = '/room?key=' + data;
      }
    });
  });
});
