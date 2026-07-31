// src/utils/lruCache.ts
import { LRUCache } from "lru-cache"
import type {
  ArticlesSelect,
  CategoriesSelect,
  ImagesCategoriesSelect,
  ImagesSelect,
} from "../db/schema.js"

export function createLRU<K extends {}, V extends {}>(options: LRUCache.Options<K, V, unknown>) {
  return new LRUCache<K, V>(options)
}

type DbResultType<T> = {
  list: T[]
  total: number
}
// 实例化，尖括号泛型风格
export const imagesCache = createLRU<string, DbResultType<ImagesSelect>>({
  max: 100,
  ttl: 1000 * 60 * 5,
  updateAgeOnGet: true,
})

export const imageCache = createLRU<number, ImagesSelect>({
  max: 100,
  ttl: 1000 * 60 * 5,
  updateAgeOnGet: true,
})

export const imagesCategoriesCache = createLRU<string, DbResultType<ImagesCategoriesSelect>>({
  max: 100,
  ttl: 1000 * 60 * 5,
  updateAgeOnGet: true,
})

export const articlesCache = createLRU<string, DbResultType<ArticlesSelect>>({
  max: 100,
  ttl: 1000 * 60 * 5,
  updateAgeOnGet: true,
})

export const articleCache = createLRU<number, ArticlesSelect>({
  max: 100,
  ttl: 1000 * 60 * 5,
  updateAgeOnGet: true,
})

export const articlesCategoriesCache = createLRU<string, DbResultType<CategoriesSelect>>({
  max: 100,
  ttl: 1000 * 60 * 5,
  updateAgeOnGet: true,
})
