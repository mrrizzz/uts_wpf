/*
  Warnings:

  - Added the required column `updated_at` to the `Karyawan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Karyawan" 
  ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create a trigger function to update `updated_at`
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updated_at" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger that calls the function on update
CREATE TRIGGER trigger_update_updated_at
BEFORE UPDATE ON "Karyawan"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
