// src/utils/lruCache.ts
import { LRUCache } from "lru-cache";
export function createLRU(options) {
    return new LRUCache(options);
}
// 实例化，尖括号泛型风格
export const imagesCache = createLRU({
    max: 100,
    ttl: 1000 * 60 * 5,
    updateAgeOnGet: true,
});
export const imageCache = createLRU({
    max: 100,
    ttl: 1000 * 60 * 5,
    updateAgeOnGet: true,
});
export const imagesCategoriesCache = createLRU({
    max: 100,
    ttl: 1000 * 60 * 5,
    updateAgeOnGet: true,
});
export const articlesCache = createLRU({
    max: 100,
    ttl: 1000 * 60 * 5,
    updateAgeOnGet: true,
});
export const articleCache = createLRU({
    max: 100,
    ttl: 1000 * 60 * 5,
    updateAgeOnGet: true,
});
export const articlesCategoriesCache = createLRU({
    max: 100,
    ttl: 1000 * 60 * 5,
    updateAgeOnGet: true,
});
