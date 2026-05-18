-- Add coreSubjects to FeaturedCourse — grade curricular abreviada (8-12 disciplinas)
-- pra render na page de curso (H8 do SEO audit, gap vs Educa Mais Brasil)
ALTER TABLE "FeaturedCourse" ADD COLUMN "coreSubjects" TEXT[] DEFAULT ARRAY[]::TEXT[];
