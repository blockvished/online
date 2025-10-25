/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import {
  SealEncrypt,
  SealEncrypt_AccessRevoked,
  SealEncrypt_AdminAdded,
  SealEncrypt_AdminRemoved,
  SealEncrypt_DocumentAdded,
  SealEncrypt_ShareAccess,
  SealEncrypt_UsernameSetAndCreated,
  SealEncrypt_UsernameSetAndUpdated,
} from "generated";

SealEncrypt.AccessRevoked.handler(async ({ event, context }) => {
  const entity: SealEncrypt_AccessRevoked = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    cid: event.params.cid,
    revokeuser: event.params.Revokeuser,
    revokeAddr: event.params.RevokeAddr,
  };

  context.SealEncrypt_AccessRevoked.set(entity);
});

SealEncrypt.AdminAdded.handler(async ({ event, context }) => {
  const entity: SealEncrypt_AdminAdded = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    admin: event.params.admin,
  };

  context.SealEncrypt_AdminAdded.set(entity);
});

SealEncrypt.AdminRemoved.handler(async ({ event, context }) => {
  const entity: SealEncrypt_AdminRemoved = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    admin: event.params.admin,
  };

  context.SealEncrypt_AdminRemoved.set(entity);
});

SealEncrypt.DocumentAdded.handler(async ({ event, context }) => {
  const entity: SealEncrypt_DocumentAdded = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    addedBy: event.params.addedBy,
    cid: event.params.cid,
    user: event.params.user,
  };

  context.SealEncrypt_DocumentAdded.set(entity);
});

SealEncrypt.ShareAccess.handler(async ({ event, context }) => {
  const entity: SealEncrypt_ShareAccess = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    cid: event.params.cid,
    shareUser: event.params.shareUser,
    shareAddr: event.params.shareAddr,
  };

  context.SealEncrypt_ShareAccess.set(entity);
});

SealEncrypt.UsernameSetAndCreated.handler(async ({ event, context }) => {
  const entity: SealEncrypt_UsernameSetAndCreated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    username: event.params.username,
  };

  context.SealEncrypt_UsernameSetAndCreated.set(entity);
});

SealEncrypt.UsernameSetAndUpdated.handler(async ({ event, context }) => {
  const entity: SealEncrypt_UsernameSetAndUpdated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    username: event.params.username,
  };

  context.SealEncrypt_UsernameSetAndUpdated.set(entity);
});
