import { Router } from 'express';
import { HttpError } from '../errors.js';
import { requireAuth } from '../middleware.js';

const FIELDS = ['full_name', 'headline', 'location', 'phone', 'bio'];
const toApi = (p) => ({
  fullName: p.full_name, headline: p.headline, location: p.location,
  phone: p.phone, bio: p.bio, updatedAt: p.updated_at,
});

export default function profileRoutes(db) {
  const r = Router();
  r.use(requireAuth);

  const get = (userId) => db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId);

  r.get('/', (req, res) => {
    const profile = get(req.user.id);
    if (!profile) throw new HttpError(404, 'Profile not found');
    res.json({ profile: toApi(profile) });
  });

  r.put('/', (req, res) => {
    const body = req.body ?? {};
    const camel = { full_name: body.fullName, headline: body.headline, location: body.location, phone: body.phone, bio: body.bio };
    const values = {};
    for (const f of FIELDS) {
      if (camel[f] === undefined) continue;
      if (camel[f] !== null && typeof camel[f] !== 'string') throw new HttpError(400, `${f} must be a string`);
      if (camel[f] && camel[f].length > 2000) throw new HttpError(400, `${f} is too long`);
      values[f] = camel[f];
    }
    if (!Object.keys(values).length) throw new HttpError(400, 'No profile fields provided');

    if (!get(req.user.id)) db.prepare('INSERT INTO profiles (user_id) VALUES (?)').run(req.user.id);
    const sets = Object.keys(values).map((f) => `${f} = @${f}`).join(', ');
    db.prepare(`UPDATE profiles SET ${sets}, updated_at = datetime('now') WHERE user_id = @user_id`)
      .run({ ...values, user_id: req.user.id });
    res.json({ profile: toApi(get(req.user.id)) });
  });

  return r;
}
