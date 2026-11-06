import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { fetchExportResource, handleExportResource } from "../lib/exportResource.mjs";

const publicDns = async () => [{ address: "93.184.215.14", family: 4 }];
function transport(responses, inspect = () => {}) {
  return (url, options, callback) => {
    inspect(url, options);
    const req = new EventEmitter();
    req.destroy = () => {};
    req.end = () => queueMicrotask(() => {
      const data = responses.shift();
      const res = new EventEmitter();
      res.statusCode = data.status ?? 200;
      res.headers = data.headers ?? { "content-type": "image/png" };
      res.destroy = () => {};
      callback(res);
      if (!res.headers.location) {
        res.emit("data", data.body ?? Buffer.from("asset"));
        res.emit("end");
      }
    });
    return req;
  };
}

test("socket uses the validated address without a second DNS lookup; hostname is retained", async () => {
  let resolutions = 0;
  const response = await fetchExportResource("https://assets.example/image", {
    resolveHost: async () => ++resolutions === 1 ? publicDns() : [{ address: "127.0.0.1", family: 4 }],
    request: transport([{}], (url, options) => {
      assert.equal(url.hostname, "assets.example");
      assert.equal(options.agent, false);
      assert.equal(options.rejectUnauthorized, undefined); // TLS verification remains on.
      options.lookup(url.hostname, {}, (error, address, family) => {
        assert.ifError(error);
        assert.equal(address, "93.184.215.14");
        assert.equal(family, 4);
      });
      options.lookup(url.hostname, { all: true }, (error, addresses) => {
        assert.ifError(error);
        assert.deepEqual(addresses, [{ address: "93.184.215.14", family: 4 }]);
      });
    }),
  });
  assert.equal(resolutions, 1);
  assert.equal(response.body.toString(), "asset");
});

test("private and mixed DNS answers are rejected before opening a connection", async () => {
  for (const addresses of [[{ address: "::1", family: 6 }], [...await publicDns(), { address: "10.0.0.1", family: 4 }]]) {
    await assert.rejects(fetchExportResource("https://assets.example/x", {
      resolveHost: async () => addresses,
      request: () => assert.fail("must not connect"),
    }), /Blocked/);
  }
});

test("redirects cannot reach private IPs, private DNS, or a rebound original hostname", async () => {
  for (const location of ["http://127.0.0.1/secret", "https://internal.example/secret", "/secret"]) {
    let calls = 0;
    await assert.rejects(fetchExportResource("https://assets.example/x", {
      resolveHost: async () => ++calls === 1 ? publicDns() : [{ address: "10.0.0.1", family: 4 }],
      request: transport([{ status: 302, headers: { location } }]),
    }), /Blocked/);
  }
});

test("public redirects are followed with fresh validation and bounded hops", async () => {
  let calls = 0;
  const result = await fetchExportResource("https://assets.example/x", {
    resolveHost: async () => { calls++; return publicDns(); },
    request: transport([{ status: 302, headers: { location: "/final" } }, {}]),
  });
  assert.equal(calls, 2);
  assert.equal(result.status, 200);
  await assert.rejects(fetchExportResource("https://assets.example/x", {
    resolveHost: publicDns,
    request: transport(Array.from({ length: 6 }, () => ({ status: 302, headers: { location: "/loop" } }))),
  }), /Too many/);
});

test("resource size and cancellation are enforced", async () => {
  await assert.rejects(fetchExportResource("https://assets.example/x", {
    resolveHost: publicDns,
    request: transport([{ body: Buffer.alloc(10 * 1024 * 1024 + 1) }]),
  }), /size limit/);
  await assert.rejects(fetchExportResource("https://assets.example/x", {
    signal: AbortSignal.abort(), request: () => assert.fail("must not connect"),
  }), { name: "AbortError" });
});

test("renderer fulfills public bytes, aborts private resources and never continues browser networking", async () => {
  for (const url of ["https://assets.example/x", "http://127.0.0.1/x"]) {
    let fulfilled = false, aborted = false;
    await handleExportResource({
      request: () => ({ url: () => url, method: () => "GET" }),
      fulfill: async ({ body }) => { fulfilled = true; assert.equal(body.toString(), "asset"); },
      abort: async () => { aborted = true; },
      continue: () => assert.fail("browser must never connect"),
    }, { resolveHost: publicDns, request: transport([{}]) });
    assert.equal(fulfilled, url.startsWith("https:"));
    assert.equal(aborted, !fulfilled);
  }
});
