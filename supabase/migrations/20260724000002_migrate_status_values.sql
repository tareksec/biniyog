-- Migrate existing opportunity statuses to the new 5 predefined options

UPDATE opportunities
SET status = 'বিনিয়োগ নেওয়া চলমান-সুযোগ আছে'
WHERE status IN ('চলমান', 'Active', 'active', 'সুযোগ আছে');

UPDATE opportunities
SET status = 'বিনিয়োগ নেওয়া শেষের দিকে'
WHERE status IN ('শেষের দিকে', 'Almost Full', 'almost full');

UPDATE opportunities
SET status = 'বিনিয়োগ নেওয়া শেষ-সামনে আবার শুরু হবে ইনশা আল্লাহ'
WHERE status IN ('Fully Funded', 'fully funded', 'সম্পূর্ণ বিনিয়োগ হয়েছে');

-- Any other statuses remain as they were or can be manually cleaned up
