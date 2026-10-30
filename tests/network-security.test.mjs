import test from "node:test";
import assert from "node:assert/strict";
import {
  isBlockedResourceUrl,
  isBlockedResourceRequest,
  isPrivateOrReservedAddress,
} from "../lib/networkSecurity.mjs";

test("blocks private, loopback, link-local and reserved IPv4 addresses", () => {
  for (const address of [
    "127.0.0.1",
    "10.1.2.3",
    "172.16.0.1",
    "192.168.1.1",
    "169.254.169.254",
    "100.64.0.1",
    "198.18.0.1",
    "224.0.0.1",
    "240.0.0.1",
  ]) {
    assert.equal(isPrivateOrReservedAddress(address), true, address);
  }
});

test("allows public IPv4 addresses", () => {
  assert.equal(isPrivateOrReservedAddress("8.8.8.8"), false);
  assert.equal(isPrivateOrReservedAddress("1.1.1.1"), false);
});

test("blocks non-global and special-purpose IPv6 addresses", () => {
  for (const address of [
    "::",
    "::1",
    "fc00::1",
    "fd12:3456::1",
    "fe80::1",
    "ff02::1",
    "::ffff:127.0.0.1",
    "2001:db8::1",
    "2001::1",
    "2002:7f00:1::",
    "64:ff9b::7f00:1",
    "64:ff9b:1::7f00:1",
  ]) {
    assert.equal(isPrivateOrReservedAddress(address), true, address);
  }
});

test("allows global-unicast IPv6 addresses", () => {
  assert.equal(isPrivateOrReservedAddress("2606:4700:4700::1111"), false);
});

test("blocks private URL literals and non-http protocols", () => {
  assert.equal(isBlockedResourceUrl("http://127.0.0.1/admin"), true);
  assert.equal(isBlockedResourceUrl("http://[::1]/"), true);
  assert.equal(isBlockedResourceUrl("file:///etc/passwd"), true);
  assert.equal(isBlockedResourceUrl("http://169.254.169.254/latest/meta-data"), true);
});

test("allows safe in-document URLs and public HTTP(S) destinations", () => {
  assert.equal(isBlockedResourceUrl("data:image/png;base64,AA=="), false);
  assert.equal(isBlockedResourceUrl("blob:https://example.com/id"), false);
  assert.equal(isBlockedResourceUrl("https://example.com/image.png"), false);
});

test("DNS names resolving to loopback are blocked", async () => {
  assert.equal(await isBlockedResourceRequest("http://localhost/"), true);
});

test("DNS answers containing private addresses are blocked", async () => {
  const privateDns = async () => [{ address: "127.0.0.1", family: 4 }];
  const mixedDns = async () => [
    { address: "8.8.8.8", family: 4 },
    { address: "10.0.0.5", family: 4 },
  ];

  assert.equal(
    await isBlockedResourceRequest("https://slides.example/image.png", privateDns),
    true
  );
  assert.equal(
    await isBlockedResourceRequest("https://slides.example/image.png", mixedDns),
    true
  );
});

test("public DNS answers are allowed and DNS failures are blocked", async () => {
  const publicDns = async () => [{ address: "8.8.8.8", family: 4 }];
  const failedDns = async () => { throw new Error("DNS unavailable"); };

  assert.equal(
    await isBlockedResourceRequest("https://slides.example/image.png", publicDns),
    false
  );
  assert.equal(
    await isBlockedResourceRequest("https://slides.example/image.png", failedDns),
    true
  );
});

test("in-document URLs bypass DNS resolution", async () => {
  const failIfCalled = async () => { throw new Error("should not resolve an in-document URL"); };
  assert.equal(await isBlockedResourceRequest("data:text/plain,hello", failIfCalled), false);
  assert.equal(await isBlockedResourceRequest("about:blank", failIfCalled), false);
  assert.equal(await isBlockedResourceRequest("blob:https://example.com/id", failIfCalled), false);
});
