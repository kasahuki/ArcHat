// This file uses Vite's import.meta.glob feature to dynamically import all images
// from the specified directory. This means you can add or remove images from


const emojiModules = import.meta.glob('@/assets/image/emojiSets/贴吧表情/*.png', { eager: true });

export const customEmojis = Object.entries(emojiModules).map(([path, module]) => {
  // Extract the file name from the path (e.g., '滑稽.png')
  const fileName = path.split('/').pop();
  
  // Get the name of the emoji by removing the file extension (e.g., '滑稽')
  const name = fileName.replace('.png', '');

  return {
    name: name,
    src: module.default, // The actual image URL resolved by Vite
  };
});
