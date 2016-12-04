'use strict';
var socket = io('https://4113studio.com');
socket.on('notification', function (data) {
    console.log(data);
    // {
    //   sender: '-AXeEda4CL',  // linkedinId
    //   receiver: 'NiMjtTCXCQ', // linkedinId
    //   type: 'friendRequest'  // 'friendRequest', 'acceptRequest' or 'denyRequest'
    // }
    socket.emit('client notification', { my: 'data' });
});