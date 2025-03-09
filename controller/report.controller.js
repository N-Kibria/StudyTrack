const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getWeeklyReport = async (req, res) => {
    try {
        const userId = req.session?.userId; 
       
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const pastWeekDate = new Date();
        pastWeekDate.setDate(pastWeekDate.getDate() - 7);

       
        const totalMinutes = await prisma.session.aggregate({
            _sum: { duration: true },
            where: {
                userId,
                date: { gte: pastWeekDate },
            },
        });

      
        const sessions = await prisma.session.findMany({
            where: {
                userId,
                date: { gte: pastWeekDate },
            },
            include: { subject: true },
            orderBy: { date: 'desc' },
        });

        const subjectsWithRecentSessions = await prisma.subject.findMany({
            where: {
                userId,
                sessions: {
                    some: {
                        date: { gte: pastWeekDate }, 
                    },
                },
            },
            include: {
                sessions: {
                    orderBy: { date: 'asc' }, 
                    take: 1,
                },
            },
        });

        const formattedSubjects = subjectsWithRecentSessions.map((subject) => ({
            name: subject.name,
            oldestSessionDate: subject.sessions[0]?.date, 
        }));


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
                    totalTime: item._sum.duration / 60, 
                };
            })
        );

        res.json({
            totalHours: (totalMinutes._sum.duration || 0) / 60, 
            sessions: sessions.map((session) => ({
                subjectName: session.subject.name,
                duration: session.duration,
                date: session.date,
                notes: session.notes,
            })),
            subjects: formattedSubjects,
            subjectTimeDistribution: subjectData,
        });
    } catch (error) {
        console.error('Error generating weekly report:', error);
        res.status(500).json({ error: 'Failed to generate weekly report' });
    }
};



exports.getMonthlyReport = async (req, res) => {
    try {
        const userId = req.session?.userId; 
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const pastMonthDate = new Date();
        pastMonthDate.setMonth(pastMonthDate.getMonth() - 1);

        const totalMinutes = await prisma.session.aggregate({
            _sum: { duration: true },
            where: {
                userId,
                date: { gte: pastMonthDate },
            },
        });

        const sessions = await prisma.session.findMany({
            where: {
                userId,
                date: { gte: pastMonthDate },
            },
            include: { subject: true },
            orderBy: { date: 'desc' },
        });

       
        const subjectsWithRecentSessions = await prisma.subject.findMany({
            where: {
                userId,
                sessions: {
                    some: {
                        date: { gte: pastMonthDate }, 
                    },
                },
            },
            include: {
                sessions: {
                    orderBy: { date: 'asc' }, 
                    take: 1,
                },
            },
        });

        const formattedSubjects = subjectsWithRecentSessions.map((subject) => ({
            name: subject.name,
            oldestSessionDate: subject.sessions[0]?.date || null, 
        }));


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
                    totalTime: item._sum.duration / 60,
                };
            })
        );

        res.json({
            totalHours: (totalMinutes._sum.duration || 0) / 60,
            sessions: sessions.map((session) => ({
                subjectName: session.subject.name,
                duration: session.duration,
                date: session.date,
                notes: session.notes,
            })),
            subjects: formattedSubjects,
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
        const userId = req.session?.userId;  

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

     
        const now = new Date();
        let startDate;
        if (period === "weekly") {
            startDate = new Date(now.setDate(now.getDate() - 7));
        } else if (period === "monthly") {
            startDate = new Date(now.setMonth(now.getMonth() - 1));
        } else {
            return res.status(400).json({ error: "Invalid period" });
        }

 
        const sessions = await prisma.session.groupBy({
            by: ["subjectId"],
            _sum: {
                duration: true, 
            },
            where: {
                userId,
                date: {
                    gte: startDate, 
                },
            },
        });

        
        const subjectData = await Promise.all(
            sessions.map(async (session) => {
                const subject = await prisma.subject.findUnique({
                    where: { id: session.subjectId },
                });
                return {
                    subjectName: subject.name,
                    totalTime: session._sum.duration || 0,
                };
            })
        );

        res.json({ subjectTimeDistribution: subjectData });
    } catch (error) {
        console.error("Error fetching subject time distribution:", error);
        res.status(500).json({ error: "Failed to fetch subject time distribution" });
    }
};

