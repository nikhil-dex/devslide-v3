import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const IPV4_BLOCKED_RANGES = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
];

function ipv4ToBigInt(address) {
  return address.split(".").reduce((value, octet) => (value << 8n) | BigInt(Number(octet)), 0n);
}

function ipv4InRange(address, network, prefix) {
  const shift = 32n - BigInt(prefix);
  return (ipv4ToBigInt(address) >> shift) === (ipv4ToBigInt(network) >> shift);
}

function expandIpv6(address) {
  let value = address.toLowerCase().split("%")[0];
  if (value.includes(".")) {
    const lastColon = value.lastIndexOf(":");
    const ipv4 = value.slice(lastColon + 1);
    if (isIP(ipv4) !== 4) return null;
    const octets = ipv4.split(".").map(Number);
    const high = ((octets[0] << 8) | octets[1]).toString(16);
    const low = ((octets[2] << 8) | octets[3]).toString(16);
    value = `${value.slice(0, lastColon + 1)}${high}:${low}`;
  }

  const halves = value.split("::");
  if (halves.length > 2) return null;
  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const missing = 8 - left.length - right.length;
  if ((halves.length === 1 && missing !== 0) || missing < 0) return null;
  const groups = [...left, ...Array(missing).fill("0"), ...right];
  if (groups.length !== 8 || groups.some((group) => !/^[0-9a-f]{1,4}$/.test(group))) return null;
  return groups.reduce((result, group) => (result << 16n) | BigInt(parseInt(group, 16)), 0n);
}

function ipv6InRange(value, network, prefix) {
  const shift = 128n - BigInt(prefix);
  return (value >> shift) === (network >> shift);
}

function ipv6Network(address) {
  return expandIpv6(address);
}

export function isPrivateOrReservedAddress(address) {
  const version = isIP(address);
  if (version === 4) {
    return IPV4_BLOCKED_RANGES.some(([network, prefix]) =>
      ipv4InRange(address, network, prefix)
    );
  }

  if (version !== 6) return true;

  const value = expandIpv6(address);
  if (value === null) return true;

  // IPv4-mapped IPv6 (::ffff:0:0/96): classify the embedded IPv4 address.
  const mappedPrefix = ipv6Network("::ffff:0:0");
  if (ipv6InRange(value, mappedPrefix, 96)) {
    const embedded = Number(value & 0xffffffffn);
    const ipv4 = [
      (embedded >>> 24) & 255,
      (embedded >>> 16) & 255,
      (embedded >>> 8) & 255,
      embedded & 255,
    ].join(".");
    return isPrivateOrReservedAddress(ipv4);
  }

  // Only global-unicast IPv6 (2000::/3) is accepted. This excludes
  // unspecified, loopback, ULA, link-local, multicast, transition and
  // other non-global address classes.
  const globalUnicast = ipv6Network("2000::");
  if (!ipv6InRange(value, globalUnicast, 3)) return true;

  // Documentation and special-purpose allocations are not public destinations.
  if (
    ipv6InRange(value, ipv6Network("2001:db8::"), 32) ||
    ipv6InRange(value, ipv6Network("2001::"), 23) ||
    ipv6InRange(value, ipv6Network("2002::"), 16) ||
    ipv6InRange(value, ipv6Network("64:ff9b::"), 96) ||
    ipv6InRange(value, ipv6Network("64:ff9b:1::"), 48)
  ) {
    return true;
  }

  return false;
}

export function isBlockedResourceUrl(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return true;
  }

  if (["data:", "blob:", "about:"].includes(url.protocol)) return false;
  if (url.protocol !== "http:" && url.protocol !== "https:") return true;

  const hostname = url.hostname.replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (!hostname) return true;

  const version = isIP(hostname);
  if (version) return isPrivateOrReservedAddress(hostname);

  if (
    /^(localhost|.*\.local|.*\.internal)$/i.test(hostname) ||
    hostname === "metadata.google.internal"
  ) {
    return true;
  }

  return false;
}

/**
 * Also resolve hostnames before Chromium requests them. A public-looking
 * hostname that resolves to any private/reserved address is rejected.
 */
export async function isBlockedResourceRequest(rawUrl, resolveHost = lookup) {
  if (isBlockedResourceUrl(rawUrl)) return true;

  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return true;
  }

  if (["data:", "blob:", "about:"].includes(url.protocol)) return false;

  const hostname = url.hostname.replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (isIP(hostname)) return false;
  if (!hostname) return true;

  try {
    const addresses = await resolveHost(hostname, { all: true, verbatim: true });
    return addresses.length === 0 || addresses.some(({ address }) =>
      isPrivateOrReservedAddress(address)
    );
  } catch {
    // Fail closed if DNS cannot establish that the target is public.
    return true;
  }
}
