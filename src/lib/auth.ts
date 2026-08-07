const PASSWORD_ITERATIONS = 210_000;

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "رمز عبور باید حداقل ۸ کاراکتر باشد.";
  }

  if (password.length > 128) {
    return "رمز عبور نباید بیشتر از ۱۲۸ کاراکتر باشد.";
  }

  if (!/[a-z]/.test(password)) {
    return "رمز عبور باید حداقل یک حرف کوچک انگلیسی داشته باشد.";
  }

  if (!/[A-Z]/.test(password)) {
    return "رمز عبور باید حداقل یک حرف بزرگ انگلیسی داشته باشد.";
  }

  if (!/[0-9]/.test(password)) {
    return "رمز عبور باید حداقل یک عدد داشته باشد.";
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    return "رمز عبور باید حداقل یک نشانه مانند _ یا . یا @ داشته باشد.";
  }

  return null;
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations: PASSWORD_ITERATIONS,
    },
    passwordKey,
    256,
  );

  return [
    "pbkdf2_sha256",
    PASSWORD_ITERATIONS.toString(),
    bytesToBase64(salt),
    bytesToBase64(new Uint8Array(derivedBits)),
  ].join("$");
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const parts = storedHash.split("$");

  if (parts.length !== 4 || parts[0] !== "pbkdf2_sha256") {
    return false;
  }

  const iterations = Number(parts[1]);
  const salt = base64ToBytes(parts[2]);
  const expectedHash = base64ToBytes(parts[3]);

  if (!Number.isInteger(iterations) || iterations < 1) {
    return false;
  }

  const encoder = new TextEncoder();

  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations,
    },
    passwordKey,
    expectedHash.length * 8,
  );

  const actualHash = new Uint8Array(derivedBits);

  if (actualHash.length !== expectedHash.length) {
    return false;
  }

  let difference = 0;

  for (let index = 0; index < actualHash.length; index += 1) {
    difference |= actualHash[index] ^ expectedHash[index];
  }

  return difference === 0;
}