import type { Payload } from 'payload'

import { readFile } from 'node:fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import type { NextRESTClient } from '../__helpers/shared/NextRESTClient.js'

import { initPayloadInt } from '../__helpers/shared/initPayloadInt.js'

let payload: Payload
let restClient: NextRESTClient

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

describe('_Community Tests', () => {
  beforeAll(async () => {
    const initialized = await initPayloadInt(dirname)
    ;({ payload, restClient } = initialized)
  })

  afterAll(async () => {
    await payload?.destroy()
  })

  it.each([
    { filename: 'image.jpg', contentType: 'image/jpg' },
    { filename: 'image.svg', contentType: 'image/svg+xml' },
  ])('Test $filename', async ({ filename, contentType }) => {
    const fileBuffer = await readFile(path.resolve(dirname, `../uploads/${filename}`))

    const data = new FormData()
    data.append('file', new Blob([fileBuffer], { type: contentType }), filename)
    const newMedia: { doc: { url: string } } = await (
      await restClient.POST('/media', {
        body: data,
      })
    ).json()
    const response = await restClient.GET(newMedia.doc.url.replace('/api', '') as `/${string}`)
    expect(response.headers.get('content-type')).toEqual(contentType)
  })
})
