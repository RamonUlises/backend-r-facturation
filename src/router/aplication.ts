import { Request, Response, Router } from 'express';
import path from 'node:path';

const router = Router();

const latestVersion = {
  version: '1.0.1',
  notes: 'Primera versión de la aplicación',
  pub_date: '2025-01-09T12:00:00Z',
  platforms: {
    windows: {
      url: 'https://aricab.nextstep-web.online/aplicacion/actualizar/app-1.0.1.exe',
    },
    linux: {
      url: 'https://aricab.nextstep-web.online/aplicacion/actualizar/app-1.0.1.deb',
    }
  }
};

router.get('/actualizar', (req: Request, res: Response) => {
  res.json(latestVersion);
});

router.get('/actualizar/:filename', (req: Request, res: Response) => {
  const { filename } = req.params as { filename: string }; 
  const file = path.join(__dirname, '../updates', filename);

  res.download(file);
});

export default router;
