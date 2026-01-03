/**
 * Client-side video frame extractor
 * Extracts frames from a video URL and analyzes them for quality
 */

/**
 * Extract frames from a video at regular intervals
 * @param {string} videoUrl - URL of the video
 * @param {number} numFrames - Number of frames to extract (default 10)
 * @returns {Promise<Array<{dataUrl: string, timestamp: number, score: number}>>}
 */
export async function extractFrames(videoUrl, numFrames = 10) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.preload = 'auto';
    
    const frames = [];
    let duration = 0;
    
    video.onloadedmetadata = () => {
      duration = video.duration;
      console.log(`Video duration: ${duration}s, extracting ${numFrames} frames`);
      
      // Skip first and last 10% of video (usually lower quality)
      const startTime = duration * 0.1;
      const endTime = duration * 0.9;
      const interval = (endTime - startTime) / numFrames;
      
      extractNextFrame(0);
    };
    
    video.onerror = (e) => {
      console.error('Video load error:', e);
      reject(new Error('Failed to load video'));
    };
    
    const extractNextFrame = async (index) => {
      if (index >= numFrames) {
        // All frames extracted, score and sort them
        const scoredFrames = frames.map(f => ({
          ...f,
          score: calculateFrameScore(f.imageData)
        }));
        
        // Sort by score descending
        scoredFrames.sort((a, b) => b.score - a.score);
        
        // Clean up
        video.remove();
        
        resolve(scoredFrames);
        return;
      }
      
      const startTime = duration * 0.1;
      const endTime = duration * 0.9;
      const interval = (endTime - startTime) / numFrames;
      const targetTime = startTime + (index * interval);
      
      video.currentTime = targetTime;
    };
    
    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      frames.push({
        dataUrl,
        timestamp: video.currentTime,
        imageData,
        width: canvas.width,
        height: canvas.height
      });
      
      canvas.remove();
      
      // Extract next frame
      extractNextFrame(frames.length);
    };
    
    video.src = videoUrl;
    video.load();
  });
}

/**
 * Calculate a quality score for a frame based on sharpness and contrast
 * Higher score = better quality
 */
function calculateFrameScore(imageData) {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  
  let sharpnessScore = 0;
  let contrastScore = 0;
  let brightnessSum = 0;
  let pixelCount = 0;
  
  // Sample every 4th pixel for performance
  for (let y = 1; y < height - 1; y += 4) {
    for (let x = 1; x < width - 1; x += 4) {
      const idx = (y * width + x) * 4;
      
      // Calculate brightness (grayscale value)
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      brightnessSum += brightness;
      pixelCount++;
      
      // Calculate Laplacian for sharpness (edge detection)
      const idxUp = ((y - 1) * width + x) * 4;
      const idxDown = ((y + 1) * width + x) * 4;
      const idxLeft = (y * width + (x - 1)) * 4;
      const idxRight = (y * width + (x + 1)) * 4;
      
      const laplacian = Math.abs(
        4 * brightness -
        (data[idxUp] + data[idxUp + 1] + data[idxUp + 2]) / 3 -
        (data[idxDown] + data[idxDown + 1] + data[idxDown + 2]) / 3 -
        (data[idxLeft] + data[idxLeft + 1] + data[idxLeft + 2]) / 3 -
        (data[idxRight] + data[idxRight + 1] + data[idxRight + 2]) / 3
      );
      
      sharpnessScore += laplacian;
    }
  }
  
  // Normalize sharpness
  sharpnessScore = sharpnessScore / pixelCount;
  
  // Calculate contrast (standard deviation of brightness)
  const avgBrightness = brightnessSum / pixelCount;
  let varianceSum = 0;
  
  for (let y = 1; y < height - 1; y += 4) {
    for (let x = 1; x < width - 1; x += 4) {
      const idx = (y * width + x) * 4;
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      varianceSum += Math.pow(brightness - avgBrightness, 2);
    }
  }
  
  contrastScore = Math.sqrt(varianceSum / pixelCount);
  
  // Penalize very dark or very bright frames
  const brightnessPenalty = Math.abs(avgBrightness - 128) / 128;
  
  // Combine scores (weights can be adjusted)
  const finalScore = (sharpnessScore * 2) + (contrastScore * 1.5) - (brightnessPenalty * 20);
  
  return finalScore;
}

/**
 * Convert a data URL to a Blob for uploading
 */
export function dataUrlToBlob(dataUrl) {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)[1];
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Convert a data URL to a File for uploading
 */
export function dataUrlToFile(dataUrl, filename) {
  const blob = dataUrlToBlob(dataUrl);
  return new File([blob], filename, { type: blob.type });
}

