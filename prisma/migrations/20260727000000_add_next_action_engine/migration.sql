-- CreateTable
CREATE TABLE "NextAction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "memberId" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'FOLLOW_UP',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "dueDate" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NextAction_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "NextAction_memberId_dueDate_idx" ON "NextAction"("memberId", "dueDate");

-- CreateIndex
CREATE INDEX "NextAction_status_dueDate_priority_idx" ON "NextAction"("status", "dueDate", "priority");

CREATE TRIGGER "NextAction_timeline_created"
AFTER INSERT ON "NextAction"
BEGIN
    INSERT INTO "TimelineEvent" ("memberId", "type", "title", "description", "metadata", "createdAt")
    VALUES (
        NEW."memberId",
        'NEXT_ACTION_CREATED',
        '다음 액션 등록',
        NEW."title" || ' 작업이 등록되었습니다. (기한: ' || NEW."dueDate" || ')',
        '{"nextActionId":' || NEW."id" || ',"type":"' || NEW."type" || '","priority":"' || NEW."priority" || '","dueDate":"' || NEW."dueDate" || '"}',
        NEW."createdAt"
    );
END;

CREATE TRIGGER "NextAction_timeline_completed"
AFTER UPDATE OF "status" ON "NextAction"
WHEN NEW."status" = 'COMPLETED' AND IFNULL(OLD."status", '') <> 'COMPLETED'
BEGIN
    INSERT INTO "TimelineEvent" ("memberId", "type", "title", "description", "metadata", "createdAt")
    VALUES (
        NEW."memberId",
        'NEXT_ACTION_COMPLETED',
        '다음 액션 완료',
        NEW."title" || ' 작업이 완료되었습니다.',
        '{"nextActionId":' || NEW."id" || ',"type":"' || NEW."type" || '","priority":"' || NEW."priority" || '","dueDate":"' || NEW."dueDate" || '"}',
        CURRENT_TIMESTAMP
    );
END;
