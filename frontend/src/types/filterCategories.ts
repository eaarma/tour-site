import { FilterCategory } from "./types";

export const FILTER_CATEGORIES: FilterCategory[] = [
  {
    key: "category",
    label: "Category",
    options: [
      { label: "Walking", value: "WALKING" },
      { label: "Cycling", value: "CYCLING" },
      { label: "Hiking", value: "HIKING" },
      { label: "Bus", value: "BUS" },
      { label: "Boat", value: "BOAT" },
      { label: "Car", value: "CAR" },

      { label: "Sightseeing", value: "SIGHTSEEING" },
      { label: "City Tour", value: "CITY_TOUR" },
      { label: "Island", value: "ISLAND" },
      { label: "Workshop", value: "WORKSHOP" },
      { label: "Boat Cruise", value: "BOAT_CRUISE" },
      { label: "Adventure", value: "ADVENTURE" },

      { label: "History", value: "HISTORY" },
      { label: "Culture", value: "CULTURE" },
      { label: "Art", value: "ART" },
      { label: "Religion", value: "RELIGION" },
      { label: "Nature", value: "NATURE" },
      { label: "Wildlife", value: "WILDLIFE" },

      { label: "Food", value: "FOOD" },
      { label: "Wine", value: "WINE" },
      { label: "Photography", value: "PHOTOGRAPHY" },
      { label: "Music", value: "MUSIC" },
      { label: "Nightlife", value: "NIGHTLIFE" },
      { label: "Festival", value: "FESTIVAL" },

      { label: "Slow Paced", value: "SLOW_PACED" },
      { label: "Intense", value: "INTENSE" },
      { label: "Budget", value: "BUDGET" },
    ],
  },
  {
    key: "language",
    label: "Language",
    options: [
      "English",
      "Estonian",
      "Russian",
      "German",
      "French",
      "Spanish",
      "Italian",
      "Finnish",
      "Swedish",
      "Chinese",
      "Japanese",
    ],
  },
  {
    key: "type",
    label: "Type",
    options: ["PUBLIC", "PRIVATE"],
  },
];
