import { randomUUID, webcrypto } from 'node:crypto'
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const subtle = webcrypto.subtle
const DEFAULT_KDF_ITERATIONS = 600000
const TOKEN_REFRESH_SKEW_MS = 60_000

type TokenResponse = {
  access_token: string
  expires_in: number
  token_type: string
  refresh_token?: string
  scope?: string
}

type PreloginResponse = {
  kdf?: number
  kdfIterations?: number
}

type VaultwardenAuthSession = {
  accessToken: string
  tokenType: string
  refreshToken?: string
  expiresAt: number
  scope?: string
  vaultwardenUrl: string
  email: string
  deviceIdentifier: string
}

type PersistedVaultwardenAuth = {
  version: 1
  email: string
  vaultwardenUrl: string
  deviceIdentifier: string
  kdfIterations: number
  payload: {
    iv: string
    ciphertext: string
  }
}

type VaultwardenAuthConfig = {
  vaultwardenUrl: string
  email: string
  password: string
  storePath: string
}

type CryptoBuffer = ArrayBuffer | ArrayBufferView

const toArrayBuffer = (value: CryptoBuffer): ArrayBuffer => {
  if (value instanceof ArrayBuffer) {
    return value
  }

  return value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) as ArrayBuffer
}

const toBase64 = (value: CryptoBuffer) => Buffer.from(toArrayBuffer(value)).toString('base64')

const fromBase64 = (value: string) => {
  const view = Buffer.from(value, 'base64')
  return view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength) as ArrayBuffer
}

const normalizeVaultwardenUrl = (value: string) => value.replace(/\/+$/, '')

const resolveVaultwardenUrl = (value: string) => {
  const normalized = normalizeVaultwardenUrl(value)

  if (process.env.DOCKER_ENV === 'true') {
    return normalized.replace('http://localhost:8000', 'http://vaultwarden:80')
  }

  return normalized
}

const now = () => Date.now()

const isTokenExpired = (expiresAt: number) => expiresAt - TOKEN_REFRESH_SKEW_MS <= now()

const getRequiredEnv = (name: string) => {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Variable d'environnement manquante: ${name}`)
  }
  return value
}

const getConfig = (): VaultwardenAuthConfig => {
  const vaultwardenUrl = resolveVaultwardenUrl(getRequiredEnv('VAULTWARDEN_URL'))
  const email = getRequiredEnv('VAULTWARDEN_EMAIL')
  const password = getRequiredEnv('VAULTWARDEN_PASSWORD')
  const configuredPath = process.env.VAULTWARDEN_AUTH_STORE_PATH?.trim() || '.cache/vaultwarden-auth.json'

  return {
    vaultwardenUrl,
    email,
    password,
    storePath: resolve(process.cwd(), configuredPath),
  }
}

const deriveMasterKey = async (password: string, email: string, iterations: number): Promise<ArrayBuffer> => {
  const enc = new TextEncoder()
  const keyMaterial = await subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])

  const bits = await subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: enc.encode(email.toLowerCase()),
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  )

  return bits
}

const hashMasterPassword = async (masterKey: ArrayBuffer, password: string) => {
  const enc = new TextEncoder()
  const keyMaterial = await subtle.importKey('raw', masterKey, 'PBKDF2', false, ['deriveBits'])

  const bits = await subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: enc.encode(password),
      iterations: 1,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  )

  return toBase64(bits)
}

const encryptPayload = async (
  payload: Omit<VaultwardenAuthSession, 'email' | 'vaultwardenUrl' | 'deviceIdentifier'>,
  keyBytes: ArrayBuffer
) => {
  const iv = webcrypto.getRandomValues(new Uint8Array(12))
  const key = await subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['encrypt'])

  const plaintext = new TextEncoder().encode(JSON.stringify(payload))
  const ciphertext = await subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext)

  return {
    iv: toBase64(iv),
    ciphertext: toBase64(ciphertext),
  }
}

const decryptPayload = async (
  payload: PersistedVaultwardenAuth['payload'],
  keyBytes: ArrayBuffer
): Promise<Omit<VaultwardenAuthSession, 'email' | 'vaultwardenUrl' | 'deviceIdentifier'>> => {
  const key = await subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['decrypt'])
  const decrypted = await subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(payload.iv) },
    key,
    fromBase64(payload.ciphertext)
  )

  return JSON.parse(new TextDecoder().decode(decrypted)) as Omit<
    VaultwardenAuthSession,
    'email' | 'vaultwardenUrl' | 'deviceIdentifier'
  >
}

const readPersistedAuth = async (storePath: string): Promise<PersistedVaultwardenAuth | null> => {
  try {
    const raw = await readFile(storePath, 'utf8')
    return JSON.parse(raw) as PersistedVaultwardenAuth
  } catch {
    return null
  }
}

const writePersistedAuth = async (storePath: string, payload: PersistedVaultwardenAuth) => {
  await mkdir(dirname(storePath), { recursive: true })
  await writeFile(storePath, JSON.stringify(payload), 'utf8')
}

const prelogin = async (vaultwardenUrl: string, email: string): Promise<PreloginResponse> => {
  const response = await fetch(`${vaultwardenUrl}/api/accounts/prelogin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Échec prelogin Vaultwarden (${response.status}): ${body}`)
  }

  return (await response.json()) as PreloginResponse
}

const authenticateWithPassword = async (params: {
  vaultwardenUrl: string
  email: string
  masterPasswordHash: string
  deviceIdentifier: string
}): Promise<TokenResponse> => {
  const body = new URLSearchParams({
    grant_type: 'password',
    username: params.email,
    password: params.masterPasswordHash,
    scope: 'api offline_access',
    client_id: 'web',
    deviceType: '10',
    deviceIdentifier: params.deviceIdentifier,
    deviceName: 'agent-administratif',
  })

  const response = await fetch(`${params.vaultwardenUrl}/identity/connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' },
    body: body.toString(),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Échec login Vaultwarden (${response.status}): ${text}`)
  }

  return (await response.json()) as TokenResponse
}

const refreshTokenGrant = async (vaultwardenUrl: string, refreshToken: string): Promise<TokenResponse> => {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: 'web',
  })

  const response = await fetch(`${vaultwardenUrl}/identity/connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' },
    body: body.toString(),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Échec refresh Vaultwarden (${response.status}): ${text}`)
  }

  return (await response.json()) as TokenResponse
}

const tokenResponseToSession = (
  token: TokenResponse,
  authBase: Pick<VaultwardenAuthSession, 'vaultwardenUrl' | 'email' | 'deviceIdentifier'>
): VaultwardenAuthSession => ({
  accessToken: token.access_token,
  tokenType: token.token_type,
  refreshToken: token.refresh_token,
  scope: token.scope,
  expiresAt: now() + token.expires_in * 1000,
  ...authBase,
})

const persistSession = async (
  config: VaultwardenAuthConfig,
  session: VaultwardenAuthSession,
  kdfIterations: number
) => {
  const masterKey = await deriveMasterKey(config.password, config.email, kdfIterations)

  const encryptedPayload = await encryptPayload(
    {
      accessToken: session.accessToken,
      tokenType: session.tokenType,
      refreshToken: session.refreshToken,
      scope: session.scope,
      expiresAt: session.expiresAt,
    },
    masterKey
  )

  await writePersistedAuth(config.storePath, {
    version: 1,
    email: session.email,
    vaultwardenUrl: session.vaultwardenUrl,
    deviceIdentifier: session.deviceIdentifier,
    kdfIterations,
    payload: encryptedPayload,
  })
}

const loadSessionFromDisk = async (config: VaultwardenAuthConfig): Promise<VaultwardenAuthSession | null> => {
  const persisted = await readPersistedAuth(config.storePath)
  if (persisted?.version !== 1) {
    return null
  }

  if (persisted.email !== config.email || persisted.vaultwardenUrl !== config.vaultwardenUrl) {
    return null
  }

  const masterKey = await deriveMasterKey(config.password, config.email, persisted.kdfIterations)

  try {
    const payload = await decryptPayload(persisted.payload, masterKey)

    return {
      ...payload,
      email: persisted.email,
      vaultwardenUrl: persisted.vaultwardenUrl,
      deviceIdentifier: persisted.deviceIdentifier,
    }
  } catch {
    return null
  }
}

const loginAndPersist = async (config: VaultwardenAuthConfig, deviceIdentifier: string) => {
  const preloginResponse = await prelogin(config.vaultwardenUrl, config.email)
  const kdf = preloginResponse.kdf ?? 0
  const kdfIterations = preloginResponse.kdfIterations ?? DEFAULT_KDF_ITERATIONS

  if (kdf !== 0) {
    throw new Error(`KDF Vaultwarden non supporté: ${kdf}`)
  }

  const masterKey = await deriveMasterKey(config.password, config.email, kdfIterations)
  const masterPasswordHash = await hashMasterPassword(masterKey, config.password)
  const token = await authenticateWithPassword({
    vaultwardenUrl: config.vaultwardenUrl,
    email: config.email,
    masterPasswordHash,
    deviceIdentifier,
  })

  const session = tokenResponseToSession(token, {
    vaultwardenUrl: config.vaultwardenUrl,
    email: config.email,
    deviceIdentifier,
  })

  await persistSession(config, session, kdfIterations)
  return session
}

export const getVaultwardenAuth = async (): Promise<VaultwardenAuthSession> => {
  const config = getConfig()
  const diskSession = await loadSessionFromDisk(config)

  if (diskSession && !isTokenExpired(diskSession.expiresAt)) {
    return diskSession
  }

  if (diskSession?.refreshToken) {
    try {
      const refreshedToken = await refreshTokenGrant(config.vaultwardenUrl, diskSession.refreshToken)
      const refreshedSession = tokenResponseToSession(refreshedToken, {
        vaultwardenUrl: diskSession.vaultwardenUrl,
        email: diskSession.email,
        deviceIdentifier: diskSession.deviceIdentifier,
      })

      const persisted = await readPersistedAuth(config.storePath)
      const persistedIterations = persisted?.kdfIterations ?? DEFAULT_KDF_ITERATIONS

      await persistSession(config, refreshedSession, persistedIterations)
      return refreshedSession
    } catch {
      // fallback sur login complet
    }
  }

  const deviceIdentifier = diskSession?.deviceIdentifier ?? randomUUID()
  return loginAndPersist(config, deviceIdentifier)
}

export const getVaultwardenAccessToken = async () => {
  const auth = await getVaultwardenAuth()
  return `${auth.tokenType} ${auth.accessToken}`
}

export const clearVaultwardenAuth = async () => {
  const config = getConfig()
  try {
    await unlink(config.storePath)
  } catch {
    // ignore si absent
  }
}
