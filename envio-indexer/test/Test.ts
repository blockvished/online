import assert from "assert";
import { 
  TestHelpers,
  SealEncrypt_AccessRevoked
} from "generated";
const { MockDb, SealEncrypt } = TestHelpers;

describe("SealEncrypt contract AccessRevoked event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for SealEncrypt contract AccessRevoked event
  const event = SealEncrypt.AccessRevoked.createMockEvent({/* It mocks event fields with default values. You can overwrite them if you need */});

  it("SealEncrypt_AccessRevoked is created correctly", async () => {
    // Processing the event
    const mockDbUpdated = await SealEncrypt.AccessRevoked.processEvent({
      event,
      mockDb,
    });

    // Getting the actual entity from the mock database
    let actualSealEncryptAccessRevoked = mockDbUpdated.entities.SealEncrypt_AccessRevoked.get(
      `${event.chainId}_${event.block.number}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedSealEncryptAccessRevoked: SealEncrypt_AccessRevoked = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      user: event.params.user,
      cid: event.params.cid,
      Revokeuser: event.params.Revokeuser,
      RevokeAddr: event.params.RevokeAddr,
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualSealEncryptAccessRevoked, expectedSealEncryptAccessRevoked, "Actual SealEncryptAccessRevoked should be the same as the expectedSealEncryptAccessRevoked");
  });
});
