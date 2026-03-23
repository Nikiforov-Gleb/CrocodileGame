export const UserData = {
  nickname: localStorage.getItem("nickname") || "",
  setNickname(name: string) {
    this.nickname = name;
    localStorage.setItem("nickname", name);
  },
};
