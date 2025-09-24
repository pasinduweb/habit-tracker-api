import { db } from './connection.ts';
import { users, habits, entries, tags, habitTags } from './schema.ts';

async function seed() {
    console.log('Starting database seed...');

    try {
        console.log('Testing DB connection...');
        await db.execute('SELECT 1');
        console.log('DB connection successful');

        console.log('Clearing existing data...');

        await db.delete(entries);
        await db.delete(habitTags);
        await db.delete(habits);
        await db.delete(tags);
        await db.delete(users);

        console.log('Creating demo users...');

        const [demoUser] = await db
            .insert(users)
            .values({
                email: 'demo@habittracker.com',
                username: 'demouser',
                password: 'password',
                firstName: 'Demo',
                lastName: 'User',
            })
            .returning();

        console.log(`Created user with ID: ${demoUser.id}`);

        console.log('Creating tags...');

        const [healthTag] = await db.insert(tags).values({ name: 'Health', color: '#10B981' }).returning();

        console.log(`Created tag with ID: ${healthTag.id}`);

        console.log('Creating demo habits...');

        const [exerciseHabit] = await db
            .insert(habits)
            .values({
                userId: demoUser.id,
                name: 'Exercise',
                description: 'Daily workout routine',
                frequency: 'daily',
                targetCount: 1,
            })
            .returning();

        console.log(`Created habit with ID: ${exerciseHabit.id}`);

        await db.insert(habitTags).values([{ habitId: exerciseHabit.id, tagId: healthTag.id }]);

        console.log('Adding completion entries...');

        const today = new Date();
        today.setHours(12, 0, 0, 0);

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            await db.insert(entries).values({
                habitId: exerciseHabit.id,
                completionDate: date,
            });
        }

        console.log('Database seeded successfully!');
        console.log('\nLogin Creds:');
        console.log(`email: ${demoUser.email}`);
        console.log(`password: ${demoUser.password}`);
    } catch (e) {
        console.error('Seed failed:', e);
        process.exit(1);
    }
}

if (process.argv[1]?.includes('seed.ts')) {
    seed()
        .then(() => {
            console.log('Seed successful');
            process.exit(0);
        })
        .catch((e) => {
            console.error('Seed failed:', e);
            process.exit(1);
        });
}

export default seed;
