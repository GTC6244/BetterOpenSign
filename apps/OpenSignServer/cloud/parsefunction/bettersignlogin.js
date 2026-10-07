// bettersignlogin — passwordless OpenSign login for a verified BetterSign identity.
//
// Called server-to-server by the BetterSign signing Worker (Experiment #2) AFTER
// the Worker's native verifier has cryptographically verified the phone's
// signature over the login challenge. We trust the Worker via a shared secret
// (BS_LOGIN_SECRET) and mint a standard Parse session token the browser hands to
// Parse.User.become (see apps/OpenSign/src/pages/Login.jsx thirdpartyLoginfn).
//
// Params: { vlad, email?, name?, secret }
//   vlad    — the verified BetterSign VLAD (identity id)
//   email   — the account email mapped from the device registry (optional; if
//             absent we derive a stable one from the vlad for create-on-first-use)
//   secret  — must equal process.env.BS_LOGIN_SECRET (constant-time compared)
// Returns: { sessionToken, objectId, email } — a real Parse session token.
//
// Mirrors usersignup.js: find-or-create the _User AND the contracts_Users
// extended-class record (+ a partners_Tenant), else getUserDetails returns empty
// and the client logs the user straight back out.

import crypto from 'node:crypto';
import axios from 'axios';
import { cloudServerUrl, serverAppId } from '../../Utils.js';

const serverUrl = cloudServerUrl;
const APPID = serverAppId;
const masterKEY = process.env.MASTER_KEY;

const DEFAULT_ROLE = 'contracts_User';

function secretOk(provided) {
  const expected = process.env.BS_LOGIN_SECRET;
  if (!expected) return false; // refuse unless a secret is configured
  const a = Buffer.from(String(provided || ''));
  const b = Buffer.from(String(expected));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// A stable synthetic email for an unregistered identity (create-on-first-use).
function emailForVlad(vlad) {
  const safe = String(vlad || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 24);
  return `bs-${safe}@bettersign.local`;
}

async function sessionViaLoginAs(userId) {
  const res = await axios({
    method: 'POST',
    url: `${serverUrl}/loginAs`,
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'X-Parse-Application-Id': APPID,
      'X-Parse-Master-Key': masterKEY,
    },
    params: { userId },
  });
  return res.data; // { objectId, sessionToken, ...userFields }
}

export default async function bettersignlogin(request) {
  const { vlad, secret } = request.params || {};
  if (!secretOk(secret)) {
    throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'Unauthorized.');
  }
  if (!vlad) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Missing vlad.');
  }

  const email = (request.params.email || emailForVlad(vlad)).toLowerCase().replace(/\s/g, '');
  const name = request.params.name || email.split('@')[0];

  // 1. Find-or-create the _User, and obtain a session token.
  let userId;
  let sessionToken;
  const userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo('username', email);
  const existing = await userQuery.first({ useMasterKey: true });

  if (existing) {
    userId = existing.id;
    const login = await sessionViaLoginAs(userId);
    sessionToken = login.sessionToken;
  } else {
    const user = new Parse.User();
    user.set('username', email);
    // A random password the user never uses (login is via BetterSign).
    user.set('password', crypto.randomBytes(24).toString('hex'));
    user.set('email', email);
    user.set('name', name);
    const res = await user.signUp();
    userId = res.id;
    sessionToken = res.getSessionToken();
  }

  // 2. Ensure the extended-class record exists (required by getUserDetails).
  const extClass = DEFAULT_ROLE.split('_')[0] + '_Users'; // contracts_Users
  const extQuery = new Parse.Query(extClass);
  extQuery.equalTo('UserId', { __type: 'Pointer', className: '_User', objectId: userId });
  const extUser = await extQuery.first({ useMasterKey: true });

  if (!extUser) {
    // 2a. Tenant.
    const TenantCls = Parse.Object.extend('partners_Tenant');
    const tenant = new TenantCls();
    tenant.set('UserId', { __type: 'Pointer', className: '_User', objectId: userId });
    tenant.set('TenantName', name);
    tenant.set('EmailAddress', email);
    tenant.set('IsActive', true);
    tenant.set('CreatedBy', { __type: 'Pointer', className: '_User', objectId: userId });
    const tenantRes = await tenant.save(null, { useMasterKey: true });

    // 2b. contracts_Users record.
    const ExtCls = Parse.Object.extend(extClass);
    const ext = new ExtCls();
    ext.set('UserId', { __type: 'Pointer', className: '_User', objectId: userId });
    ext.set('UserRole', DEFAULT_ROLE);
    ext.set('Email', email);
    ext.set('Name', name);
    ext.set('TenantId', { __type: 'Pointer', className: 'partners_Tenant', objectId: tenantRes.id });
    const acl = new Parse.ACL();
    acl.setReadAccess(userId, true);
    acl.setWriteAccess(userId, true);
    ext.setACL(acl);
    await ext.save(null, { useMasterKey: true });
  }

  return { sessionToken, objectId: userId, email };
}
