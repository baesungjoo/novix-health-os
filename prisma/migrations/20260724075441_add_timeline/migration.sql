-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "memberId" INTEGER NOT NULL,
    "reservationId" INTEGER,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "metadata" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TimelineEvent_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TimelineEvent_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TimelineEvent_memberId_createdAt_idx" ON "TimelineEvent"("memberId", "createdAt");

-- CreateIndex
CREATE INDEX "TimelineEvent_reservationId_idx" ON "TimelineEvent"("reservationId");

-- Backfill existing members as timeline events
INSERT INTO "TimelineEvent" ("memberId", "type", "title", "description", "metadata", "createdAt")
SELECT
    "id",
    'MEMBER_CREATED',
    '회원 등록',
    "name" || ' 회원이 등록되었습니다.',
    '{"memberId":' || "id" || '}',
    "createdAt"
FROM "Member";

-- Backfill existing reservations as timeline events
INSERT INTO "TimelineEvent" ("memberId", "reservationId", "type", "title", "description", "metadata", "createdAt")
SELECT
    "memberId",
    "id",
    'RESERVATION_CREATED',
    '예약 등록',
    "date" || ' ' || "time" || ' 예약이 등록되었습니다.',
    '{"reservationId":' || "id" || ',"date":"' || "date" || '","time":"' || "time" || '"}',
    "createdAt"
FROM "Reservation";

-- Backfill completed reservations as timeline events
INSERT INTO "TimelineEvent" ("memberId", "reservationId", "type", "title", "description", "metadata", "createdAt")
SELECT
    "memberId",
    "id",
    'RESERVATION_COMPLETED',
    '예약 완료',
    "date" || ' ' || "time" || ' 예약이 완료되었습니다.',
    '{"reservationId":' || "id" || ',"date":"' || "date" || '","time":"' || "time" || '","status":"' || "status" || '"}',
    "updatedAt"
FROM "Reservation"
WHERE "status" = 'COMPLETED';

CREATE TRIGGER "Member_timeline_created"
AFTER INSERT ON "Member"
BEGIN
    INSERT INTO "TimelineEvent" ("memberId", "type", "title", "description", "metadata", "createdAt")
    VALUES (
        NEW."id",
        'MEMBER_CREATED',
        '회원 등록',
        NEW."name" || ' 회원이 등록되었습니다.',
        '{"memberId":' || NEW."id" || '}',
        NEW."createdAt"
    );
END;

CREATE TRIGGER "Reservation_timeline_created"
AFTER INSERT ON "Reservation"
BEGIN
    INSERT INTO "TimelineEvent" ("memberId", "reservationId", "type", "title", "description", "metadata", "createdAt")
    VALUES (
        NEW."memberId",
        NEW."id",
        'RESERVATION_CREATED',
        '예약 등록',
        NEW."date" || ' ' || NEW."time" || ' 예약이 등록되었습니다.',
        '{"reservationId":' || NEW."id" || ',"date":"' || NEW."date" || '","time":"' || NEW."time" || '"}',
        NEW."createdAt"
    );
END;

CREATE TRIGGER "Reservation_timeline_completed"
AFTER UPDATE OF "status" ON "Reservation"
WHEN NEW."status" = 'COMPLETED' AND IFNULL(OLD."status", '') <> 'COMPLETED'
BEGIN
    INSERT INTO "TimelineEvent" ("memberId", "reservationId", "type", "title", "description", "metadata", "createdAt")
    VALUES (
        NEW."memberId",
        NEW."id",
        'RESERVATION_COMPLETED',
        '예약 완료',
        NEW."date" || ' ' || NEW."time" || ' 예약이 완료되었습니다.',
        '{"reservationId":' || NEW."id" || ',"date":"' || NEW."date" || '","time":"' || NEW."time" || '","status":"' || NEW."status" || '"}',
        CURRENT_TIMESTAMP
    );
END;
