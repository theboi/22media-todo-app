import test from "node:test";
import assert from "node:assert/strict";
import { createAuthClient } from "./client.ts";
const session = {
  account: { id: "registered-account" },
  user: { email: "person@example.com" },
};
const setup = (transport, checkSession = false) => {
  const saved = new Map([
    ["eves.token", "guest-token"],
    ["eves.device", "device-id"],
  ]);
  return {
    saved,
    client: createAuthClient({
      url: "http://test/api",
      storage: {
        get: async (key) => saved.get(key) ?? null,
        set: async (key, value) => {
          saved.set(key, value);
        },
      },
      uuid: () => "device-id",
      transport: (url, init) => !checkSession && String(url).endsWith("/me")
        ? Response.json({data:{account:{id:"guest-account"},user:null}})
        : transport(url, init),
    }),
  };
};
test("startup creates a device guest and reuses it after relaunch", async () => {
  const saved = new Map();
  let guestRequests = 0;
  const deps = {
    url: "http://test/api",
    storage: {
      get: async (key) => saved.get(key) ?? null,
      set: async (key, value) => {
        saved.set(key, value);
      },
    },
    uuid: () => "installation-id",
    transport: async (url, init) => {
      if (String(url).endsWith("/guest")) {
        guestRequests++;
        assert.deepEqual(JSON.parse(init.body), {
          device_id: "installation-id",
        });
        return Response.json({
          data: {
            token_type: "Bearer",
            token: "guest-token",
            session: { account: { id: "guest-account" }, user: null },
          },
        });
      }
      assert.equal(init.headers.Authorization, "Bearer guest-token");
      return Response.json({
        data: { account: { id: "guest-account" }, user: null },
      });
    },
  };
  assert.deepEqual(await createAuthClient(deps).getSession(), {
    accountId: "guest-account",
    email: null,
  });
  assert.deepEqual(await createAuthClient(deps).getSession(), {
    accountId: "guest-account",
    email: null,
  });
  assert.equal(guestRequests, 1);
  assert.equal(saved.get("eves.device"), "installation-id");
});
test("successful login saves only token and preserves password whitespace", async () => {
  let body;
  const { client, saved } = setup(async (url, init) => {
    body = JSON.parse(init.body);
    return Response.json({
      data: { token_type: "Bearer", token: "registered-token", session },
    });
  });
  assert.deepEqual(
    await client.signIn(" Person@example.com ", " password12 "),
    { accountId: "registered-account", email: "person@example.com" },
  );
  assert.equal(body.password, " password12 ");
  assert.equal(body.email, "person@example.com");
  assert.equal(saved.get("eves.token"), "registered-token");
  assert.equal(saved.size, 2);
});
test("invalid credentials preserve the guest token and expose useful error", async () => {
  const { client, saved } = setup(async () =>
    Response.json(
      {
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Authentication required.",
        },
      },
      { status: 401 },
    ),
  );
  await assert.rejects(
    client.signIn("person@example.com", "wrongpass"),
    /email or password/i,
  );
  assert.equal(saved.get("eves.token"), "guest-token");
});
test("rejected bearer retries publicly once for lost-response recovery", async () => {
  const bearers = [];
  const { client } = setup(async (url, init) => {
    const token = new Headers(init.headers).get("Authorization");
    bearers.push(token);
    return token
      ? Response.json({ error: { code: "UNAUTHENTICATED" } }, { status: 401 })
      : Response.json({
          data: { token_type: "Bearer", token: "registered-token", session },
        });
  });
  await client.signIn("person@example.com", "password12");
  assert.deepEqual(bearers, ["Bearer guest-token", null]);
});
test("malformed login success cannot replace stored credentials", async () => {
  const { client, saved } = setup(async () =>
    Response.json({
      data: { token_type: "Bearer", token: "wrong", session: {} },
    }),
  );
  await assert.rejects(
    client.signIn("person@example.com", "password12"),
    /invalid/i,
  );
  assert.equal(saved.get("eves.token"), "guest-token");
});

test("concurrent guest provisioning and login share one installation identity", async () => {
  const saved = new Map();
  let ids = 0;
  const devices = [];
  const client = createAuthClient({
    url: "http://test/api",
    storage: {
      get: async (key) => saved.get(key) ?? null,
      set: async (key, value) => {
        saved.set(key, value);
      },
    },
    uuid: () => `device-${++ids}`,
    transport: async (url, init) => {
      devices.push(JSON.parse(init.body).device_id);
      return Response.json({
        data: {
          token_type: "Bearer",
          token: "token",
          session: String(url).endsWith("/guest")
            ? { account: { id: "guest" }, user: null }
            : session,
        },
      });
    },
  });
  await Promise.all([
    client.getToken(),
    client.signIn("person@example.com", "password12"),
  ]);
  assert.equal(ids, 1);
  assert.deepEqual(devices, ["device-1", "device-1"]);
});

test("sign up uses the guest token, confirms the password and saves the registered session", async () => {
  const { client, saved } = setup(async (url, init) => {
    assert.equal(String(url), "http://test/api/auth/register");
    assert.equal(init.headers.Authorization, "Bearer guest-token");
    assert.deepEqual(JSON.parse(init.body), {
      email: "person@example.com",
      password: " password12 ",
      password_confirmation: " password12 ",
    });
    return Response.json({
      data: { token_type: "Bearer", token: "registered-token", session },
    });
  });
  assert.equal(
    (
      await client.signUp(
        " Person@example.com ",
        " password12 ",
        " password12 ",
      )
    ).email,
    "person@example.com",
  );
  assert.equal(saved.get("eves.token"), "registered-token");
  assert.equal(saved.size, 2);
});
test("rejected sign up preserves the guest account", async () => {
  const { client, saved } = setup(async () =>
    Response.json(
      { error: { code: "EMAIL_ALREADY_REGISTERED" } },
      { status: 409 },
    ),
  );
  await assert.rejects(
    client.signUp("person@example.com", "password12", "password12"),
    /Sign in instead/,
  );
  assert.equal(saved.get("eves.token"), "guest-token");
});

test('sign out revokes the session and provisions a fresh guest using the installation id', async () => {
  const calls = [];
  const {client, saved} = setup(async (url, init) => {
    calls.push(String(url));
    if (String(url).endsWith('/logout')) {
      assert.equal(init.method, 'POST');
      assert.equal(init.headers.Authorization, 'Bearer guest-token');
      return new Response(null, {status:204});
    }
    if (String(url).endsWith('/guest')) {
      assert.deepEqual(JSON.parse(init.body), {device_id:'device-id'});
      assert.equal(saved.get('eves.token'), '');
      return Response.json({data:{token_type:'Bearer',token:'fresh-token',session:{account:{id:'fresh-guest'},user:null}}});
    }
    assert.equal(init.headers.Authorization, 'Bearer fresh-token');
    return Response.json({data:{account:{id:'fresh-guest'},user:null}});
  });
  assert.deepEqual(await client.signOut(), {accountId:'fresh-guest',email:null});
  assert.equal(saved.get('eves.token'), 'fresh-token');
  assert.equal(saved.get('eves.device'), 'device-id');
  assert.equal(calls.filter(url => url.endsWith('/guest')).length, 1);
});

test('guest provisioning failure after logout cannot reuse the outgoing bearer', async () => {
  const {client, saved} = setup(async (url) => {
    if (String(url).endsWith('/logout')) return new Response(null, {status:204});
    throw new Error('offline');
  });
  await assert.rejects(client.signOut(), /Cannot reach/);
  assert.equal(saved.get('eves.token'), '');
});

test("a rejected saved session becomes a fresh device guest for concurrent startup and data requests", async () => {
  let guests = 0;
  const { client, saved } = setup(async (url, init) => {
    if (String(url).endsWith('/guest')) {
      guests++;
      assert.deepEqual(JSON.parse(init.body), {device_id:'device-id'});
      return Response.json({data:{token_type:'Bearer',token:'fresh-token',session:{account:{id:'fresh-guest'},user:null}}});
    }
    assert.equal(String(url), 'http://test/api/auth/me');
    if (init.headers.Authorization === 'Bearer guest-token') {
      return Response.json({error:{code:'UNAUTHENTICATED'}}, {status:401});
    }
    assert.equal(init.headers.Authorization, 'Bearer fresh-token');
    return Response.json({data:{account:{id:'fresh-guest'},user:null}});
  }, true);
  const [session, token] = await Promise.all([client.getSession(), client.getToken()]);
  assert.deepEqual(session, {accountId:'fresh-guest',email:null});
  assert.equal(token, 'fresh-token');
  assert.equal(saved.get('eves.token'), 'fresh-token');
  assert.equal(saved.get('eves.device'), 'device-id');
  assert.equal(guests, 1);
});

test("a connection failure does not discard a potentially valid account", async () => {
  const {client, saved} = setup(async () => { throw new Error('offline'); }, true);
  await assert.rejects(client.getToken(), /Cannot reach/);
  assert.equal(saved.get('eves.token'), 'guest-token');
});
