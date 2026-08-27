export const getProfileImage = (seed: string) => {
  return "https://api.dicebear.com/9.x/glass/svg?scale=50&seed=" + seed;
};

export const getUserPlaceholderImage = (seed: string) => {
  return "https://api.dicebear.com/10.x/identicon/svg?seed=" + seed;
};
