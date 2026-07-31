import "dotenv/config.js";
export const config = {
    topDir: "",
    ref: "main",
    refreshTokenExpire: 15 * 24 * 60 * 60 * 1000,
    refreshTokenExpireMin: 7 * 24 * 60 * 60 * 1000,
    accessTokenExpire: 3 * 60 * 60 * 1000,
    page: {
        pageSize: 10,
        page: 1,
    },
    r2: {
        accountId: process.env.ACCOUNTID ?? "",
        accessKeyId: process.env.ACCESS_KEY_ID ?? "",
        bucket: "images",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
        endpoint: `https://${process.env.ACCOUNTID}.r2.cloudflarestorage.com`,
        domain: `${process.env.ACCOUNTID}.r2.cloudflarestorage.com`,
        maxFileSize: 10 * 1024 * 1024,
        image: "images",
        thumbnail: "thumbnails",
        thumbnailType: "webp",
    },
};
