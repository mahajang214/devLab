import { create } from 'zustand';

const userStore = create((set,get) => ({
  username: "",
  userId: "",
  setUsername: (username) => set({ username }),
  setUserId: (userId) => set({ userId }),
}));

export default userStore;