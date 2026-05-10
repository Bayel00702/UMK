-- CreateEnum
CREATE TYPE "TestType" AS ENUM ('TEST', 'SITUATION');

-- Добавляем новую колонку
ALTER TABLE "TestResult"
    ADD COLUMN "testType_new" "TestType";

-- Переносим данные из старой колонки
UPDATE "TestResult"
SET "testType_new" =
        CASE
            WHEN "testType" = 'TEST' THEN 'TEST'::"TestType"
            WHEN "testType" = 'SITUATION' THEN 'SITUATION'::"TestType"
            ELSE 'TEST'::"TestType"
            END;

-- Удаляем старую колонку
ALTER TABLE "TestResult"
DROP COLUMN "testType";

-- Переименовываем новую колонку
ALTER TABLE "TestResult"
    RENAME COLUMN "testType_new" TO "testType";

-- Делаем NOT NULL если нужно
ALTER TABLE "TestResult"
    ALTER COLUMN "testType" SET NOT NULL;