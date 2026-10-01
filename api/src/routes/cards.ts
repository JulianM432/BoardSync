import { Router } from "express";
import { CardController } from "../controllers/card.js";
import { validateSchema } from "../middlewares/validate.js";
import { createCardSchema, updateCardSchema } from "../schemas/card.js";

export const cardsRouter = Router({ mergeParams: true });
cardsRouter.get("/", CardController.getCards);
cardsRouter.post(
  "/",
  validateSchema(createCardSchema),
  CardController.createCard,
);
cardsRouter.get("/:id", CardController.getCard);
cardsRouter.patch(
  "/:id",
  validateSchema(updateCardSchema),
  CardController.updateCard,
);
cardsRouter.delete("/:id", CardController.deleteCard);
cardsRouter.patch("/:id/move", CardController.moveCard);