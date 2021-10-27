const dotenv = require("dotenv");
dotenv.config();

const io = require("socket.io")(process.env.PORT || 8900, {
  cors: {
    origin: process.env.CLIENT_URL
  }
});
console.log("ws://localhost:8900");

let users = [];

const addUser = (userId, socketId) => {
  const exitUser = getUser(userId);
  if (exitUser) {
    users = users.filter((user) => user.userId !== userId);
    io.in(exitUser.socketId).disconnectSockets();
  }
  users.push({ userId, socketId });

  //   !users.some((user) => user.userId === userId) &&
  //     users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  //when ceonnect
  console.log("new user connected.");

  //take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
    console.log(users);
    console.log(`io.engine.clientsCount : ${io.engine.clientsCount}`);
  });

  //send and get message
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    io.to(user.socketId).emit("getMessage", {
      senderId,
      text
    });
  });

  //when disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});
