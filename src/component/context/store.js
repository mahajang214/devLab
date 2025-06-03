import { create } from 'zustand';

const userStore = create((set,get) => ({
  username: "",
  userId: "",
  projectID:"",
  projectName:"",
  setUsername: (username) => set({ username }),
  setUserId: (userId) => set({ userId }),
  setProjectId: (projectID) => set({ projectID }),
  setProjectName: (projectName) => set({ projectName }),
  userPic:"",
  setUserPic:(userPic)=>set({userPic})
}));

export default userStore;