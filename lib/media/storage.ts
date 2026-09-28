// lib/media/storage.ts
import ImageKit from "imagekit"

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
})

export type StoredObject = {
    url: string
    key: string
    size: number
    width?: number
    height?: number
    thumbnailUrl?: string
}

export interface StorageAdapter {
    put(key: string, buffer: Buffer, contentType: string): Promise<StoredObject>
    delete(key: string): Promise<void>
    urlFor(key: string): string
}

const UPLOAD_FOLDER = "/blog"

function buildFileName(key: string) {
    const withoutFolder = key.replace(/^.*\//, "")
    return withoutFolder.replace(/[^a-zA-Z0-9._-]/g, "_")
}

function buildFolder(key: string) {
    const parts = key.split("/")
    parts.pop()
    return `${UPLOAD_FOLDER}/${parts.join("/")}`
}

export const imagekitStorage: StorageAdapter = {
    async put(key, buffer, _contentType) {
        const fileName = buildFileName(key)
        const folder = buildFolder(key)

        const result = await imagekit.upload({
            file: buffer,
            fileName,
            folder,
            useUniqueFileName: true,
            tags: ["blog-media"],
        })

        return {
            key: result.fileId,
            url: result.url,
            size: result.size ?? buffer.byteLength,
            width: result.width,
            height: result.height,
            thumbnailUrl: result.thumbnailUrl ?? undefined,
        }
    },

    async delete(key) {
        await imagekit.deleteFile(key)
    },

    urlFor(key) {
        return `${process.env.IMAGEKIT_URL_ENDPOINT}/${key}`
    },
}

export const storage: StorageAdapter = imagekitStorage