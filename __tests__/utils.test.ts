import { jest } from '@jest/globals';

jest.unstable_mockModule('node:fs/promises', () => ({
  mkdir: jest.fn(),
}));

const { mkdir } = await import('node:fs/promises');

const { getImageType, makeFolder } = await import('../lib/utils.js');

describe('utils', () => {
  describe('getImageType', () => {
    const cases = [
      ['image.gif', 'image/gif'],
      ['image.jpeg', 'image/jpeg'],
      ['image.jpg', 'image/jpeg'],
      ['image.png', 'image/png'],
      ['image.svg', 'image/svg+xml'],
      ['image.tif', 'image/tiff'],
      ['image.tiff', 'image/tiff'],
      ['some-file', ''],
    ];

    it.concurrent.each(cases)('%s is of type %s', (image, exp) =>
      expect(getImageType(image)).toBe(exp),
    );
  });

  describe('makeFolder', () => {
    beforeEach(() => {
      (mkdir as jest.Mock).mockClear();
    });

    it('Works', async () => {
      (mkdir as jest.Mock).mockImplementationOnce(() => Promise.resolve(0));
      await makeFolder('folder');
      expect(mkdir).toBeCalledWith('folder');
    });

    it('Throws Error', async () => {
      const err = new Error('Bad Folder');
      (mkdir as jest.Mock).mockImplementationOnce(() => Promise.reject(err));
      try {
        await makeFolder('folder');
      } catch (e) {
        expect(e).toBe(err);
      }
    });

    it('Ignores EEXIST Error', async () => {
      const err = new Error('Already Exists');
      // Node doesn't expose SystemError
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err as any).code = 'EEXIST';
      (mkdir as jest.Mock).mockImplementationOnce(() => Promise.reject(err));
      try {
        await makeFolder('folder');
        expect(mkdir).toBeCalledWith('folder');
      } catch (e) {
        expect(e).not.toBeDefined();
      }
    });
  });
});
