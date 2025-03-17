// const grpc = require('@grpc/grpc-js');
// const protoLoader = require('@grpc/proto-loader');
// const path = require('path');
// const { chatService } = require('./services/chatService');

// const PROTO_CHAT_PATH = path.resolve(__dirname, './proto/chat.proto');
// const packageChatDefinition = protoLoader.loadSync(PROTO_CHAT_PATH, {});
// const chatProto = grpc.loadPackageDefinition(packageChatDefinition).chat;

// const startGrpcServer = () => {
//   const server = new grpc.Server();
//   server.addService(chatProto.ChatService.service, chatService);

//   const PORT = '127.0.0.1:50051';
//   server.bindAsync(PORT, grpc.ServerCredentials.createInsecure(), (err) => {
//     if (err) {
//       console.error('Error starting gRPC server:', err);
//       return;
//     }
//     console.log(`gRPC Server running on ${PORT}`);
//   });
// };


// module.exports = startGrpcServer;
