export type ConversationStage =
  | "greeting"
  | "needs_assessment"
  | "product_presentation"
  | "upsell"
  | "cart_review"
  | "info_collection"
  | "delivery_calculation"
  | "order_confirmation"
  | "complete";

interface StageDefinition {
  description: string;
  validTransitions: ConversationStage[];
  instructions: string;
}

export const STAGES: Record<ConversationStage, StageDefinition> = {
  greeting: {
    description: "Initial greeting and welcome",
    validTransitions: ["needs_assessment"],
    instructions:
      "მიესალმე მომხმარებელს თბილად. წარადგინე საკუთარი თავი და ბიზნესი. იკითხე რით შეგიძლია დაეხმარო.",
  },
  needs_assessment: {
    description: "Understanding what the customer needs",
    validTransitions: ["product_presentation", "cart_review"],
    instructions:
      "დასვი კითხვები რათა გაიგო რა სჭირდება მომხმარებელს. შეეცადე გაიგო ბიუჯეტი, პრეფერენციები და გამოყენების მიზანი.",
  },
  product_presentation: {
    description: "Showing relevant products",
    validTransitions: ["upsell", "cart_review", "needs_assessment"],
    instructions:
      "წარადგინე შესაფერისი პროდუქტები ფასით და აღწერილობით. ხაზი გაუსვი უპირატესობებს. შესთავაზე კალათაში დამატება.",
  },
  upsell: {
    description: "Suggesting additional/complementary products",
    validTransitions: ["cart_review", "product_presentation"],
    instructions:
      "შესთავაზე დამატებითი ან თანმხლები პროდუქტები. ნუ იქნები ზედმეტად აგრესიული.",
  },
  cart_review: {
    description: "Reviewing cart contents with customer",
    validTransitions: [
      "info_collection",
      "product_presentation",
      "needs_assessment",
    ],
    instructions:
      "აჩვენე კალათის შიგთავსი ფასებით. იკითხე დაადასტურონ ან შეცვალონ რაიმე.",
  },
  info_collection: {
    description: "Collecting delivery and contact information",
    validTransitions: ["delivery_calculation", "cart_review"],
    instructions:
      "შეაგროვე მიტანისთვის საჭირო ინფორმაცია: სახელი, ტელეფონი, მისამართი, ქალაქი. მისამართის კითხვისას ახსენე ხელმისაწვდომი მიტანის ზონები რომ მომხმარებელმა იცოდეს სად ვიტანთ. გამოიყენე update_customer_info ყოველი ახალი ინფორმაციის შესანახად.",
  },
  delivery_calculation: {
    description: "Calculating delivery fee based on zone",
    validTransitions: ["order_confirmation", "info_collection"],
    instructions:
      "მომხმარებლის ქალაქი/მისამართი შეადარე მიტანის ზონების სიას. თუ ემთხვევა — გამოიყენე set_delivery_zone შესაბამისი ზონის ID-ით და აჩვენე მიტანის საფასური. თუ ვერ ადგენ ზონას — ჩამოუთვალე ხელმისაწვდომი ზონები და სთხოვე აირჩიოს ან დააზუსტოს მისამართი. საბოლოო ჯამი აჩვენე მიტანის ჩათვლით.",
  },
  order_confirmation: {
    description: "Final order confirmation",
    validTransitions: ["complete"],
    instructions:
      'აჩვენე შეკვეთის სრული დეტალები: პროდუქტები, ფასები, მიტანა, ჯამი. იკითხე საბოლოო დადასტურება და გადახდის ინსტრუქციები გააზიარე.\n\nმნიშვნელოვანი: როცა მომხმარებელი ადასტურებს შეკვეთას (მაგ: "კი", "დიახ", "ვადასტურებ", "yes", "ok", "კარგი", "შევკვეთავ", "გავაფორმებ") — დაუყოვნებლივ გამოიყენე create_order მოქმედება და update_stage "complete"-ზე. არ დასვა დამატებითი კითხვები დადასტურების შემდეგ. შეკვეთის შექმნა სავალდებულოა დადასტურების მიღებისთანავე.',
  },
  complete: {
    description: "Order placed, conversation complete",
    validTransitions: [],
    instructions:
      "მადლობა გადაუხადე შეკვეთისთვის. შეატყობინე შეკვეთის ნომერი და მიტანის სავარაუდო ვადა. ნუღარ შესთავაზებ დამატებით პროდუქტებს და ნუ დასვამ კითხვებს — საუბარი დასრულებულია.",
  },
};

export function isValidTransition(
  from: ConversationStage,
  to: ConversationStage,
): boolean {
  const stage = STAGES[from];
  if (!stage) return false;
  return stage.validTransitions.includes(to);
}

export function getStageDefinition(stage: string): StageDefinition | null {
  return STAGES[stage as ConversationStage] ?? null;
}
