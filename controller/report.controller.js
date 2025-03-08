const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getWeeklyReport = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const pastWeekDate = new Date();
        pastWeekDate.setDate(pastWeekDate.getDate() - 7);

        // Total study hours for the week
        const totalMinutes = await prisma.session.aggregate({
            _sum: { duration: true },
            where: {
                userId,
                date: { gte: pastWeekDate },
            },
        });

        // Recent sessions in the past week
        const sessions = await prisma.session.findMany({
            where: {
                userId,
                date: { gte: pastWeekDate },
            },
            include: { subject: true },
            orderBy: { date: 'desc' },
        });

        // Subjects that have sessions created in the past week
        const subjectsWithRecentSessions = await prisma.subject.findMany({
            where: {
                userId,
                sessions: {
                    some: {
                        date: { gte: pastWeekDate }, // Check if any session in the subject is in the past week
                    },
                },
            },
            include: {
                sessions: {
                    orderBy: { date: 'asc' }, // Get the oldest session date
                    take: 1,
                },
            },
        });

        const formattedSubjects = subjectsWithRecentSessions.map((subject) => ({
            name: subject.name,
            oldestSessionDate: subject.sessions[0]?.date, // Use the oldest session date
        }));

        // Pie chart data: Time spent per subject
        const subjectTimeDistribution = await prisma.session.groupBy({
            by: ['subjectId'],
            _sum: { duration: true },
            where: {
                userId,
                date: { gte: pastWeekDate },
            },
        });

        const subjectData = await Promise.all(
            subjectTimeDistribution.map(async (item) => {
                const subject = await prisma.subject.findUnique({
                    where: { id: item.subjectId },
                });
                return {
                    subjectName: subject.name,
                    totalTime: item._sum.duration / 60, // Convert minutes to hours
                };
            })
        );

        res.json({
            totalHours: (totalMinutes._sum.duration || 0) / 60, // Convert minutes to hours
            sessions: sessions.map((session) => ({
                subjectName: session.subject.name,
                duration: session.duration,
                date: session.date,
                notes: session.notes,
            })),
            subjects: formattedSubjects, // Include subjects with their oldest session date
            subjectTimeDistribution: subjectData,
        });
    } catch (error) {
        console.error('Error generating weekly report:', error);
        res.status(500).json({ error: 'Failed to generate weekly report' });
    }
};


// Monthly Report Logic
exports.getMonthlyReport = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const pastMonthDate = new Date();
        pastMonthDate.setMonth(pastMonthDate.getMonth() - 1);

        // Total study hours for the month
        const totalMinutes = await prisma.session.aggregate({
            _sum: { duration: true },
            where: {
                userId,
                date: { gte: pastMonthDate },
            },
        });

        // Recent sessions in the past month
        const sessions = await prisma.session.findMany({
            where: {
                userId,
                date: { gte: pastMonthDate },
            },
            include: { subject: true },
            orderBy: { date: 'desc' },
        });

        // Subjects with their oldest session date in the past month
        const subjectsWithRecentSessions = await prisma.subject.findMany({
            where: {
                userId,
                sessions: {
                    some: {
                        date: { gte: pastMonthDate }, // Check if any session in the subject is in the past month
                    },
                },
            },
            include: {
                sessions: {
                    orderBy: { date: 'asc' }, // Get the oldest session date
                    take: 1,
                },
            },
        });

        const formattedSubjects = subjectsWithRecentSessions.map((subject) => ({
            name: subject.name,
            oldestSessionDate: subject.sessions[0]?.date || null, // Use the oldest session date
        }));

        // Pie chart data: Time spent per subject
        const subjectTimeDistribution = await prisma.session.groupBy({
            by: ['subjectId'],
            _sum: { duration: true },
            where: {
                userId,
                date: { gte: pastMonthDate },
            },
        });

        const subjectData = await Promise.all(
            subjectTimeDistribution.map(async (item) => {
                const subject = await prisma.subject.findUnique({
                    where: { id: item.subjectId },
                });
                return {
                    subjectName: subject.name,
                    totalTime: item._sum.duration / 60, // Convert minutes to hours
                };
            })
        );

        res.json({
            totalHours: (totalMinutes._sum.duration || 0) / 60, // Convert minutes to hours
            sessions: sessions.map((session) => ({
                subjectName: session.subject.name,
                duration: session.duration,
                date: session.date,
                notes: session.notes,
            })),
            subjects: formattedSubjects, // Include subjects with their oldest session date
            subjectTimeDistribution: subjectData,
        });
    } catch (error) {
        console.error('Error generating monthly report:', error);
        res.status(500).json({ error: 'Failed to generate monthly report' });
    }
};
exports.getSubjectTimeDistribution = async (req, res) => {
    try {
        const { period } = req.params;
        const userId = req.session.userId; // Assuming userId is stored in session

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Define the start date based on the period
        const now = new Date();
        let startDate;
        if (period === "weekly") {
            startDate = new Date(now.setDate(now.getDate() - 7));
        } else if (period === "monthly") {
            startDate = new Date(now.setMonth(now.getMonth() - 1));
        } else {
            return res.status(400).json({ error: "Invalid period" });
        }

        // Fetch time spent per subject within the selected period
        const sessions = await prisma.session.groupBy({
            by: ["subjectId"],
            _sum: {
                duration: true, // Total time spent
            },
            where: {
                userId,
                date: {
                    gte: startDate, // Filter sessions from the start date
                },
            },
        });

        // Fetch subject names for the grouped session data
        const subjectData = await Promise.all(
            sessions.map(async (session) => {
                const subject = await prisma.subject.findUnique({
                    where: { id: session.subjectId },
                });
                return {
                    subjectName: subject.name,
                    totalTime: session._sum.duration || 0, // Total time for this subject
                };
            })
        );

        res.json({ subjectTimeDistribution: subjectData });
    } catch (error) {
        console.error("Error fetching subject time distribution:", error);
        res.status(500).json({ error: "Failed to fetch subject time distribution" });
    }
};

