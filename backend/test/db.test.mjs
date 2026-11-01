// DB integration test for spec S6 (odd/tasks/appointment-registration.md):
// the treatment catalog must always have at least 3 TreatmentTypes, so the
// appointment form treatment selector can always be preloaded with >= 3 options.
// Read-only test: it never writes to the database.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test('treatment catalog has at least 3 TreatmentTypes (S6 guard)', async () => {
  try {
    const types = await prisma.treatmentType.findMany();
    assert.ok(
      types.length >= 3,
      `S6 violated: catalog has only ${types.length} TreatmentTypes, the appointment treatment selector requires at least 3`
    );
    const names = types.map((t) => t.name);
    assert.equal(
      new Set(names).size,
      names.length,
      `TreatmentType names must be unique for selector options: got duplicate(s) among [${names.join(', ')}]`
    );
    for (const t of types) {
      assert.ok(t.name && t.name.trim().length > 0, 'every TreatmentType needs a non-empty name');
      assert.ok(t.totalSessions >= 1, `"${t.name}" must have totalSessions >= 1`);
    }
  } finally {
    await prisma.$disconnect();
  }
});
