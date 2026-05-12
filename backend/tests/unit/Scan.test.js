const ScanModel = require('../../models/Scan');

describe('ScanModel', () => {
  let scanModel;
  let mockPg;
  let mockClient;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };

    mockPg = {
      connect: jest.fn().mockResolvedValue(mockClient)
    };

    scanModel = new ScanModel(mockPg);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new scan successfully', async () => {
      const mockScan = {
        id: 1,
        user_id: 1,
        target: 'http://example.com',
        status: 'Running',
        created_at: new Date()
      };

      mockClient.query.mockResolvedValue({ rows: [mockScan] });

      const result = await scanModel.create(1, 'http://example.com');

      expect(mockPg.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO scans'),
        expect.arrayContaining([1, 'http://example.com'])
      );
      expect(result).toEqual(mockScan);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      mockClient.query.mockRejectedValue(new Error('Database error'));

      await expect(scanModel.create(1, 'http://example.com'))
        .rejects.toThrow('Database error');
      
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('findByUserId', () => {
    it('should return scans for a user', async () => {
      const mockScans = [
        { id: 1, target: 'http://example.com', status: 'Completed' },
        { id: 2, target: 'http://test.com', status: 'Running' }
      ];

      mockClient.query.mockResolvedValue({ rows: mockScans });

      const result = await scanModel.findByUserId(1);

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [1]
      );
      expect(result).toEqual(mockScans);
    });

    it('should return empty array when no scans found', async () => {
      mockClient.query.mockResolvedValue({ rows: [] });

      const result = await scanModel.findByUserId(999);

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a scan by id', async () => {
      const mockScan = { id: 1, target: 'http://example.com' };
      mockClient.query.mockResolvedValue({ rows: [mockScan] });

      const result = await scanModel.findById(1, 1);

      expect(result).toEqual(mockScan);
    });

    it('should return undefined when scan not found', async () => {
      mockClient.query.mockResolvedValue({ rows: [] });

      const result = await scanModel.findById(999, 1);

      expect(result).toBeUndefined();
    });
  });

  describe('updateStatus', () => {
    it('should update scan status', async () => {
      const mockScan = { id: 1, status: 'Completed', issues: 5 };
      mockClient.query.mockResolvedValue({ rows: [mockScan] });

      const result = await scanModel.updateStatus(1, 'Completed', 5);

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE scans'),
        expect.arrayContaining(['Completed', 5, 1])
      );
      expect(result).toEqual(mockScan);
    });
  });

  describe('delete', () => {
    it('should delete a scan', async () => {
      mockClient.query.mockResolvedValue({ rowCount: 1 });

      const result = await scanModel.delete(1, 1);

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM scans'),
        [1, 1]
      );
      expect(result).toBe(true);
    });

    it('should return false when scan not found', async () => {
      mockClient.query.mockResolvedValue({ rowCount: 0 });

      const result = await scanModel.delete(999, 1);

      expect(result).toBe(false);
    });
  });
});
