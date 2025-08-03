import { Request, Response, Router } from 'express';
import path from 'node:path';

const router = Router();

const latestVersion = {
  version: '3.5.0',
  notes: 'Nueva actualización',
  pub_date: '2025-08-03T12:00:00Z',
  platforms: {
    windows: {
      url: 'https://api.aricab.shop/aplicacion/actualizar/aricab_3.5.0_x64-setup.exe',
    },
    linux: {
      url: 'https://api.aricab.shop/aplicacion/actualizar/aricab_3.5.0_amd64.deb',
    }
  }
};

router.get('/actualizar', (req: Request, res: Response) => {
  res.json(latestVersion);
});

router.get('/actualizar/:filename', (req: Request, res: Response) => {
  const { filename } = req.params as { filename: string }; 
  const file = path.join(__dirname, '../../src/updates', filename);

  res.download(file);
});

router.get('/descargar/:filename', (req: Request, res: Response) => {
  const { filename } = req.params as { filename: string }; 
  const file = path.join(__dirname, '../../src/updates', filename);

  res.download(file);
});

export default router;
