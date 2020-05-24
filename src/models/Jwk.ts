export interface Jwk {
  alg: string;    // algorithm used
  kty: string;    // key type
  use: string;    // how to use (`sig` for signature)
  n: string;      // modulus for pem
  e: string;      // exponent for pem
  kid: string;    // id for key
  x5t: string;    // sha-1 thumbprint for x509 cert chain
  x5c: string[];  // x509 cert chain
}
