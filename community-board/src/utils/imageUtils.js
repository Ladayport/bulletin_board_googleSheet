import imageCompression from 'browser-image-compression';

export const compressImage = async (file) => {
    const options = {
        maxSizeMB: 0.8,          // 限制最大檔案大小 (0.8MB)
        maxWidthOrHeight: 720,   // 限制最大寬度或高度 (符合您的需求)
        useWebWorker: true,
        fileType: 'image/jpeg'   // 強制轉為 JPG
    };

    try {
        const compressedFile = await imageCompression(file, options);
        return compressedFile;
    } catch (error) {
        console.error("Compression error:", error);
        throw error;
    }
};

export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result); // 回傳包含 data:image/jpeg;base64,... 的字串
        reader.onerror = (error) => reject(error);
    });
};
