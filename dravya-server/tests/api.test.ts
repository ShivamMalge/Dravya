import request from 'supertest';
import { app } from '../src/index';

describe('Diagnostics API test', () => {
    it('GET / should return Dravya Server alive message', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.text).toBe('Dravya Server');
    });

    it('GET /auth/github should initiate OAuth redirect', async () => {
        const response = await request(app).get('/auth/github');
        expect(response.status).toBe(302);
        expect(response.header.location).toBeDefined();
        expect(response.header.location).toMatch(/github.com\/login\/oauth\/authorize/);
    });

    it('GET /auth/github/callback handles failure correctly', async () => {
        const response = await request(app).get('/auth/github/callback');
        expect(response.status).toBe(302);
        expect(response.header.location).toBe('/login');
    });
});
