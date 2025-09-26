import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.ts';
import { db } from '../db/connection.ts';
import { habits, entries, habitTags, tags } from '../db/schema.ts';
import { eq, and, desc, inArray } from 'drizzle-orm';

export const createHabit = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { name, description, frequency, targetCount, tagIds } = req.body;
        const userId = req.user!.id;

        const result = await db.transaction(async (tx) => {
            const [newHabit] = await tx
                .insert(habits)
                .values({
                    userId,
                    name,
                    description,
                    frequency,
                    targetCount,
                })
                .returning();

            if (tagIds && tagIds.length > 0) {
                const habitTagValues = tagIds.map((tagId: string) => ({
                    habitId: newHabit.id,
                    tagId,
                }));
                await tx.insert(habitTags).values(habitTagValues);
            }

            return newHabit;
        });

        res.status(201).json({
            message: 'Habit created successfully',
            habit: result,
        });
    } catch (e) {
        console.error('Create habit error:', e);
        res.status(500).json({ error: 'Failed to create habit' });
    }
};

export const getUserHabits = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userHabitsWithTags = await db.query.habits.findMany({
            where: eq(habits.userId, req.user.id),
            with: {
                habitTags: {
                    with: {
                        tag: true,
                    },
                },
            },
            orderBy: [desc(habits.createdAt)],
        });

        const habitsWithTags = userHabitsWithTags.map((habit) => ({
            ...habit,
            tags: habit.habitTags.map((ht) => ht.tag),
            habitTags: undefined,
        }));

        res.json({
            habits: habitsWithTags,
        });
    } catch (e) {
        console.error('Error getting habits:', e);
        res.status(500).json({ error: 'Failed to fetch habits' });
    }
};

export const updateHabit = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const id = req.params.id;
        const { tagIds, ...updates } = req.body;

        const result = await db.transaction(async (tx) => {
            const [updatedHabit] = await tx
                .update(habits)
                .set({ ...updates, updatedAt: new Date() })
                .where(and(eq(habits.id, id), eq(habits.userId, req.user.id)))
                .returning();

            if (!updatedHabit) {
                return res.status(401).end();
            }

            if (tagIds !== undefined) {
                await tx.delete(habitTags).where(eq(habitTags.habitId, id));

                if (tagIds.length > 0) {
                    const habitTagValues = tagIds.map((tagId: string) => ({
                        habitId: id,
                        tagId,
                    }));

                    await tx.insert(habitTags).values(habitTagValues);
                }
            }

            return updatedHabit;
        });

        res.json({
            message: 'Habit updated successfully',
            habit: result,
        });
    } catch (e) {
        if (e.message === 'Habit not found') {
            return res.status(404).json({ error: 'Habit not found' });
        }
        console.error('Error updating habit:', e);
        res.status(500).json({ error: 'Failed to update habit' });
    }
};

export const getHabitById = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user!.id;

        const habit = await db.query.habits.findFirst({
            where: and(eq(habits.id, id), eq(habits.userId, userId)),
            with: {
                habitTags: {
                    with: {
                        tag: true,
                    },
                },
                entries: {
                    orderBy: [desc(entries.completionDate)],
                    limit: 10,
                },
            },
        });

        if (!habit) {
            return res.status(404).json({ error: 'Habit not found' });
        }

        const habitWithTags = {
            ...habit,
            tags: habit.habitTags.map((ht) => ht.tag),
            habitTags: undefined,
        };

        res.json({
            habit: habitWithTags,
        });
    } catch (error) {
        console.error('Get habit error:', error);
        res.status(500).json({ error: 'Failed to fetch habit' });
    }
};
