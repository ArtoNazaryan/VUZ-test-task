-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateTable
CREATE TABLE "universes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "universes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characters" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "quote" TEXT,
    "image" TEXT NOT NULL,
    "thumbnail" TEXT,
    "universe_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_tags" (
    "character_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,
    "slot" SMALLINT NOT NULL,

    CONSTRAINT "character_tags_pkey" PRIMARY KEY ("character_id","tag_id")
);

-- CreateTable
CREATE TABLE "abilities" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "abilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_abilities" (
    "character_id" INTEGER NOT NULL,
    "ability_id" INTEGER NOT NULL,
    "score" SMALLINT NOT NULL,

    CONSTRAINT "character_abilities_pkey" PRIMARY KEY ("character_id","ability_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "universes_name_key" ON "universes"("name");

-- CreateIndex
CREATE INDEX "characters_name_id_idx" ON "characters"("name", "id");

-- CreateIndex
CREATE INDEX "characters_name_trgm_idx" ON "characters" USING GIN ("name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "characters_universe_id_idx" ON "characters"("universe_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE INDEX "character_tags_tag_id_idx" ON "character_tags"("tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "abilities_name_key" ON "abilities"("name");

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_universe_id_fkey" FOREIGN KEY ("universe_id") REFERENCES "universes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_tags" ADD CONSTRAINT "character_tags_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_tags" ADD CONSTRAINT "character_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_abilities" ADD CONSTRAINT "character_abilities_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_abilities" ADD CONSTRAINT "character_abilities_ability_id_fkey" FOREIGN KEY ("ability_id") REFERENCES "abilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddCheckConstraint
ALTER TABLE "character_abilities" ADD CONSTRAINT "character_abilities_score_check" CHECK ("score" BETWEEN 1 AND 10);
