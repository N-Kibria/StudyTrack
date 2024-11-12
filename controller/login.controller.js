const bcrypt = require('bcrypt');
const db = require('../db');

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        
        const user = await db.user.findFirst({
            where: {
                email,
            },
        });

        if (!user) {
            return res.status(400).send('Invalid email or password.');
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return res.status(400).send('Invalid email or password.');
        }

        req.session.isAuthenticated = true;
        req.session.email = user.email;
        req.session.userId = user.id; 
        res.redirect('/dashboard'); 
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred during login.');
    }
};




module.exports = { login };
