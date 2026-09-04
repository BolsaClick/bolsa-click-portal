-- Rename maxDiscountPct -> maxDiscountPctRaw. Puramente aditivo do ponto de
-- vista de dados (RENAME COLUMN preserva os valores, não é DROP+CREATE):
-- deixa explícito que o campo guarda a medição BRUTA, sem teto editorial —
-- o teto (DISCOUNT_CEILING_PCT) passa a ser aplicado só na leitura
-- (app/lib/utils/institution-discount.ts), nunca mais na gravação. Este
-- model ainda não estava em uso em produção fora deste fluxo (feature em
-- validação), então não há consumidor externo do nome antigo da coluna.
ALTER TABLE "InstitutionMaxDiscountCache" RENAME COLUMN "maxDiscountPct" TO "maxDiscountPctRaw";
