import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import dotenv from 'dotenv';
import pool from './db';

dotenv.config();

export const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'dravya_secret',
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (rows.length > 0) {
            done(null, rows[0]);
        } else {
            done(new Error('User not found'));
        }
    } catch (err) {
        done(err);
    }
});

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || 'mock',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'mock',
    callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/auth/github/callback'
}, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
        const oauthId = profile.id;
        const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;

        const { rows } = await pool.query(
            'SELECT * FROM users WHERE oauth_provider = $1 AND oauth_id = $2',
            ['github', oauthId]
        );

        if (rows.length > 0) {
            return done(null, rows[0]);
        }

        const newUser = await pool.query(
            'INSERT INTO users (oauth_provider, oauth_id, email) VALUES ($1, $2, $3) RETURNING *',
            ['github', oauthId, email]
        );

        return done(null, newUser.rows[0]);
    } catch (err) {
        return done(err);
    }
}));

app.get('/auth/github',
    passport.authenticate('github', { scope: ['user:email'] })
);

app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/');
    }
);

app.get('/', (req, res) => {
    res.send('Dravya Server');
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Listening on ${port}`);
    });
}
