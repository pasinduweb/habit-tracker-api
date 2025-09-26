import { createTestUser, createTestHabit, cleanupDatabase } from './db-helpers.ts';

describe('Test setup', () => {
    test('should connect to test db', async () => {
        const { user, token } = await createTestUser();

        expect(user).toBeDefined();
        await cleanupDatabase();
    });
});
