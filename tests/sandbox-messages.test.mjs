import test from "node:test";
import assert from "node:assert/strict";
import { readSandboxConsoleMessage } from "../lib/sandboxMessages.js";

const iframeWindow = {};

test("accepts log messages from the active sandbox iframe", () => {
  const args = ["hello", 42];
  const event = { source: iframeWindow, data: { type: "log", data: args } };
  assert.deepEqual(readSandboxConsoleMessage(event, iframeWindow), args);
});

test("rejects messages from other windows, even with a log-shaped payload", () => {
  const event = { source: {}, data: { type: "log", data: ["spoofed"] } };
  assert.equal(readSandboxConsoleMessage(event, iframeWindow), null);
});

test("rejects malformed and non-log messages from the iframe", () => {
  assert.equal(
    readSandboxConsoleMessage({ source: iframeWindow, data: { type: "other", data: [] } }, iframeWindow),
    null
  );
  assert.equal(
    readSandboxConsoleMessage({ source: iframeWindow, data: { type: "log", data: "not-an-array" } }, iframeWindow),
    null
  );
});

test("rejects messages when no active iframe exists", () => {
  assert.equal(
    readSandboxConsoleMessage({ source: iframeWindow, data: { type: "log", data: [] } }, null),
    null
  );
});
