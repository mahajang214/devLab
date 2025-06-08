import { create } from 'zustand';
import { io } from 'socket.io-client';

// 👇 Create the socket instance (you can use env variable here)
const socket = io('http://localhost:3001');



const userStore = create((set,get) => ({
  username: "",
  userId: "",
  projectID:"",
  projectName:"",
  userPic:"",
  fileID:"",
  folderID:"",
 
  socket,

  setFolderID: (folderID) => set({ folderID }),
  setFileID:(fileID)=>set({fileID}),
  setUsername: (username) => set({ username }),
  setUserId: (userId) => set({ userId }),
  setProjectId: (projectID) => set({ projectID }),
  setProjectName: (projectName) => set({ projectName }),
  setUserPic:(userPic)=>set({userPic}),

    // Optional: update or reconnect socket (not usually needed)
    setSocket: (newSocket) => set({ socket: newSocket }),
}));

export default userStore;