const express = require('express');
const path = require('path');
const router = express.Router();

exports.getdashboard = (req, res) => {
    res.sendFile(path.join(__dirname, '../htmls/dashboard.html'));
};


exports.getTotalStudyHours = async (req, res) => {
    try {
        const userId = req.session?.userId; 


        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const totalMinutes = await prisma.session.aggregate({
            _sum: { duration: true },
            where: { userId },
        });

        const totalHours = (totalMinutes._sum.duration || 0) / 60; 
        res.json({ totalHours: totalHours.toFixed(2) });
    } catch (error) {
        console.error('Error calculating total study hours:', error);
        res.status(500).json({ error: 'Failed to calculate total study hours' });
    }
};

exports.getRecentSessions = async (req, res) => {
    try {
        const userId = req.session?.userId; 

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const sessions = await prisma.session.findMany({
            where: { userId },
            include: { subject: true }, 
            orderBy: { date: 'desc' },
            take: 5, 
        });

        const formattedSessions = sessions.map(session => ({
            subjectName: session.subject.name,
            duration: session.duration,
            date: session.date,
            notes: session.notes,
        }));

        res.json({ sessions: formattedSessions });
    } catch (error) {
        console.error('Error fetching recent sessions:', error);
        res.status(500).json({ error: 'Failed to fetch recent sessions' });
    }
};

