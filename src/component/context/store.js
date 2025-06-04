import { create } from 'zustand';

const userStore = create((set,get) => ({
  username: "",
  userId: "",
  projectID:"",
  projectName:"",
  userPic:"",
  fileID:"",
  folderID:"",
  setFolderID: (folderID) => set({ folderID }),
  setFileID:(fileID)=>set({fileID}),
  setUsername: (username) => set({ username }),
  setUserId: (userId) => set({ userId }),
  setProjectId: (projectID) => set({ projectID }),
  setProjectName: (projectName) => set({ projectName }),
  setUserPic:(userPic)=>set({userPic})
}));

export default userStore;