const KEY = 'koren.parent-pin.v1'

export function readPin() {
  return localStorage.getItem(KEY)
}

export function clearPin() {
  localStorage.removeItem(KEY)
}

async function verifier(pin: string, salt: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({
    name: 'PBKDF2', hash: 'SHA-256', iterations: 600000, salt: new TextEncoder().encode(salt),
  }, key, 256)
  return Array.from(new Uint8Array(bits), byte => byte.toString(16).padStart(2, '0')).join('')
}

export async function checkPin(pin: string, create: boolean) {
  const record = readPin()
  if (record === null && !create) return false
  if (record !== null) {
    if (!/^[0-9a-f-]{36}:[0-9a-f]{64}$/.test(record)) throw Error('Invalid PIN record')
    const [salt, hash] = record.split(':')
    return await verifier(pin, salt!) === hash && readPin() === record
  }
  const salt = crypto.randomUUID()
  const hash = await verifier(pin, salt)
  const save = () => {
    if (readPin() !== null) return false
    localStorage.setItem(KEY, salt + ':' + hash)
    return true
  }
  return navigator.locks ? navigator.locks.request(KEY, save) : save()
}
